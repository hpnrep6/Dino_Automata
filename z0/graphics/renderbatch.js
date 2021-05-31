import { Sprite2DRenderer } from './sprite2d.js';
import { powerOfTwoRoundedUp } from '../math/math.js';
import * as VAR from '../var.js';

export class RenderBatch {
    static defaultVertCoords = [
        1,  1,
        1, -1,
       -1,  1,
        
       -1,  1,
        1, -1,
       -1, -1
    ];

    static TRANSFORM_LENGTH  = 18;
    static TEX_LENGTH = 12;
    
    sprites = [];
    texture;
    shader;
    vao;
    buffers = {
        transform: undefined, // Location, rotation
        size: undefined, // Scaling, alpha
        texCoords: undefined, // Texture coordinates
        vertices: undefined
    };

    arrays = {
        transform: undefined, // Location, rotation
        size: undefined, // Scaling, alpha
        texCoords: undefined,
        vertices: undefined,
        verticesArrayLength: 0
    };

    locations = {
        transform: undefined,
        size: undefined,
        texCoords: undefined,
        vertices: undefined
    }

    static vertCoords = [];

    updateLoc = false;
    updateSize= false;
    updateTexture = false;
    updateAlpha = false;
    updateGeo = false;

    constructor(texture) {
        this.texture = texture;

        this.vao = VAR.gl.createVertexArray();

        this.initLocations();
        this.initBuffers(VAR.gl)
    }

    /**
     * Initialises shader variable locations
     */
    initLocations() {
        this.locations.transform = Sprite2DRenderer.info.aLoc.aTransform0;
        this.locations.size = Sprite2DRenderer.info.aLoc.aTransform1;
        this.locations.texCoords = Sprite2DRenderer.info.aLoc.aTexCoord;
        this.locations.vertices = Sprite2DRenderer.info.aLoc.aVertPos;
    }

    /**
     * Initialises OpenGL buffers
     * 
     * @param {gl} gl WebGL context
     */
    initBuffers(gl) {
        this.buffers.transform = gl.createBuffer();
        this.buffers.size = gl.createBuffer();
        this.buffers.texCoords = gl.createBuffer();
        this.buffers.vertices = gl.createBuffer();
    }

    static verticesCache = [];

    static getVerticesCached(power) {
        if(this.verticesCache[power] == undefined) {

            // Create array and concatanate initial vertices
            let verticesArray = [];
            verticesArray = verticesArray.concat(RenderBatch.defaultVertCoords);

            for(let i = 0; i < power; i++) {
                // Duplicate array onto itself; [a, b] -> [a, b, a, b] -> [a, b, a, b, a, b, a, b]
                verticesArray = verticesArray.concat(verticesArray);
            }

            // Convert typeof Number array to typeof Float32 array to upload to GPU
            let array = new Float32Array(verticesArray);

            // Store vertices array in cache array
            this.verticesCache[power] = array;

            return array;

        } else {
            // Already cached, return cached array
            return this.verticesCache[power];
        }
    }

    updateVertices(gl) {
        let length = powerOfTwoRoundedUp(this.sprites.length);

        // If desired array length is longer than current array, or smaller than two powers of two (2^3 < 2^6 will return true, 2^5 < 2^6 will return false)
        // Only rebuild array under these conditions
        if(length >= this.arrays.verticesArrayLength) {

            this.arrays.vertices = RenderBatch.getVerticesCached(length);

            this.arrays.verticesArrayLength = length;
        
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertices);
            gl.bufferData(gl.ARRAY_BUFFER, this.arrays.vertices, gl.STATIC_DRAW);

            gl.enableVertexAttribArray(this.locations.vertices);
            gl.vertexAttribPointer(this.locations.vertices, 2, gl.FLOAT, false, 0, 0);
        } 
    }

    updateTransformBuffer(gl) {
        // Buffer transform data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.transform);
        gl.bufferData(gl.ARRAY_BUFFER, this.arrays.transform, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.locations.transform);
        gl.vertexAttribPointer(this.locations.transform, 3, gl.FLOAT, false, 0, 0);
    }

    updateSizeBuffer(gl) {  
        // Buffer size data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.size);
        gl.bufferData(gl.ARRAY_BUFFER, this.arrays.size, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.locations.size);
        gl.vertexAttribPointer(this.locations.size, 3, gl.FLOAT, false, 0, 0);
    }

    updateTextureBuffer(gl) {
        // Buffer texture coordinate data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texCoords);
        gl.bufferData(gl.ARRAY_BUFFER, this.arrays.texCoords, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.locations.texCoords);
        gl.vertexAttribPointer(this.locations.texCoords, 2, gl.FLOAT, false, 0, 0);
    }


    updateBuffers(gl) {

        // Bind batch's vertex array object to save state
        gl.bindVertexArray(this.vao);
        
        if(this.updateGeo) {

            this.arrays.transform = new Float32Array(RenderBatch.TRANSFORM_LENGTH * this.sprites.length);
            this.arrays.size = new Float32Array(RenderBatch.TRANSFORM_LENGTH * this.sprites.length);

            this.arrays.texCoords = new Float32Array(RenderBatch.TEX_LENGTH * this.sprites.length);

            for(let i = 0; i < this.sprites.length; i++) {
                let offset = i * RenderBatch.TRANSFORM_LENGTH;
                {
                    // Transformation buffers;
                    // 3 per vertex, 6 vertices per quad

                    // Would be cleaner with a loop, but this part is performance critical code
                    // Because it will be run for any update to any sprite

                    // Update transform

                    this.arrays.transform[offset + 0] = this.sprites[i].xLoc;
                    this.arrays.transform[offset + 1] = this.sprites[i].yLoc;
                    this.arrays.transform[offset + 2] = this.sprites[i].rot;

                    this.arrays.transform[offset + 3] = this.sprites[i].xLoc;
                    this.arrays.transform[offset + 4] = this.sprites[i].yLoc;
                    this.arrays.transform[offset + 5] = this.sprites[i].rot;
                    
                    this.arrays.transform[offset + 6] = this.sprites[i].xLoc;
                    this.arrays.transform[offset + 7] = this.sprites[i].yLoc;
                    this.arrays.transform[offset + 8] = this.sprites[i].rot;

                    this.arrays.transform[offset + 9] = this.sprites[i].xLoc;
                    this.arrays.transform[offset + 10] = this.sprites[i].yLoc;
                    this.arrays.transform[offset + 11] = this.sprites[i].rot;
                    
                    this.arrays.transform[offset + 12] = this.sprites[i].xLoc;
                    this.arrays.transform[offset + 13] = this.sprites[i].yLoc;
                    this.arrays.transform[offset + 14] = this.sprites[i].rot;

                    this.arrays.transform[offset + 15] = this.sprites[i].xLoc;
                    this.arrays.transform[offset + 16] = this.sprites[i].yLoc;
                    this.arrays.transform[offset + 17] = this.sprites[i].rot;

                    // Update scaling

                    this.arrays.size[offset + 0] = this.sprites[i].alpha;
                    this.arrays.size[offset + 1] = this.sprites[i].xSize;
                    this.arrays.size[offset + 2] = this.sprites[i].ySize;

                    this.arrays.size[offset + 3] = this.sprites[i].alpha;
                    this.arrays.size[offset + 4] = this.sprites[i].xSize;
                    this.arrays.size[offset + 5] = this.sprites[i].ySize;

                    this.arrays.size[offset + 6] = this.sprites[i].alpha;
                    this.arrays.size[offset + 7] = this.sprites[i].xSize;
                    this.arrays.size[offset + 8] = this.sprites[i].ySize;

                    this.arrays.size[offset + 9] = this.sprites[i].alpha;
                    this.arrays.size[offset + 10] = this.sprites[i].xSize;
                    this.arrays.size[offset + 11] = this.sprites[i].ySize;

                    this.arrays.size[offset + 12] = this.sprites[i].alpha;
                    this.arrays.size[offset + 13] = this.sprites[i].xSize;
                    this.arrays.size[offset + 14] = this.sprites[i].ySize;

                    this.arrays.size[offset + 15] = this.sprites[i].alpha;
                    this.arrays.size[offset + 16] = this.sprites[i].xSize;
                    this.arrays.size[offset + 17] = this.sprites[i].ySize;
                }

                offset = i * RenderBatch.TEX_LENGTH;

                {
                    // Texture coordinate buffers
                    // 2 per vertex, 6 vertices per quad
                    
                    this.arrays.texCoords[offset + 0] = this.sprites[i].sprite[0];
                    this.arrays.texCoords[offset + 1] = this.sprites[i].sprite[1];
                    this.arrays.texCoords[offset + 2] = this.sprites[i].sprite[2];
                    this.arrays.texCoords[offset + 3] = this.sprites[i].sprite[3];
                    this.arrays.texCoords[offset + 4] = this.sprites[i].sprite[4];
                    this.arrays.texCoords[offset + 5] = this.sprites[i].sprite[5];
                    this.arrays.texCoords[offset + 6] = this.sprites[i].sprite[6];
                    this.arrays.texCoords[offset + 7] = this.sprites[i].sprite[7];
                    this.arrays.texCoords[offset + 8] = this.sprites[i].sprite[8];
                    this.arrays.texCoords[offset + 9] = this.sprites[i].sprite[9];
                    this.arrays.texCoords[offset + 10] = this.sprites[i].sprite[10];
                    this.arrays.texCoords[offset + 11] = this.sprites[i].sprite[11];
                }
            }

            this.updateVertices(gl);

   
            this.updateTransformBuffer(gl);
            this.updateSizeBuffer(gl);
            this.updateTextureBuffer(gl);

        } else {

        if(this.updateLoc) {
            this.arrays.transform = new Float32Array(RenderBatch.TRANSFORM_LENGTH * this.sprites.length);

            for(let i = 0; i < this.sprites.length; i++) {
                let offset = i * RenderBatch.TRANSFORM_LENGTH;

                this.arrays.transform[offset + 0] = this.sprites[i].xLoc;
                this.arrays.transform[offset + 1] = this.sprites[i].yLoc;
                this.arrays.transform[offset + 2] = this.sprites[i].rot;

                this.arrays.transform[offset + 3] = this.sprites[i].xLoc;
                this.arrays.transform[offset + 4] = this.sprites[i].yLoc;
                this.arrays.transform[offset + 5] = this.sprites[i].rot;
                
                this.arrays.transform[offset + 6] = this.sprites[i].xLoc;
                this.arrays.transform[offset + 7] = this.sprites[i].yLoc;
                this.arrays.transform[offset + 8] = this.sprites[i].rot;

                this.arrays.transform[offset + 9] = this.sprites[i].xLoc;
                this.arrays.transform[offset + 10] = this.sprites[i].yLoc;
                this.arrays.transform[offset + 11] = this.sprites[i].rot;
                
                this.arrays.transform[offset + 12] = this.sprites[i].xLoc;
                this.arrays.transform[offset + 13] = this.sprites[i].yLoc;
                this.arrays.transform[offset + 14] = this.sprites[i].rot;

                this.arrays.transform[offset + 15] = this.sprites[i].xLoc;
                this.arrays.transform[offset + 16] = this.sprites[i].yLoc;
                this.arrays.transform[offset + 17] = this.sprites[i].rot;
            }

            this.updateTransformBuffer(gl);
        }

        if(this.updateSize || this.updateAlpha) {
            this.arrays.size = new Float32Array(RenderBatch.TRANSFORM_LENGTH * this.sprites.length);
        
            for(let i = 0; i < this.sprites.length; i++) {
                let offset = i * RenderBatch.TRANSFORM_LENGTH;

                this.arrays.size[offset + 0] = this.sprites[i].alpha;
                this.arrays.size[offset + 1] = this.sprites[i].xSize;
                this.arrays.size[offset + 2] = this.sprites[i].ySize;

                this.arrays.size[offset + 3] = this.sprites[i].alpha;
                this.arrays.size[offset + 4] = this.sprites[i].xSize;
                this.arrays.size[offset + 5] = this.sprites[i].ySize;

                this.arrays.size[offset + 6] = this.sprites[i].alpha;
                this.arrays.size[offset + 7] = this.sprites[i].xSize;
                this.arrays.size[offset + 8] = this.sprites[i].ySize;

                this.arrays.size[offset + 9] = this.sprites[i].alpha;
                this.arrays.size[offset + 10] = this.sprites[i].xSize;
                this.arrays.size[offset + 11] = this.sprites[i].ySize;

                this.arrays.size[offset + 12] = this.sprites[i].alpha;
                this.arrays.size[offset + 13] = this.sprites[i].xSize;
                this.arrays.size[offset + 14] = this.sprites[i].ySize;

                this.arrays.size[offset + 15] = this.sprites[i].alpha;
                this.arrays.size[offset + 16] = this.sprites[i].xSize;
                this.arrays.size[offset + 17] = this.sprites[i].ySize;
            }

            this.updateSizeBuffer(gl);
        }

        if(this.updateTexture) {
            this.arrays.texCoords = new Float32Array(RenderBatch.TEX_LENGTH * this.sprites.length);

            for(let i = 0; i < this.sprites.length; i++) {
                let offset = i * RenderBatch.TEX_LENGTH;

                this.arrays.texCoords[offset + 0] = this.sprites[i].sprite[0];
                this.arrays.texCoords[offset + 1] = this.sprites[i].sprite[1];
                this.arrays.texCoords[offset + 2] = this.sprites[i].sprite[2];
                this.arrays.texCoords[offset + 3] = this.sprites[i].sprite[3];
                this.arrays.texCoords[offset + 4] = this.sprites[i].sprite[4];
                this.arrays.texCoords[offset + 5] = this.sprites[i].sprite[5];
                this.arrays.texCoords[offset + 6] = this.sprites[i].sprite[6];
                this.arrays.texCoords[offset + 7] = this.sprites[i].sprite[7];
                this.arrays.texCoords[offset + 8] = this.sprites[i].sprite[8];
                this.arrays.texCoords[offset + 9] = this.sprites[i].sprite[9];
                this.arrays.texCoords[offset + 10] = this.sprites[i].sprite[10];
                this.arrays.texCoords[offset + 11] = this.sprites[i].sprite[11];
            }

            this.updateTextureBuffer(gl);
        }

        }

        this.updateLoc = false;
        this.updateSize= false;
        this.updateTexture = false;
        this.updateAlpha = false;
        this.updateGeo = false;

    }

    add(sprite) {
        this.sprites.push(sprite);
        sprite._batch = this;
        this.updateGeo = true;
    }

    destroy() {
        let gl = VAR.gl;

        gl.deleteBuffer(this.buffers.transform);
        gl.deleteBuffer(this.buffers.size)
        gl.deleteBuffer(this.buffers.texCoords);
        gl.deleteBuffer(this.buffers.vertices);

        gl.deleteVertexArray(this.vao);
    }
}
