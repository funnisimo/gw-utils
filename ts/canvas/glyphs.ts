type CTX = CanvasRenderingContext2D;
type DrawFunction = (
    ctx: CTX,
    x: number,
    y: number,
    width: number,
    height: number
) => void;
type DrawType = string | DrawFunction;

export type GlyphInitFn = (g: Glyphs, basic?: boolean) => void;

export interface GlyphOptions {
    font?: string;

    fontSize?: number;
    size?: number; // alias for fontSize

    tileWidth?: number;
    tileHeight?: number;

    init?: GlyphInitFn;
    basicOnly?: boolean;
    basic?: boolean; // alias for basicOnly
}

export class Glyphs {
    _node: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;
    _tileWidth: number = 12;
    _tileHeight: number = 16;
    needsUpdate: boolean = true;
    _toGlyph: Record<string, number> = {};
    _toChar: string[] = [];

    static fromImage(src: string | HTMLImageElement) {
        if (typeof src === 'string') {
            if (src.startsWith('data:'))
                throw new Error(
                    'Glyph: You must load a data string into an image element and use that.'
                );

            const el = document.getElementById(src);
            if (!el)
                throw new Error(
                    'Glyph: Failed to find image element with id:' + src
                );
            src = el as HTMLImageElement;
        }

        const glyph = new this({
            tileWidth: src.width / 16,
            tileHeight: src.height / 16,
        });
        glyph._ctx.drawImage(src, 0, 0);
        return glyph;
    }

    static fromFont(src: GlyphOptions | string) {
        if (typeof src === 'string') {
            src = { font: src } as GlyphOptions;
        }

        const glyphs = new this(src);
        const basicOnly = src.basicOnly || src.basic || false;
        const initFn = src.init || initGlyphs;
        initFn(glyphs, basicOnly);
        return glyphs;
    }

    private constructor(opts: GlyphOptions = {}) {
        opts.font = opts.font || 'monospace';

        this._node = document.createElement('canvas');
        this._ctx = this.node.getContext('2d') as CanvasRenderingContext2D;

        this._configure(opts);
    }

    get node() {
        return this._node;
    }
    get ctx() {
        return this._ctx;
    }
    get tileWidth() {
        return this._tileWidth;
    }
    get tileHeight() {
        return this._tileHeight;
    }
    get pxWidth() {
        return this._node.width;
    }
    get pxHeight() {
        return this._node.height;
    }

    forChar(ch: string) {
        if (!ch || !ch.length) return -1;
        return this._toGlyph[ch] || -1;
    }

    toChar(n: number): string {
        return this._toChar[n] || ' ';
    }

    private _configure(opts: GlyphOptions) {
        this._tileWidth = opts.tileWidth || this.tileWidth;
        this._tileHeight = opts.tileHeight || this.tileHeight;

        this.node.width = 16 * this.tileWidth;
        this.node.height = 16 * this.tileHeight;

        this._ctx.fillStyle = 'black';
        this._ctx.fillRect(0, 0, this.pxWidth, this.pxHeight);

        const size =
            opts.fontSize ||
            opts.size ||
            Math.max(this.tileWidth, this.tileHeight);
        this._ctx.font = '' + size + 'px ' + opts.font;
        this._ctx.textAlign = 'center';
        this._ctx.textBaseline = 'middle';
        this._ctx.fillStyle = 'white';
    }

    draw(n: number, ch: DrawType) {
        if (n >= 256) throw new Error('Cannot draw more than 256 glyphs.');
        const x = (n % 16) * this.tileWidth;
        const y = Math.floor(n / 16) * this.tileHeight;
        const cx = x + Math.floor(this.tileWidth / 2);
        const cy = y + Math.floor(this.tileHeight / 2);

        this._ctx.save();

        this._ctx.beginPath();
        this._ctx.rect(x, y, this.tileWidth, this.tileHeight);
        this._ctx.clip();
        this._ctx.fillStyle = 'black';
        this._ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
        this._ctx.fillStyle = 'white';

        if (typeof ch === 'function') {
            ch(this._ctx, x, y, this.tileWidth, this.tileHeight);
        } else {
            if (this._toGlyph[ch] === undefined) this._toGlyph[ch] = n;
            this._toChar[n] = ch;
            this._ctx.fillText(ch, cx, cy);
        }

        this._ctx.restore();
        this.needsUpdate = true;
    }
}

export function initGlyphs(
    glyphs: { draw: (n: number, ch: string) => void },
    basicOnly = false
) {
    for (let i = 32; i < 127; ++i) {
        glyphs.draw(i, String.fromCharCode(i));
    }

    [
        ' ', // empty
        '\u263a', // smiley hollow
        '\u263b', // smiley filled
        '\u2665', // hearts
        '\u2666', // diamonds
        '\u2663', // clubs
        '\u2660', // spades
        '\u263c', // sun hollow
        '\u2600', // sun filled
        '\u2606', // star hollow
        '\u2605', // star filled
        '\u2023', // bullet triangle
        '\u2219', // bullet square
        '\u2043', // bullet hyphen
        '\u2022', // bullet circle
        '\u2630', // trigram - hamburger menu
        '\u2637', // trigram split

        '\u2610', // unchecked
        '\u2611', // checked
        '\u2612', // checked - with X
        '\u26ac', // radio - off
        '\u29bf', // radio - on

        '\u2191', // up arrow
        '\u2192', // right arrow
        '\u2193', // down arrow
        '\u2190', // left arrow
        '\u2194', // left+right arrow
        '\u2195', // up+down arrow
        '\u25b2', // big up arrow
        '\u25b6', // big right arrow
        '\u25bc', // big down arrow
        '\u25c0', // big left arrow
    ].forEach((ch, i) => {
        glyphs.draw(i, ch);
    });

    if (!basicOnly) {
        // [
        // '\u2302',
        // '\u2b09', '\u272a', '\u2718', '\u2610', '\u2611', '\u25ef', '\u25ce', '\u2690',
        // '\u2691', '\u2598', '\u2596', '\u259d', '\u2597', '\u2744', '\u272d', '\u2727',
        // '\u25e3', '\u25e4', '\u25e2', '\u25e5', '\u25a8', '\u25a7', '\u259a', '\u265f',
        // '\u265c', '\u265e', '\u265d', '\u265b', '\u265a', '\u301c', '\u2694', '\u2692',
        // '\u25b6', '\u25bc', '\u25c0', '\u25b2', '\u25a4', '\u25a5', '\u25a6', '\u257a',
        // '\u257b', '\u2578', '\u2579', '\u2581', '\u2594', '\u258f', '\u2595', '\u272d',
        // '\u2591', '\u2592', '\u2593', '\u2503', '\u252b', '\u2561', '\u2562', '\u2556',
        // '\u2555', '\u2563', '\u2551', '\u2557', '\u255d', '\u255c', '\u255b', '\u2513',
        // '\u2517', '\u253b', '\u2533', '\u2523', '\u2501', '\u254b', '\u255e', '\u255f',
        // '\u255a', '\u2554', '\u2569', '\u2566', '\u2560', '\u2550', '\u256c', '\u2567',
        // '\u2568', '\u2564', '\u2565', '\u2559', '\u2558', '\u2552', '\u2553', '\u256b',
        // '\u256a', '\u251b', '\u250f', '\u2588', '\u2585', '\u258c', '\u2590', '\u2580',
        // '\u03b1', '\u03b2', '\u0393', '\u03c0', '\u03a3', '\u03c3', '\u03bc', '\u03c4',
        // '\u03a6', '\u03b8', '\u03a9', '\u03b4', '\u221e', '\u03b8', '\u03b5', '\u03b7',
        // '\u039e', '\u00b1', '\u2265', '\u2264', '\u2234', '\u2237', '\u00f7', '\u2248',
        // '\u22c4', '\u22c5', '\u2217', '\u27b5', '\u2620', '\u2625', '\u25fc', '\u25fb'
        // ].forEach( (ch, i) => {
        //   this.draw(i + 127, ch);
        // });

        [
            '\u2302',
            '\u00C7',
            '\u00FC',
            '\u00E9',
            '\u00E2',
            '\u00E4',
            '\u00E0',
            '\u00E5',
            '\u00E7',
            '\u00EA',
            '\u00EB',
            '\u00E8',
            '\u00EF',
            '\u00EE',
            '\u00EC',
            '\u00C4',
            '\u00C5',

            '\u00C9',
            '\u00E6',
            '\u00C6',
            '\u00F4',
            '\u00F6',
            '\u00F2',
            '\u00FB',
            '\u00F9',
            '\u00FF',
            '\u00D6',
            '\u00DC',
            '\u00A2',
            '\u00A3',
            '\u00A5',
            '\u20A7',
            '\u0192',

            '\u00E1',
            '\u00ED',
            '\u00F3',
            '\u00FA',
            '\u00F1',
            '\u00D1',
            '\u00AA',
            '\u00BA',
            '\u00BF',
            '\u2310',
            '\u00AC',
            '\u00BD',
            '\u00BC',
            '\u00A1',
            '\u00AB',
            '\u00BB',

            '\u2591',
            '\u2592',
            '\u2593',
            '\u2502',
            '\u2524',
            '\u2561',
            '\u2562',
            '\u2556',
            '\u2555',
            '\u2563',
            '\u2551',
            '\u2557',
            '\u255D',
            '\u255C',
            '\u255B',
            '\u2510',

            '\u2514',
            '\u2534',
            '\u252C',
            '\u251C',
            '\u2500',
            '\u253C',
            '\u255E',
            '\u255F',
            '\u255A',
            '\u2554',
            '\u2569',
            '\u2566',
            '\u2560',
            '\u2550',
            '\u256C',
            '\u2567',

            '\u2568',
            '\u2564',
            '\u2565',
            '\u2559',
            '\u2558',
            '\u2552',
            '\u2553',
            '\u256B',
            '\u256A',
            '\u2518',
            '\u250C',
            '\u2588',
            '\u2584',
            '\u258C',
            '\u2590',
            '\u2580',

            '\u03B1',
            '\u00DF',
            '\u0393',
            '\u03C0',
            '\u03A3',
            '\u03C3',
            '\u00B5',
            '\u03C4',
            '\u03A6',
            '\u0398',
            '\u03A9',
            '\u03B4',
            '\u221E',
            '\u03C6',
            '\u03B5',
            '\u2229', // n

            '\u2261',
            '\u00B1',
            '\u2265',
            '\u2264',
            '\u2320',
            '\u2321',
            '\u00F7',
            '\u2248',
            '\u00B0',
            '\u2219',
            '\u00B7',
            '\u221A',
            '\u207F',
            '\u00B2',
            '\u25A0',
            '\u00A0',
        ].forEach((ch, i) => {
            glyphs.draw(i + 127, ch);
        });
    }
}
