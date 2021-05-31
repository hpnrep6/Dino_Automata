import * as MATH from '../../math/math2d.js';

export function intersectingRectCircle(rect, circle) {
    let tx = circle.xLoc, ty = circle.yLoc;

    if(circle.xLoc < rect.xLoc - rect.halfWidth) {
        tx = rect.xLoc - rect.halfWidth;
    } else if(circle.xLoc > rect.xLoc + rect.halfWidth) {
        tx = rect.xLoc + rect.halfWidth;
    }

    if(circle.yLoc < rect.yLoc - rect.halfHeight) {
        ty = rect.yLoc - rect.halfHeight;
    } else if(circle.yLoc > rect.yLoc + rect.halfHeight) {
        ty = rect.yLoc + rect.halfHeight;
    }

    return (
        MATH.distanceSquared(circle.xLoc, tx, circle.yLoc, ty) <= Math.pow(circle.radius, 2)
    );
}

export function intersectingRectRect(rect1, rect2) {
    return (
        // 2 Left                      // 1 Right
        rect2.xLoc - rect2.halfWidth < rect1.xLoc + rect1.halfWidth    &&
        // 2 Right                     // 1 Left
        rect2.xLoc + rect2.halfWidth > rect1.xLoc - rect1.halfWidth    &&
        
        // 2 Top                        // 1 Bottom
        rect2.yLoc - rect2.halfHeight < rect1.yLoc + rect1.halfHeight  &&
        // 2 Bottom                     // 1 Top
        rect2.yLoc + rect2.halfHeight > rect1.yLoc - rect1.halfHeight 
    );

}

export function intersectingCircleCircle(circle1, circle2) {
    return MATH.distanceSquared(circle1.xLoc, circle2.xLoc, circle1.yLoc, circle2.yLoc) < Math.pow(circle1.radius + circle2.radius, 2);
}