import { Sprite2D } from "../../z0/graphics/sprite2d.js";
import { TextureManager } from "../../z0/graphics/texturemanager.js";
import { SpriteSheet } from "../../z0/graphics/spritesheet.js";
import { getMouseX, getMouseY, isDown } from "../../z0/input/mouse.js";
import { isKeyDown } from "../../z0/input/key.js";
import *  as VAR from '../../z0/var.js'
import { angleTo } from "../../z0/math/math2d.js";
import { Player } from "./player.js";
import { AARectangle } from "../../z0/physics/primitives/aarectcollider.js";

export class Dino extends Sprite2D{
    static SPEED = 20;

    static width = 50;
    static height = 50;

    static spritesheet;

    collider;

    hp = 200;

    hurtCounter = 0;

    static initSpriteSheet() {
        this.spritesheet = new SpriteSheet(TextureManager.player);
        this.spritesheet.createFrame(20,20, 2, 2);
    }

    constructor(x, y) {
        super(null, TextureManager.player, x, y, Player.width, Player.height, 0, 10, Player.spritesheet);
        this.collider = new DinoCol(this);
    }

    _update(delta) {
        let speed = Dino.SPEED * delta;

        let angle = angleTo(this.xLoc, Player.playerX, this.yLoc, Player.playerY);

        this.setLoc(this.getX() + speed * Math.cos(angle), this.getY() - speed * Math.sin(angle))
        
        if(this.hurtCounter > 0) {
            this.hurtCounter -= delta;
            this.setRot(0.78)
        } else {
            this.setRot(0)
        }
    }

    damage(dmg) {
        this.hp -= dmg;
        this.hurtCounter = 0.2;
    }
}

export class DinoCol extends AARectangle {
    parent;
    constructor(parent) {
        super(parent, 0, 0, 0, Dino.width, Dino.height, [0, 1], []);
        this.parent = parent;
    }

    damage(dmg) {
        this.parent.damage(dmg);
    }
}