import vscode, {
    Position,
    Range,
    workspace,
    window,
} from 'vscode'

import { log, LogMethods } from '../Logger'

import is from '../guard'

import { Preview, PREVIEW_MODES } from './Preview'
import type { PreviewConfiguration } from './Preview'

//#region Declarations

interface DocPreviewOptions extends PreviewConfiguration
{
    preprocess?: MaybeArray<(source: string) => string>
}

//#endregion Declarations

//#region Defaults

const defaultPreviewOptions: Partial<DocPreviewOptions> = Object.freeze({
    preprocess: [ ]
});

const defaults = Object.freeze({
    previewOptions: defaultPreviewOptions as DocPreviewOptions
} as const);

//#endregion Defaults

export class DocPreview extends Preview
{
    previewMode = PREVIEW_MODES.editor;

    default = defaults
    previewConfiguration: DocPreviewOptions =
    {
        ...Preview.defaults.previewConfiguration,

        ...this.default.previewOptions
    }

    previewEditorConfiguration =
    {
        content:   this.newText,
        language: 'stylus'
    } as const;

    outputDoc!: vscode.TextDocument

    outputDocInitialized(outputDoc: vscode.TextDocument): asserts outputDoc
    {
        if(!vscode.workspace.textDocuments.includes(outputDoc))
        {
            log.info("outputDoc property not defined after running <instance DocPreview>.createDoc().");
            throw new Error("outputDoc property not defined after running <instance DocPreview>.createDoc().")
        }
    }

    async getOutputDoc(documentConfig = this.previewEditorConfiguration): Promise<vscode.TextDocument>
    {
        if(this.outputDoc)
            return this.outputDoc;

        this.outputDoc = await vscode.workspace.openTextDocument(documentConfig);

        return this.outputDoc
    }

    constructor(context: vscode.ExtensionContext)
    {
        super(context);
        /**
         * @TODO: Initialize properties inside constructor to allow stricter
         *        typing of properties.
         */
        this.getOutputDoc().then(async(doc) => {
            this.outputDoc = doc;
            window.showTextDocument(this.outputDoc, {
                viewColumn:    this.previewColumn,
                preserveFocus: true,
                preview:       true
            });
            await this.init()
        });
    }

    async preview(options?: DocPreviewOptions): Promise<void>;
    async preview(lineNumber?: number): Promise<void>;
    async preview(options: number | DocPreviewOptions | undefined): Promise<void>
    {
        /**
         * Object.assign transfers readonly attribute, throwing error on later modifications of
         * `config`. Originally added const assertions to defaults to catch changes, so either
         * defaults objects need to lose the const assertions, or all uses of them should be
         * converted to spread literals (which would work fine, and is the current "solution" to
         * the larger problem causing this issue [1])
         * default members. Maybe better to catch errors for now and remove eventually at a later
         * date.
         *
         * [1] https://github.com/microsoft/TypeScript/issues/33149#issuecomment-526734132
         */
        let config = {...this.default.previewOptions} as WithDefined<DocPreviewOptions>

        //#region Collapse Overloads

        if(is.Number(options))
        {
            config.lineNumber = options;
        }
        else if(is.Object(options))
        {
            Object.assign(config, options)
        }

        log.debug(`[DocPreview::preview] Preprocess => ${
            is.Function(config.preprocess)
                ? 'Yes' :
            is.Array(config.preprocess)
                ? `Yes (${config.preprocess.length} steps)`

                : 'no'
            }`)

        if(is.Number(config.lineNumber))
            log.debug('[DocPreview::preview] Line Number: ' + config.lineNumber.toString());

        //#endregion Collapse Overloads

        // @TODO finish line number control

        this.text = this.sourceDoc.getText();

        const transform = this.transpileSource()

        if(!transform)
            return;
        else
            this.newText = transform

        let preprocesses = is.Function(config.preprocess)
            ? [config.preprocess]
            : config.preprocess

        for(const preprocess of preprocesses)
        {
            this.newText = preprocess(this.newText);
            // this.logNewText('Updated newText with preprocessor:', 'debug')
        }

        await this.previewOnDoc();
    }

    async updatePreviewEditor(textEditor: vscode.TextEditor): Promise<boolean>
    {
        let lineCount: number          = textEditor.document.lineCount || 0;
        let start:     vscode.Position = new Position(0, 0);
        let end:       vscode.Position = new Position(lineCount + 1, 0);
        let range:     vscode.Range    = new Range(start, end);
        return textEditor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(range, this.newText);
        });
    }

    // @TODO: Refactor into main preview method or smth, just get rid of having preview and previewOnDoc
    async previewOnDoc(): Promise<boolean>
    {
        const textEditor = await window.showTextDocument(this.outputDoc, {
            viewColumn:    Preview.defaults.previewColumn,
            preserveFocus: true,
            preview:       true,
        })

        if (textEditor.document === this.outputDoc)
        {
            return await this.updatePreviewEditor(textEditor);
        }

        return false
    }

    async init()
    {
        await this.preview();
        this.bindEvn();
    }

    logNewText(prefixLine: string, level: LogMethods = 'debug')
    {
        log[level]([prefixLine, this.newText].join('\n'))
    }
}