import * as GW from './index';

const Fl = GW.flag.fl;

describe('flag', () => {
    test('enum', () => {
        enum Flag {
            A = Fl(0),
            B = Fl(1),
            C = Fl(2),
            D = Fl(3),
            E = Fl(3), // same as D
            AB = A | B,
            BC = B | C,
            AD = A | D,
        }

        expect(Flag.A).toEqual(1);
        expect(Flag.B).toEqual(2);
        expect(Flag.C).toEqual(4);
        expect(Flag.D).toEqual(8);
        expect(Flag.AB).toEqual(3);
        expect(Flag.BC).toEqual(6);
        expect(Flag.AD).toEqual(9);

        expect(GW.flag.toString(Flag, 11)).toEqual('A | B | D | E');
        expect(GW.flag.from(Flag, 'A')).toEqual(Flag.A);
        expect(GW.flag.from(Flag, 'UNKNOWN')).toEqual(0);
        expect(GW.flag.from(Flag, 'A | B')).toEqual(Flag.AB);

        expect(GW.flag.from(Flag, '2 | A')).toEqual(Flag.AB);
        expect(GW.flag.from(Flag, Flag.D, '2 | A')).toEqual(
            Flag.D | Flag.A | Flag.B
        );
        expect(GW.flag.from(Flag, Flag.AB, '!A')).toEqual(Flag.B);
        expect(GW.flag.from(Flag, Flag.AB, '0, D')).toEqual(Flag.D);
        expect(GW.flag.from(Flag, undefined, '1', 2)).toEqual(3);
        expect(GW.flag.from(Flag, [1, '2'])).toEqual(3);
        expect(GW.flag.from(Flag, null, undefined)).toEqual(0);

        expect(GW.flag.from(Flag, 'C,3')).toEqual(7);
        expect(GW.flag.from(Flag, ['A|B', 4])).toEqual(7);

        expect(
            GW.flag.toString(Flag, Flag.A | Flag.B | Flag.C | Flag.D)
        ).toEqual('A | B | C | D | E');
    });

    // Is this really necessary?  Should we have make at all?
    test('make', () => {
        const source = {
            A: 1,
            B: '2',
            C: 'A | B',
            D: 'C, 4',
            E: [1, 2],
            F: ['A', 'B'],
            G: ['A | B', 4],
        };

        const flag = GW.flag.make(source);
        expect(flag).toEqual({
            A: 1,
            B: 2,
            C: 3,
            D: 7,
            E: 3,
            F: 3,
            G: 7,
        });
    });
});
