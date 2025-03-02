// Player Class
class Player {
    constructor(id, name, bikeType = 'default') {
        this.id = id;
        this.name = name;
        this.bikeType = bikeType;
        this.bike = null;
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.speed = 0;
        this.health = 100;
        this.lap = 1;
        this.checkpoint = 0;
        this.finished = false;
        this.finishTime = 0;
        this.ready = false;
        this.isCurrentPlayer = false;
    }

    setBike(bike) {
        this.bike = bike;
    }

    update(data) {
        if (data.position) {
            this.position = data.position;
            if (this.bike) {
                this.bike.setPosition(this.position);
            }
        }

        if (data.rotation) {
            this.rotation = data.rotation;
            if (this.bike) {
                this.bike.setRotation(this.rotation);
            }
        }

        if (data.speed !== undefined) {
            this.speed = data.speed;
        }

        if (data.health !== undefined) {
            this.health = data.health;
        }

        if (data.lap !== undefined) {
            this.lap = data.lap;
        }

        if (data.checkpoint !== undefined) {
            this.checkpoint = data.checkpoint;
        }

        if (data.finished !== undefined) {
            this.finished = data.finished;
        }

        if (data.finishTime !== undefined) {
            this.finishTime = data.finishTime;
        }
    }

    getPosition() {
        return this.position;
    }

    getRotation() {
        return this.rotation;
    }

    getSpeed() {
        return this.speed;
    }

    getHealth() {
        return this.health;
    }

    getLap() {
        return this.lap;
    }

    getCheckpoint() {
        return this.checkpoint;
    }

    isFinished() {
        return this.finished;
    }

    getFinishTime() {
        return this.finishTime;
    }

    setReady(ready) {
        this.ready = ready;
    }

    isReady() {
        return this.ready;
    }
} 