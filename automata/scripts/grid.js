import { Main } from '../../index.js';
import { SpriteSheet } from '../../z0/graphics/spritesheet.js';
import { Sprite2D } from '../../z0/graphics/sprite2d.js';
import *  as VAR from '../../z0/var.js'
import { TextureManager } from '../../z0/graphics/texturemanager.js';

export class Tile extends Sprite2D {
    static spriteSheet;

    static initSpriteSheet(image) {
        this.spriteSheet = new SpriteSheet(image);

        this.spriteSheet.createFrame(0,0,32,32);
        this.spriteSheet.createFrame(32,32,32,32);
        this.spriteSheet.createFrame(64,0,32,32);
        this.spriteSheet.createFrame(64,64,32,32);
    }
    
    constructor(x, y) {
        super(null, TextureManager.sprites, x, y, Grid.size, Grid.size, 0, 5, Tile.spriteSheet)

    }
}

export class Grid {
    static DEAD = 0;
    static ALIVE_1 = 1;
    static ALIVE_2 = 2;
    static ALIVE_3 = 3;

    static size = 8;
    static width;// = VAR.canvas.width / Grid.size + Grid.size;
    static height;// = VAR.canvas.height / Grid.size + Grid.size;
   
    static init() {
        this.width = VAR.canvas.width / Grid.size + Grid.size;
        this.height = VAR.canvas.height / Grid.size + Grid.size;
    }

    a_1 = 0;
    a_2 = 0;
    a_3 = 0;

    tiles = []
    buffer1 = [Grid.width];
    buffer2 = [Grid.width];
    usingBuffer1 = true;

    xLoc = Grid.size / 2 - Grid.size;
    yLoc = Grid.size / 2 - Grid.size;

    constructor() {
        for(let i = 0; i < Grid.width; i++) {
            this.tiles.push([])
            this.buffer1[i] = [];
            this.buffer2[i] = [];

            for(let j = 0; j < Grid.height; j++) {
                this.tiles[i][j] = new Tile(this.xLoc + i * Grid.size, this.yLoc + j * Grid.size)
                this.buffer1[i][j] = Grid.DEAD;
                this.buffer2[i][j] = Grid.DEAD;
            }
        }

        // this.buffer1[25][25] = Grid.ALIVE_1;

        // let x = 23, y = 25
        // this.buffer1[x+1][y+1] = Grid.ALIVE_1
        // this.buffer1[x+1][y+2] = Grid.ALIVE_1
        // this.buffer1[x+2][y+1] = Grid.ALIVE_1
        // this.buffer1[x+3][y+1] = Grid.ALIVE_1
        // this.buffer1[x+2][y+3] = Grid.ALIVE_1
        let x = 66, y = 44
        this.buffer1[x+1][y+1] = Grid.ALIVE_1
        this.buffer1[x+1][y+2] = Grid.ALIVE_1
        this.buffer1[x+2][y+1] = Grid.ALIVE_1
        this.buffer1[x+3][y+1] = Grid.ALIVE_1
        this.buffer1[x+2][y+3] = Grid.ALIVE_1

        //  x = 55, y = 53
        // this.buffer1[x+1][y+1] = Grid.ALIVE_2
        // this.buffer1[x+1][y+2] = Grid.ALIVE_2
        // this.buffer1[x+2][y+1] = Grid.ALIVE_2
        // this.buffer1[x+3][y+1] = Grid.ALIVE_2
        // this.buffer1[x+2][y+3] = Grid.ALIVE_2
        // x = 56, y = 55
        // this.buffer1[x+1][y+1] = Grid.ALIVE_2
        // this.buffer1[x+1][y+2] = Grid.ALIVE_2
        // this.buffer1[x+2][y+1] = Grid.ALIVE_2
        // this.buffer1[x+3][y+1] = Grid.ALIVE_2
        // this.buffer1[x+2][y+3] = Grid.ALIVE_2

        x = 68, y = 69
        this.buffer1[x+1][y+1] = Grid.ALIVE_2
        this.buffer1[x+1][y+2] = Grid.ALIVE_2
        this.buffer1[x+2][y+1] = Grid.ALIVE_2
        this.buffer1[x+3][y+1] = Grid.ALIVE_2
        this.buffer1[x+2][y+3] = Grid.ALIVE_2
        // x =67, y = 25
        // this.buffer1[x+1][y+1] = Grid.ALIVE_3
        // this.buffer1[x+1][y+2] = Grid.ALIVE_3
        // this.buffer1[x+2][y+1] = Grid.ALIVE_3
        // this.buffer1[x+3][y+1] = Grid.ALIVE_3
        // this.buffer1[x+2][y+3] = Grid.ALIVE_3
        // x =69, y = 22
        // this.buffer1[x+1][y+1] = Grid.ALIVE_3
        // this.buffer1[x+1][y+2] = Grid.ALIVE_3
        // this.buffer1[x+2][y+1] = Grid.ALIVE_3
        // this.buffer1[x+3][y+1] = Grid.ALIVE_3
        // this.buffer1[x+2][y+3] = Grid.ALIVE_3
        x =63, y = 62
        this.buffer1[x+1][y+1] = Grid.ALIVE_3
        this.buffer1[x+1][y+2] = Grid.ALIVE_3
        this.buffer1[x+2][y+1] = Grid.ALIVE_3
        this.buffer1[x+3][y+1] = Grid.ALIVE_3
        this.buffer1[x+2][y+3] = Grid.ALIVE_3

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
                        // } else if(al > 4) {
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
    }

    updateGraphics() {
        for(let i = 1; i < this.buffer1.length; i++) {
            for(let j = 1; j < this.buffer1[0].length ; j++) {
                this.tiles[i][j].setSprite(this.buffer1[i][j])
            }
        }
    }
}

export class GridPath {
    static spritesheet;

    static ALPHA_IDLE = 0.4;

    tiles = [];
    alpha = 1;

    xLoc = -Grid.size / 2;
    yLoc = -Grid.size /2;

    width;
    height;

    static init() {
        this.width = VAR.canvas.width / Grid.size + Grid.size;
        this.height = VAR.canvas.height / Grid.size + Grid.size;
    }

    constructor(imageData) {
        const WIDTH = 4;
        let index = 0;

        for(let i = 0, h = 0; i < Grid.height; i++, h++) {
            this.tiles.push([])

            for(let j = 0, w = 0; j < Grid.width; j++, w++) {
                this.tiles[i][j] = imageData[index] == 0 ? new Path(this.xLoc + w * Grid.size, this.yLoc + h * Grid.size) : undefined;
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

        this.spriteSheet.createFrame(125,125,32,32);
    }
    
    constructor(x, y) {
        super(null, TextureManager.sprites, x, y, Grid.size, Grid.size, 0, 5, Path.spriteSheet)

    }
}
