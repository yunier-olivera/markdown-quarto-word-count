import * as vscode from 'vscode';

// Prepare text by removing unwanted characters:
function prepareText(text: string): string {
  // remove YAML front matter
  text = text.replace(/^---[\s\S]+?---/, '');

  // remove code blocks
  text = text.replace(/```[\s\S]+?```/g, '');

  // remove inline code
  text = text.replace(/`[^`]+?`/g, '');

  // remove HTML tags
  text = text.replace(/<[^>]+?>/g, '');

  // remove punctuation and special characters
  text = text.replace(/[^\w\s]|_/g, '');

  // remove multiple whitespaces and line breaks
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

let wordCountStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'markdown-quarto-word-count.countWords',
    () => {
      const editor = vscode.window.activeTextEditor;
      try {
        const text = editor?.document.getText() ?? '';
        const preparedText = prepareText(text);
        const wordCount = preparedText.split(/\s+/).length;

        wordCountStatusBarItem.text = `Word count: ${wordCount}`;
        wordCountStatusBarItem.show();
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }
  );

  context.subscriptions.push(disposable);

  wordCountStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );

  // Update the word count in the status bar
  function updateWordCountStatusBarItem(editor: vscode.TextEditor) {
    const text = editor?.document.getText() ?? '';
    const preparedText = prepareText(text);
    const wordCount = preparedText.split(/\s+/).length;

    wordCountStatusBarItem.text = `Word count: ${wordCount}`;
    wordCountStatusBarItem.show();
  }

  // Update the word count when the active editor changes
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      updateWordCountStatusBarItem(editor);
    }
  });

  // Update the word count when the text in the active editor changes
  vscode.workspace.onDidChangeTextDocument((event) => {
    if (vscode.window.activeTextEditor) {
      updateWordCountStatusBarItem(vscode.window.activeTextEditor);
    }
  });

  // Register the status bar item
  context.subscriptions.push(wordCountStatusBarItem);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// [x] Show extension on status bar
// [x] The status bar should be up date with the text
// [ ] Optimize code
// [ ] Add functionality to count words in selected text
// [ ] Add screenshots
// [ ] Add character count
// [ ] Add reading time
// [ ] Add speaking time
// [ ] Add readability score?
// [x] Update Change log
// [x] Publish update, use `vsce package` then `vsce publish major|minor|patch`
