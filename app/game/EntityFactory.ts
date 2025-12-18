import * as PIXI from 'pixi.js';
import { Entity } from '../core/Entity';
import { TransformComponent } from './components/TransformComponent';
import { PhysicsComponent } from './components/PhysicsComponent';
import { InputComponent } from './components/InputComponent';
import { AnimatedSpriteComponent, AnimationState } from '../components/AnimatedSpriteComponent';
import { getFramesFromSpriteSheet } from '../core/Utils';
import { FruitComponent } from './components/FruitComponent';

interface IGameManager {
    findEntityById(id: string): Entity | undefined;
}

const TILE_SIZE = 64;

export class EntityFactory {
    
    static createPlayer(textures: Record<string, PIXI.Texture>, gameManager: IGameManager): Entity {
        const player = new Entity('player');
        player.x = 200;
        player.y = 200; // Đặt cao hơn chút để rơi xuống

        // 1. Cắt Texture ra thành các frames
        const animations: Record<AnimationState, PIXI.Texture[]> = {
            idle: getFramesFromSpriteSheet(textures['idle'], 32, 32, 11),
            run:  getFramesFromSpriteSheet(textures['run'], 32, 32, 12),
            jump: getFramesFromSpriteSheet(textures['jump'], 32, 32, 1),
            fall: getFramesFromSpriteSheet(textures['fall'], 32, 32, 1),
        };

        player
            .addComponent(new TransformComponent())
            .addComponent(new AnimatedSpriteComponent(animations))
            .addComponent(new PhysicsComponent(gameManager))
            .addComponent(new InputComponent());

        // Phóng to nhân vật lên 2 lần
        player.scale.set(2); 

        return player;
    }

    static createEnemy(x: number, y: number): Entity {
        const enemy = new Entity('enemy');
        enemy.x = x;
        enemy.y = y;
        return enemy;
    }

    // Tạo Tile (Khối gạch)
    static createTile(texture: PIXI.Texture, x: number, y: number): Entity {
        const uniqueId = `tile_${x}_${y}`;
        const tile = new Entity(uniqueId);
        tile.x = Math.floor(x);
        tile.y = Math.floor(y);

        const sprite = PIXI.Sprite.from(texture);
        sprite.width = TILE_SIZE;
        sprite.height = TILE_SIZE;
        sprite.anchor.set(0); 

        // Đảm bảo khử răng cưa cho Pixel Art
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        
        tile.addChild(sprite);
        tile.addComponent(new TransformComponent());
        
        return tile;
    }

    // Tạo Fruit (Sử dụng logic của Coin)
    static createFruit(textures: PIXI.Texture[], collectedTextures: PIXI.Texture[], x: number, y: number): Entity {
        const uniqueId = `fruit_${x}_${y}`;
        const fruit = new Entity(uniqueId);
        fruit.x = x + TILE_SIZE / 2;
        fruit.y = y + TILE_SIZE / 2;
        
        const animatedSprite = new PIXI.AnimatedSprite(textures);
        animatedSprite.anchor.set(0.5);
        animatedSprite.scale.set(1.5); 
        
        fruit.addComponent(new TransformComponent());
        fruit.addComponent(new FruitComponent(animatedSprite, collectedTextures));
        
        return fruit;
    }
}