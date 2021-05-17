//#region Imports

import { exec } from 'child_process';
const asyncExec = promisify(exec);
import { platform as currentPlatform } from 'process'
import { promisify } from 'util';

import c from 'chalk';

//#endregion Imports

//#region Util

function atLeastOneElement<T>(obj: T[]): obj is [T, ...T[]]
{
    return obj.length > 0
}

function filterEmptyLines(lines: ('' | string)[]): string[]
{
    return lines.filter(line => line.length > 0)
}

//#endregion Util

//#region where Generator

interface WhereCommand
{
    (command: string): string
}

const WhereCommand =
{
    unix: (command: string) => `zsh -c "where ${command.replace(/(?<!\\)"/gm, '\\"')}"`,
    win32: (command: string) => `where.exe ${command.replace(/(?<!\\)"/gm, '\\"')}`
} as const;

/**
 * Returns a function that inserts a supplied string in for where argument
 */
const getPlatformWhere: (platform?: NodeJS.Platform) => WhereCommand =
    (platform: NodeJS.Platform = process.platform, wsl?: boolean) =>
        ((['win32', 'cygwin', 'linux'] as NodeJS.Platform[]).includes(platform))
            ? platform === 'linux'
                ? (wsl ?? process.env.WSLENV ? true : false)
                    ? WhereCommand.win32
                    : WhereCommand.unix
                // Implies platform === 'win32' || 'cygwin'
                : WhereCommand.win32
        // If non-linux unix
            : WhereCommand.unix

const whereCommand = getPlatformWhere();

//#endregion where Generator

//#region Command Execution

const stylusBaseName = `stylus`
const whereCommandErrorBase = 'Failed to resolve stylus command on via platform where command.'

async function whereCommandChildProcess(commandBase: string = stylusBaseName)
{
    const command = whereCommand(commandBase);
    const {
        stdout,
        stderr
    } = await asyncExec(command, {encoding: 'utf8'});

    if(stderr)
    {
        throw new Error(`${whereCommandErrorBase}\nCommand Executed: ${command}`);
    }

    const stdoutTrim = stdout.trim()

    if(stdoutTrim.length === 0)
    {
        throw new Error(
            `${whereCommandErrorBase}\nCommand Executed: ${command}\nRaw stdout: "${stdout}"\nTrimmed: "${stdoutTrim}"`);
    }

    return filterEmptyLines(stdout.split(/\r?\n\r?/))
}

export async function findWithWhere(stylusCommandBase = stylusBaseName): Promise<[string, ...string[]] | undefined>
{
    try
    {
        const result = await whereCommandChildProcess(stylusCommandBase);

        if(!atLeastOneElement(result))
            throw new Error(`Zero commands read from stdout of where command.`);

        return result
    }
    catch(error)
    {
        console.error(`${whereCommandErrorBase}\nError: ${error}`)
        return
    }
}

//#endregion Command Execution

//#region Test

// Yes this is overkill
export async function test()
{
    try
    {
        const result = await findWithWhere();
        if(result)
        {
            console.log(c.green(['Found commands: ', ...result.map(_ => ` - ${_}`)].join('\n')))

            return true
        }
        else
        {
            console.log(c.red.bold`No paths resolved.`);
            return false
        }
    }
    catch(error)
    {
        console.warn(c.ansi256(3)`Error in test scope: ${c.red.bold(error)}`);

        return false
    }
    finally
    {
        return false
    }
}

//#endregion Test

if(module.parent = module)
{
    const baseName = __filename.split(/[\\\/]/).slice(-1)[0].replace(/\.[jt]sx?$/, '');
    console.log(c.bgGreen.ansi256(250).bold`  ${baseName.length > 0 ? c.bold.ansi256(256)`[${baseName}] ` : ''}Top Level Context - Running Test Function  `);

    (async() => {
        if(await test())
            process.exit(0);
        else
            process.exit(1);
    })()
}
