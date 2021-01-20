export declare type Args = Record<string, any>;
export declare type Template = (args: Args) => any;
export declare function compile(template: string): Template;
export declare function apply(template: string, args?: {}): any;
export declare function textSegment(value: string): () => string;
export declare function baseValue(name: string): (args: Args) => any;
export declare function fieldValue(name: string, source: Template): (args: Args) => any;
export declare function helperValue(name: string, source: Template): (args: Args) => any;
export declare function stringFormat(format: string, source: Template): (args: Args) => string;
export declare function intFormat(format: string, source: Template): (args: Args) => string;
export declare function floatFormat(format: string, source: Template): (args: Args) => string;
export declare function makeVariable(pattern: string): (args: Record<string, any>) => any;
