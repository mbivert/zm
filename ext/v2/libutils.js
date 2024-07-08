/*
 * Standalone functions.
 */

/*
 * Dump some data to the console in JSON
 *
 * Input:
 *	x : data to dump.
 * Output:
 *	None, but x would have been dumped to console.
 */
function dump(...xs) {
	xs.forEach(function(x) {
		console.log(JSON.stringify(x, null, 4));
	});
}

/*
 * Does this unicode code point refers to a Chinese character?
 *
 * NOTE: ranges taken from:
 *  https://en.wikipedia.org/wiki/CJK_Unified_Ideographs_(Unicode_block)
 *
 * NOTE: later augmented with
 *	https://stackoverflow.com/a/1366113
 *
 * Input:
 *	c: unicode code point
 * Output:
 *	Boolean
 */
function ischinese(c) {
	if (c >= 0x4E00  && c <= 0x62FF)  return true;
	if (c >= 0x6300  && c <= 0x77FF)  return true;
	if (c >= 0x7800  && c <= 0x8CFF)  return true;
	if (c >= 0x8D00  && c <= 0x9FFF)  return true;
	if (c >= 0x3400  && c <= 0x4DBF)  return true;
	if (c >= 0xF900  && c <= 0xFAFF)  return true;
	if (c >= 0x20000 && c <= 0x2A6DF) return true;
	if (c >= 0x2A700 && c <= 0x2B73F) return true;
	if (c >= 0x2B740 && c <= 0x2B81F) return true;
	if (c >= 0x2B820 && c <= 0x2CEAF) return true;
	if (c >= 0x2F800 && c <= 0x2FA1F) return true;

	return false;
}

/* TODO s/ischinesec/ischinese/ with proper adjustments */
function ischinesec(c) {
	return ischinese(c.codePointAt(0));
}

var puncts = {
	'？'  : true,
	'?'  : true,
	'！'  : true,
	'!'  : true,
	'、' : true,
	'，'  : true,
	','  : true,
	'。' : true,
	"\n" : true,
	"="  : true,
	" "  : true,
	"\t" : true,
	"；"  : true,
	";"  : true,
	"…"  : true,
	"　" : true,
	"."  : true,
	'|'  : true,
	"-"  : true,
	"'"  : true,
	'"'  : true,
	"："  : true,
	":"  : true,
	"「" : true,
	"」" : true,
	"《" : true,
	"》" : true,
	"«"  : true,
	"»"  : true,
	"─" : true,
	"—"  : true,
	"("  : true,
	")"  : true,
	"（"  : true,
	"）"  : true,
	"&"  : true,
	"["  : true,
	"]"  : true,
};

/*
 * Test if given "byte" is punctuation.
 *
 * Input:
 *	c : string to test
 * Output:
 *	true if punctuation
 */
function ispunct(c) { return c in puncts; }

/*
 * End of sentence
 */
var eos = {
	'？'  : true,
	'?'  : true,
	'！'  : true,
	'!'  : true,
	'。' : true,
	"."  : true,
}

/*
 * Test if given "byte" marks end of sentence.
 *
 * Input:
 *	c : string to test
 * Output:
 *	true if c marks end of sentence
 */
function iseos(c) { return c in eos; }

/*
 * Does the given string contains some Chinese text?
 *
 * Input:
 *	s : string to inspect
 * Output:
 *	Boolean if at least one code point from the string
 *	represent a Chinese character
 */
function haschinese(s) {
	for (var i = 0; i < s.length; i++)
		if (ischinese(s.codePointAt(i))) return true;

	return false;
}

/*
 * Assuming a sorted (small to great) arrays of integers a,
 * insert integer e according to the ordering.
 *
 * NOTE: this is not yet used in zhongmu but in one of its
 *       dependencies; it was stored here to avoid creating
 *       a new libutils.js (our pre-processing toolchain does
 *       not support the same filename in different path, eh.)
 *
 * Input:
 *	a : sorted array of integers
 *	e : integer to add in a
 * Output:
 *	a would have been altered and is also returned.
 */
function orderedinsert(a, e) {
	var i;

	/* special cases */
	if (a.length == 0)   { a.push(e);    return a; }
	if (e       <= a[0]) { a.unshift(e); return a; }
	if (a.length == 1)   { a.push(e);    return a; }

	for (i = 0; i < a.length-1; i++)
		if (a[i] <= e && e <= a[i+1])
			break;

	a.splice(i+1, 0, e);
	return a;
}

/*
 * https://en.wikipedia.org/wiki/Combining_Diacritical_Marks#Character_table
 *
 */
var n2a = [
	'',
	'\u0304', // macron
	'\u0301', // acute accent
	'\u030C', // caron
	'\u0300', // grave accent
	'',
];

/*
 * Add (pinyin) accent to given voyel.
 *
 * We tolerate non-voyel and senseless tone numbers;
 * those should be assertion.
 *
 * TODO: we may want to use genuine accents rather than
 * combining diacritical.
 *
 * Input:
 *	v : voyel to add accent to
 *	n : [0-5], pinyin tone.
 * Output:
 *	String with combining diacritical mark for that voyel.
 */
function addaccent(v, n) { return (n > 5 || n < 0) ? v : v+n2a[n]; }

/*
 * Convert a number based pinyin to an accent based
 * one.
 *
 * Input:
 * Output:
 */
function pinyinn2a(p) {
	var [w, n] = [p.slice(0, -1), p.slice(-1)];

	var voyels = {
		'a' : true, 'e' : true, 'i' : true,
		'o' : true, 'u' : true,
	};

	for (var i = w.length-1; i >= 0; i--) {
		if (!(w[i] in voyels)) continue;

		if (i > 0 && (w[i-1] in voyels) && w[i-1] != 'i')
			i = i-1;
		return w.slice(0, i)+addaccent(w[i], n)+w.slice(i+1)
	}

	return w;
}

/*
 * Run pinyin2a() on a string of space separated pinyins.
 *
 * Input:
 *	ps : string of space separated pinyins
 * Output:
 *	string where each number-based pinyin has been replaced by
 *	the matching accent-based pinyin.
 */
function pinyinsn2a(ps) {
	return ps.split(" ").map(pinyinn2a).join(" ");
}
