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

    static STATE_MENU = 0;
    static STATE_INSTRU = 1;

    static state = 0;

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
     * 9 Controls
     * 10 Path
     * 11 Prehistoric
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

    constructor(x, y, w, h, i, p = null) {
        super(p, TextureManager.menu, x, y, w, h, 0, 5, UI.spritesheet);

        this.setSprite(i);
        this.collider = new UICol(this, x, y, w, h)
    }

    hover = false;
    colliding = false;
    pressed = false;

    _update(delta) {
        if(this.colliding) {
            this.onHover();
            if(isDown()) {
                if(!this.pressed) {
                    this.onPress();
                    this.pressed = true;
                }
            } else {
                this.pressed = false;
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
 * 9 Controls
 * 10 Path
 * 11 Prehistoric
 */

export class InstructionScreen extends UI {
    index = 9;

    constructor(x, y, w, h) {
        super(x, y, w, h, 9)

        let ww = 340;
        this.next = new InstructionNext(650, 710, ww, ww/3, this);
    }

    nextSlide() {
        this.index++;

        this.setSprite(this.index);
        
    }
}

export class InstructionNext extends UI {
    y
    acc = 0;
    w
    h
    hover = false;
    p
    constructor(x, y, w, h, p) {
        super(x, y, w, h, 1)
        this.y = y;
        this.w = w;
        this.h = h;
        this.p = p;
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

    onPress() {
        if(this.p.index === 10) {
            UI.state = UI.STATE_MENU;
            this.p.removeSelf();
            this.removeSelf();
            return;
        }
        this.p.nextSlide();
        this.setSprite(3)
    }
}

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
        if(UI.state !== UI.STATE_MENU) return;

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
        if(UI.state !== UI.STATE_MENU) return;

        super._update(delta);
        this.acc += delta;

        this.setY(this.y + Math.cos(this.acc) * 5)

        if(this.hover) this.setSize(this.w * 1.2, this.h * 1.2)
        else this.setSize(this.w, this.h)
        
        this.hover = false;
    }

    onPress() {
        UI.state = UI.STATE_INSTRU;
        this.getParent().showInstructions();
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
        if(UI.state !== UI.STATE_MENU) return;

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