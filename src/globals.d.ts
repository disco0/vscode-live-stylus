//#region Imports

type ExtensionContext = import('vscode').ExtensionContext;

type PreviewMode = import('./Preview/Preview').PREVIEW_MODE
type Previews    = import('./Preview/Preview').Preview[]

//#endregion Imports

declare namespace LiveStylus
{
    export interface Subscription
    {
        register: (context: ExtensionContext) => void;
    }
    export interface Command extends Subscription
    {
        name: string;
        command: (...any: any[]) => void;
    }
}

type MaybeArray<T> = T | T[]
type Maybe<T> = T | undefined;

type AnyFunction<Args extends any[] = any[], Return extends any = any> =
    (...args: Args) => Return;

type WithDefined<T> =
{
    [P in keyof T]-?: T[P];
};