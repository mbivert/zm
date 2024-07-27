var WMDecomp = (function() {

/**
 * Map the characters used in wm-decomp to the previous DecompType.
 * Mostly | awk '/^	\/\/[^\/]/{printf "	''%s'' : ",$2}/^	[A-Z]/{print "DecompType." $1 "," }'|/home/mb/bin/ucol
 * from lib.d.ts's DecompType which should be automatized.
 *
 * @type{Object<string, DecompType>}
 */
let DecompTypeMap = {
	'u' : DecompType.Unknown,
	'吅' : DecompType.CnLeftToRight,
	'吕' : DecompType.CnAboveToBelow,
	'罒' : DecompType.CnLeftToMiddleAndRight,
	'目' : DecompType.CnAboveToMiddleAndBelow,
	'回' : DecompType.CnFullSurround,
	'冂' : DecompType.CnSurroundFromAbove,
	'凵' : DecompType.CnSurroundFromBelow,
	'匚' : DecompType.CnSurroundFromLeft,
	'厂' : DecompType.CnSurroundFromUpperLeft,
	'勹' : DecompType.CnSurroundFromUpperRight,
	'匕' : DecompType.CnSurroundFromLowerLeft,
	'.' : DecompType.CnOverlaid,
	'一' : DecompType.CnWmPrimitive,
	'咒' : DecompType.CnWmAboveTwiceToBelow,
	'弼' : DecompType.CnWmLeftToMiddleToLeft,
	'品' : DecompType.CnWmThrice,
	'叕' : DecompType.CnWmQuarce,
	'冖' : DecompType.CnWmVerticalCover,
	'+' : DecompType.CnWmSuperpos,
	'*' : DecompType.CnWmWIP,
	'?' : DecompType.CnWmUnclear,
};

/**
 * Available fields in human readable format.
 * See https://commons.wikimedia.org/w/index.php?title=Commons:Chinese_characters_decomposition
 *
 * @type{Object<string, number>}
 */
var fields = {
	char    : 0,  // character being decomposed
	charns  : 1,  // number of strokes in char, unused/unreliable
	type    : 2,  // decomposition type
	part1   : 3,  // first decomposition part
	part1ns : 4,  // number of strokers in part1, unused/unreliable
	part1ko : 5,  // empty: OK; '?' to be verified
	part2   : 6,  // second decomposition part ('*' if none/repetition)
	part2ns : 7,  // number of strokers in part2, unused/unreliable
	part2ko : 8,  // empty: OK; '?' to be verified
	canjie  : 9,  // Canjie input method (unused, for sorting)
	radical : 10, // '*' if char is the radical
};

/**
 * Read a line from decomp.csv
 *
 * Input format describe here:
 * 	https://commons.wikimedia.org/wiki/User:Artsakenos/CCD-Guide
 *
 * We would also allow the decomposition table to propose multiple
 * decompositions for a single character, a feature unused by
 * Wikimedia table itself, but that our patches chain may use.
 *
 * TODO: manage patched lines; we can do it in a generic line
 * management sub, common to at least cc-cedict & wm-decomp.
 *
 * @type{LineParser<Decomp>}
 */
function parseline(accerr, s, n) {
	var [acc, err] = accerr;
	if (err) return accerr;

	var fs = s.split(/\t/);

	if (fs.length != 11)
		return [acc, [n, "Unexpected number of fields: "+fs.length]];

	var t  = fs[fields.type]

	if (!(t in DecompTypeMap))
		return [acc, [n, "Unknown decomposition type: "+t]];

	var c  = fs[fields.char];
	var p1 = fs[fields.part1];
	var p2 = fs[fields.part2];
	var ko = !!(fs[fields.part1ko] || fs[fields.part2ko]);

	// Ignore repetition/missing components
	if (p1 == '*') p1 = '';
	if (p2 == '*') p2 = '';

	var ps = [...p1+p2];

	// Don't decompose a character to itself, and ensure
	// components' uniqueness.
	//
	// Also, there are quite some entries containing a '*' or a '?',
	// or numbers, which isn't documented nor regular. Assuming typos
	// and unchecked entries.
	var cs = ps.filter(function(x, i, a) {
		if (x == '?' || x == '*' || (x > '0' && x < '9')) {
			ko = true; return false;
		}
		return x != c && a.indexOf(x) == i;
	})

	// Only add if there something to be added
	if (cs.length) {
		// First decomposition for this character
		if (!(c in acc)) acc[c] = [];

		acc[c].push({
			t  : DecompTypeMap[t],
			c  : cs,
			ok : !ko,
		});
	}

	return [acc, undefined];
}

/**
 * Prepare a Wikimedia decomposition table.
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

return {
	"parseline"     : parseline,
	"parse"         : parse,

	"DecompTypeMap" : DecompTypeMap,
};

})();