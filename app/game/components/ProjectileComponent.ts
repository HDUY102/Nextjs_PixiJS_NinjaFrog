import { Component } from '../../core/Component';

const TILE_SIZE = 64;

export class ProjectileComponent extends Component {
    private speed: number = 10;
    private direction: number = 1; // 1 là phải, -1 là trái
    private lifeTime: number = 240; // Tự hủy sau 2 giây nếu không trúng gì
    private elapsed: number = 0;
    private gameManager: any;

    constructor(direction: number, gameManager: any) {
        super();
        this.direction = direction;
        this.gameManager = gameManager;
    }

    update(delta: number): void {
        if (!this.entity || this.entity.destroyed) return;

        this.elapsed += delta;
        if (this.elapsed >= this.lifeTime) {
            this.entity.destroy();
            return; 
        }
        
        // Di chuyển phi tiêu
        this.entity.x += this.speed * this.direction * delta;
        
        // Xoay phi tiêu
        this.entity.rotation += 0.3 * delta;

        this.checkCollisions();
    }

    private checkCollisions() {
        const x = this.entity.x;
        const y = this.entity.y;
        // Hitbox nhỏ của phi tiêu (ví dụ 10x10)
        const hitSize = 10;

        // 1. Kiểm tra va chạm với Tường (Tiles)
        const tiles = this.gameManager.collidableTiles;
        for (const tile of tiles) {
            if (x + hitSize > tile.x && x - hitSize < tile.x + TILE_SIZE &&
                y + hitSize > tile.y && y - hitSize < tile.y + TILE_SIZE) {
                this.entity.destroy(); // Đụng tường thì mất phi tiêu
                return;
            }
        }

        // 2. Kiểm tra va chạm với Kẻ thù (Enemies)
        const enemies = this.gameManager.enemies;
        for (const enemy of enemies) {
            if (enemy.destroyed) continue;

            // Lấy hitbox tương đối của quái (giống trong PhysicsComponent)
            const enemyHalfW = 25;
            const enemyHeight = 50;
            const enemyTop = enemy.y - enemyHeight;

            if (x > enemy.x - enemyHalfW && x < enemy.x + enemyHalfW &&
                y > enemyTop && y < enemy.y) {
                
                // Kill quái thông qua GameManager
                this.gameManager.killEnemy(enemy);
                
                // Hủy bản thân phi tiêu
                this.entity.destroy();
                return;
            }
        }
    }
}