// RoadRage Game Configuration

const CONFIG = {
    // Server connection settings
    SERVER: {
        // Set this to your deployed server URL when playing with friends
        // Examples:
        // - Local development: null (will use the current domain)
        // - Deployed server: "https://your-roadrage-app.herokuapp.com"
        // - Render: "https://your-roadrage.onrender.com"
        // - Railway: "https://your-roadrage.up.railway.app"
        URL: null,
        
        // Default port for local development
        PORT: 5002,
        
        // Whether to use offline mode (no server connection)
        OFFLINE_MODE: false
    },
    
    // Game settings
    GAME: {
        DEFAULT_BIKE: 'sport',
        DEFAULT_TRACK: 'track1',
        GRAPHICS_QUALITY: 'medium' // low, medium, high
    }
};

// Function to get Socket.IO connection URL
function getSocketURL() {
    if (CONFIG.SERVER.OFFLINE_MODE) {
        console.log('Using offline mode');
        return null;
    }
    
    if (CONFIG.SERVER.URL) {
        return CONFIG.SERVER.URL;
    }
    
    // Check if we're running on a deployed server or locally
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
        // Use localhost with the specified port for local development
        return `http://localhost:${CONFIG.SERVER.PORT}`;
    } else {
        // When deployed, use the same host as the page
        // This assumes the server and client are deployed together
        return window.location.origin;
    }
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getSocketURL };
} 