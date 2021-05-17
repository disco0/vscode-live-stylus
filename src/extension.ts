//#region Imports

import * as vscode from "vscode";

import Commands from './commands';
import { tagged } from './Logger'

//#endregion Imports

export function activate(context: vscode.ExtensionContext)
{
    let log = tagged('activate')
    log('Initializing extension');

    log(`Loading ${Commands.length} commands.`);
    Commands.load(context);
}

export function deactivate() {}
