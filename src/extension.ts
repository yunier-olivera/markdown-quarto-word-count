// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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
        const text = editor.document.getText();
        const wordCount = text.split(/\s+/).length;
        // const wordCount = text
        //   .split(
        //     /(?<!\\)(`{3}(.*\n)*?.*?\n`{3}|`.*?`|(\$.*?\$)|(\$\$.*?\$\$)|^---$((.*\n)*?)^---$\n?)/gm
        //   )
        //   .filter((s) => s.trim() !== '').length;
        vscode.window.showInformationMessage(`Word count: ${wordCount}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
