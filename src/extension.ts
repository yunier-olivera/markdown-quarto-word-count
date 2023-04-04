import * as vscode from 'vscode';

// Prepare text by removing unwanted characters:
function prepareText(text: string): string {
  return text
    .replace(/^---[\s\S]+?---/, '') // remove YAML front matter
    .replace(/```[\s\S]+?```/g, '') // remove code blocks
    .replace(/`[^`]+?`/g, '') // remove inline code
    .replace(/<[^>]+?>/g, '') // remove HTML tags
    .replace(/[^\w\s]|_/g, '') // remove punctuation and special characters
    .replace(/\s+/g, ' ') // remove multiple whitespaces and line breaks
    .trim();
}

let wordCountStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'markdown-quarto-word-count.countWords',
    () => {
      const editor = vscode.window.activeTextEditor;
      try {
        const selectedText = editor?.document.getText(editor.selection);
        const text = editor?.document.getText() || '';
        const preparedText = prepareText(text);
        const wordCount = (preparedText.match(/\S+/g) || []).length;

        if (selectedText) {
          const seletedWordCount = (selectedText.match(/\S+/g) || []).length;
          wordCountStatusBarItem.text = `Word count: ${seletedWordCount} of ${wordCount}`;
        } else {
          wordCountStatusBarItem.text = `Word count: ${wordCount}`;
        }

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
    const text = editor.document.getText();
    const preparedText = prepareText(text);
    const wordCount = (preparedText.match(/\S+/g) || []).length;

    wordCountStatusBarItem.text = `Word count: ${wordCount}`;
  }

  // Update the word count when the active editor changes
  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    updateWordCountStatusBarItem(activeEditor);
  }

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor && editor !== activeEditor) {
      activeEditor = editor;
      updateWordCountStatusBarItem(editor);
    }
  });

  // Update the word count when the text in the active editor changes
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
        updateWordCountStatusBarItem(vscode.window.activeTextEditor!);
        timer = undefined;
      }, 500);
    }
  });

  // Register the status bar item
  context.subscriptions.push(wordCountStatusBarItem);
}

export function deactivate() {}
