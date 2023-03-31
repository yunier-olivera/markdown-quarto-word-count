// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// [ ] Show extension on status bar
// [ ] Add functionality to count words in selected text
// [ ] Add screenshots
// [ ] Add characters
// [ ] Add reading time
// [ ] Add speaking time
// [ ] Add readability score?
// [x] Update Change log
// [x] Publish update, use `vsce publish major|minor|patch`

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)

  // This line of code will only be executed once when your extension is activated
  // console.log(
  //   'Congratulations, your extension "markdown-quarto-word-count" is now active!'
  // );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'markdown-quarto-word-count.countWords',
    () => {
      // The code you place here will be executed every time your command is executed
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        let text = editor.document.getText();
        // Prep text by removing unwanted characters

        // remove all line breaks
        text = text.replace(/[\r\n]/g, ' ');

        // do not include yaml front matter
        const threeDashes = text.match(/---/g);
        if (
          threeDashes &&
          threeDashes.length >= 2 &&
          threeDashes[0] === '---'
        ) {
          const yamlEnd = text.indexOf('---', 3) + 3;
          text = text.substring(yamlEnd + 1);
        }

        // do not include text in code chunks
        text = text.replace(/```{.+?}[\s\S]+?```/g, '');

        // do not include text in in-line R code
        text = text.replace(/`r.+?`/g, '');

        // do not include HTML comments
        text = text.replace(/<!--[\s\S]+?-->/g, '');

        // do not include images with captions
        text = text.replace(/!\[.+?\)/g, '');

        // do not include inline markdown URLs
        text = text.replace(/\(http.+?\)/g, '');

        // do not include # for headings
        text = text.replace(/#+/g, '');

        // do not include opening HTML tags
        const htmlTags = require('./htmlTags.json').htmlTags;
        const htmlTagPattern = new RegExp(
          `<(${htmlTags.join('|')})[^>]*>`,
          'g'
        );
        text = text.replace(htmlTagPattern, '');

        // do not include closing html tags
        text = text.replace(/<\/.+?>/g, '');

        // do not include greater/less than signs
        text = text.replace(/[<>]/g, '');

        // do not include percent signs because they trip up stringi
        text = text.replace(/%/g, '');

        // do not include figures and tables inserted using plain LaTeX code
        text = text.replace(/\\begin{figure\}[\s\S]*?\\end{figure}/g, '');
        text = text.replace(/\\begin{table\}[\s\S]*?\\end{table}/g, '');

        // do not count abbreviations as multiple words, but leave
        // the period at the end in case it's the end of a sentence
        text = text.replace(/\.(?=[a-z]+)/g, '');
        if (text.length === 0) {
          throw new Error(
            'You have not selected any text. Please select some text with the mouse and try again'
          );
        }

        const wordCount = text.split(/\s+/).length;

        vscode.window.showInformationMessage(`Word count: ${wordCount}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
