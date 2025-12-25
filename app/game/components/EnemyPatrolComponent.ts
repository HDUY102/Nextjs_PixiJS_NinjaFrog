import { Component } from '../../core/Component';
import { TransformComponent } from './TransformComponent';
import { AnimatedSpriteComponent } from '../../components/AnimatedSpriteComponent';
import { PhysicsComponent } from './PhysicsComponent';

export class EnemyPatrolComponent extends Component {
    private speed: number = 2; // Tốc độ di chuyển
    private direction: number = -1; // -1: Trái, 1: Phải
    private moveRange: number = 150; // Phạm vi đi tuần tra
    private startX: number = 0;
    private initialized: boolean = false;

    update(delta: number): void {
        const transform = this.entity.getComponent(TransformComponent);
        const physics = this.entity.getComponent(PhysicsComponent);
        const spriteComp = this.entity.getComponent(AnimatedSpriteComponent);
        
        if (!transform || !physics || !spriteComp) return;

        // Lưu vị trí ban đầu để làm mốc đi tuần
        if (!this.initialized) {
            // this.startX = this.entity.x;
            this.initialized = true;
            // Chạy animation 'run' hoặc 'idle'
            spriteComp.play('run'); 
        }

        // 1. Di chuyển
        transform.velocityX = this.speed * this.direction;
        this.entity.x += transform.velocityX * delta;

        // 2. Logic quay đầu (Patrol đơn giản)
        // Nếu đi quá xa bên trái hoặc phải so với điểm xuất phát -> Quay đầu
        if (this.entity.x < this.startX - this.moveRange) {
            this.direction = 1;
            spriteComp.sprite.scale.x = Math.abs(spriteComp.sprite.scale.x); // Quay mặt sang phải
        } else if (this.entity.x > this.startX + this.moveRange) {
            this.direction = -1;
            spriteComp.sprite.scale.x = -Math.abs(spriteComp.sprite.scale.x); // Quay mặt sang trái
        }
    }

    private flipSprite(spriteComp: AnimatedSpriteComponent, flipX: boolean) {
        // Vì AnimatedSpriteComponent của bạn có thể không public sprite, 
        // ta ép kiểu any để truy cập nhanh (hoặc bạn có thể thêm method setFlip trong Component đó)
        const sprite = (spriteComp as any).sprite;
        if (sprite) {
            sprite.scale.x = this.direction > 0 ? Math.abs(sprite.scale.x) : -Math.abs(sprite.scale.x);
        }
    }
}