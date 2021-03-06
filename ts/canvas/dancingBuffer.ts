import { Mixer, DrawInfo } from '../sprite/mixer';
import * as Color from '../color';
import * as Text from '../text/index';
import { DataBuffer, BufferTarget } from './buffer';

export class DancingData {
    protected _data: Mixer[] = [];
    private _width: number;
    private _height: number;

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._data = new Array(width * height).fill(0).map(() => new Mixer());
    }

    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }

    get(x: number, y: number): Mixer {
        let index = y * this.width + x;
        const style = this._data[index];
        return style;
    }

    toGlyph(ch: string | number) {
        if (typeof ch === 'number') return ch;
        if (!ch || !ch.length) return -1; // 0 handled elsewhere
        return ch.charCodeAt(0);
    }

    draw(
        x: number,
        y: number,
        glyph: number | string = -1,
        fg: Color.ColorBase = -1, // TODO - White?
        bg: Color.ColorBase = -1 // TODO - Black?
    ) {
        let index = y * this.width + x;
        const current = this._data[index];
        if (!current) return;
        current.draw(glyph, fg, bg);
        return this;
    }

    // This is without opacity - opacity must be done in Mixer
    drawSprite(x: number, y: number, sprite: Partial<DrawInfo>) {
        let index = y * this.width + x;
        const current = this._data[index];
        if (!current) return;
        current.drawSprite(sprite);
        return this;
    }

    blackOut(x: number, y: number): void;
    blackOut(): void;
    blackOut(...args: number[]) {
        if (args.length == 0) {
            return this.fill(0, 0, 0);
        }
        return this.draw(args[0], args[1], 0, 0, 0);
    }

    fill(glyph: number | string = 0, fg: number = 0xfff, bg: number = 0) {
        this._data.forEach((m) => m.draw(glyph, fg, bg));
        return this;
    }

    copy(other: DataBuffer | DancingData) {
        if (other instanceof DataBuffer) {
            this._data.forEach((m, i) => {
                const x = i % this.width;
                const y = Math.floor(i / this.width);
                m.copy(other.get(x, y));
            });
        } else {
            this._data.forEach((m, i) => {
                m.copy(other._data[i]);
            });
        }
        return this;
    }

    drawText(
        x: number,
        y: number,
        text: string,
        fg: Color.ColorBase = 0xfff,
        bg: Color.ColorBase = -1
    ) {
        if (typeof fg !== 'number') fg = Color.from(fg);
        if (typeof bg !== 'number') bg = Color.from(bg);

        Text.eachChar(
            text,
            (ch, fg0, bg0, i) => {
                if (x + i >= this.width) return;
                this.draw(i + x, y, ch, fg0, bg0);
            },
            fg,
            bg
        );
        return ++y;
    }

    wrapText(
        x: number,
        y: number,
        width: number,
        text: string,
        fg: Color.Color | number | string = 0xfff,
        bg: Color.Color | number | string = -1,
        indent = 0
    ) {
        if (typeof fg !== 'number') fg = Color.from(fg);
        if (typeof bg !== 'number') bg = Color.from(bg);

        width = Math.min(width, this.width - x);
        text = Text.wordWrap(text, width, indent);

        let xi = x;
        Text.eachChar(
            text,
            (ch, fg0, bg0) => {
                if (ch == '\n') {
                    while (xi < x + width) {
                        this.draw(xi++, y, 0, 0x000, bg0);
                    }
                    ++y;
                    xi = x + indent;
                    return;
                }
                this.draw(xi++, y, ch, fg0, bg0);
            },
            fg,
            bg
        );

        while (xi < x + width) {
            this.draw(xi++, y, 0, 0x000, bg);
        }

        return ++y;
    }

    fillRect(
        x: number,
        y: number,
        w: number,
        h: number,
        ch: string | number | null = -1,
        fg: Color.ColorBase | null = -1,
        bg: Color.ColorBase | null = -1
    ) {
        if (ch === null) ch = -1;
        if (typeof ch !== 'number') ch = this.toGlyph(ch);
        if (typeof fg !== 'number') fg = Color.from(fg).toInt();
        if (typeof bg !== 'number') bg = Color.from(bg).toInt();

        for (let i = x; i < x + w; ++i) {
            for (let j = y; j < y + h; ++j) {
                this.draw(i, j, ch, fg, bg);
            }
        }
        return this;
    }

    blackOutRect(
        x: number,
        y: number,
        w: number,
        h: number,
        bg: Color.ColorBase = 0
    ) {
        if (typeof bg !== 'number') bg = Color.from(bg);
        return this.fillRect(x, y, w, h, 0, 0, bg);
    }

    highlight(x: number, y: number, color: Color.ColorBase, strength: number) {
        if (typeof color !== 'number') {
            color = Color.from(color);
        }
        const mixer = this.get(x, y);
        mixer.fg.add(color, strength);
        mixer.bg.add(color, strength);
        return this;
    }

    mix(color: Color.ColorBase, percent: number) {
        if (typeof color !== 'number') color = Color.from(color);
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                const mixer = this.get(x, y);
                mixer.fg.mix(color, percent);
                mixer.bg.mix(color, percent);
            }
        }
        return this;
    }

    dump() {
        const data = [];
        let header = '    ';
        for (let x = 0; x < this.width; ++x) {
            if (x % 10 == 0) header += ' ';
            header += x % 10;
        }
        data.push(header);
        data.push('');

        for (let y = 0; y < this.height; ++y) {
            let line = `${('' + y).padStart(2)}] `;
            for (let x = 0; x < this.width; ++x) {
                if (x % 10 == 0) line += ' ';
                const mixer = this.get(x, y);
                let glyph = mixer.ch;
                if (typeof glyph === 'number') {
                    glyph = String.fromCharCode(glyph || 32);
                }
                line += glyph[0];
            }
            data.push(line);
        }
        console.log(data.join('\n'));
    }
}

export class DancingBuffer extends DancingData {
    private _target: BufferTarget;

    constructor(canvas: BufferTarget) {
        super(canvas.width, canvas.height);
        this._target = canvas;
        this.load();
    }

    // get canvas() { return this._target; }

    toGlyph(ch: string | number) {
        return this._target.toGlyph(ch);
    }

    render() {
        this._data.forEach((m, i) => {
            const x = i % this.width;
            const y = Math.floor(i / this.width);
            if (typeof m.ch === 'string') {
                m.ch = this.toGlyph(m.ch);
            }
            this._target.draw(x, y, m.ch, m.fg.toInt(), m.bg.toInt());
        });
        return this;
    }

    load() {
        const data = new Uint32Array(this.width * this.height);
        this._target.copyTo(data);
        data.forEach((style, index) => {
            const mixer = this._data[index] || 0;
            const ch = style >> 24;
            const bg = (style >> 12) & 0xfff;
            const fg = style & 0xfff;
            mixer.draw(ch, bg, fg);
        });
        return this;
    }
}
