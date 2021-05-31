import { Sprite2DRenderer } from './sprite2d.js';
import { Colour } from './colour/colour.js';
import * as VAR from '../var.js';
import { ShaderSprite2DRenderer } from './shadersprite2d.js';
import { RenderBatch } from './renderbatch.js';

export class GLCanvas {

    static MAX_SPRITES = Math.pow(2, Sprite2DRenderer.MAX_CYCLES);

    bkgColour = VAR.defaultColour;

    lastShader;

    constructor(canvas) {
        this.gl = VAR.gl;

        this.canvas = canvas;
        
        this.gl.viewport(0, 0, canvas.width, canvas.height);

        Sprite2DRenderer.initInfo(this.gl, canvas);

        this.gl.useProgram(Sprite2DRenderer.info.program);

        this.gl.enable(this.gl.BLEND);
    
        this.gl.blendEquation(this.gl.FUNC_ADD);
    
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.sprites = [];

        this.bkgColour = VAR.defaultColour;

        this.lastShader = new LastShader();
    }

    _update() {
        this.clearCanvas();

        this.gl.clearColor(this.bkgColour.r, this.bkgColour.g, this.bkgColour.b, this.bkgColour.a);

        // Loop through and draw each sprite layer starting from index 0 to index n
        for(var i = 0; i < this.sprites.length; i++) {
            if(this.sprites[i] === undefined) continue;

            for(let j = 0; j < this.sprites[i].length; j++) {
                if(this.sprites[i][j] === undefined) continue;

                this.sprites[i][j].sprites[0]._draw(this.gl, this.sprites[i][j], this.lastShader);
           }
        }
    }

    addSprite(sprite) {
        /*
        Sprite2D array structure:

        | [z]     | [x]      | [y]     |
        | zLoc    | textures | sprites |
        */

        let z = sprite.zLoc;

        // If z position doesnt already exist, create a new array 
        if(this.sprites[z] === undefined) { 
            this._createNewSublayer(sprite, z); 
            return;
        }


        // Else, loop through existing to check if sprite with same texture
        // already exists.
        let n = this.sprites[z].length;
        for(let i = 0; i < n; i++) {
            if(sprite.texture === this.sprites[z][i].texture) {

                // // Don't add if the number of sprites in this layer has exceeded the maximum allowed sprites per layer
                // if(this.sprites[z][i].sprites.length >= GLCanvas.MAX_SPRITES) continue;

                // Add sprite into sprite array at [zLocition][TextureType]
                this.sprites[z][i].add(sprite);

                return;
            }
        }

        //  If none found, create a new array in the specified z layer.
        this.sprites[z].push(new RenderBatch(sprite.texture));
        this.sprites[z][n].add(sprite);
    }

    _createNewSublayer(sprite, z) {
            this.sprites[z] = [];
            this.sprites[z][0] = new RenderBatch(sprite.texture);
            this.sprites[z][0].add(sprite);
    }

    removeSprite(sprite) {
        for(let i = 0; i < this.sprites[sprite.zLoc].length; i++) {

            if(this.sprites[sprite.zLoc][i] === undefined) continue;

            let index = this.sprites[sprite.zLoc][i].sprites.indexOf(sprite);

            if(index != -1) {
                this.sprites[sprite.zLoc][i].sprites.splice(index, 1);

                if(this.sprites[sprite.zLoc][i].sprites.length === 0) {
                    this.sprites[sprite.zLoc].splice(i, 1);
                }

                sprite._batch = undefined;

                return;
            }
        }
    }

    setBackgroundColour(r, g, b, a) {
        this.bkgColour = new Colour(r, g, b, a);
    }


    clearCanvas() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    /**
     * Free GPU memory
     */
    destroy() {
        for(let i = 0; i < this.sprites.length; i++) {
            
            if(this.sprites[i] !== undefined)
                for(let j = 0; j < this.sprites[i].length; j++) {
                    if(this.sprites[i][j] !== undefined) {
                        this.sprites[i][j].destroy();
                    }
                }
        }
    }
}

class LastShader {
    constructor() {
        this.shader = 0;
    }
}