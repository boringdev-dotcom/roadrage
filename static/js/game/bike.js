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
        // Create bike chassis with more realistic geometry
        const bikeGroup = new THREE.Group();
        
        // Main frame
        const frameGeometry = new THREE.BoxGeometry(0.2, 0.1, 1.8);
        const frameMaterial = new THREE.MeshPhongMaterial({ 
            color: this.getBikeColor(),
            shininess: 70
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 0.6;
        frame.castShadow = true;
        
        // Fuel tank
        const tankGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.6);
        const tankMaterial = new THREE.MeshPhongMaterial({ 
            color: this.getBikeColor(),
            shininess: 90
        });
        const tank = new THREE.Mesh(tankGeometry, tankMaterial);
        tank.position.set(0, 0.75, -0.2);
        tank.castShadow = true;
        
        // Engine block
        const engineGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.4);
        const engineMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            shininess: 60
        });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.set(0, 0.5, 0);
        engine.castShadow = true;
        
        // Seat
        const seatGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.7);
        const seatMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x111111,
            shininess: 30
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(0, 0.75, 0.4);
        seat.castShadow = true;
        
        // Exhaust pipe
        const exhaustGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2);
        const exhaustMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x999999,
            shininess: 100
        });
        const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
        exhaust.position.set(0.2, 0.4, 0.3);
        exhaust.rotation.z = Math.PI / 2;
        exhaust.castShadow = true;
        
        // Add all parts to the bike group
        bikeGroup.add(frame);
        bikeGroup.add(tank);
        bikeGroup.add(engine);
        bikeGroup.add(seat);
        bikeGroup.add(exhaust);
        
        this.chassis = bikeGroup;
        this.object.add(this.chassis);
    }
    
    createWheels() {
        // Create more detailed wheels
        const wheelRadius = 0.4;
        const wheelThickness = 0.1;
        
        // Wheel geometry and materials
        const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 24);
        const wheelMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x222222,
            shininess: 30
        });
        
        const tireMaterial = new THREE.MeshPhongMaterial({
            color: 0x111111,
            shininess: 10
        });
        
        // Front wheel with spokes
        this.frontWheel = new THREE.Group();
        
        // Tire
        const frontTire = new THREE.Mesh(wheelGeometry, tireMaterial);
        frontTire.rotation.x = Math.PI / 2;
        frontTire.castShadow = true;
        
        // Hub
        const hubGeometry = new THREE.CylinderGeometry(0.1, 0.1, wheelThickness + 0.02, 16);
        const hubMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            shininess: 80
        });
        const frontHub = new THREE.Mesh(hubGeometry, hubMaterial);
        frontHub.rotation.x = Math.PI / 2;
        
        // Add spokes
        const spokeCount = 8;
        const spokeMaterial = new THREE.MeshBasicMaterial({ color: 0xCCCCCC });
        
        for (let i = 0; i < spokeCount; i++) {
            const spokeGeometry = new THREE.BoxGeometry(0.02, 0.02, wheelRadius * 0.9);
            const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
            spoke.rotation.z = (Math.PI * 2 / spokeCount) * i;
            spoke.position.y = 0;
            frontHub.add(spoke);
        }
        
        this.frontWheel.add(frontTire);
        this.frontWheel.add(frontHub);
        this.frontWheel.position.set(0, 0.4, -0.8);
        
        // Rear wheel (similar to front)
        this.rearWheel = new THREE.Group();
        
        // Tire
        const rearTire = new THREE.Mesh(wheelGeometry, tireMaterial);
        rearTire.rotation.x = Math.PI / 2;
        rearTire.castShadow = true;
        
        // Hub
        const rearHub = new THREE.Mesh(hubGeometry, hubMaterial);
        rearHub.rotation.x = Math.PI / 2;
        
        // Add spokes
        for (let i = 0; i < spokeCount; i++) {
            const spokeGeometry = new THREE.BoxGeometry(0.02, 0.02, wheelRadius * 0.9);
            const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
            spoke.rotation.z = (Math.PI * 2 / spokeCount) * i;
            spoke.position.y = 0;
            rearHub.add(spoke);
        }
        
        this.rearWheel.add(rearTire);
        this.rearWheel.add(rearHub);
        this.rearWheel.position.set(0, 0.4, 0.8);
        
        // Add wheels to bike
        this.object.add(this.frontWheel);
        this.object.add(this.rearWheel);
    }
    
    createHandlebar() {
        // Create more detailed handlebar
        const handlebarGroup = new THREE.Group();
        
        // Main bar
        const barGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6);
        const barMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x888888,
            shininess: 80
        });
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.rotation.z = Math.PI / 2;
        
        // Grips
        const gripGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.15);
        const gripMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x222222,
            shininess: 20
        });
        
        const leftGrip = new THREE.Mesh(gripGeometry, gripMaterial);
        leftGrip.position.set(-0.35, 0, 0);
        leftGrip.rotation.z = Math.PI / 2;
        
        const rightGrip = new THREE.Mesh(gripGeometry, gripMaterial);
        rightGrip.position.set(0.35, 0, 0);
        rightGrip.rotation.z = Math.PI / 2;
        
        // Headlight
        const headlightGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const headlightMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            shininess: 100,
            emissive: 0x888888
        });
        const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlight.position.set(0, 0, -0.1);
        
        // Add all parts to handlebar group
        handlebarGroup.add(bar);
        handlebarGroup.add(leftGrip);
        handlebarGroup.add(rightGrip);
        handlebarGroup.add(headlight);
        
        handlebarGroup.position.set(0, 0.9, -0.7);
        
        this.handlebar = handlebarGroup;
        this.object.add(this.handlebar);
    }
    
    createRider() {
        // Create a more realistic rider
        const riderGroup = new THREE.Group();
        
        // Rider color based on bike type
        const riderColor = this.getBikeColor() === 0xFF0000 ? 0x0000FF : 
                           this.getBikeColor() === 0x0000FF ? 0xFF0000 : 
                           0x00FF00;
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFD700,  // Helmet color
            shininess: 100
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.5, 0.1);
        head.castShadow = true;
        
        // Visor
        const visorGeometry = new THREE.BoxGeometry(0.2, 0.08, 0.1);
        const visorMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x111111,
            shininess: 100,
            transparent: true,
            opacity: 0.7
        });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.set(0, 1.5, 0.2);
        head.add(visor);
        
        // Torso
        const torsoGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.2);
        const torsoMaterial = new THREE.MeshPhongMaterial({ 
            color: riderColor,
            shininess: 30
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.set(0, 1.2, 0.2);
        torso.rotation.x = Math.PI / 6;  // Lean forward
        torso.castShadow = true;
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.1);
        const armMaterial = new THREE.MeshPhongMaterial({ 
            color: riderColor,
            shininess: 30
        });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.25, 1.1, 0);
        leftArm.rotation.z = -Math.PI / 6;
        leftArm.rotation.x = Math.PI / 4;
        leftArm.castShadow = true;
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.25, 1.1, 0);
        rightArm.rotation.z = Math.PI / 6;
        rightArm.rotation.x = Math.PI / 4;
        rightArm.castShadow = true;
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
        const legMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x0a0a0a,  // Dark pants
            shininess: 20
        });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.15, 0.8, 0.3);
        leftLeg.rotation.x = Math.PI / 3;  // Bent knee
        leftLeg.castShadow = true;
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.15, 0.8, 0.3);
        rightLeg.rotation.x = Math.PI / 3;  // Bent knee
        rightLeg.castShadow = true;
        
        // Add all parts to rider group
        riderGroup.add(head);
        riderGroup.add(torso);
        riderGroup.add(leftArm);
        riderGroup.add(rightArm);
        riderGroup.add(leftLeg);
        riderGroup.add(rightLeg);
        
        // Position rider on bike
        riderGroup.position.set(0, 0, 0);
        
        this.rider = riderGroup;
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
        
        // Return bike data for other systems to use
        return {
            position: this.position,
            rotation: this.rotation,
            velocity: this.velocity,
            speed: this.speed,
            health: this.health
        };
    }
    
    applyDamage(amount) {
        // Rename to takeDamage for consistency
        return this.takeDamage(amount);
    }
    
    takeDamage(amount) {
        // Reduce health by damage amount
        this.health = Math.max(0, this.health - amount);
        
        // Apply speed penalty based on damage
        const speedPenalty = amount / 100; // 10 damage = 10% speed reduction
        this.speed *= (1 - speedPenalty);
        
        // Apply visual damage effect to bike model if available
        if (this.applyVisualDamage) {
            this.applyVisualDamage(this.health);
        }
        
        console.log(`Bike took ${amount} damage. Health: ${this.health}`);
        
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
        // Create bike object
        this.object = new THREE.Group();
        
        // Create bike parts using the same methods as the main player
        this.createChassis();
        this.createWheels();
        this.createHandlebar();
        this.createRider();
        
        // Add bike to scene
        this.scene.add(this.object);
        
        return this.object;
    }
    
    createChassis() {
        // Create bike chassis with more realistic geometry
        const bikeGroup = new THREE.Group();
        
        // Main frame
        const frameGeometry = new THREE.BoxGeometry(0.2, 0.1, 1.8);
        const frameMaterial = new THREE.MeshPhongMaterial({ 
            color: this.getBikeColor(),
            shininess: 70
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 0.6;
        frame.castShadow = true;
        
        // Fuel tank
        const tankGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.6);
        const tankMaterial = new THREE.MeshPhongMaterial({ 
            color: this.getBikeColor(),
            shininess: 90
        });
        const tank = new THREE.Mesh(tankGeometry, tankMaterial);
        tank.position.set(0, 0.75, -0.2);
        tank.castShadow = true;
        
        // Engine block
        const engineGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.4);
        const engineMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            shininess: 60
        });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.set(0, 0.5, 0);
        engine.castShadow = true;
        
        // Seat
        const seatGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.7);
        const seatMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x111111,
            shininess: 30
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(0, 0.75, 0.4);
        seat.castShadow = true;
        
        // Exhaust pipe
        const exhaustGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2);
        const exhaustMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x999999,
            shininess: 100
        });
        const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
        exhaust.position.set(0.2, 0.4, 0.3);
        exhaust.rotation.z = Math.PI / 2;
        exhaust.castShadow = true;
        
        // Add all parts to the bike group
        bikeGroup.add(frame);
        bikeGroup.add(tank);
        bikeGroup.add(engine);
        bikeGroup.add(seat);
        bikeGroup.add(exhaust);
        
        this.chassis = bikeGroup;
        this.object.add(this.chassis);
    }
    
    createWheels() {
        // Create more detailed wheels
        const wheelRadius = 0.4;
        const wheelThickness = 0.1;
        
        // Wheel geometry and materials
        const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 24);
        const tireMaterial = new THREE.MeshPhongMaterial({
            color: 0x111111,
            shininess: 10
        });
        
        // Front wheel with spokes
        this.frontWheel = new THREE.Group();
        
        // Tire
        const frontTire = new THREE.Mesh(wheelGeometry, tireMaterial);
        frontTire.rotation.x = Math.PI / 2;
        frontTire.castShadow = true;
        
        // Hub
        const hubGeometry = new THREE.CylinderGeometry(0.1, 0.1, wheelThickness + 0.02, 16);
        const hubMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            shininess: 80
        });
        const frontHub = new THREE.Mesh(hubGeometry, hubMaterial);
        frontHub.rotation.x = Math.PI / 2;
        
        // Add spokes
        const spokeCount = 8;
        const spokeMaterial = new THREE.MeshBasicMaterial({ color: 0xCCCCCC });
        
        for (let i = 0; i < spokeCount; i++) {
            const spokeGeometry = new THREE.BoxGeometry(0.02, 0.02, wheelRadius * 0.9);
            const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
            spoke.rotation.z = (Math.PI * 2 / spokeCount) * i;
            spoke.position.y = 0;
            frontHub.add(spoke);
        }
        
        this.frontWheel.add(frontTire);
        this.frontWheel.add(frontHub);
        this.frontWheel.position.set(0, 0.4, -0.8);
        
        // Rear wheel (similar to front)
        this.rearWheel = new THREE.Group();
        
        // Tire
        const rearTire = new THREE.Mesh(wheelGeometry, tireMaterial);
        rearTire.rotation.x = Math.PI / 2;
        rearTire.castShadow = true;
        
        // Hub
        const rearHub = new THREE.Mesh(hubGeometry, hubMaterial);
        rearHub.rotation.x = Math.PI / 2;
        
        // Add spokes
        for (let i = 0; i < spokeCount; i++) {
            const spokeGeometry = new THREE.BoxGeometry(0.02, 0.02, wheelRadius * 0.9);
            const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
            spoke.rotation.z = (Math.PI * 2 / spokeCount) * i;
            spoke.position.y = 0;
            rearHub.add(spoke);
        }
        
        this.rearWheel.add(rearTire);
        this.rearWheel.add(rearHub);
        this.rearWheel.position.set(0, 0.4, 0.8);
        
        // Add wheels to bike
        this.object.add(this.frontWheel);
        this.object.add(this.rearWheel);
    }
    
    createHandlebar() {
        // Create more detailed handlebar
        const handlebarGroup = new THREE.Group();
        
        // Main bar
        const barGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6);
        const barMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x888888,
            shininess: 80
        });
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.rotation.z = Math.PI / 2;
        
        // Grips
        const gripGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.15);
        const gripMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x222222,
            shininess: 20
        });
        
        const leftGrip = new THREE.Mesh(gripGeometry, gripMaterial);
        leftGrip.position.set(-0.35, 0, 0);
        leftGrip.rotation.z = Math.PI / 2;
        
        const rightGrip = new THREE.Mesh(gripGeometry, gripMaterial);
        rightGrip.position.set(0.35, 0, 0);
        rightGrip.rotation.z = Math.PI / 2;
        
        // Headlight
        const headlightGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const headlightMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            shininess: 100,
            emissive: 0x888888
        });
        const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlight.position.set(0, 0, -0.1);
        
        // Add all parts to handlebar group
        handlebarGroup.add(bar);
        handlebarGroup.add(leftGrip);
        handlebarGroup.add(rightGrip);
        handlebarGroup.add(headlight);
        
        handlebarGroup.position.set(0, 0.9, -0.7);
        
        this.handlebar = handlebarGroup;
        this.object.add(this.handlebar);
    }
    
    createRider() {
        // Create a more realistic rider
        const riderGroup = new THREE.Group();
        
        // Rider color based on bike type
        const riderColor = this.getBikeColor() === 0xFF0000 ? 0x0000FF : 
                           this.getBikeColor() === 0x0000FF ? 0xFF0000 : 
                           0x00FF00;
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFD700,  // Helmet color
            shininess: 100
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.5, 0.1);
        head.castShadow = true;
        
        // Visor
        const visorGeometry = new THREE.BoxGeometry(0.2, 0.08, 0.1);
        const visorMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x111111,
            shininess: 100,
            transparent: true,
            opacity: 0.7
        });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.set(0, 1.5, 0.2);
        head.add(visor);
        
        // Torso
        const torsoGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.2);
        const torsoMaterial = new THREE.MeshPhongMaterial({ 
            color: riderColor,
            shininess: 30
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.set(0, 1.2, 0.2);
        torso.rotation.x = Math.PI / 6;  // Lean forward
        torso.castShadow = true;
        
        // Arms
        const armGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.1);
        const armMaterial = new THREE.MeshPhongMaterial({ 
            color: riderColor,
            shininess: 30
        });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.25, 1.1, 0);
        leftArm.rotation.z = -Math.PI / 6;
        leftArm.rotation.x = Math.PI / 4;
        leftArm.castShadow = true;
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.25, 1.1, 0);
        rightArm.rotation.z = Math.PI / 6;
        rightArm.rotation.x = Math.PI / 4;
        rightArm.castShadow = true;
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
        const legMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x0a0a0a,  // Dark pants
            shininess: 20
        });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.15, 0.8, 0.3);
        leftLeg.rotation.x = Math.PI / 3;  // Bent knee
        leftLeg.castShadow = true;
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.15, 0.8, 0.3);
        rightLeg.rotation.x = Math.PI / 3;  // Bent knee
        rightLeg.castShadow = true;
        
        // Add all parts to rider group
        riderGroup.add(head);
        riderGroup.add(torso);
        riderGroup.add(leftArm);
        riderGroup.add(rightArm);
        riderGroup.add(leftLeg);
        riderGroup.add(rightLeg);
        
        // Position rider on bike
        riderGroup.position.set(0, 0, 0);
        
        this.rider = riderGroup;
        this.object.add(this.rider);
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