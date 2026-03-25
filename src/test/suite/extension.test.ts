import * as assert from 'assert';

// Helper function to count words in prepared text (same logic as extension)
function prepareText(text: string): string {
  return (
    text
      // Remove markdown syntax, code blocks, inline code, and HTML tags
      .replace(/^---[\s\S]+?---|```[\s\S]+?```|\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|`[^`]+?`|<!--[\s\S]*?-->|<[a-zA-Z/][^\n>]*>/g, '')
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

	suite('Inline and Block Math Removal (v1.10.1)', () => {
		test('inline math is removed from word count', () => {
			assert.strictEqual(countWords('The value $x < 1$ is small'), 4);
			assert.strictEqual(countWords('hello $\\alpha + \\beta$ world'), 2);
		});

		test('block math is removed from word count', () => {
			assert.strictEqual(countWords('before\n$$\nx = y + z\n$$\nafter'), 2);
		});

		test('multiple inline math expressions on one line are all removed', () => {
			assert.strictEqual(countWords('$a$ plus $b$ equals $c$'), 2);
		});
	});

	suite('HTML Comments Removal (v1.9.3)', () => {
		test('HTML comments should be removed from text', () => {
			assert.strictEqual(countWords('Hello <!-- comment --> world'), 2);
			assert.strictEqual(countWords('<!-- This is a comment -->Text here'), 2);
		});
	});

	suite('Bare < character does not consume subsequent words (v1.10.1)', () => {
		// Each text has 4 lines: "hello world foo bar" (4), "hello world $x < 1$ foo bar"
		// ($x < 1$ fully stripped as inline math = 4), "hello world <!-- comment --> foo bar"
		// (comment removed = 4), "hello world < foo bar" (< stripped = 4). Total = 16.
		test('bare < on last line does not drop any words', () => {
			const text = 'hello world foo bar\n\nhello world $x < 1$ foo bar\n\nhello world <!-- comment --> foo bar\n\nhello world < foo bar';
			assert.strictEqual(countWords(text), 16);
		});

		test('bare < on third line does not drop the fourth line', () => {
			const text = 'hello world foo bar\n\nhello world $x < 1$ foo bar\n\nhello world < foo bar\n\nhello world <!-- comment --> foo bar';
			assert.strictEqual(countWords(text), 16);
		});

		test('bare < on second line does not drop third and fourth lines', () => {
			const text = 'hello world foo bar\n\nhello world < foo bar\n\nhello world $x < 1$ foo bar\n\nhello world <!-- comment --> foo bar';
			assert.strictEqual(countWords(text), 16);
		});

		test('bare < on first line does not drop everything after it', () => {
			const text = 'hello world < foo bar\n\nhello world foo bar\n\nhello world $x < 1$ foo bar\n\nhello world <!-- comment --> foo bar';
			assert.strictEqual(countWords(text), 16);
		});

		// < stripped as non-word char, <!-- comment --> fully removed → 8 words remain
		test('bare < and <!-- comment --> on same line do not consume words between them', () => {
			assert.strictEqual(countWords('hello world < foo bar hello world <!-- comment --> foo bar'), 8);
		});

		test('multiline HTML comment is fully removed without affecting surrounding words', () => {
			assert.strictEqual(countWords('before\n<!--\nmulti\nline\n-->\nafter'), 2);
		});

		// < is stripped as a non-word character, leaving 2 words
		test('bare < with no closing > anywhere is treated as a literal character', () => {
			assert.strictEqual(countWords('a < b'), 2);
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
