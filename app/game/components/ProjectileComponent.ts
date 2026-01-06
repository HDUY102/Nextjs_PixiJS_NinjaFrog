import { Component } from '../../core/Component';

export class ProjectileComponent extends Component {
    private speed: number = 15;
    private direction: number = 1; // 1 là phải, -1 là trái
    private lifeTime: number = 2000; // Tự hủy sau 2 giây nếu không trúng gì

    constructor(direction: number) {
        super();
        this.direction = direction;
    }

    onAttach(entity: any) {
        super.onAttach(entity);
        // Tự hủy sau một khoảng thời gian
        setTimeout(() => {
            if (!this.entity.destroyed) this.entity.destroy();
        }, this.lifeTime);
    }

    update(delta: number): void {
        if (!this.entity) return;
        
        // Di chuyển phi tiêu
        this.entity.x += this.speed * this.direction * delta;
        
        // Xoay phi tiêu cho đẹp
        this.entity.rotation += 0.2 * delta;

        // Kiểm tra nếu ra khỏi biên màn hình (giả sử màn hình rộng 800)
        if (this.entity.x > 2000 || this.entity.x < -100) {
            this.entity.destroy();
        }
    }
}