import { Main } from '../../index.js';
import { SpriteSheet } from '../../z0/graphics/spritesheet.js';
import { Sprite2D } from '../../z0/graphics/sprite2d.js';
import *  as VAR from '../../z0/var.js'
import { TextureManager } from '../../z0/graphics/texturemanager.js';
import { Module } from '../../z0/tree/module.js';
import { BitmapText } from '../fonts/bitmaptext.js';

export class Tile extends Sprite2D {
    static spriteSheet;

    static initSpriteSheet(image) {
        this.spriteSheet = new SpriteSheet(image);

        this.spriteSheet.createFrame(400,400,1,1);

        for(let i = 0; i < 7; i++) {
            this.spriteSheet.createFrame(i * 64, 0, 32, 32)
        }
    }
    
    constructor(x, y, parent, layer = 5, size = Grid.size) {
        super(parent, TextureManager.sprites, x, y, size, size, 0, layer, Tile.spriteSheet)

    }
}

export class Grid {
    static DEAD = 0;
    static ALIVE_1 = 1;
    static ALIVE_2 = 2;
    static ALIVE_3 = 3;

    static size = 10;
    static width;// = VAR.canvas.width / Grid.size + Grid.size;
    static height;// = VAR.canvas.height / Grid.size + Grid.size;
   
    parent;

    static init() {
        this.width = VAR.canvas.width / Grid.size + 2;
        this.height = VAR.canvas.height / Grid.size + 2;
    }

    static data;

    a_1 = 0;
    a_2 = 0;
    a_3 = 0;

    tiles = []
    buffer1 = [Grid.width];
    buffer2 = [Grid.width];
    usingBuffer1 = true;

    xLoc = Grid.size / 2 - Grid.size;
    yLoc = Grid.size / 2 - Grid.size;

    spriteOffset = 0;

    iterations = 0;

    constructor() {
        this.parent = new Module(null, 0, 0, 0)
        for(let i = 0; i < Grid.width; i++) {
            this.tiles.push([])
            this.buffer1[i] = [];
            this.buffer2[i] = [];

            for(let j = 0; j < Grid.height; j++) {
                this.tiles[i][j] = new Tile(this.xLoc + i * Grid.size, this.yLoc + j * Grid.size, this.parent)
                this.tiles[i][j].setAlpha(0.5)
                this.buffer1[i][j] = Grid.DEAD;
                this.buffer2[i][j] = Grid.DEAD;
            }
        }
        // let x = 66, y = 44
        // this.buffer1[x+1][y+1] = Grid.ALIVE_1
        // this.buffer1[x+1][y+2] = Grid.ALIVE_1
        // this.buffer1[x+2][y+1] = Grid.ALIVE_1
        // this.buffer1[x+3][y+1] = Grid.ALIVE_1
        // this.buffer1[x+2][y+3] = Grid.ALIVE_1

        // x = 68, y = 69
        // this.buffer1[x+1][y+1] = Grid.ALIVE_2
        // this.buffer1[x+1][y+2] = Grid.ALIVE_2
        // this.buffer1[x+2][y+1] = Grid.ALIVE_2
        // this.buffer1[x+3][y+1] = Grid.ALIVE_2
        // this.buffer1[x+2][y+3] = Grid.ALIVE_2

        // x =63, y = 62
        // this.buffer1[x+1][y+1] = Grid.ALIVE_3
        // this.buffer1[x+1][y+2] = Grid.ALIVE_3
        // this.buffer1[x+2][y+1] = Grid.ALIVE_3
        // this.buffer1[x+3][y+1] = Grid.ALIVE_3
        // this.buffer1[x+2][y+3] = Grid.ALIVE_3
    }

    setValueAt(x, y, v) {
        x -= this.xLoc;
        y -= this.yLoc;

        x /= Grid.size;
        y /= Grid.size;

        x += .5;
        y += .5;

        x = Math.floor(x);
        y = Math.floor(y);

        if(x < 1 || x >= Grid.width) return;
        if(y < 1 || y >= Grid.height) return;
        
        this.buffer1[x][y] = v;
        this.buffer2[x][y] = v;

        this.tiles[x][y].setSprite(this.buffer1[x][y]);
    }

    steps = 0;

    update() {
        this.steps++;

        let next;


        next = [];

        for(let i = 0; i < Grid.width; i++) {
            next.push(new Int16Array(Grid.height))
            for(let j = 0; j < Grid.height; j++) {
                next[i][j] = this.buffer1[i][j]
            }
        }

        let a_2_ind = 3;
        let a_3_ind = 3;

        if(this.steps > 50) {
             a_2_ind = this.a_1 < 50 ? 5 : 3;
             a_3_ind = this.a_2 < 50 ? 5 : 3;
        } else {
             a_2_ind = 3;
             a_3_ind = 3;
        }
        this.a_1 = 0;
        this.a_2 = 0;
        this.a_3 = 0;

        for(let i = 1; i < this.buffer1.length - 1; i++) {
            for(let j = 1; j < this.buffer1[0].length - 1; j++) {
                switch(this.buffer1[i][j]) {
                    case Grid.DEAD: {
                        let alive = [
                            0,0,0
                        ]

                        for(let k = i - 1; k < i + 2; k++) {
                            for(let l = j - 1; l < j + 2; l++) {
                                if(this.buffer1[k][l] > Grid.DEAD) {
                                    
                                    if(k == i && l == j)
                                        continue
                                    alive[this.buffer1[k][l]]++;
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
                                if(this.buffer1[k][l] == Grid.ALIVE_3) {

                                    let c = (Math.cos((k * i + l * j + 11)) * 131 + this.steps) % 6

                                    if(c > 4)
                                        next[k][l] = Grid.ALIVE_1
                                }
                                else if(this.buffer1[k][l] == Grid.ALIVE_1) {
                                    if(k == i && l == j)
                                        continue
                                    al++;
                                }
                            }
                        }

                        // if(al < 1) {
                        //     next[i][j] = Grid.DEAD
                        // } 
                        //else if(al > 4) {
                        //     next[i][j] = Grid.DEAD
                        // }

                    } break;

                    case Grid.ALIVE_2: {
                        this.a_2++;

                        let al = 0;
                        for(let k = i - 1; k < i + 2; k++) {
                            for(let l = j - 1; l < j + 2; l++) {
                                if(this.buffer1[k][l] == Grid.ALIVE_1) {

                                    let c = (Math.cos((k * i + l * j + 121) + this.steps) * 131) % 6

                                    if(c > 4)
                                        next[k][l] = Grid.ALIVE_2
                                }
                                else if(this.buffer1[k][l] == Grid.ALIVE_2) {
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
                                if(this.buffer1[k][l] == Grid.ALIVE_2) {

                                    let c = (Math.cos((k * i + l * j + 131)) * 531 + this.steps) % 6

                                    if(c > 3)
                                        next[k][l] = Grid.ALIVE_3
                                }
                                else if(this.buffer1[k][l] == Grid.ALIVE_3) {
                                    if(k == i && l == j)
                                        continue
                                    al++;
                                }
                            }
                        }

                        // if(al < 1) {
                        //     next[i][j] = Grid.DEAD
                        // } else if(al > a_3_ind) {
                        //     next[i][j] = Grid.DEAD
                        // }
                    } break;
                }
            }
        }
    
        this.buffer1 = next;
        Grid.data = this.buffer1
    }

    updateGraphics() {
        if(this.iterations > Main.STAGE_2) {
            this.spriteOffset = 4;
        }

        for(let i = 1; i < this.buffer1.length; i++) {
            for(let j = 1; j < this.buffer1[0].length ; j++) {
                this.tiles[i][j].setSprite(this.buffer1[i][j] + this.spriteOffset)
            }
        }
    }
}

export class GridGroup {
    static mult = 10
    static size = Grid.size * GridGroup.mult;

    parent;

    tiles = [];
    alpha = 1;

    xLoc = GridGroup.size / 2;
    yLoc = GridGroup.size / 2;

    static width;
    static height;

    static init() {
        this.width = VAR.canvas.width / GridGroup.size ;
        this.height = VAR.canvas.height / GridGroup.size;
    }

    constructor() { 
        this.parent = new Module(null, 0, 0, 0);

        for(let i = 0; i < GridGroup.width; i++) {
            this.tiles.push([])

            for(let j = 0; j < GridGroup.height; j++) {
                this.tiles[i][j] = new Tile(i * GridGroup.size + this.xLoc, j * GridGroup.size + this.yLoc, this.parent, 4, GridGroup.size);
                this.tiles[i][j].setAlpha(0.15)
            }
        }
    }

    updateGraphics() {
        let tiles = Grid.data;

        for(let i = 0; i < GridGroup.width; i++) {
            for(let j = 0; j < GridGroup.height; j++) {
                let x = i * GridGroup.mult;
                let y = j * GridGroup.mult;

                let arr = [0,0,0,0]

                for(let k = x; k < x + 10; k++) {
                    for(let l = y; l < y + 10; l++) {
                        arr[tiles[k][l] % 4]++;

                    }
                }

                let max = 0;
                let ind = 0;
                for(let k = 1; k < arr.length; k++) {
                    if(arr[k] > max) {
                        max = arr[k]
                        ind = k;
                    }
                }

                this.tiles[i][j].setSprite(4+ ind)
            }
        }
    }

    setAlpha(a) {
        for(let i = 0; i < GridGroup.width; i++) {
            for(let j = 0; j < GridGroup.height; j++) {
                this.tiles[i][j].setAlpha(a);
            }
        }
    }
}


export class GridPath extends Module{
    static spritesheet;

    static ALPHA_IDLE = 0.4;

    tiles = [];
    alpha = 1;

    xLoc = -Grid.size / 2;
    yLoc = -Grid.size / 2;

    width;
    height;

    static init() {
        this.width = VAR.canvas.width / Grid.size + Grid.size;
        this.height = VAR.canvas.height / Grid.size + Grid.size;
    }

    constructor(imageData) {
        super(null, 0, 0, 0);
        const WIDTH = 4;
        let index = 0;

        for(let i = 0, h = 0; i < Grid.height; i++, h++) {
            this.tiles.push([])

            for(let j = 0, w = 0; j < Grid.width; j++, w++) {
                this.tiles[i][j] = imageData[index] == 0 ? new Path(this.xLoc + w * Grid.size, this.yLoc + h * Grid.size, this) : undefined;
                index += WIDTH;
            }
        }

    }

    getTileAt(y, x) {
        x -= this.xLoc;
        y -= this.yLoc;

        x /= Grid.size;
        y /= Grid.size;

        x += .5;
        y += .5;

        x = Math.floor(x);
        y = Math.floor(y);

        if(x < 0 || x >= Grid.height) return;
        if(y < 0 || y >= Grid.width) return;
        
        return this.tiles[x][y];
    }

    setAlpha(a) { 
        if(this.alpha != a) {
            for(let i = 0; i < this.tiles.length; i++) {
                for(let j = 0; j < this.tiles[0].length; j++) {
                    if(this.tiles[i][j])
                        this.tiles[i][j].setAlpha(a);
                    
                }
            }
            this.alpha = a;
        }
    }

    destroyPath(y, x) {
        x -= this.xLoc;
        y -= this.yLoc;

        x /= Grid.size;
        y /= Grid.size;

        x += .5;
        y += .5;

        x = Math.floor(x);
        y = Math.floor(y);

        if(x < 0 || x >= Grid.height) return;
        if(y < 0 || y >= Grid.width) return;

        if(this.tiles[x][y] != undefined)
            this.tiles[x][y].setVisible(false);
            this.tiles[x][y] = undefined;
    }
}


export class Path extends Sprite2D {
    static spriteSheet;

    static initSpriteSheet() {
        this.spriteSheet = new SpriteSheet(TextureManager.sprites);

        this.spriteSheet.createFrame(0,64,32,32);
        this.spriteSheet.createFrame(64,64,32,32);
    }
    
    constructor(x, y, parent) {
        super(parent, TextureManager.sprites, x, y, Grid.size, Grid.size, 0, 5, Path.spriteSheet)
        this.setSprite(Math.floor((Math.random() * 12231) % 2));
    }
}

export class ElectionText extends BitmapText {
    
    constructor(x, y, size, index = 0) {
        super(null, x, y, TextureManager.font, 5, 7, size, size * (7/5), 14);

        if(index < 0) return;

        let s = new SpriteSheet(TextureManager.flag);

        s.createFrame(0, 128 * (index * 2), 256, 128);

        let xx = 100, yy = 50;

        if(index == 3) {
            xx *= 1.5;
            yy *= 1.5;
        }
        this.flag = new Sprite2D(this, TextureManager.flag, -100, 10, xx, yy, 0, 14, s);
        this.flag.setVisible(false);
    }

    setString(str) {
        super.setString(str);
        this.flag.setVisible(true);
    }
}