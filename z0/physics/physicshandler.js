import { AARectangle }from './primitives/aarectcollider.js';
import { CircleCollider } from './primitives/circlecollider.js';
import { intersectingRectRect, intersectingRectCircle, intersectingCircleCircle } from './collisions/aacollisions.js';
import { Point } from '../primitives/point.js';



export class PhysicsHandler {
    /**
     * @param {Number} gridSize Size of each rectangular section 
     * @param {Number} worldWidth Width of the area to check for collisions
     * @param {Number} worldHeight Height of the area to check for collisions
     * @param {Number} worldCornerX Left most coordinate of the world
     * @param {Number} worldCornerY Top most coordinate of the world
     */
	constructor(gridSize, worldWidth, worldHeight, worldCornerX = 0, worldCornerY = 0) {
        this.grid = [];

        let passes = 0;

        /**
         * Grid layout:
         *      x0     x1    x2
         * y0   [sect, sect, sect],
         * y1   [sect, sect, sect],
         * y2   [sect, sect, sect] ... etc.
         */

        for(let y = worldCornerY, n = worldHeight + worldCornerY + gridSize / 2 - 1, i = 0; y <= n; y += gridSize, i++) {

            this.grid[i] = [];

            for(let x = worldCornerX , m = worldWidth + worldCornerX + gridSize / 2 - 1, j = 0; x <= m; x += gridSize, j++) {
                this.grid[i][j] = new GridSection(x + gridSize / 2, y + gridSize / 2, gridSize);
                passes++;
            }
        }

        /**
         * Layout of grid layer array:
         * 
         * [n]                  [n][0]               [n][1]
         * 
         * Physics Layers       Bodies in layer      Bodies to check for collisions in layer
         * 
         * Physics Layers: Each physics layer has its own set of bodies to check for collisions
         */
    }

    _update(delta) { 
        for(let i = 0, n = this.grid.length; i < n; i++)  {
            for(let j = 0, m = this.grid[i].length; j < m; j++) {
                this._checkCollisionLayers(this.grid[i][j].layers);
            }
        }
    }

    _checkCollisionLayers(bodies) {
        // Loop through layers
        for(let i = 0, n = bodies.length; i < n; i++) {

            // If no bodies have been added to this layer, skip
            if(bodies[i] === undefined) continue;

            // Loop through masks in layers
            for(let j = 0; j < bodies[i][1].length; j++) {

                // Loop through objects in layers
                for(let k = 0; k < bodies[i][0].length; k++) {
                    
                    // Do not check for collisions if two bodies are the same object
                    if(bodies[i][1][j] === bodies[i][0][k]) continue;
                    
                    let collisionbody = this._checkCollision(bodies[i][1][j], bodies[i][0][k]);
                    
                    if(collisionbody !== undefined) {
                        bodies[i][1][j]._reportCollision(collisionbody);
                    }
                }
            }
        }
    }

    /**
     * 
     * @param {PhysicsBody} body Body to check if it is colliding with collider (mask)
     * @param {PhysicsBody} collider Collider that collides with body
     */
    _checkCollision(body, collider) {
        switch(true) { 
            // Rect on collider
            case body instanceof AARectangle:
                switch(true) {
                    case collider instanceof AARectangle:
                        if(intersectingRectRect(body, collider)) {
                            return collider;
                        }
                        break;

                    case collider instanceof CircleCollider:
                        if(intersectingRectCircle(body, collider)) {
                            return collider;
                        }
                        break;
                }
                break;
            // Circle on collider
            case body instanceof CircleCollider:
                switch(true) {
                    case collider instanceof AARectangle:
                        if(intersectingRectCircle(collider, body)) {
                            return collider;
                        }
                        break;

                    case collider instanceof CircleCollider:
                        if(intersectingCircleCircle(body, collider)) {
                            return collider;
                        }
                        break;
                }
                break;
        }
        return undefined;
    }

    addBody(body) { 
        body._gridLocIndex = [];

        // Loop through grid array to find which one(s) the body belongs in 
        for(let i = 0, n = this.grid.length; i < n; i++)  {
            for(let j = 0, m = this.grid[i].length; j < m; j++) {
                switch(true) {
                    case body instanceof AARectangle:
                        if(intersectingRectRect(this.grid[i][j], body)) {

                            body._gridLocIndex.push(new GridIndex(j, i));
                            
                            this.addBodyToSection(body, j ,i);
                        }
                    case body instanceof CircleCollider:
                        if(intersectingRectCircle(this.grid[i][j], body)) {

                            body._gridLocIndex.push(new GridIndex(j, i));

                            this.addBodyToSection(body, j, i);
                        }
                }
            }
        }
    }

    addBodyToSection(body, x, y) {

        /**
         * Structure of index
         * 
         * [n]
         * 
         * Index of body in array at layer n
         */
         
        for(let i = 0, n = body.layer.length; i < n; i++) {
            let layer = body.layer[i];

            if(this.grid[y][x].layers[layer] === undefined) {
                this.grid[y][x].layers[layer] = [];
                this.grid[y][x].layers[layer][0] = [];
                this.grid[y][x].layers[layer][1] = [];
            }

            this.grid[y][x].layers[layer][0].push(body); 
        }


        for(let i = 0, m = body.mask.length; i < m; i++) {
            let mask = body.mask[i];

            if(this.grid[y][x].layers[mask] === undefined) {
                this.grid[y][x].layers[mask] = [];
                this.grid[y][x].layers[mask][0] = [];
                this.grid[y][x].layers[mask][1] = [];
            }

            this.grid[y][x].layers[mask][1].push(body);
        }
    }

    removeBody(body) { 
        for(let i = 0; i < body._gridLocIndex.length; i++) {
            // Loop through body's indexed grid location
            let x = body._gridLocIndex[i].x;
            let y = body._gridLocIndex[i].y;

            for(let k = 0; k < this.grid[y][x].layers.length; k++) {

                if(this.grid[y][x].layers[k] === undefined) continue;

                // Get index of body in layer and mask

                let layerIndex = this.grid[y][x].layers[k][0].indexOf(body);
                let maskIndex = this.grid[y][x].layers[k][1].indexOf(body);

                // Remove if body found in grid

                if(layerIndex != -1) this.grid[y][x].layers[k][0].splice(layerIndex, 1);
                if(maskIndex != -1) this.grid[y][x].layers[k][1].splice(maskIndex, 1);
            }
        }
    }
}

class GridSection extends Point {
    constructor(xLoc, yLoc, gridSize) {
        super(xLoc, yLoc);
        this.layers = [];

        this.width = gridSize;
        this.halfWidth = gridSize / 2;
        this.height = gridSize;
        this.halfHeight = this.halfWidth;
    }

    setWidth(width) {
        this.width = width;
        this.height = width;
        this.halfWidth = width / 2;
        this.halfHeight = this.halfWidth;
    }
}

class GridIndex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}