import 'jest-extended';
import * as GW from './data';

describe('GW', () => {
    test('exports', () => {
        expect(GW.data).toBeObject();
        expect(GW.config).toBeObject();
    });
});
