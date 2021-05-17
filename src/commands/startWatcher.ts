//#region Imports

import * as vscode from 'vscode';

import { log } from '../Logger';
import { COMMAND, DEBUG, META } from '../constants'

import { DocPreview } from '../Preview'

//#endregion Imports

const stylusPreviewInstances: Previews = [];

//#region Meta

export const name = COMMAND.NAME(`startWatcher`)

export function register(context: vscode.ExtensionContext): void
{
    log.debug(`Registering command: ${name}`)
    context.subscriptions.push(
        vscode.commands.registerCommand(name, () => startWatcher(context))
    )
}

//#endregion Meta

//#region Command

function startWatcher(context: vscode.ExtensionContext)
{
    // Debug mode: Open output view
    if(!DEBUG) log.focus();

    const preview = new DocPreview(context)
}
export { startWatcher as command }

//#endregion Command

export default {
    name,
    command: startWatcher,
    register
}
