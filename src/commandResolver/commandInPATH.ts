//#region Imports

import { delimiter, join } from 'path';
import { existsSync } from 'fs';
import { env } from 'process';

import { STYLUS_COMMAND_BASENAME } from '../constants';

//#endregion Imports

// Skipping vscode imports so this can be tested w/o vs

var envPath = (env.PATH ?? '');
var envExt  = (env.PATHEXT ?? '');
var bin     = STYLUS_COMMAND_BASENAME

const mapExt = (chunk: string, bin: string, ext: string) =>
    join(chunk, bin + ext);

const mapChunk = (chunk: string, bin: string, ext: string) =>
    envExt
        .split(delimiter)
        .map(ext => mapExt(chunk, bin, ext));

export const findCommandInPATH =
    (commandName = bin) =>
        envPath.replace(/["]+/g, '')
            .split(delimiter)
            .map((chunk) => envExt.split(delimiter)
                                .map(ext => mapExt(chunk, bin, ext)))
            .reduce((a, b) => a.concat(b))
            .filter(candidate => existsSync(candidate))

