// import vscode, { window } from 'vscode';
// import { rHtml } from '../read_file';
// import { Preview, PREVIEW_MODE, PreviewConfiguration } from './Preview';

// interface WebviewPreviewConfiguration extends PreviewConfiguration
// {

// }

// export class WebviewPreview extends Preview<PREVIEW_MODE.webview>
// {
//     scriptSource: vscode.Uri;
//     themeSource: vscode.Uri;
//     panel?: vscode.WebviewPanel;

//     previewConfiguration: WebviewPreviewConfiguration
//         = Preview.defaults.previewConfiguration

//     // Moved to constructor
//     // webview 展示
//     tplStr = rHtml('../resource/template.html', {mini: true});

//     previewMode = PREVIEW_MODE.webview;

//     constructor(context: vscode.ExtensionContext)
//     {
//         super(context);

//         this.scriptSource ??= this.getScript();
//         this.themeSource ??= this.getThemes();

//         this.init();
//     }

//     preview(...options: any[])
//     {
//         // 内容
//         this.text = this.doc.getText();
//         // ts 转化 js
//         const preview = this.transpileSource();
//         if(!preview)
//             return;

//         this.newText = preview;
//         this.previewOnWebview();
//     }

//     previewOnWebview(): void
//     {
//         // webview 形式预览 ? 只支持html?
//         if(!this.panel)
//         {
//             this.panel = window.createWebviewPanel(
//                 'js.preview',
//                 'live-stylus',
//                 this.previewColumn,
//                 {
//                     enableScripts: true
//                 }
//             );
//         }
//         let code = `<code class="javascript">${ this.newText }</code>`;
//         let tplStr1: string = this.tplStr
//             .replace(/\$\{code\}/, code)
//             .replace(/\$\{themeSource\}/, `${ this.themeSource.scheme }:${ this.themeSource.path }`)
//             .replace(/\$\{scriptSource\}/, `${ this.scriptSource.scheme }:${ this.scriptSource.path }`)
//             .trim();

//         this.panel.webview.html = tplStr1;
//     }
//     init()
//     {
//         this.preview(0);
//         this.bindEvn();
//     }
// }
