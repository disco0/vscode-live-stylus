import { OutputChannel, window } from "vscode";
import { DEBUG, OUTPUT_CHANNEL_NAME, LOGGING_MODE } from '../constants'

/**
 * @description
 * Logging channel implementation based on [vscode-azureterraform](https://github.com/Azure/vscode-azureterraform/blob/master/src/terraformChannel.ts)
 */

/**
 * Public shape of logging channel exposed by module
 */
export interface IStylusChannel 
{
    appendLine(message: any, title?: string): void;
    append(message: any): void;
    show(): void;
    
    /**
     * Create a wrapped version of appendLine method with title argument
     * applied.
     * 
     * @param title 
     *   Message title
     */
    tagged(title: string): TaggedLogger;
}

/**
 * Logging object created by `tagged` function
 */
export interface TaggedLogger
{
    (message: any): void
    debugLog(message: any): void
}

class StylusChannel implements IStylusChannel 
{
    private readonly channel: OutputChannel = window.createOutputChannel(OUTPUT_CHANNEL_NAME);

    public appendLine(message: any, title?: string): void 
    {
        // YYYY-MM-DD HH:mm:ss.sss
        const simplifiedTime = (new Date()).toISOString().replace(/z|t/gi, " ").trim(); 

        this.channel.appendLine(`[${title ? title + " " : ""}${simplifiedTime}] ${message}`);
    }

    /**
     * Output log message to output channel if `DEBUG` constant is `true`.
     */
    public debugAppendLine(message: any, title?: string): void 
    {
        if(DEBUG) this.appendLine(message, title);
    }

    public append(message: any): void {
        this.channel.append(message);
    }

    public show(): void {
        this.channel.show();
    }

    /**
     * Create a wrapped version of appendLine method with title argument
     * applied.
     * 
     * @param title 
     *   Message title
     */
    tagged(this: StylusChannel, title: string): TaggedLogger
    {
        const parent = this;
        return Object.assign(
            function(message: string){ parent.appendLine(message, title) },
            {
                debugLog: (message: string) => parent.appendLine(message, title)
            }
        )
    }
}

export const stylusChannel: IStylusChannel = new StylusChannel();
export const tagged = stylusChannel.tagged.bind(stylusChannel);

//#region Old
// interface OutputChannelLogger
// {
//     appendLine: OutputChannel['appendLine']
// }
// interface ConsoleLogger
// {
//     log: Console['log']
// }

// type LoggingMode = typeof LOGGING_MODE;
// type LoggerInstance<M = LoggingMode> =
//     M extends 'console' ? ConsoleLogger :
//     M extends 'channel' ? OutputChannelLogger : ConsoleLogger;

// export class Logger
// {
//     private static outputChannelInstance:
//         LoggingMode extends 'console' ? OutputChannelLogger | undefined
//         : OutputChannelLogger;

//     private static get consoleLogger(): ConsoleLogger
//     {
//         // Should be extended when OutputChannelLogger is extended.
//         return {
//             log: console.log
//         }
//     }
//     private static get outputChannelLogger(): OutputChannelLogger
//     {

//         if(Logger.outputChannelInstance)
//             return Logger.outputChannelInstance;
        
//         const channel = window.createOutputChannel('live-stylus');
//         if(!channel)
//             throw new Error('Failed to create output channel.')

//         Logger.outputChannelInstance = {
//             appendLine(...data: any[]): void {
//                 // Special case for single argument that isn't string
//                 // Does't actually do what I wanted to what I wanted yet
//                 if(data.length === 1 && typeof data[0] !== 'string')
//                 {
//                     channel.appendLine(JSON.stringify(data[0]))
//                 }
//                 else
//                 {
//                     // Handle this better
//                     channel.appendLine(String(data))
//                 }
//             }
//         }
//         return Logger.outputChannelInstance;
//     }

//     /**
//      * Access point for files importing Logger. Returns appropirate type
//      * of logging object per configuration in `./constants.ts`
//      */
//     static get log(): LoggerInstance
//     {
//         switch(LOGGING_MODE)
//         {   
//             case 'channel':
//                 return Logger.outputChannelLogger
//             case 'console': default:
//                 return Logger.consoleLogger;
//         }
//     }
// }
//#endregion Old