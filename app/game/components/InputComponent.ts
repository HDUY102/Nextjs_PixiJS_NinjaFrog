// game/components/InputComponent.ts
import { Component } from '../../core/Component';
import { TransformComponent } from './TransformComponent';
import { PhysicsComponent } from './PhysicsComponent';

export class InputComponent extends Component {
    private keys: { [key: string]: boolean } = {};
    private jumpPressedLastFrame: boolean = false; // Edge Triggering
    private gameManager: any; // Lưu tham chiếu GameManager
    private lastFacingDirection: number = 1; // 1: Phải, -1: Trái
    private shootPressedLastFrame: boolean = false; // Thêm để tránh spam đạn khi giữ nút Mobile

    constructor(gameManager: any) {
        super();
        this.gameManager = gameManager;
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);

        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.onKeyDown);
            window.addEventListener('keyup', this.onKeyUp);
            window.addEventListener('mousedown', this.onMouseDown);
        }
    }

    private onMouseDown(e: MouseEvent) {
        // e.button === 0 là chuột trái
        if (e.button === 0 && this.entity) {
            this.shoot();
        }
    }

    private shoot() {
        // Lấy vị trí hiện tại của nhân vật để làm điểm xuất phát
        const x = this.entity.x;
        const y = this.entity.y - 15; // Ném ra từ tầm tay/ngực nhân vật
        
        // Gọi GameManager để tạo phi tiêu
        this.gameManager.spawnProjectile(x, y, this.lastFacingDirection);
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

        // Lấy trạng thái từ Mobile Controls thông qua GameManager
        const mobile = this.gameManager.getMobileInput();

        transform.velocityX = 0;

        if (this.keys['ArrowLeft'] || this.keys['KeyA'] || mobile.left) {
            transform.velocityX = -transform.speed;
            this.lastFacingDirection = -1
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD'] || mobile.right) {
            transform.velocityX = transform.speed;
            this.lastFacingDirection = 1
        }

        // Xử lý DOUBLE JUMP: Edge Triggering
        const isJumpKeyHeld = this.keys['ArrowUp'] || this.keys['Space'] || mobile.jump;

        if (isJumpKeyHeld && !this.jumpPressedLastFrame && physics) {
            physics.jump();
        }

        this.jumpPressedLastFrame = isJumpKeyHeld;

        // --- Logic Bắn (Mobile) ---
        if (mobile.shoot && !this.shootPressedLastFrame) {
            this.shoot();
        }
        this.shootPressedLastFrame = mobile.shoot;
    }

    destroy(): void {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.onKeyDown);
            window.removeEventListener('keyup', this.onKeyUp);
            window.removeEventListener('mousedown', this.onMouseDown);
        }
    }
}