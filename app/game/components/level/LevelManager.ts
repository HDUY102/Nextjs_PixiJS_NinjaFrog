import * as PIXI from 'pixi.js';
import { LevelConfig, LEVELS } from './LevelConfig';

export class LevelManager {
    private app: PIXI.Application;
    private currentLevelIndex: number = 0;
    
    // Callback để báo cho GameManager biết cần thay đổi tốc độ
    public onLevelUp: ((config: LevelConfig) => void) | null = null;

    constructor(app: PIXI.Application) {
        this.app = app;
    }

    public getCurrentConfig(): LevelConfig {
        return LEVELS[this.currentLevelIndex];
    }

    public checkLevelUp(currentScore: number) {
        // Kiểm tra xem còn level tiếp theo không
        if (this.currentLevelIndex >= LEVELS.length - 1) return;

        const nextLevelConfig = LEVELS[this.currentLevelIndex + 1];

        // Nếu điểm hiện tại >= điểm yêu cầu của level tiếp theo
        if (currentScore >= nextLevelConfig.targetScore) { // Logic so sánh với targetScore của level kế tiếp
            this.levelUp();
        }
    }

    private levelUp() {
        this.currentLevelIndex++;
        const config = this.getCurrentConfig();

        // 1. Đổi màu nền
        this.app.renderer.background.color = config.backgroundColor;

        // 2. Hiển thị thông báo
        this.showLevelText(config.message);

        // 3. Gọi callback để GameManager cập nhật tốc độ
        if (this.onLevelUp) {
            this.onLevelUp(config);
        }
    }

    private showLevelText(text: string) {
        const style = new PIXI.TextStyle({
            fill: "#ffffff",
            fontSize: 60,
            fontWeight: "bold",
            stroke: "#000000",
            dropShadow: true,
        });
        
        const levelText = new PIXI.Text({ text, style });
        levelText.anchor.set(0.5);
        levelText.x = this.app.screen.width / 2;
        levelText.y = this.app.screen.height / 2 - 100;
        levelText.zIndex = 1000; // Luôn nổi lên trên cùng
        
        this.app.stage.addChild(levelText);

        // Hiệu ứng bay lên và biến mất
        let timer = 0;
        const animate = (ticker: PIXI.Ticker) => {
            timer += ticker.deltaTime;
            levelText.y -= 1;
            levelText.alpha -= 0.015;

            if (levelText.alpha <= 0) {
                this.app.ticker.remove(animate);
                levelText.destroy();
            }
        };
        this.app.ticker.add(animate);
    }
}