// Track Class
class Track {
    constructor(scene, trackId = 'track1') {
        this.scene = scene;
        this.trackId = trackId;
        
        // Track specifications
        this.tracks = {
            'track1': {
                name: 'City Circuit',
                length: 5000,  // meters
                width: 10,     // meters
                checkpoints: [
                    { position: { x: 0, y: 0, z: 0 } },
                    { position: { x: 1000, y: 0, z: 0 } },
                    { position: { x: 1000, y: 0, z: 1000 } },
                    { position: { x: 0, y: 0, z: 1000 } }
                ],
                obstacles: [
                    { position: { x: 500, y: 0, z: 0 }, type: 'rock' },
                    { position: { x: 800, y: 0, z: 200 }, type: 'car' },
                    { position: { x: 300, y: 0, z: 800 }, type: 'oil' }
                ]
            },
            'track2': {
                name: 'Mountain Pass',
                length: 8000,
                width: 12,
                checkpoints: [
                    { position: { x: 0, y: 0, z: 0 } },
                    { position: { x: 2000, y: 0, z: 0 } },
                    { position: { x: 2000, y: 0, z: 2000 } },
                    { position: { x: 0, y: 0, z: 2000 } }
                ],
                obstacles: [
                    { position: { x: 1000, y: 0, z: 0 }, type: 'rock' },
                    { position: { x: 1500, y: 0, z: 500 }, type: 'car' },
                    { position: { x: 500, y: 0, z: 1500 }, type: 'oil' }
                ]
            }
        };
        
        // Get track specification
        this.trackSpec = this.tracks[trackId] || this.tracks['track1'];
        
        // Track objects
        this.ground = null;
        this.road = null;
        this.checkpointMarkers = [];
        this.obstacleObjects = [];
        
        // Track state
        this.currentCheckpoint = 0;
        this.lap = 1;
        this.totalLaps = 3;
        this.raceStartTime = 0;
        this.lastLapTime = 0;
        this.bestLapTime = 0;
    }
    
    create() {
        try {
            console.log('Creating track elements');
            
            // Create ground
            this.createGround();
            
            // Create road
            this.createRoad();
            
            // Create checkpoints
            this.createCheckpoints();
            
            // Create obstacles
            this.createObstacles();
            
            // Create environment
            this.createEnvironment();
            
            return this;
        } catch (error) {
            console.error('Error creating track:', error);
            return this;
        }
    }
    
    createGround() {
        if (!this.scene) {
            console.error('Scene is not available for track creation');
            return;
        }
        
        // Create ground plane
        const groundSize = Math.max(
            Math.abs(this.trackSpec.checkpoints[0].position.x - this.trackSpec.checkpoints[2].position.x),
            Math.abs(this.trackSpec.checkpoints[0].position.z - this.trackSpec.checkpoints[2].position.z)
        ) * 2;
        
        try {
            const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
            const groundMaterial = new THREE.MeshPhongMaterial({
                color: 0x336633,  // Green
                side: THREE.DoubleSide
            });
            
            this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
            this.ground.rotation.x = Math.PI / 2;
            this.ground.position.y = -0.1;
            this.ground.receiveShadow = true;
            
            this.scene.add(this.ground);
        } catch (error) {
            console.error('Error creating ground:', error);
        }
    }
    
    createRoad() {
        // Create road segments between checkpoints
        this.road = new THREE.Group();
        
        const checkpoints = this.trackSpec.checkpoints;
        const roadWidth = this.trackSpec.width;
        const roadMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,  // Dark gray
            side: THREE.DoubleSide
        });
        
        // Create road segments
        for (let i = 0; i < checkpoints.length; i++) {
            const start = checkpoints[i].position;
            const end = checkpoints[(i + 1) % checkpoints.length].position;
            
            // Calculate road segment
            const dx = end.x - start.x;
            const dz = end.z - start.z;
            const length = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dx, dz);
            
            // Create road segment
            const roadGeometry = new THREE.PlaneGeometry(roadWidth, length);
            const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
            
            // Position and rotate road segment
            roadSegment.rotation.x = Math.PI / 2;
            roadSegment.rotation.z = angle;
            roadSegment.position.set(
                start.x + dx / 2,
                0,
                start.z + dz / 2
            );
            
            roadSegment.receiveShadow = true;
            
            this.road.add(roadSegment);
        }
        
        this.scene.add(this.road);
    }
    
    createCheckpoints() {
        // Create checkpoint markers
        const checkpoints = this.trackSpec.checkpoints;
        
        for (let i = 0; i < checkpoints.length; i++) {
            const checkpoint = checkpoints[i];
            
            // Create checkpoint marker
            const markerGeometry = new THREE.CylinderGeometry(5, 5, 10, 16, 1, true);
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: i === 0 ? 0xFF0000 : 0x00FF00,  // Red for start/finish, green for others
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(checkpoint.position.x, 5, checkpoint.position.z);
            
            this.checkpointMarkers.push(marker);
            this.scene.add(marker);
        }
    }
    
    createObstacles() {
        // Create obstacles
        const obstacles = this.trackSpec.obstacles;
        
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
            let obstacleObject;
            
            switch (obstacle.type) {
                case 'rock':
                    obstacleObject = this.createRock(obstacle.position);
                    break;
                case 'car':
                    obstacleObject = this.createCar(obstacle.position);
                    break;
                case 'oil':
                    obstacleObject = this.createOilSlick(obstacle.position);
                    break;
                default:
                    continue;
            }
            
            this.obstacleObjects.push(obstacleObject);
            this.scene.add(obstacleObject);
        }
    }
    
    createRock(position) {
        // Create rock obstacle
        const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
        const rockMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            shininess: 10
        });
        
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(position.x, 0.5, position.z);
        rock.castShadow = true;
        rock.receiveShadow = true;
        
        // Add metadata
        rock.userData = {
            type: 'rock',
            collisionRadius: 1.5
        };
        
        return rock;
    }
    
    createCar(position) {
        // Create car obstacle (simplified)
        const carGroup = new THREE.Group();
        
        // Car body
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x2244CC,
            shininess: 30
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        body.receiveShadow = true;
        
        // Car roof
        const roofGeometry = new THREE.BoxGeometry(1.8, 0.8, 2);
        const roofMaterial = new THREE.MeshPhongMaterial({
            color: 0x2244CC,
            shininess: 30
        });
        
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.4;
        roof.position.z = -0.5;
        roof.castShadow = true;
        
        // Car wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({
            color: 0x222222,
            shininess: 30
        });
        
        const wheelPositions = [
            { x: -1, y: 0.4, z: -1.5 },
            { x: 1, y: 0.4, z: -1.5 },
            { x: -1, y: 0.4, z: 1.5 },
            { x: 1, y: 0.4, z: 1.5 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            carGroup.add(wheel);
        });
        
        carGroup.add(body);
        carGroup.add(roof);
        
        // Position car
        carGroup.position.set(position.x, 0, position.z);
        
        // Random rotation
        carGroup.rotation.y = Math.random() * Math.PI * 2;
        
        // Add metadata
        carGroup.userData = {
            type: 'car',
            collisionRadius: 2.5
        };
        
        return carGroup;
    }
    
    createOilSlick(position) {
        // Create oil slick obstacle
        const oilGeometry = new THREE.CircleGeometry(2, 32);
        const oilMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        const oil = new THREE.Mesh(oilGeometry, oilMaterial);
        oil.position.set(position.x, 0.01, position.z);
        oil.rotation.x = -Math.PI / 2;
        
        // Add metadata
        oil.userData = {
            type: 'oil',
            collisionRadius: 2
        };
        
        return oil;
    }
    
    createEnvironment() {
        // Add some environment objects (trees, buildings, etc.)
        this.createTrees();
        this.createBuildings();
    }
    
    createTrees() {
        // Create some trees around the track
        const treeCount = 50;
        const trackBounds = this.getTrackBounds();
        const padding = 20;
        
        for (let i = 0; i < treeCount; i++) {
            // Random position outside the track
            let x, z;
            let isOnRoad = true;
            
            // Keep generating positions until we find one that's not on the road
            while (isOnRoad) {
                x = trackBounds.minX - padding + Math.random() * (trackBounds.maxX - trackBounds.minX + padding * 2);
                z = trackBounds.minZ - padding + Math.random() * (trackBounds.maxZ - trackBounds.minZ + padding * 2);
                
                isOnRoad = this.isPointOnRoad(x, z);
            }
            
            // Create tree
            const tree = this.createTree();
            tree.position.set(x, 0, z);
            this.scene.add(tree);
        }
    }
    
    createTree() {
        // Create a simple tree
        const treeGroup = new THREE.Group();
        
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,  // Brown
            shininess: 5
        });
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        
        // Tree leaves
        const leavesGeometry = new THREE.ConeGeometry(1, 3, 8);
        const leavesMaterial = new THREE.MeshPhongMaterial({
            color: 0x228B22,  // Forest green
            shininess: 10
        });
        
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 3;
        leaves.castShadow = true;
        
        treeGroup.add(trunk);
        treeGroup.add(leaves);
        
        return treeGroup;
    }
    
    createBuildings() {
        // Create some buildings around the track
        const buildingCount = 20;
        const trackBounds = this.getTrackBounds();
        const padding = 30;
        
        for (let i = 0; i < buildingCount; i++) {
            // Random position outside the track
            let x, z;
            let isOnRoad = true;
            
            // Keep generating positions until we find one that's not on the road
            while (isOnRoad) {
                x = trackBounds.minX - padding + Math.random() * (trackBounds.maxX - trackBounds.minX + padding * 2);
                z = trackBounds.minZ - padding + Math.random() * (trackBounds.maxZ - trackBounds.minZ + padding * 2);
                
                isOnRoad = this.isPointOnRoad(x, z, 15);  // Larger buffer for buildings
            }
            
            // Create building
            const building = this.createBuilding();
            building.position.set(x, 0, z);
            building.rotation.y = Math.random() * Math.PI * 2;
            this.scene.add(building);
        }
    }
    
    createBuilding() {
        // Create a simple building
        const height = 5 + Math.random() * 15;
        const width = 5 + Math.random() * 10;
        const depth = 5 + Math.random() * 10;
        
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshPhongMaterial({
            color: 0xAAAAAA,  // Gray
            shininess: 20
        });
        
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        
        return building;
    }
    
    getTrackBounds() {
        // Calculate track bounds
        const checkpoints = this.trackSpec.checkpoints;
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        
        checkpoints.forEach(checkpoint => {
            minX = Math.min(minX, checkpoint.position.x);
            maxX = Math.max(maxX, checkpoint.position.x);
            minZ = Math.min(minZ, checkpoint.position.z);
            maxZ = Math.max(maxZ, checkpoint.position.z);
        });
        
        return { minX, maxX, minZ, maxZ };
    }
    
    isPointOnRoad(x, z, buffer = 10) {
        // Get the track path points
        const checkpoints = this.trackSpec.checkpoints;
        const numCheckpoints = checkpoints.length;
        
        // Check if the point is near any road segment
        for (let i = 0; i < numCheckpoints; i++) {
            const start = checkpoints[i].position;
            const end = checkpoints[(i + 1) % numCheckpoints].position;
            
            // Calculate distance from point to line segment
            const distance = this.distanceToLineSegment(
                { x, z },
                { x: start.x, z: start.z },
                { x: end.x, z: end.z }
            );
            
            // If distance is less than road width + buffer, point is on road
            if (distance <= (this.trackSpec.width / 2) + buffer) {
                return true;
            }
        }
        
        return false;
    }
    
    // Add a new method to calculate distance from point to line segment
    distanceToLineSegment(point, lineStart, lineEnd) {
        const dx = lineEnd.x - lineStart.x;
        const dz = lineEnd.z - lineStart.z;
        
        // If line segment is just a point, return distance to that point
        if (dx === 0 && dz === 0) {
            return Math.sqrt(
                Math.pow(point.x - lineStart.x, 2) + 
                Math.pow(point.z - lineStart.z, 2)
            );
        }
        
        // Calculate projection of point onto line
        const t = ((point.x - lineStart.x) * dx + (point.z - lineStart.z) * dz) / 
                  (dx * dx + dz * dz);
        
        // If projection is outside line segment, return distance to nearest endpoint
        if (t < 0) {
            return Math.sqrt(
                Math.pow(point.x - lineStart.x, 2) + 
                Math.pow(point.z - lineStart.z, 2)
            );
        }
        if (t > 1) {
            return Math.sqrt(
                Math.pow(point.x - lineEnd.x, 2) + 
                Math.pow(point.z - lineEnd.z, 2)
            );
        }
        
        // Calculate closest point on line segment
        const closestX = lineStart.x + t * dx;
        const closestZ = lineStart.z + t * dz;
        
        // Return distance to closest point
        return Math.sqrt(
            Math.pow(point.x - closestX, 2) + 
            Math.pow(point.z - closestZ, 2)
        );
    }
    
    // Add a new method to check if a position is within track boundaries
    isWithinTrackBoundaries(position) {
        // Get track bounds
        const bounds = this.getTrackBounds();
        
        // Add a buffer zone around the track (50 meters)
        const buffer = 50;
        
        // Check if position is within bounds with buffer
        return (
            position.x >= bounds.minX - buffer &&
            position.x <= bounds.maxX + buffer &&
            position.z >= bounds.minZ - buffer &&
            position.z <= bounds.maxZ + buffer
        );
    }
    
    checkCheckpoints(position) {
        // Check if player has passed a checkpoint
        const checkpoint = this.trackSpec.checkpoints[this.currentCheckpoint];
        
        // Simple distance-based checkpoint detection
        const dx = position.x - checkpoint.position.x;
        const dz = position.z - checkpoint.position.z;
        const distance = Math.sqrt(dx*dx + dz*dz);
        
        // Checkpoint threshold
        const checkpointThreshold = 10.0;
        
        // Default result object
        const result = {
            checkpointPassed: false,
            currentCheckpoint: this.currentCheckpoint,
            totalCheckpoints: this.trackSpec.checkpoints.length,
            lapCompleted: false,
            raceFinished: false,
            lapTime: 0
        };
        
        if (distance < checkpointThreshold) {
            // Passed checkpoint
            const oldCheckpoint = this.currentCheckpoint;
            this.currentCheckpoint = (this.currentCheckpoint + 1) % this.trackSpec.checkpoints.length;
            
            // Update result
            result.checkpointPassed = true;
            result.currentCheckpoint = this.currentCheckpoint;
            
            // Check if completed a lap
            if (this.currentCheckpoint === 0) {
                const lapResult = this.completeLap();
                result.lapCompleted = true;
                result.lapTime = lapResult.lapTime;
                result.bestLapTime = lapResult.bestLapTime;
                
                // Check if race is finished
                if (this.lap > this.totalLaps) {
                    result.raceFinished = true;
                }
            }
            
            // Highlight next checkpoint marker
            if (this.checkpointMarkers.length > 0) {
                // Reset previous checkpoint color
                this.checkpointMarkers[oldCheckpoint].material.opacity = 0.3;
                
                // Highlight current checkpoint
                this.checkpointMarkers[this.currentCheckpoint].material.opacity = 0.6;
            }
        }
        
        return result;
    }
    
    completeLap() {
        // Complete a lap
        const currentTime = performance.now();
        const lapTime = currentTime - this.lastLapTime;
        this.lastLapTime = currentTime;
        
        // Update best lap time
        if (this.bestLapTime === 0 || lapTime < this.bestLapTime) {
            this.bestLapTime = lapTime;
        }
        
        // Increment lap counter
        this.lap++;
        
        // Check if race is finished
        if (this.lap > this.totalLaps) {
            this.finishRace();
        }
        
        return {
            lap: this.lap,
            lapTime: lapTime,
            bestLapTime: this.bestLapTime
        };
    }
    
    startRace() {
        try {
            console.log('Starting race on track:', this.trackSpec.name);
            
            // Reset track state
            this.currentCheckpoint = 0;
            this.lap = 1;
            this.raceStartTime = performance.now();
            this.lastLapTime = 0;
            this.bestLapTime = 0;
            
            // Highlight start/finish checkpoint
            if (this.checkpointMarkers.length > 0) {
                // Reset all checkpoint colors
                this.checkpointMarkers.forEach((marker, index) => {
                    marker.material.color.set(index === 0 ? 0xFF0000 : 0x00FF00);
                    marker.material.opacity = 0.3;
                });
                
                // Highlight current checkpoint
                this.checkpointMarkers[0].material.opacity = 0.6;
            }
            
            console.log('Race started successfully');
            return true;
        } catch (error) {
            console.error('Error starting race:', error);
            return false;
        }
    }
    
    finishRace() {
        // Finish the race
        const raceTime = performance.now() - this.raceStartTime;
        
        return {
            totalTime: raceTime,
            bestLapTime: this.bestLapTime
        };
    }
    
    checkObstacleCollisions(position) {
        // Check for collisions with obstacles
        for (let i = 0; i < this.obstacleObjects.length; i++) {
            const obstacle = this.obstacleObjects[i];
            const obstaclePosition = obstacle.position;
            
            // Simple distance-based collision detection
            const dx = position.x - obstaclePosition.x;
            const dz = position.z - obstaclePosition.z;
            const distance = Math.sqrt(dx*dx + dz*dz);
            
            // Collision threshold based on obstacle type
            const collisionThreshold = obstacle.userData.collisionRadius || 2.0;
            
            if (distance < collisionThreshold) {
                return {
                    type: obstacle.userData.type,
                    position: obstaclePosition
                };
            }
        }
        
        return null;
    }
    
    getCurrentCheckpoint() {
        return this.currentCheckpoint;
    }
    
    getCurrentLap() {
        return this.lap;
    }
    
    getTotalLaps() {
        return this.totalLaps;
    }
    
    getRaceTime() {
        return performance.now() - this.raceStartTime;
    }
    
    getNearestPointOnTrack(position) {
        if (!this.trackSpec || !this.trackSpec.checkpoints || this.trackSpec.checkpoints.length < 2) {
            console.error('Track checkpoints not properly defined');
            return null;
        }
        
        let nearestPoint = null;
        let minDistance = Infinity;
        
        // Check distance to each track segment (between checkpoints)
        for (let i = 0; i < this.trackSpec.checkpoints.length; i++) {
            const checkpoint1 = this.trackSpec.checkpoints[i];
            const checkpoint2 = this.trackSpec.checkpoints[(i + 1) % this.trackSpec.checkpoints.length];
            
            // Calculate nearest point on line segment between checkpoints
            const point = this.getNearestPointOnSegment(
                position,
                { x: checkpoint1.position.x, z: checkpoint1.position.z },
                { x: checkpoint2.position.x, z: checkpoint2.position.z }
            );
            
            // Calculate distance to this point
            const dx = position.x - point.x;
            const dz = position.z - point.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            // Update nearest point if this is closer
            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = point;
            }
        }
        
        return nearestPoint;
    }
    
    getNearestPointOnSegment(position, segmentStart, segmentEnd) {
        // Calculate direction vector of segment
        const segmentDirX = segmentEnd.x - segmentStart.x;
        const segmentDirZ = segmentEnd.z - segmentStart.z;
        
        // Calculate squared length of segment
        const segmentLengthSquared = segmentDirX * segmentDirX + segmentDirZ * segmentDirZ;
        
        if (segmentLengthSquared === 0) {
            // Segment is a point, return start point
            return { x: segmentStart.x, z: segmentStart.z };
        }
        
        // Calculate projection of position onto segment
        const posRelativeX = position.x - segmentStart.x;
        const posRelativeZ = position.z - segmentStart.z;
        
        // Calculate dot product
        const dotProduct = posRelativeX * segmentDirX + posRelativeZ * segmentDirZ;
        
        // Calculate normalized projection (t parameter)
        const t = Math.max(0, Math.min(1, dotProduct / segmentLengthSquared));
        
        // Calculate nearest point on segment
        return {
            x: segmentStart.x + t * segmentDirX,
            z: segmentStart.z + t * segmentDirZ
        };
    }
} 