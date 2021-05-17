(() => {
const { delimiter, format, join, normalize, resolve } = require('path');
const fs      = require('fs');
const envPath = (process.env.PATH || '');
const cmdExts = 
    process?.env?.PATHEXT
        ? [...new Set([...process.env.PATHEXT?.split(delimiter).reverse() ?? [], ''].reverse())]
        : [''];

// Replacement for chalk require
const style =
{
    blueUnderline: (/** @type {string} */ text) => `\x1B[34m\x1B[4m\x1B[1m${text}\x1B[22m\x1B[24m\x1B[39m`,
    error:         (/** @type {string} */ text) => `\x1B[31m${text}\x1B[39m`,
    grey:          (/** @type {string} */ text) => `\x1B[90m${text}\x1B[39m`,
    green:         (/** @type {string} */ text) => `\x1B[32m${text}\x1B[39m`
}

const bin     = 'stylus'
/**
 * @param {string} chunk
 * @param {string} bin
 * @param {string} ext
 */
const mapExt = (chunk, bin, ext) => join(chunk, bin + ext);

/**
 * @param {string} chunk
 * @param {string} bin
 * @param {string} ext
 */
const mapChunk = (chunk, bin, ext) => cmdExts.map(ext => mapExt(chunk, bin, ext));

const possibleCommandPaths = 
    envPath.replace(/["]+/g, '')
        .split(delimiter)
        .map((chunk) => cmdExts.map(ext => mapExt(chunk, bin, ext)) )
        .reduce((a, b) => a.concat(b))
        .filter(candidate => fs.existsSync(candidate))

if(possibleCommandPaths.length > 0)
{
    console.log(style.green(`Found stylus command installations:`))
    possibleCommandPaths
        .forEach(filePath => console.log(style.grey(`  -> `) + style.blueUnderline(filePath)))
}
else
{
    console.log(style.error(`No stylus paths resolved from $PATH`))
}

return possibleCommandPaths

})()