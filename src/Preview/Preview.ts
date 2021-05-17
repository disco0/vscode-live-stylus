//#region Imports

import * as path from 'path';
import type * as NodeTimer from 'timers'

import vscode, {
    Position,
    Range,
    window,
    workspace,
    // StatusBarAlignment
} from 'vscode';
import Stylus = require('stylus-stylus')
import { MaybePromise } from 'tsdef'

import { log } from '../Logger'
import is from '../guard'
import { compile } from '../stylus'

//#endregion Imports

//#region Declaration

export const enum PREVIEW_MODES
{
    'editor'  = 'editor',
    'webview' = 'webview'
};

export type PREVIEW_MODE = keyof typeof PREVIEW_MODES

export type PreviewModeMap = typeof PREVIEW_MODES;

export interface ExtensionConfiguration
{
    mode: PreviewMode
}

/**
 * Generic allows for typechecking based on target environment's `setTimeout` implementation
 */
type Timer = ReturnType<typeof setTimeout>

// For extensions by subclasses
export interface PreviewConfiguration
{
    /**
     * Beginning line
     */
    lineNumber: number;
}

//#endregion Declaration

//#region Defaults

const defaultPreviewConfiguration: PreviewConfiguration =
{
    lineNumber: 0
}

//#endregion Defaults

export abstract class Preview
{
    abstract init(): void

    /**
     * Main function for subclass to generate and display preview.
     */
    abstract preview(options: PreviewConfiguration): MaybePromise<void>

    abstract previewMode:          PreviewMode;
    abstract previewConfiguration: PreviewConfiguration;

    sourceDoc:     vscode.TextDocument;
    text:          string;
    newText:       string;
    context:       vscode.ExtensionContext;

    // // TODO: Implement debouncing for compilation
    // #_debouncePeriod: number = 700
    // get debouncePeriod(){ /* ... */ }
    // set debouncePeriod(newPeriod: number){ if(isNaturalNumber){ this.#_debouncePeriod = newPeriod; } }

    previewColumn: number = Preview.defaults.previewColumn;

    constructor(
        context: vscode.ExtensionContext,
        editor: Maybe<vscode.TextEditor> = vscode.window.activeTextEditor
    ) {
        // 活动窗口
        if(!editor)
        {
            log.warn('No active text editor found, cancelling preview creation');
            throw new Error('No active text editor found, cancelling preview creation');
        }

        // 当前窗口document
        this.sourceDoc = editor.document;
        this.text = '';
        this.newText = '';
        this.context = context;

        // Moved to post-super call in subclasses
        // this.init();
    }

    updateTimer =
    {
        current: undefined as Maybe<Timer>
    }

    bindEvn(): void
    {
        let timer = this.updateTimer.current ?? undefined;
        workspace.onDidChangeTextDocument(({ contentChanges, document }) =>
        {
            if(is.Number(timer))
                clearTimeout(timer); // clearTimeout(timer);
            if (window.visibleTextEditors.length < 1)
                return;

            this.updateTimer.current = setTimeout(async () =>
            {
                if (contentChanges.length > 0)
                    this.previewConfiguration.lineNumber = contentChanges[0].range.start.line;

                if (document === this.sourceDoc)
                    await this.preview(this.previewConfiguration);
            }, 100);
        });
    }

    transpileSource(): string | undefined
    {
        const result = compile(this.text)
        // On success
        if(is.String(result))
        {
            return result
        }

        // On failure
        if(result instanceof Error)
            log.warn(`[DocPreview#transpileSource] Compilation failed:\n${result}`)
        else
            log.warn(`[DocPreview#transpileSource] Compilation failed, no error returned.`)

        return undefined
    }

    static get config(): ExtensionConfiguration
    {
        const configuration =
            Object.fromEntries(Object.entries(
                vscode.workspace.getConfiguration('live-stylus'))
                      .filter(([k, v]) => !['has', 'get', 'update', 'inspect'].includes(k)
            ))

        log.info(`Read workspace extension configuration:\n${configuration}`)

        return configuration as ExtensionConfiguration;
    }

    static defaults = Object.freeze(
    {
        previewColumn:        2 as const,
        previewConfiguration: defaultPreviewConfiguration
    } as const)
}

export default Preview;