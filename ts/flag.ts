///////////////////////////////////
// FLAG

type FlagSource = number | string;
export type FlagBase = FlagSource | FlagSource[] | null;

export function fl(N: number) {
    return 1 << N;
}

export function toString<T>(flagObj: T, value: number): string {
    const inverse = Object.entries(flagObj).reduce(
        (out: string[], entry: [string, unknown]) => {
            const [key, value] = entry as [string, number];
            if (typeof value === 'number') {
                if (out[value]) {
                    out[value] += ' | ' + key;
                } else {
                    out[value] = key;
                }
            }
            return out;
        },
        []
    );

    const out = [];
    for (let index = 0; index < 32; ++index) {
        const fl = 1 << index;
        if (value & fl) {
            out.push(inverse[fl]);
        }
    }
    return out.join(' | ');
}

export function from<T>(obj: T, ...args: (FlagBase | undefined)[]): number {
    let result = 0;
    for (let index = 0; index < args.length; ++index) {
        let value = args[index];
        if (value === undefined) continue;
        if (typeof value == 'number') {
            result |= value;
            continue; // next
        } else if (typeof value === 'string') {
            value = value
                .split(/[,|]/)
                .map((t) => t.trim())
                .map((u) => {
                    const n = Number.parseInt(u);
                    if (n >= 0) return n;
                    return u;
                });
        }

        if (Array.isArray(value)) {
            value.forEach((v) => {
                if (typeof v == 'string') {
                    v = v.trim();
                    const parts = v.split(/[,|]/);
                    if (parts.length > 1) {
                        result = from(obj, result, parts);
                    } else if (v.startsWith('!')) {
                        // @ts-ignore
                        const f = obj[v.substring(1)];
                        result &= ~f;
                    } else {
                        const n = Number.parseInt(v);
                        if (n >= 0) {
                            result |= n;
                            return;
                        }

                        // @ts-ignore
                        const f = obj[v];
                        if (f) {
                            result |= f;
                        }
                    }
                } else if (v === 0) {
                    // to allow clearing flags when extending objects
                    result = 0;
                } else {
                    result |= v;
                }
            });
        }
    }
    return result;
}

export function make(obj: Record<string, FlagBase>): Record<string, number> {
    const out: Record<string, number> = {};

    Object.entries(obj).forEach(([key, value]) => {
        out[key] = from(out, value);
    });

    return out;
}
