# Change Log

All notable changes to the "markdown-quarto-word-count" extension are documented in this file.

## [1.9.2] - 2024-04-19

- Added support for hyphenated words, counting them as single words.
- Improved accuracy by treating decimal numbers as single words.
- Enhanced handling of contractions and possessives with apostrophe support.
- Fixed inconsistencies in word count between selected and non-selected text.

## [1.9.1] - 2024-02-05

- Added support for automatically enabling the extension either globally or within specific projects through VS Code settings
- Updated README.md with instructions on how to configure automatic activation of the extension

## [1.5.0] - 2023-04-06

- Logo updated
- Made significant simplifications to the codebase to improve word count accuracy and response efficiency
- Added CONTRIBUTING.md file and updated README.md to reference it to improve the contribution process and documentation

## [1.4.0] - 2023-04-04

- Added functionality to count words of seleted text

## [1.3.0] - 2023-04-01

- Minor performance optimization for response efficiency
- Improved word count accuracy by removing unwanted characters from the text
- Delayed word count updates to prevent excessive updates and improve performance
- Error handling for countWords function to prevent crashes

## [1.2.0] - 2023-03-31

- Added word count to status bar
- Automatically update word count in status bar as user edits text

## [1.1.0] - 2023-03-30

- Logo added to the extension

## [1.0.0] - 2023-03-30

- Initial release
