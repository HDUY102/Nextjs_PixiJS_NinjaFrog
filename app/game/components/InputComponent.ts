// game/components/InputComponent.ts
import { Component } from '../../core/Component';
import { TransformComponent } from './TransformComponent';
import { PhysicsComponent } from './PhysicsComponent';

export class InputComponent extends Component {
    private keys: { [key: string]: boolean } = {};
    private jumpPressedLastFrame: boolean = false; // Edge Triggering

    constructor() {
        super();
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.onKeyDown);
            window.addEventListener('keyup', this.onKeyUp);
        }
    }

    private onKeyDown(e: KeyboardEvent) { 
        this.keys[e.code] = true; 
        
        // ✨ FIX LỖI CUỘN TRANG (Scroll)
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
            e.preventDefault(); 
        }
    }
    private onKeyUp(e: KeyboardEvent) { this.keys[e.code] = false; }

    update(delta: number): void {
        const transform = this.entity.requireComponent(TransformComponent);
        const physics = this.entity.getComponent(PhysicsComponent);

        transform.velocityX = 0;

        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            transform.velocityX = -transform.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            transform.velocityX = transform.speed;
        }

        // Xử lý DOUBLE JUMP: Edge Triggering
        const isJumpKeyHeld = this.keys['ArrowUp'] || this.keys['Space'];

        if (isJumpKeyHeld && !this.jumpPressedLastFrame && physics) {
            physics.jump();
        }

        this.jumpPressedLastFrame = isJumpKeyHeld;
    }

    destroy(): void {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.onKeyDown);
            window.removeEventListener('keyup', this.onKeyUp);
        }
    }
}