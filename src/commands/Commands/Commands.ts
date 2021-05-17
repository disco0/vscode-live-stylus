//#region Imports

import { log } from '../../Logger';

//#endregion Imports

import Command = LiveStylus.Command;

export class Commands extends Array<Command>
{
    context: ExtensionContext | undefined;

    constructor(commands: Command[]) { super(...commands); }

    /**
     * Load commands and add subscriptions to extension context
     *
     * @param context
     *   Passed from `activate`
     */
    public load(context: ExtensionContext)
    {
        this.context = context;
        console.dir(this.context);
        if(!this.context)
        {
            (msg => {
                log.error(msg);
                throw new Error(msg);
            })('Missing extension context object in `Commands` instance.')
        }

        log.debug(`Iterating though ${this.length} commands.`)
        this.forEach(command => {

            log.debug(`Registering command: ${command.name}`)

            if(typeof this.context === 'undefined')
            {
                log.error('Missing extension context for command ' + command.name)
                return
            }
            /** this.context assertion in `load` */
            command.register(context)
        })
    }

    private registerCommand(command: Command): void
    {

    }
}