import * as Color from "../color";
import { SpriteType } from "../types";
export interface DrawInfo {
    ch: string | number;
    fg: Color.ColorBase;
    bg: Color.ColorBase;
}
export declare class Mixer implements DrawInfo {
    ch: string | number;
    fg: Color.Color;
    bg: Color.Color;
    constructor(base?: Partial<DrawInfo>);
    protected _changed(): this;
    copy(other: DrawInfo): this;
    clone(): Mixer;
    equals(other: Mixer): boolean;
    nullify(): this;
    blackOut(): this;
    draw(ch?: string | number, fg?: Color.ColorBase, bg?: Color.ColorBase): this;
    drawSprite(info: SpriteType, opacity?: number): this | undefined;
    invert(): this;
    multiply(color: Color.ColorBase, fg?: boolean, bg?: boolean): this;
    mix(color: Color.ColorBase, fg?: number, bg?: number): this;
    add(color: Color.ColorBase, fg?: number, bg?: number): this;
    separate(): this;
    bake(clearDancing?: boolean): {
        ch: string | number;
        fg: number;
        bg: number;
    };
    toString(): string;
}
