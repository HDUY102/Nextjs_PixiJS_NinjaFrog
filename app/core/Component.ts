import { Entity } from './Entity';

export abstract class Component {
    public entity!: Entity;

    // Mounted to an Entity
    public onAttach(entity: Entity): void {
        this.entity = entity;
    }

    // Main logic runs on each frame
    public abstract update(delta: number): void;
    
    // Clean up
    public destroy(): void {}
}