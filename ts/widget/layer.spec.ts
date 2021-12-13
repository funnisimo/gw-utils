import * as UTILS from '../../test/utils';
// import * as GWU from 'gw-utils';
import * as Tween from '../tween';

import * as Widget from '.';
import * as Layer from './layer';
import { WidgetLayer } from '.';
import { UI } from '../ui/ui';

describe('Layer', () => {
    let ui: UI;
    let layer: Layer.WidgetLayer;

    beforeEach(() => {
        ui = UTILS.mockUI(50, 30);
        layer = new WidgetLayer(ui);
    });

    afterEach(() => {
        layer.finish();
    });

    test('constructor', () => {
        expect(layer.body).toBeInstanceOf(Widget.Widget);
        expect(layer.body._parent).toBeNull();
    });

    test('drawText', () => {
        layer.clear('black').pos(2, 3).text('Hello World.');
        layer.draw();

        // layer.buffer.dump();

        expect(UTILS.getBufferText(layer.buffer, 2, 3, 20)).toEqual(
            'Hello World.'
        );
        expect(UTILS.getBufferFg(layer.buffer, 2, 3)).toEqual(0xfff); // white
        expect(UTILS.getBufferBg(layer.buffer, 2, 3)).toEqual(0x000); // black
    });

    test('hidden widgets do not draw', () => {
        layer.clear('black');
        const text = layer.pos(2, 3).text('Hello World.');
        text.hidden = true;
        layer.draw();

        expect(UTILS.getBufferText(layer.buffer, 2, 3, 20)).toEqual('');
        expect(UTILS.getBufferFg(layer.buffer, 2, 3)).toEqual(0x000); // black
        expect(UTILS.getBufferBg(layer.buffer, 2, 3)).toEqual(0x000); // black

        text.hidden = false;
        layer.draw();
        expect(UTILS.getBufferText(layer.buffer, 2, 3, 20)).toEqual(
            'Hello World.'
        );
        expect(UTILS.getBufferFg(layer.buffer, 2, 3)).toEqual(0xfff); // white
        expect(UTILS.getBufferBg(layer.buffer, 2, 3)).toEqual(0x000); // black
    });

    describe('depth drawing', () => {
        test('same depth - latest wins', () => {
            layer.clear('black');
            const A = layer.pos(2, 3).text('AAAAAAAAAA', { id: 'A' });
            const B = layer.pos(2, 3).text('BBBBBBBBBB', { id: 'B' });
            layer.draw();

            expect(A.depth).toEqual(0);
            expect(B.depth).toEqual(0);
            expect(layer._depthOrder.map((w) => w.attr('id'))).toEqual([
                'B',
                'A',
                'BODY',
            ]);

            expect(UTILS.getBufferText(layer.buffer, 2, 3, 20)).toEqual(
                'BBBBBBBBBB'
            );
        });

        test('higher depth first', () => {
            layer.clear('black');
            const A = layer.pos(2, 3).text('AAAAAAAAAA', { id: 'A', depth: 1 });
            const B = layer.pos(2, 3).text('BBBBBBBBBB', { id: 'B' });
            layer.draw();

            expect(A.depth).toEqual(1);
            expect(B.depth).toEqual(0);
            expect(layer._depthOrder.map((w) => w.attr('id'))).toEqual([
                'A',
                'B',
                'BODY',
            ]);

            expect(UTILS.getBufferText(layer.buffer, 2, 3, 20)).toEqual(
                'AAAAAAAAAA'
            );
        });

        test('higher depth last', () => {
            layer.clear('black');
            const A = layer.pos(2, 3).text('AAAAAAAAAA', { id: 'A' });
            const B = layer.pos(2, 3).text('BBBBBBBBBB', { id: 'B', depth: 1 });
            layer.draw();

            expect(A.depth).toEqual(0);
            expect(B.depth).toEqual(1);
            expect(layer._depthOrder.map((w) => w.attr('id'))).toEqual([
                'B',
                'A',
                'BODY',
            ]);

            expect(UTILS.getBufferText(layer.buffer, 2, 3, 20)).toEqual(
                'BBBBBBBBBB'
            );
        });
    });

    describe('focus', () => {
        test('set focus automatically', async () => {
            layer.clear('black');

            layer.text('A');
            const divB = layer.pos(0, 1).text('B', { tabStop: true });
            const divC = layer.pos(0, 2).text('C', { tabStop: true });

            expect(layer._focusWidget).toBeNull();
            layer.nextTabStop();
            expect(layer._focusWidget).toBe(divB);
            layer.nextTabStop();
            expect(layer._focusWidget).toBe(divC);

            // wraps
            layer.nextTabStop();
            expect(layer._focusWidget).toBe(divB);

            // prev
            layer.prevTabStop();
            expect(layer._focusWidget).toBe(divC);
            layer.prevTabStop();
            expect(layer._focusWidget).toBe(divB);
        });

        test('click to set focus', async () => {
            layer.text('DIV A');
            const divB = layer.pos(0, 1).text('DIV B', { tabStop: true });
            const divC = layer.pos(0, 2).text('DIV C', { tabStop: true });

            // initial value
            expect(layer._focusWidget).toBeNull();
            layer.nextTabStop();
            expect(layer._focusWidget).toBe(divB);

            // click C
            expect(layer.widgetAt(2, 2)).toBe(divC);
            await layer.click(UTILS.click(2, 2));
            expect(layer._focusWidget).toBe(divC);

            // click nothing
            expect(layer.widgetAt(5, 5)).toBe(layer.body);
            await layer.click(UTILS.click(5, 5));
            expect(layer._focusWidget).toBe(divC); // does not change

            // click B
            expect(layer.widgetAt(2, 1)).toBe(divB);
            await layer.click(UTILS.click(2, 1));
            expect(layer._focusWidget).toBe(divB);
        });

        test('tab + TAB - next/prev focus', async () => {
            layer.text('DIV A');
            const divB = layer.pos(0, 1).text('DIV B', { tabStop: true });
            const divC = layer.pos(0, 2).text('DIV C', { tabStop: true });
            layer.pos(0, 3).text('DIV D');
            const divE = layer.pos(0, 4).text('DIV E', { tabStop: true });

            // initial value
            expect(layer._focusWidget).toBeNull();
            layer.nextTabStop();
            expect(layer._focusWidget).toBe(divB);

            // tab
            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divC);
            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divE);
            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divB);

            // TAB - reverse
            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divE);
            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divC);
            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divB);
            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divE);
        });

        test('element eats tab and TAB to stop change', async () => {
            const keypressFn = jest.fn().mockReturnValue(true); // We handled this keypress

            layer.text('DIV A');
            const divB = layer
                .pos(0, 1)
                .text('DIV B', { tabStop: true })
                .on('keypress', keypressFn);
            const divC = layer
                .pos(0, 2)
                .text('DIV C', { tabStop: true })
                .on('keypress', keypressFn);

            // initial value
            expect(layer._focusWidget).toBeNull();
            layer.nextTabStop();
            expect(layer._focusWidget).toBe(divB);

            // tab
            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divB);
            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divB);
            keypressFn.mockReturnValue(false); // Now we let the key pass
            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divC);

            // TAB - reverse
            keypressFn.mockReturnValue(true); // we handle
            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divC);
            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divC);
            keypressFn.mockReturnValue(false);
            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divB);
            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divC);
        });

        test('focus event.  blur event.', async () => {
            const blurFn = jest.fn();
            const focusFn = jest.fn();

            layer.text('DIV A');
            const divB = layer
                .pos(0, 1)
                .text('DIV B', { tabStop: true })
                .on('blur', blurFn);
            const divC = layer
                .pos(0, 2)
                .text('DIV C', { tabStop: true })
                .on('focus', focusFn);

            // initial value
            expect(layer._focusWidget).toBeNull();
            layer.nextTabStop();
            expect(layer._focusWidget).toBe(divB);

            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divC);

            expect(blurFn).toHaveBeenCalled();
            expect(focusFn).toHaveBeenCalled();
        });

        test('blur event cancels', async () => {
            const blurFn = jest.fn().mockReturnValue(true); // We handled - stop the focus change
            const focusFn = jest.fn();

            layer.text('DIV A');
            const divB = layer
                .pos(0, 1)
                .text('DIV B', { tabStop: true })
                .on('blur', blurFn);
            layer
                .pos(0, 2)
                .text('DIV C', { tabStop: true })
                .on('focus', focusFn);

            // initial value
            expect(layer._focusWidget).toBeNull();
            layer.nextTabStop();
            expect(layer._focusWidget).toBe(divB);

            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divB);

            expect(blurFn).toHaveBeenCalled();
            expect(focusFn).not.toHaveBeenCalled();
        });

        test('focus event cancels?', async () => {
            const blurFn = jest.fn();
            const focusFn = jest.fn().mockReturnValue(true); // We handled - stop the focus change

            layer.text('DIV A');
            const divB = layer
                .pos(0, 1)
                .text('DIV B', { tabStop: true })
                .on('blur', blurFn);
            layer
                .pos(0, 2)
                .text('DIV C', { tabStop: true })
                .on('focus', focusFn);

            // initial value
            expect(layer._focusWidget).toBeNull();
            layer.nextTabStop();
            expect(layer._focusWidget).toBe(divB);

            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divB);

            expect(blurFn).toHaveBeenCalled();
            expect(focusFn).toHaveBeenCalled();
        });

        test('disabled elements skipped', async () => {
            layer.text('DIV A');
            const divB = layer.pos(0, 1).text('DIV B', { tabStop: true });
            const divC = layer
                .pos(0, 2)
                .text('DIV C', { tabStop: true, disabled: true });
            layer.pos(0, 3).text('DIV D');
            const divE = layer.pos(0, 4).text('DIV E', { tabStop: true });

            // initial value
            expect(layer._focusWidget).toBeNull();
            layer.nextTabStop();
            expect(layer._focusWidget).toBe(divB);

            // tab
            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divE); // Skips C

            // TAB - reverse
            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divB); // Skips C

            divC.prop('disabled', false);
            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divC); // Now it is there
            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divE);

            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divC); // Now it is there
            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divB);
        });

        test('hidden elements skipped', async () => {
            layer.text('DIV A');
            const divB = layer.pos(0, 1).text('DIV B', { tabStop: true });
            const divC = layer
                .pos(0, 2)
                .text('DIV C', { tabStop: true, hidden: true });
            layer.pos(0, 3).text('DIV D');
            const divE = layer.pos(0, 4).text('DIV E', { tabStop: true });

            // initial value
            expect(layer._focusWidget).toBeNull();
            layer.nextTabStop();
            expect(layer._focusWidget).toBe(divB);

            // tab
            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divE); // Skips C

            // TAB - reverse
            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divB); // Skips C

            divC.hidden = false;
            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divC); // Now it is there
            await layer.keypress(UTILS.keypress('Tab'));
            expect(layer._focusWidget).toBe(divE);

            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divC); // Now it is there
            await layer.keypress(UTILS.keypress('TAB'));
            expect(layer._focusWidget).toBe(divB);
        });
    });

    describe('animate', () => {
        // jest.setTimeout(10 * 60 * 1000);

        test('basic', async () => {
            const obj = { x: 0 };
            const tween = Tween.make(obj).to({ x: 10 }).duration(1000);
            layer.addAnimation(tween);
            const p = layer.run();

            expect(layer.io._tweens).toHaveLength(1);
            expect(tween.isRunning()).toBeTruthy();

            await UTILS.pushEvent(ui.loop, UTILS.tick(50));
            expect(tween._time).toBeGreaterThan(0);

            while (tween.isRunning()) {
                await UTILS.pushEvent(ui.loop, UTILS.tick(50));
            }

            expect(obj.x).toEqual(10);

            expect(layer.io._tweens).toHaveLength(0);

            layer.finish();
            await p;
        });

        test.skip('advanced', async () => {
            /*
                // tween, but do not directly update object
                widget.animate().from({ opacity: 0 })
                .duration(1000)
                .onUpdate( () => {
                    console.log('Updating!!');  // should still be able to do this even though we are going to catch it internally
                })
                .onFinish( () => {
                    this.widget.toggleClass('test');
                    this.widget.prop('empty', true);
                })
                .start();   // adds to layer
            */
        });
    });
});