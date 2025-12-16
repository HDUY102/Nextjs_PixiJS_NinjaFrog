import * as PIXI from 'pixi.js';
import { Entity } from '../core/Entity';
import { EntityFactory } from './EntityFactory';
import { getFramesFromSpriteSheet } from '../core/Utils';
import { PhysicsComponent } from './components/PhysicsComponent'; // Import mới
import { ICollidable } from '../core/Types';

export class GameManager {
    private app: PIXI.Application;
    private entities: Entity[] = [];
    private GAME_HEIGHT: number = 480;

    private TILE_SIZE: number = 64;
    private collidableTiles: ICollidable[] = []; // List Tiles
    private collectableItems: ICollidable[] = []; // List Fruit
    
    private MAP_DATA = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0], 
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 
    ];

    constructor(app: PIXI.Application) {
        this.app = app;
    }

    public async init() {
        const assetUrls = {
            idle: '/assets/ninja_frog/Idle (32x32).png',
            run: '/assets/ninja_frog/Run (32x32).png',
            jump: '/assets/ninja_frog/Jump (32x32).png',
            fall: '/assets/ninja_frog/Fall (32x32).png',
            tile: '/assets/tile/Idle.png',
            fruitStrip: '/assets/fruit/Apple.png',
            fruitCollected: '/assets/fruit/Collected.png'
        };
        
        const loaded = await PIXI.Assets.load(Object.values(assetUrls));

        const textureIdle = loaded[assetUrls.idle] as PIXI.Texture;
        const textureRun = loaded[assetUrls.run] as PIXI.Texture;
        const textureJump = loaded[assetUrls.jump] as PIXI.Texture;
        const textureFall = loaded[assetUrls.fall] as PIXI.Texture;
        const textureTile = loaded[assetUrls.tile] as PIXI.Texture;
        const textureFruitStrip = loaded[assetUrls.fruitStrip] as PIXI.Texture;
        const textureFruitCollectedStrip = loaded[assetUrls.fruitCollected] as PIXI.Texture;
        
        const playerTextures = {
            'idle': textureIdle, 'run': textureRun, 'jump': textureJump, 'fall': textureFall
        };
        const fruitFrames = getFramesFromSpriteSheet(textureFruitStrip, 32, 32, 6);
        const collectedFrames = getFramesFromSpriteSheet(textureFruitCollectedStrip, 32, 32, 6);

        // 3. Setup Môi trường: Xây dựng Map VÀ thu thập danh sách Tiles
        this.buildMap(textureTile, fruitFrames, collectedFrames);

        // 4. Tạo Player VÀ GÁN Tiles cho nó
        const player = EntityFactory.createPlayer(playerTextures, this);
        this.addEntity(player);
        
        // ✨Truyền danh sách Tiles vào PhysicsComponent của Player
        const playerPhysics = player.getComponent(PhysicsComponent);
        if (playerPhysics) {
            playerPhysics.collidableTiles = this.collidableTiles;
            playerPhysics.collectableItems = this.collectableItems;
        }

        // 5. Start Loop
        this.app.ticker.add((ticker) => {
            this.update(ticker.deltaTime);
        });
    }

    /**
     * Hàm xây dựng Map dựa trên dữ liệu MAP_DATA VÀ thu thập các vật thể có thể va chạm
     */
    private buildMap(tileTexture: PIXI.Texture, fruitFrames: PIXI.Texture[], collectedFrames: PIXI.Texture[]) {
        for (let row = 0; row < this.MAP_DATA.length; row++) {
            for (let col = 0; col < this.MAP_DATA[row].length; col++) {
                const tileType = this.MAP_DATA[row][col];
                const x = col * this.TILE_SIZE;
                const y = row * this.TILE_SIZE; 

                if (tileType === 1) {
                    const tile = EntityFactory.createTile(tileTexture, x, y);
                    this.addEntity(tile);
                    
                    this.collidableTiles.push({
                        id: tile.id, x: tile.x, y: tile.y,
                        width: this.TILE_SIZE, height: this.TILE_SIZE, name: 'tile'
                    });

                } else if (tileType === 2) {
                    // ✨ TRUYỀN collectedFrames VÀO Factory
                    const fruit = EntityFactory.createFruit(fruitFrames, collectedFrames, x, y); 
                    this.addEntity(fruit);
                    
                    // ✨ THÊM FRUIT VÀO DANH SÁCH COLLECTABLE
                    this.collectableItems.push({
                        id: fruit.id, x: fruit.x, y: fruit.y,
                        width: 48, // Fruit 32x32 scale 1.5x
                        height: 48, // Fruit 32x32 scale 1.5x
                        name: 'fruit'
                    });
                }
            }
        }
    }

    private addEntity(entity: Entity) {
        this.entities.push(entity);
        this.app.stage.addChild(entity);
    }

    private update(delta: number) {
        for (const entity of this.entities) {
            entity.update(delta);
        }

        this.entities = this.entities.filter(entity => {
            // Kiểm tra xem entity (hoặc component sprite bên trong) đã bị destroy chưa
            // PIXI Container có thuộc tính 'destroyed'
            return !entity.destroyed; 
        });
    }

    public findEntityById(id: string): Entity | undefined {
        return this.entities.find(e => e.id === id);
    }

    public destroy() {
        this.entities.forEach(e => e.destroy());
    }
}