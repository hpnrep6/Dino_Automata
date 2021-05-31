import { TextureManager } from './texturemanager.js';

export class SpriteSheet {
    constructor(image) {
        switch(true) {
            case typeof image === 'object':
                this.image = {
                    width: image.width,
                    height: image.height
                };
                break;
            case typeof image === 'number':
                let fullimage = TextureManager.getImage(image);
                this.image = {
                    width: fullimage.width,
                    height: fullimage.height
                };
                break;
        }
        this.frames = [];
    }

    createFrame(x, y, width, height) {
        return this.frames.push(new Frame({
            x: x,
            y: y,
            width: width,
            height: height
        }, this.image)) - 1;
    }

    getFrame(index) {
        return this.frames[index].default;
    }

    getFrameReflectedH(index) {
        return this.frames[index].hReflected;
    }

    getFrameReflectedV(index) {
        return this.frames[index].vReflected;
    }

    getFrameCount() {
        return this.frames.length;
    }
}

class Frame {
    constructor(sprite, image) {
        this.default = this._createSprite(sprite, image);
        this.hReflected = this._createSpriteReflectedH(sprite, image);
        this.vReflected = this._createSpriteReflectedV(sprite, image);
    }

    _createSprite(sprite, image) {

        let x = sprite.x / image.width;
        let y = sprite.y / image.height;
        let w = x + sprite.width / image.width;
        let h = y + sprite.height / image.height;

        // Texture coordinates
        return new Float32Array([
            w, h, // T R
            w, y, // B R
            x, h, // T L
            x, h, // T L
            w, y, // B R
            x, y  // B L
        ]);
    }

    _createSpriteReflectedH(sprite, image) {
        let x = sprite.x / image.width;
        let y = sprite.y / image.height;
        let w = x + sprite.width / image.width;
        let h = y + sprite.height / image.height;

        return new Float32Array([
            x, h,
            x, y,
            w, h,
            w, h,
            x, y,
            w, y
        ])
    }

    _createSpriteReflectedV(sprite, image) {
        let x = sprite.x / image.width;
        let y = sprite.y / image.height;
        let w = x + sprite.width / image.width;
        let h = y + sprite.height / image.height;

        return new Float32Array([
            w, y, 
            w, h, 
            x, y, 
            x, y, 
            w, h, 
            x, h  
        ])
    }
}