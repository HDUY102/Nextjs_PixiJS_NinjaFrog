import { Component } from '../../core/Component';

export class ProjectileComponent extends Component {
    private speed: number = 10;
    private direction: number = 1; // 1 là phải, -1 là trái
    private lifeTime: number = 120; // Tự hủy sau 2 giây nếu không trúng gì
    private elapsed: number = 0;

    constructor(direction: number) {
        super();
        this.direction = direction;
    }

    update(delta: number): void {
        if (!this.entity || this.entity.destroyed) return;

        this.elapsed += delta;
        if (this.elapsed >= this.lifeTime) {
            this.entity.destroy();
            return; 
        }
        
        // Di chuyển phi tiêu
        this.entity.x += this.speed * this.direction * delta;
        
        // Xoay phi tiêu cho đẹp
        this.entity.rotation += 0.2 * delta;

        // Kiểm tra nếu ra khỏi biên màn hình (giả sử màn hình rộng 800)
        if (this.entity.x > 1000 || this.entity.x < -100) {
            this.entity.destroy();
        }
    }
}