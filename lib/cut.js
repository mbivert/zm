let Cut = (function() {
/*

var tokenizers = {
	"white"  : ....
	"yellow" : ...
}

*/

/**
 * NOTE: the new tokenizer described below is experimental and not
 * yet in production/in proper shape.
 *
 * NOTE: we only need a complex parsing mechanism for non-punctuations
 * delineated languages; we could rely on something simpler for non-Chinese.
 * See @multilang.
 *
 * New tokenizer, regrouping rtokenize, tokenize, getrtok & meltcn,
 * aiming at additionally managing dictionary entries containing punctuations.
 *
 * Tests pass, but the code is subtle, e.g. J is mostly magic at this point.
 *
 * There are also edge cases that arises here, such as what if there's an overlap
 * between two dictionaries entries that contain sentences? Also, we would need
 * to see how to use this with DecompType.Auto, as that code relies on meltcn.
 *
 *
 * @param{Array<string>}   s - unicode "characters" array (e.g. [..."héllo"])
 * @param{TreeDicts}  tdicts - tree dictionnary
 * @returns{Array<Token>}
 */
function tokenize2(s, tdicts) {
	/** @type{Array<Token>} */
	var ts = [];

	if (s.length == 0) return ts;

	/** @type{TokenType} */
	var t = TokenType.Word;

	var i = 0, k = 0, J = 0;

	for (;;) {
		// EOF
		if (i == s.length) break;

		// Try to read a word
		var [j, d] = getword2(s, i, tdicts, k);

		// By default, reset k.
		if (k) k = 0;

		// From where should next iteration starts
		var n;

		// J holds the further we went so far.
		if (j > J) J = j;

		// No known word here
		if (j == i) {
			// We're on a Chinese character: assume undefined 1 character-long "word"
			if (Utils.ischinesec(s[i])) {
				t = TokenType.Word;
				j = i+1;

			// Special case for pinyin detection in definitions.
			} else if (s[i] == '[' || s[i] == ']') {
				t = TokenType.Punct;
				j = i+1;

			// Punctuation: eat them all
			} else if (Utils.ispunct(s[i])) {
				t = TokenType.Punct;
				j = eatwhile(s, i, Utils.ispunct);

			// Assume western-word
			} else {
				t = TokenType.Word;
				j = eatwhile(s, i, function(x) {
					return !Utils.ispunct(x);
				});
			}

			// For all those, start next iteration after what we just read.
			n = j;
		}

		// We read a word
		else {
			t = TokenType.Word;
			if (Utils.ischinesec(s[i])) {
				// Looking for overlap in Chinese word, so start looking
				// for a word potentially overlapping with the one we've
				// just found
				n = i+1;

				// XXX written for a invalid reason, but works.
				k = n > J ? k = 1 : k = 0;
			}
			else
				n = j;
		}

		// Only keep tokens not fully covered by previous token,
		// as they would appear in decomposition.
		if (!ts.length || j > ts[ts.length-1].j)
			ts.push({
				t : t,
				i : i,
				j : j,
				v : s.slice(i, j).join(""),
				d : d,
				c : {}
			});

		i = n;
	}

	return ts;
}

/**
 * Retrieve longest word at the beginning
 * of s, according to tdicts.
 *
 * If no word is found, if strings starts with a Chinese unicode
 * character, eat it and associate it an empty definition, otherwise,
 * eat until we meet some punctuation.
 *
 * TODO: look for other languages that would behave such as Chinese,
 * e.g. Japanese. For now, the goal is mainly to be able to parse
 * Russian in addition of Chinese for demonstration's sake.
 *
 * @param{Array<string>}  s  - unicode "characters" array (e.g. [..."héllo"])
 * @param{number}         i  - index in s at which we should start looking
 * @param{TreeDicts}  tdicts - tree dictionnary
 * @param{number}      [k]   - if k=0 (default) take longest word. if k=1,
 * take second longest word. Would work for k>1, but practically unused.
 * @returns{[number, DictsEntries]} - array containing:
 *  - length of the known word we we found (0 if none)
 *  - its definition if any (empty DictsEntries (hash) otherwise)
 */
function getword2(s, i, tdicts, k) {
	var p  = tdicts;
	var ds = [];

	/** @type{DictsEntries} */
	var d  = {};
	var j;

	if (k == null) k = 0;

	// p moves forward in tdicts as long as we
	// have a path.
	//
	// Each time we move p, stack on ds whether
	// current path points to a known word.
	for (j = i; j < s.length; p = p[s[j++]][0]) {
		// Cannot move further
		if (!(s[j] in p)) break;

		// Remember definition if we were on a word
		else ds.push(p[s[j]][1]);
	}

	// Backtrack until we found a word
	for (;ds.length > 0; j--) {
		var x = ds.pop() || {};
		if (Object.keys(x).length && k-- == 0) {
			d = x;
			break;
		}
	}

	return [j, d];
}

/**
 * Eat characters from s as long as condition is met.
 *
 * @param{Array<string>} s - unicode "characters" array (e.g. [..."héllo"])
 * @param{number}        i - index in s at which we should start looking
 * @param{(arg0: string) => boolean } f -  f(s[i]) returns true if we need
 *  to keep iterating, false otherwise.
 * @returns{number} - Index of s at which condition stops holding,
 *  or once we reached s's end.
 */
function eatwhile(s, i, f) {
	while(i < s.length && f(s[i])) i++;
	return i;
}

/**
 * Retrieve longest word at the beginning
 * of s, according to tdicts.
 *
 * If no word is found, if strings starts with a Chinese unicode
 * character, eat it and associate it an empty definition, otherwise,
 * eat until we meet some punctuation.
 *
 * TODO: look for other languages that would behave such as Chinese,
 * e.g. Japanese. For now, the goal is mainly to be able to parse
 * Russian in addition of Chinese for demonstration's sake.
 *
 * @param{Array<string>}  s  - unicode "characters" array (e.g. [..."héllo"])
 * @param{number}         i  - index in s at which we should start looking
 * @param{TreeDicts}  tdicts - tree dictionnary
 * @param{number}      [k]   - if k=0 (default) take longest word. if k=1,
 * take second longest word. Would work for k>1, but practically unused.
 * @returns{[number, DictsEntries]} - array containing:
 *  - length of the known word we we found (0 if none)
 *  - its definition if any (empty DictsEntries (hash) otherwise)
 */
function getword(s, i, tdicts, k) {
	var p  = tdicts;
	var ds = [];

	/** @type{DictsEntries} */
	var d  = {};
	var j;

	if (k == null) k = 0;

	// p moves forward in tdicts as long as we
	// have a path.
	//
	// Each time we move p, stack on ds whether
	// current path points to a known word.
	for (j = i; j < s.length; p = p[s[j++]][0]) {
		// NOTE: sutble, we have entries in the dictionary that
		// contains punctuation. However, we assume in ':/^function getrtok'
		// that this is not the case.
		if (Utils.ispunct(s[j]))
			break;

		// Cannot move further
		if (!(s[j] in p)) break;

		// Remember definition if we were on a word
		else ds.push(p[s[j]][1]);
	}

	// Backtrack until we found a word
	for (;ds.length > 0; j--) {
		var x = ds.pop() || {};
		if (Object.keys(x).length && k-- == 0) {
			d = x;
			break;
		}
	}

	// Not moved on non-empty input
	if (s.length && i == j) {
		// Input starts with Chinese character: assume 1 character-long
		// undefined "word".
		if (Utils.ischinesec(s[i])) { j = i+1; d = {}; }

		// Consume first western-like word.
		else {
			j = eatwhile(s, i, function(x) {
				return !Utils.ispunct(x);
			});
		}
	}

	return [j, d];
}

/**
 * Grab a "raw" token from s, starting at position i.
 *
 * @param{Array<string>}  s - unicode "characters" array (e.g. [..."héllo"])
 * @param{number}         i - index in s at which we should start looking
 * @param{TreeDicts} tdicts - tree dictionnary
 * @returns{Token}
 */
function getrtok(s, i, tdicts) {
	var t, j;

	/** @type{DictsEntries} */
	var d = {};

	if (i == s.length) {
		t =  TokenType.EOF;
		j = i;
	}
	// Separated from other TokenType.Punct so that we
	// can parse pinyins within.
	//
	// NOTE: this is an old behavior we'd like to get rid
	// of; kept because we're currently meddling too deep
	// with the code.
	else if (s[i] == '[' || s[i] == ']') {
		t = TokenType.Punct;
		j = i+1;
	}
	else if (Utils.ispunct(s[i])) {
		t = TokenType.Punct;
		j = eatwhile(s, i, Utils.ispunct);
	}

	// Chinese tokens are temporary tokens; we'll take the time
	// to properly decompose them later (meltcn)
	//
	// XXX/TODO: we should be able to do this now, but those parts
	// of the code are critical and subtle.
	//
	// If we do so thouht, rtokenize and tokenize basically become
	// the same thing.
	else if (Utils.ischinesec(s[i])) {
		t = TokenType.Chinese;
		j = eatwhile(s, i, Utils.ischinesec);
	}
	else {
		t = TokenType.Word;
		[j, d] = getword(s, i, tdicts);
	}

	return { t : t, i : i, j : j, v : s.slice(i, j).join(""), d : d, c : {} };
}

/**
 * Raw tokenization of s; raw tokens are introduced in
 * getrtok()'s doc.
 *
 * @param{Array<string>}  s - unicode "characters" array (e.g. [..."héllo"])
 * @param{TreeDicts} tdicts - tree dictionnary
 * @returns{Array<Token>}
 */
function rtokenize(s, tdicts) {
	var ts = [];
	var i  = 0;

	do {
		ts.push(getrtok(s, i, tdicts));
		i = ts[ts.length-1].j
	} while (ts[ts.length-1].t != TokenType.EOF);

	return ts;
}

/**
 * Melt a raw chinese token into proper Chinese words tokens.
 *
 * @param{Array<string>}  s - unicode "characters" array (e.g. [..."héllo"])
 * @param{IJToken} t - Raw chinese token to melt.
 * @param{TreeDicts} tdicts - tree dictionnary
 * @param{number}     [k]   - if k=0 (default) take longest word. if k=1,
 * take second longest word. Would work for k>1, but practically unused.
 * @returns{Array<Token>} - proper tokens.
 */
function meltcn(s, t, tdicts, k) {
	/** @type{Array<Token>} */
	var ts = [];
	var i, j;

	for (i = t.i; i < t.j; i++) {
		var d;
		[j, d] = getword(s, i, tdicts, k);

		// k is only for first word
		if (k) k = 0;

		// Only keep words that are not completely covered
		// by previous word, if any. They would appear in
		// previous word decomposition.
		if (!ts.length || j > ts[ts.length-1].j)
			ts.push({
				t : TokenType.Word,
				i : i,
				j : j,
				v : s.slice(i, j).join(""),
				c : {},
				d : d,
			});
	}

	return ts;
}

/**
 * Proper tokenisation of s, where each raw Chinese token
 * would have been melted.
 *
 * @param{Array<string>}   s - unicode "characters" array (e.g. [..."héllo"])
 * @param{TreeDicts}  tdicts - tree dictionnary
 * @returns{Array<Token>}
 */
function tokenize(s, tdicts) {
	var rs = rtokenize(s, tdicts);

	/** @type{Array<Token>} */
	var ts = [];

	for (var i = 0; i < rs.length; i++)
		if      (rs[i].t == TokenType.EOF)  continue;
		else if (rs[i].t == TokenType.Chinese)
			ts = ts.concat(meltcn(s, rs[i], tdicts));
		else ts.push(rs[i]);

	return ts;
}

/**
 * Create recursive decomposition for given character.
 *
 * @param{string}             c - single (unicode) character word to decompose
 * @param{TreeDecomps} tdecomps - Decomposition data
 * @param{TreeDicts}   tdicts   - Tree dictionary
 * @returns{DecompsEntries<Component>} - an array with one entry for each components of c if any.
 */
function decompose1(c, tdecomps, tdicts) {
	return Object.keys((c in tdecomps) ? tdecomps[c] : {}).reduce(function(acc, n) {
		acc[n] = tdecomps[c][n].map(function(d) {
			return {
				t : d.t,
				c : d.c.map(function(x) {
					return {
						v : x,
						d : getword([x], 0, tdicts)[1],
						c : decompose1(x, tdecomps, tdicts)
					};
				}),
			};
		});
		return acc;
	}, /** @type{DecompsEntries<Component>} */ ({}));
}

/**
 * Recursively decompose a Chinese word (either a dictionary
 * entry, or a single character long undefined character).
 *
 * @param{Array<string>} w             - word to be decomposed
 * @param{TreeDecomps}   tdecomps      - Decomposition data
 * @param{TreeDicts}     tdicts        - Tree dictionary
 * @returns{DecompsEntries<Component>} - an array with one entry for each components of c if any.
 */
function decompose(w, tdecomps, tdicts) {
	var c = Utils.ischinesec(w[0]);

	// Single Chinese character or non-Chinese word: directly use the
	// decomposition tables
	if (w.length == 1 && c || !c) return decompose1(w[0], tdecomps, tdicts);

	// Grab potential overlapping Chinese words within that
	// word, and recurse on those.
	return {
		"auto" : [{
			t : DecompType.Auto,
			c : meltcn(w, { i : 0, j : w.length }, tdicts, 1).map(function(t) {
				return {
					v : t.v,
					d : t.d,
					c : decompose([...t.v], tdecomps, tdicts)
				};
			})
		}],
	};
}

/**
 * Recursively decompose multiple tokens.
 *
 * Tokens are dictionary words. Each token is recursively
 * decomposed using the dictionary and a symbol decomposition
 * table.
 *
 * @param{Tokens}      ts       - Tokens to decompose
 * @param{TreeDecomps} tdecomps - decomposition data
 * @param{TreeDicts}   tdicts   - tree dictionary
 * @returns{Tokens}
 */
function mdecompose(ts, tdecomps, tdicts) {
	return ts.map(function(t) {
		if (t.t == TokenType.Word) t.c = decompose(
			[...t.v], tdecomps, tdicts,
		);
		return t;
	});
}

/**
 * Cut a string into a list of potentially overlapping
 * tokens.
 *
 * Tokens are dictionary words. Each token is recursively
 * decomposed using the dictionary and a symbol decomposition
 * table.
 *
 * @param{string}      s        - string to be cut
 * @param{TreeDecomps} tdecomps - decomposition data
 * @param{TreeDicts}   tdicts   - tree dictionary
 * @returns{Array<Token>}
 */
function cut(s, tdecomps, tdicts) {
	return mdecompose(tokenize([...s.toLowerCase()], tdicts), tdecomps, tdicts);
}

/**
 * Recursively decompose a Chinese word (either a dictionary
 * entry, or a single character long undefined character).
 *
 * @param{Array<string>} w             - word to be decomposed
 * @param{TreeDecomps}   tdecomps      - Decomposition data
 * @param{TreeDicts}     tdicts        - Tree dictionary
 * @returns{Object.<string,boolean>} - an array with one entry for each components of c if any.
 */
function decompose2(w, tdecomps, tdicts) {
	var c = Utils.ischinesec(w[0]);

	// Single Chinese character or non-Chinese word: directly use the
	// decomposition tables
	if (w.length == 1 && c || !c)
		return Object.keys((w[0] in tdecomps) ? tdecomps[w[0]] : {}).reduce(function(acc, n) {
			acc[n] = true
			return acc;
		}, /** @type{Object.<string, boolean>} */ ({}));

	return { "auto" : true };
}

/**
 * Recursively decompose multiple tokens.
 *
 * Tokens are dictionary words. Each token is recursively
 * decomposed using the dictionary and a symbol decomposition
 * table.
 *
 * @param{Tokens}      ts       - Tokens to decompose
 * @param{TreeDecomps} tdecomps - decomposition data
 * @param{TreeDicts}   tdicts   - tree dictionary
 * @returns{Tokens}
 */
function mdecompose2(ts, tdecomps, tdicts) {
	return ts.map(function(t) {
		// @ts-ignore
		if (t.t == TokenType.Word) t.c = decompose2(
			[...t.v], tdecomps, tdicts,
		);
		return t;
	});
}


/**
 * Cut a string into a list of potentially overlapping
 * tokens.
 *
 * Tokens are dictionary words. Each token is recursively
 * decomposed using the dictionary and a symbol decomposition
 * table.
 *
 * @param{string}      s        - string to be cut
 * @param{TreeDecomps} tdecomps - decomposition data
 * @param{TreeDicts}   tdicts   - tree dictionary
 * @returns{Array<Token>}
 */
function cut2(s, tdecomps, tdicts) {
	return mdecompose2(tokenize([...s.toLowerCase()], tdicts), tdecomps, tdicts);
}

return {
	"getword"  : getword,
	"meltcn"   : meltcn,
	"cut"      : cut,
	"cut2"     : cut2,
	"tokenize" : tokenize,
};

})();
