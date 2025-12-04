import { Component } from '../../core/Component';
import { TransformComponent } from './TransformComponent';
import { PhysicsComponent } from './PhysicsComponent';

export class InputComponent extends Component {
    private keys: { [key: string]: boolean } = {};

    constructor() {
        super();
        // Bind functions to remove event listener
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.onKeyDown);
            window.addEventListener('keyup', this.onKeyUp);
        }
    }

    private onKeyDown(e: KeyboardEvent) { this.keys[e.code] = true; }
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

        if ((this.keys['ArrowUp'] || this.keys['Space']) && physics) {
            physics.jump();
        }
    }

    destroy(): void {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.onKeyDown);
            window.removeEventListener('keyup', this.onKeyUp);
        }
    }
}