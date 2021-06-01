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
    
    grid;
    static w = 10
    init() {
        // for(let i = 0; i < this.sizew; i++) {
        //     this.arr.push([])
        //     this.a.push([])
        //     for(let j = 0; j < this.sizee; j++) {

        //         this.arr[i][j] = new Tile(i * Main.w + Main.w/2, j * Main.w + Main.w/2);
        //         this.arr[i][j].setSprite(1)
        //         this.a[i][j] = 1;
        //     }
        // }

        // let x = 25, y = 25
        // this.a[x+1][y+1] = 0
        // this.a[x+1][y+2] = 0
        // this.a[x+2][y+1] = 0
        // this.a[x+3][y+1] = 0
        // this.a[x+2][y+3] = 0
        this.grid = new Grid();
        
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

        this.grid.update();
    //     if(this.con > -1) {
    //     let n = [];

    //     for(let i = 0; i < this.sizew; i++) {
    //         n.push([])
    //         for(let j = 0; j < this.sizee; j++) {
    //             n[i][j] = this.a[i][j]
    //         }
    //     }


    //     for(let i = 1; i < this.sizew-1; i++) {
    //         for(let j = 1; j < this.sizee-1; j++) {
    //             let al = 0;
    //             for(let k = i - 1; k < i + 2; k++) {
    //                 for(let l = j - 1; l < j + 2; l++) {
    //                     if(this.a[k][l] == 0) {
    //                         if(k == i && l == j)
    //                             continue
    //                         al++;
    //                     }
    //                 }
    //             }

    //             if(this.a[i][j] == 0) {
    //                 if(al < 2) {
    //                     n[i][j] = 1
    //                 } else if(al > 4) {
    //                     n[i][j] = 1
    //                 }
    //             } else {
    //                 if(al == 3 || al == 4) {
    //                     n[i][j] = 0
    //                 }
    //             }
    //         }
    //     }

    //     this.a = n;
        
    //     for(let i = 0; i < this.sizew; i++) {

    //         for(let j = 0; j < this.sizee; j++) {
    //             if(this.a[i][j] == 0)
    //                 this.arr[i][j].setSprite(0)
    //             else
    //                 this.arr[i][j].setSprite(1)
    //         }
    //     }
    //     this.con = 0
    // } else this.con++
        
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
        this.spriteSheet.createFrame(64,0,32,32);
        this.spriteSheet.createFrame(64,64,32,32);
    }
    
    constructor(x, y) {
        super(null, TextureManager.sprites, x, y, Main.w, Main.w, 0, 0, Tile.spriteSheet)

    }
}

class Grid {
    static DEAD = 0;
    static ALIVE_1 = 1;
    static ALIVE_2 = 2;
    static ALIVE_3 = 3;

    static size = 10;
    static width = canvas.width / Grid.size;
    static height = canvas.height / Grid.size;
   
    a_1 = 0;
    a_2 = 0;
    a_3 = 0;

    tiles = []
    buffer1 = [Grid.width];
    buffer2 = [Grid.width];
    usingBuffer1 = true;

    xLoc = Grid.size / 2;
    yLoc = Grid.size / 2;

    constructor() {
        for(let i = 0; i < Grid.width; i++) {
            this.tiles.push([])
            this.buffer1[i] = [Grid.height];
            this.buffer2[i] = [Grid.height];

            for(let j = 0; j < Grid.height; j++) {
                this.tiles[i][j] = new Tile(this.xLoc + i * Grid.size, this.yLoc + j * Grid.size)
                this.buffer1[i][j] = Grid.DEAD;
                this.buffer2[i][j] = Grid.DEAD;
            }
        }

        let cur = this.buffer1;

        cur[25][25] = Grid.ALIVE_1;

        let x = 25, y = 25
        cur[x+1][y+1] = Grid.ALIVE_1
        cur[x+1][y+2] = Grid.ALIVE_1
        cur[x+2][y+1] = Grid.ALIVE_1
        cur[x+3][y+1] = Grid.ALIVE_1
        cur[x+2][y+3] = Grid.ALIVE_1


         x = 55, y = 53
        cur[x+1][y+1] = Grid.ALIVE_2
        cur[x+1][y+2] = Grid.ALIVE_2
        cur[x+2][y+1] = Grid.ALIVE_2
        cur[x+3][y+1] = Grid.ALIVE_2
        cur[x+2][y+3] = Grid.ALIVE_2
        x = 55, y = 55
        cur[x+1][y+1] = Grid.ALIVE_2
        cur[x+1][y+2] = Grid.ALIVE_2
        cur[x+2][y+1] = Grid.ALIVE_2
        cur[x+3][y+1] = Grid.ALIVE_2
        cur[x+2][y+3] = Grid.ALIVE_2

        x =67, y = 20
        cur[x+1][y+1] = Grid.ALIVE_3
        cur[x+1][y+2] = Grid.ALIVE_3
        cur[x+2][y+1] = Grid.ALIVE_3
        cur[x+3][y+1] = Grid.ALIVE_3
        cur[x+2][y+3] = Grid.ALIVE_3
        x =69, y = 23
        cur[x+1][y+1] = Grid.ALIVE_3
        cur[x+1][y+2] = Grid.ALIVE_3
        cur[x+2][y+1] = Grid.ALIVE_3
        cur[x+3][y+1] = Grid.ALIVE_3
        cur[x+2][y+3] = Grid.ALIVE_3

    }

    steps = 0;

    update() {
        this.steps++;

        let cur, next;

        if(this.usingBuffer1) {
            cur = this.buffer1;
            next = this.buffer2;
        } else {
            cur = this.buffer2;
            next = this.buffer1;
        }

        next = [];
        for(let i = 0; i < Grid.width; i++) {
            next.push([])
            for(let j = 0; j < Grid.height; j++) {
                next[i][j] = this.buffer1[i][j]
            }
        }

        let a_2_ind = 3;
        let a_3_ind = 3;

        if(this.steps > 50) {
             a_2_ind = this.a_1 < 50 ? 5 : 3;
             a_3_ind = this.a_2 < 50 ? 4 : 3;
        } else {
             a_2_ind = 3;
             a_3_ind = 3;
        }
        this.a_1 = 0;
        this.a_2 = 0;
        this.a_3 = 0;

        for(let i = 1; i < Grid.width -1; i++) {
            for(let j = 1; j < Grid.height -1; j++) {
                switch(cur[i][j]) {
                    case Grid.DEAD: {
                        let alive = [
                            0,0,0
                        ]

                        for(let k = i - 1; k < i + 2; k++) {
                            for(let l = j - 1; l < j + 2; l++) {
                                if(cur[k][l] > Grid.DEAD) {
                                    
                                    if(k == i && l == j)
                                        continue
                                    alive[cur[k][l]]++;
                                }
                            }
                        }

                        let max = 0, ind;
                        for(let i = 0; i < alive.length; i++) {
                            if(alive[i] > max) {
                                max = alive[i]
                                ind = i
                            }
                        }

                        if(max == 3 || max == 4) {
                            next[i][j] = ind;
                        }
                
                    } break;

                    case Grid.ALIVE_1: {
                        this.a_1++;

                        let al = 0;
                        for(let k = i - 1; k < i + 2; k++) {
                            for(let l = j - 1; l < j + 2; l++) {
                                if(cur[k][l] == Grid.ALIVE_3) {

                                    let c = (Math.cos((k * i + l * j + 11)) * 131 + this.steps) % 6

                                    if(c > 4)
                                        next[k][l] = Grid.ALIVE_1
                                }
                                else if(cur[k][l] == Grid.ALIVE_1) {
                                    if(k == i && l == j)
                                        continue
                                    al++;
                                }
                            }
                        }

                        if(al < 1) {
                            next[i][j] = Grid.DEAD
                        } else if(al > a_2_ind) {
                            next[i][j] = Grid.DEAD
                        }

                    } break;

                    case Grid.ALIVE_2: {
                        this.a_2++;

                        let al = 0;
                        for(let k = i - 1; k < i + 2; k++) {
                            for(let l = j - 1; l < j + 2; l++) {
                                if(cur[k][l] == Grid.ALIVE_1) {

                                    let c = (Math.cos((k * i + l * j + 1231) + this.steps) * 131) % 6

                                    if(c > 4)
                                        next[k][l] = Grid.ALIVE_2
                                }
                                else if(cur[k][l] == Grid.ALIVE_2) {
                                    if(k == i && l == j)
                                        continue
                                    al++;
                                }
                            }
                        }

                        if(al < 1) {
                            next[i][j] = Grid.DEAD
                        } else if(al > a_2_ind) {
                            next[i][j] = Grid.DEAD
                        }
                    } break;

                    case Grid.ALIVE_3: {
                        this.a_3++;

                        let al = 0;
                        for(let k = i - 1; k < i + 2; k++) {
                            for(let l = j - 1; l < j + 2; l++) {
                                if(cur[k][l] == Grid.ALIVE_2) {

                                    let c = (Math.cos((k * i + l * j + 131)) * 531 + this.steps) % 6

                                    if(c > 1)
                                        next[k][l] = Grid.ALIVE_3
                                }
                                else if(cur[k][l] == Grid.ALIVE_3) {
                                    if(k == i && l == j)
                                        continue
                                    al++;
                                }
                            }
                        }

                        if(al < 1) {
                            next[i][j] = Grid.DEAD
                        } else if(al > a_3_ind) {
                            next[i][j] = Grid.DEAD
                        }
                    } break;
                }
            }
        }
        
        for(let i = 1; i < Grid.width - 1; i++) {
            for(let j = 1; j < Grid.height - 1; j++) {
                this.tiles[i][j].setSprite(next[i][j])
                //this.tiles[i][j].setSprite(Math.trunc(next[i][j]))
            }
        }

        this.buffer1 = next;
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