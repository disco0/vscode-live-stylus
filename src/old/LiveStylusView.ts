//#region Imports
import { 
    window, 
    workspace, 
    Disposable, 
    TextDocument, 
    TextDocumentContentChangeEvent, 
    TextEditor,
    Event,
    EventEmitter,
    Position
} from 'vscode'
import *  as vscode from 'vscode';

import { compile } from './stylus';

import {
    TextEditorComparer,
    TextDocumentComparer,
    UriComparer
} from './comparers'

import { stylusChannel as log, tagged } from './Logger';
import { 
    PROVIDER_SCHEMA,
    DEBUG, 
    STYLUS_LANGUAGE_ID, 
    CONTROL_MESSAGE 
} from './constants'

//#endregion Imports

//#region Comparers

const compare = 
{
    editor: TextEditorComparer.equals.bind(TextEditorComparer),
    doc:    TextDocumentComparer.equals.bind(TextDocumentComparer),
    uri:    UriComparer.equals.bind(UriComparer)
}

//#region Comparers


/**
 * Live view that will update on any active stylus language file changed
 * if specific editor not set (not implemented yet either)
 */
const instanceTag = tagged("LiveStylusView");
/**
 * Stylus source compilation view rendered on a `TextDocument`
 */
class LiveStylusView 
{
    outputEditor: TextEditor;
    sourceEditor: TextEditor;

    constructor(sourceEditor: TextEditor, outputView: TextEditor)
    {
        this.outputEditor = outputView;
        this.sourceEditor = sourceEditor;

        this.updateView()
    }

    updateOutputView(newText: string): void 
    {
        // 行数
        let lineCount: number          = this.outputEditor.document.lineCount || 0;
        let start:     vscode.Position = new Position(0, 0);
        let end:       vscode.Position = new Position(lineCount + 1, 0);
        let range:     vscode.Range    = new vscode.Range(start, end);

        void this.outputEditor.edit(
            (editBuilder) => editBuilder.replace(range, newText));
    }

    /**
     * Attempt compililation of source from `sourceEditor`, and update 
     * `outputEditor` if successful.
     */
    public updateView(sourceEditor: TextEditor = this.sourceEditor): boolean | CONTROL_MESSAGE
    {
        if (!sourceEditor || sourceEditor.document.languageId !== STYLUS_LANGUAGE_ID) 
            return CONTROL_MESSAGE.EDITOR_CLOSED

        const stylusSource = sourceEditor.document.getText();
        if(stylusSource.length < 1)
        {
            instanceTag('Empty string read from `sourceEditor.document.getText()`, exiting early.')
            return CONTROL_MESSAGE.EDITOR_NO_CONTENT
        }

        const result = compile(stylusSource);

        /**
         * Update view on valid compilation
         */
        if(typeof result === 'string')
        {
            this.updateOutputView(result);
            return true;
        }
        else
        {
            //@TODO(disk0): Handle error cases
            return CONTROL_MESSAGE.COMPILE_ERROR;
        }
    }
}

//#region LiveStylusViewController 

const ctrlLog = tagged('LiveStylusViewController')
class LiveStylusViewController 
{
    sourceEditor?: TextEditor;
    // view:          LiveStylusView;

    constructor() 
    {
        // create a combined disposable from both event subscriptions
        this.subscribeToActiveTextEditor()
        if(!this.#disposable)
        {
            ctrlLog('Subscription to active TextEditor changes not defined after calling subscription method.')
        }
    }

    //#region Events

    //#region Active Editor Change

    // Assertion required for assignment via method subscribeToActiveTextEditor
    // Replaced with validation in constructor 
    #disposable!:   Disposable; 

    /**
     * Destructor for subscriptions created in `subscribeToActiveTextEditor()`
     */
    dispose() 
    {
        this.#disposable.dispose();
    }

    /**
     * Create subscriptions and return array of Disposable for class property
     */
    subscribeToActiveTextEditor(): Disposable
    {
        const subscriptions: Disposable[] = [];

        window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this, subscriptions);
        workspace.onDidChangeTextDocument(this.onDidChangeTextDocument, this, subscriptions);


        //// Consider adding
        // workspace.onDidChangeConfiguration(this.onDidChangeConfiguration, this, subscriptions); 

        this.#disposable = Disposable.from(...subscriptions);
        return this.#disposable;
    }

    /**
     * On change of active text editor
     * ≟ If no active editor
     *   - Return
     * ≟ If active editor is instance's source editor?
     *   ==
     *     ≟ Existing changeTextDocument subscriptions?
     *       == 
     *       != Create changeTextDocument subscription, if not already done
     *   != 
     *     ≟ Existing changeTextDocument subscriptions?
     *       == Dispose of changeTextDocument subscription
     *       != Create doc change subscriptions, if not already done
     */
    private onDidChangeActiveTextEditor(eventEditor: TextEditor | undefined) 
    {
        // Nothing to update from
        if(!eventEditor) return;

        // Get the current text editor 
        // Original condition
        // if(this.sourceEditor && this.sourceEditor.document.languageId !== STYLUS_LANGUAGE_ID)
        if(compare.editor(eventEditor, this.sourceEditor, {useId: true}))
        {
            ctrlLog('Defined sourceEditor exists and is not stylus source file. Calling dispose for LiveStylusViewController instance.')
            this.dispose();
            return
        }

        this
    }
    
    //#endregion Active Editor Change
    
    //#region Document Changes

    /**
     * Reference from https://github.com/sunmorgus/vscode-json-editor/blob/master/src/JsonEditorPanel.ts
     * ```ts
     * export class JsonEditorPanel 
     * {
     *  // ...
     *   private onActiveEditorChanged(): void {
     *       if (vscode.window.activeTextEditor) {
     *           this._currentEditor = vscode.window.activeTextEditor;
     *           const json: string = this.getJson();
     *           this._panel.webview.postMessage({ json: json });
     *       }
     *   }
     * 
     *   private onDocumentChanged(): void {
     *       const json: string = this.getJson();
     *       this._panel.webview.postMessage({ json: json });
     *   }
     *  // ...
     * }
     * ```
     */

    #changesDisposable?: Disposable[];

    /**
     * On changes in active text editor content
     */
    private onDidChangeTextDocument(changeEvent: vscode.TextDocumentChangeEvent)
    {
        changeEvent.document
    }

    //#endregion Document Changes

    //#endregion Events

    //#region Static
    


    //#endregion Static
}

//#endregion LiveStylusViewController 