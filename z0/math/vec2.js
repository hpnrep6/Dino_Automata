export class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vec2) {
        this.x += vec2.x;
        this.y += vec2.y;
    }

    subtract(vec2) {
        this.x -= vec2.x;
        this.y -= vec2.y;
    }

}
