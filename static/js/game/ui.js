// Game UI Class
class GameUI {
    constructor() {
        // UI elements
        this.loadingScreen = null;
        this.loadingProgress = null;
        this.gameUI = null;
        this.speedometer = null;
        this.healthBar = null;
        this.positionDisplay = null;
        this.lapCounter = null;
        this.timer = null;
        this.minimap = null;
        this.playerList = null;
        this.countdownOverlay = null;
        this.gameOverOverlay = null;
        this.chatContainer = null;
        this.controlsOverlay = null;
        this.pauseMenu = null;
        
        // UI state
        this.isLoading = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.showingControls = false;
        this.showingChat = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.getElements = this.getElements.bind(this);
        this.showLoadingScreen = this.showLoadingScreen.bind(this);
        this.hideLoadingScreen = this.hideLoadingScreen.bind(this);
        this.updateLoadingProgress = this.updateLoadingProgress.bind(this);
        this.showCountdownOverlay = this.showCountdownOverlay.bind(this);
        this.hideCountdownOverlay = this.hideCountdownOverlay.bind(this);
        this.updateCountdown = this.updateCountdown.bind(this);
        this.showGameOverOverlay = this.showGameOverOverlay.bind(this);
        this.hideGameOverOverlay = this.hideGameOverOverlay.bind(this);
        this.showPauseMenu = this.showPauseMenu.bind(this);
        this.hidePauseMenu = this.hidePauseMenu.bind(this);
        this.showControlsOverlay = this.showControlsOverlay.bind(this);
        this.hideControlsOverlay = this.hideControlsOverlay.bind(this);
        this.showChatContainer = this.showChatContainer.bind(this);
        this.hideChatContainer = this.hideChatContainer.bind(this);
        this.updateSpeedometer = this.updateSpeedometer.bind(this);
        this.updateHealthBar = this.updateHealthBar.bind(this);
        this.updatePositionDisplay = this.updatePositionDisplay.bind(this);
        this.updateLapCounter = this.updateLapCounter.bind(this);
        this.updateTimer = this.updateTimer.bind(this);
        this.updateMinimap = this.updateMinimap.bind(this);
        this.updatePlayerList = this.updatePlayerList.bind(this);
        this.addChatMessage = this.addChatMessage.bind(this);
        this.showDamageIndicator = this.showDamageIndicator.bind(this);
        this.showNotification = this.showNotification.bind(this);
    }
    
    init() {
        // Get UI elements
        this.getElements();
        
        // Initialize UI
        this.showLoadingScreen();
        
        // Setup chat
        this.setupChat();
    }
    
    getElements() {
        try {
            // Get UI elements from DOM
            this.loadingScreen = document.getElementById('loading-screen');
            this.loadingProgress = document.querySelector('.loading-progress');
            this.gameUI = document.getElementById('game-ui');
            this.speedometer = document.querySelector('#speedometer .speed-value');
            this.healthBar = document.querySelector('#health-bar .health-fill');
            this.positionDisplay = document.querySelector('#position-display .position-value');
            this.lapCounter = document.querySelector('#lap-counter .lap-value');
            this.timer = document.querySelector('#timer .timer-value');
            this.minimap = document.getElementById('minimap');
            this.playerList = document.getElementById('player-list');
            this.countdownOverlay = document.getElementById('countdown-overlay');
            this.gameOverOverlay = document.getElementById('game-over-overlay');
            this.chatContainer = document.getElementById('chat-container');
            this.controlsOverlay = document.getElementById('controls-overlay');
            this.pauseMenu = document.getElementById('pause-menu');
            
            // Log any missing elements
            const elements = {
                'loadingScreen': this.loadingScreen,
                'loadingProgress': this.loadingProgress,
                'gameUI': this.gameUI,
                'speedometer': this.speedometer,
                'healthBar': this.healthBar,
                'positionDisplay': this.positionDisplay,
                'lapCounter': this.lapCounter,
                'timer': this.timer,
                'minimap': this.minimap,
                'playerList': this.playerList,
                'countdownOverlay': this.countdownOverlay,
                'gameOverOverlay': this.gameOverOverlay,
                'chatContainer': this.chatContainer,
                'controlsOverlay': this.controlsOverlay,
                'pauseMenu': this.pauseMenu
            };
            
            for (const [name, element] of Object.entries(elements)) {
                if (!element) {
                    console.warn(`UI element '${name}' not found in the DOM`);
                }
            }
        } catch (error) {
            console.error('Error getting UI elements:', error);
        }
    }
    
    showLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
            this.isLoading = true;
        }
    }
    
    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'none';
            this.isLoading = false;
        }
    }
    
    updateLoadingProgress(progress) {
        if (this.loadingProgress) {
            this.loadingProgress.style.width = `${progress}%`;
        }
    }
    
    showCountdownOverlay() {
        this.countdownOverlay.classList.remove('hidden');
    }
    
    hideCountdownOverlay() {
        this.countdownOverlay.classList.add('hidden');
    }
    
    updateCountdown(value) {
        const countdownValue = document.querySelector('.countdown-value');
        countdownValue.textContent = value;
    }
    
    showGameOverOverlay(results) {
        this.gameOverOverlay.classList.remove('hidden');
        this.isGameOver = true;
        
        // Display race results
        const raceResults = document.getElementById('race-results');
        raceResults.innerHTML = '';
        
        if (results && results.players) {
            // Create results table
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Player</th>
                        <th>Time</th>
                        <th>Best Lap</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            
            const tbody = table.querySelector('tbody');
            
            // Add player results
            results.players.forEach((player, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${player.name}</td>
                    <td>${this.formatTime(player.totalTime)}</td>
                    <td>${this.formatTime(player.bestLapTime)}</td>
                `;
                
                // Highlight current player
                if (player.isCurrentPlayer) {
                    row.classList.add('current-player');
                }
                
                tbody.appendChild(row);
            });
            
            raceResults.appendChild(table);
        }
    }
    
    hideGameOverOverlay() {
        this.gameOverOverlay.classList.add('hidden');
        this.isGameOver = false;
    }
    
    showPauseMenu() {
        this.pauseMenu.classList.remove('hidden');
        this.isPaused = true;
    }
    
    hidePauseMenu() {
        this.pauseMenu.classList.add('hidden');
        this.isPaused = false;
    }
    
    showControlsOverlay() {
        this.controlsOverlay.classList.remove('hidden');
        this.showingControls = true;
    }
    
    hideControlsOverlay() {
        this.controlsOverlay.classList.add('hidden');
        this.showingControls = false;
    }
    
    setupChat() {
        const chatInput = document.getElementById('chat-input');
        const chatSendBtn = document.getElementById('chat-send-btn');
        
        // Open chat with T key
        document.addEventListener('keydown', (e) => {
            if (e.key === 't' && !this.isLoading && !this.isPaused && !this.isGameOver) {
                this.showChatContainer();
                chatInput.focus();
                e.preventDefault();
            }
            
            // Close chat with Escape
            if (e.key === 'Escape' && this.showingChat) {
                this.hideChatContainer();
                e.preventDefault();
            }
        });
        
        // Send message on Enter
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const message = chatInput.value.trim();
                if (message) {
                    // Send message to server (handled by network.js)
                    const event = new CustomEvent('chat-message', {
                        detail: { message }
                    });
                    document.dispatchEvent(event);
                    
                    // Clear input
                    chatInput.value = '';
                }
                
                // Hide chat
                this.hideChatContainer();
                e.preventDefault();
            }
        });
        
        // Send button
        chatSendBtn.addEventListener('click', () => {
            const message = chatInput.value.trim();
            if (message) {
                // Send message to server (handled by network.js)
                const event = new CustomEvent('chat-message', {
                    detail: { message }
                });
                document.dispatchEvent(event);
                
                // Clear input
                chatInput.value = '';
            }
            
            // Hide chat
            this.hideChatContainer();
        });
    }
    
    showChatContainer() {
        this.chatContainer.classList.remove('hidden');
        this.showingChat = true;
    }
    
    hideChatContainer() {
        this.chatContainer.classList.add('hidden');
        this.showingChat = false;
    }
    
    updateSpeedometer(speed) {
        this.speedometer.textContent = Math.round(speed);
    }
    
    updateHealthBar(health) {
        const percentage = Math.max(0, Math.min(100, health));
        this.healthBar.style.width = `${percentage}%`;
        
        // Change color based on health
        if (percentage > 60) {
            this.healthBar.style.backgroundColor = 'var(--health-color)';
        } else if (percentage > 30) {
            this.healthBar.style.backgroundColor = 'orange';
        } else {
            this.healthBar.style.backgroundColor = 'var(--danger-color)';
        }
    }
    
    updatePositionDisplay(position, totalPlayers) {
        // Convert position to ordinal (1st, 2nd, 3rd, etc.)
        let suffix = 'th';
        if (position % 10 === 1 && position % 100 !== 11) {
            suffix = 'st';
        } else if (position % 10 === 2 && position % 100 !== 12) {
            suffix = 'nd';
        } else if (position % 10 === 3 && position % 100 !== 13) {
            suffix = 'rd';
        }
        
        this.positionDisplay.textContent = `${position}${suffix}`;
        
        // Add total players if available
        if (totalPlayers) {
            this.positionDisplay.textContent += ` / ${totalPlayers}`;
        }
    }
    
    updateLapCounter(currentLap, totalLaps) {
        this.lapCounter.textContent = `${currentLap}/${totalLaps}`;
    }
    
    updateTimer(time) {
        this.timer.textContent = this.formatTime(time);
    }
    
    formatTime(timeMs) {
        // Format time in mm:ss.ms format
        const totalSeconds = timeMs / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const milliseconds = Math.floor((totalSeconds % 1) * 100);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    
    updateMinimap(playerPosition, otherPlayers, checkpoints) {
        // Clear minimap
        this.minimap.innerHTML = '';
        
        // Create minimap canvas
        const canvas = document.createElement('canvas');
        canvas.width = this.minimap.clientWidth;
        canvas.height = this.minimap.clientHeight;
        this.minimap.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Draw background
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, width, height);
        
        // Draw track (if checkpoints are provided)
        if (checkpoints && checkpoints.length > 0) {
            // Calculate scale and offset to fit track on minimap
            let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
            
            checkpoints.forEach(checkpoint => {
                minX = Math.min(minX, checkpoint.position.x);
                maxX = Math.max(maxX, checkpoint.position.x);
                minZ = Math.min(minZ, checkpoint.position.z);
                maxZ = Math.max(maxZ, checkpoint.position.z);
            });
            
            const trackWidth = maxX - minX;
            const trackHeight = maxZ - minZ;
            const padding = 10;
            
            const scaleX = (width - padding * 2) / trackWidth;
            const scaleZ = (height - padding * 2) / trackHeight;
            const scale = Math.min(scaleX, scaleZ);
            
            const offsetX = padding + (width - padding * 2 - trackWidth * scale) / 2;
            const offsetZ = padding + (height - padding * 2 - trackHeight * scale) / 2;
            
            // Draw track
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            checkpoints.forEach((checkpoint, index) => {
                const x = offsetX + (checkpoint.position.x - minX) * scale;
                const y = offsetZ + (checkpoint.position.z - minZ) * scale;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            // Close the track
            ctx.closePath();
            ctx.stroke();
            
            // Draw checkpoints
            checkpoints.forEach((checkpoint, index) => {
                const x = offsetX + (checkpoint.position.x - minX) * scale;
                const y = offsetZ + (checkpoint.position.z - minZ) * scale;
                
                ctx.fillStyle = index === 0 ? '#f00' : '#0f0';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw player
            const playerX = offsetX + (playerPosition.x - minX) * scale;
            const playerY = offsetZ + (playerPosition.z - minZ) * scale;
            
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw player direction
            const directionLength = 8;
            const directionX = Math.sin(playerPosition.rotation?.y || 0);
            const directionY = Math.cos(playerPosition.rotation?.y || 0);
            
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(playerX, playerY);
            ctx.lineTo(playerX + directionX * directionLength, playerY + directionY * directionLength);
            ctx.stroke();
            
            // Draw other players
            if (otherPlayers) {
                Object.values(otherPlayers).forEach(player => {
                    if (player.position) {
                        const otherX = offsetX + (player.position.x - minX) * scale;
                        const otherY = offsetZ + (player.position.z - minZ) * scale;
                        
                        ctx.fillStyle = '#f0f';
                        ctx.beginPath();
                        ctx.arc(otherX, otherY, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            }
        }
    }
    
    updatePlayerList(players) {
        // Clear player list
        this.playerList.innerHTML = '';
        
        // Create player list header
        const header = document.createElement('div');
        header.className = 'player-list-header';
        header.textContent = 'Players';
        this.playerList.appendChild(header);
        
        // Add players
        if (players) {
            Object.values(players).forEach(player => {
                const playerItem = document.createElement('div');
                playerItem.className = 'player-item';
                
                // Add ready indicator if available
                if (player.ready !== undefined) {
                    playerItem.classList.add(player.ready ? 'ready' : 'not-ready');
                }
                
                // Add current player indicator
                if (player.isCurrentPlayer) {
                    playerItem.classList.add('current-player');
                }
                
                playerItem.textContent = player.name;
                this.playerList.appendChild(playerItem);
            });
        }
    }
    
    addChatMessage(playerName, message) {
        const chatMessages = document.getElementById('chat-messages');
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        // Create player name element
        const nameElement = document.createElement('span');
        nameElement.className = 'chat-player-name';
        nameElement.textContent = playerName + ': ';
        
        // Create message text element
        const textElement = document.createElement('span');
        textElement.className = 'chat-message-text';
        textElement.textContent = message;
        
        // Add elements to message
        messageElement.appendChild(nameElement);
        messageElement.appendChild(textElement);
        
        // Add message to chat
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Show chat briefly
        this.showChatContainer();
        setTimeout(() => {
            if (!document.getElementById('chat-input').matches(':focus')) {
                this.hideChatContainer();
            }
        }, 5000);
    }
    
    showDamageIndicator() {
        // Create damage indicator
        const damageIndicator = document.createElement('div');
        damageIndicator.className = 'damage-indicator';
        document.body.appendChild(damageIndicator);
        
        // Remove after animation
        setTimeout(() => {
            damageIndicator.remove();
        }, 500);
    }
    
    showNotification(message, duration = 3000) {
        try {
            // Create notification element if it doesn't exist
            let notification = document.getElementById('game-notification');
            if (!notification) {
                notification = document.createElement('div');
                notification.id = 'game-notification';
                notification.className = 'game-notification';
                document.body.appendChild(notification);
            }
            
            // Set message and show notification
            notification.textContent = message;
            notification.style.display = 'block';
            notification.style.opacity = '1';
            
            // Hide notification after duration
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 500);
            }, duration);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }
} 