import * as vscode from 'vscode';

function prepareText(text: string): string {
  return text
    .replace(/^---[\s\S]+?---|```[\s\S]+?```|`[^`]+?`|<[^>]+?>/g, '') // combine all regex patterns into one
    .replace(/[^\w\s]|_/g, ' ') // replace punctuation and special characters with spaces
    .replace(/\s+/g, ' ') // replace multiple whitespaces with one space
    .trim();
}

let wordCountStatusBarItem: vscode.StatusBarItem;

function updateWordCount() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const languageId = editor.document.languageId;
  if (
    languageId !== 'markdown' &&
    languageId !== 'plaintext' &&
    languageId !== 'quarto' &&
    languageId !== 'rmarkdown'
  ) {
    wordCountStatusBarItem.hide(); // hide the status bar item if the language is not supported
    return;
  }
  const text = editor.document.getText();
  const preparedText = prepareText(text);
  const wordCount = (preparedText.match(/\S+/g) || []).length;
  const selectedText = editor.document.getText(editor.selection);
  const selectedWordCount = (selectedText.match(/\S+/g) || []).length;
  const statusText = selectedText
    ? `${selectedWordCount} of ${wordCount} words`
    : `${wordCount} words`;
  wordCountStatusBarItem.text = statusText;
  wordCountStatusBarItem.show();
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'markdown-quarto-word-count.countWords',
    updateWordCount
  );
  context.subscriptions.push(disposable);

  wordCountStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  context.subscriptions.push(wordCountStatusBarItem);

  // Update the word count in the status bar when the active editor changes
  vscode.window.onDidChangeActiveTextEditor(updateWordCount);

  // Update the word count in the status bar when text is selected
  vscode.window.onDidChangeTextEditorSelection(updateWordCount);

  // Update the word count in the status bar when the text in the active editor changes
  let timer: NodeJS.Timer | undefined;
  vscode.workspace.onDidChangeTextDocument((event) => {
    if (
      vscode.window.activeTextEditor &&
      event.document === vscode.window.activeTextEditor.document
    ) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        updateWordCount();
        timer = undefined;
      }, 500);
    }
  });

  // Initialize the word count status bar item
  updateWordCount();
}

export function deactivate() {}
