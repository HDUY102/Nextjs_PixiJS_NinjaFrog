import { Component } from '../../core/Component';
import * as PIXI from 'pixi.js';
import { GameManager } from '../GameManager';

export class FruitComponent extends Component {
    private sprite: PIXI.AnimatedSprite;
    private collectedFrames: PIXI.Texture[];
    private isCollecting: boolean = false;
    private gameManager: GameManager

    constructor(sprite: PIXI.AnimatedSprite, collectedFrames: PIXI.Texture[], gameManager: GameManager) {
        super();
        this.collectedFrames = collectedFrames;
        this.sprite = sprite;
        this.sprite.animationSpeed = 0.2; // Tốc độ hoạt ảnh Fruit
        this.sprite.play();
        this.gameManager = gameManager;
    }

    onAttach(entity: any) {
        super.onAttach(entity);
        entity.addChild(this.sprite);
    }
    
    update(delta: number): void {
        if (this.isCollecting) {
            if (!this.sprite.playing) {
                this.entity.destroy();
            }
        }
    }

    public collect() {
        if (this.isCollecting) return;

        if (this.gameManager) {
            this.gameManager.addScore(1);
            this.gameManager.spawnFloatingText(this.entity.x, this.entity.y, "+1", 0x00ff00);
        }
        
        this.isCollecting = true;
        this.sprite.textures = this.collectedFrames;
        this.sprite.loop = false; // Hoạt ảnh chỉ chạy 1 lần
        this.sprite.animationSpeed = 0.25; // Tăng tốc độ hoạt ảnh
        this.sprite.play();
    }
}