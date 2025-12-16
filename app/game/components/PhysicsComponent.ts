import { ICollidable } from '@/app/core/Types';
import { Component } from '../../core/Component';
import { TransformComponent } from './TransformComponent';
import { FruitComponent } from './FruitComponent';
import { Entity } from '@/app/core/Entity';

interface IGameManager {
    findEntityById(id: string): Entity | undefined;
}

// Kích thước cố định của Player (32x32, scale 2x = 64x64)
const PLAYER_HALF_SIZE = 32; 
const TILE_SIZE = 64;
const TILE_THRESHOLD = 5;

export class PhysicsComponent extends Component {
    private gravity: number = 0.5;
    private maxJumps: number = 2; 
    private jumpsRemaining: number = 2;
    public isGrounded: boolean = false; 

    // Thêm thuộc tính để lưu danh sách các vật thể tĩnh (Tiles)
    public collidableTiles: ICollidable[] = []; 
    // Thêm thuộc tính để lưu vật thể có thể nhặt (Fruits)
    public collectableItems: ICollidable[] = [];

    private gameManager: IGameManager;
    constructor(gameManager: IGameManager) {
        super();
        this.gameManager = gameManager;
    }


    update(delta: number): void {
        const transform = this.entity.requireComponent(TransformComponent);
        // 1. Áp dụng trọng lực
        transform.velocityY += this.gravity * delta;
        // 2. Cập nhật vị trí X trước
        this.entity.x += transform.velocityX * delta;
        this.handleHorizontalCollision(transform);
        // 3. Cập nhật vị trí Y sau (để xử lý va chạm dọc dễ hơn)
        this.entity.y += transform.velocityY * delta;
        this.handleVerticalCollision(transform);
        // 4. Xử lý va chạm với Fruit
        if (this.gameManager) {
            this.handleCollectionCollision();
        }
    }

    private getPlayerBBox(offsetX: number = 0, offsetY: number = 0) {
         // Tính BBox dựa trên vị trí sau khi di chuyển
        return {
            left: this.entity.x - PLAYER_HALF_SIZE + offsetX,
            right: this.entity.x + PLAYER_HALF_SIZE + offsetX,
            top: this.entity.y - PLAYER_HALF_SIZE + offsetY,
            bottom: this.entity.y + PLAYER_HALF_SIZE + offsetY
        };
    }

    private handleHorizontalCollision(transform: TransformComponent): void {
        const playerBBox = this.getPlayerBBox();
        const dx = transform.velocityX;

        for (const tile of this.collidableTiles) {
            const tileBBox = {
                left: tile.x,
                right: tile.x + TILE_SIZE,
                top: tile.y,
                bottom: tile.y + TILE_SIZE
            };

            // Kiểm tra va chạm AABB chung
            if (playerBBox.right > tileBBox.left &&
                playerBBox.left < tileBBox.right &&
                playerBBox.bottom > tileBBox.top + TILE_THRESHOLD && // Bỏ qua nếu nhân vật đang cao hơn Tile nhiều
                playerBBox.top < tileBBox.bottom) 
            {
                // Nếu va chạm từ bên phải Tile (Nhân vật đang đi sang trái)
                if (dx < 0) {
                    this.entity.x = tileBBox.right + PLAYER_HALF_SIZE; // Đẩy nhân vật ra khỏi Tile
                    transform.velocityX = 0; // Chặn di chuyển
                    break;
                } 
                // Nếu va chạm từ bên trái Tile (Nhân vật đang đi sang phải)
                else if (dx > 0) {
                    this.entity.x = tileBBox.left - PLAYER_HALF_SIZE; // Đẩy nhân vật ra khỏi Tile
                    transform.velocityX = 0; // Chặn di chuyển
                    break;
                }
            }
        }
    }

    private handleVerticalCollision(transform: TransformComponent): void {
        const playerBBox = this.getPlayerBBox();
        let wasOnGround = this.isGrounded;
        this.isGrounded = false;
        
        for (const tile of this.collidableTiles) {
            const tileBBox = {
                left: tile.x,
                right: tile.x + TILE_SIZE,
                top: tile.y,
                bottom: tile.y + TILE_SIZE
            };

            // Kiểm tra va chạm AABB chung
            if (playerBBox.right > tileBBox.left + TILE_THRESHOLD && // Thêm TILE_THRESHOLD để kiểm tra va chạm
                playerBBox.left < tileBBox.right - TILE_THRESHOLD && // Chân nhân vật phải nằm trên Tile
                playerBBox.bottom > tileBBox.top &&
                playerBBox.top < tileBBox.bottom) 
            {
                // Va chạm từ trên xuống (Đứng trên Tile)
                if (transform.velocityY > 0) { 
                    this.entity.y = tileBBox.top - PLAYER_HALF_SIZE; 
                    transform.velocityY = 0; 
                    
                    if (!wasOnGround) {
                        this.jumpsRemaining = this.maxJumps; 
                    }
                    this.isGrounded = true; 
                    return; // Nếu đã tìm thấy mặt đất, thoát
                }
                // Va chạm từ dưới lên (Đập đầu vào gạch)
                else if (transform.velocityY < 0) { 
                    this.entity.y = tileBBox.bottom + PLAYER_HALF_SIZE; 
                    transform.velocityY = 0; 
                }
            }
        }
    }

    private handleCollectionCollision(): void {
        if (!this.gameManager) return;
        const playerBBox = this.getPlayerBBox();

        for (let i = this.collectableItems.length - 1; i >= 0; i--) {
            const item = this.collectableItems[i];
            // ✨ SỬ DỤNG gameManager ĐÃ ĐƯỢC LƯU
            const itemEntity = this.gameManager.findEntityById(item.id); 
            if (!itemEntity) continue; 

            const itemComponent = itemEntity.getComponent(FruitComponent);
            if (!itemComponent || itemComponent['isCollecting']) continue;
            const itemBBox = {
                left: item.x - item.width / 2, 
                right: item.x + item.width / 2,
                top: item.y - item.height / 2,
                bottom: item.y + item.height / 2
            };

            if (playerBBox.right > itemBBox.left && playerBBox.left < itemBBox.right &&
                playerBBox.bottom > itemBBox.top && playerBBox.top < itemBBox.bottom) 
            {
                itemComponent.collect();
                this.collectableItems.splice(i, 1);
            }
        }
    }

    public jump(): boolean {
        const transform = this.entity.requireComponent(TransformComponent);

        if (this.jumpsRemaining > 0) {
            const jumpForce = (this.jumpsRemaining === this.maxJumps) ? 12 : 10;
            transform.velocityY = -jumpForce;
            this.jumpsRemaining--; 
            
            return true;
        }
        
        return false;
    }
}