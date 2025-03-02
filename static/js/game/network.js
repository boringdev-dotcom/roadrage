// Game Network Class
class GameNetwork {
    constructor(roomId = 'public') {
        // Network state
        this.socket = null;
        this.roomId = roomId;
        this.playerId = null;
        this.players = {};
        this.gameState = {
            status: 'waiting',  // waiting, countdown, racing, finished
            track: 'track1',
            countdown: 3
        };
        this.isReady = false;
        
        // Callbacks
        this.onReadyCallback = null;
        this.onRoomJoinedCallback = null;
        this.onPlayerJoinedCallback = null;
        this.onPlayerLeftCallback = null;
        this.onPlayerUpdatedCallback = null;
        this.onGameStartedCallback = null;
        this.onGameOverCallback = null;
        this.onCombatActionCallback = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.connect = this.connect.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.sendPlayerUpdate = this.sendPlayerUpdate.bind(this);
        this.sendPlayerReady = this.sendPlayerReady.bind(this);
        this.sendCombatAction = this.sendCombatAction.bind(this);
        this.sendChatMessage = this.sendChatMessage.bind(this);
        this.getPlayerId = this.getPlayerId.bind(this);
        this.getPlayers = this.getPlayers.bind(this);
        this.getGameState = this.getGameState.bind(this);
        this.onReady = this.onReady.bind(this);
        this.onRoomJoined = this.onRoomJoined.bind(this);
        this.onPlayerJoined = this.onPlayerJoined.bind(this);
        this.onPlayerLeft = this.onPlayerLeft.bind(this);
        this.onPlayerUpdated = this.onPlayerUpdated.bind(this);
        this.onGameStarted = this.onGameStarted.bind(this);
        this.onGameOver = this.onGameOver.bind(this);
        this.onCombatAction = this.onCombatAction.bind(this);
    }
    
    init() {
        // Connect to server
        this.connect();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    connect() {
        // Connect to Socket.IO server
        const serverUrl = window.getSocketURL ? window.getSocketURL() : null;
        
        if (serverUrl) {
            console.log(`Connecting to server at: ${serverUrl}`);
            this.socket = io(serverUrl);
        } else {
            console.log('Connecting to server at current domain');
            this.socket = io();
        }
        
        // Setup connection events
        this.socket.on('connect', () => {
            console.log('Connected to server');
            
            // Join room
            this.joinRoom();
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });
    }
    
    joinRoom() {
        // Join room
        this.socket.emit('join_room', { room_id: this.roomId });
    }
    
    setupEventListeners() {
        // Player connected
        this.socket.on('player_connected', (data) => {
            console.log('Player connected:', data);
            this.playerId = data.player_id;
            
            // Mark as ready
            if (this.onReadyCallback) {
                this.onReadyCallback();
            }
            
            this.isReady = true;
        });
        
        // Room joined
        this.socket.on('room_joined', (data) => {
            console.log('Room joined:', data);
            this.players = data.players;
            this.gameState = data.game_state;
            
            // Mark current player
            if (this.players[this.playerId]) {
                this.players[this.playerId].isCurrentPlayer = true;
            }
            
            // Debug log all players
            console.log('All players in room:', Object.keys(this.players).length);
            Object.values(this.players).forEach(player => {
                console.log(`- Player ${player.id}: ${player.name} (ready: ${player.ready})`);
            });
            
            // Notify room joined callback
            if (this.onRoomJoinedCallback) {
                this.onRoomJoinedCallback({
                    room_id: this.roomId,
                    players: this.players,
                    game_state: this.gameState
                });
            }
            
            // Notify player joined for each player
            Object.values(this.players).forEach(player => {
                if (player.id !== this.playerId && this.onPlayerJoinedCallback) {
                    this.onPlayerJoinedCallback(player);
                }
            });
        });
        
        // Player left
        this.socket.on('player_left', (data) => {
            console.log('Player left:', data);
            
            if (this.players[data.player_id]) {
                // Notify player left
                if (this.onPlayerLeftCallback) {
                    this.onPlayerLeftCallback(data.player_id);
                }
                
                // Remove player from list
                delete this.players[data.player_id];
            }
        });
        
        // Player updated
        this.socket.on('player_updated', (data) => {
            // Update player data
            if (this.players[data.player_id]) {
                if (data.position) {
                    this.players[data.player_id].position = data.position;
                }
                
                if (data.rotation) {
                    this.players[data.player_id].rotation = data.rotation;
                }
                
                if (data.speed !== undefined) {
                    this.players[data.player_id].speed = data.speed;
                }
            }
            
            // Notify player updated
            if (this.onPlayerUpdatedCallback) {
                this.onPlayerUpdatedCallback(data);
            }
        });
        
        // Player ready changed
        this.socket.on('player_ready_changed', (data) => {
            console.log('Player ready changed:', data);
            
            if (this.players[data.player_id]) {
                this.players[data.player_id].ready = data.ready;
                
                // Debug log all players' ready status
                console.log('All players ready status:');
                Object.values(this.players).forEach(player => {
                    console.log(`- Player ${player.id}: ready = ${player.ready}`);
                });
                
                // Check if all players are ready
                const allReady = Object.values(this.players).every(player => player.ready);
                console.log('All players ready:', allReady);
            }
        });
        
        // Game countdown started
        this.socket.on('game_countdown_started', (data) => {
            console.log('Game countdown started:', data);
            this.gameState.status = 'countdown';
            this.gameState.countdown = data.countdown;
            
            // Show countdown in UI
            document.getElementById('countdown-overlay').style.display = 'flex';
            document.getElementById('countdown-number').textContent = data.countdown;
            
            // Countdown animation
            let count = data.countdown;
            const countdownInterval = setInterval(() => {
                count--;
                if (count > 0) {
                    document.getElementById('countdown-number').textContent = count;
                } else {
                    clearInterval(countdownInterval);
                }
            }, 1000);
        });
        
        // Game started
        this.socket.on('game_started', () => {
            console.log('Game started event received');
            this.gameState.status = 'racing';
            
            // Notify game started
            if (this.onGameStartedCallback) {
                this.onGameStartedCallback();
            }
        });
        
        // Game over
        this.socket.on('game_over', (data) => {
            console.log('Game over:', data);
            this.gameState.status = 'finished';
            
            // Notify game over
            if (this.onGameOverCallback) {
                this.onGameOverCallback(data);
            }
        });
        
        // Combat action
        this.socket.on('combat_action_received', (data) => {
            console.log('Combat action received:', data);
            
            // Notify combat action
            if (this.onCombatActionCallback) {
                this.onCombatActionCallback(data);
            }
        });
        
        // Chat message
        document.addEventListener('chat-message', (event) => {
            this.sendChatMessage(event.detail.message);
        });
    }
    
    sendPlayerUpdate(data) {
        // Send player update to server
        this.socket.emit('player_update', data);
    }
    
    sendPlayerReady(ready = true) {
        // Send player ready status to server
        this.socket.emit('player_ready', { ready });
    }
    
    sendCombatAction(targetId, actionType) {
        // Send combat action to server
        this.socket.emit('combat_action', {
            target_id: targetId,
            action_type: actionType
        });
    }
    
    sendChatMessage(message) {
        // Send chat message to server
        this.socket.emit('chat_message', { message });
    }
    
    getPlayerId() {
        return this.playerId;
    }
    
    getPlayers() {
        return this.players;
    }
    
    getGameState() {
        return this.gameState;
    }
    
    onReady(callback) {
        this.onReadyCallback = callback;
        
        // If already ready, call callback immediately
        if (this.isReady) {
            callback();
        }
    }
    
    onRoomJoined(callback) {
        this.onRoomJoinedCallback = callback;
    }
    
    onPlayerJoined(callback) {
        this.onPlayerJoinedCallback = callback;
    }
    
    onPlayerLeft(callback) {
        this.onPlayerLeftCallback = callback;
    }
    
    onPlayerUpdated(callback) {
        this.onPlayerUpdatedCallback = callback;
    }
    
    onGameStarted(callback) {
        this.onGameStartedCallback = callback;
    }
    
    onGameOver(callback) {
        this.onGameOverCallback = callback;
    }
    
    onCombatAction(callback) {
        this.onCombatActionCallback = callback;
    }
} 