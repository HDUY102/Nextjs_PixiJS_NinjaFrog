// game/components/RenderComponent.ts
import * as PIXI from 'pixi.js';
import { Component } from '../../core/Component';

export class RenderComponent extends Component {
    private graphics: PIXI.Graphics;

    constructor(color: number, width: number, height: number) {
        super();
        this.graphics = new PIXI.Graphics();
        
        // Cú pháp PixiJS v8
        this.graphics.rect(-width/2, -height/2, width, height);
        this.graphics.fill(color);
    }

    onAttach(entity: any) {
        super.onAttach(entity);
        entity.addChild(this.graphics);
    }

    update(delta: number): void {}
}