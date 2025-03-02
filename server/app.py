import os
import json
import uuid
from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__, static_folder='../static', template_folder='../templates')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'roadrage-secret-key')
socketio = SocketIO(app, cors_allowed_origins="*")

# Game state
players = {}
rooms = {
    'public': {
        'name': 'Public Room',
        'players': {},
        'game_state': {
            'status': 'waiting',  # waiting, countdown, racing, finished
            'track': 'track1',
            'countdown': 3,
        }
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    return render_template('game.html')

@socketio.on('connect')
def handle_connect():
    player_id = str(uuid.uuid4())
    session['player_id'] = player_id
    players[player_id] = {
        'id': player_id,
        'name': f'Player_{player_id[:5]}',
        'room': None,
        'position': {'x': 0, 'y': 0, 'z': 0},
        'rotation': {'x': 0, 'y': 0, 'z': 0},
        'speed': 0,
        'bike': 'default',
        'ready': False
    }
    emit('player_connected', {'player_id': player_id, 'players': players})

@socketio.on('disconnect')
def handle_disconnect():
    player_id = session.get('player_id')
    if player_id:
        room_id = players[player_id].get('room')
        if room_id and room_id in rooms:
            if player_id in rooms[room_id]['players']:
                del rooms[room_id]['players'][player_id]
                leave_room(room_id)
                emit('player_left', {'player_id': player_id}, to=room_id)
        
        if player_id in players:
            del players[player_id]

@socketio.on('join_room')
def handle_join_room(data):
    player_id = session.get('player_id')
    room_id = data.get('room_id', 'public')
    
    if player_id and player_id in players:
        # Leave current room if in one
        current_room = players[player_id].get('room')
        if current_room and current_room in rooms:
            if player_id in rooms[current_room]['players']:
                del rooms[current_room]['players'][player_id]
                leave_room(current_room)
                emit('player_left', {'player_id': player_id}, to=current_room)
        
        # Create room if it doesn't exist (for private rooms)
        if room_id not in rooms:
            rooms[room_id] = {
                'name': f'Room {room_id}',
                'players': {},
                'game_state': {
                    'status': 'waiting',
                    'track': 'track1',
                    'countdown': 3,
                }
            }
        
        # Join new room
        join_room(room_id)
        players[player_id]['room'] = room_id
        rooms[room_id]['players'][player_id] = players[player_id]
        
        # Notify everyone in the room
        emit('room_joined', {
            'player_id': player_id,
            'room_id': room_id,
            'players': rooms[room_id]['players'],
            'game_state': rooms[room_id]['game_state']
        }, to=room_id)

@socketio.on('player_update')
def handle_player_update(data):
    player_id = session.get('player_id')
    room_id = players[player_id].get('room')
    
    if player_id and room_id and player_id in players and room_id in rooms:
        # Update player data
        if 'position' in data:
            players[player_id]['position'] = data['position']
            rooms[room_id]['players'][player_id]['position'] = data['position']
        
        if 'rotation' in data:
            players[player_id]['rotation'] = data['rotation']
            rooms[room_id]['players'][player_id]['rotation'] = data['rotation']
        
        if 'speed' in data:
            players[player_id]['speed'] = data['speed']
            rooms[room_id]['players'][player_id]['speed'] = data['speed']
        
        # Broadcast to all players in the room except sender
        emit('player_updated', {
            'player_id': player_id,
            'position': players[player_id]['position'],
            'rotation': players[player_id]['rotation'],
            'speed': players[player_id]['speed']
        }, to=room_id, include_self=False)

@socketio.on('player_ready')
def handle_player_ready(data):
    player_id = session.get('player_id')
    room_id = players[player_id].get('room')
    
    if player_id and room_id and player_id in players and room_id in rooms:
        ready_status = data.get('ready', False)
        players[player_id]['ready'] = ready_status
        rooms[room_id]['players'][player_id]['ready'] = ready_status
        
        emit('player_ready_changed', {
            'player_id': player_id,
            'ready': ready_status
        }, to=room_id)
        
        # We no longer automatically start the game when all players are ready
        # This will now be controlled by the host

@socketio.on('start_game')
def handle_start_game():
    player_id = session.get('player_id')
    room_id = players[player_id].get('room')
    
    if player_id and room_id and player_id in players and room_id in rooms:
        # Check if this is the first player who joined (host)
        room_players = list(rooms[room_id]['players'].keys())
        if room_players and room_players[0] == player_id:
            # Start countdown
            rooms[room_id]['game_state']['status'] = 'countdown'
            emit('game_countdown_started', {
                'countdown': rooms[room_id]['game_state']['countdown']
            }, to=room_id)
            
            # This would be handled with a proper timer in production
            # For simplicity, we're just emitting the start event after a delay
            socketio.sleep(3)
            rooms[room_id]['game_state']['status'] = 'racing'
            emit('game_started', {}, to=room_id)
        else:
            # Only the host can start the game
            emit('error', {'message': 'Only the host can start the game'})

@socketio.on('create_private_room')
def handle_create_private_room():
    room_id = str(uuid.uuid4())[:8]
    rooms[room_id] = {
        'name': f'Private Room {room_id}',
        'players': {},
        'game_state': {
            'status': 'waiting',
            'track': 'track1',
            'countdown': 3,
        }
    }
    emit('private_room_created', {'room_id': room_id})

@socketio.on('combat_action')
def handle_combat_action(data):
    player_id = session.get('player_id')
    room_id = players[player_id].get('room')
    target_id = data.get('target_id')
    action_type = data.get('action_type')  # 'punch', 'kick', etc.
    
    if player_id and room_id and target_id and action_type:
        if player_id in players and room_id in rooms and target_id in rooms[room_id]['players']:
            emit('combat_action_received', {
                'player_id': player_id,
                'target_id': target_id,
                'action_type': action_type
            }, to=room_id)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    socketio.run(app, host='0.0.0.0', port=port) 