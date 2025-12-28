import * as PIXI from 'pixi.js';
import { Component } from '../core/Component';
import { PhysicsComponent } from '../game/components/PhysicsComponent';
import { TransformComponent } from '../game/components/TransformComponent';

// Định nghĩa các loại hành động
export type AnimationState = 'idle' | 'run' | 'jump' | 'fall';

export class AnimatedSpriteComponent extends Component {
    public sprite: PIXI.AnimatedSprite;
    private animations: Record<AnimationState, PIXI.Texture[]>;
    private currentState: AnimationState = 'idle';
    public autoUpdate: boolean = true;
    public flipWithVelocity: boolean = true;

    constructor(animations: Record<AnimationState, PIXI.Texture[]>, autoUpdate: boolean = true) {
        super();
        this.animations = animations;
        this.autoUpdate = autoUpdate;
        // Khởi tạo với trạng thái idle
        this.sprite = new PIXI.AnimatedSprite(this.animations['idle']);
        this.sprite.anchor.set(0.5, 1); // Neo ở giữa tâm
        this.sprite.animationSpeed = 0.2; // Tốc độ chạy frame (càng lớn càng nhanh)
        this.sprite.play();
    }

    public play(state: AnimationState): void {
        if (this.currentState === state) return; // Nếu đang chạy đúng state rồi thì thôi

        if (this.animations[state] === this.animations[this.currentState]) {
            this.currentState = state; // Cập nhật tên state nhưng không thay textures
            return;
        }

        this.currentState = state;
        
        // Kiểm tra xem animation đó có tồn tại texture không
        if (this.animations[state] && this.animations[state].length > 0) {
            this.sprite.textures = this.animations[state];
            this.sprite.play();
        }
    }

    onAttach(entity: any) {
        super.onAttach(entity);
        entity.addChild(this.sprite);
    }

    update(delta: number): void {
        const physics = this.entity.getComponent(PhysicsComponent)as any;
        const transform = this.entity.requireComponent(TransformComponent);

        if (!physics || !transform) return;

        // 1. Logic chuyển đổi Animation
        let newState: AnimationState = 'idle';
        if (physics.velocityY < -0.1) newState = 'jump';
        else if (physics.velocityY > 0.1 && !physics.isGrounded) newState = 'fall';
        else if (Math.abs(transform.velocityX) > 0.1) newState = 'run';

        if (this.currentState !== newState) {
            this.play(newState);
        }

        // 2. Logic xoay hướng (Chỉ chạy nếu flipWithVelocity = true)
        if (this.flipWithVelocity) {
            if (transform.velocityX > 0.1) {
                this.sprite.scale.x = Math.abs(this.sprite.scale.x); // Nhìn phải
            } else if (transform.velocityX < -0.1) {
                this.sprite.scale.x = -Math.abs(this.sprite.scale.x); // Nhìn trái
            }
        }
    }
}