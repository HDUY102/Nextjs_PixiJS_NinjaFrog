import { Component } from '../../core/Component';

export class TransformComponent extends Component {
    public velocityX: number = 0;
    public velocityY: number = 0;
    public speed: number = 5;

    update(delta: number): void {}
}