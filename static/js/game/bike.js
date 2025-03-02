// Bike Class
class Bike {
    constructor(scene, bikeType = 'default') {
        this.scene = scene;
        this.bikeType = bikeType;
        
        // Bike specifications based on type
        this.specs = {
            'default': {
                maxSpeed: 120,      // km/h
                acceleration: 8,    // km/h/s
                handling: 0.8,      // 0-1 scale
                weight: 180,        // kg
                durability: 100     // health points
            },
            'sport': {
                maxSpeed: 150,
                acceleration: 12,
                handling: 0.7,
                weight: 160,
                durability: 80
            },
            'cruiser': {
                maxSpeed: 100,
                acceleration: 6,
                handling: 0.6,
                weight: 220,
                durability: 120
            }
        };
        
        // Get specs for this bike type
        this.bikeSpecs = this.specs[bikeType] || this.specs['default'];
        
        // Bike state
        this.object = null;
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.speed = 0;  // km/h
        this.health = this.bikeSpecs.durability;
        this.wheelRotation = 0;
        
        // Bike parts
        this.chassis = null;
        this.frontWheel = null;
        this.rearWheel = null;
        this.handlebar = null;
        this.rider = null;
    }
    
    create() {
        // Create bike object
        this.object = new THREE.Group();
        
        // Create bike parts
        this.createChassis();
        this.createWheels();
        this.createHandlebar();
        this.createRider();
        
        // Add bike to scene
        this.scene.add(this.object);
        
        return this.object;
    }
    
    createChassis() {
        // Create bike chassis (simplified for this example)
        const geometry = new THREE.BoxGeometry(0.8, 0.4, 2);
        const material = new THREE.MeshPhongMaterial({ 
            color: this.getBikeColor(),
            shininess: 50
        });
        
        this.chassis = new THREE.Mesh(geometry, material);
        this.chassis.position.y = 0.6;
        this.chassis.castShadow = true;
        this.chassis.receiveShadow = true;
        
        this.object.add(this.chassis);
    }
    
    createWheels() {
        // Create wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x222222,
            shininess: 30
        });
        
        // Front wheel
        this.frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.frontWheel.position.set(0, 0.4, -0.8);
        this.frontWheel.rotation.x = Math.PI / 2;
        this.frontWheel.castShadow = true;
        this.frontWheel.receiveShadow = true;
        
        // Rear wheel
        this.rearWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.rearWheel.position.set(0, 0.4, 0.8);
        this.rearWheel.rotation.x = Math.PI / 2;
        this.rearWheel.castShadow = true;
        this.rearWheel.receiveShadow = true;
        
        this.object.add(this.frontWheel);
        this.object.add(this.rearWheel);
    }
    
    createHandlebar() {
        // Create handlebar
        const handlebarGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
        const handlebarMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x888888,
            shininess: 80
        });
        
        this.handlebar = new THREE.Mesh(handlebarGeometry, handlebarMaterial);
        this.handlebar.position.set(0, 0.8, -0.7);
        this.handlebar.rotation.z = Math.PI / 2;
        
        this.object.add(this.handlebar);
    }
    
    createRider() {
        // Create simplified rider
        const bodyGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.8);
        const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const riderMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x3366CC,
            shininess: 30
        });
        
        // Body
        const body = new THREE.Mesh(bodyGeometry, riderMaterial);
        body.position.set(0, 1.1, 0);
        body.castShadow = true;
        
        // Head
        const head = new THREE.Mesh(headGeometry, riderMaterial);
        head.position.set(0, 1.6, -0.2);
        head.castShadow = true;
        
        // Create rider group
        this.rider = new THREE.Group();
        this.rider.add(body);
        this.rider.add(head);
        
        this.object.add(this.rider);
    }
    
    getBikeColor() {
        // Return color based on bike type
        switch (this.bikeType) {
            case 'sport':
                return 0xFF0000;  // Red
            case 'cruiser':
                return 0x0000FF;  // Blue
            default:
                return 0x00FF00;  // Green
        }
    }
    
    update(deltaTime, controls) {
        // Log controls input for debugging
        if (Math.random() < 0.01) { // Log occasionally to avoid console spam
            console.log('Bike update - Controls:', controls);
            console.log('Bike update - Current speed:', this.speed);
            console.log('Bike update - Current position:', this.position);
        }
        
        // Check if controls is provided
        if (!controls) {
            console.warn('No controls provided to bike.update()');
            controls = { throttle: 0, brake: 0, steering: 0 };
        }
        
        // Calculate acceleration based on throttle and brake
        const throttle = controls.throttle || 0;
        const brake = controls.brake || 0;
        const steering = controls.steering || 0;
        
        // Calculate acceleration (km/h/s)
        const acceleration = throttle * this.bikeSpecs.acceleration;
        const deceleration = brake * this.bikeSpecs.acceleration * 1.5;  // Braking is stronger than acceleration
        
        // Apply friction/drag (simplified)
        const drag = 0.01 * this.speed;
        
        // Calculate new speed
        const speedChange = (acceleration - deceleration - drag) * deltaTime;
        this.speed = Math.max(0, Math.min(this.bikeSpecs.maxSpeed, this.speed + speedChange));
        
        // Convert km/h to m/s for position calculations
        const speedMs = this.speed / 3.6;
        
        // Calculate direction vector based on rotation
        const directionX = Math.sin(this.rotation.y);
        const directionZ = Math.cos(this.rotation.y);
        
        // Update position
        this.position.x += directionX * speedMs * deltaTime;
        this.position.z += directionZ * speedMs * deltaTime;
        
        // Update rotation based on steering
        const steeringFactor = steering * this.bikeSpecs.handling * (0.5 + 0.5 * (this.speed / this.bikeSpecs.maxSpeed));
        this.rotation.y += steeringFactor * deltaTime * 2;
        
        // Normalize rotation
        this.rotation.y = this.rotation.y % (2 * Math.PI);
        
        // Update velocity
        this.velocity.x = directionX * speedMs;
        this.velocity.z = directionZ * speedMs;
        
        // Update object position and rotation
        this.object.position.set(this.position.x, this.position.y, this.position.z);
        this.object.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        
        // Update wheel rotation based on speed
        this.wheelRotation += speedMs * deltaTime * 5;
        this.frontWheel.rotation.x = Math.PI / 2;
        this.frontWheel.rotation.y = this.wheelRotation;
        this.rearWheel.rotation.x = Math.PI / 2;
        this.rearWheel.rotation.y = this.wheelRotation;
        
        // Update handlebar rotation based on steering
        this.handlebar.rotation.z = Math.PI / 2;
        this.handlebar.rotation.y = steering * 0.5;
        
        // Tilt bike based on steering and speed
        this.object.rotation.z = -steering * 0.2 * (this.speed / this.bikeSpecs.maxSpeed);
    }
    
    applyDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        return this.health;
    }
    
    reset() {
        // Reset bike state
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.speed = 0;
        this.health = this.bikeSpecs.durability;
        this.wheelRotation = 0;
        
        // Update object position and rotation
        this.object.position.set(this.position.x, this.position.y, this.position.z);
        this.object.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    }
}

// Other Player Bike Class (simplified version of Bike)
class OtherPlayerBike {
    constructor(scene, bikeType = 'default') {
        this.scene = scene;
        this.bikeType = bikeType;
        
        // Bike state
        this.object = null;
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.speed = 0;
        this.wheelRotation = 0;
        
        // Bike parts
        this.chassis = null;
        this.frontWheel = null;
        this.rearWheel = null;
        this.handlebar = null;
        this.rider = null;
        
        // Interpolation
        this.targetPosition = { x: 0, y: 0, z: 0 };
        this.targetRotation = { x: 0, y: 0, z: 0 };
        this.interpolationFactor = 0.2;  // 0-1, higher = faster interpolation
    }
    
    create() {
        // Create bike object (simplified version of Bike.create)
        this.object = new THREE.Group();
        
        // Create bike chassis
        const geometry = new THREE.BoxGeometry(0.8, 0.4, 2);
        const material = new THREE.MeshPhongMaterial({ 
            color: this.getBikeColor(),
            shininess: 50
        });
        
        this.chassis = new THREE.Mesh(geometry, material);
        this.chassis.position.y = 0.6;
        this.chassis.castShadow = true;
        this.chassis.receiveShadow = true;
        
        // Create wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x222222,
            shininess: 30
        });
        
        this.frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.frontWheel.position.set(0, 0.4, -0.8);
        this.frontWheel.rotation.x = Math.PI / 2;
        this.frontWheel.castShadow = true;
        
        this.rearWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.rearWheel.position.set(0, 0.4, 0.8);
        this.rearWheel.rotation.x = Math.PI / 2;
        this.rearWheel.castShadow = true;
        
        // Create simplified rider
        const bodyGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.8);
        const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const riderMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xCC3366,  // Different color for other players
            shininess: 30
        });
        
        const body = new THREE.Mesh(bodyGeometry, riderMaterial);
        body.position.set(0, 1.1, 0);
        body.castShadow = true;
        
        const head = new THREE.Mesh(headGeometry, riderMaterial);
        head.position.set(0, 1.6, -0.2);
        head.castShadow = true;
        
        this.rider = new THREE.Group();
        this.rider.add(body);
        this.rider.add(head);
        
        // Add all parts to bike object
        this.object.add(this.chassis);
        this.object.add(this.frontWheel);
        this.object.add(this.rearWheel);
        this.object.add(this.rider);
        
        // Add bike to scene
        this.scene.add(this.object);
        
        return this.object;
    }
    
    getBikeColor() {
        // Return color based on bike type
        switch (this.bikeType) {
            case 'sport':
                return 0xFF6600;  // Orange
            case 'cruiser':
                return 0x6600FF;  // Purple
            default:
                return 0xFFFF00;  // Yellow
        }
    }
    
    setPosition(position) {
        // Set target position for interpolation
        this.targetPosition = { ...position };
    }
    
    setRotation(rotation) {
        // Set target rotation for interpolation
        this.targetRotation = { ...rotation };
    }
    
    update(deltaTime) {
        // Interpolate position and rotation for smooth movement
        this.position.x += (this.targetPosition.x - this.position.x) * this.interpolationFactor;
        this.position.y += (this.targetPosition.y - this.position.y) * this.interpolationFactor;
        this.position.z += (this.targetPosition.z - this.position.z) * this.interpolationFactor;
        
        this.rotation.x += (this.targetRotation.x - this.rotation.x) * this.interpolationFactor;
        this.rotation.y += (this.targetRotation.y - this.rotation.y) * this.interpolationFactor;
        this.rotation.z += (this.targetRotation.z - this.rotation.z) * this.interpolationFactor;
        
        // Update object position and rotation
        this.object.position.set(this.position.x, this.position.y, this.position.z);
        this.object.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        
        // Update wheel rotation based on speed
        this.wheelRotation += (this.speed / 3.6) * deltaTime * 5;
        this.frontWheel.rotation.x = Math.PI / 2;
        this.frontWheel.rotation.y = this.wheelRotation;
        this.rearWheel.rotation.x = Math.PI / 2;
        this.rearWheel.rotation.y = this.wheelRotation;
    }
    
    remove() {
        // Remove bike from scene
        if (this.object && this.scene) {
            this.scene.remove(this.object);
            
            // Dispose geometries and materials
            this.chassis.geometry.dispose();
            this.chassis.material.dispose();
            this.frontWheel.geometry.dispose();
            this.frontWheel.material.dispose();
            this.rearWheel.geometry.dispose();
            this.rearWheel.material.dispose();
            
            // Clear references
            this.object = null;
            this.chassis = null;
            this.frontWheel = null;
            this.rearWheel = null;
            this.rider = null;
        }
    }
} 