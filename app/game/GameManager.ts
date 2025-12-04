// game/GameManager.ts
import * as PIXI from 'pixi.js';
import { Entity } from '../core/Entity';
import { EntityFactory } from './EntityFactory';

export class GameManager {
    private app: PIXI.Application;
    private entities: Entity[] = [];

    constructor(app: PIXI.Application) {
        this.app = app;
        this.init();
    }

    private init() {
        // Tạo mặt đất
        const ground = new PIXI.Graphics();
        ground.rect(0, 450, 800, 80); // Cú pháp v8: rect thay vì drawRect
        ground.fill(0x654321);        // Cú pháp v8: fill thay vì beginFill/endFill
        this.app.stage.addChild(ground);

        // Tạo Player
        const player = EntityFactory.createPlayer();
        this.addEntity(player);

        // Tạo Enemy
        const enemy = EntityFactory.createEnemy(500, 100);
        this.addEntity(enemy);

        // SỬA LỖI TICKER TẠI ĐÂY
        // Pixi v8 truyền vào 'ticker' object, ta lấy deltaTime từ nó
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
        // Không cần stop ticker thủ công vì app.destroy() sẽ lo việc đó
    }
}