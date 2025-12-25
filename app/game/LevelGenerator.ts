// app/game/LevelGenerator.ts
import * as PIXI from 'pixi.js';
import { EntityFactory } from './EntityFactory';
import { Entity } from '../core/Entity';
import { getRandomPattern, MapChunk } from './MapPatterns';
import { ICollidable } from '../core/Types';

export class LevelGenerator {
    private tileTexture: PIXI.Texture;
    private fruitFrames: PIXI.Texture[];
    private collectedFrames: PIXI.Texture[];
    private enemyTexture: PIXI.Texture;
    private TILE_SIZE = 64;

    constructor(
        tileTexture: PIXI.Texture, 
        fruitFrames: PIXI.Texture[], 
        collectedFrames: PIXI.Texture[],
        enemyTexture: PIXI.Texture
    ) {
        this.tileTexture = tileTexture;
        this.fruitFrames = fruitFrames;
        this.collectedFrames = collectedFrames;
        this.enemyTexture = enemyTexture;
        
        // Cấu hình Texture để không bị mờ khi phóng to (Pixel Art)
        if (this.tileTexture.baseTexture.scaleMode !== PIXI.SCALE_MODES.NEAREST) {
            this.tileTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        }
    }

    public generateNextChunk(startX: number, gameManager: any): { 
        entities: Entity[], 
        collidables: ICollidable[], 
        collectables: ICollidable[],
        nextStartX: number 
    } {
        const chunk: MapChunk = getRandomPattern();
        const entities: Entity[] = [];
        const collidables: ICollidable[] = [];
        const collectables: ICollidable[] = [];

        const rows = chunk.length;
        const cols = chunk[0].length;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const tileType = chunk[row][col];
                
                // Tọa độ vẽ (Visual)
                const x = startX + (col * this.TILE_SIZE);
                const y = row * this.TILE_SIZE;

                if (tileType === 1) { // Tile (Gạch)
                    const tile = EntityFactory.createTile(this.tileTexture, x, y);
                    
                    // 1. SỬA LỖI HỞ ĐẤT:
                    // Bắt buộc ép kích thước hiển thị của gạch bằng đúng TILE_SIZE
                    tile.width = this.TILE_SIZE;
                    tile.height = this.TILE_SIZE;

                    entities.push(tile);

                    // 2. SỬA LỖI PADDING TO (Thu nhỏ hitbox):
                    // Thay vì lấy full 64px, ta thụt vào mỗi bên 6px
                    const padding = 6; 
                    
                    collidables.push({
                        id: tile.id, 
                        // Dịch hitbox vào giữa một chút
                        x: tile.x + padding, 
                        y: tile.y + padding, // Nếu muốn nhân vật chìm nhẹ vào đất cho thật thì +padding, không thì để y: tile.y
                        // Kích thước hitbox nhỏ hơn kích thước ảnh
                        width: this.TILE_SIZE - (padding * 2), 
                        height: this.TILE_SIZE - (padding * 2), 
                        name: 'tile'
                    });

                } else if (tileType === 2) { // Fruit
                    // Fruit thì căn giữa ô
                    const offset = (this.TILE_SIZE - 48) / 2; // Giả sử fruit size 48
                    const fruit = EntityFactory.createFruit(this.fruitFrames, this.collectedFrames, x + offset, y + offset);
                    
                    entities.push(fruit);
                    collectables.push({
                        id: fruit.id, 
                        x: fruit.x + 10, // Thu nhỏ hitbox ăn quả một chút cho đỡ bị ăn nhầm
                        y: fruit.y + 10,
                        width: 28, 
                        height: 28, 
                        name: 'fruit'
                    });
                }else if (tileType === 3) { // Enemy
                    const enemy = EntityFactory.createEnemy(this.enemyTexture, this.enemyTexture, x, y, gameManager);
                    entities.push(enemy);
                }
            }
        }

        const chunkWidth = cols * this.TILE_SIZE;
        
        return {
            entities,
            collidables,
            collectables,
            nextStartX: startX + chunkWidth
        };
    }
}