import * as assert from 'assert';
import * as vscode from 'vscode';

// Helper function to count words in prepared text (same logic as extension)
function prepareText(text: string): string {
  return (
    text
      // Remove markdown syntax, code blocks, inline code, and HTML tags
      .replace(/^---[\s\S]+?---|```[\s\S]+?```|`[^`]+?`|<[^>]+?>/g, '')
      // Replace non-word characters except for hyphens, periods, and apostrophes
      // Use Unicode property escapes to support accented characters in all languages
      .replace(/[^\p{L}\p{N}\s.'\-]|_/gu, ' ')
      // Collapse multiple whitespaces into one space
      .replace(/\s+/g, ' ')
      // Trim leading and trailing spaces
      .trim()
  );
}

function countWords(text: string): number {
  const preparedText = prepareText(text);
  return (preparedText.match(/\S+/g) || []).length;
}

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	suite('Unicode and Accented Characters (New Fix)', () => {
		test('Spanish words with accents should count as single words', () => {
			assert.strictEqual(countWords('pingüino'), 1);
			assert.strictEqual(countWords('cónyugue'), 1);
			assert.strictEqual(countWords('hélice'), 1);
			assert.strictEqual(countWords('El pingüino nadó en el océano'), 6);
		});

		test('German words with umlauts should count as single words', () => {
			assert.strictEqual(countWords('Motörhead'), 1);
			assert.strictEqual(countWords('über'), 1);
			assert.strictEqual(countWords('Köln'), 1);
		});

		test('French words with accents should count as single words', () => {
			assert.strictEqual(countWords('café'), 1);
			assert.strictEqual(countWords('château'), 1);
			assert.strictEqual(countWords('naïve'), 1);
		});

		test('Mixed language text should count correctly', () => {
			assert.strictEqual(countWords('Hello café señor über'), 4);
		});
	});

	suite('Hyphenated Words (v1.9.2)', () => {
		test('Hyphenated words should count as single words', () => {
			assert.strictEqual(countWords('well-known'), 1);
			assert.strictEqual(countWords('state-of-the-art'), 1);
			assert.strictEqual(countWords('The well-known author wrote state-of-the-art code'), 6);
		});
	});

	suite('Decimal Numbers (v1.9.2)', () => {
		test('Decimal numbers should count as single words', () => {
			assert.strictEqual(countWords('3.14'), 1);
			assert.strictEqual(countWords('The value is 3.14 meters'), 5);
			assert.strictEqual(countWords('Values: 1.5 2.7 3.9'), 4);
		});
	});

	suite('Contractions and Possessives (v1.9.2)', () => {
		test('Contractions should count as single words', () => {
			assert.strictEqual(countWords("don't"), 1);
			assert.strictEqual(countWords("can't"), 1);
			assert.strictEqual(countWords("it's"), 1);
			assert.strictEqual(countWords("I don't think it's working"), 5);
		});

		test('Possessives should count as single words', () => {
			assert.strictEqual(countWords("John's"), 1);
			assert.strictEqual(countWords("the cat's toy"), 3);
		});
	});

	suite('HTML Comments Removal (v1.9.3)', () => {
		test('HTML comments should be removed from text', () => {
			assert.strictEqual(countWords('Hello <!-- comment --> world'), 2);
			assert.strictEqual(countWords('<!-- This is a comment -->Text here'), 2);
		});
	});

	suite('Code Blocks and Inline Code Removal', () => {
		test('Code blocks should be removed', () => {
			assert.strictEqual(countWords('```\nconst x = 1;\n```'), 0);
			assert.strictEqual(countWords('Text before\n```\ncode here\n```\nText after'), 4);
		});

		test('Inline code should be removed', () => {
			assert.strictEqual(countWords('Use `console.log()` for debugging'), 3);
			assert.strictEqual(countWords('The `var` keyword is old'), 4);
		});
	});

	suite('HTML Tags Removal', () => {
		test('HTML tags should be removed', () => {
			assert.strictEqual(countWords('<p>Hello world</p>'), 2);
			assert.strictEqual(countWords('Text with <strong>bold</strong> word'), 4);
			assert.strictEqual(countWords('<div class="test">Content</div>'), 1);
		});
	});

	suite('YAML Frontmatter Removal', () => {
		test('YAML frontmatter should be removed', () => {
			const textWithYaml = `---
title: My Document
author: John
---
Content here`;
			assert.strictEqual(countWords(textWithYaml), 2);
		});

		test('Multiple YAML blocks should be handled', () => {
			const text = '---\nkey: value\n---\nText content';
			assert.strictEqual(countWords(text), 2);
		});
	});

	suite('Combined Features', () => {
		test('Complex markdown with all features', () => {
			const complexText = `---
title: Test
---
# Hello World

This is a **well-known** café with Motörhead music.
The price is 3.14 euros.

\`\`\`javascript
const x = 1;
\`\`\`

Don't use \`var\` keyword.
<!-- This is a comment -->
<strong>Bold text</strong> here.`;

			// Should count: Hello World (2) + This is a well-known café with Motörhead music (8)
			// + The price is 3.14 euros (5) + Don't use keyword (3) + Bold text here (3)
			// = 21 words
			assert.strictEqual(countWords(complexText), 21);
		});
	});

	suite('Edge Cases', () => {
		test('Empty string should return 0', () => {
			assert.strictEqual(countWords(''), 0);
		});

		test('Only whitespace should return 0', () => {
			assert.strictEqual(countWords('   \n\t  '), 0);
		});

		test('Only code block should return 0', () => {
			assert.strictEqual(countWords('```\ncode\n```'), 0);
		});

		test('Single word should return 1', () => {
			assert.strictEqual(countWords('word'), 1);
		});
	});
});
