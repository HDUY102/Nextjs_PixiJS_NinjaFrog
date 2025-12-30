import * as PIXI from 'pixi.js';
import { Component } from '../core/Component';
import { PhysicsComponent } from '../game/components/PhysicsComponent';
import { TransformComponent } from '../game/components/TransformComponent';

// Định nghĩa các loại hành động
export type AnimationState = 'idle' | 'run' | 'jump' | 'fall' | 'hit' | 'double_jump';

export class AnimatedSpriteComponent extends Component {
    public sprite: PIXI.AnimatedSprite;
    private animations: Record<AnimationState, PIXI.Texture[]>;
    public currentState: AnimationState = 'idle';
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
            if (state === 'double_jump') {
                this.sprite.animationSpeed = 0.4; // Chạy nhanh hơn (xoay tít)
                this.sprite.loop = true;
            } else {
                this.sprite.animationSpeed = 0.2; // Tốc độ bình thường
            }
            this.sprite.play();
        }
    }

    onAttach(entity: any) {
        super.onAttach(entity);
        entity.addChild(this.sprite);
    }

    update(delta: number): void {
        if (!this.entity || !this.enabled) return;
        const physics = this.entity.getComponent(PhysicsComponent);
        const transform = this.entity.requireComponent(TransformComponent);

        if (!physics || !transform) return;
        if (this.currentState === 'hit') return;
        // 1. Logic chuyển đổi Animation
        let newState: AnimationState = 'idle';
        if (!physics.isGrounded) {
            if (this.entity.id === 'player' && physics.jumpsRemaining === 0) newState = 'double_jump';
            else if (transform.velocityY < 0) newState = 'jump';
            else newState = 'fall';
        } else {// Đang ở trên mặt đất
            if (Math.abs(transform.velocityX) > 0.1) newState = 'run';
            else newState = 'idle';
        }

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