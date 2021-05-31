import * as PHYSICSBODY from '../physicsbody.js';
import * as MATH from '../../math/math2d.js';

export class AARectangle extends PHYSICSBODY.PhysicsBody {
    constructor(parent, x, y, rot = 0, width, height, layer = [0], mask = [0]) {
        super(parent, x, y, rot, layer, mask);
        
        this.width = width;
        this.height = height;
        
        this.halfWidth = width / 2;
        this.halfHeight = height / 2;

        this._init();

        this._hasInit = true;
    }

    intersectingPoint(point) {
        return (
            point.xLoc < this.xLoc + this.halfWidth  && 
            point.xLoc > this.xLoc - this.halfWidth  &&
            
            point.yLoc < this.yLoc + this.halfHeight &&
            point.yLoc > this.yLoc - this.halfHeight 
        );
    }

    setWidth(width) {
        this.width = width;
        this.halfWidth = width / 2;
    }

    setHeight(height) {
        this.height = height;
        this.halfHeight = height / 2;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getHalfWidth() {
        return this.halfWidth;
    }

    getHalfHeight() {
        return this.halfHeight;
    }
}