import * as Color from '../color';
import { SpriteData } from '../types';
import { make as Make } from '../gw';

export interface SpriteConfig {
    ch: string | null;
    fg: Color.ColorBase | null;
    bg: Color.ColorBase | null;
    opacity: number;
}

export class Sprite implements SpriteData {
    public ch: string | null;
    public fg: Color.Color;
    public bg: Color.Color;
    public opacity: number;
    public name?: string;

    constructor(
        ch?: string | null,
        fg?: Color.ColorBase | null,
        bg?: Color.ColorBase | null,
        opacity = 100
    ) {
        if (!ch) ch = null;
        this.ch = ch;
        this.fg = Color.from(fg);
        this.bg = Color.from(bg);
        this.opacity = opacity >= 0 ? opacity : 100;
    }

    clone() {
        return new Sprite(this.ch, this.fg, this.bg, this.opacity);
    }
}

export const sprites: Record<string, Sprite> = {};

export function make(): Sprite;
export function make(bg: Color.ColorBase, opacity?: number): Sprite;
export function make(
    ch: string | null,
    fg: Color.ColorBase | null,
    bg: Color.ColorBase | null,
    opacity?: number
): Sprite;
export function make(args: any[]): Sprite;
export function make(info: Partial<SpriteConfig>): Sprite;
export function make(...args: any[]) {
    let ch = null,
        fg: Color.ColorBase | null = -1,
        bg: Color.ColorBase | null = -1,
        opacity;

    if (args.length == 0) {
        return new Sprite(null, -1, -1);
    } else if (args.length == 1 && Array.isArray(args[0])) {
        args = args[0];
    }
    if (args.length > 3) {
        opacity = args[3];
        args.pop();
    } else if (
        args.length == 2 &&
        typeof args[1] == 'number' &&
        args[0].length > 1
    ) {
        opacity = args.pop();
    }
    if (args.length > 1) {
        ch = args[0] || null;
        fg = args[1];
        bg = args[2];
    } else {
        if (typeof args[0] === 'string' && args[0].length == 1) {
            ch = args[0];
            fg = 'white'; // white is default?
        } else if (
            (typeof args[0] === 'string' && args[0].length > 1) ||
            typeof args[0] === 'number'
        ) {
            bg = args[0];
        } else if (args[0] instanceof Color.Color) {
            bg = args[0];
        } else {
            const sprite = args[0] as SpriteConfig;
            ch = sprite.ch || null;
            fg = sprite.fg || -1;
            bg = sprite.bg || -1;
            opacity = sprite.opacity;
        }
    }
    if (typeof fg === 'string') fg = Color.from(fg);
    else if (Array.isArray(fg)) fg = Color.make(fg);
    else if (fg === undefined || fg === null) fg = -1;

    if (typeof bg === 'string') bg = Color.from(bg);
    else if (Array.isArray(bg)) bg = Color.make(bg);
    else if (bg === undefined || bg === null) bg = -1;

    return new Sprite(ch, fg, bg, opacity);
}

Make.sprite = make;

export function from(name: string): Sprite;
export function from(config: Partial<SpriteConfig>): Sprite;
export function from(...args: any[]): Sprite {
    if (args.length == 1 && typeof args[0] === 'string') {
        const sprite = sprites[args[0]];
        if (!sprite) throw new Error('Failed to find sprite: ' + args[0]);
        return sprite;
    }
    return make(args);
}

export function install(
    name: string,
    bg: Color.ColorBase,
    opacity?: number
): Sprite;
export function install(
    name: string,
    ch: string | null,
    fg: Color.Color | number | string | number[] | null,
    bg: Color.Color | number | string | number[] | null,
    opacity?: number
): Sprite;
export function install(name: string, args: any[]): Sprite;
export function install(name: string, info: Partial<SpriteConfig>): Sprite;
export function install(name: string, ...args: any[]) {
    let sprite;
    // @ts-ignore
    sprite = make(...args);
    sprite.name = name;
    sprites[name] = sprite;
    return sprite;
}
