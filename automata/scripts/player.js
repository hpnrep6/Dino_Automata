import { Sprite2D } from "../../z0/graphics/sprite2d.js";
import { TextureManager } from "../../z0/graphics/texturemanager.js";
import { SpriteSheet } from "../../z0/graphics/spritesheet.js";
import { getMouseX, getMouseY, isDown } from "../../z0/input/mouse.js";
import { isKeyDown } from "../../z0/input/key.js";
import *  as VAR from '../../z0/var.js'
import { angleTo } from "../../z0/math/math2d.js";
import { AARectangle } from "../../z0/physics/primitives/aarectcollider.js";
import { Main } from "../../index.js";

export class Player extends Sprite2D{
    static SPEED = 100;
    static DELAY = 0.2;

    static col_width = 25;
    static col_height = 25;

    static width = 25;
    static height = 25;

    static spritesheet;

    static maxX;
    static maxY;

    static playerX = 0;
    static playerY = 0;

    static initSpriteSheet() {
        this.spritesheet = new SpriteSheet(TextureManager.player);
        this.spritesheet.createFrame(20,20, 2, 2);

        this.maxX = VAR.canvas.width;
        this.maxY = VAR.canvas.height;

        Bullet.initSpriteSheet();
    }

    velX = 0;
    velY = 0;

    isColliding = false;

    fireDelay = 0;

    lastX = 0;
    lastY = 0;

    constructor(x, y) {
        super(null, TextureManager.player, x, y, Player.width, Player.height, 0, 10, Player.spritesheet);

        new PlayerCol(this);

        this.lastX = this.xLoc;
        this.lastY = this.yLoc;
    }

    _update(delta) {
        Player.playerX = this.xLoc;
        Player.playerY = this.yLoc;

        let speed = Player.SPEED * delta;
        let mX = false, mY = false;
        let x = 0, y = 0;

        if(isKeyDown('a')) {
            x =  -1
            mX = true;
        }
        if(isKeyDown('d')) {
            x = 1
            mX = true;
        }
        if(isKeyDown('w')) {
            y = -1
            mY = true;
        }
        if(isKeyDown('s')) {
            y = 1;
            mY = true;
        }

        if(mX && mY) {
            speed /= 1.41;
        }

        if(mX || mY) {
            this.velX = speed * x;
            this.velY = speed * y;
        } else {
            this.velX /= 1 + delta * 10;
            this.velY /= 1 + delta * 10;
        }

        this.setLoc(Math.min(Math.max(this.getX() + this.velX, 0), Player.maxX), Math.min(Math.max(this.getY() + this.velY, 0), Player.maxY));

        if(isDown() && this.fireDelay <= 0) {

            let xTarg = getMouseX();
            let yTarg = getMouseY();

            new Bullet(this.xLoc, this.yLoc, angleTo(this.xLoc, xTarg, this.yLoc, yTarg), this.velX, this.velY);
            this.fireDelay = Player.DELAY;

        } else {
            this.fireDelay -= delta;
        }

        if(this.isColliding) {
            this.setRot(0.78)
            this.isColliding = false;
        } else {
            this.setRot(0)
        }

        let intX = Math.floor(this.xLoc);
        let intY = Math.floor(this.yLoc);
        
        // Only update if at new position

        if(intX != this.lastX || intY != this.lastY) {
            let grid = this.getParent().grid;
            
            if(!this.getParent().path.getTileAt(intX, intY)) {
                grid.setValueAt(intX, intY, Math.floor(Math.random() * 151) % 4);
                this.getParent().path.setAlpha(0.7)
            } else {
                this.getParent().path.setAlpha(1)
            }

            this.lastX = intX;
            this.lastY = intY;
        }
    }
}

export class PlayerCol extends AARectangle {
    parent;
    constructor(parent) {
        super(parent, 0, 0, 0, Player.col_width, Player.col_height, [], [0]);
        this.parent = parent;
    }

    _onCollision(body) {
        this.parent.isColliding = true;
    }
}

class Bullet extends Sprite2D {
    static SPEED = 500;
    static MAX_EXPAND = 20;

    static width = 5;
    static height = 5;

    static spritesheet;

    static maxX;
    static maxY;

    static initSpriteSheet() {
        this.spritesheet = new SpriteSheet(TextureManager.player);
        this.spritesheet.createFrame(20,20, 2, 2);

        this.maxX = VAR.canvas.width + Bullet.MAX_EXPAND;
        this.maxY = VAR.canvas.height + Bullet.MAX_EXPAND;
    }

    damage = 20;
    hasCollided;
    velX = 0
    velY = 0

    constructor(x, y, rot, vX, vY) {
        super(null, TextureManager.player, x, y, Bullet.width, Bullet.height, rot, 10, Bullet.spritesheet);

        new BulletCol(this);
        this.velX = vX;
        this.velY = vY;
    }

    _update(delta) {
        if(this.hasCollided) {
            this.removeSelf();
            return;
        }

        this.move(Bullet.SPEED * delta);
        this.setLoc(this.xLoc + this.velX, this.yLoc + this.velY);

        if(this.getX() > Bullet.maxX || this.getX() < -Bullet.MAX_EXPAND ||
           this.getY() > Bullet.maxX || this.getY() < -Bullet.MAX_EXPAND) {
               this.removeSelf();
               return;
        }
    }
}

export class BulletCol extends AARectangle {
    parent;
    constructor(parent) {
        super(parent, 0, 0, 0, Bullet.width, Bullet.height, [], [1]);
        this.parent = parent;
    }

    _onCollision(body) {
        body.damage(body.damage);
        this.parent.hasCollided = true;
    }
}