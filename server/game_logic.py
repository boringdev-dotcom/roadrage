import math
import time
import numpy as np

class BikePhysics:
    def __init__(self, bike_type='default'):
        # Bike specifications based on type
        self.bike_specs = {
            'default': {
                'max_speed': 120,  # km/h
                'acceleration': 8,  # km/h/s
                'handling': 0.8,    # 0-1 scale
                'weight': 180,      # kg
                'durability': 100   # health points
            },
            'sport': {
                'max_speed': 150,
                'acceleration': 12,
                'handling': 0.7,
                'weight': 160,
                'durability': 80
            },
            'cruiser': {
                'max_speed': 100,
                'acceleration': 6,
                'handling': 0.6,
                'weight': 220,
                'durability': 120
            }
        }
        
        self.bike_type = bike_type
        self.specs = self.bike_specs.get(bike_type, self.bike_specs['default'])
        
        # Current state
        self.position = {'x': 0, 'y': 0, 'z': 0}
        self.rotation = {'x': 0, 'y': 0, 'z': 0}
        self.velocity = {'x': 0, 'y': 0, 'z': 0}
        self.speed = 0  # km/h
        self.health = self.specs['durability']
        self.last_update_time = time.time()
    
    def update(self, controls, delta_time):
        """
        Update bike physics based on controls and time delta
        
        Args:
            controls: Dict with keys 'throttle', 'brake', 'steering'
                - throttle: 0 to 1 (0 = no throttle, 1 = full throttle)
                - brake: 0 to 1 (0 = no brake, 1 = full brake)
                - steering: -1 to 1 (-1 = full left, 1 = full right)
            delta_time: Time in seconds since last update
        """
        # Calculate acceleration based on throttle and brake
        throttle = controls.get('throttle', 0)
        brake = controls.get('brake', 0)
        steering = controls.get('steering', 0)
        
        # Calculate acceleration (km/h/s)
        acceleration = throttle * self.specs['acceleration']
        deceleration = brake * self.specs['acceleration'] * 1.5  # Braking is stronger than acceleration
        
        # Apply friction/drag (simplified)
        drag = 0.01 * self.speed
        
        # Calculate new speed
        speed_change = (acceleration - deceleration - drag) * delta_time
        self.speed = max(0, min(self.specs['max_speed'], self.speed + speed_change))
        
        # Convert km/h to m/s for position calculations
        speed_ms = self.speed / 3.6
        
        # Calculate direction vector based on rotation
        direction_x = math.sin(self.rotation['y'])
        direction_z = math.cos(self.rotation['y'])
        
        # Update position
        self.position['x'] += direction_x * speed_ms * delta_time
        self.position['z'] += direction_z * speed_ms * delta_time
        
        # Update rotation based on steering
        steering_factor = steering * self.specs['handling'] * (0.5 + 0.5 * (self.speed / self.specs['max_speed']))
        self.rotation['y'] += steering_factor * delta_time * 2
        
        # Normalize rotation
        self.rotation['y'] = self.rotation['y'] % (2 * math.pi)
        
        # Update velocity
        self.velocity['x'] = direction_x * speed_ms
        self.velocity['z'] = direction_z * speed_ms
        
        # Update last update time
        self.last_update_time = time.time()
        
        return {
            'position': self.position,
            'rotation': self.rotation,
            'speed': self.speed,
            'health': self.health
        }
    
    def apply_damage(self, amount):
        """Apply damage to the bike"""
        self.health = max(0, self.health - amount)
        return self.health
    
    def check_collision(self, other_bike):
        """Check if this bike collides with another bike"""
        # Simple distance-based collision detection
        dx = self.position['x'] - other_bike.position['x']
        dz = self.position['z'] - other_bike.position['z']
        distance = math.sqrt(dx*dx + dz*dz)
        
        # Collision threshold (bike width + some margin)
        collision_threshold = 2.0
        
        return distance < collision_threshold
    
    def handle_combat_action(self, action_type):
        """Handle combat action effects"""
        damage = 0
        speed_penalty = 0
        
        if action_type == 'punch':
            damage = 10
            speed_penalty = 5
        elif action_type == 'kick':
            damage = 15
            speed_penalty = 10
        
        self.health = max(0, self.health - damage)
        self.speed = max(0, self.speed - speed_penalty)
        
        return {
            'damage': damage,
            'speed_penalty': speed_penalty,
            'health': self.health,
            'speed': self.speed
        }

class Track:
    def __init__(self, track_id='track1'):
        self.track_id = track_id
        
        # Track specifications
        self.tracks = {
            'track1': {
                'length': 5000,  # meters
                'width': 10,     # meters
                'checkpoints': [
                    {'position': {'x': 0, 'y': 0, 'z': 0}},
                    {'position': {'x': 1000, 'y': 0, 'z': 0}},
                    {'position': {'x': 1000, 'y': 0, 'z': 1000}},
                    {'position': {'x': 0, 'y': 0, 'z': 1000}},
                ],
                'obstacles': [
                    {'position': {'x': 500, 'y': 0, 'z': 0}, 'type': 'rock'},
                    {'position': {'x': 800, 'y': 0, 'z': 200}, 'type': 'car'},
                    {'position': {'x': 300, 'y': 0, 'z': 800}, 'type': 'oil'}
                ]
            },
            'track2': {
                'length': 8000,
                'width': 12,
                'checkpoints': [
                    {'position': {'x': 0, 'y': 0, 'z': 0}},
                    {'position': {'x': 2000, 'y': 0, 'z': 0}},
                    {'position': {'x': 2000, 'y': 0, 'z': 2000}},
                    {'position': {'x': 0, 'y': 0, 'z': 2000}},
                ],
                'obstacles': [
                    {'position': {'x': 1000, 'y': 0, 'z': 0}, 'type': 'rock'},
                    {'position': {'x': 1500, 'y': 0, 'z': 500}, 'type': 'car'},
                    {'position': {'x': 500, 'y': 0, 'z': 1500}, 'type': 'oil'}
                ]
            }
        }
        
        self.spec = self.tracks.get(track_id, self.tracks['track1'])
    
    def check_checkpoint(self, position, checkpoint_index):
        """Check if a bike has passed a checkpoint"""
        checkpoint = self.spec['checkpoints'][checkpoint_index]
        
        # Simple distance-based checkpoint detection
        dx = position['x'] - checkpoint['position']['x']
        dz = position['z'] - checkpoint['position']['z']
        distance = math.sqrt(dx*dx + dz*dz)
        
        # Checkpoint threshold
        checkpoint_threshold = 10.0
        
        return distance < checkpoint_threshold
    
    def check_finish(self, position, last_checkpoint_index):
        """Check if a bike has finished the race"""
        return last_checkpoint_index >= len(self.spec['checkpoints']) - 1 and self.check_checkpoint(position, 0)
    
    def check_obstacle_collision(self, position):
        """Check if a bike collides with an obstacle"""
        for obstacle in self.spec['obstacles']:
            dx = position['x'] - obstacle['position']['x']
            dz = position['z'] - obstacle['position']['z']
            distance = math.sqrt(dx*dx + dz*dz)
            
            # Obstacle threshold
            obstacle_threshold = 3.0
            
            if distance < obstacle_threshold:
                return obstacle
        
        return None 