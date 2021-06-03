import { Sprite2D } from "../../z0/graphics/sprite2d.js";
import { TextureManager } from "../../z0/graphics/texturemanager.js";
import { SpriteSheet } from "../../z0/graphics/spritesheet.js";
import { getMouseX, getMouseY, isDown } from "../../z0/input/mouse.js";
import { isKeyDown } from "../../z0/input/key.js";
import *  as VAR from '../../z0/var.js'
import { angleTo } from "../../z0/math/math2d.js";
import { AARectangle } from "../../z0/physics/primitives/aarectcollider.js";

export class Player extends Sprite2D{
    static SPEED = 100;

    static width = 50;
    static height = 50;

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

    isColliding = false;

    constructor(x, y) {
        super(null, TextureManager.player, x, y, Player.width, Player.height, 0, 10, Player.spritesheet);

        new PlayerCol(this);
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

        this.setLoc(Math.min(Math.max(this.getX() + speed * x, 0), Player.maxX), Math.min(Math.max(this.getY() + speed * y, 0), Player.maxY))

        if(isDown()) {
            let xTarg = getMouseX();
            let yTarg = getMouseY();

            new Bullet(this.xLoc, this.yLoc, angleTo(this.xLoc, xTarg, this.yLoc, yTarg))
        }

        if(this.isColliding) {
            this.setRot(0.78)
            this.isColliding = false;
        } else {
            this.setRot(0)
        }
    }
}

export class PlayerCol extends AARectangle {
    parent;
    constructor(parent) {
        super(parent, 0, 0, 0, Player.width, Player.height, [], [0]);
        this.parent = parent;
    }

    _onCollision(body) {
        this.parent.isColliding = true;
    }
}

class Bullet extends Sprite2D {
    static SPEED = 200;
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

    constructor(x, y, rot) {
        super(null, TextureManager.player, x, y, Bullet.width, Bullet.height, rot, 10, Bullet.spritesheet);

        new BulletCol(this)
    }

    _update(delta) {
        if(this.hasCollided) {
            this.removeSelf();
            return;
        }

        this.move(Bullet.SPEED * delta);

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