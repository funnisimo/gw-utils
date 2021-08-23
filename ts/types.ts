import { Color, ColorBase } from './color';
// import { LightType } from './light/types';
// import { Chainable } from './utils/chain';

// import { CellType, MapType } from './map/types';
// export { CellType, MapType };

export type Loc = [number, number];
export interface XY {
    x: number;
    y: number;
}

export interface SpriteData {
    readonly ch?: string | null;
    readonly fg?: Color | ColorBase;
    readonly bg?: Color | ColorBase;
    readonly opacity?: number;
}

export type EachCb<T> = (t: T) => any;
