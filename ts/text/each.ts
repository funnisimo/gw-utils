import * as Config from "./config";

interface Colors {
  fg: string | null;
  bg: string | null;
}

type ColorFunction = (colors: Colors) => void;
type ColorInfo = [any, any];

type EachFn = (ch: string, fg: any, bg: any, i: number, n: number) => void;

export function eachChar(text: string, fn: EachFn, fg?: any, bg?: any) {
  if (text === null || text === undefined) return;
  if (!fn) return;
  text = "" + text; // force string
  if (!text.length) return;

  const colors: ColorInfo[] = [];
  const colorFn = Config.helpers.eachColor as ColorFunction;

  if (fg === undefined) fg = Config.options.defaultFg;
  if (bg === undefined) bg = Config.options.defaultBg;

  const ctx = {
    fg,
    bg,
  };

  const CS = Config.options.colorStart;
  const CE = Config.options.colorEnd;

  colorFn(ctx);

  let n = 0;
  for (let i = 0; i < text.length; ++i) {
    const ch = text[i];
    if (ch == CS) {
      let j = i + 1;
      while (j < text.length && text[j] != CS) {
        ++j;
      }
      if (j == text.length) {
        console.warn(
          `Reached end of string while seeking end of color start section.\n- text: ${text}\n- start @: ${i}`
        );
        return; // reached end - done (error though)
      }
      if (j == i + 1) {
        // next char
        ++i; // fall through
      } else {
        colors.push([ctx.fg, ctx.bg]);
        const color = text.substring(i + 1, j);
        const newColors = color.split("|");
        ctx.fg = newColors[0] || ctx.fg;
        ctx.bg = newColors[1] || ctx.bg;
        colorFn(ctx);
        i = j;
        continue;
      }
    } else if (ch == CE) {
      if (text[i + 1] == CE) {
        ++i;
      } else {
        const c = colors.pop(); // if you pop too many times colors still revert to what you passed in
        [ctx.fg, ctx.bg] = c || [fg, bg];
        // colorFn(ctx);
        continue;
      }
    }
    fn(ch, ctx.fg, ctx.bg, n, i);
    ++n;
  }
}
