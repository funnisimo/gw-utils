import * as Utils from "./utils";
declare type Loc = Utils.Loc;
export declare type ArrayInit<T> = (i: number) => T;
export declare function makeArray<T>(l: number, fn?: T | ArrayInit<T>): Array<T>;
export declare type GridInit<T> = (x: number, y: number) => T;
export declare type GridEach<T> = (value: T, x: number, y: number, grid: Grid<T>) => void;
export declare type GridUpdate<T> = (value: T, x: number, y: number, grid: Grid<T>) => T;
export declare type GridMatch<T> = (value: T, x: number, y: number, grid: Grid<T>) => boolean;
export declare type GridFormat<T> = (value: T, x: number, y: number) => string;
export declare class Grid<T> extends Array<Array<T>> {
    protected _width: number;
    protected _height: number;
    constructor(w: number, h: number, v: GridInit<T> | T);
    get width(): number;
    get height(): number;
    forEach(fn: GridEach<T>): void;
    eachNeighbor(x: number, y: number, fn: GridEach<T>, only4dirs?: boolean): void;
    forRect(x: number, y: number, w: number, h: number, fn: GridEach<T>): void;
    map(fn: GridEach<T>): void[][];
    forCircle(x: number, y: number, radius: number, fn: GridEach<T>): void;
    hasXY(x: number, y: number): boolean;
    isBoundaryXY(x: number, y: number): boolean;
    calcBounds(): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    update(fn: GridUpdate<T>): void;
    updateRect(x: number, y: number, width: number, height: number, fn: GridUpdate<T>): void;
    updateCircle(x: number, y: number, radius: number, fn: GridUpdate<T>): void;
    fill(v: T | GridUpdate<T>): void;
    fillRect(x: number, y: number, w: number, h: number, v: T | GridUpdate<T>): void;
    fillCircle(x: number, y: number, radius: number, v: T | GridUpdate<T>): void;
    replace(findValue: T, replaceValue: T): void;
    copy(from: Grid<T>): void;
    count(match: GridMatch<T> | T): number;
    dump(fmtFn?: GridFormat<T>): void;
    dumpRect(left: number, top: number, width: number, height: number, fmtFn?: GridFormat<T>): void;
    dumpAround(x: number, y: number, radius: number): void;
    closestMatchingLoc(x: number, y: number, fn: GridMatch<T>): Loc;
    firstMatchingLoc(v: T | GridMatch<T>): Loc;
    randomMatchingLoc(v: T | GridMatch<T>, deterministic?: boolean): Loc;
    matchingLocNear(x: number, y: number, v: T | GridMatch<T>, deterministic?: boolean): Loc;
    arcCount(x: number, y: number, testFn: GridMatch<T>): number;
}
export declare class NumGrid extends Grid<number> {
    x?: number;
    y?: number;
    static alloc(w: number, h: number, v?: number): NumGrid;
    static free(grid: NumGrid): void;
    constructor(w: number, h: number, v?: number);
    resize(width: number, height: number, v?: GridInit<number> | number): void;
    findReplaceRange(findValueMin: number, findValueMax: number, fillValue: number): void;
    floodFillRange(x: number, y: number, eligibleValueMin?: number, eligibleValueMax?: number, fillValue?: number): number;
    invert(): void;
    closestLocWithValue(x: number, y: number, value?: number): Loc;
    randomLocWithValue(validValue?: number): Loc;
    getQualifyingLocNear(x: number, y: number, deterministic?: boolean): Utils.Loc;
    leastPositiveValue(): number;
    randomLeastPositiveLoc(deterministic?: boolean): Loc;
    floodFill(x: number, y: number, matchValue: number | GridMatch<number>, fillValue: number | GridUpdate<number>): number;
    protected _cellularAutomataRound(birthParameters: string, survivalParameters: string): boolean;
    fillBlob(roundCount: number, minBlobWidth: number, minBlobHeight: number, maxBlobWidth: number, maxBlobHeight: number, percentSeeded: number, birthParameters: string, survivalParameters: string): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
export declare const alloc: typeof NumGrid.alloc;
export declare const free: typeof NumGrid.free;
export declare function make<T>(w: number, h: number, v?: T | GridInit<T>): NumGrid | Grid<T>;
export declare type GridZip<T, U> = (destVal: T, sourceVal: U, destX: number, destY: number, sourceX: number, sourceY: number, destGrid: Grid<T>, sourceGrid: Grid<U>) => void;
export declare function offsetZip<T, U>(destGrid: Grid<T>, srcGrid: Grid<U>, srcToDestX: number, srcToDestY: number, value: T | GridZip<T, U>): void;
export declare function directionOfDoorSite<T>(grid: Grid<T>, x: number, y: number, isOpen: T | GridMatch<T>): number;
export declare function intersection(onto: NumGrid, a: NumGrid, b: NumGrid): void;
export declare function unite(onto: NumGrid, a: NumGrid, b: NumGrid): void;
export {};
