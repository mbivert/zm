var Data = (function() {
/*
 * This module wraps access, formatting and local storage of
 * remote Data files, including dictionaries, decomposition
 * tables, and books.
 *
 * It also contains a cut()/tokenize() wrappers directly accessing
 * the data cached here.
 */

/**
 * Available data parsers.
 * Data type (dict, decomp, etc.)
 *	=> Data format (cedict, wm-decomp, etc.)
 *		=> Loader
 *
 * @type{Object.<DataType, Object.<DataFmt, Parser<Dict|Decomp|UTF82Big5|Book>>>}
 */
var parsers = {
	[DataType.Dict] : {
		[DataFmt.CEDict]          : CEDict.parseandclean,
		[DataFmt.SWMarkdown]      : SWMarkdown.parse, // XXX temporary;
		[DataFmt.SimpleDict]      : SimpleDict.parse,
	},
	[DataType.Decomp] : {
		[DataFmt.WMDecomp]        : WMDecomp.parse,
		[DataFmt.Chise]           : Chise.parse,
	},
	[DataType.Big5] : {
		[DataFmt.UnicodeBig5]     : Big5.parse,
	},
	[DataType.Book] : {
		[DataFmt.Markdown]        : Markdown.parse,
	},
};

/**
 * We keep a local cache of dictionaries before we
 * load them as a tree so that we can provide an efficient
 * search feature on index page.
 *
 * Indexed by dictionaries' (unique) names.
 *
 * @type{Object.<string, Dict>}
 */
var dicts = {};

/**
 * Decomposition tables.
 *
 * Indexed by decomposition tables' (unique) names
 *
 * @type{Object.<string, Decomp>}
 */
var decomps = {};

/**
 * Loaded books.
 *
 * Indexed by books' (unique) names
 *
 * @type{Object.<string, Book>}
 */
var books = {};

/**
 * Tree dictionaries used for tokenisation.
 *
 * @type{TreeDicts}
 */
var tdicts = {};

/**
 * Tree decomposition tables, used for tokenisation
 *
 * @type{TreeDecomps}
 */
var tdecomps = {};

/**
 * Unicode to Big5 conversion table.
 *
 * We allow many in data/, but for in practice there's
 * only a single one, and its usage is rather limited.
 *
 * Access wrapped behind a function anyway.
 *
 * @type{UTF82Big5}
 */
var u2b = {};

/**
 * Decompress some data with pako.
 *
 * TODO/XXX: no automatic tests.
 *
 * @param{string} x - raw data to decompress
 *
 * @returns{string} - decompressed data.
 */
function gunzip(x) {
	return new TextDecoder("utf-8").decode(
		// @ts-ignore
		pako.inflate(new Uint8Array(x))
	)
}

/**
 * XXX to be removed (see 'view/login.js:/^function getcookietoken')
 * Retrieve the value of the "token" cookie.
 *
 * @returns{string}
 */
function getcookietoken() {
	let cs = document.cookie.split("; ");

	for (let i = 0; i < cs.length; i++)
		if (cs[i].startsWith("token="))
			return cs[i].slice("token=".length)

	return ""
}

/**
 * Retrieve "local" (server-wise) compressed file.
 *
 * We automatically prepend server's root directory and version
 * GET parameter.
 *
 * TODO/XXX: no automatic tests.
 *
 * @param{string}                    url - where to fetch data.
 * @param{(arg0 : string) => (void)} ok  - success callback
 * @param{(arg0 : string) => (void)} ko  - failure callback
 *
 * @returns{void}
 */
function zget(url, ok, ko) {
	return RPC.fget(url, function(y) {
		var x; try { x = gunzip(y) }
		catch(e) { ko("cannot decompress "+url+": "+e); return; }
		ok(x);
	}, ko,
	// We want xhr.response to be uint8 array (for pako)
	"arraybuffer");
}

/**
 *
 * Retrieve and decompress multiple files.
 *
 * TODO/XXX: no automatic tests.
 *
 * @param{Array<string>} urls - files to fetch.
 * @param{any} g - TODO/lazzy
 *
 * @returns{Array<Promise<string>>}
 */
function mxget(urls, g) {
	return urls.reduce(
		/**
		 * @param{Array<Promise<string>>}   acc
		 * @param{string}                   url
		 * @returns{Array<Promise<string>>}
		 */
		function(acc, url) {
			acc.push(new Promise(function(resolve, reject) {
				g(url, resolve, reject);
			})); return acc;
		}, []);
}

/**
 *
 * Retrieve and decompress multiple files.
 *
 * TODO/XXX: no automatic tests.
 *
 * @param{Array<string>} urls - files to fetch.
 *
 * @returns{Array<Promise<string>>}
 */
function mzget(urls) { return mxget(urls, zget); }

/**
 *
 * Retrieve and decompress multiple files.
 *
 * TODO/XXX: no automatic tests.
 *
 * @param{Array<string>} urls - files to fetch.
 *
 * @returns{Array<Promise<string>>}
 */
function mget(urls)  { return mxget(urls,  RPC.fget); }

/**
 * Retrieve meta-datas about the Datas identified by the given
 * names from database.
 *
 * TODO: tests
 *
 * This includes among others path to remote file.
 *
 * @param{Array<string>} xs - data names
 * @returns{Promise<Datas>} - results and a optional
 * error message
 */
function getmetas(xs) {
	return RPC.pcall("/data/get/metas", {
		"names" : xs,
	}).then(function(x) { return x.metas; });

}

/**
 * Retrieve meta-datas about the Datas identified by the given
 * names from database.
 *
 * This includes among others path to remote file.
 *
 * @param{Datas} xs - data names
 * @returns{Promise<string[]>} - file's content
 */
function getdatas(xs) {
	return Promise.all(mzget(xs.map(function(x) { return x.File; })));
}

/**
 * Try to parse the given data
 *
 * TODO: use in loaddata(); better error handling.
 *
 * @param{Pick<Data, "Type" | "Fmt">} d
 * @param{string}                     s - content to parse
 * @returns{string|undefined}           - error message
 */
function parse(d, s) {
	if (!(d.Type in parsers))
		return "No parser for type '"+d.Type+"'";

	if (!(d.Fmt in parsers[d.Type]))
		return "No parser for type/fmt '"+d.Type+"/"+d.Fmt+"'";

	var [x, err] = parsers[d.Type][d.Fmt](s);
	return err ? ":"+err[0]+":"+err[1] : "";
}

/**
 * Load the given data into our local variables.
 *
 * @param{Data}   d - meta datas
 * @param{string} s - unparsed, gunziped content
 * @returns{string|undefined} - error message
 */
function loaddata(d, s) {
	if (!(d.Type in parsers))
		return "No parser for type '"+d.Type+"'";

	if (!(d.Fmt in parsers[d.Type]))
		return "No parser for type/fmt '"+d.Type+"/"+d.Fmt+"'";

	var err;

	switch(d.Type) {
	case DataType.Dict   : [dicts[d.Name],   err] = parsers[d.Type][d.Fmt](s); break;
	case DataType.Decomp : [decomps[d.Name], err] = parsers[d.Type][d.Fmt](s); break;
	case DataType.Big5   : [u2b,             err] = parsers[d.Type][d.Fmt](s); break;
	case DataType.Book   : [books[d.Name],   err] = parsers[d.Type][d.Fmt](s); break;
	default:
		Assert.assert("Unexpected data type: '"+d.Type+"'");
	}

	return err;
}


/**
 * Load the given datas into our local variables.
 *
 * @param{Datas}         ds - meta datas
 * @param{Array<string>} ss - unparsed, gunziped content
 * @returns{string|undefined} - error message
 */
function loaddatas(ds, ss) {
	if (ds.length != ss.length) {
		Assert.assert("Array length mismatch");
		// @ts-ignore
		return;
	}

	for (var i = 0; i < ds.length; i++) {
		var err = loaddata(ds[i], ss[i]);
		if (err) return err;
	}

	return undefined;
}

/**
 * Add the dictionary d named n to t.
 *
 * @param{string}    n - dict name
 * @param{Dict}      d - dict to add
 * @param{TreeDicts} t - tree dictionary to complete with d
 * @returns{TreeDicts} - t updated
 */
function addtdicts(n, d, t) {
	var p  = t

	var ks = Object.keys(d);

	for (var i = 0; i < ks.length; i++) {
		var k = [...ks[i]];
		for (var j = 0; j < k.length; j++) {
			// No such entry yet
			if (!(k[j] in p))
				p[k[j]] = [ {}, {} ];

			// We have a word, store entry.
			if (j == k.length-1)
				p[k[j]][1][n] = d[ks[i]];

			// Move deeper
			p = p[k[j]][0];
		}
		p = t;
	}

	return t;
}

/**
 * Create the TreeDicts for tokenizing using all the loaded
 * dictionaries, that is, all the dictionaries referenced
 * in preferences.
 *
 * @param{Object<string, Dict>} [ds] - loaded dictionaries
 * @param{TreeDicts}            [td] - Tree dicts to add things to
 * @returns{TreeDicts}              - td updated
 */
function mktdicts(ds, td) {
	if (!ds) ds = dicts;
	if (!td) td = tdicts;
	return Object.keys(ds).reduce(function(td, n) {
		return addtdicts(n, (ds||{})[n], td);
	}, td);
}

/**
 * Add the decomp d named n to t.
 *
 * TODO: tests
 *
 * @param{string}      n - decomp table name
 * @param{Decomp}      d - decomp table to add
 * @param{TreeDecomps} t - tree decomps to complete with d
 * @returns{TreeDecomps} - t updated
 */
function addtdecomps(n, d, t) {
	Object.keys(d).forEach(function(w) {
		if (!(w in t))    t[w]    = {};
		t[w][n] = d[w];
	});
	return t;
}

/**
 * Create the TreeDecomps for tokenizing using all the loaded
 * dictionaries, that is, all the dictionaries referenced
 * in preferences.
 *
 * @param{Object<string, Decomp>} [ds] - loaded decomps
 * @param{TreeDecomps}            [td] - Tree decomps to add things to
 * @returns{TreeDecomps}               - td updated
 */
function mktdecs(ds, td) {
	if (!ds) ds = decomps;
	if (!td) td = tdecomps;
	return Object.keys(ds).reduce(
		function(td, n) { return addtdecomps(n, (ds||{})[n], td); }, td
	);
}

/**
 * Initialize this module's globals according to the user's
 * preferences.
 *
 * TODO: can we use async/await here and avoid callbacks?
 *
 * @param{string[]} xs - data names referenced in preferences.
 * @returns{Promise<any>} - TODO: do we keep promises?
 */
function init(xs) {
	// Fetch meta datas associated to the given data records,
	return getmetas(xs).then(function(ys) {
		// Now, fetch the files via the filepaths located
		// in the metas
		return getdatas(ys).then(
			/**
			 * Finally, load evenything
			 * @param{string[]} zs
			 */
			function(zs) {
				let err = loaddatas(ys, zs);
				// Will reject the promise
				if (err) throw err;
			});
	}).then(function() { mktdicts(); mktdecs(); });
}

/**
 * Convert unicode character to big5, if possible.
 *
 * Mainly used to wrap access to u2b.
 *
 * @param{string} c
 * @returns{string}
 */
function utf82big5(c) {
	var x = c.codePointAt(0);

	if (!x) {
		Assert.assert("empty input");
		return "";
	}

	var y = "0x"+x.toString(16).toUpperCase();
	return (y in u2b) ? u2b[y] : "";
}

// TODO: perhaps not necessary: it's a bit of extra-calculus,
// but that's negligible, and we can control what to display
// at the view level.
/**
 * Cut wrapper using locally cached dicts/decomps
 *
 * @param{string} s - string to cut
 * @param{TreeDecomps} [tde] - used instead of tdecomps if specified
 * @param{TreeDicts} [tdi] - used instead of tdicts if specified
 * @returns{Tokens} - cutted s
 */
function cut(s, tde, tdi) {
	return Cut.cut(s, tde || tdecomps, tdi || tdicts);
}

/**
 * Tokenize wrapper using locally cached dicts.
 *
 * @param{string} s - string to cut
 * @param{TreeDicts} [td] - used instead of tdicts if specified
 * @returns{Tokens} - tokenized s
 */
function tokenize(s, td) {
	return Cut.tokenize([...s], td || tdicts)
}

/**
 * TODO: rename to emphasize markdown
 *
 * @param{string} s - string to parse as markdown
 * @param{TreeDicts} [td] - used instead of tdicts if specified
 * @returns{Array.<TokedChunk>} - array of tokenized chunks
 */
function parseandtok(s, td) {
	var [xs, e] = Markdown.parse(s);
	// TODO
	if (e) throw e;
	return xs.map(function(x) {
		return {
			t  : x.t,
			v  : x.v,
			ts : tokenize(x.v, td)
		};
	});
}

/**
 * Search dict entries matching given string/regexp.
 *
 * TODO: this could be made finer (e.g. get dict name alongside,
 * and automatically find that dict in tabs)
 *
 * TODO: tests
 *
 * @param{string} re - string|regular expression to look for.
 * @param{Object<string, Dict>} [ds] - optional dictionaries to use
 * @returns{Array<[string, string]>}
 */
function search(re, ds) {
//	let dbg_dict = dicts["cedict"];

	/** @type{Array<[string, string]>} */
	let rs = [];

	if (!ds) ds = dicts;

	// Deeeeep.
	Object.keys(ds).forEach(function(dn) {
		Object.keys(ds[dn]).forEach(function(w) {
			Object.keys(ds[dn][w]).forEach(function(p) {
				for (var i = 0; i < ds[dn][w][p].length; i++) {
					if (ds[dn][w][p][i].rm) continue;

					let d = dicts[dn][w][p][i].ds.join(" / ")
					if (d.match(re)) rs.push([w, d]);
				}
			});
		});
	});

	return rs.sort(function(a, b){return a[0].length - b[0].length});
}

/**
 * List words containing x as a component, either
 * directly or indirectly.
 *
 * TODO: tests
 *
 * TODO: rewrite using tdecomps?
 *
 * @param{string} x - string containing the component we're looking for
 * @param{Object.<string, Decomp>} [ds] - optional decomposition tables to use
 * @returns{Array<string>}
 */
function lscontains(x, ds) {
	/** @type{Array<string>} */
	let rs = [];

	let xs = x.trim().split(/ +/);

	if (!ds) ds = decomps;

	// cache[word] === true, false or undefined: if undefined,
	// we have to look it up, otherwise, we already did and
	// can use the cache.
	/** @type{Object.<string, boolean>} */
	let cache = {};

	/**
	 *
	 *
	 * XXX/TODO: strictly speaking, this is incorrect (but good
	 * enough for a first draft)
	 *
	 * NOTE: we're providing ds as a parameter here, because
	 * tsc(1) otherwise complains about it being potentially
	 * undefined, despite the previous "if".
	 *
	 * @param{Object.<string, Decomp>} ds
	 * @param{string} dn - decomposition table name (keys of ds)
	 * @param{string} w
	 * @returns{boolean}
	 */
	function checkword(ds, dn, w) {
		if (xs.length == 1 && xs[0] == w) return cache[w] = true;
		if (!(w in ds[dn])) return cache[w] = false;

		for (var i = 0; i < ds[dn][w].length; i++) {
			let ok = 0;
			for (var j = 0; j < ds[dn][w][i].c.length; j++) {
				if (!(ds[dn][w][i].c[j] in cache))
					checkword(ds, dn, ds[dn][w][i].c[j])
				if (cache[ds[dn][w][i].c[j]] === true)
					return cache[w] = true;
				for (var k = 0; k < xs.length; k++)
					if (xs[k] == ds[dn][w][i].c[j])
						ok++;
			}
			if (ok == xs.length)
				return cache[w] = true;
		}

		return cache[w] = false;
	}

	Object.keys(ds).forEach(function(dn) {
		Object.keys(ds[dn]).forEach(function(w) {
			checkword(ds, dn, w);
		});
	});

	for (let [k, v] of Object.entries(cache))
		if (v) rs.push(k)

	return rs.sort(function(a, b){return a.length - b.length});
}

/**
 * Return a textual definition for the given word from the
 * given dictionaries.
 * @param{string} w - string|regular expression to look for.
 * @param{Object.<string, Dict>} [ds] - optional dictionaries to use
 * @returns{string}
 */
function quickdef(w, ds) {
	/** @type{Array<string>} */
	let xs = [];

	if (!ds) ds = dicts;

	Object.keys(ds).forEach(function(dn) {
		if (!(w in ds[dn])) return;
		Object.keys(ds[dn][w]).forEach(function(p) {
			for (var i = 0; i < ds[dn][w][p].length; i++) {
				if (ds[dn][w][p][i].rm) continue;
				xs.push(...dicts[dn][w][p][i].ds)
			}
		});
	});

	return xs.join(" / ");
}

return {
	"init"        : init,
	"utf82big5"   : utf82big5,
	"mktdicts"    : mktdicts,
	"mktdecs"     : mktdecs,

	"cut"         : cut,
	"tokenize"    : tokenize,

	"search"      : search,
	"lscontains"  : lscontains,
	"quickdef"    : quickdef,

	"mget"        : mget,
	"parseandtok" : parseandtok,

	"parse"       : parse,
};

})();
