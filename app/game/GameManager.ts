import * as PIXI from 'pixi.js';
import { Entity } from '../core/Entity';
import { EntityFactory } from './EntityFactory';

export class GameManager {
    private app: PIXI.Application;
    private entities: Entity[] = [];
    private GAME_HEIGHT: number = 480;

    constructor(app: PIXI.Application) {
        this.app = app;
        // Bỏ init() trong constructor, ta gọi nó từ bên ngoài (GameCanvas)
    }

    // Chuyển init thành async để load tài nguyên
    public async init() {
        // 1. Load Assets (Tài nguyên ảnh)
        // Lưu ý: Đường dẫn bắt đầu từ thư mục public/
        const textureIdle = await PIXI.Assets.load('/assets/ninja_frog/Idle (32x32).png');
        const textureRun  = await PIXI.Assets.load('/assets/ninja_frog/Run (32x32).png');
        const textureJump = await PIXI.Assets.load('/assets/ninja_frog/Jump (32x32).png');
        const textureFall = await PIXI.Assets.load('/assets/ninja_frog/Fall (32x32).png');

        // Gom lại thành 1 object để truyền cho Factory
        const playerTextures = {
            'idle': textureIdle,
            'run': textureRun,
            'jump': textureJump,
            'fall': textureFall
        };

        // 2. Setup Môi trường
        const ground = new PIXI.Graphics();
        const GROUND_Y_START = this.GAME_HEIGHT - 40; 
        
        // Vẽ mặt đất 
        ground.rect(0, GROUND_Y_START, 800, 80);
        ground.fill(0x654321);
        this.app.stage.addChild(ground);

        // 3. Tạo Player với Textures đã load
        const player = EntityFactory.createPlayer(playerTextures);
        this.addEntity(player);

        // 4. Start Loop
        this.app.ticker.add((ticker) => {
            this.update(ticker.deltaTime);
        });
    }

    private addEntity(entity: Entity) {
        this.entities.push(entity);
        this.app.stage.addChild(entity);
    }

    private update(delta: number) {
        for (const entity of this.entities) {
            entity.update(delta);
        }
    }

    public destroy() {
        this.entities.forEach(e => e.destroy());
    }
}