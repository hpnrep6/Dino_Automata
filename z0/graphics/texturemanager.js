import * as GLUTILS from '../utils/glutils.js';
import * as VAR from '../var.js';

export class TextureManager {
    static textures = [];

    static gl;
   

    static addTexture(image) {
        let texture;
        let texImage;

        if(this.gl === undefined) {
            this.gl = VAR.getGL();
        }

        switch(typeof image) {
            case 'string':
                let loadedTex = GLUTILS.loadSpriteTexture(this.gl, image);
                texImage = loadedTex.image;
                texture = loadedTex.texture;
                break;
            case 'object':
                texture = GLUTILS.loadSpriteTextureFromImage(this.gl, image);
                texImage = image;
                break;
            default:
                throw new Error('Invalid paramater in addTexture(image). Must be either an image file path or an image object');
        }
       
        // Return index of texture
        return this.textures.push({
            texture: texture,
            image: texImage
        }) - 1; 
    }

    static getTexture(index) {
        return this.textures[index].texture;
    }

    static getImage(index) {
        return this.textures[index].image;
    }
}