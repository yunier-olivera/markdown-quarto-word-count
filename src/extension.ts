import * as vscode from 'vscode';

function prepareText(text: string): string {
  return text
    .replace(/^---[\s\S]+?---|```[\s\S]+?```|`[^`]+?`|<[^>]+?>/g, '') // combine all regex patterns into one
    .replace(/[^\w\s]|_/g, ' ') // replace punctuation and special characters with spaces
    .replace(/\s+/g, ' ') // replace multiple whitespaces with one space
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
          wordCountStatusBarItem.text = `${seletedWordCount} of ${wordCount} words`;
        } else {
          wordCountStatusBarItem.text = `${wordCount} words`;
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

    wordCountStatusBarItem.text = `${wordCount} words`;
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

  // Update the word count in the status bar when text is selected
  vscode.window.onDidChangeTextEditorSelection((event) => {
    if (
      event.textEditor === activeEditor &&
      event.selections.length &&
      !event.selections[0].isEmpty
    ) {
      const selectedText = event.textEditor.document.getText(
        event.selections[0]
      );
      const preparedText = prepareText(event.textEditor.document.getText());
      const wordCount = (preparedText.match(/\S+/g) || []).length;
      const selectedWordCount = (selectedText.match(/\S+/g) || []).length;

      if (selectedText) {
        wordCountStatusBarItem.text = `${selectedWordCount} of ${wordCount} words`;
      } else {
        wordCountStatusBarItem.text = `${wordCount} words`;
      }

      wordCountStatusBarItem.show();
    } else {
      const text = event.textEditor.document.getText();
      const preparedText = prepareText(text);
      const wordCount = (preparedText.match(/\S+/g) || []).length;

      wordCountStatusBarItem.text = `${wordCount} words`;
      wordCountStatusBarItem.show();
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

  if (vscode.window.activeTextEditor) {
    updateWordCountStatusBarItem(vscode.window.activeTextEditor);
  } else if (vscode.window.visibleTextEditors.length) {
    updateWordCountStatusBarItem(vscode.window.visibleTextEditors[0]);
  }

  // Register the status bar item
  context.subscriptions.push(wordCountStatusBarItem);
}

export function deactivate() {}
