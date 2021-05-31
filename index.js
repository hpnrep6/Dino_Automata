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
            let sprites = loadImage('./automata/sprites/ss.png');

            Promise.all([sprites]).then( (loaded) => {
                TextureManager.sprites = TextureManager.addTexture(loaded[0]);

                Tile.initSpriteSheet(TextureManager.sprites);

                AudioManager.background = AudioManager.createAudio('./automata/audio/red.ogg', 0.15);

                AudioManager.wallPlace = AudioManager.createAudio('./automata/audio/thump.wav', 0.4);

                AudioManager.next = AudioManager.createAudio('./automata/audio/pop.flac', 0.4);

                z0._startUpdates();

                this.init();
            });
        } else {
            this.init();
        }
    }
    
    arr = [];
    a = [];
    static w = 10
    init() {
        for(let i = 0; i < this.sizew; i++) {
            this.arr.push([])
            this.a.push([])
            for(let j = 0; j < this.sizee; j++) {

                this.arr[i][j] = new Tile(i * Main.w + Main.w/2, j * Main.w + Main.w/2);
                this.arr[i][j].setSprite(1)
                this.a[i][j] = 1;
            }
        }

        let x = 25, y = 25
        this.a[x+1][y+1] = 0
        this.a[x+1][y+2] = 0
        this.a[x+2][y+1] = 0
        this.a[x+3][y+1] = 0
        this.a[x+2][y+3] = 0
        
    }
    con = 0;
    sizee = canvas.height / Main.w;
    sizew = canvas.width / Main.w;

    _update(delta) {

        let off = Math.cos(z0.getElapsedTime() / 1000) * 0.1;

        this.setBackgroundColour(125 / 255 + off, 73 / 255 + off, 21 / 255 + off, 1);

        if(Key.isKeyDown('w') ) {
            return
        }
        if(this.con > -1) {
        let n = [];

        for(let i = 0; i < this.sizew; i++) {
            n.push([])
            for(let j = 0; j < this.sizee; j++) {
                n[i][j] = this.a[i][j]
            }
        }


        for(let i = 1; i < this.sizew-1; i++) {
            for(let j = 1; j < this.sizee-1; j++) {
                let al = 0;
                for(let k = i - 1; k < i + 2; k++) {
                    for(let l = j - 1; l < j + 2; l++) {
                        if(this.a[k][l] == 0) {
                            if(k == i && l == j)
                                continue
                            al++;
                        }
                    }
                }

                if(this.a[i][j] == 0) {
                    if(al < 2) {
                        n[i][j] = 1
                    } else if(al > 4) {
                        n[i][j] = 1
                    }
                } else {
                    if(al == 3 || al == 4) {
                        n[i][j] = 0
                    }
                }
            }
        }

        this.a = n;
        
        for(let i = 0; i < this.sizew; i++) {

            for(let j = 0; j < this.sizee; j++) {
                if(this.a[i][j] == 0)
                    this.arr[i][j].setSprite(0)
                else
                    this.arr[i][j].setSprite(1)
            }
        }
        this.con = 0
    } else this.con++
        
    }

    start() {
        z0.getTree().setActiveScene(new L1(4, 0, 1)); 
    }
}

class Tile extends Sprite2D {
    static spriteSheet;

    static initSpriteSheet(image) {
        this.spriteSheet = new SpriteSheet(image);

        this.spriteSheet.createFrame(0,0,32,32);
        this.spriteSheet.createFrame(32,32,32,32);
    }
    
    constructor(x, y) {
        super(null, TextureManager.sprites, x, y, Main.w, Main.w, 0, 0, Tile.spriteSheet)

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