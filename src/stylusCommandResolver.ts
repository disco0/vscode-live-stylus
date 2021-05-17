import { delimiter, join } from 'path';
import { existsSync } from 'fs';
import { env } from 'process';

// Skipping vscode imports so this can be tested w/o vs

var envPath = (env.PATH ?? '');
var envExt  = (env.PATHEXT ?? '');
var bin     = 'stylus'

const mapExt = (chunk: string, bin: string, ext: string) =>
    join(chunk, bin + ext);

const mapChunk = (chunk: string, bin: string, ext: string) => 
    envExt.split(delimiter).map(ext => mapExt(chunk, bin, ext));

const resolvedPaths = envPath.replace(/["]+/g, '')
    .split(delimiter)
    .map((chunk) => envExt.split(delimiter)
                          .map(ext => mapExt(chunk, bin, ext)))
    .reduce((a, b) => a.concat(b))
    .filter(candidate => existsSync(candidate))

