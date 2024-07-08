import * as Utils from "../../utils.js";
import { DecompType } from "../../enums.js";

/**
 * Map the characters used in wm-decomp to the previous DecompType.
 * Mostly | awk '/^	\/\/[^\/]/{printf "	''%s'' : ",$3}/^	[A-Z]/{print "DecompType." $1 "," }'|/home/mb/bin/ucol
 * from lib.d.ts's DecompType which should be automatized.
 *
 * >/bin/awk -F'	' 'length($3) > 3 && index($3, "@") == 0 && index($3, "&") == 0' | head
 *
 * @type{Object<string, DecompType>}
 */
var DecompTypeMap = {
	'⿰' : DecompType.CnLeftToRight,
	'⿱' : DecompType.CnAboveToBelow,
	'⿲' : DecompType.CnLeftToMiddleAndRight,
	'⿳' : DecompType.CnAboveToMiddleAndBelow,
	'⿴' : DecompType.CnFullSurround,
	'⿵' : DecompType.CnSurroundFromAbove,
	'⿶' : DecompType.CnSurroundFromBelow,
	'⿷' : DecompType.CnSurroundFromLeft,
	'⿸' : DecompType.CnSurroundFromUpperLeft,
	'⿹' : DecompType.CnSurroundFromUpperRight,
	'⿺' : DecompType.CnSurroundFromLowerLeft,
	'⿻' : DecompType.CnOverlaid,
	'一' : DecompType.CnWmPrimitive,
};

/**
 * Read a line from decomp.csv
 *
 * Input format describe here:
 * 	https://gitlab.chise.org/CHISE/ids/-/blob/master/README.en
 *
 * @type{LineParser<Decomp>}
 */
function parseline(accerr, s, n) {
	var [acc, err] = accerr;
	if (err) return accerr;

	// comments
	if (s.startsWith(';;')) return accerr;

	// NOTE: we can't .split('\t') because there can be some unusual
	// things in last "field".

	var i = s.indexOf("\t");
	if (i == -1) return [acc, [n, "Unexpected number of fields: <1"]];

	var j = s.indexOf("\t", i+1)
	if (j == -1)  return [acc, [n, "Unexpected number of fields: <2"]];

	var c   = s.slice(i+1, j);
	var ids = s.slice(j+1);

	// TODO
	if (c[0] == '&') return accerr;

	if ([...c].length != 1)
		return [acc, [n, "Single character decompositon only: "+c]]

	// TODO
	if (ids.indexOf('@apparent') != -1) return accerr;
	if (ids.indexOf('&')         != -1) return accerr;


	// Don't decompose a character to itself, and ensure
	// components' uniqueness.
	var cs = [...ids].filter(function(x, i, a) {
		return x != c && !(x in DecompTypeMap) && a.indexOf(x) == i
	})

	// Only add if there something to be added
	if (cs.length) {
		// First decomposition for this character
		if (!(c in acc)) acc[c] = [];

		acc[c].push({
			t  : DecompType.Unknown,
			c  : cs,
		});
	}

	return [acc, undefined];
}

/**
 * Prepare a Chise decomposition table.
 *
 * @type{Parser<Decomp>}
 *
 * A character that only decomposes to themselves are removed.
 *
 * 	Example:
 *		{
 *			丩  : [[丨]],
 *			-- 心 : [[心]], -- removed
 *
 *			您  : [[你, 心]],
 *			好 : [[女, 子]],
 *		}
 */
function parse(csv) {
	return Utils.splitlines(csv).reduce(parseline, [{}, undefined]);
}

export {
	parseline,
	parse,
};
