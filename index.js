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
            let a5 = loadImage('./automata/sprites/bkg.png')

            Promise.all([a1, a2, a3, a4, a5]).then( (loaded) => {
                TextureManager.sprites = TextureManager.addTexture(loaded[0]);
                TextureManager.player = TextureManager.addTexture(loaded[1]);
                TextureManager.font = TextureManager.addTexture(loaded[3]);
                TextureManager.bkg = TextureManager.addTexture(loaded[4])

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
    bkg;

    rT
    bT
    yT
    yearT;

    flash;

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

        this.rT = new ElectionText(200, 50, 50)
        this.bT = new ElectionText(300, 50, 50)
        this.yT = new ElectionText(400, 50, 50)
        this.yearT = new ElectionText(600, 50, 50)

        let ss = new SpriteSheet(TextureManager.bkg);
        ss.createFrame(0, 0, 1000, 800);
        ss.createFrame(0, 800, 1000, 800);

        this.bkg = new Sprite2D(null, TextureManager.bkg, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, 1, ss)
        
        let sss = new SpriteSheet(TextureManager.player);
        sss.createFrame(508, 17, 1, 1);
        this.flash = new Sprite2D(null, TextureManager.player, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, 40, sss)
        this.flash.setVisible(false)
    }

    iterations = 0;
    startedEnd = false;

    static CHANGE = 20;

    static STAGE_2 = 200;

    static STAGE_2_TRANS = 50;

    static STAGE_3 = Main.STAGE_2 + 67;

    stage_2_count = 0;

    static skip = 10;

    stage_2_iter = 0;

    // 2056 - 1788
    // 67

    _update(delta) {

        let off = Math.cos(z0.getElapsedTime() / 1000) * 0.1;

        this.setBackgroundColour(125 / 255 + off, 73 / 255 + off, 21 / 255 + off, 1);

        if(!this.startedEnd) return;

        if(this.iterations < Main.STAGE_2) {

            this.grid.update();
            this.grid.updateGraphics();
            
            this.iterations++;
            this.grid.iterations = this.iterations;

            if(this.iterations > Main.STAGE_2 - Main.STAGE_2_TRANS) {
                this.flash.setVisible(true);
            }
        } else if(this.iterations < Main.STAGE_3) {
            if(this.stage_2_count > Main.skip) {
                this.stage_2_count = 0;
                this.stage_2_iter++;

                this.grid.update();
                this.grid.updateGraphics();
                
                this.iterations++;
                this.grid.iterations = this.iterations;
                this.yearT.setString((1788 + 4 * Math.floor((this.iterations - Main.STAGE_2))).toString())
            }
            this.stage_2_count++;
            this.flash.setAlpha((Main.STAGE_2 + 10 - this.iterations) / 10);
        }


        if(this.iterations < Main.STAGE_2) return;

        this.bkg.setSprite(1)
        this.group.updateGraphics();

        let data = this.group.tiles;

        let b = 0, y = 0, r = 0;

        for(let i = 0; i < data.length; i++) {
            for(let j = 0; j < data[0].length; j++) {
                let cur = data[i][j].spriteIndex;

                if(cur == 1 + 4) b++
                else if (cur == 2 + 4) y++;
                else if (cur == 3 + 4) r++;
            }
        }

        this.rT.setString(r.toString());
        this.yT.setString(y.toString());
        this.bT.setString(b.toString());
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