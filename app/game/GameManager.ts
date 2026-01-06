import * as PIXI from 'pixi.js';
import { Entity } from '../core/Entity';
import { EntityFactory } from './EntityFactory';
import { getFramesFromSpriteSheet } from '../core/Utils';
import { PhysicsComponent } from './components/PhysicsComponent';
import { ICollidable } from '../core/Types';
import { LevelGenerator } from './LevelGenerator'; // Import LevelGenerator

export class GameManager {
    private app: PIXI.Application;
    private entities: Entity[] = [];
    private player: Entity | null = null;
    private enemies: Entity[] = [];
    private GAME_WIDTH: number = 800;

    // --- Quản lý Map ---
    private levelGenerator!: LevelGenerator;
    private lastChunkEndX: number = 0; // Vị trí pixel kết thúc của chunk cuối cùng
    private collidableTiles: ICollidable[] = [];
    private collectableItems: ICollidable[] = [];
    
    // Cấu hình khoảng cách
    private readonly SPAWN_DISTANCE_THRESHOLD = 800; // Còn 800px nữa hết map thì sinh tiếp
    private readonly DELETE_DISTANCE_THRESHOLD = 1200; // Cách nhân vật 1200px về phía sau thì xóa

    constructor(app: PIXI.Application) {
        this.app = app;
        // Bật tính năng sắp xếp lớp (Layer) để Player luôn nổi trên Tiles mới sinh
        this.app.stage.sortableChildren = true;
    }

    public async init() {
        const assetUrls = {
            idle: '/assets/ninja_frog/Idle (32x32).png',
            run: '/assets/ninja_frog/Run (32x32).png',
            jump: '/assets/ninja_frog/Jump (32x32).png',
            fall: '/assets/ninja_frog/Fall (32x32).png',
            double_jump: '/assets/ninja_frog/Double Jump (32x32).png',
            tile: '/assets/tile/Idle.png',
            playerHit: '/assets/ninja_frog/Hit (32x32).png',
            fruitStrip: '/assets/fruit/Apple.png',
            fruitCollected: '/assets/fruit/Collected.png',
            enemySnail: '/assets/enemy/Mushroom/Idle.png',
            enemyRun: '/assets/enemy/Mushroom/Run.png',
            enemyHit: '/assets/enemy/Mushroom/Hit.png',
            shuriken: '/assets/items/Shuriken pronta.png',
        };
        
        const loaded = await PIXI.Assets.load(Object.values(assetUrls));

        // Chuẩn bị Textures
        const playerTextures = {
            'idle': loaded[assetUrls.idle], 'run': loaded[assetUrls.run], 
            'jump': loaded[assetUrls.jump], 'fall': loaded[assetUrls.fall],
            'hit': loaded[assetUrls.playerHit], 'double_jump': loaded[assetUrls.double_jump]
        };
        const fruitFrames = getFramesFromSpriteSheet(loaded[assetUrls.fruitStrip], 32, 32, 6);
        const collectedFrames = getFramesFromSpriteSheet(loaded[assetUrls.fruitCollected], 32, 32, 6);
        const tileTexture = loaded[assetUrls.tile];

        // 1. Khởi tạo LevelGenerator
        this.levelGenerator = new LevelGenerator(tileTexture, fruitFrames, collectedFrames, loaded[assetUrls.enemySnail],loaded[assetUrls.enemyHit]);

        // 2. Sinh Map khởi đầu (Buffer 3-4 chunks để lấp đầy màn hình lúc đầu)
        // Reset điểm bắt đầu về 0
        this.lastChunkEndX = 0; 
        for (let i = 0; i < 4; i++) {
            this.spawnChunk();
        }

        // 3. Tạo Player
        this.player = EntityFactory.createPlayer(playerTextures, this);
        this.player.zIndex = 100; // Đặt Z-Index cao để luôn vẽ đè lên Map
        this.addEntity(this.player);
        
        // Gán tham chiếu vật lý ban đầu
        this.updatePlayerPhysicsRef();

        // 4. Start Loop
        this.app.ticker.add((ticker) => {
            this.update(ticker.deltaTime);
        });
    }

    /**
     * Logic sinh Chunk mới và nối vào đuôi
     */
    private spawnChunk() {
        if (!this.levelGenerator) return;

        // Gọi generator để tạo data tại vị trí cuối cùng
        const data = this.levelGenerator.generateNextChunk(this.lastChunkEndX, this);
        
        // Cập nhật vị trí cuối mới
        this.lastChunkEndX = data.nextStartX;

        // Thêm entities vào scene
        data.entities.forEach(entity => {
            this.addEntity(entity);
            if (entity.id.startsWith('enemy_')) {
                this.enemies.push(entity);
                const enPhysics = entity.getComponent(PhysicsComponent);
                if (enPhysics) {
                    // Gán danh sách gạch để quái vật không lơ lửng
                    enPhysics.collidableTiles = this.collidableTiles;
                }
            }
        });

        // Cập nhật danh sách va chạm
        this.collidableTiles.push(...data.collidables);
        this.collectableItems.push(...data.collectables);

        this.updatePlayerPhysicsRef();
    }

    private addEntity(entity: Entity) {
        this.entities.push(entity);
        this.app.stage.addChild(entity);
    }

    private update(delta: number) {
        // Update logic của từng entity
        for (const entity of this.entities) {
            entity.update(delta);
        }

        if (this.player) {
            // 1. Logic CAMERA
            let targetStageX = (this.GAME_WIDTH / 2) - this.player.x;
            if (targetStageX > 0) targetStageX = 0; // Chặn biên trái
            this.app.stage.x = targetStageX;

            // 2. Logic INFINITE MAP (Sinh map mới)
            // Nếu khoảng cách từ Player đến cuối Map < 800px -> Sinh tiếp
            const distToEnd = this.lastChunkEndX - this.player.x;
            if (distToEnd < this.SPAWN_DISTANCE_THRESHOLD) {
                this.spawnChunk();
                
                // Tiện thể dọn dẹp map cũ luôn để tối ưu performance
                this.cleanupOldChunks();
                
                // Cập nhật lại tham chiếu physics sau khi thay đổi mảng
                this.updatePlayerPhysicsRef();
            }
        }

        // Loại bỏ các entity đã bị mark destroyed
        this.entities = this.entities.filter(entity => !entity.destroyed);
    }

    /**
     * Cập nhật tham chiếu array cho Physics Component
     * Cần gọi mỗi khi array collidableTiles hoặc collectableItems thay đổi (thêm mới hoặc xóa cũ)
     */
    private updatePlayerPhysicsRef() {
        if (!this.player) return;
        const physics = this.player.getComponent(PhysicsComponent);
        if (physics) {
            physics.collidableTiles = this.collidableTiles;
            physics.collectableItems = this.collectableItems;
            physics.enemies = this.enemies;
        }
    }

    /**
     * Dọn dẹp các Chunk đã đi qua quá xa giảm tải CPU và RAM
     */
    private cleanupOldChunks() {
        if (!this.player) return;
        
        // Tính mốc tọa độ cần xóa (Ví dụ: Player ở 2000, xóa tất cả cái gì < 800)
        const deleteThreshold = this.player.x - this.DELETE_DISTANCE_THRESHOLD;

        // 1. Destroy Entity PIXI (Xóa khỏi màn hình)
        this.entities.forEach(e => {
            // Phải kiểm tra xem entity có bị destroy trước đó chưa (ví dụ do bị ăn mất)
            // Nếu e.destroyed = true thì thuộc tính .x của PIXI không còn tồn tại -> gây crash
            if (!e || e.destroyed) return; 

            // Sau khi đảm bảo nó còn sống, mới kiểm tra vị trí
            if (e.id !== 'player' && e.x < deleteThreshold) {
                e.destroy(); 
            }
        });

        // 2. Xóa dữ liệu va chạm khỏi mảng Logic
        this.collidableTiles = this.collidableTiles.filter(t => t.x >= deleteThreshold);
        this.collectableItems = this.collectableItems.filter(i => i.x >= deleteThreshold);
        this.enemies = this.enemies.filter(e => !e.destroyed);
    }

    public findEntityById(id: string): Entity | undefined {
        return this.entities.find(e => e.id === id);
    }

    public destroy() {
        this.entities.forEach(e => e.destroy());
    }
}