import * as PIXI from 'pixi.js';

export class ProgressBar {
    private container: PIXI.Container;
    private background: PIXI.Graphics;
    private fill: PIXI.Graphics;
    private width: number = 200;
    private height: number = 20;

    constructor(parent: PIXI.Container, x: number, y: number) {
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        parent.addChild(this.container);

        // 1. Vẽ khung nền (Màu đen mờ)
        this.background = new PIXI.Graphics();
        this.background.roundRect(0, 0, this.width, this.height, 8);
        this.background.fill({ color: 0x000000, alpha: 0.5 });
        this.container.addChild(this.background);

        // 2. Tạo thanh Fill (Màu xanh lá)
        this.fill = new PIXI.Graphics();
        this.container.addChild(this.fill);

        this.update(0); // Khởi tạo mức 0%
    }

    // Cập nhật thanh tiến trình theo tỉ lệ 0 đến 1
    public update(ratio: number) {
        ratio = Math.max(0, Math.min(1, ratio)); // Đảm bảo ratio nằm trong khoảng [0, 1]

        this.fill.clear();
        // Vẽ màu dựa trên tỉ lệ (Ví dụ: sắp đầy thì màu cam)
        const color = ratio > 0.8 ? 0xFFA500 : 0x00FF7F; 
        
        this.fill.roundRect(2, 2, (this.width - 4) * ratio, this.height - 4, 6);
        this.fill.fill({ color: color });
    }
}