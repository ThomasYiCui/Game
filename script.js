var canvas = document.getElementById("canvi");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var mouseX = 0;
var mouseY = 0;
var dragged = false;
var clicked = false
var keys = [];
var targetX = Math.random() * canvas.width;
var targetY = Math.random() * canvas.height;
function keysPressed(e) {
  keys[e.keyCode] = true;
  e.preventDefault();
}
function keysReleased(e) {
  keys[e.keyCode] = false;
}
ctx.textAlign = "center";

canvas.addEventListener("mousemove", function(e) {
    var cRect = canvas.getBoundingClientRect();
    mouseX = Math.round(e.clientX - cRect.left);
    mouseY = Math.round(e.clientY - cRect.top);
});
canvas.addEventListener("mousedown", function(e) {
    dragged = true;
}, false);
canvas.addEventListener("mouseup", function(e) {
    if(dragged === true) {
        clicked = true;
        dragged = false;
    }
}, false);
window.addEventListener("keydown", keysPressed, false);
window.addEventListener("keyup", keysReleased, false);

function constrain(num, min, max) {
  return Math.max(Math.min(num, max), min)
}
function random(min, max) {
  return Math.random(0, 1) * max + min
}

function dist(x, y, x2, y2) {
    var a = x - x2;
    var b = y - y2;
    return Math.sqrt(a * a + b * b);
}

// Thanks to Neon for letting me use his code. His project is down below. Most of the work was done by him I just created vision, alignment, coherence, and seperation.

// greens have a bias towards the mouse. Reds don't have a bias
// adjust parameters for different results or just reload the program
var boidCount = 150; // how much boids there are
var minSpeed = 3; // minimum speed of the boids. Here so they have to move.
var maxSpeed = 6;// maximum speed of the boids.
var vision = 100; // how much a boid can see. They will apply the rules to those they can see.
var alignment = 50; // boids will try to go in the same directions as nearby boids. Adjust to control the strength
var coherence = 50; // boids will try to steer toward the center of mass of the other boids.
var seperation = 50; // boids will try to seperate themselves from other boids
var seperationDist = 30; // how close will a boids have to be before they try to seperate themselves.


angleMode = 'degrees';
var Boid = function (x, y, color) {
    this.pos = new PVector(x, y);
    this.vel = new PVector(random(-30, 30), random(-30, 30));
    this.acc = new PVector(0,0);
    this.color = color;
    this.maxSpeed = maxSpeed;
    this.minSpeed = minSpeed;
    this.maxForce = 0.1;
    this.r = 4;
    this.boidsNearMe = 0;
    this.boidsAvgVel = new PVector(0, 0);
    this.boidsAvgPos = new PVector(0, 0);
    this.boidsClose = new PVector(0, 0);
};

Boid.prototype.update = function () {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    var speed = sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
    if(speed < this.minSpeed) {
        this.vel.x*=3;
        this.vel.y*=3;
    }
    this.pos.add(this.vel);
    this.acc.mult(0);
    if(this.pos.x <= 50) {
        this.vel.x+=0.5;
    }
    if(this.pos.x >= 550) {
        this.vel.x-=0.5;
    }
    if(this.pos.y <= 50) {
        this.vel.y+=0.5;
    }
    if(this.pos.y >= 550) {
        this.vel.y-=0.5;
    }
    if(this.color === color(0, 255, 0)) {
        this.vel.x+=lerp(this.vel.x, mouseX - this.pos.x, 0.01)/5;
        this.vel.y+=lerp(this.vel.y, mouseY - this.pos.y, 0.01)/5;
    }
    if(this.boidsNearMe > 0) {
        this.boidsAvgVel.x/=this.boidsNearMe;
        this.boidsAvgVel.y/=this.boidsNearMe;
        this.boidsAvgPos.x/=this.boidsNearMe;
        this.boidsAvgPos.y/=this.boidsNearMe;
        this.vel.x+=(this.boidsAvgVel.x - this.vel.x) * alignment/1000;
        this.vel.y+=(this.boidsAvgVel.y - this.vel.y) * alignment/1000;
        this.vel.x+=(this.boidsAvgPos.x - this.pos.x) * coherence/ 10000;
        this.vel.y+=(this.boidsAvgPos.y - this.pos.y) * coherence/ 10000;
    }
    this.vel.x+=this.boidsClose.x * seperation/10000;
    this.vel.y+=this.boidsClose.y * seperation/10000;
    this.boidsAvgVel.x = 0;
    this.boidsAvgVel.y = 0;
    this.boidsAvgPos.x = 0;
    this.boidsAvgPos.y = 0;
    this.boidsClose.x = 0;
    this.boidsClose.y = 0;
    this.boidsNearMe = 0;
};
Boid.prototype.applyForce = function (f) {
    this.acc.add(f);
};
Boid.prototype.display = function () {
    var theta = 90 + this.vel.heading();
    ctx.fillStyle = this.color;
    ctx.beginShape();
    ctx.moveTo(this.pos.x, this.pos.y + Math.sin(theta) * -this.r*2);
    ctx.lineTo(this.pos.x + Math.cos(theta) * -this.r, this.pos.y + Math.sin(theta) * this.r*2);
    ctx.lineTo(this.pos.x + Math.cos(theta) * this.r, this.pos.y + Math.sin(theta) * this.r*2);
    ctx.closePath();
    ctx.fill();
};
Boid.prototype.collide = function (target, align, cohese, seperate) {
    var dis = dist(target.pos.x, target.pos.y, this.pos.x, this.pos.y);
    if(dis < vision) {
        if(dis < seperationDist) {
            if(seperate) {
                this.boidsClose.x+=this.pos.x - target.pos.x;
                this.boidsClose.y+=this.pos.y - target.pos.y;
            }
        } else {
            if(this.color === target.color) {
                if(align) {
                    this.boidsAvgVel.x+=target.vel.x;
                    this.boidsAvgVel.y+=target.vel.y;
                }
                if(cohese) {
                    this.boidsAvgPos.x+=target.pos.x;
                    this.boidsAvgPos.y+=target.pos.y;
                }
                this.boidsNearMe+=1;
            }
        }
    }
};

var boidsGroup = [];
for(var i = 0; i < boidCount; i++) {
    if(i % 2 === 0) {
        boidsGroup.push(new Boid(random(mouseX, mouseX), random(mouseY, mouseY), "rgb(0, 255, 0)"));
    } else if(i % 2 === 1) {
        boidsGroup.push(new Boid(random(0, 600), random(0, 600), "rgb(255, 0, 0)"));
    }
}
setInterval(function() {
    ctx.fillStyle = "rgb(38, 38, 38)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for(var i = 0; i < boidsGroup.length; i+=1) {
        boidsGroup[i].display(color(0, 255, 0));
        boidsGroup[i].update();
        for(var j = 0; j < boidsGroup.length; j++) {
            if(i !== j) {
                boidsGroup[i].collide(boidsGroup[j], true, true, true);
            }
        }
        
    }
}, 15)

// THE TABLE
