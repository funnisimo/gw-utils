import * as EFFECT from './effect';
import * as TYPES from './types';
import { EffectHandler } from './handler';
import { Effect as Flags } from './flags';
import * as Msg from '../message';
import { MapType } from '../map/types';

//////////////////////////////////////////////
// MESSAGE

export class MessageEffect implements EffectHandler {
    make(src: Partial<TYPES.EffectConfig>, dest: TYPES.EffectInfo): boolean {
        if (!src.message) return true;

        if (typeof src.message !== 'string') {
            throw new Error(
                'Emit must be configured with name of event to emit'
            );
        }
        dest.message = src.message;
        return true;
    }

    async fire(
        config: any,
        map: MapType,
        x: number,
        y: number,
        ctx: TYPES.EffectCtx
    ) {
        if (!config.message) return false;

        const fired = config.flags & Flags.E_FIRED ? true : false;

        if (
            config.message &&
            config.message.length &&
            !fired &&
            map.isVisible(x, y)
        ) {
            Msg.add(config.message, ctx);
            return true;
        }
        return false;
    }
}

EFFECT.installType('message', new MessageEffect());
