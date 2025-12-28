import { Component } from '../../core/Component';
import { TransformComponent } from './TransformComponent';
import { AnimatedSpriteComponent } from '../../components/AnimatedSpriteComponent';
import { PhysicsComponent } from './PhysicsComponent';

export class EnemyPatrolComponent extends Component {
    private speed: number = 2; // Tốc độ di chuyển
    private direction: number = -1; // -1: Trái, 1: Phải
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
            this.updateSpriteDirection(spriteComp);
        }

        // 1. Di chuyển
        transform.velocityX = this.speed * this.direction;

        // 2. Logic quay đầu (Patrol đơn giản)
        // Nếu đi quá xa bên trái hoặc phải so với điểm xuất phát -> Quay đầu
        if ((this.direction === -1 && physics.collisionFlags.left) || 
            (this.direction === 1 && physics.collisionFlags.right)) {
            
            this.direction *= -1; // Đảo chiều di chuyển
            
            // Cập nhật ngay lập tức vận tốc mới để frame sau không bị kẹt
            transform.velocityX = this.speed * this.direction;
            
            // Cập nhật hướng nhìn của Sprite
            this.updateSpriteDirection(spriteComp);
        }
    }

    private updateSpriteDirection(spriteComp: AnimatedSpriteComponent) {
        const sprite = spriteComp.sprite;
        if (sprite) {
            sprite.scale.x = (this.direction === -1) ? 1 : -1;
        }
    }
}