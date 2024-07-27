var User = (function() {

/**
 * User preferences.
 *
 * TODO: typing, per user preferences, preferences edition, etc.
 *
 * This is currently to get a rough idea of what we can/what to
 * achieve.
 *
 * @type{UserPrefs}
 */
var prefs = {
	"fonts" : [ "HanaMinA.woff2" ],

	// Don't we want potential multiple sources in case one fails? (similar
	// to imgs)
	"audio" : "allsetlearning.com",

	// Per book preferences
	"books" : {
		"father-serge-tolstoi" : {
			"tabs" : {
				"defaultdisplay" : ["russian", "links"],
				"word" : {
					"prependtext" : true,
					"single"      : false,
					"imgs"        : [],
				},
				"confs" : [
					// Decomposition are only stored in tabs[0];
					[
						{
							// XXX/TODO we need a non-empty name, cf. view/grid.js
							"name"   : "-",
							// @ts-ignore
							"type"   : TabType.Decomp,
							"decomp" : "-",
						},
						// XXX/TODO, cf './cut.js:/^function decompose\('
						{
							"name"   : "auto",
							// @ts-ignore
							"type"   : TabType.Decomp,
							"decomp" : "auto",
						},
					],
					[{
						"name"   : "russian",
						// @ts-ignore
						"type"   : TabType.Dict,
						"dict"   : "OpenRussian",
					}],
					[{
						"name"   : "links",
						// @ts-ignore
						"type"   : TabType.Links,
						"links"  : [
							"en.wiktionary.org",
//							"ru.wiktionary.org",
							"translate.google.com",
						],
					}],
				],
			},
		},
		"san-zi-jing-fr" :  {
			"tabs" : {
				"defaultdisplay" : ["defs", "anglais",  "links"],
				// TODO: make those optionals.
				"word" : {
					"prependtext" : true,
					"single"      : false,
					"imgs"        : [],
				},
				"confs" : [
					// Decomposition are only stored in tabs[0];
					[
						{
							"name"   : "auto",
							// @ts-ignore
							"type"   : TabType.Decomp,
							"decomp" : "auto",
						},
						{
							"name"   : "wikimedia",
							// @ts-ignore
							"type"   : TabType.Decomp,
							"decomp" : "WM-decomp",
						},
						{
							"name"   : "zm-decomp",
							// @ts-ignore
							"type"   : TabType.Decomp,
							"decomp" : "ZM-decomp",
						},
					],
					[
						{
							"name"   : "defs",
							// @ts-ignore
							"type"   : TabType.Dict,
							"dict"   : "CFDICT",
						},
						{
							"name"   : "anglais",
							// @ts-ignore
							"type"   : TabType.DictsChain,
							"dicts"  : ["CC-CEDICT", "ZM-add", "CC-CEDICT-singles"],
						},
					],
					[{
						"name"   : "說文",
						// @ts-ignore
						"type"   : TabType.NavDict,
						"dict"   : "WS-shuowen",
						"tabs"   : {
							"word" : {
								"prependtext" : true,
								"single"      : false,
								"imgs"        : [ "wm-seal" ],
							},
							"confs"          : undefined,
							// XXX/TODO: this is tricky: we can't have
							// default display starts with an activable tabs, as
							// this will break the purposes of activable tabs
							// by recursively enabling them.
							"defaultdisplay" : undefined, // ["說文", "links"],
						},
					}],

					[
						{
							"name"   : "imgs",
							// @ts-ignore
							"type"   : TabType.Imgs,
							"single" : true, // stop loading image once one succeeded.
							"imgs"   : [ "wm-bw-gif", "wm-red-static", "wm-bw-static" ],
						},
						{
							"name"   : "olds",
							// @ts-ignore
							"type"   : TabType.Imgs,
							"single" : false,
							"imgs"   : [ "wm-oracle", "wm-bronze", "wm-silk", "wm-seal", "wm-bigseal" ],
						},
					],
					[{
						"name"   : "links",
						// @ts-ignore
						"type"   : TabType.Links,
						"links"  : [
							"chinese-characters.org",
							"zhongwen.com",
							"en.wiktionary.org",
							"fr.wiktionary.org",
							"zdic.net",
							"...",
						],
					}],
				],
			},
		},
	},

	// TODO: rename as grid; rename confs below to tabs.
	"tabs"  : {
		"defaultdisplay" : ["defs",    "links"],
		// TODO: make those optionals.
		"word" : {
			"prependtext" : true,
			"single"      : false,
			"imgs"        : [],
		},
		"confs" : [
			// Decomposition are only stored in tabs[0];
			[
/*
				{
					// XXX/TODO we need a non-empty name, cf. view/grid.js
					"name"   : "-",
					// @ts-ignore
					"type"   : TabType.Decomp,
					"decomp" : "-",
				},
*/
				// XXX/TODO, cf './cut.js:/^function decompose\('
				{
					"name"   : "auto",
					// @ts-ignore
					"type"   : TabType.Decomp,
					"decomp" : "auto",
				},
				{
					"name"   : "wikimedia",
					// @ts-ignore
					"type"   : TabType.Decomp,
					"decomp" : "WM-decomp",
				},
				{
					"name"   : "zm-decomp",
					// @ts-ignore
					"type"   : TabType.Decomp,
					"decomp" : "ZM-decomp",
				},
/*
				{
					"name"   : "chise",
					// @ts-ignore
					"type"   : TabType.Decomp,
					"decomp" : "CHISE-ids",
				},
*/

			],
			[
				{
					"name"   : "defs",
					// @ts-ignore
					"type"   : TabType.DictsChain,
					"dicts"  : ["CC-CEDICT", "ZM-add", "CC-CEDICT-singles"],
				},
/*
				{
					"name"   : "french",
					// @ts-ignore
					"type"   : TabType.Dict,
					"dict"   : "CFDICT",
				},
				{
					"name"   : "deutsch",
					// @ts-ignore
					"type"   : TabType.Dict,
					"dict"   : "HanDeDict",
				},
*/
				{
					"name"   : "pict",
					// @ts-ignore
					"type"   : TabType.Dict,
					"dict"   : "ZM-pict",
				}

			],
			[{
				"name"   : "說文",
				// @ts-ignore
				"type"   : TabType.NavDict,
				"dict"   : "WS-shuowen",
				"tabs"   : {
					"word" : {
						"prependtext" : true,
						"single"      : false,
						"imgs"        : [ "wm-seal" ],
					},
					"confs"          : undefined,
					// XXX/TODO: this is tricky: we can't have
					// default display starts with an activable tabs, as
					// this will break the purposes of activable tabs
					// by recursively enabling them.
					"defaultdisplay" : undefined, // ["說文", "links"],
				},
			}],

			[
				{
					"name"   : "imgs",
					// @ts-ignore
					"type"   : TabType.Imgs,
					"single" : true, // stop loading image once one succeeded.
					"imgs"   : [ "wm-bw-gif", "wm-red-static", "wm-bw-static" ],
				},
				{
					"name"   : "olds",
					// @ts-ignore
					"type"   : TabType.Imgs,
					"single" : false,
					"imgs"   : [ "wm-oracle", "wm-bronze", "wm-silk", "wm-seal", "wm-bigseal" ],
				},
			],
			[{
				"name"   : "links",
				// @ts-ignore
				"type"   : TabType.Links,
				"links"  : [
					"chinese-characters.org",
					"zhongwen.com",
					"en.wiktionary.org",
					"zdic.net",
					"...",
				],
			}],
		],
	},
};

/**
 * Override prefs
 *
 * @param{UserPrefs} p
 */
function setprefs(p) { prefs = p; }

/**
 * Convenience reduce over all tab preferences.
 *
 * @template T
 * @param{(T : acc, c : TabItmConf) => T} f - folding function
 * @param{TabItmsConfs} p - tab's configurations
 * @param{T} acc - initial accumulator value
 *
 * @returns{T}
 */
function foldtabsprefs(f, p, acc) {
	return p.reduce(function(acc, tc) {
		return tc.reduce(f, acc);
	}, acc)
}

/**
 * Retrieve the names (unique) of the data being referenced
 * by the given preferences.
 *
 * TODO: tests.
 * TODO: big5 table added systematically; we could at least guess
 * if we really need it, or find some clever ways to handle it.
 *
 * @param{UserPrefs} [p] - defaults to prefs
 * @returns{string[]}
 */
function getnames(p) {
	if (!p) p = prefs;

	// XXX mainly for unit tests.
	// TODO: should we use some default instead?
	if (!("tabs" in p))       return ["Unicode-BIG5"];
	if (!("confs" in p.tabs)) return ["Unicode-BIG5"];

	/**
	 * @type{(acc : Object.<string, boolean>, c : TabItmConf) => Object.<string, boolean>}
	 */
	function aux(acc, c) {
		if (c.type == TabType.Dict || c.type == TabType.NavDict) {
			if (!("dict" in c) || c.dict === undefined) {
				Assert.assert("dict tab config has no dict entry: "+c.name);
				return acc;
			}
			acc[c.dict] = true;
		}
		if (c.type == TabType.DictsChain) {
			if (!("dicts" in c) || c.dicts === undefined) {
				Assert.assert("dicts tab config has no dict entry: "+c.name);
				return acc;
			}
			c.dicts.forEach(function(x) { acc[x] = true; });
		}

		if (c.type == TabType.NavDict && c.tabs)
			foldtabsprefs(aux, c.tabs.confs || [], acc)

		// tweak for dummy entry should be removable at some point
		// XXX auto in tests, but all those code will be retouched soon
		if (c.type == TabType.Decomp && c.decomp && c.decomp != '-' && c.decomp != "auto")
			acc[c.decomp] = true;

		return acc;
	}

	return Object.keys(foldtabsprefs(aux, p.tabs.confs || [], {
		"Unicode-BIG5" : true,
	})).sort();
}

/**
 * Uniquely fold on all tab preferences of given type.
 * Uniqueness is because the same data can be referenced
 * multiple times.
 *
 * XXX/TODO: this is clumsy.
 *
 * @template T
 * @param{(T : acc, c : TabItmConf) => T} f - folding function
 * @param{boolean} dec - if true, execute f on decomp entries; if false, on non-decomp entries
 * @param{TabItmsConfs} conf
 * @param{T} acc - initial accumulator value
 * @returns{T}
 */
function ufoldt(f, dec, conf, acc) {
	/**
	 * Do not go through the same data element multiple
	 * times; name is assumed unique.
	 *
	 * @type{Object<string, boolean>}
	 */
	var seen = {};

	return foldtabsprefs(
		/**
		 * @param{T} acc
		 * @param{TabItmConf}   c
		 * @returns{T}
		 */
		function(acc, c) {
			if (seen[c.name])                     return acc;
			if (dec  && c.type != TabType.Decomp) return acc;
			if (!dec && c.type == TabType.Decomp) return acc;
			return f(acc, c);
		}, conf, acc);
}

return {
	"prefs"    : prefs,
	"ufoldt"   : ufoldt,
	"getnames" : getnames,
	"setprefs" : setprefs,
};

})();