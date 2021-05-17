//#region Imports

import * as path from "path";
import * as fs from 'fs';
import { exec } from "child_process";

import * as stylus from 'stylus'

import { Uri } from 'vscode';
import * as vscode from 'vscode';

import { tagged } from './Logger' // './old/Logger-original';
import { DEBUG, OUTPUT } from './constants'
import { findCommandInPATH } from './commandResolver'

//#endregion Imports

const resolvedStylusPath = findCommandInPATH().slice(0, 1)[0];
const fallbackStylusPath = path.join(
    __dirname,
    "../node_modules/stylus/bin/stylus"
);
const stylusPath = resolvedStylusPath ?? fallbackStylusPath;

/**
 * Invoke stylus --watch on file at the path supplied in `fileUri`
 *
 * (This is the original command's function)
 *
 * @param fileUri Path to file being processed.
 */
export function localStylusWatcher(fileUri: Uri)
{
    const log = tagged('localStylusWatcher');

    log('Creating live stylus instance')
    const dir = path.dirname(fileUri.fsPath);

    const command = `node ${stylusPath} -w ${fileUri.fsPath} -o ${dir}`;
    log('Generated stylus command: ' + command);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            log("Command failed: " + error);
            return;
        }
        log(stdout.toString());
    });
};

const window = vscode.window

let updateLog = tagged('updateCompiledView');

/**
 * TODO: Translate this to a per instance editor view, not singleton
 */
let compiledDocument: vscode.TextDocument;
let compiledEditor: vscode.TextEditor;
/**
 * Attempt compilation of stylus source file, and update view
 *
 * @param sourceEditor
 *   Stylus source file editor
 */
async function updateCompiledView(sourceEditor: vscode.TextEditor)
{
    const source = sourceEditor.document.getText();

    updateLog('Trying compilation')

    stylus.render(source, async (err, css: string, js) => {
        if(err)
        {
            if(DEBUG)
                updateLog(' [!] Compilation Failed.')

            return;
        }
        if(!compiledEditor)
        {
            const docConfig = compiledDocument?.uri ?? {language: 'css', content: css};
            compiledDocument = await vscode.workspace.openTextDocument(docConfig);
            compiledEditor = vscode.window.visibleTextEditors.filter(({document: {uri}}) => uri === compiledDocument.uri).slice(0)[0]

            // Check if getting document failed
            if(!compiledEditor)
            {
                (msg => {
                    updateLog(msg);
                    console.warn(msg);
                })('Failed to get compiled output document from reverse lookup in visibleTextEditors.')
                return
            }
        }
        compiledEditor.edit(editBuilder => {
            const firstLine = compiledDocument.lineAt(0);
            const lastLine = compiledDocument.lineAt(compiledDocument.lineCount - 1);
            editBuilder.delete(new vscode.Range(firstLine.range.start, lastLine.range.end))
            editBuilder.insert(new vscode.Position(0, 0), css);
        });
        if(DEBUG) updateLog('Updated compilation view.')
    })
}
/**
 * Create a side panel with compiled css output, and update when source
 * editor changes && compilation is sucessful.
 */
export function stylusWatcher(/* fileUri?: Uri */): void
{
    const log = tagged('stylusWatcher');
    log('Creating live stylus instance')

    // Check if current file is stylus
    let editor = vscode.window.activeTextEditor!
    if(!(editor && editor.document && editor?.document.languageId.match('stylus')))
    {
        window.showErrorMessage(OUTPUT.MSG.WATCHER.CREATION.ERROR)
        return;
    }

    let timer: NodeJS.Timeout;
    vscode.workspace.onDidChangeTextDocument(function (e) {
        clearTimeout(timer);
        if (window.visibleTextEditors.length < 1)
        {
            return;
        }
        let lineStart: number = 0;
        timer = setTimeout(() => {
            if (e.contentChanges.length > 0) {
                lineStart = e.contentChanges[0].range.start.line;
            }
            if (e.document === editor.document) {
                updateCompiledView(editor)
            }
        }, 100);
    });

    vscode.workspace.onDidChangeTextDocument
    // fs.watchFile(fileUri.toString(), function(options)
    // {
    //     options.
    // })

}