import * as PIXI from 'pixi.js';

export class MobileControls {
    public container: PIXI.Container;
    private app: PIXI.Application;
    
    // Trạng thái nút bấm để Player có thể đọc
    public input = {
        left: false,
        right: false,
        jump: false,
        shoot: false
    };

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.setupButtons();
    }

    private setupButtons() {
        const sw = this.app.screen.width;
        const sh = this.app.screen.height;
        const padding = 50;
        const btnSize = 70;

        // --- Cụm di chuyển (Bên trái) ---
        const btnLeft = this.createButton("◀", padding, sh - padding, 0x555555);
        const btnRight = this.createButton("▶", padding + btnSize + 20, sh - padding, 0x555555);

        // --- Cụm hành động (Bên phải) ---
        const btnJump = this.createButton("↑", sw - padding, sh - padding, 0x00AA00);
        const btnShoot = this.createButton("🔥", sw - padding - btnSize - 20, sh - padding, 0xAA0000);

        // Logic sự kiện cho nút Left
        btnLeft.on('pointerdown', () => this.input.left = true);
        btnLeft.on('pointerup', () => this.input.left = false);
        btnLeft.on('pointerupoutside', () => this.input.left = false);

        // Logic sự kiện cho nút Right
        btnRight.on('pointerdown', () => this.input.right = true);
        btnRight.on('pointerup', () => this.input.right = false);
        btnRight.on('pointerupoutside', () => this.input.right = false);

        // Logic sự kiện cho nút Jump (Tap)
        btnJump.on('pointerdown', () => this.input.jump = true);
        btnJump.on('pointerup', () => this.input.jump = false);
        btnJump.on('pointerupoutside', () => this.input.jump = false);

        // Logic sự kiện cho nút Shoot (Tap)
        btnShoot.on('pointerdown', () => this.input.shoot = true);
        btnShoot.on('pointerup', () => this.input.shoot = false);
        btnShoot.on('pointerupoutside', () => this.input.shoot = false);
    }

    private createButton(text: string, x: number, y: number, color: number): PIXI.Graphics {
        const btn = new PIXI.Graphics();
        btn.beginFill(color, 0.5); // Tăng độ đậm lên một chút
        btn.drawCircle(0, 0, 45); // Tăng kích thước vùng bấm cho dễ chạm
        btn.endFill();
        
        btn.x = x;
        btn.y = y;
        btn.eventMode = 'static';
        
        // Hiệu ứng phản hồi (Visual Feedback)
        btn.on('pointerdown', () => {
            btn.scale.set(0.85);
            btn.alpha = 1;
        });
        
        const onUp = () => {
            btn.scale.set(1);
            btn.alpha = 0.6;
        };
        
        btn.on('pointerup', onUp);
        btn.on('pointerupoutside', onUp);

        const txt = new PIXI.Text(text, { fill: 0xffffff, fontSize: 35 });
        txt.anchor.set(0.5);
        btn.addChild(txt);

        this.container.addChild(btn);
        return btn;
    }
}