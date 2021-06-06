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
import { Grid, Tile, GridPath, Path, GridGroup, ElectionText } from './automata/scripts/grid.js';
import { Player, Healthbar } from './automata/scripts/player.js';
import { Dino } from './automata/scripts/dino.js';

/**
 * Collider layers:
 * 
 * Layer [0, 1]
 * Dinosaur
 * 
 * Mask [0]
 * Player
 * 
 * Mask[1]
 * Bullet
 * 
 */

let canvas = document.querySelector('canvas');

let drawCanvas = document.createElement('canvas');

let drawContext = drawCanvas.getContext('2d');

z0._init(canvas);

export class Main extends Scene {
    static NUM_ITER = 1000;

    static loaded = false;

    fungus = [];

    constructor() {
        super(20000);
    }

    _start() {

        if(!Main.loaded) {
            let a1 = loadImage('./automata/sprites/ss.png');
            let a2 = loadImage('./automata/sprites/player.png');
            let a3 = loadImage('./automata/sprites/map.png');
            let a4 = loadImage('./automata/fonts/fontw.png');

            Promise.all([a1, a2, a3, a4]).then( (loaded) => {
                TextureManager.sprites = TextureManager.addTexture(loaded[0]);
                TextureManager.player = TextureManager.addTexture(loaded[1]);
                TextureManager.font = TextureManager.addTexture(loaded[3]);

                AudioManager.background = AudioManager.createAudio('./automata/audio/red.ogg', 0.15);

                AudioManager.wallPlace = AudioManager.createAudio('./automata/audio/thump.wav', 0.4);

                AudioManager.next = AudioManager.createAudio('./automata/audio/pop.flac', 0.4);

                drawCanvas.width = loaded[2].width;
                drawCanvas.height = loaded[2].height;
                drawContext.drawImage(loaded[2], 0, 0, loaded[2].width, loaded[2].height);
                Main.map = drawContext.getImageData(0, 0, drawCanvas.width, drawCanvas.height).data

                this.init();

                z0._startUpdates();
            });
        } else {
            this.init();
        }
    }

    static map;
    grid;
    player;
    dino;
    path;
    group;

    init() {

        Grid.init();
        GridPath.init();
        GridGroup.init();
        Player.initSpriteSheet();
        Dino.initSpriteSheet();
        Path.initSpriteSheet();
        Healthbar.initSpriteSheet();
        Tile.initSpriteSheet(TextureManager.sprites);
        Path.initSpriteSheet()
        
        this.grid = new Grid();
        this.player = new Player(475, 50)
        this.dino = new Dino(920, 900)
        this.path = new GridPath(Main.map)
        this.group = new GridGroup();

        let t = new ElectionText(200, 200, 50)
        t.setString('612')
    }

    iterations = 0;
    startedEnd = false;

    static CHANGE = 5;

    _update(delta) {

        let off = Math.cos(z0.getElapsedTime() / 1000) * 0.1;

        this.setBackgroundColour(125 / 255 + off, 73 / 255 + off, 21 / 255 + off, 1);

        if(!this.startedEnd) return;

        if(this.iterations > Main.NUM_ITER) return;

        this.grid.update();
        this.grid.updateGraphics();
        this.group.updateGraphics();
        this.iterations++;
        this.grid.iterations = this.iterations;

    }

    triggerEnd() {
        this.player.end();
        this.dino.end();

        this.startAutomata()
    }

    startAutomata() {
        this.startedEnd = true;
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

// 133 by 108