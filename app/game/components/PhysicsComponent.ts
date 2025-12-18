import { ICollidable } from '@/app/core/Types';
import { Component } from '../../core/Component';
import { TransformComponent } from './TransformComponent';
import { FruitComponent } from './FruitComponent';
import { Entity } from '@/app/core/Entity';

interface IGameManager {
    findEntityById(id: string): Entity | undefined;
}

const TILE_SIZE = 64;
// Hitbox thực tế để tính va chạm (nhỏ hơn visual 64x64 để mượt mà hơn)
const HITBOX_WIDTH = 38;  
const HITBOX_HEIGHT = 60; 
const PLAYER_HALF_WIDTH = HITBOX_WIDTH / 2;
const PLAYER_HALF_HEIGHT = HITBOX_HEIGHT / 2;

export class PhysicsComponent extends Component {
    private gravity: number = 0.6;
    private maxJumps: number = 2; 
    private jumpsRemaining: number = 2;
    public isGrounded: boolean = false; 

    public collidableTiles: ICollidable[] = []; 
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

        // 2. Xử lý di chuyển và va chạm theo trục Y (Dọc) trước
        this.entity.y += transform.velocityY * delta;
        this.handleVerticalCollision(transform);

        // 3. Xử lý di chuyển và va chạm theo trục X (Ngang)
        this.entity.x += transform.velocityX * delta;
        
        // Chặn biên trái màn hình
        if (this.entity.x < PLAYER_HALF_WIDTH) {
            this.entity.x = PLAYER_HALF_WIDTH;
            transform.velocityX = 0;
        }
        this.handleHorizontalCollision(transform);

        // 4. Xử lý nhặt vật phẩm
        if (this.gameManager) {
            this.handleCollectionCollision();
        }
    }

    private getHitbox() {
        return {
            left: this.entity.x - PLAYER_HALF_WIDTH,
            right: this.entity.x + PLAYER_HALF_WIDTH,
            top: this.entity.y - PLAYER_HALF_HEIGHT,
            bottom: this.entity.y + PLAYER_HALF_HEIGHT
        };
    }

    private handleVerticalCollision(transform: TransformComponent): void {
        const box = this.getHitbox();
        let wasOnGround = this.isGrounded;
        this.isGrounded = false;

        for (const tile of this.collidableTiles) {
            // Kiểm tra xem nhân vật có nằm trong phạm vi chiều ngang của Tile không
            // Thêm lề 2px để tránh bị kẹt ở mép
            if (box.right > tile.x + 2 && box.left < tile.x + TILE_SIZE - 2) {
                
                // Va chạm khi đang rơi xuống (Đứng trên sàn)
                if (transform.velocityY > 0) {
                    if (box.bottom > tile.y && box.top < tile.y) {
                        this.entity.y = tile.y - PLAYER_HALF_HEIGHT;
                        transform.velocityY = 0;
                        this.isGrounded = true;
                        this.jumpsRemaining = this.maxJumps;
                        return; 
                    }
                } 
                // Va chạm khi đang nhảy lên (Đụng trần)
                else if (transform.velocityY < 0) {
                    if (box.top < tile.y + TILE_SIZE && box.bottom > tile.y + TILE_SIZE) {
                        this.entity.y = tile.y + TILE_SIZE + PLAYER_HALF_HEIGHT;
                        transform.velocityY = 0;
                        return;
                    }
                }
            }
        }
    }

    private handleHorizontalCollision(transform: TransformComponent): void {
        const box = this.getHitbox();

        for (const tile of this.collidableTiles) {
            // Kiểm tra phạm vi chiều dọc (Chỉ tính va chạm ngang nếu không phải đang đứng trên đầu tile)
            if (box.bottom > tile.y + 5 && box.top < tile.y + TILE_SIZE - 5) {
                
                // Va chạm tường bên trái (Nhân vật đi sang phải)
                if (transform.velocityX > 0) {
                    if (box.right > tile.x && box.left < tile.x) {
                        this.entity.x = tile.x - PLAYER_HALF_WIDTH;
                        transform.velocityX = 0;
                        break;
                    }
                }
                // Va chạm tường bên phải (Nhân vật đi sang trái)
                else if (transform.velocityX < 0) {
                    if (box.left < tile.x + TILE_SIZE && box.right > tile.x + TILE_SIZE) {
                        this.entity.x = tile.x + TILE_SIZE + PLAYER_HALF_WIDTH;
                        transform.velocityX = 0;
                        break;
                    }
                }
            }
        }
    }

    private handleCollectionCollision(): void {
        const box = this.getHitbox();
        for (let i = this.collectableItems.length - 1; i >= 0; i--) {
            const item = this.collectableItems[i];
            const itemEntity = this.gameManager.findEntityById(item.id); 
            if (!itemEntity) continue; 

            const itemComp = itemEntity.getComponent(FruitComponent);
            if (!itemComp || itemComp['isCollecting']) continue;

            const itemBox = {
                left: item.x - item.width / 2,
                right: item.x + item.width / 2,
                top: item.y - item.height / 2,
                bottom: item.y + item.height / 2
            };

            if (box.right > itemBox.left && box.left < itemBox.right &&
                box.bottom > itemBox.top && box.top < itemBox.bottom) {
                itemComp.collect();
                this.collectableItems.splice(i, 1);
            }
        }
    }

    public jump(): boolean {
        const transform = this.entity.requireComponent(TransformComponent);
        if (this.jumpsRemaining > 0) {
            transform.velocityY = -12;
            this.jumpsRemaining--; 
            this.isGrounded = false;
            return true;
        }
        return false;
    }
}