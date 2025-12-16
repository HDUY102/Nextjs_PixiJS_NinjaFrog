import { Component } from '../../core/Component';
import * as PIXI from 'pixi.js';

export class FruitComponent extends Component {
    private sprite: PIXI.AnimatedSprite;
    private collectedFrames: PIXI.Texture[];
    private isCollecting: boolean = false;

    constructor(sprite: PIXI.AnimatedSprite, collectedFrames: PIXI.Texture[]) {
        super();
        this.collectedFrames = collectedFrames;
        this.sprite = sprite;
        this.sprite.animationSpeed = 0.2; // Tốc độ hoạt ảnh Fruit
        this.sprite.play();
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
        
        this.isCollecting = true;
        this.sprite.textures = this.collectedFrames;
        this.sprite.loop = false; // Hoạt ảnh chỉ chạy 1 lần
        this.sprite.animationSpeed = 0.25; // Tăng tốc độ hoạt ảnh
        this.sprite.play();
    }
}