import { Main, Menu } from '../../index.js';
import { SpriteSheet } from '../../z0/graphics/spritesheet.js';
import { Sprite2D } from '../../z0/graphics/sprite2d.js';
import *  as VAR from '../../z0/var.js'
import { TextureManager } from '../../z0/graphics/texturemanager.js';
import { Module } from '../../z0/tree/module.js';
import { BitmapText } from '../fonts/bitmaptext.js';
import { AARectangle } from '../../z0/physics/primitives/aarectcollider.js';
import { isDown } from '../../z0/input/mouse.js';

export class UI extends Sprite2D {
    static spritesheet;

    /**
     * 0 Back
     * 1 Next
     * 2 Start
     * 3 Menu
     * 4 Instru
     * 5 Return
     * 6 Time
     * 7 Tyme
     * 8 Nani
     * 
     */
    static initSpriteSheet() {
        this.spritesheet = new SpriteSheet(TextureManager.menu);

        let s = this.spritesheet;

        let w = 128;

        for(let i = 0; i < 4; i++) {
            s.createFrame(0, i * w, 3 * w, w);
        }

        s.createFrame(0, 4 * w, 4 * w, w);
        s.createFrame(0, 5 * w, 3 * w, w);

        let nw = 5 * w;

        for(let i = 0; i < 3; i++) {
            s.createFrame(nw, i * 3 * w, 5 * w, 3 * w);
        }

        s.createFrame(10 * w, 0, 6 * w, 6 * w);
        s.createFrame(10 * w, 6 * w, 6 * w, 6 * w);
        s.createFrame(10 * w, 6 * w, 6 * w, 6 * w);
        s.createFrame(0, 9 * w, 6 * w, 6 * w);
    }

    collider;

    constructor(x, y, w, h, i) {
        super(null, TextureManager.menu, x, y, w, h, 0, 5, UI.spritesheet);

        this.setSprite(i);
        this.collider = new UICol(this, x, y, w, h)
    }

    hover = false;
    colliding = false;

    _update(delta) {
        if(this.colliding) {
            this.onHover();
            if(isDown()) {
                this.onPress();
            }
        }
        this.colliding = false;
    }

    onHover() {

    }

    onPress() {

    }
}

class UICol extends AARectangle {
    constructor(p, x, y, w, h) {
        super(p, 0, 0, 0, w / 2, h / 2, [], [0]);
    }
    
    _onCollision(body) {
        this.parent.colliding = true;
    }
}

/**
 * 0 Back
 * 1 Next
 * 2 Start
 * 3 Menu
 * 4 Instru
 * 5 Return
 * 6 Time
 * 7 Tyme
 * 8 Nani
 * 
 */

export class Start extends UI {
    y
    acc = 0;
    w
    h
    hover = false;
    constructor(x, y, w, h) {
        super(x, y, w, h, 2)
        this.y = y;
        this.w = w;
        this.h = h;
    }

    _update(delta) {
        super._update(delta);
        this.acc += delta;

        this.setY(this.y + Math.cos(this.acc) * 5)

        if(this.hover) this.setSize(this.w * 1.2, this.h * 1.2)
        else this.setSize(this.w, this.h)
        
        this.hover = false;
    }

    onHover() {
        this.hover =true;
    
    }
}

export class Instructions extends UI {
    y
    acc = 0;
    w
    h
    hover = false;

    constructor(x, y, w, h) {
        super(x, y, w, h, 4)
        this.y = y;
        this.w = w;
        this.h = h;
    }

    _update(delta) {
        super._update(delta);
        this.acc += delta;

        this.setY(this.y + Math.cos(this.acc) * 5)

        if(this.hover) this.setSize(this.w * 1.2, this.h * 1.2)
        else this.setSize(this.w, this.h)
        
        this.hover = false;
    }

    onHover() {
        this.hover =true;
    
    }
}

export class Title extends UI {
    y
    acc = 0;
    w
    h
    hover = false;

    constructor(x, y, w, h) {
        super(x, y, w, h, Main.party)
        this.y = y;
        this.w = w;
        this.h = h;
    }

    _update(delta) {
        super._update(delta);
        this.acc += delta;

        this.setY(this.y + Math.sin(this.acc) * 5)

        if(this.hover) this.setSize(this.w * 1.2, this.h * 1.2)
        else this.setSize(this.w, this.h)
        
        this.hover = false;
    }

    onHover() {
        this.hover =true;
    
    }
}