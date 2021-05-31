import * as VAR from '../var.js';

export class SceneTree {
    static canvas;

    constructor() {
        this.scenes = [];
        this.active = null;

        SceneTree.canvas = VAR.canvas;
    }

    _update(delta) {
        this.active._updateScene(delta);
    }

    setActive(scene) { 
        if(typeof scene === 'number') {
            
            if(this.active !== null) {
                this.active._destroy();
            }
            this.active = this.scenes[scene]; 
        
        // Assuming its a scene
        } else {
            if(this.active !== null) {
                this.active._destroy();
            }

            this.active = scene;
        }

        this.active._start();
    }

    setActiveScene(scene) {
        this.setActive(scene);
    }

    getActive() {
        return this.active;
    }

    getActiveScene() {
        return this.active;
    }

    addScene(scene) {
        return this.scenes.push(scene) - 1;
    }

    getScenes() {
        return this.scenes;
    }
}