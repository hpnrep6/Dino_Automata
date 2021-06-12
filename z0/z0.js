
/*
MIT License

Copyright (c) 2021 hpnrep6

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import * as MOUSE from './input/mouse.js';
import * as VAR from './var.js';
import { GLCanvas } from './graphics/glcanvas.js';
import { SceneTree } from './tree/tree.js';

export var tree;

var hasInit = false;

export function _init(canvas) {
    if(canvas === undefined) throw new Error('A html canvas object must be passed into the _init() function');
    
    MOUSE.init(canvas);

    VAR.setGL(canvas);

    VAR.setCanvas(canvas);

    tree = new SceneTree();

    hasInit = true;
}

export var elapsed = 0;

var lastUpdateTime = 0;

var delta = 0;

const loop = (time) => {

    // Start scene update
    tree._update(getDelta(time));

    // Callback to loop on the next update frame
    window.requestAnimationFrame(loop);
}

function getDelta(time) {
    // Setup delta time variable
    elapsed = time;

    // Convert change in time to seconds
    delta = (time - lastUpdateTime) / 1000;

    // Reset lastUpdateTime for next loop
    lastUpdateTime = time;

    return delta;
}

export function _startUpdates() {
    if(!hasInit) throw new Error('_init() must be called before updates can start.');

    window.requestAnimationFrame(loop);
}

export function setBackgroundColour(r, g, b, a) {
    tree.getActive().getGLCanvas().setBackgroundColour(r, g, b, a);
}

export function setActiveScene(scene) {
    tree.setActiveScene(scene);
}

export function getActiveScene() {
    return tree.getActive();
}

export function getTree() {
    return tree;
}

export function getCanvas() {
    return VAR.canvas;
}

export function getCanvasWidth() {
    return VAR.canvas.width;
}

export function getCanvasHeight() {
    return VAR.canvas.height;
}

export function getGL() {
    return VAR.gl;
}

export function getElapsedTime() {
    return elapsed;
}

export function getDeltaTime() {
    return delta;
}
