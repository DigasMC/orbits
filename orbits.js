const __G = 0.0006;

class Vector {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    toString() {
        return `X: ${this._x} | Y: ${this._y}`;
    }

    setX(x) {
        this._x = x;
    }

    setY(y) {
        this._y = y;
    }

    setVector(x, y) {
        this._x = x;
        this._y = y;
    }

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }

    add(vector) {
        if(!(vector instanceof Vector)) {
            return Error("Vector should be of type Vector");
        }

        return new Vector(this.getX() + vector.getX(), this.getY() + vector.getY())
    }

    multiply(int) {
        return new Vector(this.getX() * int, this.getY() * int);
    }

    distanceFrom(vector) {
        if(!(vector instanceof Vector)) {
            return Error("Vector should be of type Vector");
        }

        let _a = vector.getX() - this.getX()
        let _b = vector.getY() - this.getY()
        return Math.sqrt((_a * _a) + (_b * _b));
    }

    normalize() {
        let n = Math.sqrt(this._x*this._x + this._y*this._y)
        return new Vector(this._x / n, this._y / n)
    }

    equals(vector) {
        if(!(vector instanceof Vector)) {
            return Error("Vector should be of type Vector");
        }

        return this.getX() == vector.getX() && this.getY == vector.getY()
    }
}

class CelestialBody {
    constructor(mass, radius, pos = new Vector(0, 0), color = "#964B00") {
        this._id = Math.random();
        this._m = mass;     //mass
        this._r = radius;   //radius
        this._v = new Vector(0, 0);        //velocity
        this._a = new Vector(0, 0);        //acceleration
        this._color = color;
        this._trail = [];

        if(!(pos instanceof Vector)) {
            return Error("Vector should be of type Vector");
        }
        this._pos = pos;
    }

    equals(c) {
        return c instanceof CelestialBody && c._id == this._id;
    }

    getId() {
        return this._id;
    }

    getMass() {
        return this._m;
    }

    setMass(mass) {
        this._m = mass
    }

    getRadius() {
        return this._r;
    }

    getDensity() {
        return this._m / (2 * Math.PI * this._r * this._r);
    }

    getVelocity() {
        return this._v;
    }

    setVelocity(vector) {
        if(!(vector instanceof Vector)) {
            return Error("velocity should be of type Vector");
        }

        this._v = vector;
    }

    getAcceleration() {
        return this._a;
    }

    setAcceleration(vector) {
        if(!(vector instanceof Vector)) {
            return Error("acceleration should be of type Vector");
        }

        this._a = vector;
    }

    getPos() {
        return this._pos;
    }

    setPos(x, y) {
        this._pos.setVector(x, y);
        if(this._trail.length == 0 || !this._trail[this._trail.length - 1].equals(this._pos)) {
            this._trail.push(new Vector(x, y));
        }
        if(this._trail.length > 300) {
            this._trail.shift()
        }
    }

    getColor() {
        return this._color;
    }

    getTrail() {
        return this._trail;
    }

    colidesWith(c) {
        if(!(c instanceof CelestialBody)) {
            return Error("c should be of type CelestialBody");
        }

        return this.getPos().distanceFrom(c.getPos()) < this.getRadius() + c.getRadius();
    }

    gravityVector(...bodies) {
        let t = this
        let _gv = new Vector(0, 0);
        bodies.forEach(function(b, index) {
            if(b instanceof CelestialBody) {
                if(! (t.equals(b))) {
                    let F = __G * ((t.getMass() * b.getMass()) / (t.getPos().distanceFrom(b.getPos())^2));
                    let v = new Vector();
                    let a = F / t.getMass();
                    v.setVector(b.getPos().getX() - t.getPos().getX(), b.getPos().getY() - t.getPos().getY());
                    let g = _gv.add(new Vector(v.normalize().getX() * a, v.normalize().getY() * a))
                    _gv.setVector(g.getX(), g.getY());
                }
            } else {
                return Error(`Item in index ${index} is not a CelestialBody`)
            }
        })

        return _gv;
    }

}

class FixedCelestialBody extends CelestialBody {
    constructor(mass, radius, pos = new Vector(0, 0), color = "#964B00") {
        super(mass, radius, pos, color)
    }

    gravityVector() {
        return new Vector(0, 0);
    }

    getAcceleration() {
        return new Vector(0, 0);
    }

    getVelocity() {
        return new Vector(0, 0);
    }
}



class Game {

    constructor () {
        let canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'absolute';
        canvas.style.inset = 0;
        document.body.appendChild(canvas);

        this._el = document.getElementById('canvas');
        this._ctx = this._el.getContext('2d');
        this._celestials = [];
        this._path = [];
        this._iteractables = [];

        this._lag = [0, 0, 0];
        this._lastFrame = 0;
        this._running = false;

        window.addEventListener('resize', () => {
            this._el.width = window.innerWidth;
            this._el.height = window.innerHeight;
        })
    }


    addCelestial(cel) {
        if(cel instanceof CelestialBody) {
            this._celestials.push(cel);
        } else {
            return Error("element to add shoul be a CelestialBody")
        }
    }

   getAvgLag() {
        let sum = 0
        for(let l in this._lag) {
            sum = sum + this._lag[l];
        }

        return sum / this._lag.length;
    }

    getFPS() {
        return this._running ?  Math.floor(1000 / this.getAvgLag()) : 0;
    }

    resetDraw() {
        this._ctx.fillStyle = "#000";
        this._ctx.fillRect(0, 0, this._el.width, this._el.height);
    }

    draw() {
        let d = Date.now()
        if(this._lastFrame == 0) {
            this._lastFrame = d
        }
        this._lag.push(d - this._lastFrame)
        this._lag.splice(0, 1);
        this._lastFrame = d
        this.resetDraw();
        this._ctx.fillStyle = "#FFF"
        this._ctx.fillText(`FPS: ${this.getFPS()}`, 10, 20)
        for(let c in this._celestials) {
            // draw celestial
            this._ctx.beginPath();
            this._ctx.arc(
                this._celestials[c].getPos().getX(),
                this._celestials[c].getPos().getY(),
                this._celestials[c].getRadius(),
                2 * Math.PI,
                false
            );

            this._ctx.fillStyle = this._celestials[c].getColor();
            this._ctx.fill();

            
            
            let trail =  this._celestials[c].getTrail()
            for(let t in trail) {
                this._ctx.beginPath()
                this._ctx.arc(
                    trail[t].getX(),
                    trail[t].getY(),
                    2,
                    2 * Math.PI,
                    false
                );
                this._ctx.fillStyle = `rgba(255, 255, 255, ${(t / 100)})`;
                this._ctx.fill();
            }

            

            // draw forces
            this._ctx.beginPath()
            this._ctx.strokeStyle = "#fff";
            this._ctx.moveTo(this._celestials[c].getPos().getX(), this._celestials[c].getPos().getY())
            let forceVec = this._celestials[c].getPos().add(this._celestials[c].gravityVector(...this._celestials).multiply(30))
            this._ctx.lineTo(forceVec.getX(), forceVec.getY())
            this._ctx.stroke()
        }
    }

    
    iterate() {
        if(this._running) return -1

        this._running = true;

        this._itvl = setInterval(
            () => {
                let celestialsToDelete = []
                let partialSecond = this.getAvgLag() / 1000;

                if(this._celestials.length == 0) this.stop()

                for(let c in this._celestials) {
                    let addedAcceleration = new Vector(0, 0)
                    //detect collisions
                    for(let c2 in this._celestials) {
                        if (!this._celestials[c].equals(this._celestials[c2])) {
                            if(this._celestials[c].colidesWith(this._celestials[c2])) {
                                if(this._celestials[c].getMass() > this._celestials[c2].getMass()) {
                                    celestialsToDelete.push(this._celestials[c2].getId())
                                    let a = this._celestials[c2].getVelocity().multiply(this._celestials[c2].getMass() / this._celestials[c].getMass())
                                    addedAcceleration.setVector(a.getX(), a.getY())
                                    this._celestials[c].setMass(this._celestials[c].getMass() + this._celestials[c2].getMass())
                                }
                            }
                        }
                    }

                    // move
                    this._celestials[c].setAcceleration(this._celestials[c].gravityVector(...this._celestials).add(addedAcceleration))
                    this._celestials[c].setVelocity(this._celestials[c].getVelocity().add(this._celestials[c].getAcceleration()))
                    let p = this._celestials[c].getPos().add(this._celestials[c].getVelocity().multiply(partialSecond))
                    this._celestials[c].setPos(p.getX(), p.getY())
                }

                const cloneCelestials = [...this._celestials]


                // deletes engulfed celestials
                for(let i = cloneCelestials.length - 1; i >= 0; i--) {
                    if(celestialsToDelete.includes(cloneCelestials[i].getId())) {
                        this._celestials.splice(i, 1);
                    }
                }

                this.draw()
            }, 1
        )
    }

    stop() {
        clearInterval(this._itvl)
        this._running = false;
        this._lag = [0, 0, 0]
        this._lastFrame = 0;
        this.draw()
        this._lastFrame = 0;
    }


}

class Level {

}

let game = new Game()

let c1 = new CelestialBody(25000, 10, new Vector(900, 300))
c1.setVelocity(new Vector(300, 0))
let c2 = new FixedCelestialBody(400000, 20, new Vector(600, 500), true)
let c3 = new CelestialBody(3000, 7, new Vector(800, 300))
c3.setVelocity(new Vector(-10, 180))


game.addCelestial(c1)
game.addCelestial(c2)
game.addCelestial(c3)

game.draw()
game.iterate()

const stop = () => {
    game.stop()
}


const play = () => {
    game.iterate()
}