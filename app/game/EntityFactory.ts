import * as PIXI from 'pixi.js';
import { Entity } from '../core/Entity';
import { TransformComponent } from './components/TransformComponent';
import { PhysicsComponent } from './components/PhysicsComponent';
import { InputComponent } from './components/InputComponent';
import { AnimatedSpriteComponent, AnimationState } from '../components/AnimatedSpriteComponent';
import { getFramesFromSpriteSheet } from '../core/Utils';

export class EntityFactory {
    
    // Hàm này giờ cần nhận Textures đã load sẵn từ GameManager
    static createPlayer(textures: Record<string, PIXI.Texture>): Entity {
        const player = new Entity('player');
        player.x = 200;
        player.y = 200; // Đặt cao hơn chút để rơi xuống

        // 1. Cắt Texture ra thành các frames
        // Ninja Frog (32x32): Idle (11 frames), Run (12 frames), Jump (1 frame), Fall (1 frame)
        const animations: Record<AnimationState, PIXI.Texture[]> = {
            idle: getFramesFromSpriteSheet(textures['idle'], 32, 32, 11),
            run:  getFramesFromSpriteSheet(textures['run'], 32, 32, 12),
            jump: getFramesFromSpriteSheet(textures['jump'], 32, 32, 1),
            fall: getFramesFromSpriteSheet(textures['fall'], 32, 32, 1),
        };

        player
            .addComponent(new TransformComponent())
            .addComponent(new AnimatedSpriteComponent(animations)) // Dùng component mới
            .addComponent(new PhysicsComponent())
            .addComponent(new InputComponent());

        // Phóng to nhân vật lên 2 lần cho dễ nhìn (Pixel art thường nhỏ)
        player.scale.set(2); 

        return player;
    }

    // Enemy tạm thời giữ nguyên hoặc nâng cấp tương tự
    static createEnemy(x: number, y: number): Entity {
        const enemy = new Entity('enemy');
        enemy.x = x;
        enemy.y = y;
        // ... (Logic cũ dùng RenderComponent hình vuông hoặc làm tương tự Player)
        return enemy;
    }
}