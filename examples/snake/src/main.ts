import * as w4 from "./wasm4";

import {FRUIT, BRICK, SNAKE_HEAD, SNAKE_BODY} from "./assets";

const TILE_SIZE: u8 = 8;
const GAME_SIZE: u8 = u8(w4.SCREEN_SIZE / TILE_SIZE);
const MOVE_DURATION_FRAMES: u8 = 12;

store<u32>(w4.PALETTE, 0xe0f8cf, 0 * sizeof<u32>());   // light
store<u32>(w4.PALETTE, 0x7c3f58, 1 * sizeof<u32>());   // red
store<u32>(w4.PALETTE, 0x306850, 2 * sizeof<u32>());   // dark
store<u32>(w4.PALETTE, 0x86c06c, 3 * sizeof<u32>());   // green

let game = new Game();

export function update(): void {
    if (game.isGameOver()) {
        const gamepad = load<u8>(w4.GAMEPAD1);
        if (gamepad & w4.BUTTON_1) {
            game = new Game();
        }
    }
    game.update();
    game.draw();
}

class Game {
    private readonly snake: Snake = new Snake();
    private fruit: Fruit = this.placeFruit();

    private score: u16 = 0;
    private gameover: boolean = false;

    private previousGamepad: u8 = 0;
    private moveDelay: u8 = 0

    update(): void {
        if (this.gameover) {   
            return;
        }     

        this.gamepadControl();   

        if (this.moveDelay > 0) {
            this.moveDelay--;
            return;
        }
        this.moveDelay = MOVE_DURATION_FRAMES;
        
        this.moveSnake();
        
        this.checkCollisions();
    }

    draw(): void {
        this.fruit.draw();
        this.snake.draw();

        this.drawWalls();
        this.drawStats();
    }

    isGameOver(): boolean {
        return this.gameover;
    }

    private gamepadControl(): void {
        const gamepad = load<u8>(w4.GAMEPAD1);
        const pressed = gamepad & (gamepad ^ this.previousGamepad);
        this.previousGamepad = gamepad;

        if (pressed & w4.BUTTON_RIGHT) {
            this.snake.turn(Direction.RIGHT);
        }
        else if (pressed & w4.BUTTON_LEFT) {
            this.snake.turn(Direction.LEFT);
        }
        else if (pressed & w4.BUTTON_UP) {
            this.snake.turn(Direction.UP);
        }
        else if (pressed & w4.BUTTON_DOWN) {
            this.snake.turn(Direction.DOWN);
        }
    }

    private moveSnake(): void {
        this.snake.move();  
        this.gameover = this.snake.hasFailed();

        if (this.gameover) {
            w4.tone(140 | (20 << 16), 100, 60, w4.TONE_PULSE1 | w4.TONE_MODE1);
        }
    }

    private checkCollisions(): void {
        if (this.snake.collides(this.fruit.position)) {
            this.score++;
            this.snake.grow();
            this.fruit = this.placeFruit();

            w4.tone(20 | (60 << 16), 80, 10, w4.TONE_PULSE2 | w4.TONE_MODE3);
        }
    }

    private placeFruit(): Fruit {
        let fruit: Fruit;
        do {
            fruit = new Fruit();
        } while(this.snake.collides(fruit.position, false));

        return fruit;
    }

    private drawStats(): void {
        store<u16>(w4.DRAW_COLORS, 0x43);
        w4.text("Score: " + (this.score).toString(), 0, 0);

        if (this.gameover) {
            store<u16>(w4.DRAW_COLORS, 0x44);
            w4.rect(30, 56, 100, 25);
            store<u16>(w4.DRAW_COLORS, 0x41);
            w4.text("GAME OVER", 43, 60);
            w4.text(" press X ", 43, 70);
        }
    }

    private drawWalls(): void {
        store<u16>(w4.DRAW_COLORS, 4);
    
        for (let i: u8 = 0; i < GAME_SIZE; i++) {
            w4.blit(BRICK, i * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, w4.BLIT_1BPP | w4.BLIT_FLIP_Y);
            w4.blit(BRICK, i * TILE_SIZE, (GAME_SIZE - 1) * TILE_SIZE, TILE_SIZE, TILE_SIZE, w4.BLIT_1BPP);
    
            if (i > 0 && i < GAME_SIZE - 1) {
                w4.blit(BRICK, 0, i * TILE_SIZE, TILE_SIZE, TILE_SIZE, w4.BLIT_1BPP | w4.BLIT_FLIP_Y | w4.BLIT_ROTATE);
                w4.blit(BRICK, (GAME_SIZE - 1) * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE, w4.BLIT_1BPP | w4.BLIT_ROTATE);
            }
        }
    }
}

class Snake {
    private readonly body: Position[] = [new Position(GAME_SIZE / 2, GAME_SIZE / 2)];
    private direction: Direction = Direction.NONE; 

    private growing: boolean = false;
    private failed: boolean = false;

    move(): void {
        if (this.failed || Direction.NONE == this.direction) {
            return;
        }
        const head = this.body[0];
        const newHead = new Position(head.x + this.direction.x, head.y + this.direction.y);
        
        if (this.hits(newHead)) {
            this.failed = true;
            return;
        }

        this.body.unshift(newHead);
        if (!this.growing) {
            this.body.pop();
        }
        this.growing = false;
    }

    turn(direction: Direction): void {
        this.direction = direction;
    }

    grow(): void {
        this.growing = true;
    }

    collides(other: Position, justHead: boolean = true): boolean {
        for (let i = 0, l = justHead ? 1 : this.body.length; i < l; i++) {
            if (this.body[i].equals(other)) {
                return true;
            }
        }
        return false;
    }

    hasFailed(): boolean {
        return this.failed;
    }

    private hits(head: Position): boolean {
        if (head.x < 1 || head.x > GAME_SIZE - 2 || head.y < 1 || head.y > GAME_SIZE - 2) {
            return true;
        }
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[i].equals(head)) {
                return true;
            }
        }
        return false;
    }

    draw(): void {
        store<u16>(w4.DRAW_COLORS, 0x13);
        w4.blit(SNAKE_HEAD, this.body[0].x * TILE_SIZE, this.body[0].y * TILE_SIZE, TILE_SIZE, TILE_SIZE, w4.BLIT_1BPP 
            | (this.direction.y > 0 ? w4.BLIT_FLIP_Y : 0)
            | (this.direction.x > 0 ? w4.BLIT_FLIP_Y | w4.BLIT_ROTATE : 0)
            | (this.direction.x < 0 ? w4.BLIT_ROTATE : 0));
        for (let i = 1; i < this.body.length; i++) {
            w4.blit(SNAKE_BODY, this.body[i].x * TILE_SIZE, this.body[i].y * TILE_SIZE, TILE_SIZE, TILE_SIZE, w4.BLIT_1BPP);
        }
    }
}

class Fruit {
    readonly position: Position = Fruit.distribute();

    draw(): void {
        store<u16>(w4.DRAW_COLORS, 2);
        w4.blit(FRUIT, this.position.x * TILE_SIZE, this.position.y * TILE_SIZE, TILE_SIZE, TILE_SIZE, w4.BLIT_1BPP);
    }

    private static distribute(): Position {
        const min = 1;
        const max = GAME_SIZE - 3;
        return new Position(
            u8(Math.random() * max + min),
            u8(Math.random() * max + min)
        );
    }
}

class Position {
    readonly x: u8;
    readonly y: u8;

    constructor(x: u8, y: u8) {        
        this.x = x;
        this.y = y;
    }
    
    equals(other: Position): boolean {
        return other.x == this.x && other.y == this.y;
    }
}

class Direction {
    static NONE: Direction = new Direction(0, 0);
    static RIGHT: Direction = new Direction(1, 0);
    static LEFT: Direction = new Direction(-1, 0);
    static UP: Direction = new Direction(0, -1);
    static DOWN: Direction = new Direction(0, 1);

    readonly x: i8;
    readonly y: i8;

    private constructor(x: i8, y: i8) {        
        this.x = x;
        this.y = y;
    }
}