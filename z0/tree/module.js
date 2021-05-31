import { angleTo } from '../math/math2d.js';
import { getActiveScene } from '../z0.js';

export class Module {
    constructor(parent, xLoc = 0, yLoc = 0, rot = 0) {
        if(!parent) 
            this.parent = getActiveScene();
        else
            this.parent = parent;

        this.xLoc = xLoc + this.parent.xLoc;
        this.yLoc = yLoc + this.parent.yLoc;

        this.xOff = xLoc;
        this.yOff = yLoc;
        
        this.parent.addChild(this);

        this.rot = rot;
        this._rotX = Math.cos(rot);
        this._rotY = -Math.sin(rot);

        this.children = [];

        this.setLoc(this.xLoc, this.yLoc);

        this._start();
    }

    _updateModule(delta) {
        this._update(delta);

        // Recursively update children
        for(let i = 0; i < this.children.length; i++) {
            this.children[i]._updateModule(delta);
        }
    }

    _start() {
        // Default empty _init() function
    }

    _update(delta) {
        // Default empty _update() function
    }

    _destroy() {
        for(let i = 0, n = this.children.length; i < n; i++) {
            this.children[i]._destroy();
        }
    }

    addChild(child) {
        this.children.push(child);
    }

    removeSelf() {
        this.parent.removeChild(this);
    }

    removeChild(child) {
        for(let i = 0, n = this.children.length; i < n; i++) {
            if(child === this.children[i]) {
                this.children[i]._destroy();
                this.children.splice(i, 1);
                return;
            }
        }
    }

    rotate(rot) {
        this.setRot(this.rot + rot);
    }

    turnTowards(x, y) {
        this.setRot(angleTo(this.xLoc, x, this.yLoc, y));
    }

    move(step) {
        this.setLoc(this.xLoc + (this._rotX * step), this.yLoc + (this._rotY * step));
    }

    setLoc(xLoc, yLoc) {
        this.xLoc = xLoc;
        this.yLoc = yLoc;

        this.xOff = xLoc - this.parent.xLoc;
        this.yOff = yLoc - this.parent.yLoc;

        this._updateChildrenLoc();
    }

    setX(xLoc) {
        this.xLoc = xLoc;

        this.xOff = xLoc - this.parent.xLoc;

        this._updateChildrenLoc();
    }

    setY(yLoc) {
        this.yLoc = yLoc;

        this.yOff = yLoc - this.parent.yLoc;

        this._updateChildrenLoc();
    }

    setOff(xOff, yOff) {
        this.xLoc = this.parent.xLoc + xOff;
        this.yLoc = this.parent.yLoc + yOff;

        this.xOff = xOff;
        this.yOff = yOff;
        this._updateChildrenLoc();
    }

    setRot(rot) {
        this.rot = rot;
        this._rotX = Math.cos(rot);
        this._rotY = -Math.sin(rot);
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

    getXOff() {
        return this.xOff;
    }

    getYOff() {
        return this.yOff;
    }

    getRot() {
        return this.rot;
    }

    getParent() {
        return this.parent;
    }

    getScene() {
        let parent = this.parent;
        while(!(parent.isScene === true)) {
            parent = parent.getParent();
        }
        return parent;
    }

    getChildren() {
        return this.children;
    }

    _updateChildrenLoc() {
        for(let i = 0, n = this.children.length; i < n; i++) {
            let child = this.children[i]
            child.setLoc(this.xLoc + child.xOff, this.yLoc + child.yOff);
        }
    }
}
