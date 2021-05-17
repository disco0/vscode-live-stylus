//#region Imports

import { workspace } from 'vscode'
import { window } from 'vscode'

import { bind, debounce } from 'helpful-decorators'

type SettingsSchema = typeof import("../package.json")['contributes']['configuration'];

//#endregion Imports

//#region Decorators

const settingsCooldown = 400;
const debounceSubsequent: (ms?: number) => MethodDecorator
    = (ms: number = settingsCooldown) => debounce(ms, {trailing: true})

const debounceAndBind: (ms?: number) => MethodDecorator
    = (ms: number = settingsCooldown) => debounce(ms, {trailing: true})


//#endregion Decorators

const userConfig = workspace.getConfiguration('live-stylus');

export class Settings
{
    // @debounceSubsequent(settingsCooldown)
    static get base()
    {
        return workspace.getConfiguration('live-stylus');
    }

    // @bind
    // @debounceSubsequent(settingsCooldown)
    static getDebug()
    {
        return Settings.base.get<boolean>('debug', false);
    }

    // @bind
    static getMode()
    {
        return Settings.base.get<LiveStylus.Configuration.Mode>('debug', 'editor');
    }
}

export default Settings


//#region Configuration Schema

namespace LiveStylus
{
    export namespace Configuration
    {
        export type Mode = 'editor' | 'webview'
        export type Debug = boolean

    }
}

//#endregion Configuration Schema