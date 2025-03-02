// Game Controls Class
class GameControls {
    constructor() {
        // Control state
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            leftButton: false,
            rightButton: false
        };
        this.gamepad = null;
        
        // Control values
        this.throttle = 0;
        this.brake = 0;
        this.steering = 0;
        this.jump = false;
        this.punch = false;
        this.kick = false;
        
        // Bind methods
        this.setupKeyboardControls = this.setupKeyboardControls.bind(this);
        this.setupMouseControls = this.setupMouseControls.bind(this);
        this.setupGamepadControls = this.setupGamepadControls.bind(this);
        this.updateGamepadState = this.updateGamepadState.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.getState = this.getState.bind(this);
        
        // Initialize controls
        this.init();
    }
    
    init() {
        this.setupKeyboardControls();
        this.setupMouseControls();
        this.setupGamepadControls();
    }
    
    setupKeyboardControls() {
        // Add event listeners for keyboard
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }
    
    setupMouseControls() {
        // Add event listeners for mouse
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
    }
    
    setupGamepadControls() {
        // Check for gamepad support
        if (navigator.getGamepads) {
            // Add event listeners for gamepad
            window.addEventListener('gamepadconnected', (e) => {
                console.log(`Gamepad connected: ${e.gamepad.id}`);
                this.gamepad = e.gamepad;
            });
            
            window.addEventListener('gamepaddisconnected', (e) => {
                console.log(`Gamepad disconnected: ${e.gamepad.id}`);
                this.gamepad = null;
            });
            
            // Check for existing gamepads
            const gamepads = navigator.getGamepads();
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i]) {
                    this.gamepad = gamepads[i];
                    console.log(`Gamepad already connected: ${this.gamepad.id}`);
                    break;
                }
            }
        }
    }
    
    handleKeyDown(event) {
        // Store key state
        this.keys[event.code] = true;
        
        // Prevent default for game control keys
        if (this.isGameControlKey(event.code)) {
            event.preventDefault();
        }
    }
    
    handleKeyUp(event) {
        // Clear key state
        this.keys[event.code] = false;
    }
    
    handleMouseMove(event) {
        // Store mouse position
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    }
    
    handleMouseDown(event) {
        // Store mouse button state
        if (event.button === 0) {
            this.mouse.leftButton = true;
        } else if (event.button === 2) {
            this.mouse.rightButton = true;
            
            // Prevent context menu
            event.preventDefault();
        }
    }
    
    handleMouseUp(event) {
        // Clear mouse button state
        if (event.button === 0) {
            this.mouse.leftButton = false;
        } else if (event.button === 2) {
            this.mouse.rightButton = false;
        }
    }
    
    updateGamepadState() {
        // Update gamepad state if available
        if (this.gamepad && navigator.getGamepads) {
            // Get fresh gamepad data
            const gamepads = navigator.getGamepads();
            this.gamepad = gamepads[this.gamepad.index];
            
            if (this.gamepad) {
                // Gamepad axes (analog sticks)
                const leftStickX = this.gamepad.axes[0];  // -1 = left, 1 = right
                const leftStickY = this.gamepad.axes[1];  // -1 = up, 1 = down
                const rightTrigger = this.gamepad.buttons[7].value;  // 0 to 1
                const leftTrigger = this.gamepad.buttons[6].value;   // 0 to 1
                
                // Apply deadzone to analog stick
                const deadzone = 0.1;
                const steeringValue = Math.abs(leftStickX) > deadzone ? leftStickX : 0;
                
                // Update control values from gamepad
                this.throttle = Math.max(this.throttle, rightTrigger);
                this.brake = Math.max(this.brake, leftTrigger);
                this.steering = steeringValue;
                
                // Buttons
                this.jump = this.gamepad.buttons[0].pressed;  // A button
                this.punch = this.gamepad.buttons[2].pressed; // X button
                this.kick = this.gamepad.buttons[3].pressed;  // Y button
            }
        }
    }
    
    isGameControlKey(code) {
        // Check if key is used for game controls
        const gameControlKeys = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'KeyW', 'KeyS', 'KeyA', 'KeyD',
            'Space'
        ];
        
        return gameControlKeys.includes(code);
    }
    
    getState() {
        // Reset control values
        this.throttle = 0;
        this.brake = 0;
        this.steering = 0;
        this.jump = false;
        this.punch = false;
        this.kick = false;
        
        // Update from keyboard
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.throttle = 1;
        }
        
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.brake = 1;
        }
        
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.steering = -1;
        }
        
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.steering = 1;
        }
        
        if (this.keys['Space']) {
            this.jump = true;
        }
        
        // Update from mouse
        if (this.mouse.leftButton) {
            this.punch = true;
        }
        
        if (this.mouse.rightButton) {
            this.kick = true;
        }
        
        // Update from gamepad
        this.updateGamepadState();
        
        // Return control state
        return {
            throttle: this.throttle,
            brake: this.brake,
            steering: this.steering,
            jump: this.jump,
            punch: this.punch,
            kick: this.kick
        };
    }
    
    // Prevent right-click context menu
    disableContextMenu() {
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
} 