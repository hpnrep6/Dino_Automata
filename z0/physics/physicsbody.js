import * as MODULE from '../tree/module.js';

export class PhysicsBody extends MODULE.Module {
    _collisions = [];
    _destroyed = false;
    _hasInit = false;

    /**
     * 
     * @param {Module} parent 
     * @param {Number} xLoc 
     * @param {Number} yLoc 
     * @param {Number} rot 
     * @param {Array} layer Layer to collide with other bodies in
     * @param {Array} mask Layer to check for collisions in. (Isn't really a bitmask, but can't think of a better name for it)
     */
    constructor(parent, xLoc = 0, yLoc = 0, rot = 0, layer = [0], mask = [0]) {
        super(parent, xLoc, yLoc, rot);

        this.layer = layer;
        this.mask = mask;

        this.lastXLoc = this.xLoc;
        this.lastYLoc = this.yLoc;

        this._destroyed = false;

        this._init();
    }

    setLoc(x, y) { 
        super.setLoc(x, y);

        if(this._hasInit && !(this.lastXLoc == this.xLoc && this.lastYLoc == this.yLoc)) {
            this.lastXLoc = this.xLoc;
            this.lastYLoc = this.yLoc;

            this._remove();
            this._init();
        }
    }

    _init() {
        if(this._destroyed) return;

        this.parent.getScene().physicsHandler.addBody(this);
        this._hasInit = true;
        this._removed = false;
    }

    _updateModule(delta) {
        this._startCollisionResolution();
        super._updateModule(delta);
        this._collisions = [];
    }

    _startCollisionResolution() {
        this._resolveCollisions(this._collisions);
    }

    _resolveCollisions(collisions) { 
        for(let i = 0; i < collisions.length; i++) {
            this._onCollision(collisions[i]);
        }
    }

    _reportCollision(body) { 
        if(this._collisions.indexOf(body) !== -1) return;

        this._collisions.push(body); 
    }

    _onCollision(body) {
        // Default empty
    }

    _remove() {
        this.parent.getScene().physicsHandler.removeBody(this);
    }

    _destroy() {
        super._destroy();
        this._remove();
        // Because the physics update is called after the module update, the program will add it back in even after it is removed
        // This ensures that it is not added back in
        this._destroyed = true;
    }
}