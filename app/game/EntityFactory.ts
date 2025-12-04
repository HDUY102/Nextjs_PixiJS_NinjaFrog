import { Entity } from '../core/Entity';
import { TransformComponent } from './components/TransformComponent';
import { RenderComponent } from './components/RenderComponents';
import { PhysicsComponent } from './components/PhysicsComponent';
import { InputComponent } from './components/InputComponent';

export class EntityFactory {
    
    // Tạo Mario (Hình vuông màu đỏ)
    static createPlayer(): Entity {
        const player = new Entity('player');
        player.x = 200;
        player.y = 200;

        player
            .addComponent(new TransformComponent())
            .addComponent(new RenderComponent(0xFF0000, 40, 40)) // Màu Đỏ
            .addComponent(new PhysicsComponent())
            .addComponent(new InputComponent());

        return player;
    }

    // Tạo chướng ngại vật (Hình vuông màu xanh lá)
    static createEnemy(x: number, y: number): Entity {
        const enemy = new Entity('enemy');
        enemy.x = x;
        enemy.y = y;

        enemy
            .addComponent(new TransformComponent())
            .addComponent(new RenderComponent(0x00FF00, 40, 40)) // Màu Xanh
            .addComponent(new PhysicsComponent());
        
        return enemy;
    }
}