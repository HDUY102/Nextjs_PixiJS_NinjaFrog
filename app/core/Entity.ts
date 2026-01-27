import * as PIXI from 'pixi.js';
import { Component } from './Component';
import { Constructor } from './Types';

export class Entity extends PIXI.Container {
    public id: string;
    public userData: any = {};
    // Map save components by Class Constructor
    private components: Map<Function, Component> = new Map();

    constructor(id: string) {
        super();
        this.id = id;
    }

    // Adding Component (Builder Pattern)
    public addComponent(component: Component): Entity {
        component.onAttach(this);
        this.components.set(component.constructor, component);
        return this;
    }

    // Get Component (Generics Type Safety)
    public getComponent<T extends Component>(componentClass: Constructor<T>): T | undefined {
        return this.components.get(componentClass) as T;
    }

    // Get Component required (Fail Fast)
    public requireComponent<T extends Component>(componentClass: Constructor<T>): T {
        const component = this.getComponent(componentClass);
        if (!component) {
            throw new Error(`Entity '${this.id}' thiếu component bắt buộc: ${componentClass.name}`);
        }
        return component;
    }

    public update(delta: number): void {
        for (const component of this.components.values()) {
            component.update(delta);
        }
    }
}