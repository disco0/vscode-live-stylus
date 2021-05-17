//#region Imports

import * as vscode from "vscode";

import Commands from './commands';
import { log, tagged } from './Logger'
import is from './guard'
// import { tagged } from './old/Logger-original'
// import { stylusWatcher, localStylusWatcher } from './stylusWatcher'
// import { COMMAND_PREFIX } from './constants'

//#endregion Imports

export function activate(context: vscode.ExtensionContext)
{
    let log = tagged('activate')
    log('Initializing extension');

    log(`Loading ${Commands.length} commands.`);
    Commands.load(context);

    // const commands: [Name: string, Callback: (...any: any) => void][] =
    // [
    //     // [ 'watchFile', stylusWatcher ],
    //     [ 'watchFileCommand', localStylusWatcher ]
    // ];

    // commands.forEach(([name, fn]) => {
    //     let commandName = `${COMMAND_PREFIX}.${name}`;
    //     log('Pushing subscription for command: ' + commandName)

    //     let disposable = vscode.commands.registerCommand(commandName, fn);

    //     context.subscriptions.push(disposable);
    // })
}

export function deactivate() {}
