let CEDict = (function() {
/*
 * Code for parsing CSV files in the CC-CEDICT format.
 *
 * We're importing things as-is for now; later, we'll want
 * to allow multiple dictionaries
 */

/**
 * Remove references to modern words in a group of definitions.
 *
 * For instance, "variant of 什麼| 什 么 [shen2 me5]"
 * would become "variant of 什麼 [shen2 me5]".
 *
 * @param{Array<string>} defs - array of definitions (strings).
 * @returns{Array<string>} - defs where each reference to modern
 * characters has been removed.
 */
function rmmodernrefs(defs) {
	return defs.map(function(def) {
		return def.replace(/([^|\] ]+)\|([^|\] ]+) *(\[[a-zA-Z0-9 ]+\])/g, "$1$3")
	});
}

/**
 * Read a line from CC-CEDICT dictionary.
 *
 * We systematically trash modern Chinese: they are mostly useless
 * for our purposes, as they alter the subtle nuances of traditional
 * characters in the name of making things "simpler".
 *
 * Also, embedding them creates lots of weird self-referencing
 * entries: were we to ever need modern Chinese again, we would need to
 * pack it as a separate, special dictionary.
 *
 * @type{LineParser<Dict>}
 */
function parseline(accerr, s, n) {
	var [acc, err] = accerr;
	if (err) return accerr;

	s = s.trim();

	// Skip empty lines and comments.
	if (s.startsWith('#'))    return accerr;
	if (s.trim().length == 0) return accerr;

	var tweak = '';
	if (s[0] == '+' || s[0] == '-') {
		tweak = s[0]; s = s.slice(1);
	}

	var i      = s.indexOf(" ");
	if (i == -1)
		return [acc, [n, "Invalid dict entry, no space after old: "+s]];

	var old    = s.slice(0, i);
	var j      = s.indexOf(" ", i+1);
	if (j == -1)
		return [acc, [n, "Invalid dict entry, no space after modern: "+s]];

	var modern = s.slice(i+1, j);

	var k = s.indexOf("/");
	if (k == -1)
		return [acc, [n, "Invalid dict entry, no defs: "+s]];

	if (s.slice(-1) != "/")
		return [acc, [n, "Invalid dict entry, not slash terminated: "+s]];

	var defs   = s.slice(k+1, -1);

	var i = s.indexOf("[")
	var j = s.indexOf("]")
	if (i == -1 || j == -1)
		return [acc, [n, "Invalid dict entry, sound not in '[]': "+s]];

	var sound  = s.slice(i+1, j);

	if (!(old   in acc))      acc[old]        = {};
	if (!(sound in acc[old])) acc[old][sound] = [];
	acc[old][sound].push({
		rm : tweak == '-',
		ds : rmmodernrefs(defs.split("/")),
	});

	return [acc, undefined];
}


/**
 * Parse CC-CEDICT dictionary from raw csv.
 *
 * @type{Parser<Dict>}
 */
function parse(s) {
	return Utils.splitlines(s).reduce(parseline, [{}, undefined]);
}

/**
 * Clean dictionary: there are quite some entries using
 * english words that thus naturally arises when inspecting
 * a word's definition on the web UI.
 *
 * Given we aim at inspecting traditional Chinese, and that
 * those entries seems to cover modern slang, it's mostly noise
 * for our purposes, e.g.
 *
 *	P [P] /(slang) femme (lesbian stereotype)/to photoshop/
 *	T [T] /(slang) butch (lesbian stereotype)/
 *	V溝 [V gou1] /low neckline that reveals the cleavage/décolleté/gully/
 *
 * @param{Dict} d - dictionary
 * @returns{Dict} - d altered in place: entries containing [A-Za-z] removed.
 */
function clean(d) {
	var ws = Object.keys(d);

	for (var i = 0; i < ws.length; i++)
		if (ws[i].match(/[A-Za-z]/))
			delete d[ws[i]];

	return d;
}

/**
 * Parse CC-CEDICT dictionary from raw csv, and remove
 * noisy entries.
 *
 * @type{Parser<Dict>}
 */
function parseandclean(s) {
	var [r, e] = parse(s);
	if (!e) r = clean(r);
	return [r, e];
}

/**
 * Dump a Dict to a ~CC-CEDICT format.
 *
 * TODO; to get rid of ./swmarkdown.js by converting the shuowen
 * to a CC-CEDICT.
 *
 * @param{Dict} d
 */
function dump(d) {
}

return {
	"parseline"     : parseline,
	"parse"         : parse,
	"rmmodernrefs"  : rmmodernrefs,
	"clean"         : clean,
	"parseandclean" : parseandclean,
};

})();
