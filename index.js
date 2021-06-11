import * as z0 from './z0/z0.js';
import { TextureManager } from './z0/graphics/texturemanager.js';
import { Scene } from './z0/tree/scene.js';
import { SpriteSheet } from './z0/graphics/spritesheet.js'; 
import * as Key from './z0/input/key.js';
import { getMouseX, getMouseY } from './z0/input/mouse.js';
import { Sprite2D } from './z0/graphics/sprite2d.js';
import { distanceSquared, distance } from './z0/math/math2d.js';
import { ShaderSprite2D } from './z0/graphics/shadersprite2d.js';
import { CircleCollider } from './z0/physics/primitives/circlecollider.js';
import { AudioManager } from './z0/audio/audiomanager.js';
import { Grid, Tile, GridPath, Path, GridGroup, ElectionText } from './automata/scripts/grid.js';
import { Player, Healthbar } from './automata/scripts/player.js';
import { Dino } from './automata/scripts/dino.js';
import { UI, Start, Title, Instructions, InstructionScreen, Info } from './automata/scripts/ui.js';
import { AARectangle } from './z0/physics/primitives/aarectcollider.js';
import { Sponge, Travel } from './automata/scripts/shader.js';

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

export class Menu extends Scene {
    static loaded;
    inited = false;

    static menuBkgRenderer;
    bkg;
    
    fade;

    constructor() {
        super(200);
        this.inited = true;
    }

    _start() {
        if(!Menu.loaded) {
            let a1 = loadImage('./automata/sprites/ss.png');
            let a2 = loadImage('./automata/sprites/player.png');
            let a3 = loadImage('./automata/sprites/map.png');
            let a4 = loadImage('./automata/fonts/fontw.png');
            let a5 = loadImage('./automata/sprites/bkg.png');
            let a6 = loadImage('./automata/sprites/flag.png'),
            a7 = loadImage('./automata/sprites/menu.png'),
            a8 = loadImage('./automata/sprites/dead.png'),
            a9 = loadImage('./automata/sprites/ending.png'),
            a10 = loadImage('./automata/sprites/intro.png');

            Promise.all([a1, a2, a3, a4, a5, a6, a7, a8, a9, a10]).then( (loaded) => {
                TextureManager.sprites = TextureManager.addTexture(loaded[0]);
                TextureManager.player = TextureManager.addTexture(loaded[1]);
                TextureManager.font = TextureManager.addTexture(loaded[3]);
                TextureManager.bkg = TextureManager.addTexture(loaded[4])
                TextureManager.flag = TextureManager.addTexture(loaded[5]);
                TextureManager.menu = TextureManager.addTexture(loaded[6]);
                TextureManager.dead = TextureManager.addTexture(loaded[7]);
                TextureManager.end = TextureManager.addTexture(loaded[8]);
                TextureManager.intro = TextureManager.addTexture(loaded[9]);

                AudioManager.background = AudioManager.createAudio('./automata/audio/red.ogg', 0.15);

                AudioManager.wallPlace = AudioManager.createAudio('./automata/audio/thump.wav', 0.4);

                AudioManager.next = AudioManager.createAudio('./automata/audio/pop.flac', 0.4);

                drawCanvas.width = loaded[2].width;
                drawCanvas.height = loaded[2].height;
                drawContext.drawImage(loaded[2], 0, 0, loaded[2].width, loaded[2].height);
                Main.map = drawContext.getImageData(0, 0, drawCanvas.width, drawCanvas.height).data

                Menu.menuBkgRenderer = new Sponge();
                Main.travelRenderer = new Travel();

                Menu.loaded = true;
                this.init();

                z0._startUpdates();
            });
        } else {
            this.init();
        }
    }

    init() {
        UI.initSpriteSheet();

        UI.state = UI.STATE_MENU;

        this.mouseCol = new AARectangle(null, -200, -200, 0, 3, [0], [0])
        this.setBackgroundColour(0,0,0,1)

        let x = canvas.width / 2;
        let w = 400;
        new Start(x, 500, w, w /3)
        new Instructions(x, 640, w  + w * (1/3), w/3)

        w = 800;
        new Title(x, 200, w, w * (3/5));

        this.bkg = new ShaderSprite2D(null, Menu.menuBkgRenderer, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, 0);

        let s = new SpriteSheet(TextureManager.player);
        s.createFrame(510, 55, 1, 1);

        this.fade = new Sprite2D(this, TextureManager.player, canvas.width /2, canvas.height / 2, canvas.width, canvas.height, 0, 30, s);

        if(Main.party == 6) {
            document.title = 'Time Safari, Inc.'
        } else if(Main.party == 7) {
            document.title = 'Tyme Sefari, Inc.'
        } else if(Main.party === 8) {
            document.title = '時間の狩り, Inc.'
        }

        this.setBackgroundColour(0,0,0,1);
    }

    showInstructions() {
        new InstructionScreen(canvas.width / 2, canvas.height / 2, 700, 700);
    }
    
    startGame() {
        new Info(canvas.width / 2, canvas.height / 2, 700, 700);
    }

    startIntro() {
        this.started = true;
    }

    started = false;
    timer = 2;

    _update(delta) {
        if(this.mouseCol)
            this.mouseCol.setLoc(getMouseX(), getMouseY());

        if(this.fade.getAlpha() < 2 && this.fade.getAlpha() > -1 && !this.started) {
            this.fade.setAlpha(this.fade.getAlpha() - delta / 2)
        }

        if(this.started) {
            this.timer -= delta;

            this.fade.setAlpha((2 - this.timer) / 2)
            if(this.timer < 0) {
                z0.getTree().setActiveScene(new Intro());
                return;
            }
        }
    }
}

export class Intro extends Scene {
    constructor() {
        super(3000)
        this.setBackgroundColour(0,0,0,1);
        new Sprite2D(this, TextureManager.intro, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0 , 1)

        let s = new SpriteSheet(TextureManager.player);
        s.createFrame(510, 55, 1, 1);
        this.black = new Sprite2D(this, TextureManager.player, canvas.width - 250, canvas.height - 25, 500, 50, 0, 2, s);

        this.fade = new Sprite2D(this, TextureManager.player, canvas.width /2, canvas.height / 2, canvas.width, canvas.height, 0, 30, s);

    }

    fTime = 0;

    _update(delta) {
        if(Key.isKeyDown(' ')) {
            z0.setActiveScene(new Main());
            return;
        }

        if(this.fade.getAlpha() > 0)
            this.fade.setAlpha(this.fade.getAlpha() - delta);

        this.fTime -= delta;

        if(this.fTime < 0) {
            this.black.setAlpha(!this.black.getAlpha())
            this.fTime = 1;
        }
    }
}

export class Main extends Scene {
    static loaded = false;

    static party = 6;

    fungus = [];

    constructor() {
        super(20000);
    }

    _start() {
        this.init();
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
    rC
    bC
    yC

    eT;

    yearT;

    flash;
    fade;
    fade2;
    death;
    machine;
    machineFlash;
    trees = [];

    travel;
    travelRenderer;

    ending;

    init() {

        Grid.init();
        GridPath.init();
        GridGroup.init();
        Player.initSpriteSheet();
        Dino.initSpriteSheet();
        Path.initSpriteSheet();
        Healthbar.initSpriteSheet();
        ElectionRes.initSpriteSheet();
        Tile.initSpriteSheet(TextureManager.sprites);
        Path.initSpriteSheet()
        
        this.grid = new Grid();
        this.player = new Player(475, 50)
        this.dino = new Dino(500, 1500)
        this.path = new GridPath(Main.map)
        this.group = new GridGroup();

        this.rT = new ElectionText(170, 50 + 120, 50, 0)
        this.bT = new ElectionText(170, 150 + 120, 50, 1)
        this.yT = new ElectionText(170, 250 + 120, 50, 2)
        this.yearT = new ElectionText(170, 70, 60, 3)

        let ss = new SpriteSheet(TextureManager.bkg);
        ss.createFrame(0, 0, 1000, 800);
        ss.createFrame(0, 800, 1000, 800);

        this.bkg = new Sprite2D(null, TextureManager.bkg, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, 1, ss)
        
        let sss = new SpriteSheet(TextureManager.player);
        sss.createFrame(508, 17, 1, 1);
        this.flash = new Sprite2D(null, TextureManager.player, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, 40, sss)
        this.flash.setVisible(false);

        sss.createFrame(0, 7 * 32, 64, 64);
        this.machine = new TimeMachine(483, 45, 100, sss);
        this.machine.setSprite(1)

        sss.createFrame(0, 10 * 32, 64, 64);
        this.machineFlash = new Sprite2D(null, TextureManager.player, 485, 60, 150, 150, 0, 14, sss);
        this.machineFlash.setSprite(2)
        this.machineFlash.setVisible(false);

        sss.createFrame(510, 55, 1, 1);
        this.fade = new Sprite2D(null, TextureManager.player, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, 13, sss);
        this.fade.setAlpha(0)
        this.fade.setSprite(3);
        this.fade.setVisible(false);

        this.fade2 = new Sprite2D(null, TextureManager.player, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, 20, sss);
        this.fade2.setAlpha(0)
        this.fade2.setSprite(3);
        this.fade2.setVisible(false);

        this.fade3 = new Sprite2D(null, TextureManager.player, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, 30, sss);
        this.fade3.setAlpha(2)
        this.fade3.setSprite(3);

        this.dead = new Sprite2D(null, TextureManager.dead, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, 24);
        this.dead.setAlpha(0);
        this.dead.setVisible(false);


        let ssss = new SpriteSheet(TextureManager.end)
        let wwww = 682;

        ssss.createFrame(0 * wwww, 0, wwww, 2048);
        ssss.createFrame(1 + wwww, 0, wwww, 2048);
        ssss.createFrame(2 + 2 * wwww, 0, wwww, 2048);

        let hi = (canvas.width / wwww) * 2048;

        this.ending = new Sprite2D(null, TextureManager.end, canvas.width / 2, hi - 500, canvas.width, hi, 0, 26, ssss);
        this.ending.setVisible(false);
        
        {
            let ssss = new SpriteSheet(TextureManager.player);
            ssss.createFrame(2 * 32, 6 * 32, 64, 64 + 32);
            ssss.createFrame(4 * 32, 6 * 32, 64, 64 + 32);
            ssss.createFrame(6 * 32, 6 * 32, 64, 64 + 32);

            Tree.spritesheet = ssss;

            let trees = [
                89, 20, 0,
                233, 203, 2,
                73, 373, 1,
                41, 664, 2,
                362, 471, 2,
                285, 715, 1,
                519, 594, 2,
                852, 65, 2,
                641, 175, 1,
                844, 393, 0,
            ];

            for(let i = 0; i < trees.length; i += 3) {
                this.trees.push(new Tree(trees[i], trees[i + 1], trees[i + 2]))
            }
        }

        this.travel = new ShaderSprite2D(null, Main.travelRenderer, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, 4);
        this.travel.setVisible(false);
        this.setBackgroundColour(0,0,0,1);
    }

    iterations = 0;
    startedEnd = false;

    static CHANGE = 20;

    static STAGE_2 = 500;

    static STAGE_2_TRANS_1 = 50;

    static STAGE_2_2 = Main.STAGE_2 + 500;

    static STAGE_3 = Main.STAGE_2_2 + 67;

    static STAGE_4 = Main.STAGE_3 + 300;

    static STAGE_5 = Main.STAGE_4 + 300;

    static STAGE_6 = Main.STAGE_5 + 200;

    stage_2_count = 0;

    static skip = 20;

    stage_2_iter = 0;

    canEnd = false;

    winner;

    // 2056 - 1788
    // 67

    _update(delta) {
        if(delta == 0) {
            return;
        }

        if(Key.isKeyDown('escape')) {
            z0.getTree().setActiveScene(new Menu());
            return;
        }

        if(this.fade3.getAlpha() > 0) {
            this.fade3.setAlpha(this.fade3.getAlpha() - delta)
        }
        
        if(!this.startedEnd) return;

        this.setBackgroundColour(1,1,1,1)

        if(this.iterations < Main.STAGE_2) {

            this.grid.update();
            this.grid.updateGraphics();
            
            this.iterations++;
            this.grid.iterations = this.iterations;

            for(let i = 0; i < this.trees.length; i ++) {
                this.trees[i].setAlpha(this.trees[i].getAlpha() - delta * 0.2);
            }

            if(this.iterations > Main.STAGE_2 - Main.STAGE_2_TRANS_1) {
                this.flash.setVisible(true);
                for(let i = 0; i < this.trees.length; i++) {
                    this.trees.pop().removeSelf();
                }
            }
        } else if (this.iterations < Main.STAGE_2_2) {

            if(this.iterations == Main.STAGE_2 + 1) {
                this.grid.setAlpha(0.12);

            }


            this.grid.update();
            this.grid.updateGraphics();
            
            this.iterations++;
            this.grid.iterations = this.iterations;

            this.flash.setAlpha((Main.STAGE_2 + 10 - this.iterations) / 10);

            if(this.path) {
                this.path.removeSelf();
                this.path = undefined;
            }
            this.travel.setVisible(true);

            if(this.iterations > Main.STAGE_2_2 - Main.STAGE_2_TRANS_1) {
                this.flash.setVisible(true);
                this.flash.setAlpha(1)
            }

        } else if(this.iterations < Main.STAGE_3) {

            if(this.iterations == Main.STAGE_3) {
                this.grid.setAlpha(1);
            }

            if(this.stage_2_count > Main.skip) {
                this.stage_2_count = 0;
                this.stage_2_iter++;

                this.grid.update();
                this.grid.updateGraphics();
                
                this.iterations++;
                this.grid.iterations = this.iterations;
                this.yearT.setString((1788 + 4 * Math.floor((this.iterations - Main.STAGE_2_2))).toString())
            }
            this.stage_2_count++;
            this.travel.setVisible(false);
            this.flash.setAlpha((Main.STAGE_2_2 + 10 - this.iterations) / 10);
        } else {
            let arr = [this.rC, this.yC, this.bC];

            let max = 0, index = 0;
            for(let i = 0; i < arr.length; i++) {
                if(arr[i] > max) {
                    index = i;
                    max = arr[i]
                }
            }

            if(!this.winner) 
                switch(index) {
                    case 0:
                        Main.party = 6;
                        this.winner = 0;
                        this.ending.setSprite(0);
                        break;
                    case 1:
                        Main.party = 7;
                        this.winner = 1;
                        this.ending.setSprite(2);
                        break;
                    case 2:
                        Main.party = 8;
                        this.winner = 2;
                        this.ending.setSprite(1);
                        break;
                }

            if(!this.eT) {
                this.eT = new ElectionRes(canvas.width / 2, canvas.height / 2 + 100, 230, index)
            }

            this.iterations++;

            if(this.iterations > Main.STAGE_4) {
                this.fade.setVisible(true);
                this.fade.setAlpha(this.fade.getAlpha() + delta/2);
            }

            if(this.iterations > Main.STAGE_5) {
                this.fade2.setVisible(true);
                this.fade2.setAlpha(this.fade2.getAlpha() + delta/ 5);
            }

            if(this.iterations > Main.STAGE_6) {
                this.ending.setVisible(true);
                this.ending.setY(this.ending.getY() - 50 * 1.05 * delta);

                if(this.ending.getY() < -300) {
                    z0.setActiveScene(new Menu());
                    return;
                }
            }
        }


        if(this.iterations < Main.STAGE_2_2) return;

        if(this.bkg.getZ() != 6) {
            this.bkg.setSprite(1)
            this.bkg.setZ(6)
        }

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
        this.rC = r;
        this.yC = y;
        this.bC = b;
    }

    triggerEnd() {
        

        this.canEnd = true;
    }

    startAutomata() {
        this.startedEnd = true;
        this.dino.end();
        this.player.end();
    }
}

let main = new z0.getTree().addScene(new Menu());
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

class Tree extends Sprite2D {
    static spritesheet;
    
    constructor(x, y, t) {
        super(null, TextureManager.player, x, y, 200, 200 * (3/2), 0, 10, Tree.spritesheet);
        this.setSprite(t);
    }

    _update(delta) {
        if(distance(this.xLoc, this.getParent().dino.xLoc, this.yLoc, this.getParent().dino.yLoc) < 80) {
            this.setVisible(false)
        }
    }
}

class TimeMachine extends Sprite2D {
    static DIST = 40;

    startAnim = false;
    size;

    constructor(x, y, s, ss) {
        super(null, TextureManager.player, x, y, s, s, 0, 6, ss);
        this.size = s;

    }

    t = 0;
    acc = 0;
    message;
    xL;
    _update(delta) {
        if(this.getParent().canEnd) {
            if(distance(this.xLoc, this.getParent().player.xLoc, this.yLoc, this.getParent().player.yLoc) < TimeMachine.DIST) {
                this.getParent().startAutomata();
                
                this.startAnim = true;
            }

            if(!this.message) {
                this.message = new UI(-180, 0, 300, 100, 5, this)
                this.xL = this.message.xLoc;
            } else {
                this.acc += delta;
                this.message.setXOff(-180 + Math.sin(this.acc * 5) * 10)
            }
            
        }
        
        if(this.startAnim) {
            this.t += delta;
            
            let shine = this.getParent().machineFlash;

            shine.setVisible(true);
            if(this.t > 1) {
                shine.setVisible(false);
                this.setVisible(false);
                this.removeSelf();
                return;   
            }
            shine.rotate(31 * delta)

            shine.setWidth(shine.getXSize() + delta * 1000);
            shine.setHeight(shine.getXSize() + delta * 1000);
            shine.setAlpha(1 - this.t)
            this.setHeight(Math.max(this.size * (1 - this.t), 0))
        } 
    }
}

class ElectionRes extends Sprite2D {
    static spritesheet;

    static initSpriteSheet() {
        this.spritesheet = new SpriteSheet(TextureManager.sprites);
        this.spritesheet.createFrame(0, 128, 128 * 4, 128);
        this.spritesheet.createFrame(0, 128+128, 128 * 4, 128);
        this.spritesheet.createFrame(0, 128*3, 128 * 4, 128);

    }
    constructor(x, y, s, ind) {
        super(null, TextureManager.sprites, x, y, s * 4, s, 0, 14, ElectionRes.spritesheet);

        this.setSprite(ind);
    }
}