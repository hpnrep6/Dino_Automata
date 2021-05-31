export function distance(x1, x2, y1, y2) {
    return Math.sqrt(distanceSquared(x1, x2, y1, y2));
}

export function distanceSquared(x1, x2, y1, y2) {
    return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
}

export function angleTo(fromX, toX, fromY, toY) {
    return Math.atan2(fromY - toY, toX - fromX);
}

export function angleToCartesian(fromX, toX, fromY, toY) {
    return angleTo(toX, fromX, fromY, toY);
}