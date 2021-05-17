/**
 * Collect and export collection of extension commands with utility methods
 */
//#region Imports

import { Commands } from './Commands'

// Add new commands here
import startWatcher from './startWatcher'

//#endregion Imports

// Append new command definitons here
export const commands = new Commands([
    startWatcher
])

export default commands;