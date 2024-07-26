let SimpleDict = (function() {
/*
 * Code for parsing CSV files in the CC-CEDICT format.
 *
 * We're importing things as-is for now; later, we'll want
 * to allow multiple dictionaries
 */

/**
 * @type{LineParser<Dict>}
 */
function parseline(accerr, s, n) {
	var [acc, err] = accerr;
	if (err) return accerr;

	var xs = s.split("\t");

	if (xs.length != 2)
		return [acc, [n, "Invalid number of fields: "+xs.length]];

	var [w, ds] = xs;

	if (!(w in acc)) { acc[w] = {}; acc[w][""] = []; }

	acc[w][""].push({
		ds : ds.split(/[,;] */),
	});

	return accerr;
}

/**
 * Parse a simple dict from raw csv.
 *
 * @type{Parser<Dict>}
 */
function parse(s) {
	return Utils.splitlines(s).reduce(parseline, [{}, undefined]);
}

return {
	"parseline" : parseline,
	"parse"     : parse,
};

})();
