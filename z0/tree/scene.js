import { GLCanvas } from '../graphics/glcanvas.js';
import { PhysicsHandler } from '../physics/physicshandler.js';
import * as VAR from '../var.js';

export class Scene {
    constructor(gridSize = 300,  worldWidth, worldHeight, worldCornerX = 0, worldCornerY = 0) {
        this.canvas = VAR.canvas;

        this.xSize = this.canvas.width;
        this.ySize = this.canvas.height;

        this.xLoc = 0;
        this.yLoc = 0;

        this.isScene = true;

        // For physics handler
        this.gridSize = gridSize;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.worldCornerX = worldCornerX;
        this.worldCornerY = worldCornerY;

        this.glCanvas = new GLCanvas(this.canvas);

        this.physicsHandler = new PhysicsHandler(
            this.gridSize, 
            this.worldWidth || this.canvas.width, 
            this.worldHeight || this.canvas.height, 
            this.worldCornerX, 
            this.worldCornerY);

        this.children = [];

        //this._start();
    }

    _updateScene(delta) {
        this._update(delta);

        for(let i = 0; i < this.children.length; i++) {
            this.children[i]._updateModule(delta);
        }

        this.physicsHandler._update(delta);

        this.glCanvas._update();
    }

    _start() {
        // Default empty _start() function
    }

    _update(delta) {
        // Default empty _update() function
    }

    setBackgroundColour(r, g, b, a = 1) {
        this.glCanvas.setBackgroundColour(r, g, b, a);
    }

    setLoc(xLoc, yLoc) {
        this.xLoc = xLoc;
        this.yLoc = yLoc;

        this._updateChildrenLoc();
    }

    setX(xLoc) {
        this.xLoc = xLoc;

        this._updateChildrenLoc();
    }

    setY(yLoc) {
        this.yLoc = yLoc;

        this._updateChildrenLoc();
    }

    addChild(module) {
        this.children.push(module);
        return;
    }

    removeChild(module) {
        for(let i = 0, n = this.children.length; i < n; i++) {
            if(module === this.children[i]) {
                this.children[i]._destroy();
                this.children.splice(i, 1);
                return;
            }
        }
    }

    getScene() {
        return this;
    }

    getGLCanvas() {
        return this.glCanvas;
    }

    getWidth() {
        return this.xSize;
    }

    getHeight() {
        return this.ySize;
    }

    getChildren() {
        return this.children;
    }

    getX() {
        return this.xLoc;
    }

    getY() {
        return this.yLoc;
    }

    getLoc() {
        return {
            x: this.xLoc,
            y: this.yLoc
        }
    }

    _updateChildrenLoc() {
        for(let i = 0, n = this.children.length; i < n; i++) {
            let child = this.children[i]
            child.setLoc(this.xLoc + child.xOff, this.yLoc + child.yOff);
        }
    }

    _destroy() {
        for(let i = this.children.length - 1; i >= 0; i--) {
            this.children[i]._destroy();
        }
       
        this.children= [];

        this.glCanvas.destroy();
    }
}