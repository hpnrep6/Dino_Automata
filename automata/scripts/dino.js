import { Sprite2D } from "../../z0/graphics/sprite2d.js";
import { TextureManager } from "../../z0/graphics/texturemanager.js";
import { SpriteSheet } from "../../z0/graphics/spritesheet.js";
import { getMouseX, getMouseY, isDown } from "../../z0/input/mouse.js";
import { isKeyDown } from "../../z0/input/key.js";
import *  as VAR from '../../z0/var.js'
import { angleTo, distance } from "../../z0/math/math2d.js";
import { Player } from "./player.js";
import { AARectangle } from "../../z0/physics/primitives/aarectcollider.js";

export class Dino extends Sprite2D {
    static SPEED = 40;

    static width = 150;
    static height = 300;

    static spritesheet;

    static PATH_DESTROY_WIDTH = 30;

    collider;

    hp = 200;

    hurtCounter = 0;
    stunCounter = 0;

    velX = 0;
    velY = 0;


    static initSpriteSheet() {
        this.spritesheet = new SpriteSheet(TextureManager.player);

        let width = 24;

        let startY = 512 - 24*2 - 8;

        for(let i = 0; i < 512; i += width) {
            this.spritesheet.createFrame(i,startY, width, width);
        }

        for(let i = 0; i < width * 8; i += width) {
            this.spritesheet.createFrame(i + 1,startY + width + 1, width, width);
        }
    }

    constructor(x, y) {
        super(null, TextureManager.player, x, y, Dino.width * 2, Dino.height, 0, 10, Dino.spritesheet);
        this.collider = new DinoCol(this);
    }

    lastX = 0;
    lastY = 0;

    animTimer = 0;
    animIndex = 0;
    animMax = 6;
    animStart = 4;

    dying = 0;

    dead = false;
    dieOnce = false;
    vel = 0;
    
    _update(delta) {
        this.animTimer -= delta;

        if(this.dying > 0) {
            if(this.dying <= 0.5) {
                if(!this.dieOnce) {
                    this.animStart = 24;
                    this.animMax = 6;
                    this.animIndex = 0;
                    this.animTimer = 0;
                    this.dieOnce = true;
                    this.setSprite(25);
                }
                this.vel += delta * 12;
                this.setY(this.getY() + this.vel);

                this.dying -= delta;
                if(this.dying <= 0) {
                    this.dead = true;
                }
                return;
            }
            this.dying -= delta;
        } else if(this.dead) {
            return;
        }
        else if(this.animTimer < 0) {
            this.animIndex++;
            this.animIndex %= this.animMax;

            this.setSprite(this.animStart + this.animIndex);

            this.animTimer = 0.1;
        }

        if(this.hurtCounter > 0) {
            this.hurtCounter -= delta;
            this.stunCounter -= delta;
            if(this.stunCounter > 0) {
                this.setSprite(15)
                return;
            }
            this.setSprite(14)
        }

        if(distance(Player.playerX, this.xLoc, Player.playerY, this.yLoc) < 5) {
            return;
        }

        let speed = Dino.SPEED * delta;

        let angle = angleTo(this.xLoc, Player.playerX, this.yLoc, Player.playerY);

        this.velX = speed * Math.cos(angle);
        this.velY = speed * Math.sin(angle);

        this.setLoc(this.getX() + this.velX, this.getY() - this.velY)
        

        let intX = Math.floor(this.xLoc);
        let intY = Math.floor(this.yLoc);
        
        // Only update if at new position

        if(intX != this.astX || intY != this.lastY) {
            let path = this.getParent().path;
            
            for(let i = this.xLoc - Dino.PATH_DESTROY_WIDTH; i < this.xLoc + Dino.PATH_DESTROY_WIDTH; i += 15) {
                for(let j = this.yLoc - Dino.PATH_DESTROY_WIDTH; j < this.yLoc + Dino.PATH_DESTROY_WIDTH; j += 15) {
                    path.destroyPath(i, j + 150)
                }
            }

            this.lastX = intX;
            this.lastY = intY;
        }

        if(this.velX < 0) {
            this.setSize(-Dino.width * 2, Dino.height)

        } else if(this.velX > 0) {
            this.setSize(Dino.width * 2, Dino.height)
 
        }     
        console.log(this.hp)
    }

    damage(dmg) {
        if(this.dead) return;

        this.hp -= dmg;

        if(this.hp < 0) {
            this.dying = 1;
        }

        this.hurtCounter = 0.5;
        this.stunCounter = 0.2;
    }
}

export class DinoCol extends AARectangle {
    parent;
    constructor(parent) {
        super(parent, 0, 0, 0, Dino.width / 2, Dino.height / 2, [0, 1], []);
        this.parent = parent;
    }

    damage(dmg) {
        this.parent.damage(dmg);
    }
}