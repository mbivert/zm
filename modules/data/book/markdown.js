/*
 * Mini-markdown-like parsing. This is to provide an uniform
 * book format.
 *
 * We may allow different book formats in the future too,
 * but this should be enough for most classics.
 */

import * as Assert   from '../../../modules/assert.js'
import * as Cut      from '../../../modules/cut.js'
import { ChunkType } from '../../../modules/enums.js'


/**
 * Convert markdown to an array of (typed) chunks.
 *
 * @type{Parser<Book>}
 */
function parse(s) {
	/**
	 * Return value
	 * @type{Array.<Chunk>}
	 */
	var r = [];

	/* Current paragraph */
	var p = "";

	/*
	 * Flush p as a paragraph to r if p isn't
	 * empty.
	 *
	 * Input:
	 * Output:
	 *	As a side effect, p is always trimmed.
	 */
	function maybeflushp() {
		if (p.trim()) r.push({
			t : ChunkType.Paragraph,
			v : p.trim(),
		});
		p = "";
	}

	/* Parse line-per-line */
	var xs = s.split("\n");

	for (var i = 0; i < xs.length; i++) {
		/* Empty line: paragraph's end, if any */
		if (xs[i].trim() == "") maybeflushp();

		/* Heading */
		else if (xs[i].startsWith("#")) {
			/* paragraph's end, if any */
			maybeflushp();

			/* count number of '#' */
			var j, x; for (j = 0, x = [...xs[i]]; j < x.length && x[j] == "#"; j++);
			r.push({
				t : j, /* cf. 'enums.js:/^var ChunkType =' */
				v : x.slice(j).join("").trim(),

			});
		}

		/* A paragraph's line */
		else p += xs[i] + "\n";
	}

	maybeflushp();

	return [r, undefined];
}

/**
 * Retrieve a tree-based ToC from a parsed book.
 *
 * NOTE: we depend on enum's order.
 *
 * NOTE: this is one cute little function to iteratively
 * convert a linear data structure into a tree.
 *
 * @param{Array<Chunk>} cs - chunks to inspect.
 * @returns{ToC}
 */
function gettoc(cs) {
	/** @type{ToC} */
	var ps = []; // stack

	return cs.reduce(
		/**
		 * @param{ToC} acc
		 * @param{Chunk} c
		 * @param{number} ic
		 * @returns{ToC}
		 */
		function(acc, c, ic) {
			// ignore
			if (c.t < ChunkType.Title) return acc;

			while (ps.length && c.t <= ps[ps.length-1].t)
				ps.pop();

			/** @type{ToCEntry} */
			var p = { t : c.t, v : c.v, ic : ic, cs : [] };

			if (ps.length) { ps[ps.length-1].cs.push(p); ps.push(p);  }
			else           { ps.push(p);                 acc.push(p); }

			return acc;
		}, []);
}

/**
 * Dump an array of chunks to a markdown string.
 *
 * TODO: move this to data/book/
 *
 * id = parse ° dump = dump ° parse
 *
 * @param{Array<Chunk>} cs - array of chunks
 * @returns{string}
 */
function dump(cs) {
	return cs.reduce(function(acc, c) {
		switch(c.t) {
		case ChunkType.Title:         return acc +"# "     +c.v+"\n";
		case ChunkType.Section:       return acc +"\n## "  +c.v+"\n";
		case ChunkType.Subsection:    return acc +"\n### " +c.v+"\n";
		case ChunkType.Subsubsection: return acc +"\n#### "+c.v+"\n";
		case ChunkType.Paragraph:     return acc +          c.v+"\n\n";
		default:
			Assert.assert("markdown dump unmanaged type "+c.t);
			return acc;
		}
	}, "");
}

export {
	parse,
	gettoc,
	dump,
};
