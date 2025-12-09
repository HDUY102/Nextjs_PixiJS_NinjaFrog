import * as PIXI from 'pixi.js';
import { Component } from '../core/Component';
import { PhysicsComponent } from '../game/components/PhysicsComponent';
import { TransformComponent } from '../game/components/TransformComponent';

// Định nghĩa các loại hành động
export type AnimationState = 'idle' | 'run' | 'jump' | 'fall';

export class AnimatedSpriteComponent extends Component {
    private sprite: PIXI.AnimatedSprite;
    private animations: Record<AnimationState, PIXI.Texture[]>;
    private currentState: AnimationState = 'idle';

    constructor(animations: Record<AnimationState, PIXI.Texture[]>) {
        super();
        this.animations = animations;
        
        // Khởi tạo với trạng thái idle
        this.sprite = new PIXI.AnimatedSprite(this.animations['idle']);
        this.sprite.anchor.set(0.5, 0.5); // Neo ở giữa tâm
        this.sprite.animationSpeed = 0.2; // Tốc độ chạy frame (càng lớn càng nhanh)
        this.sprite.play();
    }

    onAttach(entity: any) {
        super.onAttach(entity);
        entity.addChild(this.sprite);
    }

    update(delta: number): void {
        const physics = this.entity.getComponent(PhysicsComponent);
        const transform = this.entity.requireComponent(TransformComponent);

        if (!physics) return;

        // 1. Xử lý Lật hình (Flip) khi di chuyển trái phải
        if (transform.velocityX < 0) {
            this.sprite.scale.x = -1; // Quay trái
        } else if (transform.velocityX > 0) {
            this.sprite.scale.x = 1;  // Quay phải
        }

        // 2. State Machine: Quyết định Animation nào được chạy
        let newState: AnimationState = 'idle';

        if (physics.velocityY < 0) {
            newState = 'jump'; // Đang bay lên
        } else if (physics.velocityY > 0 && !this.isOnGround(physics)) {
            newState = 'fall'; // Đang rơi xuống
        } else if (Math.abs(transform.velocityX) > 0.1) {
            newState = 'run';  // Đang chạy
        } else {
            newState = 'idle'; // Đứng yên
        }

        // 3. Chỉ thay đổi texture nếu trạng thái thay đổi
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.sprite.textures = this.animations[newState];
            this.sprite.play();
        }
    }

    // Helper kiểm tra chạm đất (dựa trên logic hardcode của Physics cũ)
    private isOnGround(physics: any): boolean {
        // Đây là cách tạm thời, lý tưởng nhất là PhysicsComponent expose thuộc tính isOnGround
        return this.entity.y >= 500; 
    }
}