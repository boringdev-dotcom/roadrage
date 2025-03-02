# RoadRage

A multiplayer bike racing game inspired by Road Rash, built with Python, Three.js, and HTML.

## Features

- Multiplayer racing with friends or random players
- 3D graphics powered by Three.js
- Lightweight design for smooth performance
- Combat mechanics similar to Road Rash
- Various bikes and tracks to choose from

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

1. Start the server:
   ```
   python server/app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

3. To play with friends, create a private room and share the room code.

## Game Controls

- **W / Up Arrow**: Accelerate
- **S / Down Arrow**: Brake
- **A / D or Left/Right Arrow**: Steer
- **Space**: Jump
- **Left Mouse Button**: Punch
- **Right Mouse Button**: Kick
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