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
    private hitTexture: PIXI.Texture;
    private specialTileTextures: any;
    private TILE_SIZE = 64;

    constructor(
        tileTexture: PIXI.Texture, 
        fruitFrames: PIXI.Texture[], 
        collectedFrames: PIXI.Texture[],
        enemyTexture: PIXI.Texture,
        hitTexture: PIXI.Texture,
        specialTileTextures: any
    ) {
        this.tileTexture = tileTexture;
        this.fruitFrames = fruitFrames;
        this.collectedFrames = collectedFrames;
        this.enemyTexture = enemyTexture;
        this.hitTexture = hitTexture;
        this.specialTileTextures = specialTileTextures;
        
        // Cấu hình Texture để không bị mờ khi phóng to (Pixel Art)
        if (this.tileTexture.baseTexture.scaleMode !== PIXI.SCALE_MODES.NEAREST) {
            this.tileTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        }
    }

    public generateNextChunk(startX: number, gameManager: any, modifier: number = 1.0): { 
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
                let tileType = chunk[row][col];

                // --- LOGIC ĐỘ KHÓ LEVEL ---
                if (tileType === 0 && row === rows - 2) { // Chỉ spawn enemy ở gần mặt đất
                    if (Math.random() < 0.02 * modifier) {
                        tileType = 3; // Biến thành Enemy
                    }
                }
                
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
                    const fruit = EntityFactory.createFruit(this.fruitFrames, this.collectedFrames, x + offset, y + offset, gameManager);
                    
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
                    const enemy = EntityFactory.createEnemy(this.enemyTexture, this.enemyTexture, this.hitTexture, x, y, gameManager);
                    entities.push(enemy);
                }else if (tileType === 4) { // Tile Special
                    const specialTile = EntityFactory.createSpecialTile(this.specialTileTextures, x, y);
                    entities.push(specialTile);

                    // thêm vào collidables để Physics có thể xử lý va chạm
                    collidables.push({
                        id: specialTile.id,
                        x: x,
                        y: y,
                        width: this.TILE_SIZE,
                        height: this.TILE_SIZE,
                        name: 'special_tile',
                        type: 4,
                        isUsed: false   // Trạng thái ban đầu
                    });
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