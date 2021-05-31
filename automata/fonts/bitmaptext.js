import { Sprite2D } from '../../z0/graphics/sprite2d.js';
import { Module } from '../../z0/tree/module.js';
import { TextureManager } from '../../z0/graphics/texturemanager.js';
import { SpriteSheet } from '../../z0/graphics/spritesheet.js';

export class BitmapText extends Module {
    chars = [];

    constructor(parent, xLoc, yLoc, bitmap, fontWidth, fontHeight, textWidth, textHeight, zLoc, gap = 0, spacing = 5) {
        super(parent, xLoc, yLoc, 0);

        this.fWidth = fontWidth;
        this.fHeight = fontHeight;

        this.texture = bitmap;

        this.spacing = spacing;

        this.image = TextureManager.getImage(bitmap);
        
        this.fontMap = new SpriteSheet(bitmap);

        for(let y = 0; y < this.image.height - fontHeight; y += fontHeight + gap) {
            for(let x = 0; x < this.image.width - fontWidth; x += fontWidth + gap) {
                this.fontMap.createFrame(x, y, fontWidth , fontHeight);
            }
        }

        this.xLoc = xLoc;
        this.yLoc = yLoc;

        this.tWidth = textWidth;
        this.tHeight = textHeight;

        this.zLoc = zLoc;
    }

    setChar(char, index) {
        let code = char.charCodeAt(0);

        if(this.chars[index] === undefined)
  
        this.chars[index] = new Char(
            this, code, 
            this.texture, this.fontMap, 
            index * (this.tWidth - this.spacing), 0, 
            this.tWidth, this.tHeight, this.zLoc
        );

        else {
            this.chars[index].set(code)
            this.chars[index].show();
        }
    }

    setString(string) {
        for(let i = 0; i < string.length; i++) {
            this.setChar(string.charAt(i), i);
        }

        for(let i = string.length; i < this.chars.length; i++) {
            this.chars[i].hide();
        }
    }
}

class Char {
    index = 0;

    constructor(parent, c, bmp, spriteSheet, xOff, yOff, w, h, z) {

        this.spriteSheet = spriteSheet;

        this.index = this.getIndexFromChar(c);

        this.sprite = new Sprite2D(parent, bmp, xOff, yOff, w, h, 0, z, spriteSheet);

        this.sprite.setSprite(this.index);
    }

    getIndexFromChar(c) {
        if(c >= 32 && c <= 47) {
            return c - 32 + 62;
        }

        if(c >= 48 && c <= 57) {
            return c - 48;
        }

        if(c >= 65 && c <= 90) {
            return c - 65 + 10;
        }

        if(c >= 97 && c <= 122) {
            return c - 97 + 36;
        }

        // If not in bitmap
        return 0;
    }

    set(char) {
        let index = this.getIndexFromChar(char);

        this.sprite.setSprite(index);
    }

    hide() {
        this.sprite.setVisible(false);
    }

    show() {
        this.sprite.setVisible(true);
    }
}