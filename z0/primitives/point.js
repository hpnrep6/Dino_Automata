export class Point {
    constructor(x, y) {
        this.xLoc = x;
        this.yLoc = y;
    }

    /**
     * Sets the location of the sprite relative to its parent module
     * 
     * @param {number} x Location in x-axis to set to
     * @param {number} y Location in y-axis to set to
     */
    setLoc(x, y) {
        this.xLoc = x;
        this.yLoc = y;
    }

    /**
     * Sets the location in the x-axis relative to its parent module
     * 
     * @param {number} x Location in x-axis to set to
     */
    
    setX(x) {
    	this.xLoc = x;
    }

    /**
     * Sets the location in the y-axis relative to its parent module
     * 
     * @param {number} y Location in y-axis to set to
     */
    setY(y) {
    	this.yLoc = y;
    }
    
    /**
     * Get the x location
     * 
     * @returns {number} X location
     */
    getX() {
        return this.xLoc;
    }

    /**
     * Get the y location
     * 
     * @returns {number} Y location
     */
    getY() {
        return this.yLoc;
    }
}