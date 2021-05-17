// import * as vscode from "vscode";
// import { stylusWatcher, localStylusWatcher } from './stylusWatcher'
// import { stylusChannel, tagged } from './Logger'
// import { COMMAND_PREFIX } from './constants'

// export function activate(context: vscode.ExtensionContext)
// {
//     let log = tagged('[activate]')
//     log('Initializing extension');

//     const commands: [Name: string, Callback: (...any: any) => void][] =
//     [
//         // [ 'watchFile', stylusWatcher ],
//         [ 'watchFileCommand', localStylusWatcher ]
//     ];

//     commands.forEach(([name, fn]) => {
//         let commandName = `${COMMAND_PREFIX}.${name}`;
//         log('Pushing subscription for command: ' + commandName)

//         let disposable = vscode.commands.registerCommand(commandName, fn);

//         context.subscriptions.push(disposable);
//     })
// }

// export function deactivate() {}
