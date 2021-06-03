import * as z0 from './z0/z0.js';
import { TextureManager } from './z0/graphics/texturemanager.js';
import { Scene } from './z0/tree/scene.js';
import { SpriteSheet } from './z0/graphics/spritesheet.js'; 
import * as Key from './z0/input/key.js';
import { getMouseX, getMouseY } from './z0/input/mouse.js';
import { Sprite2D } from './z0/graphics/sprite2d.js';
import { distanceSquared } from './z0/math/math2d.js';
import { ShaderSprite2D } from './z0/graphics/shadersprite2d.js';
import { CircleCollider } from './z0/physics/primitives/circlecollider.js';
import { AudioManager } from './z0/audio/audiomanager.js';
import { Grid, Tile } from './automata/scripts/grid.js';
import { Player } from './automata/scripts/player.js';

let canvas = document.querySelector('canvas');

z0._init(canvas);

export class Main extends Scene {
    static loaded = false;

    fungus = [];

    constructor() {
        super(450);
    }

    _start() {

        if(!Main.loaded) {
            let a1 = loadImage('./automata/sprites/ss.png');
            let a2 = loadImage('./automata/sprites/player.png');

            Promise.all([a1, a2]).then( (loaded) => {
                TextureManager.sprites = TextureManager.addTexture(loaded[0]);
                TextureManager.player = TextureManager.addTexture(loaded[1]);

                Tile.initSpriteSheet(TextureManager.sprites);

                AudioManager.background = AudioManager.createAudio('./automata/audio/red.ogg', 0.15);

                AudioManager.wallPlace = AudioManager.createAudio('./automata/audio/thump.wav', 0.4);

                AudioManager.next = AudioManager.createAudio('./automata/audio/pop.flac', 0.4);

                this.init();

                z0._startUpdates();
            });
        } else {
            this.init();
        }
    }
    
    grid;
    player;

    init() {

        Grid.init();
        Player.initSpriteSheet();
        this.grid = new Grid();
        this.player = new Player(200, 200)

    }

    c = 0;
    _update(delta) {

        let off = Math.cos(z0.getElapsedTime() / 1000) * 0.1;

        this.setBackgroundColour(125 / 255 + off, 73 / 255 + off, 21 / 255 + off, 1);


        let x = getMouseX()
        let y = getMouseY()

        let r = 50;

        for(let i = x - r; i < x + r; i += Grid.size) {
            for(let j = y - r; j < y + r; j += Grid.size) {
                this.grid.setValueAt(i, j, 0);
            }
        }

        this.grid.updateGraphics()

        if(Key.isKeyDown('i') ) {
            return
        }

        if(this.c > 600) return;
        this.grid.update();
        this.c++;
    }
}

let main = new z0.getTree().addScene(new Main());
z0.getTree().setActiveScene(main);

function loadImage(url) {
    return new Promise((res, rej) => {
        let image = new Image();
        image.addEventListener('load', () => {
            res(image);
        });
        image.addEventListener('error', () => {
            rej();
        })
        image.src = url;
    })
}