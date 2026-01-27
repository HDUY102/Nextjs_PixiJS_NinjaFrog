// Define type Constructor to use Generics
export type Constructor<T> = new (...args: any[]) => T;

export interface ICollidable {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    type?: number;
    isUsed?: boolean;
}