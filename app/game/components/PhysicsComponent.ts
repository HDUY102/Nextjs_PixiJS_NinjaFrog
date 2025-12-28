import { ICollidable } from '@/app/core/Types';
import { Component } from '../../core/Component';
import { TransformComponent } from './TransformComponent';
import { FruitComponent } from './FruitComponent';
import { Entity } from '@/app/core/Entity';
import * as PIXI from 'pixi.js';

interface IGameManager {
    findEntityById(id: string): Entity | undefined;
}

const TILE_SIZE = 64;
const HITBOX_WIDTH = 38;  
const HITBOX_HEIGHT = 60; 
const PLAYER_HALF_WIDTH = HITBOX_WIDTH / 2;
const PLAYER_HALF_HEIGHT = HITBOX_HEIGHT / 2;

export class PhysicsComponent extends Component {
    private gravity: number = 0.6;
    private maxJumps: number = 2; 
    private jumpsRemaining: number = 2;
    public isGrounded: boolean = false; 
    private isGameOver: boolean = false;
    private maxFallSpeed: number = 15;
    
    public collidableTiles: ICollidable[] = []; 
    public collectableItems: ICollidable[] = [];
    private gameManager: IGameManager;
    public collisionFlags = { left: false, right: false, top: false, bottom: false };
    public width: number;
    public height: number;
    public enemies: Entity[] = [];

    constructor(gameManager: IGameManager, width: number = 38, height: number = 60) {
        super();
        this.gameManager = gameManager;
        this.width = width;
        this.height = height;
    }

    update(delta: number): void {
        if (this.isGameOver) return;
        const safeDelta = Math.min(delta, 2.0);
        const transform = this.entity.requireComponent(TransformComponent);
        
        this.resetCollisionFlags();

        // 1. Áp dụng trọng lực
        transform.velocityY += this.gravity * delta;

        if (transform.velocityY > this.maxFallSpeed) transform.velocityY = this.maxFallSpeed;

        // 2. Xử lý di chuyển và va chạm theo trục Y (Dọc) trước
        this.entity.y += transform.velocityY * safeDelta;
        this.handleVerticalCollision(transform);

        // 3. Xử lý di chuyển và va chạm theo trục X (Ngang)
        this.entity.x += transform.velocityX * safeDelta;
        
        // Chặn biên trái màn hình (Chỉ dành cho Player)
        if (this.entity.id === 'player') {
            if (this.entity.x < this.width / 2) {
                this.entity.x = this.width / 2;
                transform.velocityX = 0;
            }
        }
        this.handleHorizontalCollision(transform);

        // 4. Logic riêng: Player nhặt đồ, va chạm quái
        if (this.entity.id === 'player' && this.gameManager) {
            this.handleCollectionCollision();
            this.handleEnemyCollision();
        }

        // Kiểm tra va chạm với quái vật
        this.handleEnemyCollision();
    }

    private resetCollisionFlags() {
        this.collisionFlags = { left: false, right: false, top: false, bottom: false };
    }

    private getHitbox() {
        const halfW = this.width / 2;
        const halfH = this.height / 2;
        return {
            left: this.entity.x - (this.width / 2),
            right: this.entity.x + (this.width / 2),
            top: this.entity.y - this.height,  // Đỉnh đầu = Chân - Chiều cao
            bottom: this.entity.y           // Đáy = Chân
        };
    }

    private handleVerticalCollision(transform: TransformComponent): void {
        const box = this.getHitbox();
        this.isGrounded = false;

        for (const tile of this.collidableTiles) {
            // Kiểm tra chồng lấn X trước
            if (box.right > tile.x + 10 && box.left < tile.x + TILE_SIZE - 10) {
                
                // Đang rơi xuống (Velocity > 0)
                if (transform.velocityY > 0) {
                    // Logic chống xuyên đất mạnh hơn:
                    // Nếu chân đang nằm trong vùng đỉnh của gạch (trong khoảng 30px)
                    if (box.bottom >= tile.y && box.bottom <= tile.y + 30) {
                        this.entity.y = tile.y; // Snap chân ngay mặt gạch
                        transform.velocityY = 0;
                        this.isGrounded = true;
                        this.jumpsRemaining = this.maxJumps;
                        this.collisionFlags.bottom = true;
                    }
                } 
                // Nhảy lên (Đụng đầu)
                else if (transform.velocityY < 0) {
                     if (box.top <= tile.y + TILE_SIZE && box.top >= tile.y + TILE_SIZE - 20) {
                        this.entity.y = tile.y + TILE_SIZE + this.height; // Đẩy xuống
                        transform.velocityY = 0;
                        this.collisionFlags.top = true;
                    }
                }
            }
        }
    }

    private handleHorizontalCollision(transform: TransformComponent): void {
        const box = this.getHitbox();
        
        for (const tile of this.collidableTiles) {
            if (box.bottom > tile.y + 10 && box.top < tile.y + TILE_SIZE - 10) {
                
                // Đi phải
                if (transform.velocityX > 0) {
                    if (box.right > tile.x && box.left < tile.x) {
                        this.entity.x = tile.x - (this.width / 2) - 0.1; // Dịch nhẹ ra ngoài
                        // Không set velocityX = 0 ở đây cho Enemy, để Enemy tự xử lý quay đầu
                        this.collisionFlags.right = true;
                    }
                } 
                // Đi trái
                else if (transform.velocityX < 0) { 
                    if (box.left < tile.x + TILE_SIZE && box.right > tile.x + TILE_SIZE) {
                        this.entity.x = tile.x + TILE_SIZE + (this.width / 2) + 0.1;
                        this.collisionFlags.left = true;
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

            // Hitbox item đơn giản
            if (box.right > item.x - 15 && box.left < item.x + 15 &&
                box.bottom > item.y - 15 && box.top < item.y + 15) {
                itemComp.collect();
                this.collectableItems.splice(i, 1);
            }
        }
    }

    private handleEnemyCollision(): void {
        if (this.isGameOver) return;

        const playerBox = this.getHitbox();
        for (const enemy of this.enemies) {
            if (enemy.destroyed) continue;

            // Lấy hitbox của enemy (giả sử enemy size 40x40)
            const enemyHalfW = 20;
            const enemyHalfH = 20;
            
            if (playerBox.right > enemy.x - enemyHalfW && 
                playerBox.left < enemy.x + enemyHalfW &&
                playerBox.bottom > enemy.y - enemyHalfH && 
                playerBox.top < enemy.y + enemyHalfH) {
                
                this.triggerGameOver();
                break;
            }
        }
    }

    private triggerGameOver(): void {
        if (this.isGameOver) return;
        this.isGameOver = true;
        PIXI.Ticker.shared.stop();
        setTimeout(() => {
            alert("BẠN ĐÃ THUA! Nhấn OK để chơi lại.");
            window.location.reload();
        }, 50);
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