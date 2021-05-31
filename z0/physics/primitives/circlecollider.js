import { PhysicsBody } from '../physicsbody.js';
import { distanceSquared } from '../../math/math2d.js';

export class CircleCollider extends PhysicsBody {
    constructor(parent, x, y, rot = 0, diameter, layer = [0], mask = [0]) {
        super(parent, x, y, rot, layer, mask);

        this.diameter = diameter;
        this.radius = diameter / 2;

        this._init();
    }

    intersectingPoint(point) {
        distanceSquared(thix.xLoc, point.xLoc, this.yLoc, point.yLoc) < Math.pow(this.radius, 2);
    }

    intersectingCircle(circle) {
        distanceSquared(this.xLoc, circle.xLoc, this.yLoc, circle.yLoc) < Math.pow(this.radius + circle.radius, 2);
    }

    setDiameter(diameter) {
        this.diameter = diameter;
        this.radius = diameter / 2;
    }

    setRadius(radius) {
        this.diameter = radius * 2;
        this.radius = radius;
    }

    getDiameter() {
        return this.diameter;
    }

    getRadius() {
        return this.radius;
    }
}
