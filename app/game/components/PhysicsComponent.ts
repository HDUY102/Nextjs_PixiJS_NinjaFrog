// game/components/PhysicsComponent.ts
import { Component } from '../../core/Component';
import { TransformComponent } from './TransformComponent';

export class PhysicsComponent extends Component {
    private gravity: number = 0.5;
    private groundLevel: number = 408;
    
    // Thuộc tính mới cho Double Jump
    private maxJumps: number = 2; 
    private jumpsRemaining: number = 2;
    public isGrounded: boolean = false; // Trạng thái mới

    update(delta: number): void {
        const transform = this.entity.requireComponent(TransformComponent);

        // Áp dụng trọng lực và cập nhật vị trí...
        transform.velocityY += this.gravity * delta;
        this.entity.x += transform.velocityX * delta;
        this.entity.y += transform.velocityY * delta;

        // Xử lý va chạm mặt đất
        if (this.entity.y >= this.groundLevel) {
            this.entity.y = this.groundLevel;
            transform.velocityY = 0;
            
            if (!this.isGrounded) {
                // Reset số lần nhảy CHỈ khi vừa chạm đất
                this.jumpsRemaining = this.maxJumps; 
                this.isGrounded = true;
            }
        } else {
            this.isGrounded = false;
        }
    }

    public jump(): boolean {
        const transform = this.entity.requireComponent(TransformComponent);

        // Kiểm tra: Có còn lượt nhảy không?
        if (this.jumpsRemaining > 0) {
            
            // Lực nhảy, có thể giảm lực cho cú double jump
            const jumpForce = (this.jumpsRemaining === this.maxJumps) ? 12 : 10;

            transform.velocityY = -jumpForce;
            this.jumpsRemaining--; 
            
            return true;
        }
        
        return false;
    }
}