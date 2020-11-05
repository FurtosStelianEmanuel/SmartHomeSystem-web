// Daniel Shiffman
// http://codingtra.in
// Steering Text Paths
// Video: https://www.youtube.com/watch?v=4hA7G3gup-4

function Vehicle(x, y) {
    this.pos = createVector(0, 0);
    this.target = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector();
    this.r = 3;
    this.maxspeed = 15;
    this.maxforce = 0.87;
    this.initialPosition = createVector(0, 0);
}
Vehicle.SCARED_OF_MOUSE = true;
Vehicle.RESTING = false;
Vehicle.prototype.retreat = function() {
    this.target.x = this.initialPosition.x;
    this.target.y = this.initialPosition.y;
}
Vehicle.prototype.behaviors = function() {
    var arrive = this.arrive(this.target);
    var mouse = createVector(mouseX, mouseY);
    var flee = this.flee(mouse);

    arrive.mult(1);
    flee.mult(5);

    this.applyForce(arrive);
    if (Vehicle.SCARED_OF_MOUSE) {
        this.applyForce(flee);
    }
}

Vehicle.prototype.applyForce = function(f) {
    this.acc.add(f);
}

Vehicle.prototype.update = function() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
}

Vehicle.prototype.show = function() {
    stroke(255 - myred, 0, 0);
    strokeWeight(this.r);
    point(this.pos.x, this.pos.y);
}

Vehicle.prototype.arrive = function(target) {
    var desired = p5.Vector.sub(target, this.pos);
    var d = desired.mag();
    var speed = this.maxspeed;
    if (d < 100) {
        speed = map(d, 0, 100, 0, this.maxspeed);
    }
    desired.setMag(speed);
    var steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxforce);
    return steer;
}

Vehicle.prototype.flee = function(target) {
    var desired = p5.Vector.sub(target, this.pos);
    var d = desired.mag();
    if (d < 50) {
        desired.setMag(this.maxspeed);
        desired.mult(-1);
        var steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxforce);
        return steer;
    } else {
        return createVector(0, 0);
    }
}
Vehicle.prototype.clone = function() {
    var v = new Vehicle(this.pos.x, this.pos.y);

    v.pos.x = this.pos.x;
    v.pos.y = this.pos.y;

    v.vel.x = this.vel.x;
    v.vel.y = this.vel.y;

    v.acc.x = this.acc.x;
    v.acc.y = this.acc.y;

    v.initialPosition = this.initialPosition;

    return v;
}
Vehicle.prototype.goHome = function() {
    this.target.x = -1;
    this.target.y = -1;
}