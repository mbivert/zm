/**
 * Code to load and convert a wikisource text export.
 *
 * The main goal is to be able to convert it to our
 * mini-markdown format, so that we can keep a clean
 * local version of the file.
 *
 * While we could always read from the wikisource format,
 * it feels quite rough and unstable enough so that we
 * prefer to keep a clean markdown file instead.
 *
 * Another option would be to use an .epub export, but
 * there's nothing to read XML by default with node,
 * and we would still have needed to parse the resulting
 * soup.
 *
 * Yet another option would be to find a better source
 * that wikisource, but ctext.org prevents export, various
 * online PDFs cannot be easily used.
 *
 * There's also https://github.com/shuowenjiezi/shuowen, which
 * seems not only to be maintained, but also to contain various
 * comments. Would also need to be properly parsed to our internal
 * format anyway.
 *
 * NOTE: we currently only support what is needed to parse the
 * Shuowen Jiezi; some specific tweaks have been added to
 * ensure data consistency. We'll likely need to update the
 * code to support other books.
 */

import * as Assert   from "../../../modules/assert.js";
import { ChunkType } from "../../../modules/enums.js";

/**
 * Parse wikisource text export to an array of (typed) chunks.
 *
 * NOTE: as mentionned above, only support traditional Chinese
 * version of the Shuowen Jiezi so far.
 *
 * XXX/TODO: this is messy, hopefully temporarily.
 *
 * @param{string} s - string containing "markdown" to be parsed.
 * @returns{[Array<Chunk>, ParseError]} - array of chunks / error
 */
function parse(s) {
	var title = "";
	/** @type{Object.<string, string>} */
	var toc   = {};

	/** @type{Array<Chunk>} */
	var cs    = [];

	var xs    = s.split("\n");
	var n     = 0; // current line in xs

	var err = "";  // error returned by helper function below
	var p   = "";  // paragraph read by readp()

	/** @type{(i ?: number) => boolean} */
	function isempty(i) {
		if (i === undefined) i = n;
		return i < xs.length && xs[i] == "";
	}

	/** @type{(i ?: number) => number} */
	function skipempty(i) {
		if (i === undefined) i = n;
		var j; for (j = i; j < xs.length && isempty(j); j++)
			;
		return j;
	}

	/* Hm? @type{(t : string, i ?: number) => boolean} */
	/**
	 * @param{string} t - error message complement
	 * @param{number} [i] - xs index
	 * @returns{boolean}
	 */
	function iseof(t, i) {
		if (i === undefined) i = n;
		if (i < xs.length) return false;
		err = "EOF reached while looking for "+t
		return true;
	}

	/**
	 * No goto in JS; use "return mkerr(...)" instead of a "goto err;" then.
	 *
	 * @param{string} [e]
	 * @param{number} [i]
	 * @return{[Array<Chunk>, ParseError]}
	 */
	function mkerr(e, i) {
		if (e === undefined) e = err;
		if (i === undefined) i = n;
		return [[], [i+1, e]];
	}

	/**
	 * Is the i-th line matching a license information?
	 *
	 * @param{number} [i]
	 * @returns{boolean}
	 */
	function islicense(i) {
		if (i === undefined) i = n;
		return i < xs.length && xs[i] == "本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。";
	}

	/**
	 * Skip all content until we reach a license line.
	 *
	 * @param{number} [i]
	 * @returns{number}
	 */
	function skiptolicense(i) {
		if (i === undefined) i = n;
		var j; for (j = i; j < xs.length && !islicense(j); j++)
			;
		return j;
	}

	/**
	 * Skip all content until we reach a empty line or license.
	 *
	 * @param{number} [i]
	 * @returns{number}
	 */
	function skiptoendp(i) {
		if (i === undefined) i = n;
		var j; for (j = i; j < xs.length && !isempty(j) && !islicense(j); j++)
			;
		return j;
	}

	/**
	 * Is the line refering to a left arrow, that is,
	 * new section indicator (e.g. 序 ◄ 說文解字).
	 *
	 * undefined means this is an arrow, but format is unexpected
	 * (title not found at arrow's right).
	 *
	 * @param{number} [i]
	 * @returns{boolean|undefined}
	 */
	function isleftarrow(i) {
		if (i === undefined) i = n;
		if (i >= xs.length) return false;
		var m = xs[i].match(/^\s*([^\s]+)\s*◄\s*([^\s]+)$/)
		if (!m) return false;

		// XXX maybe this'd better be a warning?
		if (m[2] != title) {
			err = "Title '"+title+"' missing from ◄";
			return undefined;
		}
		return true;
	}

	/**
	 * Read a right arrow, returning full section name as defined
	 * in the ToC.
	 *
	 * @param{number} [i]
	 * @returns{[string, number]|undefined}
	 */
	function readrightarrow(i) {
		if (i === undefined) i = n;
		if (i >= xs.length) return undefined;

		// Last section of the Shuo wen has an irregular syntax
		// as there are two lines (+2 empty) between the arrows.
		//
		// We thus silently ignore them here.
		var j = i; for (; j < xs.length && xs[j].indexOf("►") == -1; j++)
			;

		var s = xs.slice(i, j+1).join(" ");

		var m = s.match(/^\s*([^\s]+)\s*.*►\s*([^\s]+)?$/);
		if (!m) {
			err = "Expecting a ►: '"+s+"'";
			return undefined;
		}
		if (!(m[1] in toc)) {
			err = "Unknown section '"+m[1]+"'";
			return undefined;
		}
		return [toc[m[1]], j];
	}

	/**
	 * Skip useless lines that we may encounter.
	 *
	 * @param{number} [i]
	 * @returns{number}
	 */
	function skipnoise(i) {
		if (i === undefined) i = n;
		if (xs[i] == "姊妹计划: 数据项")
			i++;
		return i;
	}

	/**
	 * Skip useless lines that we may encounter.
	 *
	 * @param{number} [i]
	 * @returns{boolean}
	 */
	function isnoise(i) {
		if (i === undefined) i = n;
		return xs[i] == "姊妹计划: 数据项";
	}

	// first line is expected to be the title
	// Note that because "".split("\n") will always returns an array of
	// one element, we don't have to check for eof.
	if (!xs[n])  return mkerr("First line is expected to be non-empty title");
	title = xs[n];
	cs.push({ t : ChunkType.Title, v : title });

	// second non-empty line is expected to contains export date
	n = skipempty(n+1);
	if (iseof("export date")) return mkerr();

	if (!xs[n].match(/^于[0-9]+年[0-9]+月[0-9]+/))
		return mkerr("Invalid export date format (have '"+xs[n]+"')");

	// For the Shuowen Jiezi, there is a table of content at the
	// beginning of the book, wrapped between lines containing
	// "-{" and "-}".
	//
	// Each item of this ToC contains is formatted as such:
	//	<chapter/section name> (<"random" text>)
	// For the last one (pre/postface), parenthesis are missing.
	//
	// There's an empty line between each element.

	n = skipempty(n+1);
	if (iseof("ToC starting mark (-{)")) return mkerr()
	if (xs[n] != "-{") return mkerr("Invalid ToC starting mark (have '"+xs[n]+"')");

	for (n = skipempty(n+1);; n = skipempty(n+1)) {
		if (iseof("ToC content")) return mkerr();
		if (isempty(n)) return mkerr("Toc entry shouldn't be empty");

		// ToC ending mark
		if (xs[n] == "}-") break;

		// Grab
		var j = xs[n].indexOf(' ');
		if (j == -1) return mkerr("ToC entry has no space '"+xs[n]+"'");
		toc[xs[n].substring(0, j)] = xs[n]; // .substring(j+1);
	}

	// Following this ToC is a "further reading" section that is
	// useless for our purposes.
	//
	// That section is closed by special mention indicating the
	// works license as public domain:
	//	"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
	//
	// Again, this is followed by empty lines
	n = skiptolicense(n);
	if (iseof("license line")) return mkerr();
	n++;

	// We can detect section/chapter changes through
	// lines containing "A ◄ T" and "C ► D", where:
	//	- T is the book's title
	//	- A is previous section/chapter name
	//	- C is current section/chapter name
	//	- D is next section/chapter name (if any)
	//
	// For the Shuowen Jiezi, note that the first section's previous'
	// section is the last, but the last's has no next's.
	//
	// After those lines may come a special line, useless for our
	// purposes:
	//	"姊妹计划: 数据项"
	//
	// For the Shuowen Jiezi, each section is subdivided in
	// subsection. Each subsection name starts with 4 empty lines,
	// and is followed by two empty lines, assuming each paragraph
	// ends with a empty line. (otherwise s/4/5/).
	//
	// Additionaly for the Shuowen Jiezi, each subsection names is
	// a two (unicode) character 部-terminated string.

	// Each subsection contains paragraphs, terminated by an empty line.

	// Last's chapters content is terminated again by the special
	// public domain string, which is also followed by an about that
	// can be safely ignored.

	// XXX/TODO: if it were not for x/y, I would have no confidence
	// that the code terminates on all input. It's too fragile, but
	// as it's to be use to sparingly, not sure it's worth too much
	// trouble.

	for (var x = n, y = -1;; y = x, x = n) {
//		console.log(cs);
		if (x == y) {
			Assert.assert("endless")
			return [[], undefined];
		}
		if (iseof("text body")) return mkerr();

		var m = n; n = skipempty(m);

		if (islicense()) break;

		// Reading a section
		var b = isleftarrow(n);
		if (b === undefined) return mkerr();
		if (b) {
			n++;
			if (iseof("right arrow")) return mkerr();
			n = skipempty(n);
			var c = readrightarrow(n);
			if (c === undefined) return mkerr();
			cs.push({
				t : ChunkType.Section,
				v : c[0],
			});
			n = c[1]+1;
			if (!iseof("", n) && isempty(n))
				n++;
			if (!iseof("", n) && isnoise(n))
				n++;
//				n = skipnoise(skipempty(n+1));
			continue;
		}

		// Reading a paragraph
		if (n-m <= 3) {
			m = n; n = skiptoendp(m);
			cs.push({
				t : ChunkType.Paragraph,
				v : xs.slice(m, n).join("\n"),
			});
			continue;
		}

		// Reading a subsection
		cs.push({
			t : ChunkType.Subsection,
			v : xs[n],
		});
		n++;
	}

	return [cs, undefined]
}

/**
 * Perform some additional checks and simplification for
 * wikisource Shuowen.
 *
 * TODO/NOTE: this is not tested. The sheer volume of data,
 * the fragility of the original source format makes us a
 * bit relunctant to dig further. Likely, we'll be able to
 * find better structured Shuowen later on, and we'll only
 * keep this one to build a prototype.
 *
 * NOTE: we join all the paragraphs under a subsection as
 * a convenience. There's ~3K chunks already; having a chunk
 * per word would be too bothersome.
 *
 * @param{Array<Chunk>} cs
 * @returns{Array<Chunk>}
 */
function tweakshuowen(cs) {
	var insub = false;
	/** @type{Array<string>} */
	var stack = [];
	/** @type{Array<Chunk>} */
	var xs = [];

	/** @param{Array<Chunk>} acc */
	function maybeflush(acc) {
		if (stack.length) {
			acc.push({
				t : ChunkType.Paragraph,
				v : stack.join("\n"),
			});
			stack = [];
		}
	}

	xs = cs.reduce(
		/**
		 * @param{Array<Chunk>} acc
		 * @param{Chunk}        c
		 * @returns{Array<Chunk>}
		 */
		function(acc, c) {
			// Remove parenthesis after the word being defined, from each
			// paragraph of each subsection. Seal script images are inserted
			// in wikisource's HTML.
			if (c.t == ChunkType.Paragraph)
				// NOTE: those aren't ASCII "()："
				c.v = c.v.replace(/（）：/, "：");

			// Special tweak as this one is unexpectedly formatted.
			if (c.t == ChunkType.Subsection)
			if (c.v.startsWith("古者庖羲氏之王天"))
				c.t = ChunkType.Paragraph;

			// Check that each subsection is a two unicode character 部-terminated
			// string.
			if (c.t == ChunkType.Subsection)
			if (!c.v.endsWith("部"))
				Assert.assert("Unexpected Shuowen Jiezi subsection: "+c.v);

			// Concatenate all paragraphs from each subsection into a single
			// chunk; we expect this to facilitate reading.
			if (c.t == ChunkType.Subsection) {
				insub = true;
				maybeflush(acc);
			} else if (c.t != ChunkType.Paragraph) {
				maybeflush(acc);
				insub = false;
			}

			if (insub && c.t == ChunkType.Paragraph)
				stack.push(c.v);
			else
				acc.push(c);

			return acc;
		}, []);

	maybeflush(xs);

	return xs;
}

export {
	parse,

	tweakshuowen,
};
