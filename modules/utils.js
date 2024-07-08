/*
 * Standalone functions
 */

/**
 * Dump data as JSON.
 *
 * @param{any} x
 * @returns{string}
 */
function dump1(x) { return JSON.stringify(x, null, 4); }

/**
 * Dump some data to the console in JSON
 *
 * @param{Array.<any>} xs - objects to be dumped
 * @returns{void} - all xs would have been dumped to console.
 */
function dump(...xs) { xs.forEach(function(x) {console.log(dump1(x));}); }

/**
 * Does this unicode code point refers to a Chinese character?
 *
 * NOTE: ranges taken from:
 *  https://en.wikipedia.org/wiki/CJK_Unified_Ideographs_(Unicode_block)
 *
 * NOTE: later augmented with
 *	https://stackoverflow.com/a/1366113
 *
 * @param{number} c - unicode code point
 * @returns{boolean} - true if C is in a Chinese range.
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

/**
 * Does the given string contains some Chinese text?
 *
 * @param{string} s - string to inspect
 * @returns{boolean} - true if at least one code point from the
 * string represents a Chinese character
 */
function haschinese(s) {
	for (var i = 0; i < s.length; i++)
		if (ischinese(s.codePointAt(i) || 0)) return true;

	return false;
}

/**
 * Does the given string starts with a Chinese unicode code
 * point?
 *
 * @param{string} s - string to test
 * @returns{boolean} -true if s does start with Chinese code point
 */
function ischinesec(s) {
	return ischinese(s.codePointAt(0) || 0);
}

/** @type{Object.<string, boolean>} */
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
	"“"  : true,
	"”"  : true,
};

/**
 * Test if given "byte" is punctuation.
 *
 * @param{string} c - string to test
 * @returns{boolean} - true if punctuation
 */
function ispunct(c) { return c in puncts; }

/**
 * End of sentence
 *
 * @type{Object.<string, boolean>}
 */
var eos = {
	'？'  : true,
	'?'  : true,
	'！'  : true,
	'!'  : true,
	'。' : true,
	"."  : true,
}

/**
 * Test if given "byte" marks end of sentence.
 *
 * @param{string} c - string to test
 * @returns{boolean} - true if c marks end of sentence
 */
function iseos(c) { return c in eos; }

/**
 * Assuming a sorted (small to great) arrays of integers a,
 * insert integer e according to the ordering.
 *
 * NOTE: this is only used for pieces cutting; we may be
 *       be able to do without.
 *
 * @param{Array<number>} a - sorted array of integers
 * @param{number}   e - integer to add in a
 * @returns{Array<number>} - a, altered and returned.
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

/**
 * https://en.wikipedia.org/wiki/Combining_Diacritical_Marks#Character_table
 *
 * @type{Array<string>}
 */
var n2a = [
	'',
	'\u0304', // macron
	'\u0301', // acute accent
	'\u030C', // caron
	'\u0300', // grave accent
	'',
];

/**
 * Add (pinyin) accent to given voyel.
 *
 * We tolerate non-voyel and senseless tone numbers;
 * those should be assertion.
 *
 * TODO: we'll want to use genuine accents rather than
 *       combining diacritical; kept as-is for simplicity.
 *
 * @param{string} v - voyel to add accent to
 * @param{number} n - [0-5], pinyin tone.
 * @returns{string} -  with combining diacritical mark for that voyel.
 */
function addaccent(v, n) { return (n > 5 || n < 0) ? v : v+n2a[n]; }

/**
 * Convert a number based pinyin to an accent based
 * one.
 *
 * @param{string} p - number based pinyin (e.g. "wo3")
 * @returns{string} - p as an accent based pinyin
 */
function pinyinn2a(p) {
	var [w, n] = [p.slice(0, -1), parseInt(p.slice(-1)) || 0];

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

/**
 * Run pinyin2a() on a string of space separated pinyins.
 *
 * @param{string} ps - string of space separated pinyins
 * @returns{string} - ps where each number-based pinyin has been replaced by
 * the matching accent-based pinyin.
 */
function pinyinsn2a(ps) {
	return ps.split(" ").map(pinyinn2a).join(" ");
}

/**
 * Ensure v is on [a, b].
 *
 * TODO: tests.
 *
 * @type{(v:number, a:number, b:number) => number}
 */
function putin(v, a, b) {
	if (v <= a) v = a;
	if (v >= b) v = b;
	return v;
}

/**
 * Get a value in an intricate object.
 *
 * Overall, see https://stackoverflow.com/q/6491463
 *
 * @param{Object} o - intricate object
 * @param{string} p - path
 *
 * @returns{any|null} value found at given location within o
 */
function deepget(o, p) {
	return p.split('.').reduce(
		/** @type{(o : any, c : string) => any} */
		function(o, c) {
			if (o === null) return null;
			return (c in o) ? o[c] : null;
		},
	o);
}

/**
 * Set a value in an intricate object.
 *
 * Overall, see https://stackoverflow.com/q/6491463
 *
 * @param{Object} o - intricate object
 * @param{string} p - path
 * @param{any}    v - value to set
 *
 * @returns{Object}
 */
function deepset(o, p, v) {
	if (p === "") return o;
	var ps = p.split('.');
	ps.reduce(
		/**
		 *
		 * @param{Object.<string,any>} o
		 * @param{string} q
		 * @param{number} i
		 * @returns{Object}
		 */
		 function(o, q, i) {
		 	if (!(q in o))        o[q] = {};
			if (ps.length == i+1) o[q] = v;
			return o[q];
		}, o);
	return o;
}

/**
 * Transform a string hexadecimal to an string HTML escaped hexadecimal.
 *
 * @param{string} s - e.g. "0xBEC7"
 * @returns{string} - e.g. "%BE%C7"
 */
function htmlhex(s) {
	return s.slice(2).split("").reduce(
		/**
		 * @type{(acc : string[], x : string, i : number) => string[]}
		 */
		function(acc, x, i) {
			return (i % 2 == 0) ? acc.concat('%', x) : acc.concat(x);
		}, []).join("")
}

/**
 * Split entries to an array of lines, making sure
 * we don't end up with an empty training line, and
 * managing both UNIX and Windows EOL.
 *
 * @param{string} [s]
 * @returns{Array<string>}
 */
function splitlines(s) {
	if (s && s.endsWith("\n")) {
		s = s.slice(0, -1)
		if (s.endsWith("\r"))
			s = s.slice(0, -1)
	}
	if (!s) return [];
	return s .split(/\n|\r\n/);
}

/**
 * Copy an array.
 *
 * TODO: tests!
 *
 * @template T
 * @param{Array<T>} xs
 * @returns{Array<T>}
 */
function copyarray(xs) {
	// yes, yes, we could .reduce().
	/** @type{Array<T>} */
	let ys =  [];
	xs.forEach(function(x) { ys.push(x); });
	return ys;
}

export {
	dump1,
	dump,

	ischinese,
	ischinesec,
	haschinese,

	ispunct,

	orderedinsert,

	addaccent,
	pinyinn2a,
	pinyinsn2a,

	putin,

	deepget,
	deepset,

	htmlhex,

	splitlines,

	copyarray,
};
