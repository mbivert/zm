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
};

// TODO doc & tests
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
