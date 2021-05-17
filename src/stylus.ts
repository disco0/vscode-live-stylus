import * as stylus from 'stylus';
import { tagged } from './Logger' // './old/Logger-original'
import { CONTROL_MESSAGE, OUTPUT } from './constants'

export namespace compile
{
    export type Options       = RenderOptions & { force?: boolean };
    export type Callback      = Parameters<typeof stylus.render>[2];
    export type Error         = Parameters<Parameters<typeof stylus.render>[2]>[0]
    export type RenderOptions = Parameters<typeof stylus.render>[1];
}

export let defaultCompileOptions: compile.Options =
{

}

const log = tagged('Stylus Compiler')

/**
 * Stylus compiler wrapper that returns compiled css string on success or
 * `false` | `Error` object returned from `stylus.render` call
 */
export function compile(source: string, options: compile.Options = { }): string | false | compile.Error
{
    Object.assign(options, defaultCompileOptions);

    const force = options?.force ?? false;
    if(typeof options.force !== 'boolean')
        delete options.force;

    let compiled: string | false | compile.Error | undefined;

    stylus.render(source, options as compile.RenderOptions, ((err: Error, css?: string, js?: string) =>
    {
        if(err)
        {
            log(['Error in stylus compilation:', JSON.stringify(err, null, 4)].join('\n'))

            console.error('Error in stylus compilation:')
            console.dir(err)
        }

        /**
         * Set return var to error if error returned from compile *and* force
         * param not set to true (otherwise `css` type and length will be
         * validated)
         */
        if(err && !force)
        {
            compiled = err;
        }
        /**
         * Check returned css source returned and not zero length
         */
        if(css && css.length > 0)
            compiled = css;
        /**
         * Set return variable to error for case `force` is `true` and css
         * zero length
         */
        else
        {
            log('No compiled css.')
            console.warn('No compiled css.')

            if(err)
                compiled = err;
        }
    }) as compile.Callback)

    return compiled ?? false;
}