# Deployment Guide for RoadRage Game

This guide provides instructions for deploying the RoadRage game to various platforms.

## Prerequisites

- Python 3.7 or higher
- Node.js (if using a Node.js-based hosting service)
- Git

## Local Development

1. Clone the repository:
   ```
   git clone <repository-url>
   cd roadrage
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the server:
   ```
   cd server
   python app.py
   ```

4. Open a web browser and navigate to `http://localhost:5002` to play the game.

## Deployment Options

### Option 1: Deploying to Heroku

1. Create a Heroku account if you don't have one.
2. Install the Heroku CLI.
3. Login to Heroku:
   ```
   heroku login
   ```

4. Create a new Heroku app:
   ```
   heroku create your-roadrage-app
   ```

5. Add a Procfile to the root of your project:
   ```
   web: cd server && python app.py
   ```

6. Set environment variables:
   ```
   heroku config:set PORT=5000
   ```

7. Deploy to Heroku:
   ```
   git push heroku main
   ```

8. Open the app:
   ```
   heroku open
   ```

### Option 2: Deploying to Render

1. Create a Render account if you don't have one.
2. Create a new Web Service.
3. Connect your GitHub repository.
4. Configure the service:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `cd server && gunicorn --worker-class eventlet -w 1 app:app`
   - Environment Variables: 
     - `PORT=10000`
     - `PYTHON_VERSION=3.9` (Important: Use Python 3.9 for better compatibility)

5. Click "Create Web Service".
6. After deployment, test the connection using the test_server.html file.

**Note for Render Deployment:**
- We use eventlet instead of gevent for better compatibility with Render's environment.
- Specifying Python 3.9 helps avoid compatibility issues with some dependencies.

### Option 3: Deploying to Railway

1. Create a Railway account if you don't have one.
2. Create a new project.
3. Connect your GitHub repository.
4. Add a service and select your repository.
5. Configure the service:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `cd server && python app.py`
   - Environment Variables: `PORT=5000`

6. Deploy the service.

## Troubleshooting

### Connection Refused Errors

If you see `ERR_CONNECTION_REFUSED` errors in the browser console:

1. Check if the server is running.
2. Verify that the client is connecting to the correct URL.
3. Check if there are any firewall or network issues.
4. Ensure that the `PORT` environment variable is set correctly.

### Socket.IO Connection Issues

If Socket.IO is not connecting:

1. Check the browser console for errors.
2. Verify that the Socket.IO version in the client matches the server.
3. Ensure CORS is properly configured on the server.
4. Check if the server is behind a proxy or load balancer that might be affecting WebSocket connections.

## Important Notes

- When deploying, make sure the `static/js/config.js` file is properly configured.
- The default configuration uses the same origin for the Socket.IO connection when deployed.
- If you're deploying the client and server separately, you'll need to update the `CONFIG.SERVER.URL` in `static/js/config.js`. 