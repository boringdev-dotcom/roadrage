# Testing Multiplayer Functionality Locally

This guide will help you test the multiplayer functionality of RoadRage on your local machine before deploying to a cloud platform.

## Prerequisites

- Python 3.7+
- Modern web browser with WebSocket support (Chrome, Firefox, Edge, etc.)

## Step 1: Start the Servers

You need to start two servers:

1. **HTTP Server** (for serving static files):
   ```
   python -m http.server 8000
   ```

2. **Socket.IO Server** (for multiplayer functionality):
   ```
   python server/app.py
   ```

Run each command in a separate terminal window.

## Step 2: Test with the Socket.IO Test Client

1. Open your browser and navigate to:
   ```
   http://localhost:8000/test-client.html
   ```

2. Click the "Connect" button to connect to the Socket.IO server.

3. Click "Create Private Room" to create a new room.

4. Copy the room code that appears.

## Step 3: Test with Multiple Browsers

1. Open a second browser window (or use incognito/private mode) and navigate to:
   ```
   http://localhost:8000/test-client.html
   ```

2. Click "Connect" to connect to the Socket.IO server.

3. Paste the room code from Step 2 into the "Room ID" field.

4. Click "Join Room" to join the private room.

5. In both browser windows, click the "Ready" button to mark players as ready.

6. Watch the event logs to see the game countdown start and the game begin.

## Step 4: Test with the Game

1. Open your browser and navigate to:
   ```
   http://localhost:8000/test-game.html?offline=false
   ```

2. The game should connect to your local Socket.IO server.

3. Open a second browser window (or use incognito/private mode) and navigate to the same URL.

4. Create a private room in one window and join it from the other.

5. You should see both players in the game world.

## Troubleshooting

### Socket.IO Connection Issues

If you see connection errors in the browser console:

1. Make sure both servers are running.
2. Check that you're using the correct port (default is 5001 for Socket.IO server).
3. Try using `localhost` instead of `127.0.0.1` or vice versa.

### Port Already in Use

If you see an error like "Only one usage of each socket address is normally permitted":

1. Kill any existing Python processes that might be using the port:
   ```
   # On Windows
   netstat -ano | findstr :5001
   taskkill /PID <PID> /F
   
   # On macOS/Linux
   lsof -i :5001
   kill -9 <PID>
   ```

2. Or use a different port:
   ```
   # For Socket.IO server
   set PORT=5002
   python server/app.py
   ```

### Cross-Origin Issues

If you see CORS errors in the browser console:

1. Make sure the Socket.IO server has CORS enabled (it should be with `cors_allowed_origins="*"`).
2. Try using the same port for both servers by setting up a reverse proxy.

### Werkzeug Warning

If you see an error like "The Werkzeug web server is not designed to run in production":

1. Make sure you're using the latest version of the code which includes `allow_unsafe_werkzeug=True` in the `socketio.run()` call.
2. If you're still seeing the error, you can manually add this parameter:
   ```python
   socketio.run(app, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)
   ```

## Next Steps

Once you've confirmed that multiplayer works locally, you can deploy the server to a cloud platform following the instructions in DEPLOYMENT.md. 