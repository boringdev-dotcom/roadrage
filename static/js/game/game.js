// RoadRage Game Class
class RoadRageGame {
    constructor() {
        // Game properties
        this.isInitialized = false;
        this.isStarted = false;
        this.isPaused = false;
        this.isOver = false;
        this.frameCount = 0;
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Game objects
        this.track = null;
        this.playerBike = null;
        
        // Game systems
        this.controls = null;
        this.ui = null;
        this.network = null;
        
        // Game state
        this.lastTime = 0;
        this.deltaTime = 0;
        this.players = {};
        this.playerId = null;
        this.audioManager = null;
        this.socket = null;
        
        // Game settings
        this.gameTime = 0;
        this.lastLapTime = 0;
        this.lapTime = 0;
        this.lapsCompleted = 0;
        this.totalLaps = 3;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.setupThreeJS = this.setupThreeJS.bind(this);
        this.createScene = this.createScene.bind(this);
        this.startGame = this.startGame.bind(this);
        this.update = this.update.bind(this);
        this.updateCameraPosition = this.updateCameraPosition.bind(this);
        this.render = this.render.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.togglePause = this.togglePause.bind(this);
        this.addOtherPlayer = this.addOtherPlayer.bind(this);
        this.removeOtherPlayer = this.removeOtherPlayer.bind(this);
        this.updateOtherPlayer = this.updateOtherPlayer.bind(this);
        this.checkPlayerCollisions = this.checkPlayerCollisions.bind(this);
        this.handleCombatAction = this.handleCombatAction.bind(this);
        this.endGame = this.endGame.bind(this);
        this.enforceTrackBoundaries = this.enforceTrackBoundaries.bind(this);
        this.finishRace = this.finishRace.bind(this);
        this.gameOver = this.gameOver.bind(this);
    }
    
    init() {
        try {
            console.log('Initializing game...');
            
            // Initialize UI first
            this.ui = new GameUI();
            this.ui.init();
            this.ui.showLoadingScreen();
            
            // Initialize audio manager
            try {
                this.audioManager = new AudioManager();
                this.audioManager.init();
            } catch (error) {
                console.error('Error initializing AudioManager:', error);
                this.audioManager = null;
            }
            
            // Initialize network
            try {
                this.network = new GameNetwork();
                this.network.init();
                console.log('Network initialized successfully');
            } catch (networkError) {
                console.error('Error initializing network:', networkError);
                this.ui.showNotification('Network initialization failed. Game will run in offline mode.');
            }
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize Three.js
            this.setupThreeJS();
            
            // Initialize controls
            this.controls = new GameControls();
            
            // Load assets and create scene
            this.loadAssets()
                .then(() => {
                    console.log('Assets loaded, creating scene');
                    this.ui.updateLoadingProgress(75);
                    
                    // Create scene with game objects
                    this.createScene();
                    
                    // Set up network callbacks if network is available
                    if (this.network) {
                        this.setupNetworkCallbacks();
                        
                        // Join room from localStorage
                        const roomId = localStorage.getItem('roomId') || 'public';
                        this.network.joinRoom(roomId);
                    }
                    
                    // Mark as initialized
                    this.isInitialized = true;
                    this.ui.updateLoadingProgress(100);
                    
                    // Hide loading screen after a short delay
                    setTimeout(() => {
                        this.ui.hideLoadingScreen();
                        
                        // Start game loop
                        this.lastTime = performance.now();
                        this.gameLoop();
                        
                        console.log('Game initialized successfully');
                        
                        // If no network, start the game in single player mode immediately
                        // Otherwise, start after a short delay to ensure everything is ready
                        setTimeout(() => {
                            if (!this.network || !this.isStarted) {
                                this.startGame();
                                this.ui.showNotification('Starting single player mode');
                                console.log('Game started in single player mode');
                            }
                        }, 2000);
                    }, 500);
                })
                .catch(error => {
                    console.error('Error initializing game:', error);
                    this.ui.showNotification('Error initializing game. Please refresh the page.');
                });
        } catch (error) {
            console.error('Error in game initialization:', error);
            if (this.ui) {
                this.ui.showNotification('Error initializing game. Please refresh the page.');
            }
        }
    }
    
    setupThreeJS() {
        try {
            console.log('Setting up Three.js...');
            
            // Create scene
            this.scene = new THREE.Scene();
            
            // Create camera
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            
            // Create renderer
            this.renderer = new THREE.WebGLRenderer({
                canvas: document.getElementById('game-canvas'),
                antialias: true
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            
            // Add window resize handler
            window.addEventListener('resize', this.handleResize);
            
            console.log('Three.js setup complete');
        } catch (error) {
            console.error('Error setting up Three.js:', error);
            throw error;
        }
    }
    
    loadAssets() {
        return new Promise((resolve, reject) => {
            try {
                console.log('Loading assets...');
                this.ui.updateLoadingProgress(25);
                
                // Simulate asset loading
                setTimeout(() => {
                    this.ui.updateLoadingProgress(50);
                    resolve();
                }, 1000);
            } catch (error) {
                console.error('Error loading assets:', error);
                reject(error);
            }
        });
    }
    
    createScene() {
        try {
            if (!this.scene) {
                console.error('Scene is not initialized');
                throw new Error('Scene is not initialized');
            }
            
            console.log('Creating scene...');
            
            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);
            
            // Add directional light (sun)
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(100, 100, 50);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 500;
            this.scene.add(directionalLight);
            
            // Create track
            this.track = new Track(this.scene);
            this.track.create();
            
            // Create player bike
            const bikeType = localStorage.getItem('bikeType') || 'default';
            this.playerBike = new Bike(this.scene, bikeType);
            this.playerBike.create();
            
            // Position bike at the starting point of the track
            if (this.track && this.track.trackSpec && this.track.trackSpec.checkpoints && this.track.trackSpec.checkpoints.length > 0) {
                const startingPoint = this.track.trackSpec.checkpoints[0].position;
                this.playerBike.object.position.set(startingPoint.x, startingPoint.y, startingPoint.z);
                this.playerBike.position = { 
                    x: startingPoint.x, 
                    y: startingPoint.y, 
                    z: startingPoint.z 
                };
                console.log('Positioned bike at starting point:', startingPoint);
            }
            
            // Position camera behind bike
            this.camera.position.set(0, 5, -10);
            this.camera.lookAt(this.playerBike.object.position);
            
            console.log('Scene created successfully');
        } catch (error) {
            console.error('Error creating scene:', error);
            if (this.ui) {
                this.ui.showNotification('Error creating scene. Please refresh the page.');
            }
            throw error;
        }
    }
    
    setupEventListeners() {
        // Pause game on Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.togglePause();
            }
        });
        
        // UI button event listeners
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => this.togglePause());
        }
        
        const exitGameBtn = document.getElementById('exit-game-btn');
        if (exitGameBtn) {
            exitGameBtn.addEventListener('click', () => {
                window.location.href = '/';
            });
        }
        
        const showControlsBtn = document.getElementById('show-controls-btn');
        if (showControlsBtn && this.ui) {
            showControlsBtn.addEventListener('click', () => {
                this.ui.showControlsOverlay();
            });
        }
        
        const closeControlsBtn = document.getElementById('close-controls-btn');
        if (closeControlsBtn && this.ui) {
            closeControlsBtn.addEventListener('click', () => {
                this.ui.hideControlsOverlay();
            });
        }
    }
    
    setupNetworkCallbacks() {
        if (!this.network) {
            console.error('Network is not initialized');
            return;
        }
        
        try {
            // Set player ID
            this.playerId = this.network.getPlayerId();
            
            // Room joined callback
            if (typeof this.network.onRoomJoined === 'function') {
                this.network.onRoomJoined((data) => {
                    console.log('Joined room:', data.room_id);
                    
                    // Add existing players
                    const players = data.players || {};
                    Object.keys(players).forEach(playerId => {
                        if (playerId !== this.playerId) {
                            this.addOtherPlayer(playerId, players[playerId]);
                        }
                    });
                    
                    // Check game state
                    const gameState = data.game_state || {};
                    if (gameState.status === 'countdown') {
                        this.ui.showCountdown(gameState.countdown);
                    } else if (gameState.status === 'racing') {
                        this.startGame();
                    }
                });
            } else {
                console.warn('onRoomJoined method not available in network');
            }
            
            // Player joined callback
            if (typeof this.network.onPlayerJoined === 'function') {
                this.network.onPlayerJoined((data) => {
                    if (data.player_id !== this.playerId) {
                        this.addOtherPlayer(data.player_id, data);
                    }
                });
            } else {
                console.warn('onPlayerJoined method not available in network');
            }
            
            // Player left callback
            if (typeof this.network.onPlayerLeft === 'function') {
                this.network.onPlayerLeft((data) => {
                    this.removeOtherPlayer(data.player_id);
                });
            } else {
                console.warn('onPlayerLeft method not available in network');
            }
            
            // Player updated callback
            if (typeof this.network.onPlayerUpdated === 'function') {
                this.network.onPlayerUpdated((data) => {
                    this.updateOtherPlayer(data.player_id, data);
                });
            } else {
                console.warn('onPlayerUpdated method not available in network');
            }
            
            // Game started callback
            if (typeof this.network.onGameStarted === 'function') {
                this.network.onGameStarted(() => {
                    this.startGame();
                });
            } else {
                console.warn('onGameStarted method not available in network');
            }
            
            // Game over callback
            if (typeof this.network.onGameOver === 'function') {
                this.network.onGameOver((data) => {
                    this.endGame(data);
                });
            } else {
                console.warn('onGameOver method not available in network');
            }
            
            // Combat action callback
            if (typeof this.network.onCombatAction === 'function') {
                this.network.onCombatAction((data) => {
                    this.handleCombatAction(data);
                });
            } else {
                console.warn('onCombatAction method not available in network');
            }
        } catch (error) {
            console.error('Error setting up network callbacks:', error);
            if (this.ui) {
                this.ui.showNotification('Error setting up network. Some multiplayer features may not work.');
            }
        }
    }
    
    startGame() {
        if (!this.isInitialized) {
            console.error('Cannot start game: Game not initialized');
            return;
        }
        
        // Reset game state
        this.gameTime = 0;
        this.lastLapTime = 0;
        this.lapTime = 0;
        this.lapsCompleted = 0;
        this.frameCount = 0;
        
        // Show countdown
        this.ui.showCountdownOverlay();
        
        // Start countdown
        let countdown = 3;
        this.ui.updateCountdown(countdown);
        
        // Play countdown sound
        this.playSound('countdown');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            this.ui.updateCountdown(countdown);
            
            if (countdown > 0) {
                // Play countdown sound
                this.playSound('countdown');
            } else {
                // Clear interval
                clearInterval(countdownInterval);
                
                // Hide countdown overlay
                this.ui.hideCountdownOverlay();
                
                // Set game start time
                this.ui.setGameStartTime();
                
                // Start game
                this.isGameRunning = true;
                this.isStarted = true;
                
                // Play start sound
                this.playSound('start');
                
                // Start engine sound
                this.playSound('engine', 0.3);
                
                // Start background music
                this.playMusic();
            }
        }, 1000);
    }
    
    update(deltaTime) {
        if (!this.isGameRunning || this.isPaused) return;
        
        // Update game timer
        this.gameTime += deltaTime;
        
        // Get current control state
        const controlState = this.controls.getState();
        
        // Debug logging (every 60 frames to avoid console spam)
        if (this.frameCount % 60 === 0) {
            console.log('Game update - Control state:', controlState);
            console.log('Game update - isGameRunning:', this.isGameRunning);
            console.log('Game update - isStarted:', this.isStarted);
            console.log('Game update - isPaused:', this.isPaused);
        }
        
        // Update player bike
        const bikeData = this.playerBike.update(deltaTime, controlState);
        
        // More debug logging
        if (this.frameCount % 60 === 0) {
            console.log('Game update - Bike data:', bikeData);
        }
        
        // Update UI
        if (this.ui) {
            this.ui.updateSpeedometer(bikeData.speed);
            this.ui.updateHealth(bikeData.health);
            this.ui.updateGameTime(this.gameTime);
        }
        
        // Check if track exists
        if (this.track) {
            // Check for checkpoint/lap completion
            const checkpointResult = this.track.checkCheckpoints(bikeData.position);
            if (checkpointResult) {
                if (checkpointResult.checkpointPassed) {
                    console.log('Checkpoint passed:', checkpointResult.checkpointIndex);
                    // Play checkpoint sound
                    this.playSound('checkpoint');
                }
                
                if (checkpointResult.lapCompleted) {
                    console.log('Lap completed!');
                    this.lapTime = this.gameTime - this.lastLapTime;
                    this.lastLapTime = this.gameTime;
                    this.lapsCompleted++;
                    
                    // Update UI with lap info
                    if (this.ui) {
                        this.ui.updateLapCounter(this.lapsCompleted, this.totalLaps);
                        this.ui.updateLapTime(this.lapTime);
                    }
                    
                    // Play lap completed sound
                    this.playSound('lapComplete');
                    
                    // Check if race is finished
                    if (this.lapsCompleted >= this.totalLaps) {
                        this.finishRace();
                    }
                }
            }
            
            // Check for obstacle collisions
            const collisionResult = this.track.checkObstacleCollisions(bikeData.position);
            if (collisionResult && collisionResult.collision) {
                console.log('Collision with obstacle:', collisionResult.type);
                
                // Apply damage based on obstacle type
                let damage = 0;
                switch (collisionResult.type) {
                    case 'rock':
                        damage = 10;
                        this.playSound('collision');
                        break;
                    case 'car':
                        damage = 20;
                        this.playSound('crash');
                        break;
                    case 'oil':
                        damage = 5;
                        this.playSound('skid');
                        break;
                }
                
                // Apply damage to bike
                this.playerBike.takeDamage(damage);
                
                // Update UI
                if (this.ui) {
                    this.ui.updateHealth(this.playerBike.health);
                }
                
                // Check if bike is destroyed
                if (this.playerBike.health <= 0) {
                    this.gameOver();
                }
            }
            
            // Enforce track boundaries
            this.enforceTrackBoundaries();
        }
        
        // Update camera
        this.updateCameraPosition();
        
        // Update network position (every 5 frames to reduce network traffic)
        if (this.frameCount % 5 === 0 && this.socket && this.socket.connected) {
            this.socket.emit('position_update', {
                position: {
                    x: bikeData.position.x,
                    y: bikeData.position.y,
                    z: bikeData.position.z
                },
                rotation: {
                    x: bikeData.rotation.x,
                    y: bikeData.rotation.y,
                    z: bikeData.rotation.z
                },
                speed: bikeData.speed
            });
        }
        
        this.frameCount++;
    }
    
    updateCameraPosition() {
        if (!this.camera || !this.playerBike) return;
        
        // Calculate camera position based on bike position and rotation
        const bikePosition = this.playerBike.object.position;
        const bikeRotation = this.playerBike.object.rotation;
        
        // Calculate camera offset (behind and above the bike)
        const distance = 10;
        const height = 5;
        
        // Calculate camera position based on bike's direction
        const cameraX = bikePosition.x - Math.sin(bikeRotation.y) * distance;
        const cameraY = bikePosition.y + height;
        const cameraZ = bikePosition.z - Math.cos(bikeRotation.y) * distance;
        
        // Update camera position
        this.camera.position.set(cameraX, cameraY, cameraZ);
        
        // Make camera look at bike
        this.camera.lookAt(bikePosition);
    }
    
    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    gameLoop(currentTime) {
        try {
            // Calculate delta time
            this.deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;
            
            // Limit delta time to prevent large jumps
            if (this.deltaTime > 0.1) this.deltaTime = 0.1;
            
            // Debug logging (every 300 frames to avoid console spam)
            if (this.frameCount % 300 === 0) {
                console.log('Game loop - deltaTime:', this.deltaTime);
                console.log('Game loop - isGameRunning:', this.isGameRunning);
                console.log('Game loop - isStarted:', this.isStarted);
                console.log('Game loop - isPaused:', this.isPaused);
            }
            
            // Update game state
            this.update(this.deltaTime);
            
            // Render scene
            this.render();
            
            // Request next frame
            requestAnimationFrame(this.gameLoop);
        } catch (error) {
            console.error('Error in game loop:', error);
            if (this.ui) {
                this.ui.showNotification('Error in game loop. Please refresh the page.');
            }
        }
    }
    
    handleResize() {
        if (this.camera && this.renderer) {
            // Update camera aspect ratio
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            
            // Update renderer size
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    togglePause() {
        if (!this.isInitialized || this.isOver) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.ui.showPauseMenu();
        } else {
            this.ui.hidePauseMenu();
        }
    }
    
    addOtherPlayer(playerId, playerData) {
        try {
            console.log('Adding other player:', playerId);
            
            // Create player object
            const player = new Player(
                playerId,
                playerData.name || `Player_${playerId.substring(0, 5)}`,
                playerData.bike || 'default'
            );
            
            // Create bike for player
            const bike = new OtherPlayerBike(this.scene, playerData.bike || 'default');
            bike.create();
            
            // Set initial position and rotation
            if (playerData.position) {
                bike.setPosition(playerData.position);
            }
            
            if (playerData.rotation) {
                bike.setRotation(playerData.rotation);
            }
            
            // Set bike for player
            player.setBike(bike);
            
            // Add to players list
            this.players[playerId] = player;
            
            // Update UI player list
            if (this.ui) {
                this.ui.updatePlayerList(this.playerId, this.players);
            }
        } catch (error) {
            console.error('Error adding other player:', error);
        }
    }
    
    removeOtherPlayer(playerId) {
        try {
            console.log('Removing player:', playerId);
            
            // Get player
            const player = this.players[playerId];
            
            if (player) {
                // Remove bike from scene
                if (player.bike) {
                    player.bike.remove();
                }
                
                // Remove from players list
                delete this.players[playerId];
                
                // Update UI player list
                if (this.ui) {
                    this.ui.updatePlayerList(this.playerId, this.players);
                }
            }
        } catch (error) {
            console.error('Error removing other player:', error);
        }
    }
    
    updateOtherPlayer(playerId, data) {
        try {
            // Get player
            const player = this.players[playerId];
            
            if (player && player.bike) {
                // Update player data
                player.update(data);
            }
        } catch (error) {
            console.error('Error updating other player:', error);
        }
    }
    
    checkPlayerCollisions() {
        if (!this.playerBike || !this.isStarted) return;
        
        // Get player position
        const playerPosition = this.playerBike.object.position;
        
        // Check collision with each other player
        Object.values(this.players).forEach(player => {
            if (player.bike) {
                const otherPosition = player.bike.object.position;
                
                // Calculate distance
                const distance = distance3D(playerPosition, otherPosition);
                
                // Collision threshold
                const collisionThreshold = 3.0;
                
                if (distance < collisionThreshold) {
                    // Collision detected
                    console.log('Collision with player:', player.id);
                    
                    // Apply damage and speed penalty
                    this.playerBike.applyDamage(5);
                    this.playerBike.speed *= 0.8;
                    
                    // Update UI
                    if (this.ui) {
                        this.ui.updateHealthBar(this.playerBike.health);
                        this.ui.showNotification('Collision with ' + player.name);
                    }
                }
            }
        });
    }
    
    handleCombatAction(data) {
        if (!this.playerBike || !this.isStarted) return;
        
        // Check if action is directed at this player
        if (data.target_id === this.playerId) {
            console.log('Combat action received:', data.action_type);
            
            // Apply damage and speed penalty based on action type
            let damage = 0;
            let speedPenalty = 0;
            
            if (data.action_type === 'punch') {
                damage = 10;
                speedPenalty = 0.9;
            } else if (data.action_type === 'kick') {
                damage = 15;
                speedPenalty = 0.8;
            }
            
            // Apply damage and speed penalty
            this.playerBike.applyDamage(damage);
            this.playerBike.speed *= speedPenalty;
            
            // Update UI
            if (this.ui) {
                this.ui.updateHealthBar(this.playerBike.health);
                this.ui.showNotification(`${data.action_type} from ${this.players[data.player_id]?.name || 'another player'}`);
            }
        }
    }
    
    endGame(data) {
        if (this.isOver) return;
        
        console.log('Game over');
        this.isOver = true;
        
        // Show game over overlay
        if (this.ui) {
            const results = data || {
                position: 1,
                time: this.track ? this.track.getRaceTime() : 0,
                bestLap: this.track ? this.track.bestLapTime : 0
            };
            
            this.ui.showGameOverOverlay(results);
        }
    }
    
    // Add a new method to enforce track boundaries
    enforceTrackBoundaries() {
        if (!this.track || !this.playerBike) return;
        
        const bikePosition = this.playerBike.object.position;
        const trackBounds = this.track.getTrackBounds();
        
        if (!this.track.isWithinTrackBoundaries(bikePosition)) {
            // Calculate direction vector from bike to nearest point on track
            const nearestPoint = this.track.getNearestPointOnTrack(bikePosition);
            
            if (nearestPoint) {
                // Calculate direction vector from bike to nearest point
                const directionX = nearestPoint.x - bikePosition.x;
                const directionZ = nearestPoint.z - bikePosition.z;
                
                // Normalize direction vector
                const distance = Math.sqrt(directionX * directionX + directionZ * directionZ);
                const normalizedDirX = directionX / distance;
                const normalizedDirZ = directionZ / distance;
                
                // Apply force to push bike back to track
                const forceMagnitude = 5.0; // Adjust as needed
                this.playerBike.object.position.x += normalizedDirX * forceMagnitude;
                this.playerBike.object.position.z += normalizedDirZ * forceMagnitude;
                
                // Also update the bike's internal position to match
                this.playerBike.position.x = this.playerBike.object.position.x;
                this.playerBike.position.z = this.playerBike.object.position.z;
                
                // Reduce speed as penalty for going off track
                this.playerBike.speed *= 0.8;
                
                // Play off-track sound
                this.playSound('offTrack');
                
                // Show visual feedback
                if (this.ui) {
                    this.ui.showOffTrackWarning();
                }
            }
        }
    }
    
    finishRace() {
        if (!this.isGameRunning) return;
        
        console.log('Race finished!');
        
        // Stop game
        this.isGameRunning = false;
        this.isOver = true;
        
        // Play victory sound
        this.playSound('victory');
        
        // Stop engine sound
        this.stopMusic();
        
        // Show game over overlay with results
        const results = {
            finished: true,
            time: this.gameTime,
            laps: this.lapsCompleted,
            bestLapTime: this.lapTime,
            players: [
                {
                    name: 'You',
                    isCurrentPlayer: true,
                    totalTime: this.gameTime * 1000, // Convert to milliseconds
                    bestLapTime: this.lapTime * 1000 // Convert to milliseconds
                }
                // Other players would be added here in multiplayer
            ]
        };
        
        this.ui.showGameOverOverlay(results);
    }
    
    gameOver() {
        if (!this.isGameRunning) return;
        
        console.log('Game over!');
        
        // Stop game
        this.isGameRunning = false;
        this.isOver = true;
        
        // Play game over sound
        this.playSound('gameOver');
        
        // Stop engine sound
        this.stopMusic();
        
        // Show game over overlay with results
        const results = {
            finished: false,
            time: this.gameTime,
            laps: this.lapsCompleted,
            bestLapTime: this.lapTime,
            players: [
                {
                    name: 'You',
                    isCurrentPlayer: true,
                    totalTime: this.gameTime * 1000, // Convert to milliseconds
                    bestLapTime: this.lapTime * 1000 // Convert to milliseconds
                }
                // Other players would be added here in multiplayer
            ]
        };
        
        this.ui.showGameOverOverlay(results);
    }

    // Helper method to safely play sounds
    playSound(soundName, volume) {
        if (this.audioManager) {
            try {
                this.audioManager.playSound(soundName, volume);
            } catch (error) {
                console.warn(`Error playing sound '${soundName}':`, error);
            }
        }
    }

    // Helper method to safely play music
    playMusic() {
        if (this.audioManager) {
            try {
                this.audioManager.playMusic();
            } catch (error) {
                console.warn('Error playing music:', error);
            }
        }
    }

    // Helper method to safely stop music
    stopMusic() {
        if (this.audioManager) {
            try {
                this.audioManager.stopMusic();
            } catch (error) {
                console.warn('Error stopping music:', error);
            }
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM loaded, initializing game');
        const game = new RoadRageGame();
        game.init();
    } catch (error) {
        console.error('Error initializing game:', error);
        alert('Failed to initialize game. Please refresh the page.');
    }
}); 