import { Component } from '../../core/Component';
import { TransformComponent } from './TransformComponent';

export class PhysicsComponent extends Component {
    private gravity: number = 0.5;
    private groundLevel: number = 430; // Giả định mặt đất ở y=430

    update(delta: number): void {
        const transform = this.entity.requireComponent(TransformComponent);

        // Áp dụng trọng lực
        transform.velocityY += this.gravity * delta;

        // Cập nhật vị trí Container (Entity)
        this.entity.x += transform.velocityX * delta;
        this.entity.y += transform.velocityY * delta;

        // Xử lý va chạm mặt đất đơn giản
        if (this.entity.y >= this.groundLevel) {
            this.entity.y = this.groundLevel;
            transform.velocityY = 0;
        }
    }

    public jump(): void {
        const transform = this.entity.requireComponent(TransformComponent);
        // Chỉ nhảy nếu đang ở mặt đất (hoặc gần mặt đất)
        if (this.entity.y >= this.groundLevel - 1) {
            transform.velocityY = -12;
        }
    }
}