import * as GLUTILS from '../utils/glutils.js';
import * as SPRITE from './sprite.js';
import * as TEXTUREMANAGER from './texturemanager.js';
import { SpriteSheet } from './spritesheet.js';
import { RenderBatch } from './renderbatch.js';

// Sprite with batch rendering enabled
export class Sprite2D extends SPRITE.Sprite {
    constructor(parent, image, xLoc, yLoc, xSize, ySize, rot = 0, zLoc = 0, spritesheet = null) {

        super(parent, xLoc, yLoc, xSize, ySize, rot, zLoc);

        this.image = image;

        this.xIndex;
        this.yIndex;

        this._hFlipped = false;
        this._vFlipped = false;

        this.glcanvas = this.getScene().getGLCanvas();

        this._renderer = Sprite2D._renderer;

        switch(typeof this.image) {
            case 'number':
                this.texture = TEXTUREMANAGER.TextureManager.getTexture(this.image);
                this.image = TEXTUREMANAGER.TextureManager.getImage(this.image);
                break;
            case 'string':
                let loadedTex = GLUTILS.loadSpriteTexture(this.glcanvas.gl, this.image);
                this.texture = loadedTex.texture;
                this.image = loadedTex.image;
                break;
            case 'object':
                this.texture = GLUTILS.loadSpriteTextureFromImage(this.glcanvas.gl, this.image);
                break;
        }

        switch(true) {
            case spritesheet instanceof SpriteSheet:
                this.spritesheet = spritesheet;
                break;
            default:
                this.spritesheet = new SpriteSheet(this.image);
                this.spritesheet.createFrame(0, 0, this.image.width, this.image.height)
        }

        this.imageSize = {
            width: this.image.width,
            height: this.image.height
        };

        this.image = undefined;

        this.spriteIndex = 0;
        this.sprite = this.spritesheet.getFrame(this.spriteIndex);

        this.glcanvas.addSprite(this);
    }

    reflectH() {
        switch(this._hFlipped) {
            case false:
                this._hFlipped = true;
                this.sprite = this.spritesheet.getFrameReflectedH(this.spriteIndex);
            break;
        case true:
                this._hFlipped = false;
                this.sprite = this.spritesheet.getFrame(this.spriteIndex);
            break;
        }

        this._batch.updateTexture = true;
    }

    reflectV() {
        switch(this._vFlipped) {
            case false:
                this._vFlipped = true;
                this.sprite = this.spritesheet.getFrameReflectedV(this.spriteIndex);
            break;
        case true:
                this._vFlipped = false;
                this.sprite = this.spritesheet.getFrame(this.spriteIndex);
            break;
        }

        this._batch.updateTexture = true;
    }

    setSpriteSheet(spriteSheet) {
        this.spritesheet = spriteSheet;
        this.spriteIndex = 0;
    }

    setSprite(index) {
        this.spriteIndex = index;
        this.sprite = this.spritesheet.getFrame(index);
        this._batch.updateTexture = true;
    }

    setSpriteLoop(index) {
        let length = this.spritesheet.getFrameCount();

        index = index >= length ? 0 : index;

        index = index < 0 ? length - 1: index;

        this.sprite = this.spritesheet.getFrame(index);

        this.spriteIndex = index;

        this._batch.updateTexture = true;
    }

    // Sets the texture coordinates for the renderer
    static _createSprite(rawSprite) {
        let w = rawSprite.width / this.imageSize.width;
        let h = rawSprite.height / this.imageSize.height;
        let x = rawSprite.x / this.imageSize.width;
        let y = rawSprite.y / this.imageSize.height;

        this.sprite = new Float32Array([
            x + w, y + h,
            x + w, y    ,
            x    , y + h,
            x    , y + h,
            x + w, y    ,
            x    , y 
        ]);
    }

    getSpriteIndex(index) {
        return this.spriteIndex;
    }

    _draw(gl, sprites, lastShader) {
        Sprite2DRenderer.draw(gl, sprites, lastShader);
    }

    static _updateVertices(transform, x, y, width, height, rot, canvas) {

    }
}

export class Sprite2DRenderer {
    // Number of cycles to create vertex position array. Each cycle increases previous count by a power of two, starting from 12 vertex locations (2 per vertex, 3 verticies per triangle, 2 triangles per quad)
    static MAX_CYCLES = 11;

    static vShader = `
        attribute vec3 aTransformation0;
        attribute vec3 aTransformation1;

        attribute vec2 aVertPos;
        attribute vec2 aTexCoord;

        uniform vec2 uRes;
    
        varying vec2 vTexCoord;
        varying float vAlpha;
        
        void main() {
            vec2 scaledPos = (aVertPos * aTransformation1.yz) / 2.0;

            float xRot = sin(aTransformation0.z), yRot = cos(aTransformation0.z);

            vec2 rotPos = vec2(
                  scaledPos.x * yRot + scaledPos.y * xRot,
                  scaledPos.y * yRot - scaledPos.x * xRot
            );

            rotPos = (((rotPos + aTransformation0.xy) / uRes) * 2. -1.) * vec2(1,-1);

            gl_Position = vec4(rotPos, 0, 1);

            vTexCoord = aTexCoord;
            vAlpha = aTransformation1.x;
        }
    `;
    
    static fShader = `
        precision mediump float;
        
        varying vec2 vTexCoord;
        varying float vAlpha;

        uniform sampler2D uSampler;

        void main() {
            vec4 tex = texture2D(uSampler, vTexCoord);

            gl_FragColor = vec4(tex.xyz, tex.w * vAlpha);
        }
    `;


    // Initialise the values in static info at runtime once with the given gl context
    static initInfo(gl, canvas) {
        this.info.canvas = canvas;
        this.info.gl = gl;

        // Only init once 
        if(this.initialised) return;

        this.program = GLUTILS.createShaderProgram(gl, this.vShader, this.fShader);

        this.info.aLoc.aTransform0 = this.info.gl.getAttribLocation(this.program, 'aTransformation0');
        this.info.aLoc.aTransform1 = this.info.gl.getAttribLocation(this.program, 'aTransformation1');
        this.info.aLoc.aVertPos = this.info.gl.getAttribLocation(this.program, 'aVertPos');
        this.info.aLoc.aTexCoord = this.info.gl.getAttribLocation(this.program, 'aTexCoord');

        this.info.uLoc.sampler = this.info.gl.getUniformLocation(this.program, 'uSampler');
        this.info.uLoc.uRes = this.info.gl.getUniformLocation(this.program, 'uRes');

        this.initialised = true;
    }

    static initialised = false;

    static glBuffers = {
        vboID: null,
        vaoID: null,
        texID: null,
        transform0ID: null,
        transform1ID: null,
        vertices: null,
        texVertices: null
    }

    static program;

    static info = {
        gl: null,
        canvas: null,
        aLoc: {
            aVertPos: null,
            aTransform0: null,
            aTransform1: null,
            aTexCoord: null
        }, uLoc: {
            sampler: null,
            uRes: null
        },
    };

    static vertices = [
        1,  1,
        1, -1,
       -1,  1,
        
       -1,  1,
        1, -1,
       -1, -1
    ]

    static textureCoords = new Float32Array([
        1,  1,
        1,  0,
        0,  1,
        
        0,  1,
        1,  0,
        0,  0
    ]);

    static vertexElements = 12;

    static componentsPerTriangle = 9; // 3 transformation values per vertex, 3 vertices per triangle

    static draw(gl, renderbatch, lastShader) {
        // Don't change shader if previous shader used is the same one as the current shader, because shader changes are relatively expensive
        if(lastShader.shader !== Sprite2DRenderer.program) 
            gl.useProgram(Sprite2DRenderer.program);

        lastShader.shader = Sprite2DRenderer.program;

        renderbatch.updateBuffers(gl);

        // Bind textures and canvas resolution for the batch

        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, renderbatch.texture);

        gl.uniform1i(this.info.uLoc.sampler, 0);

        gl.uniform2fv(this.info.uLoc.uRes, [this.info.canvas.width, this.info.canvas.height]);

        // Draw

        gl.drawArrays(gl.TRIANGLES, 0,  renderbatch.sprites.length * 6);

    }
}