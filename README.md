# RoadRage

A multiplayer bike racing game inspired by Road Rash, built with Python, Three.js, and HTML.

## Play Online

You can play the game directly in your browser without installation:

**[Play RoadRage Online](https://roadrage.onrender.com/)**

The online version runs in offline mode, which means you can play without a server connection, but multiplayer features will be simulated.

## Multiplayer Deployment

To play with friends in different countries, you need to deploy the server component to a cloud platform. Here are instructions for a few popular options:

### Deploying to Heroku

1. Create a [Heroku](https://www.heroku.com/) account
2. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. Login to Heroku:
   ```
   heroku login
   ```
4. Create a new Heroku app:
   ```
   heroku create your-roadrage-app-name
   ```
5. Push your code to Heroku:
   ```
   git push heroku master
   ```
6. Open your deployed app:
   ```
   heroku open
   ```

### Deploying to Render

1. Create a [Render](https://render.com/) account
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the build command: `pip install -r requirements.txt`
5. Set the start command: `python server/app.py`
6. Deploy your application

### Deploying to Railway

1. Create a [Railway](https://railway.app/) account
2. Create a new project from GitHub
3. Connect your repository
4. Railway will automatically detect your Python app and deploy it

After deploying, update the WebSocket connection URL in your client code to point to your deployed server.

## Features

- Multiplayer racing with friends or random players
- 3D graphics powered by Three.js
- Lightweight design for smooth performance
- Combat mechanics similar to Road Rash
- Various bikes and tracks to choose from
- Offline mode for playing without a server

## Requirements

- Python 3.7+
- Modern web browser with WebGL support

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/roadrage.git
   cd roadrage
   ```

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

## Running the Game

### Online Mode (with Server)

1. Start the server:
   ```
   python server/app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

3. To play with friends, create a private room and share the room code.

### Offline Mode

You can play the game without running a server by opening:
```
test-game.html
```

This mode simulates multiplayer functionality but doesn't require a network connection.

## Game Controls

- **W / Up Arrow**: Accelerate
- **S / Down Arrow**: Brake
- **A / D or Left/Right Arrow**: Steer
- **Space**: Jump
- **E**: Punch
- **Q**: Kick
- **T**: Open Chat
- **Esc**: Pause Game

## Multiplayer Features

- Public matchmaking with random players
- Private rooms to play with friends
- In-game chat
- Real-time position updates
- Combat interactions between players

## Development

The project structure is organized as follows:

- `/server` - Python backend code using Flask and Socket.IO
- `/static` - Static assets (JS, CSS, models, textures)
  - `/static/js` - JavaScript files
    - `/static/js/game` - Core game mechanics
  - `/static/css` - CSS stylesheets
  - `/static/models` - 3D models
  - `/static/textures` - Textures and images
- `/templates` - HTML templates

## Technologies Used

- **Backend**: Python with Flask and Socket.IO
- **Frontend**: HTML, CSS, JavaScript
- **3D Graphics**: Three.js
- **Networking**: WebSockets for real-time multiplayer functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the classic game Road Rash
- Built with Three.js for 3D graphics
- Uses Socket.IO for real-time multiplayer functionality