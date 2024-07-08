import * as Utils from "../../../modules/utils.js";

/**
 * Read a line from ../../../data/big5/big5.csv.
 *
 * Lines starting with '#' are comments.
 *
 * First two fields of each non comment, non-empty lines,
 * are BIG5 hex code (in ASCII) and corresponding UTF8
 * hex code (in ASCII).
 *
 * TODO: tests
 * TODO: maybe we'd want to already parse the ascii hex
 *       code to something more usable.
 *
 * @param{[UTF82Big5, ParseError]} accerr - accumulator mapping unicode ascii hex code to
 *  big5 ascii hex code (literally from "0x..." string to a "0x..." string)
 * @param{string} s - current line to read
 * @param{number} n - current line number
 * @returns{[UTF82Big5, ParseError]} - accerr, altered in place
 */
function parseline(accerr, s, n) {
	var [acc, err] = accerr;
	if (err) return accerr;

	s = s.trim();

	// Skip empty lines and comments.
	if (s.startsWith('#'))    return [acc, undefined];
	if (s.trim().length == 0) return [acc, undefined];

	var i = s.indexOf("\t");
	var j = s.indexOf("\t", i+1);

	if (i == -1 || j == -1)
		return [{}, [n, "Invalid big5 entry, not enough tabs: "+s]];

	var b = s.slice(0,   i);
	var u = s.slice(i+1, j);

	acc[u] = b;

	return [acc, undefined];
}

/**
 * Read an UTF8 to BIG5 conversion table.
 *
 * @type{Parser<UTF82Big5>}
 */
function parse(csv, acc) {
	return Utils.splitlines(csv || "").reduce(parseline, [acc || {}, undefined]);
}

export {
	parseline,
	parse,
};
