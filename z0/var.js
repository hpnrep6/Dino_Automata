import { Colour } from './graphics/colour/colour.js';

export const WEBGL_1 = 1;

export const WEBGL_2 = 2;

export var gl;

export var glVersion;

export var canvas;

export var defaultColour = new Colour(0, .2, 0, 1);

export function setGL(canvas_) {
    gl = canvas_.getContext('webgl2');

    if(!gl) {
        gl = canvas_.getContext('webgl');
        glVersion = WEBGL_1;
    } else {
        glVersion = WEBGL_2;
    }
}

export function setCanvas(newCanvas) {
    canvas = newCanvas;
}

export function setDefaultColour(r, g, b, a) {
    defaultColour = new Colour(r, g, b, a);
}

export function getGLVersion() {
    return glVersion;
}

export function getGL() {
    return gl;
}

export function getCanvas() {
    return canvas;
}

export function getDefaultColour() {
    return defaultColour;
}