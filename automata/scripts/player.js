import { Sprite2D } from "../../z0/graphics/sprite2d.js";
import { TextureManager } from "../../z0/graphics/texturemanager.js";
import { SpriteSheet } from "../../z0/graphics/spritesheet.js";
import { getMouseX, getMouseY, isDown } from "../../z0/input/mouse.js";
import { isKeyDown } from "../../z0/input/key.js";
import *  as VAR from '../../z0/var.js'
import { angleTo } from "../../z0/math/math2d.js";

export class Player extends Sprite2D{
    static SPEED = 100;

    static width = 50;
    static height = 50;

    static spritesheet;

    static maxX;
    static maxY;

    static initSpriteSheet() {
        this.spritesheet = new SpriteSheet(TextureManager.player);
        this.spritesheet.createFrame(20,20, 2, 2);

        this.maxX = VAR.canvas.width;
        this.maxY = VAR.canvas.height;

        Bullet.initSpriteSheet();
    }

    constructor(x, y) {
        super(null, TextureManager.player, x, y, Player.width, Player.height, 0, 10, Player.spritesheet);
    }

    _update(delta) {
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

            new Bullet(this.xLoc, this.yLoc, angleTo(this.xLoc, xTarg,this.yLoc, yTarg))
        }

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

    constructor(x, y, rot) {
        super(null, TextureManager.player, x, y, Bullet.width, Bullet.height, rot, 10, Bullet.spritesheet);
    }

    _update(delta) {
        this.move(Bullet.SPEED * delta);

        if(this.getX() > Bullet.maxX || this.getX() < -Bullet.MAX_EXPAND ||
           this.getY() > Bullet.maxX || this.getY() < -Bullet.MAX_EXPAND) {
               this.removeSelf();
               return;
           }
    }
}