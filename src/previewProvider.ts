import * as vscode from 'vscode';
import { CancellationToken, ProviderResult, Uri } from 'vscode';

import { PROVIDER_SCHEMA, DEBUG, OUTPUT } from './constants';
import { log, tagged } from './Logger' // './old/Logger-original'

import { reduceTemplateString } from './templateStringResolve'

//#region Util

//#region StylusTextDocument

interface StylusEditor extends vscode.TextDocument
{
    languageId: 'stylus'
}

function isStylusEditor(obj: any): obj is StylusEditor
{
    return obj?.languageId && obj.languageId === 'stylus'
}

//#endregion StylusTextDocument

const uriLog = log.tagged('stylusUri')
/**
 * Generate stylus compilation provider uri from input string.
 */
function stylusUri(strArr: TemplateStringsArray, ...values: any[]): string
{
    if(DEBUG)
    {
        const baked = [
            PROVIDER_SCHEMA, ":",
            reduceTemplateString(strArr, values)
        ].join('')
        uriLog('\nGenerated uri:\n > ' + baked)
    }
    return [
        PROVIDER_SCHEMA, ":",
        reduceTemplateString(strArr, values)
    ].join('')
}

//#endregion Util

//#region StylusProvider

const provLog = log.tagged('StylusProvider');
/**
 * Provider for stylus source compiled css view
 */
const StylusProvider = new class implements vscode.TextDocumentContentProvider
{
    // emitter and its event
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    /**
     * @TODO(disk0): Run compilation here?
     *
     * Pass compiled css output in
     */
    provideTextDocumentContent(uri: Uri, token: CancellationToken): ProviderResult<string>
    {
        provLog('StylusProvider#provideTextDocumentContent called')
        const path = uri.path;

        return uri.path;
    }
}

/**
 * Split off from base StylusProvider class with just management/utility
 * related properties
 */
const StylusProviderManager = new class
{
    /**
     * To be called at extension initialization
     */
    initialize(subscriptions: vscode.ExtensionContext['subscriptions']): void;
    initialize({subscriptions}: {subscriptions: vscode.ExtensionContext['subscriptions']}): void;
    initialize(obj: any): void
    {
        if(!obj) throw new Error('[StylusProviderManager] Invalid object passed to init.');

        ((subscriptions: Array<{dispose(): void}>) => {
            if(!subscriptions)
                throw new Error('[StylusProviderManager] Invalid object passed to init.');
            subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(PROVIDER_SCHEMA, StylusProvider))
        })('subscriptions' in obj ? obj.subscriptions : 'push' in obj && obj)
    }
    /**
     * Instance management static properties/methods
     */
    instances: Set<vscode.TextDocument> = new Set();

    /**
     * TODO: LUT for providing updates to compilation views
     */
    //#endregion Context Management
}

const instanceTag = tagged("StylusProviderInstance");
class StylusProviderInstance
{
    static InstanceCreationOptions = {
        language: 'css',
        content:  '/* Live Stylus Compilation View (Uninitialized) */'
    }

    sourceEditor: vscode.TextDocument;
    outputEditor: vscode.TextDocument;

    private constructor(sourceEditor: vscode.TextDocument, outputEditor: vscode.TextDocument)
    {
        instanceTag('Constructor called.')
        // Create preview panel editor set language to css
        this.sourceEditor = sourceEditor;
        this.outputEditor = outputEditor;

        // Add panel to instance list set
        // @TODO(disk0): Add instances to set instead?
        instanceTag('Adding instance to instances set in StylusProviderManager.')
        StylusProviderManager.instances.add(this.outputEditor)
    }

    /**
     * Teardown instance
     */
    deactivate()
    {
        instanceTag('Deactivation initiated.')
        StylusProviderManager.instances.delete(this.sourceEditor);
    }

    /**
     * External entry point
     * @param sourceEditor
     *   Editor of which source will be read and compiled from. Defaults to
     * `vscode.window.activeTextEditor?.document` if not passed, and throws
     * error if neither valid.
     */
    static async create(sourceEditor?: vscode.TextDocument)
    {
        instanceTag('Entering stylus watcher initialization method.')
        sourceEditor ??= vscode.window.activeTextEditor?.document;
        if(!isStylusEditor(sourceEditor))
        {
            /**
             * Better to throw error and resolve in outer scope/at extension
             * command call site?
             */
            instanceTag('Failed stylus watcher initialization method, ' +
                        'throwing error '+ OUTPUT.MSG.WATCHER.CREATION.ERROR);
            vscode.window.showErrorMessage(OUTPUT.MSG.WATCHER.CREATION.ERROR);
            return
        }

        // Initialize output panel
        instanceTag('Opening output text document panel.')
        const outputEditor = await vscode.workspace.openTextDocument(StylusProviderInstance.InstanceCreationOptions)
        // vscode.window.showTextDocument()
        // vscode.workspace.openTextDocument(outputEditor, // {StylusProviderInstance.}): Thenable<TextEditor>;


        //

        new StylusProviderInstance(sourceEditor, outputEditor);
    }
}

//#endregion StylusProvider

//#region Commands

// /**
    //  * Command entry point for initializing live view from current active editor
    //  */
    // async function createLiveStylusPanel()
    // {
    //     let uri = vscode.Uri.parse(`${PROVIDER_SCHEMA}:`);
    //     let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
    //     await vscode.window.showTextDocument(doc, { preview: false });
// }

async function startActiveEditorStylusWatcher()
{
    const log = tagged('startStylusWatcher')

    // Create stylus watcher instance
    log('Creating watcher instance')

    const instance = StylusProviderInstance.create();
}
startActiveEditorStylusWatcher['command'] = 'live-stylus.startWatcher'

const commands: Array<[Name: string, Callback: (...any: any) => any]> = [ ];

//#endregion Commands

const prevProdActivateLog = tagged('previewProvider.ts |> activate')
export function activate({subscriptions}: vscode.ExtensionContext)
{
    const log = prevProdActivateLog;

    // Initialize provider
    log('Initializing StylusCompiler provider')
    StylusProviderManager.initialize({subscriptions});
    // subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(PROVIDER_SCHEMA, StylusProvider));

    // register a command that opens a cowsay-document
    log('Pushing live-stylus.createWatcher command subscription')
    subscriptions.push(vscode.commands.registerCommand(
        startActiveEditorStylusWatcher.command, startActiveEditorStylusWatcher))

    // register a command that updates the current cowsay
    log('Pushing live-stylus.updateWatcher command subscription (TODO: Remove this when live updater created.)')
    subscriptions.push(vscode.commands.registerCommand('live-stylus.updateWatcher', async () => {
        if (!vscode.window.activeTextEditor) {
            return; // no editor
        }
        let { document } = vscode.window.activeTextEditor;
        if (document.uri.scheme !== PROVIDER_SCHEMA) {
            return; // not my scheme
        }
        // get path-components, reverse it, and create a new uri
        let say = document.uri.path;
        let newSay = say.split('').reverse().join('');
        let newUri = document.uri.with({ path: newSay });
        await vscode.window.showTextDocument(newUri, { preview: false });
    }))
}