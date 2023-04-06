# Markdown & Quarto Word Count

VS Code extension that counts the number of words in a Markdown or Quarto document.

The extension performs various text filtering to exclude certain elements such as code chunks, inline R code, HTML comments, and LaTeX figures and tables.

The extension counts the remaining words and displays the count as an information message. It also automatically counts the number of words in any selected text.

This extension was inspired by the `wordcountaddin` repository (https://github.com/benmarwick/wordcountaddin.git), an RStudio add-in for word counting. The regex used in this extension was developed based on the regex used in `wordcountaddin`. I'd like to thank the authors of that repository for their contributions.
