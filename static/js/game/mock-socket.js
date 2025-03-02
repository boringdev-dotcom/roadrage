// Mock Socket.IO implementation for offline mode
(function() {
    // Check if Socket.IO is already defined
    if (typeof io !== 'undefined') {
        console.log('Socket.IO is already defined, not loading mock implementation');
        return;
    }
    
    console.log('Loading mock Socket.IO implementation for offline mode');
    
    // Mock Socket.IO client
    window.io = function() {
        console.log('Creating mock Socket.IO client');
        
        // Create mock socket
        const socket = {
            // Event listeners
            _eventListeners: {},
            
            // Connection state
            connected: false,
            
            // Connect to mock server
            connect: function() {
                console.log('Mock socket connecting...');
                this.connected = true;
                
                // Emit connect event
                setTimeout(() => {
                    this._emit('connect');
                    
                    // Emit player_connected event
                    setTimeout(() => {
                        this._emit('player_connected', {
                            player_id: 'local-player-' + Math.floor(Math.random() * 10000)
                        });
                    }, 100);
                }, 500);
                
                return this;
            },
            
            // Disconnect from mock server
            disconnect: function() {
                console.log('Mock socket disconnecting...');
                this.connected = false;
                this._emit('disconnect');
                return this;
            },
            
            // Add event listener
            on: function(event, callback) {
                console.log('Mock socket adding event listener for:', event);
                if (!this._eventListeners[event]) {
                    this._eventListeners[event] = [];
                }
                this._eventListeners[event].push(callback);
                return this;
            },
            
            // Remove event listener
            off: function(event, callback) {
                console.log('Mock socket removing event listener for:', event);
                if (this._eventListeners[event]) {
                    if (callback) {
                        this._eventListeners[event] = this._eventListeners[event].filter(cb => cb !== callback);
                    } else {
                        delete this._eventListeners[event];
                    }
                }
                return this;
            },
            
            // Emit event to mock server
            emit: function(event, data) {
                console.log('Mock socket emitting event to server:', event, data);
                
                // Handle specific events
                switch (event) {
                    case 'join_room':
                        // Simulate room joined response
                        setTimeout(() => {
                            this._emit('room_joined', {
                                room_id: data.room_id || 'default-room',
                                players: {
                                    'local-player': {
                                        id: 'local-player',
                                        name: localStorage.getItem('playerName') || 'Player',
                                        bike: localStorage.getItem('bikeType') || 'default',
                                        ready: true,
                                        isCurrentPlayer: true
                                    }
                                },
                                game_state: {
                                    status: 'waiting',
                                    track: 'track1',
                                    countdown: 3
                                }
                            });
                        }, 300);
                        break;
                        
                    case 'player_ready':
                        // Simulate game countdown after player is ready
                        setTimeout(() => {
                            this._emit('game_countdown_started', {
                                countdown: 3
                            });
                            
                            // Start game after countdown
                            setTimeout(() => {
                                this._emit('game_started');
                            }, 3000);
                        }, 500);
                        break;
                        
                    case 'player_update':
                        // No response needed
                        break;
                        
                    case 'combat_action':
                        // No response needed
                        break;
                        
                    case 'chat_message':
                        // Echo chat message back
                        setTimeout(() => {
                            this._emit('chat_message_received', {
                                player_id: 'local-player',
                                player_name: localStorage.getItem('playerName') || 'Player',
                                message: data.message
                            });
                        }, 100);
                        break;
                }
                
                return this;
            },
            
            // Internal method to emit events to client
            _emit: function(event, data) {
                console.log('Mock socket emitting event to client:', event, data);
                if (this._eventListeners[event]) {
                    this._eventListeners[event].forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            console.error('Error in event listener for', event, ':', error);
                        }
                    });
                }
            }
        };
        
        // Auto-connect
        return socket.connect();
    };
    
    console.log('Mock Socket.IO implementation loaded');
})(); 