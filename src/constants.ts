export const PROVIDER_SCHEMA = `live-stylus`;
export const STYLUS_LANGUAGE_ID = `stylus`;
export const STYLUS_COMMAND_BASENAME = `stylus`;

// Detect extension debugging session
export let DEBUG =
    ('DEBUG_EXTENSION' in (globalThis?.process?.env ?? {}))
        ? true
        : false;

export enum CONTROL_MESSAGE
{
    'EDITOR_CLOSED'     = 'EDITOR_CLOSED',
    'EDITOR_NO_CONTENT' = 'EDITOR_NO_CONTENT',

    'COMPILE_ERROR'     = 'COMPILE_ERROR',
}

export namespace META
{
    export const EXTENSION =
    {
        NAME: 'Live Stylus'
    } as const;

    export const COMMAND_PREFIX = 'live-stylus' as const
}

export namespace COMMAND
{
    /**
     * Generates command name with extension's namespacing
     */
    export function NAME<S extends string>(commandName: S): `${typeof META.COMMAND_PREFIX}.${S}`;
    export function NAME(commandName: TemplateStringsArray, ...values: any[]): string;
    export function NAME(commandName: string | TemplateStringsArray, ...values: any[]): string
    {
        const prefix = META.COMMAND_PREFIX;

        if (typeof commandName === 'string')
            return `${prefix}.${commandName.replace(/^\./, '')}`;

        const bases = commandName as TemplateStringsArray;

        if(values.length === 0)
            return `${prefix}.${bases[0]}`

        else
            return `${prefix}.${bases[0]}` +
                bases.slice(1)
                     .flatMap((str: string, idx: number) =>
                          values[idx] ? str + values[idx].toString() : str)
                     .join('');
    }
}

export namespace OUTPUT
{
    export const CHANNEL =
    {
        NAME: META.EXTENSION.NAME
    } as const;

    export const MSG =
    {
        ERROR:
        {
            NO_CHANNEL:   "Error executing Log functionality: Property `channel` in Log instance has not been initialized.",
            PREV_CHANNEL: "Error setting logging channel: Property `channel` in Log instance already defined."
        },
        WATCHER: {
            CREATION: {
                ERROR: 'Current editor is not a stylus file.'
            }
        }
    } as const;
}