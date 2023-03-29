import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'word-counter.countWords',
    () => {
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

export function deactivate() {}
