/*
 * Code around cut() function.
 *
 * Requires libutils.js
 */

/*
 * cut() usage statistics.
 *
 * NOTE: stats are now unused. We may want to remove them.
 *
 * All the following are counters such as:
 *	{
 *		word : counter,
 *		...
 *	}
 */
var stats = {
	/*
	 * Words with no definition.
	 * This includes words from source's words
	 * decomposition.
	 */
	"nodefs" : {},

	/*
	 * Words counters from source only.
	 */
	"words"  : {},

	/*
	 * Same as before, but split words in symbols ([...s])
	 * before counting.
	 */
	"symbols" : {},
};

/*
 * Add entry to stats, filtering if needed.
 *
 * Input:
 *	e : stats sub entry
 *	w : word to insert
 * Output:
 */
function addstats(e, w) {
	/*
	 * Don't compute stats for "fake" dictionary entry.
	 * cf. 'libdata.js:/function censordict/'
	 */
	if (w >= 'A' && w <= 'Z') return;
	if (w >= 'a' && w <= 'z') return;
	if (w >= '0' && w <= '9') return;
	if (w == 'Ｑ' || w == 'Ｃ') return;
	if (w == 'Ｔ' || w == 'Ｂ') return;
	if (ispunct(w))           return;

	if (w in stats[e]) stats[e][w]++;
	else               stats[e][w] = 1;
}

/*
 * cut()'s tokens type.
 */
var ctype = {
	'punct'   : 0,
	'chinese' : 1,
	'foreign' : 2,
	'eof'     : 3,
};

/*
 * Eat characters from s as long as condition is met.
 *
 * Input:
 *	s : unicode "characters" arrays (e.g. [..."héllo"])
 *	i : index in s at which we should start looking
 *	f : function so that f(s[i]) returns true if we need
 *	    to keep iterating, false otherwise.
 * Output:
 *	Index of s at which condition stops holding, or once
 *	we reached s's end.
 */
function eatwhile(s, i, f) {
	while(i < s.length && f(s[i])) i++;
	return i;
}

/*
 * Retrieve longest word at the beginning
 * of s, according to tdict.
 *
 * If no word is found, eat first (Chinese) unicode character,
 * and return it with an empty definition.
 *
 * Input:
 *	s     : unicode "characters" arrays (e.g. [..."héllo"])
 *	i     : index in s at which we should start looking
 *	tdict : tree dictionnary
 *	k     : if k=0 (default) take longest word. if k=1,
 *			take second longest word. Would work for k>1,
 *			but practically unused.
 * Output:
 *	Array containing:
 *		- length of the known word we we found (0 if none)
 *		- its definition ("-" if none)
 */
function getword(s, i, tdict, k) {
	var p  = tdict;
	var ds = [];
	var d  = {};
	var j;

	if (k == null) k = 0;

	/*
	 * p moves forward in tdict as long as we
	 * have a path.
	 *
	 * Each time we move p, stack on ds whether
	 * current path points to a known word.
	 */
	for (j = i; j < s.length; p = p[s[j++]][0]) {
		/*
		 * NOTE: sutble, we have entries in the dictionary that
		 * contains punctuation. However, we assume in ':/^function getrtok'
		 * that this is not the case.
		 *
		 * We may want to be smarter later?
		 */
		if (ispunct(s[j]))
			break;

		if (!(s[j] in p))
			break;

		/* Remember definition if we were on a word */
		else ds.push(p[s[j]].length > 1 ? p[s[j]][1] : "");
	}

	/* Backtrack until we found a word */
	for (;ds.length > 0; j--) {
		var x = ds.pop();
		if (x && k-- == 0) {
			d = x;
			break;
		}
	}

	/*
	 * Not moved on non-empty input: assume one character
	 * long, undefined word
	 */
	if (s.length && i == j) {
		j = i+1; d = {};
	}

	return [j, d];
}

/*
 * Grab a "raw" token from s, starting at position i.
 *
 * Within a "raw" token, Chinese token have no definition
 * and just consists of a consecutive list of Chinese
 * characters from s. Proper words will be extracted later.
 *
 * Input:
 *	s     : Array of unicode characters ([...string])
 *	i     : current position in s.
 * Output:
 *	Hash containing:
 *		t : token type (punct|foreign|chinese|eof)
 *		i : token position start
 *		j : token position end
 *		v : s.slice(i, j).join("")
 */
function getrtok(s, i) {
	var t, j;

	if (i == s.length) {
		t =  ctype.eof;
		j = i;
	}
	else if (ispunct(s[i])) {
		t = ctype.punct;
		j = eatwhile(s, i, ispunct);
	}
	else if (ischinesec(s[i])) {
		t = ctype.chinese;
		j = eatwhile(s, i, ischinesec);
	}
	else {
		t = ctype.foreign;
		j = eatwhile(s, i, function(x) {
			return !ispunct(x) && !ischinesec(x);
		});
	}

	return { t : t, i : i, j : j, v : s.slice(i, j).join("") };
}

/*
 * Raw tokenization of s; raw tokens are introduced in
 * getrtok()'s doc.
 *
 * Input:
 *	s     : Array of unicode characters ([...string])
 * Output:
 *	Array of hashes, where each hash contains:
 *		t : token type (punct|foreign|chinese|eof)
 *		i : token position start
 *		j : token position end (token is s.slice(i, j))
 */
function rtokenize(s) {
	var ts = [];
	var i  = 0;

	do {
		ts.push(getrtok(s, i));
		i = ts[ts.length-1].j
	} while (ts[ts.length-1].t != ctype.eof);

	return ts;
}

/*
 * Melt a raw chinese token into proper Chinese words tokens.
 *
 * Input:
 *	s     : Array of unicode characters ([...string])
 *	t     : Raw chinese token to melt.
 *	tdict : Tree dictionary
 *	k     : if k=0 (default) start by taking longest word.
 *          if k=1, take second longest word. Would work for k>1,
 *			but practically unused. Is only used for the first
 *			word, so we can decompose s when s is a word.
 * Output:
 *	Array of hashes, where each hash contains:
 *		t : token type (punct|foreign|chinese|eof)
 *		i : token position start
 *		j : token position end
 *		v : s.slice(i, j).join("")
 *		d : token's definition ('-' if none)
 */
function meltcn(s, t, tdict, k) {
	var ts = [];
	var i, j;

	for (i = t.i; i < t.j; i++) {
		[j, d] = getword(s, i, tdict, k);

		/* k is only for first word */
		if (k) k = 0;

		/*
		 * Only keep words that are not completely covered
		 * by previous word, if any. They would appear in
		 * previous word decomposition.
		 */
		if (!ts.length || j > ts[ts.length-1].j)
			ts.push({
				t : ctype.chinese,
				i : i,
				j : j,
				v : s.slice(i, j).join(""),
				d : d
			});
	}

	return ts;
}

/*
 * Proper tokenisation of s, where each raw Chinese token
 * would have been melted.
 *
 * Input:
 *	s     : Array of unicode characters ([...string])
 *	tdict : Tree dictionary
 * Output:
 *	Array of hashes, where each hash contains:
 *		t : token type (punct|foreign|chinese|eof)
 *		i : token position start
 *		j : token position end (token is s.slice(i, j))
 *	Furthermore, all Chinese tokens would have a:
 *		d : token's definition ('-' if none)
 */
function tokenize(s, tdict) {
	var rs = rtokenize(s);
	var ts = [];

	for (var i = 0; i < rs.length; i++)
		if      (rs[i].t == ctype.eof)     continue;
		else if (rs[i].t != ctype.chinese) ts.push(rs[i]);
		else ts = ts.concat(meltcn(s, rs[i], tdict));

	return ts;
}

/*
 * Create recursive decomposition for given character.
 *
 * Input:
 *	c      : single (unicode) character word to decompose
 *	decomp : Decomposition data
 *	tdict  : Tree dictionary
 * Output:
 *	Breaks c using decomp, and returns an array with one
 *	entry for each components of c if any.
 *
 *	Such entries are hashes containing:
 *		v : word value (string)
 *		d : word definition
 *		c : word decomposition
 */
function decompose1(c, decomp, tdict) {
	return ((c in decomp) ? decomp[c] : []).map(function(x) {
		return {
			v : x,
			d : getword([x], 0, tdict)[1],
			c : decompose1(x, decomp, tdict)
		};
	});
}

/*
 * Decompose a Chinese word (either a dictionary
 * entry, or a single character long undefined character).
 *
 * Input:
 *	w      : word to decompose
 *	decomp : Decomposition data
 *	tdict  : Tree dictionary
 * Output:
 *	Potentially recursive hash on c entry, where hash contains:
 *		v : word value (string)
 *		d : word definition
 *		c : word decomposition
 */
function decompose(w, decomp, tdict) {
	if (w.length == 1) return decompose1(w[0], decomp, tdict);

	return meltcn(w, { i : 0, j : w.length }, tdict, 1).map(function(t) {
		var v = w.slice(t.i, t.j);
		return {
			v : v.join(""),
			d : t.d,
			c : decompose(v, decomp, tdict)
		};
	});
}

/*
 * Cut a Chinese string into a list of potentially overlapping
 * tokens.
 *
 * Tokens are dictionary words. Each token is recursively
 * decomposed using the dictionary and a symbol decomposition
 * table.
 *
 * Input:
 *	s      : string to be cut
 *	decomp : decomposition data, cf. 'libdata.js:/^function mkdecomp\('
 *	tdict  : tree dictionary, cf. 'libdata.js:/^function mktdict\('
 * Output:
 *	Same as tokenize(), except that each Chinese token would have
 *	been augmented by a .c field holding that field's decomposition,
 *	as returned by decompose().
 */
function cut(s, decomp, tdict) {
	if (typeof(s) == "string") s = [...s];

	var ts = tokenize(s, tdict);

	for (var i = 0; i < ts.length; i++)
		if (ts[i].t == ctype.chinese)
			ts[i].c = decompose(s.slice(ts[i].i, ts[i].j), decomp, tdict);

	return ts;
}

// TODO tests, doc
function foreachdef(d, f) {
	Object.keys(d).forEach(function(p) {
		for (var i = 0; i < d[p][1].length; i++)
			f(p, d[p][0], d[p][1][i], d[p][1], i)
	});
}

function deepclone(x) {
	return JSON.parse(JSON.stringify(x));
}

/*
 * Tokenize definitions.
 *
 * defs is untouched; a modified copy is returned.
 *
 * Input:
 *	defs: pointers to a dict entries.
 * Output:
 *	A copy of defs where all definition have been tokenized.
 */
function tokdef(defs, tdict) {
	/*
	 * Definitions are currently pointers to tdict's entries;
	 * we don't want to alter them, thus the need to clone
	 * the data first.
	 *
	 * TODO: maybe we want something finer than relying on
	 * JSON; performance penalty is practically negligeable.
	 */
	defs = deepclone(defs);

	/* Tokenize all defs */
	foreachdef(defs, function(p, t, d, q, i) {
		q[i] = tokenize([...d], tdict);
	});

	return defs;
}

/*
 * Recursively tokenize definitions of a cut()'s output.
 *
 * Input:
 *	ts    : cut()'s output
 *	tdict : tree dictionary
 * Output:
 *	All the definition fields (.d) of Chinese entries would
 *	have been replaced by their tokenized value. ts is returned
 *	altered.
 */
function rtokdef(ts, tdict) {
	for (var i = 0; i < ts.length; i++) {
		if (!('t' in ts[i])) ts[i].t = ctype.chinese;
		if (ts[i].t != ctype.chinese)
			continue;

		ts[i].d = tokdef(ts[i].d, tdict);

		/* Recurse to decomposition */
		ts[i].c = rtokdef(ts[i].c, tdict);
	}
	return ts;
}

function cutandrtokdef(s, decomp, tdict) {
	return rtokdef(cut(s, decomp, tdict), tdict);
}

/*
 * Same as cutandrtokdef() except we also return tdict.
 *
 * This is only for tests, so we can ensure we're not
 * altering tdict while tokenizing definitions.
 */
function xcutandrtokdef(s, decomp, tdict) {
	return [cutandrtokdef(s, decomp, tdict), tdict]
}

/*
 * Clean cut()'s output by removing entries refering to
 * non-chinese characters with no definitions.
 *
 * TODO: tests
 *
 * Input:
 *	ts       : cut()'s output
 * Output:
 *	Filtered ts (same format)
 */
function cleancut(ts) {
	return ts.filter(function(t) {
		return t.t == ctype.chinese;
	});
}

/*
 * TODO: doc, tests
 *
 * We may want to go merge this with rtokdef(), or write
 * a map***(ts, args...) to perform the recursive walk.
 */
function rextendcut(ts, tdict, tpict, u2b) {
	for (var i = 0; i < ts.length; i++) {
		/*
		 * Add big5 for single characters; already preformatting
		 * them for our single use case: links to zhongwen.com.
		 */
		var h = "0x"+ts[i].v.codePointAt(0).toString(16).toUpperCase();
		if ([...ts[i].v].length == 1 && h in u2b)
			ts[i].b = u2b[h].slice(2).split("").reduce(
				function(acc, x, i) {
					return (i % 2 == 0) ? acc.concat('%', x) : acc.concat(x);
				}, []).join("")

		/*
		 * Remember that tpict entries always are one
		 * character long, so we don't need to getword()
		 * to actually retrieve the definition.
		 *
		 * But maybe we actually should?
		 */
		if (ts[i].v in tpict)
			ts[i].p  = tokdef(tpict[ts[i].v][1], tdict);

		/* Recurse to decomposition */
		if (ts[i].c)
			ts[i].c = rextendcut(ts[i].c, tdict, tpict, u2b);
	}

	return ts;
}

/*
 * Create a standalone extended cut() function that relies
 * on given decomp/tdict/pdict/utf8tobig5.
 *
 * Input:
 *	decomp : decomposition data
 *	tdict  : tree dictionary
 * Output:
 *	A function taking a string to cut as argument; output
 *	descriptions would have been prepared with rtokdef().
 */
function mkxcut(decomp, tdict, tpict, u2b) {
	return function(s) {
		return rextendcut(
			cutandrtokdef(s, decomp, tdict),
			tdict, tpict, u2b
		);
	}
}
