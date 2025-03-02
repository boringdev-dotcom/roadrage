// Menu JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Socket.io connection
    const socket = io();
    
    // DOM Elements
    const playPublicBtn = document.getElementById('play-public');
    const createPrivateBtn = document.getElementById('create-private');
    const joinPrivateBtn = document.getElementById('join-private');
    const settingsBtn = document.getElementById('settings');
    
    const privateRoomModal = document.getElementById('private-room-modal');
    const createRoomModal = document.getElementById('create-room-modal');
    const settingsModal = document.getElementById('settings-modal');
    
    const roomCodeInput = document.getElementById('room-code');
    const joinRoomBtn = document.getElementById('join-room-btn');
    const roomCodeDisplay = document.getElementById('room-code-display');
    const startPrivateGameBtn = document.getElementById('start-private-game-btn');
    
    const playerNameInput = document.getElementById('player-name');
    const bikeSelect = document.getElementById('bike-select');
    const graphicsQualitySelect = document.getElementById('graphics-quality');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    
    const closeButtons = document.querySelectorAll('.close');
    
    // Game settings
    let gameSettings = {
        playerName: localStorage.getItem('playerName') || `Player_${Math.floor(Math.random() * 1000)}`,
        bikeType: localStorage.getItem('bikeType') || 'default',
        graphicsQuality: localStorage.getItem('graphicsQuality') || 'medium'
    };
    
    // Initialize settings inputs
    playerNameInput.value = gameSettings.playerName;
    bikeSelect.value = gameSettings.bikeType;
    graphicsQualitySelect.value = gameSettings.graphicsQuality;
    
    // Event Listeners
    playPublicBtn.addEventListener('click', function() {
        joinPublicGame();
    });
    
    createPrivateBtn.addEventListener('click', function() {
        showModal(createRoomModal);
        createPrivateRoom();
    });
    
    joinPrivateBtn.addEventListener('click', function() {
        showModal(privateRoomModal);
    });
    
    settingsBtn.addEventListener('click', function() {
        showModal(settingsModal);
    });
    
    joinRoomBtn.addEventListener('click', function() {
        const roomCode = roomCodeInput.value.trim();
        if (roomCode) {
            joinPrivateGame(roomCode);
        }
    });
    
    startPrivateGameBtn.addEventListener('click', function() {
        const roomCode = roomCodeDisplay.textContent;
        if (roomCode) {
            joinPrivateGame(roomCode);
        }
    });
    
    saveSettingsBtn.addEventListener('click', function() {
        saveSettings();
        hideModal(settingsModal);
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal);
        });
    });
    
    // Socket Events
    socket.on('connect', function() {
        console.log('Connected to server');
    });
    
    socket.on('private_room_created', function(data) {
        roomCodeDisplay.textContent = data.room_id;
    });
    
    // Functions
    function showModal(modal) {
        modal.classList.add('active');
    }
    
    function hideModal(modal) {
        modal.classList.remove('active');
    }
    
    function saveSettings() {
        gameSettings.playerName = playerNameInput.value || gameSettings.playerName;
        gameSettings.bikeType = bikeSelect.value;
        gameSettings.graphicsQuality = graphicsQualitySelect.value;
        
        localStorage.setItem('playerName', gameSettings.playerName);
        localStorage.setItem('bikeType', gameSettings.bikeType);
        localStorage.setItem('graphicsQuality', gameSettings.graphicsQuality);
    }
    
    function joinPublicGame() {
        saveSettings();
        localStorage.setItem('roomId', 'public');
        window.location.href = '/game';
    }
    
    function createPrivateRoom() {
        socket.emit('create_private_room');
    }
    
    function joinPrivateGame(roomCode) {
        saveSettings();
        localStorage.setItem('roomId', roomCode);
        window.location.href = '/game';
    }
}); 