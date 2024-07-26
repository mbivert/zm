let SVarType = {
	Number : 0,
	String : 1,
};

let ChunkType = {
	Invalid          : -1,
	Paragraph        : 0,
	Title            : 1,
	Section          : 2,
	Subsection       : 3,
	Subsubsection    : 4,
	Subsubsubsection : 5,
};

let MoveDir = {
	Offset : "offset",
	Next   : "next",
	Prev   : "prev",
};

let MoveWhat = {
	Word             : "word",
	Piece            : "piece",
	Chunk            : "chunk",
	Title            : "title",         // A bit weird; that's basically a move to start.
	Section          : "section",
	Subsection       : "subsection",
	Subsubsection    : "subsubsection",
	Subsubsubsection : "subsubsubsection",
};

let TokenType = {
	Punct   : 0,
	Chinese : 1,
	Foreign : 2,
	Pinyin  : 3,
	Word    : 4, // NEW; to replace Chinese/Foreign
	EOF     : 5,
};

let TabType = {
	Decomp        : "decomp",
	Dict          : "dict",
	NavDict       : "navdict",
	Imgs          : "imgs",
	Links         : "links",
	DictsChain    : "dicts-chain",
	DecompsChain  : "decomps-chain", //  TODO global s/decomps/decs/
};

let DataType = {
	Dict   : "dict",
	Decomp : "decomp",
	Big5   : "big5",
	Book   : "book",
};

let DataFmt = {
	CEDict          : "cc-cedict",
	WMDecomp        : "wm-decomp",
	Chise           : "chise",
	UnicodeBig5     : "unicode-big5",
	Markdown        : "markdown",
	SWMarkdown      : "sw-markdown", // temporary, to be removed
	SimpleDict      : "simple-dict",
};

let DecompType = {
	// u u Reserved
	Unknown      : 0,

	/// ISO 10646
	// 吅	⿰	0x2FF0	IDC LEFT TO RIGHT	IDC2	A
	CnLeftToRight  : 1,

	// 吕	⿱	0x2FF1	IDC ABOVE TO BELOW	IDC2	B
	CnAboveToBelow : 2,

	// 罒	⿲	0x2FF2	IDC LEFT TO MIDDLE AND RIGHT	IDC3	K
	CnLeftToMiddleAndRight : 3,

	// 目	⿳	0x2FF3	IDC ABOVE TO MIDDLE AND BELOW	IDC3	L
	CnAboveToMiddleAndBelow : 4,

	// 回	⿴	0x2FF4 	IDC FULL SURROUND	IDC2	I
	CnFullSurround : 5,

	// 冂	⿵	0x2FF5 	IDC SURROUND FROM ABOVE	IDC2	F
	CnSurroundFromAbove : 6,

	// 凵	⿶	0x2FF6 	IDC SURROUND FROM BELOW	IDC2	G
	CnSurroundFromBelow : 7,

	// 匚	⿷	0x2FF7 	IDC SURROUND FROM LEFT	IDC2	H
	CnSurroundFromLeft : 8,

	// 厂	⿸	0x2FF8 	IDC SURROUND FROM UPPER LEFT	IDC2	D
	CnSurroundFromUpperLeft : 9,

	// 勹	⿹	0x2FF9 	IDC SURROUND FROM UPPER RIGHT	IDC2	C
	CnSurroundFromUpperRight : 10,

	// 匕	⿺	0x2FFA	IDC SURROUND FROM LOWER LEFT	IDC2	E
	CnSurroundFromLowerLeft : 11,

	// .	⿻	0x2FFB	IDC OVERLAID	IDC2	J
	CnOverlaid : 12,

	/// Wikimedia table extension
	/// Similar patterns are identified in CHISE data, only with different symbols
	/// E.g. 一 is used by CHISE
	// 一	一	Graphical primitive, non composition (second character is always *)
	CnWmPrimitive : 13,

	// 咒	⿱⿰	Vertical composition, the top part being a repetition.
	CnWmAboveTwiceToBelow : 14,

	// 弼		Horizontal composition of three, the third being the repetition of the first.
	CnWmLeftToMiddleToLeft : 15,

	// 品		Repetition of three.
	CnWmThrice : 16,

	// 叕		Repetition of four.
	CnWmQuarce : 17,

	// 冖		Vertical composition, separated by "冖".
	CnWmVerticalCover : 18,

	// ?		Unclear, seems compound but ...
	CnWmUnclear : 19,

	// +		Graphical superposition or addition.
	CnWmSuperpos : 20,

	// *		[!] Assuming WIP; undocumented
	CnWmWIP : 21,

	/// Ours
	// a a Auto	Automatic decomposition through dictionaries.
	Auto        : 22,
};

let Assert = (function() {
/**
 * Convenient wrapper to unify assertions,
 * easing their localisation.
 *
 * Assertions are currently provided as a temporary
 * measure against incorrect or impossible typing,
 * or unimplemented features.
 *
 *	@param{string}  s   - assertion message
 *	@param{boolean} [b] - assertion fails if false/undefined
 *
 *	@returns{void}
 */
function assert(s, b) {
	console.assert(b, "assert(): "+s);
	if (!b) {
		try { alert("assert(): "+s); } catch(e) {};
		throw "assert(): "+s;
	}
}

return {
	"assert" : assert,
};

})();
let Attrs = (function() {
/**
 * Special attributes for internal use.
 *
 * TODO: I've removed a few of those already, but it's likely
 * that they are almost all useless since the last view rework.
 */
return {
	"currentitm" : "zhongmu-current-item",
	"itmscount"  : "zhongmu-items-count",

	"pinyins"    : "zhongmu-pinyins",
}
})();
/*
 * Code to load/dump an object to a string (bookmark),
 *
 * In practice, the object is a Moveable+display, and we're
 * dumping enough state data to be able to reconstruct the
 * page from the bookmark.
 *
 * This allows to share an exact page through URL sharing, as
 * the bookmark is stored in the URL's hash. Practically speaking,
 * there's a lot of space there to store data:
 *	https://stackoverflow.com/a/417184
 *
 * []SVarDescr encodes the typed state variables and how
 * to load/dump them from/to the bookmark.
 *
 * Available variables types are all defined here in svars.
 */

let Bookmark = (function() {
/**
 * State variables type: how to load/dump then from/to
 * a string, as retrieved from a URL hash.
 *
 * @type{Object.<SVarType, SVarLD>}
 */
let svars = {
	[SVarType.Number] : {
		/** @type{(s : string) => number|undefined } */
		"load" : function(s)  {
			var n = parseInt(s); return isNaN(n) || n < 0 ? undefined : n
		},
		/** @type{(x : number) => string } */
		"dump" : function(x)  { return x.toString(); },
	},
	[SVarType.String] : {
		/** @type{(s : string) => string } */
		"load" : function(s) { return s; },

		/** @type{(s : string) => string } */
		"dump" : function(s) { return s; },
	}
};

/**
 * Pre-parse a hash/dump string.
 *
 * Input:
 *	@param{string} s - hash/dump string
 * Output:
 *	@returns{Object.<string, string>} - hash mapping name to unparsed values
 */
function preload(s) {
	return s === "" ? {} : s.split(/;/).reduce(
		/**
		 * @param{Object.<string, string>} xs
		 * @param{string}                  x
		 * @returns{Object.<string, string>}
		 */
		function(xs, x) {
			let [n, v] = x.split(/=/);
			xs[n] = decodeURIComponent(v);
			return xs;
	}, {});
}

/**
 * Load a given hash/dump string.
 *
 * Input:
 *	@param{Object.<any, any>} o   - state object
 *	@param{Array.<SVarDescr>} ss  - state variable descriptions
 *	@param{string}            [b] - hash/dump string
 * Output:
 *	@returns{Object} - o altered (in-place)
 */
function load(o, ss, b) {
	if (b === undefined) b = (document.location.hash || "#").slice(1);

	let xs = preload(b);
	return ss.reduce(function(o, s) {
		if (!(s.bn in xs)) return o;
		let v = svars[s.type].load(xs[s.bn]);
		Assert.assert("Bookmark.load(): "+s.bn+" cannot be parsed ("+xs[s.bn]+")", v !== undefined);
		return Utils.deepset(o, s.sn, v);
	}, o);
}

/**
 * Dump a given state object.
 *
 * Input:
 *	@param{Object.<any, any>} o  - state object
 *	@param{Array.<SVarDescr>} ss - state variable descriptions
 * Output:
 *	@returns{string} - o dumped as a string
 */
function dump(o, ss) {
	return ss.reduce(function (acc, s) {
		let v = Utils.deepget(o, s.sn);
		if (v === null) return acc;
		let w = svars[s.type].dump(v);

		// NOTE: mistakes happened.
		if (typeof w != "string") {
			Assert.assert("Bookmark.dump(): "+s.sn+" is not a string/number");
			return acc;
		}

		Assert.assert("Bookmark.dump(): "+s.sn+" contains a '='", !w.includes("="));
		Assert.assert("Bookmark.dump(): "+s.sn+" contains a ';'", !w.includes(";"));
		return (acc ? acc + ";" : "") + s.bn + "=" + w;
	}, "");
}

return {
	"preload" : preload,
	"load"    : load,
	"dump"    : dump,
};
})();
let Classes = (function() {
/*
 * This module only contain and export (HTML/CSS) class names
 * that are used throughout the codebase.
 *
 * Originally (cf. '../README.md:/^# History'), this was to
 * allow class names to be altered for the now abandonned browser
 * extension. Note that not all classes were used in the
 * extension: a bunch were added in later versions.
 *
 * Such classes are used to provide not specific CSS styling,
 * but also UI features.
 *
 * NOTE/TODO: Some of those have been deprecated already, some
 * seems to now be useless: all have been marked with a "TODO".
 */

return {
	/**
	 * Used to make clickable words that can be pushed on
	 * a stack and inspected. We register events handlers
	 * for those (Dom.alisten())
	 */
	"defword"      : "zhongmu-def-word",
	/**
	 * Same as before, but those allow to take a word already
	 * being inspected, and to start inspecting it again on the
	 * stack. This is because we have less space as we go down
	 * in the decomposition tree.
	 */
	"defwordtop"   : "zhongmu-def-word-top",

	/**
	 * A horizontal cut. There's a CSS rule for it, but the
	 * class is never assigned (TODO; see ../site/base/show.css:/hcut).
	 */
	"hcut"         : "zhongmu-hcut",

	/**
	 * A list of vertical cuts. Currently used only for CSS
	 * rules; see ../site/base/show.css:/vcuts.
	 */
	"vcuts"        : "zhongmu-vcuts",

	/**
	 * A vertical cut. Currently used only for CSS
	 * rules; see ../site/base/show.css:/vcut.
	 */
	"vcut"         : "zhongmu-vcut",

	/**
	 * The word part of a vcut. There's a CSS rule, but
	 * the class isn't applied in view.js TODO
	 */
	"word"         : "zhongmu-word",

	/**
	 * The word part of a vcut is itself separated in multiple
	 * elements. The wordtext corresponds to the actual word, ...
	 */
	"wordtext"     : "zhongmu-word-text",

	/**
	 * while the wordtextsup is a <sup></sup> containing
	 * the defwordtop that we aluded to earlier.
	 */
	"wordtextsup"  : "zhongmu-word-text-sup",

	/**
	 * The descr part of a hcut.
	 */
	"descr"        : "zhongmu-descr",

	/**
	 * And the decomps part of a hcut.
	 * TODO: the class seems to be set, but no CSS rules nor
	 * logic associated to them anymore.
	 */
	"decomps"      : "zhongmu-decomps",

	/**
	 * The descr part of a hcut contains an element which
	 * is the actual content of the descr: the descrcontent.
	 */
	"descrcontent" : "zhongmu-descr-content",

	/**
	 * Aside of the descrcontent, we have the descrheader,
	 * located above, which contains all the tab items.
	 */
	"descrheader"  : "zhongmu-descr-header",

	/**
	 * The decword are <a></a> on which an event handler
	 * can be registered (Dom.alisten()): those are the words
	 * located on the stack whcih can be decomposed when
	 * being clicked.
	 */
	"decword"      : "zhongmu-dec-word",

	/**
	 * Set to stroke images, but apparently for any images actually
	 * (e.g. old scripts); so TODO: rework the name.
	 * There's a CSS rule associated to it.
	 */
	"strokesimg"   : "zhongmu-strokes-img",

	/**
	 * In the header of a hcut, a tabitms is a collection
	 * of tabitm: it's essentially the rotating-header for
	 * a single "tab" of the header.
	 *
	 * Hence the header contains a list of tabitms, one
	 * per tab.
	 */
	"tabitms"      : "zhongmu-tab-items",

	/**
	 * A single tab-itm, stored under a tabitms.
	 */
	"tabitm"       : "zhongmu-tab-item",

	/**
	 * Class which can be set on a tabitms indicating
	 * whether the tabitm is being active.
	 *
	 * TODO: this is correctly set/unset, but currently unused
	 * (no CSS rules). IIRC, there's a todo entry about making
	 * it a more visible.
	 */
	"tabactive"    : "zhongmu-tab-active",

	/**
	 * This is set on the "sound entry" of a dictionary, aka
	 * the pinyin so far. An event handler is registered to
	 * play the corresponding audio file.
	 */
	"audio"        : "zhongmu-audio",

	/**
	 * Used on the index page: it's the definition associated to
	 * a dict entry that has been searched (using the "Search" button).
	 */
	"searchdefs"   : "zhongmu-search-defs",

	/**
	 * Probably for the ToC x button: there's a CSS rule, but
	 * it's never set: we should now be using the generic modal
	 * "component" for the ToC, so it's likely that this can
	 * be trimmed (TODO)
	 */
	"tocclose"     : "zhongmu-toc-close",

	/**
	 * This now seems to be unused. TODO
	 */
	"toccontent"   : "zhongmu-toc-content",

	/**
	 * Used to register click handlers so as to navigate
	 * in the book via the ToC.
	 */
	"tocentry"     : "zhongmu-toc-entry",

	/**
	 * Element containing the ToC title ("目錄"). Currently
	 * unused (TODO)
	 */
	"toctitle"     : "zhongmu-toc-title",

	/**
	 * TODO: there's a CSS rule associated to this; from a comment,
	 * used to be set on psrc (mkbasicccc()). See if still relevant.
	 */
	"navigateable" : "zhongmu-navigateable",

	/**
	 * Used to style the element containing the navigation buttons
	 * in a book/translated book.
	 */
	"navbtns"      : "zhongmu-nav-btns",

	/**
	 * Single nav that are within a decomposition (e.g. Shuowen)
	 */
	"subsinglenav" : "zhongmu-sub-single-nav",

	/**
	 * Both of those are used when zm is used as an external
	 * lib, to decompose characters on external websites: respectively
	 * for:
	 *	- a single navigation component;
	 *	- a single word component.
	 */
	"singlenav"    : "zhongmu-single-nav",
	"singleword"   : "zhongmu-single-word",

	/**
	 * Highlight current word.
	 */
	"hlcw"         : "zhongmu-hl-cw",

	/**
	 * Highlight current piece.
	 */
	"hlcp"         : "zhongmu-hl-cp",

	/**
	 * Matching even pieces
	 */
	"okep"         : "zhongmu-ok-ep",
	/**
	 * Matching odd pieces
	 */
	"okop"         : "zhongmu-ok-op",
	/**
	 * Mismatching even pieces
	 */
	"koep"         : "zhongmu-ko-ep",
	/**
	 * Mismatching odd pieces.
	 */
	"koop"         : "zhongmu-ko-op",
};

})();
let Config = (function() {

return {
	/** @type{string} */
	"root"    : "",

	/** @type{number} */
	"version" : 1722034145,
};

})();
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
/* Automatically generated; see ../Makefile & ../bin/mkdbjs.sh */
let DB = (function() {

// Improperly typed because of enums
// @ts-ignore
var datas = [
  {
    "Id": 1,
    "Name": "CC-CEDICT",
    "Type": "dict",
    "Descr": "Chinese/English dictionary",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\r\\n\",cols:[0]}",
    "File": "data/dict/cc-cedict.csv.gz",
    "UrlInfo": "https://cc-cedict.org/wiki/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 2,
    "Name": "ZM-add",
    "Type": "dict",
    "Descr": "Additional CC-CEDICT, mainly \"archaic\" entries",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\n\",cols:[0]}",
    "File": "data/dict/zm-add.csv.gz",
    "UrlInfo": "https://zhongmu.eu/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 3,
    "Name": "CC-CEDICT-singles",
    "Type": "dict",
    "Descr": "Single-character CC-CEDICT entries only registered as simplified",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\n\",cols:[0]}",
    "File": "data/dict/cc-cedict-singles.csv.gz",
    "UrlInfo": "https://zhongmu.eu/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 4,
    "Name": "CHISE-ids",
    "Type": "decomp",
    "Descr": "CHISE UCS IDs",
    "Fmt": "chise",
    "FmtParams": "",
    "File": "data/decomp/chise.csv.gz",
    "UrlInfo": "http://chise.org",
    "License": "GPLv2",
    "UrlLicense": "https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html"
  },
  {
    "Id": 5,
    "Name": "ZM-pict",
    "Type": "dict",
    "Descr": "Pictographic descriptions",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\n\",cols:[0]}",
    "File": "data/dict/zm-pict.csv.gz",
    "UrlInfo": "https://zhongmu.eu/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 6,
    "Name": "WM-decomp",
    "Type": "decomp",
    "Descr": "WikiMedia graphical decomposition table",
    "Fmt": "wm-decomp",
    "FmtParams": "",
    "File": "data/decomp/wm-decomp.csv.gz",
    "UrlInfo": "https://commons.wikimedia.org/wiki/Commons:Chinese_characters_decomposition",
    "License": "CC BY-SA 3.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/3.0/"
  },
  {
    "Id": 7,
    "Name": "Unicode-BIG5",
    "Type": "big5",
    "Descr": "unicode.org s utf8/big5 correspondance table",
    "Fmt": "unicode-big5",
    "FmtParams": "",
    "File": "data/big5/big5.csv.gz",
    "UrlInfo": "https://unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/OTHER/BIG5.TXT",
    "License": "Unicode ToS",
    "UrlLicense": "https://www.unicode.org/copyright.html"
  },
  {
    "Id": 8,
    "Name": "Shuowen Jiezi, book (Wikisource)",
    "Type": "book",
    "Descr": "WikiSource version of the ShuoWen JieZi",
    "Fmt": "markdown",
    "FmtParams": "",
    "File": "data/books/shuowen",
    "UrlInfo": "https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97",
    "License": "CC0 1.0",
    "UrlLicense": "https://creativecommons.org/publicdomain/zero/1.0/"
  },
  {
    "Id": 9,
    "Name": "WS-shuowen",
    "Type": "dict",
    "Descr": "WikiSource version of the ShuoWen JieZi",
    "Fmt": "sw-markdown",
    "FmtParams": "",
    "File": "data/dict/ws-shuowen.csv.gz",
    "UrlInfo": "https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97",
    "License": "CC0 1.0",
    "UrlLicense": "https://creativecommons.org/publicdomain/zero/1.0/"
  },
  {
    "Id": 10,
    "Name": "CFDICT",
    "Type": "dict",
    "Descr": "Chinese/French dictionary",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\r\\n\",cols:[0]}",
    "File": "data/dict/cfdict.csv.gz",
    "UrlInfo": "https://chine.in/mandarin/dictionnaire/CFDICT/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 11,
    "Name": "HanDeDict",
    "Type": "dict",
    "Descr": "Chinese/German dictionary",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\r\\n\",cols:[0]}",
    "File": "data/dict/handedict.csv.gz",
    "UrlInfo": "https://handedict.zydeo.net/",
    "License": "CC BY-SA 2.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/2.0/"
  },
  {
    "Id": 12,
    "Name": "Bai Jia Xing",
    "Type": "book",
    "Descr": "Bai Xia Jing",
    "Fmt": "markdown",
    "FmtParams": "",
    "File": "data/books/bai-jia-xing",
    "UrlInfo": "https://www.gutenberg.org/files/25196/25196-0.txt",
    "License": "Gutenberg license",
    "UrlLicense": "http://gutenberg.org/license"
  },
  {
    "Id": 13,
    "Name": "Qian Zi Wen",
    "Type": "book",
    "Descr": "Qian Zi Wen",
    "Fmt": "markdown",
    "FmtParams": "",
    "File": "data/books/qian-zi-wen",
    "UrlInfo": "https://zh.wikisource.org/wiki/%E5%8D%83%E5%AD%97%E6%96%87",
    "License": "CC0 1.0",
    "UrlLicense": "https://creativecommons.org/publicdomain/zero/1.0/"
  },
  {
    "Id": 14,
    "Name": "San Zi Jing",
    "Type": "book",
    "Descr": "San Zi Jing (Herbert Giles, ctext.org)",
    "Fmt": "markdown",
    "FmtParams": "",
    "File": "data/books/qian-zi-wen",
    "UrlInfo": "https://ctext.org/three-character-classic",
    "License": "CC0 1.0",
    "UrlLicense": "https://creativecommons.org/publicdomain/zero/1.0/"
  },
  {
    "Id": 15,
    "Name": "OpenRussian",
    "Type": "dict",
    "Descr": "Russian to English (and Deustch) dictionary",
    "Fmt": "simple-dict",
    "FmtParams": "",
    "File": "data/dict/openrussian.csv.gz",
    "UrlInfo": "https://en.openrussian.org/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 16,
    "Name": "ZM-decomp",
    "Type": "decomp",
    "Descr": "Additional decompositions to wikimedia data",
    "Fmt": "wm-decomp",
    "FmtParams": "",
    "File": "data/decomp/zm-decomp.csv.gz",
    "UrlInfo": "https://zhongmu.eu/",
    "License": "CC BY-SA 3.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/3.0/"
  },
  {
    "Id": 17,
    "Name": "CFDICT-singles",
    "Type": "dict",
    "Descr": "Single-character CFDICT entries only registered as simplified",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\n\",cols:[0]}",
    "File": "data/dict/cfdict-singles.csv.gz",
    "UrlInfo": "https://zhongmu.eu/",
    "License": "CC BY-SA 4.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    "Id": 18,
    "Name": "HanDeDict-singles",
    "Type": "dict",
    "Descr": "Single-character HanDeDict entries only registered as simplified",
    "Fmt": "cc-cedict",
    "FmtParams": "{eol:\"\\n\",cols:[0]}",
    "File": "data/dict/cc-cedict-singles.csv.gz",
    "UrlInfo": "https://zhongmu.eu/",
    "License": "CC BY-SA 2.0",
    "UrlLicense": "https://creativecommons.org/licenses/by-sa/2.0/"
  },
  {
    "Id": 19,
    "Name": "Art of war (partial)",
    "Type": "book",
    "Descr": "Sun-Tzu s Art of war",
    "Fmt": "markdown",
    "FmtParams": "",
    "File": "data/books/art-of-war",
    "UrlInfo": "https://ctext.org/art-of-war/",
    "License": "CC0 1.0",
    "UrlLicense": "https://creativecommons.org/publicdomain/zero/1.0/"
  }
]
return { "datas" : datas, };
})();
let Dom = (function() {
/**
 * Basic utilities to simplify DOM management.
 */

/**
 * Display the element pointed by x.
 *
 * @param{HideableHTMLElement} x - (pointer) to DOM node.
 * @returns{HTMLElement} - x
 */
function show(x) {
	x.style.display = x.oldDisplay || '';
	return x
}

/**
 * Show the x's first child.
 *
 * @param{HTMLElement} x
 * @param{string}      [c] - optional class to assign to c
 * @returns{HTMLElement} - x
 */
function showfirst(x, c) {
	if (x.firstElementChild)
		show(/** @type{HTMLElement} */ (x.firstElementChild));
	return x;
}

/**
 * Is x displayed?
 *
 * @param{HideableHTMLElement} x - (pointer) to DOM node.
 * @returns{boolean}
 */
function isshown(x) { return x.style.display != 'none'; }

/**
 * Hides the element pointed by x.
 *
 * @param{HideableHTMLElement} x - (pointer) to DOM node.
 * @returns{HTMLElement} - x
 */
function hide(x) {
	if (isshown(x)) {
		x.oldDisplay    = x.style.display;
		x.style.display = 'none';
	}

	return x
}

/**
 * Hides x's children.
 *
 * @param{HTMLElement} x
 * @returns{HTMLElement} - x
 */
function hidechildren(x) {
	for (let i = 0; i < x.children.length; i++)
		hide(/** @type{HideableHTMLElement} */ (x.children[i]));
	return x;
}

/** @type{HideableHTMLElement | undefined} */
// var ploading = document.getElementById("loading") || undefined;

/**
 * Show the "loading" element.
 *
 * @returns{void}
 */
function loading() { let ploading = getbyid("loading"); if (ploading) show(ploading); }

/**
 * Hide the "loading" element.
 *
 * @returns{void}
 */
function loaded()  { let ploading = getbyid("loading"); if (ploading) hide(ploading); }

/**
 * Create a <span> with given text content.
 *
 * @param{string} [t] - <span>'s text
 * @param{string} [c] - class
 *
 * @returns{HTMLElement} - <span> element containing given text.
 */
function mkspan(t, c) { return mke("span", t, c); }

/**
 * Create a <element> with given text content.
 *
 * @param{string} n   - element name (span, div, etc.)
 * @param{string} [t] - innerText
 * @param{string} [c] - className
 *
 * @returns{HTMLElement} - <span> element containing given text.
 */
function mke(n, t, c) {
	let x = document.createElement(n);
	if (t !== undefined) x.innerText = t;
	if (c !== undefined) x.className = c;
	return x;
}

/**
 * Recursively create HTML for a ToC.
 *
 * @param{ToC} cs
 * @returns{HTMLElement}
 */
function mktoc(cs) {
	let x = document.createElement("ul");
	for (let i = 0; i < cs.length; i++) {
		let y = document.createElement('li');
		y.appendChild(mka(cs[i].v, Classes.tocentry, "#c="+cs[i].ic));
		y.append(mktoc(cs[i].cs));
		x.appendChild(y);
	}
	return x;
}

/**
 * Put a separating dash in a span.
 *
 * @returns{HTMLElement} <span> element containing a dash.
 */
function mkdash() { return mkspan(" - "); }

/**
 * Create <a> with given class. Links point to
 * h if specified, # otherwise.
 *
 * This is often used for links behaving as buttons,
 * hence the defaults.
 *
 * @param{string} t   - link's text
 * @param{string} [c] - link's class      [default: ""]
 * @param{string} [h] - link's URL (href) [default: "#"]
 * @param{string} [i] - link's title      [default: "" ]
 *
 * @returns{HTMLElement} - <a> element with given properties.
 */
function mka(t, c, h, i) {
	let x       = document.createElement("a");
	x.innerText = t;
	x.className = c || "";
	x.href      = h || "#";
	x.title     = i || "";

	return x;
}

/**
 * Creates a <select> from the given options.
 *
 * @param{Array<[string, string]>} xs  - text/values of the <option>s
 *
 * @returns{HTMLSelectElement}
 */
function mkselect(xs) {
	let p = document.createElement("select");
	for (let i = 0; i < xs.length; i++) {
		let q = document.createElement("option")
		q.value     = xs[i][0];
		q.innerText = xs[i][1];
		p.appendChild(q)
	}

	return p;
}

/**
 * Listen on click for "fake" '<a>' elements with a
 * given class.
 *
 * TODO: <a> perhaps should be stylized <buttons>, see
 * also ':/^function mka\('
 *
 * @param{string}                c - class on which we want to registers click events.
 * @param{(e : PointerEvent) => (boolean|void)} f - event handler
 * @param{HTMLElement}           p - where to attach handler [default: document]
 *
 * @returns{void}
 */
function alisten(c, f, p) {
	/*
	 * NOTE: p used to be an optional parameter, that would default
	 * to document. However, because of the SPA, we don't want listeners
	 * to persists upon page changes. We can't use getbyid("main")
	 * either, because usually when we register events, we're
	 * still building the page, and the current id="main" is the
	 * old page to be replaced.
	 */

	p.addEventListener("click",
		/** @type{(e : Event) => (boolean)} */
		function(e) {
			if (!(e.target instanceof HTMLElement)) return true;
			if (!(e instanceof PointerEvent))       return true;
			if (!e.target.classList.contains(c))    return true;

			let b;
			// TODO: this should work, but things are expected to break
			e.preventDefault(); if ((b = f(e)) === false) e.stopPropagation();
			return b || false;
		}
	);
}

/**
 * Assuming n points to a DOM node, and contains
 * a piece of text, as its siblings, compute
 * the number of utf8 characters find in all
 * preceeding siblings.
 *
 * NOTE: see also counttextoffset()
 * NOTE: naming is a bit weird but matches the fact that
 * we're using pieces in trbook. We'll rework all this
 * code later.
 *
 * NOTE: there used to be a bug between countpieceoffset()
 * and counttextoffset() due to how newlines were counted.
 *
 * @param{Element}  n - pointer to DOM node.
 * @returns{number} - Total number of utf8 characters from all
 *                    n's siblings located before n.
 */
function countpieceoffset(n) {
	var i = 0;
	/** @type{Element|null} */
	var m = n;

	while (m = m.previousElementSibling)
		// NOTE: we *want* .innerText over .textContent, as
		// .textContent doesn't contain newlines for instance.
		i += [...(( /** @type{HTMLElement} */(m)).innerText || "")].length;

	return i;
}

/**
 * Assuming n points to a DOM node, and contains
 * a piece of text, as its siblings, compute
 * the number of utf8 characters find in all
 * preceeding siblings.
 *
 * NOTE: We likely could have replace countpieceoffset()
 * with counttextoffset(), but we prefer to be cautious.
 *
 * We do not iterate on Element because e.g. in the Shuowen,
 * our psrc contain a few <br>: psrc does not as such contain
 * a single Text node, but a collection of them, and the offset
 * we get from selection is relative to the text node being
 * clicked, and needs to be made relative to that collections
 * of text node before we can make it relative to something else.
 *
 * Also at some point we'll remove the distinctions between
 * book and trbook, and likely, will use a single function to
 * render current chunk, even for index, just with convenient
 * classes.
 *
 * @param{Node}   n - pointer to DOM node.
 * @returns{number} - Total number of utf8 characters from all
 *                    n's siblings located before n.
 */
function counttextoffset(n) {
	var i = 0;
	/** @type{Node|null} */
	var m = n;

	// confident we have no comments or weird stuff here.
	while (m = m.previousSibling) {
		if (!m.textContent && m.nodeName == 'BR') i++;
		// Nodes (not Element) have no .innerText, only .textContent
		else i += [...(m.textContent || "")].length;
	}

	return i;
}


/**
 * When clicking on psrc/ptr, convert the click position
 * into a character offset relative to current chunk, whether
 * in ptr/psrc, *if possible*
 *
 * We rely on window.getSelection() on a click event
 * to find the offset.
 *
 * The selection works on caret rather than characters,
 * works on Text nodes, not Element, and is theoretically
 * conceived to span multiple (Text) nodes.
 *
 * As a consequence, the anchorNode (start of the selection)
 * pointed by the selection doesn't always match the target
 * of the event, e.g. clicking on the first part of the first
 * character of a piece: event's target is the piece containing
 * the character, while the anchorNode is the previous piece.
 *
 * It follows that the anchorOffset, which is computed for
 * the anchorNode, won't naturally works with e.target.
 *
 * Furthermore, the current piece of the source is a special
 * case, as it isn't wrapped in a single <span> like all the
 * others. It requires ajustement to get the <span> covering
 * the piece, and further adjustement to get the correct
 * offset.
 *
 * NOTE: getSelection() is triggered on mouseup, so things
 * would break were we to listen on mousedown.
 *
 * @param{Event} e          - click event
 * @param{HTMLElement} psrc - pointer to psrc.
 * @returns{[HTMLElement, HTMLElement, number]|undefined} -
 * undefined if there's no range, and if thus we can't compute
 * the offset. Otherwise, array containing:
 *	[
 *		pointer to piece element where the click happened,
 *		point to either psrc/ptr (ie. previous element's parent)
 *		actual byte offset,
 *	]
 */
function countbyteoffset(e, psrc) {
	// We're listening on the whole document: avoid raising
	// warnings when there's no selection/anchorNode (happens).
	if (!window)       return undefined;

	var s = window.getSelection();
	if (!s)            return undefined;
	if (!s.anchorNode) return undefined;

	var a = s.anchorNode;
	var i = s.anchorOffset;

	// Anchor node may have a few other text sibling, so first,
	// make offset relative to anchor's node parent
	i += counttextoffset(a);

	// Grab the Element covering the Text node pointed by the
	// anchorNode and the parent of that Element, and its parent
	var t = /** @type{HTMLElement} */ (a.parentElement);
	var p = /** @type{HTMLElement} */ (t.parentNode);

	// Current node in src is always the only child of src
	// being split in 3 <spans>.
	if (p.parentNode == psrc) {
		// make it relative to pieces
		i += countpieceoffset(t);
		t = p;

		p = /** @type{HTMLElement} */ (t.parentNode);
	}

	// Make offset relative to current chunk
	i += countpieceoffset(t);

	return [p, t, i];
}

/**
 * Toggle an element's visibility when clicking on
 * an other element.
 *
 * Input:
 * @param{HTMLElement} m - element to update according to n's visibility (e.g. link/button)
 * @param{HTMLElement} n - element for which we want to toggle visibility
 * @param{string}      h - m's content if we hide n
 * @param{string}      s - m's content if we show n
 *
 * @returns{void}
 */
function togglefromlink(m, n, h, s) {
	/* hidden; show */
	if (n.style.display == 'none') {
		n.style.display = '';
		m.innerText     = h;
	}

	/* shown; hide */
	else {
		n.style.display = 'none';
		m.innerText     = s;
	}
}

/**
 * Wraps p.closest() with Assert and casts to HTMLElement.
 *
 * @param{HTMLElement}   p
 * @param{string}        s - selector
 * @returns{HTMLElement}
 */
function closest(p, s) {
	var q = /** @type{HTMLElement} */ (p.closest(s));
	if (!q) {
		console.log(p);
		Assert.assert("No closest such as "+s);
		// @ts-ignore
		return;
	}
	return q;
}

/**
 * Same as closest(), but for querySelector()
 *
 * @param{HTMLElement}   p
 * @param{string}        s - selector
 * @returns{HTMLElement}
 */
function queryselector(p, s) {
	var q = /** @type{HTMLElement} */ (p.querySelector(s));
	if (!q) {
		Assert.assert("No children such as "+s);
		// @ts-ignore
		return;
	}
	return q;
}

/**
 * Retrieve HTMLElement target of the given event.
 *
 * Typescript noise.
 *
 * @param{Event} e - event to check
 * @returns{HTMLElement}
 */
function gettarget(e) {
	return /** @type{HTMLElement} */ (/** @type{UIEvent} */ (e).target);
}

/**
 * Ensure the p.children[i] is ~at the middle of the screen,
 * assuming p is a scrollable element.
 *
 * This is practically good enough.
 *
 * @param{HTMLElement} p - container
 * @param{number}      i - p's i-th children should be visible.
 */
function scrollintoview(p, i) {
	var x = /** @type{HTMLElement} */ (p.children[i]);
	p.scrollTop = x.offsetTop - p.offsetTop - (p.offsetHeight/2);
}

/**
 * Grab concerned element or throw
 *
 * NOTE: View*.mk(...ids.map(getbyid), ...) won't
 * work unless we play magic.
 *
 * @param{string} id
 * @returns{HTMLElement}
 */
function getbyid(id) {
	var n = document.getElementById(id);
	if (!n) {
		Assert.assert('#'+id+' not found');
		// @ts-ignore
		return;
	}

	return n;
}

/**
 * Create an <audio> element linking to external .mp3 pinyin files.
 *
 * @param{Array<[string, string]>} ss - file name|info / url for each sound to play.
 * @returns{HTMLAudioElement}  - Audio element ready to start sequentially
 *                               playing all pinyin.
 */
function mksound(ss) {
	// Reasonable
	if (ss.length == 0) return new Audio();

	var a = new Audio(ss[0][1]);
	var i = 1;

	a.addEventListener('error', function() {
		var msg = ss[i-1][0]+" ("+a.src+")";

		if (a.error) switch(a.error.code) {
		case MediaError.MEDIA_ERR_ABORTED:
			msg = "aborted: "+msg;
			break;
		case MediaError.MEDIA_ERR_NETWORK:
			msg = "network error: "+msg;
			break;
		case MediaError.MEDIA_ERR_DECODE:
			msg = "broken file: "+msg;
			break;
		case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
			msg = "not found: "+msg;
			break;
		default:
			msg = "unexpected error code: "+a.error.code+" "+msg;

		}
		// a bit intrusive
		alert(msg);
	});

	a.addEventListener('ended', function() {
		a.pause();
		if (i < ss.length) {
			a.src =  ss[i++][1] || "";
			a.load();
			a.play()
		}

	});

	return a;
}

/**
 * Load the given font.
 *
 * @param{string} p - path to given font
 * @returns{Promise<any>}
 */
function loadfont(p) {
	// TODO: Utils.basename(path[, ext]) + tests.
	// e.g. /path/to/foo.ttf -> foo.ttf -> foo
	var n = (p.split("/").pop() || "undefined").split(".").shift() || "undefined";
	var f = new FontFace(n, 'url('+p+')');

	return f.load().then(function(x) {
		// XXX/TODO: https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/add,
		// yet: error TS2339: Property 'add' does not exist on type 'FontFaceSet'.
		// @ts-ignore
		document.fonts.add(x);
		document.body.style.fontFamily = n;
		return true;
	}).catch(function(e) {
		alert(e);
		console.log(e);
		return false;
	});
}

/**
 * Creates a HTMLElement holding various images (e.g. strokes, ancient forms)
 * for the given chinese character.
 *
 * TODO: allow the creation of a grid of images instead of an array.
 * TODO: have a type for those [string, string] links.
 *
 * @param{Array<[string, string]>} imgs - links to images to be displayed
 * @param{boolean}                 single - if true, stops at first successfully loaded image
 * @param{string}                  c - class to assing img HTMLElement
 * @param{string}                  [err] - error message to display if all images failed.
 * @returns{HTMLElement}
 */
function mkimgs(imgs, single, c, err) {
	let y  = mkspan();

	// One item is expected later on.
	if (imgs.length == 0) return y; // mkspan(err, c);

	// true if at least one image was loaded.
	let ok = false;

	/**
	 * Callback based iteration:
	 *	- if single is true, iteration stops once an image
	 *	  has (sucessfully) been loaded
	 *	- if single is false, iteration keeps going until the end.
	 *	- an error message is displayed if no image was (successfully)
	 *	  loaded.
	 * @type{(i : number) => void }
	 */
	function addimg(i) {
		// we can't iterate further
		if (i == imgs.length) {
			// and no images have been successufully loaded
			if (!ok) y.appendChild(mkspan(err, c))
			return;
		}
		let z       = document.createElement("img");
		z.loading   = "lazy";
		z.src       = imgs[i][1];
		z.title     = imgs[i][0];
		z.alt       = "not found";
		z.className = c;
		z.onload    = function() { ok = true; if (!single) addimg(i+1); }
		z.onerror   = function() {
			console.log(imgs[i][1]+" failed; iterating");
			y.removeChild(z);
			addimg(i+1);
		}
		y.appendChild(z);
	}

	addimg(0);

	return y;
}

/**
 * Wraps the creation of an HTMLElement equipped a "build()"
 * "method". This is to isolate typescript noise.
 *
 * @param{string} t
 * @returns{BuildableHTMLElement}
 */
function mkbuildable(t) {
	let p = document.createElement(t);
	// @ts-ignore
	p.build = function(){}
	return /** @type{BuildableHTMLElement} */ (p);
}

/**
 * Wraps the creation of an HTMLElement equipped a "build()"
 * and a "move()" methods. Agaain, this is to isolate typescript noise.
 *
 * @param{string} tag
 * @returns{MovableBuildableHTMLElement}
 */
function mkmovablebuildable(t) {
	let p = document.createElement(t);
	// @ts-ignore
	p.build = function(){}
	// @ts-ignore
	p.move  = function(){}
	return /** @type{MovableBuildableHTMLElement} */ (p);
}

/**
 * Set the page's <title></title>'s content.
 *
 * @param{string} s
 * @returns{void}
 */
function settitle(s) {
	let xs = document.getElementsByTagName("title");
	if (xs.length == 0)
		Assert.assert("No <title></title> element!")
	xs[0].textContent = s;
}

return {
	"isshown"            : isshown,
	"show"               : show,
	"hide"               : hide,
	"showfirst"          : showfirst,

	"loading"            : loading,
	"loaded"             : loaded,

	"togglefromlink"     : togglefromlink,
	"scrollintoview"     : scrollintoview,

	"countpieceoffset"   : countpieceoffset,
	"countbyteoffset"    : countbyteoffset,

	"mkspan"             : mkspan,
	"mke"                : mke,
	"mka"                : mka,
	"mkselect"           : mkselect,
	"mkdash"             : mkdash,
	"mktoc"              : mktoc,

	"alisten"            : alisten,

	"gettarget"          : gettarget,

	"getbyid"            : getbyid,

	"hidechildren"       : hidechildren,

	"closest"            : closest,
	"queryselector"      : queryselector,

	"mksound"            : mksound,
	"mkimgs"             : mkimgs,

	"loadfont"           : loadfont,

	"mkbuildable"        : mkbuildable,
	"mkmovablebuildable" : mkmovablebuildable,

	"settitle"           : settitle,
};

})();let Links = (function() {

/**
 * Available/known external links
 *
 * Variables (substring-substituded):
 *	${w}    : UTF-8 character/word as a string (e.g. "學")
 *	${h}    : Uppercase hexadecimal value of the first code point (e.g. "5B78")
 *	${h[0]} : First byte from ${h} (e.g. "5")
 *	${b}    : Corresponding Big5 as %-escaped hexadecimal (e.g. "%BE%C7")
 *
 * @type{Links}
 */
var links = {
	"en.wiktionary.org" : {
		"fmt"  : "https://en.wiktionary.org/wiki/${w}",
	},
	"fr.wiktionary.org" : {
		"fmt"  : "https://fr.wiktionary.org/wiki/${w}",
	},
//	"ru.wiktionary.org" : {
//		"fmt"  : "https://ru.wiktionary.org/wiki/${w}",
//	},
	"baidu.com" : {
		"fmt"  : "https://baike.baidu.com/item/${w}",
	},
	"zdic.net" : {
		"fmt"  : "https://www.zdic.net/hans/${w}",
	},
	"zh.wiktionary.org" : {
		"fmt"  : "https://zh.wiktionary.org/zh-hans/${w}",
	},
	"translate.google.com" : {
		"fmt" : "https://translate.google.com/?sl=zh-CN&tl=en&op=translate&text=${w}",
	},
//	"ru-translate.google.com" : {
//		"fmt" : "https://translate.google.com/?sl=ru&tl=en&op=translate&text=${w}",
//	},
	"linguee.com" : {
		"fmt" : "https://www.linguee.com/english-chinese/search?source=chinese&query=${w}",
	},
	"ctext.org" : {
		"fmt" : "https://ctext.org/dictionary.pl?char=${w}",
	},
	"mdbg.net (trad.)" : {
		"fmt" : "https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=1&wdqb=${w}",
	},
	"mdbg.net (simpl.)" : {
		"fmt" : "https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${w}",
	},
	"hanzicraft.com" : {
		"fmt" : "https://hanzicraft.com/character/${w}",
	},
	"unicode.org" : {
		"fmt"    : "https://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint=${h}",
		"single" : true,
	},
	"chise.org" : {
		"fmt"    : "https://www.chise.org/est/view/character/${w}",
		"single" : true,
	},
	"chineseetymology.org" : {
		"fmt"    : "http://internationalscientific.org/CharacterEtymology.aspx?submitButton1=Etymology&characterInput=${w}",
		"single" : true,
	},
	"chinese-characters.org" : {
		"fmt"    : "http://chinese-characters.org/meaning/${h[0]}/${h}.html",
		"single" : true,
	},
	"zhongwen.com" : {
		"fmt"    : "http://zhongwen.com/cgi-bin/zipux.cgi?=${b}",
		"single" : true,
		"big5"   : true,
	},
	"chinesisch-trainer.de" : {
		"fmt"    : "http://chinesisch-trainer.de/index.php?z=${h}",
		"single" : true,
	},
};

/**
 * Available links to stroke and ancient scripts images.
 *
 * @type{Links}
 */
var imgs = {
	"wm-bw-static" : {
		"fmt"    : "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=${w}-bw.png",
		"single" : true,
	},
	"wm-bw-gif" : {
		"fmt"    : "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=${w}-order.gif",
		"single" : true,
	},
	"wm-red-static" : {
		"fmt"    : "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=${w}-red.png",
		"single" : true,
	},

	// https://commons.wikimedia.org/wiki/Commons:Ancient_Chinese_characters_project
	// This includes work of Richard Sears, see http://internationalscientific.org/,
	// especially regarding seal script.
	"wm-oracle"  : {
		"fmt"    : "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=${w}-oracle.svg",
		"single" : true,
	},
	"wm-bronze"  : {
		"fmt"    : "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=${w}-bronze.svg",
		"single" : true,
	},
	"wm-silk"    : {
		"fmt"    : "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=${w}-silk.svg",
		"single" : true,
	},
	"wm-bigseal" : {
		"fmt"    : "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=${w}-bigseal.svg",
		"single" : true,
	},
	"wm-seal"   : {
		"fmt"    : "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=${w}-seal.svg",
		"single" : true,
	},
	"wm-clerical-han" : {
		"fmt"    : "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=${w}-clerical-han.svg",
		"single" : true,
	},
	"wm-mingti-kangxi" : {
		"fmt"    : "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=${w}-mingti-kangxi.svg",
		"single" : true,
	},
	"wm-kaishu" : {
		"fmt"    : "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=${w}-kaishu.svg",
		"single" : true,
	},
};

/**
 * Available URLs for pinyin audio, one entry per URL.
 *
 * allsetlearning.com has better quality, slightly more complete (64 more files
 * out of 1645), but is not available for commercial use.
 *
 * davinfifield is lower quality, but public domain.
 * @type{Links}
 */
var audios = {
	"allsetlearning.com" : {
		"fmt" : "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/${w}.mp3",
	},
	"raw.github.com/davinfifield" : {
		"fmt" : "https://raw.githubusercontent.com/davinfifield/mp3-chinese-pinyin-sound/master/mp3/${w}.mp3",
	},
	"github.com/davinfifield" : {
		"fmt" : "https://github.com/davinfifield/mp3-chinese-pinyin-sound/blob/master/mp3/${w}.mp3?raw=true",
	},
};

/** @type{Links} */
var all = Object.assign({}, links, imgs, audios);

/**
 * Generate an URL to site n for character c from links
 * described by ls.
 *
 * TODO: there was a bug around the big5 handling (lack of
 * tests; see also 'data.js:/^function utf82big5')
 *
 * @param{Links}     ls    - available links
 * @param{string}    n     - site's name (key for links{})
 * @param{string}    w     - word to create a link to
 * @param{(arg0 : string) => string} [u2b] - utf8 to big5 converter; default
 * to Data.utf82big5
 *
 * @returns{string}
 */
function getfrom(ls, n, w, u2b) {
	// Unknown site
	if (!(n in ls)) {
		Assert.assert("Links.getfrom(): unknown site "+n);
		return "";
	}

	// Site only linkable for single-character word
	if ([...w].length > 1 && ls[n].single) return "";

	var c = w.codePointAt(0);

	// <=> w.length == 0; but tsc(1) isn't that smart
	if (!c) return "";

	var h  = c.toString(16).toUpperCase();
	var b  = "";

	if (ls[n].big5) {
		b = (u2b || Data.utf82big5)(w);
		// Site only linkable if we have a big5
		if (!b) return "";

		b = Utils.htmlhex(b);
	}

	return ls[n].fmt
		.replace("${w}",    w)
		.replace("${h}",    h)
		.replace("${h[0]}", h[0])
		.replace("${b}",    b);
}

/**
 * Retrieve a pointer to the object referencing the links to
 * use.
 *
 * @param{string} [t] - link's type (link/s, img/s, audio/s; default to all)
 *
 * @returns{Links}
 */
function getls(t) {
	var ls = all; switch(t) {
	case "link"  : case "links"  : ls = links;  break;
	case "img"   : case "imgs"   : ls = imgs;   break;
	case "audio" : case "audios" : ls = audios; break;
	}
	return ls;
}

/**
 * Generate an URL to site n for character c.
 *
 * @param{string}    n     - site's name (key for links{})
 * @param{string}    w     - word to create a link to
 * @param{string}    [t]   - link's type (links, imgs, audios; default to all)
 *
 * @returns{[string, string]|undefined}
 */
function get(n, w, t) {
	var m = getfrom(getls(t), n, w);
	return m ? [n, m] : undefined
}

/**
 * Expand "..." in ns from available links in ls, if found.
 * "..." is expanded to all sites from ls that aren't referenced
 * in ns.
 *
 * @param{Links} ls
 * @param{string[]} ns
 *
 * @returns{string[]}
 */
function expand(ls, ns) {
	/** @type{Object.<string, boolean>} */
	var found = {};

	/** @type{number} */
	var j     = -1;

	for (var i = 0; i < ns.length; i++) {
		if (ns[i] == "...") j = i;
		else found[ns[i]] = true;
	}

	return j == -1 ? ns : ns.slice(0, j)
		.concat(Object.keys(ls).sort().reduce(
			/** @type{(acc : Array<string>, l : string) => Array<string>} */
			function(acc, l) {
				if (!(l in found)) acc.push(l);
				return acc;
			}, []))
		.concat(ns.slice(j+1))
}

/**
 * Similar to get() on links but works on multiple sites at once, and
 * automatically expand special site "...".
 *
 * @param{string[]}  ns    - sites' names (keys for links{})
 * @param{string}    w     - word to create a link to
 * @param{string}    [t]   - link's type (links, imgs, audios; default to all)
 *
 * @returns{Array<[string, string]>}
 */
function mget(ns, w, t) {
	var ls = getls(t);
	return expand(ls, ns).reduce(
		/** @type{(acc : Array<[string, string]>, l : string) => Array<[string, string]>} */
		function(acc, n) {
			var s;
			if (s = getfrom(ls, n, w))
				acc.push([n, s]);
			return acc;
		}, []
	)
}

return {
	"getfrom" : getfrom,

	"getls"   : getls,

	"expand"  : expand,

	"get"     : get,
	"mget"    : mget,
};

})();let Log = (function() {
/*
 * Basic conditional logging, mainly for debugging
 * purposes.
 */

/** @type{(s : string) => void} */
function debug(s) {
	console.debug(s);
}

/** @type{(s : string) => void} */
function warn(s) {
	console.warn(s);
}

return {
	"debug" : debug,
	"warn"  : warn,
};

})();let Main = (function() {

/*
 * NOTE: this used to contain what's now in ../lib/spa.js;
 * it's now only used as entry points over view.js, for when
 * zm is used as a lib on external websites.
 *
 * TODO: we may be able to plug this in view.js directly.
 */

/**
 * Render a ViewSingleNav for given input, at given
 * location in the DOM.
 *
 * @param{string}           s - word to analyse
 * @param{HTMLElement} p      - pointer to installation node
 *
 * @returns{void}
 */
function singlenav(s, p) {
	let q = View.mksinglenav(s);
	// a bit clumsy
	q.classList.add(Classes.singlenav);
	p.replaceWith(q);
}

/**
 * Render a ViewSingle for given word at given
 * location in the DOM.
 *
 * @param{string}           w - word to analyse
 * @param{HTMLElement}      p - where to install
 *
 * @returns{HTMLElement}
 */
function single(w, p) {
	let q = View.mksingle(w);
	p.replaceWith(q);
	return q;
}

/**
 * Shortcut to create multiple single() all at once.
 *
 * @param{Array<[string, HTMLElement]>} xs
 * @returns{Array<HTMLElement>}
 */
function singles(xs) { return xs.map(function([w, p]) { return single(w, p) }); }

return {
	"single"    : single,
	"singlenav" : singlenav,
	"singles"   : singles,
};

})();
let Move = (function() {
/*
 * We're not using genuine class-based/prototype based OOP
 * as they're too constraining for our purposes regarding
 * "optimal" code sharing.
 *
 * We're also avoid `this` because of its implicit nature
 * in JS, and use explicit closures to wrap state object instead.
 *
 * Hopefully, this will make the code easier to understand,
 * albeit less idiomatic.
 *
 * You may want to look at interfaces and documentation in ../lib.d.ts
 */

/**
 * "Constructor" for a Movable.
 *
 * NOTE: if cs isn't provided, object is considered uninitialized,
 * and caller is responsible to initialize it by calling init();
 * mk()'s parameters are provided as convenience.
 *
 * TODO: see if we keep them; they're unused so far.
 *
 *	@param{Movable["cs"]} [cs] - input chunks
 *	@param{Movable["ic"]} [ic] - current chunk number
 *	@param{Movable["iw"]} [iw] - current word number in current chunk
 *
 *	@returns{Movable}
 */
function mk(cs, ic, iw) {
	/** @type{Movable} */
	var M = {};

	/**
	 * Update/re-initialize state from given input.
	 *	 *
	 * @type{Movable["init"]}
	 */
	M.init = function(cs, ic, iw) {
		/*
		 * TODO: encode assertions in typing (NonEmptyArray should
		 * be do-able).
		 *
		 * - Chunks array is indexed at least by ic=0
		 * - Tokens are indexed by iw=0 at least
		 * - movew() skip punctuations; we would have issues with
		 *   entries containing only puncts. We're being stricter here.
		 *
		 * NOTE: last assertion is dependant upon default movement
		 * choice: were we to systematically enable movecw (defined later,
		 * not used yet), we would need to assert that we there's at
		 * least one chinese character somewhere in cs.
		 */
		Assert.assert("Movable chunk list is empty", cs.length > 0);
		for (var i = 0; i < cs.length; i++) {
			Assert.assert(
				"M.update: chunk "+i+" has no tokens",
				cs[i].ts.length > 0,
			);

			var ok = false;
			for (var j = 0; j < cs[i].ts.length; j++)
				if (cs[i].ts[j].t != TokenType.Punct) {
					ok = true; break
				}
			Assert.assert("M.update: chunk "+i+" only has puncts token", ok)
		}

		/**
		 * Chunks.
		 * @type{Movable["cs"]}
		 */
		M.cs = cs;

		/**
		 * Current chunk/word in current chunk indexes
		 * @type{Movable["ic"]}
		 */
		M.ic = ic === undefined ? 0 : ic;

		/** @type{Movable["iw"]} */
		M.iw = iw === undefined ? 0 : iw;

		// We'll be indexing arrays with those. This isn't
		// critical as we'll be using sanitized ic/iw, but
		// this should not happens.
		Assert.assert("M.update: negative ic", M.ic >= 0);
		Assert.assert("M.update: negative iw", M.iw >= 0);

		// Sanitize entries
		M.ic = Utils.putin(M.ic, 0, M.cn()-1);
		M.iw = Utils.putin(M.iw, 0, M.wn()-1);
	};

	/**
	 * Number of chunks.
	 * @type{Movable["cn"]}
	 */
	M.cn = function()   { return M.cs.length; }

	/**
	 * Number of words in a given chunk.
	 * @type{Movable["wn"]}
	 */
	M.wn = function(ic) {
		return M.cs[ic === undefined ? M.ic : ic].ts.length;
	}

	/**
	 * Current chunk.
	 *
	 * @type{Movable["cc"]}
	 */
	M.cc = function(ic) {
		return M.cs[ic === undefined ? M.ic : ic]
	}

	/**
	 * Current word in current chunk.
	 *
	 * @type{Movable["cw"]}
	 */
	M.cw = function(ic, iw) {
		return M.cs[ic === undefined ? M.ic : ic].ts[iw === undefined ? M.iw : iw];
	}

	/**
	 * Current word in current chunk, as a string.
	 * Used for the web UI.
	 *
	 * @type{Movable["cwv"]}
	 */
	M.cwv = function(ic, iw) { return M.cw(ic, iw) ? M.cw(ic, iw).v : ""; }

	/**
	 * Move until given predicate is met.
	 *
	 * NOTE: Log.debug calls are disabled because they noticeably slow
	 * things down (measured) when moving from chunk to chunk, because
	 * M.movec() is achieved by calling M.movep() until we actually change
	 * chunks. This may be a performance issue later on if/when working with
	 * big chunks; kept as-is for now because of design clarity/uniformity.
	 *
	 * This should almost never be called directly;
	 * move() (cf. below) should be the public interface.
	 *
	 * @type{Movable["movep"]}
	 */
	M.movep = function(d, p, ic, iw) {
		// XXX ic not tested (there has been a bug on iw)
		if (ic === undefined) ic = M.ic;
		if (iw === undefined) iw = M.iw;

		// Can't move further; predicate wasn't met: impossible move
		if (d == MoveDir.Next && ic == M.cn()-1 && iw == M.wn()-1) return [-1, -1];
		if (d == MoveDir.Prev && ic == 0        && iw == 0)        return [-1, -1];

//		Log.debug("movep, before: ic:"+iw+" iw:"+iw);

		/* Move one step. */
		switch(d) {
		case MoveDir.Next:
			if (iw < M.wn()-1) {       iw++;             }
			else               { ic++; iw = 0;           }
			break;
		case MoveDir.Prev:
			if (iw > 0)        {       iw--;             }
			else               { ic--; iw = M.wn(ic)-1;  }
			break;
		case MoveDir.Offset:
		default:
			Assert.assert("movep() shouldn't work on offset (or should it?)");
			break;
		}

//		Log.debug("movep, after: ic:"+iw+" iw:"+iw);
//		Log.debug("movep, match: "+p(M, ic, iw));

		// Stop if predicate matches here.
		return p(M, ic, iw) ? [ic, iw] : M.movep(d, p, ic, iw);
	}

	/**
	 * Convenient shortcut.
	 *
	 * @type{(M : Movable, ic : number, iw : number) => boolean}
	 */
	function ispunct(M, ic, iw) { return M.cw(ic, iw).t == TokenType.Punct; }

	/**
	 * @type{MoveDirF}
	 */
	function movew(M, d, ic, iw) {
		return M.movep(d, function(M, jc, jw) {
			return !ispunct(M, jc, jw) && (jc != ic || jw != iw);
		}, ic, iw);
	}

	/**
	 * @type{MoveDirF}
	 */
	function movec(M, d, ic, iw) {
		return M.movep(d, function(M, jc, jw) {
			return !ispunct(M, jc, jw) && jc != ic;
		}, ic, iw);
	}

	/**
	 * @type{(
	 *	M : Movable, d : MoveDir, t : ChunkType, jc : number, jw : number
	 * ) => [number, number]}
	 */
	function movect(M, d, t, ic, iw) {
		return M.movep(d, function(M, jc, jw) {
			return !ispunct(M, jc, jw) && M.cc(jc).t == t && jc != ic;
		}, ic, iw);
	}

	/**
	 * @type{(M : Movable, o : number, ic : number, iw : number) => [number, number]}
	 */
	function moveo(M, o, ic, iw) {
		// special case: movep() always starts by moving before
		// checking predicate.
		if (o <= M.cw(ic, 0).j)
			return ispunct(M, ic, 0)
				// @ts-ignore
				? movew(M, MoveDir.Next, ic, 0)
				: [ic, 0]

		// Ensure we're not going beyond last chunk
		if (o >=  M.cw(M.ic, M.wn()-1).j)
			return ispunct(M, ic, M.wn()-1)
				// @ts-ignore
				? movew(M, MoveDir.Prev, ic, M.wn()-1)
				: [ic, M.wn()-1];

		// @ts-ignore
		var [jc, jw] = M.movep(MoveDir.Next, function(M, jc, jw) {
			return !ispunct(M, jc, jw) && ((jc != ic) || M.cw(jc, jw).j >= o);
		}, ic, 0);

		// Used to be a bug here with o at the end+1 of
		// last word of last chunk.
		Assert.assert("can move to offset", jc != -1);

		// Move to chunk's last word instead of going
		// to next chunk.
		// @ts-ignore
		return (jc == ic) ? [jc, jw] : movew(M, MoveDir.Prev, jc, 0);
	}

	/**
	 * Move
	 *
	 * @type{Movable["move"]}
	 */
	M.move = function(d, w) {
		/**
		 * @type{(t : ChunkType) => MoveDirF}
		 */
		function mkmovect(t) { return function(M, d, ic, iw) {
			return movect(M, d, t, ic, iw)
		}};

		/**
		 * NOTE: currently unused; do we even want/need?
		 * (to be called after a MoveDifF call).
		 *
		 * @type{MoveDirF}
		 */
		function movecw(M, d, ic, iw) {
			if (M.cw(ic, iw).t == TokenType.Chinese)
				return [ic, iw];
			return M.movep(d, function(M, jc, jw) {
				return M.cw(jc, jw).t == TokenType.Chinese && (jc != ic || jw != iw);
			}, ic, iw);
		}

		// XXX/TODO Perhaps we could avoid implementing this as
		// such a corner case, e.g. by having all move functions
		// to be M, d, w, ic, iw ?
		if (d == MoveDir.Offset) {
			// @ts-ignore
			if (isNaN(w)) {
				Assert.assert("move(): offset is NaN: "+w);
				return [-1, -1];
			}
			// @ts-ignore
			return moveo(M, w, M.ic, M.iw);
		}

		/**
		 * ~clumsy
		 * @type{MoveDirF}
		 */
		var f;
		switch(w) {
		case MoveWhat.Word:          f = movew;                             break;
		case MoveWhat.Chunk:         f = movec;                             break;
		case MoveWhat.Title  :       f = mkmovect(ChunkType.Title);         break;
		case MoveWhat.Section:       f = mkmovect(ChunkType.Section);       break;
		case MoveWhat.Subsection:    f = mkmovect(ChunkType.Subsection);    break;
		case MoveWhat.Subsubsection: f = mkmovect(ChunkType.Subsubsection); break;
		default:
			Assert.assert("move(): unexpected 'what': "+w);
			return [-1, -1];
		}

		var [jc, jw] = f(M, d, M.ic, M.iw);

		// Failed predicate
		if (jc == -1) return [M.ic, M.iw]

		return [jc, jw];
	}

	if (cs !== undefined)
		M.init(cs, ic, iw);

	return M;
}

return {
	"mk" : mk,
};

})();
let Stack = (function() {
/**
 * Stack constructor.
 *
 * The "stack" here refers to the UI stack of words being currently
 * displayed; we only implement the mechanics here.
 *
 * TODO: tests
 *
 * @returns{Stack}
 */
function mk() {
	let S = /** @type{Stack} */ {
		// Stack of words being inspected
		/** @type{Stack["xs"]} */
		xs : [],

		// Currently selected word from the stack
		/** @type{Stack["n"]} */
		n  : 0,

		// dumb tsc(1) boilerplate...

		/** @type{Stack["reset"]} */
		reset : function(){},

		/** @type{Stack["last"]} */
		last : function(){return "";},

		/** @type{Stack["current"]} */
		current : function(){return "";},

		/** @type{Stack["push"]} */
		push : function(){return false},

		/** @type{Stack["findback"]} */
		findback : function(){},

		/** @type{Stack["del"]} */
		del : function(){},

		/** @type{Stack["backto"]} */
		backto : function(){},

		/** @type{Stack["popto"]} */
		popto : function(){},
	};

	// type annotations below are useless :shrug:

	/** @type{Stack["reset"]} */
	S.reset = function() {
		S.xs = [];
		S.n  = 0;
	}

	/** @type{Stack["last"]} */
	S.last = function() {
		return S.xs.length ? S.xs[S.xs.length-1] : undefined
	}

	/** @type{Stack["current"]} */
	S.current = function() {
		if (S.n < 0)             return undefined;
		if (S.n > S.xs.length-1) return undefined;

		return S.xs[S.n];
	}

	/** @type{Stack["push"]} */
	S.push = function (w) {
		// XXX clumsy
		if (S.last() == w)
			return false;
		S.xs.push(w);
		S.n = S.xs.length-1;
		return true;
	}

	/** @type{Stack["findback"]} */
	S.findback = function(w, f) {
		for (var i = S.xs.length-1; i >= 0; i--)
			if (S.xs[i] == w)
				f(i);
	}

	/** @type{Stack["del"]} */
	S.del = function(w) {
		// Always keep at least one element on the stack
		if (S.xs.length == 1) return;

		S.findback(w, /** @type{(i : number) => void} */ function(i) {
			S.n = i == S.xs.length-1 ? i-1 : i;
			S.xs.splice(i, 1);
		});
	}

	/** @type{Stack["backto"]} */
	S.backto = function(w) {
		S.findback(w, /** @type{(i : number) => void} */ function(i) {
			S.n = i;
		});
	}

	/** @type{Stack["popto"]} */
	S.popto = function(w) {
		S.findback(w, /** @type{(i : number) => void} */ function(i) {
			S.xs = S.xs.slice(0, i+1);
		});
	}

	return S
}

return {
	"mk" : mk,
};

})();let Tests = (function() {

// XXX historical artifact
let dbg = true;

/* comparison trace */
let cmpt = ""

/**
 * Append a line of trace to cmpt.
 *
 * NOTE/TODO: we could do better, e.g. have the complete
 * current data path and only log the problematic lines,
 * while keeping the ability to log everything to debug
 * the comparison itself.
 *
 * For now, this is better than nothing and practical enough.
 *
 * @param{Array<any>} xs - objects to be dumped
 */
function trace(...xs) {
	xs.forEach(function(x) {cmpt += Utils.dump1(x)});
	cmpt += "\n";
}

/**
 * Deep comparison.
 *
 * NOTE: Exhaustive enough for our purposes.
 *
 * @param{any} a - first  object to compare.
 * @param{any} b - second object to compare.
 * @returns{boolean} - true if a and b are equals, false otherwise.
 */
function dcmp(a, b) {
	if (dbg) trace("a:", a, "b:", b);

	/* Primitives */
	if (a === b) {
		if (dbg) trace("a and b are equals primitives (===)");
		return true;
	}

	/* Hashes & array */
	if (!(a instanceof Object)) {
		if (dbg) trace("a is not an object");
		return false;
	}

	if (!(b instanceof Object)) {
		if (dbg) trace("b is not an object");
		return false;
	}

	/* Distinguish between hash and array */
	if (Array.isArray(a) && !Array.isArray(b)) {
		if (dbg) trace("a is an array, but b is not");
		return false;
	}
	if (!Array.isArray(a) && Array.isArray(b)) {
		if (dbg) trace("b is an array, but a is not");
		return false;
	}

	/* All properties of a are in b, and equals */
	for (var p in a) {
		if (!(p in b)) {
			if (dbg) trace("property", p, "exists in a but not in b");
			return false;
		}
		if (dbg) trace("comparing property", p);
		if (!dcmp(a[p], b[p])) {
			if (dbg) trace("property", p, "has different values in a and b");
			return false;
		}
	}
	/* All properties of b are in a */
	for (var p in b) if (!(p in a)) {
		if (dbg) trace("property", p, "exists in b but not in a");
		return false;
	}

	if (dbg) trace("a and b equals");
	return true;
}

/**
 * Run a single test.
 *
 * NOTE: we're a bit lazzy when comparing to error. Perhaps
 * we could add an additional entry for that instead of using
 * expected. This is of little practical importance for now.
 *
 * @this{any} -
 * @param{function} f - function to test
 * @param{Array.<any>} args  - array of arguments for f
 * @param{any} expected - expected value for f(args)
 * @param{string} descr            -  test description
 * @param{string|undefined} error - expected error (exception)
 * @returns{boolean} - true if test was a success.
 *
 * In case of failure, got/expected are dumped as JSON on the console.
 */
function run1(f, args, expected, descr, error) {
	var got;

	// XXX/TODO: we should typecheck all the tests so that
	// it can't happen.
	Assert.assert(
		"Test arguments should be an array: "+descr,
		args instanceof Array
	);

	try {
		got      = f.apply(this, args);
	} catch(e) {
		console.log(e);
		// XXX this started to pop after adding Moveable.update
		// @ts-ignore
		got      = e.toString();
		expected = error || "<!no error were expected!>";
	}

	cmpt = "";
	var ok  = dcmp(got, expected);

	console.log("["+(ok ? "OK" : "KO")+"] "+f.name+": "+descr);
	if (!ok) {
		console.log("Got:");
		Utils.dump(got);
		console.log("Expected");
		Utils.dump(expected);
		console.log("Comparison trace: ", cmpt);
	}
	return ok;
}

/**
 * Run multiple tests, stopping on failure.
 *
 * @param{Array.<Test>} tests - tests to run
 * @returns{boolean} - true if all tests were run successfully, false if a test failed.
 */
function run(tests) {
	return tests.reduce(
		/** @type{(ok : boolean, t : Test) => boolean} */
		function(ok, t) {
			// Happens from time to time.
			Assert.assert("Tests array is exported?", t !== undefined);
			return ok && run1(t.f, t.args, t.expected, t.descr, t.error);
		},
		true
	);
}

return {
	"dcmp" : dcmp,
	"run"  : run,
};

})();
let User = (function() {

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

})();let Utils = (function() {
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

return {
	"dump1"         : dump1,
	"dump"          : dump,

	"ischinese"     : ischinese,
	"ischinesec"    : ischinesec,
	"haschinese"    : haschinese,

	"ispunct"       : ispunct,

	"orderedinsert" : orderedinsert,

	"addaccent"     : addaccent,
	"pinyinn2a"     : pinyinn2a,
	"pinyinsn2a"    : pinyinsn2a,

	"putin"         : putin,

	"deepget"       : deepget,
	"deepset"       : deepset,

	"htmlhex"       : htmlhex,

	"splitlines"    : splitlines,

	"copyarray"     : copyarray,
};

})();
let View = (function() {
/*
 * Core UI code containing the main "components".
 */

/*
	TODO: remove id used for style (no?), rework css, class names, naming,
	code organization & cie, thorough testing.

	TODO: still a click-moving bug on e.g. (long line)
		http://localhost:8001/book.html#c=198;w=41;b=shuo-wen-jie-zi

	TODO: the logic behind hidding decomposition by default is
	still foggy.

	TODO: we should re-import the code related to cutting/joining
	pieces

	TODO: why aren't books in data.js?

	TODO: listenforcache (state <-> URL)
		Underlying logic is a bit foggy.
		For now, basic caching (the one we had before) works (index.js)

		TODO: how do we handle state dumping for multiple singles
		on the same page?

	TODO: keyboard events handling could be refined further

	TODO: https://news.ycombinator.com/item?id=35108672
		https://www.joshwcomeau.com/react/common-beginner-mistakes/

	TODO: can we factorize book/trbook.js ?
		-> Yes, probably, but for now this should be good
		enough.
*/

/*
 * "Components":
 * -----------
 *
 * We follow a framework-less design, where each "component"
 * is represented by a function.
 *
 * The function returns an HTMLElement (a DOM node) and usually
 * takes as arguments:
 *	- a shared "state" (sometimes just a configuration), often called "S";
 *	- some options to configure the node
 *	- some additional arguments when needed
 *
 * Furthermore, the returned HTMLElement often is augmented with
 * a "build()" function so as to be able to re-render the node
 * from anyone (e.g. a parent node) who keeps a pointer to this node.
 *
 * Such building operation are (almost?) always performed by
 * ancestors.
 *
 * For more on this aspect of the design, see this article:
 *	https://tales.mbivert.com/on-frameworkless-js/
 */

/*
 * mksingle() / mksinglenav()
 * --------------------------
 *
 * This file is rather big; one reason is that there is
 * an interdependance between two main components, mksingle()
 * and mksinglenav(), which are standalone components respectively
 * allowing to inspect a single word, or a single sentence.
 *
 * The interdependance arises on one side from the fact that
 * mksinglenav() essentially is an extension of mksingle(),
 * and on the other side from the fact that some dictionaries
 * entries of a mksingle() can themselves be mksinglenav()
 * (this happens e.g. with the Shuo Wen, whose entries can
 * be navigated).
 *
 * While mutually recursive modules should be supported, I
 * prefered to keep them mixed here.
 */

/*
 * mkvcuts() (Decomposition grid)
 * ------------------------------
 *
 * The most sophisticated and most important component is the
 * decomposition grid, used to decompose a word, display its
 * definitions, etc.
 *
 * It is often referred to as a "vcuts" (list of "vcut"), and
 * is always created alongside a "stack", which allows to switch
 * between the decomposition grid (the vcuts) of multiple words
 * at once.
 *
 * A precise vocabulary is used to describe each part of the
 * decomposition grid (the vcuts). Each such part is described
 * by a component, that is, by a function, as previously described.
 *
 * Here's how the decomposition grid is architectured; you may want to
 * open a web page, such as https://zhongmu.eu/help.html to help with it.
 *
 *                              ***
 *
 * The "decomposition grid" is a vcuts (Classes.vcuts, vertical cuts).
 *
 *	-> 'function mkvcuts('
 *
 * TODO: this needs to be adjusted following some of the recent
 * simplification.
 *
 * A vcuts (':/function mkvcuts\(') is a list of vcut (Classes.vcut).
 *
 * A vcut contains:
 *	- a word (Classes.word)
 *	- a hcut (Classes.hcut, horizontal cut)
 *
 * A hcut contains:
 *	- a descr   (Classes.descr,   description)
 *	- a decomps (Classes.decomps, decompositions)
 *
 * A descr contains:
 *	- a header  (Classes.descrheader)
 *	- a content (Classes.descrcontent)
 *
 *     A header is a list of tabitems (Classes.tabitms).
 *
 *         A tabitems:
 *         - contains a list (Classes.tabitms of tabitem (Classes.tabitm)
 *         - can be active/inactive (Classes.tabactive)
 *
 *         A tabitem can refer to:
 *         - a tabitmdata   via its tabdata   attribute's value (Attrs.tabdata)
 *         - a tabitmdecomp via its tabdecomp attribute's value (Attrs.tabdecomp)
 *
 *         Note that while the tabitm data are stored in hcut -> descr -> content,
 *         the tabitmdecomp are stored in hcut -> decomps.
 *
 *         The first tabitems in a header always only contains tabitem
 *         refering to decompositions; while others only refers to
 *         datas.
 *
 *         A data is here, for now, either:
 *         - a dictionnary entry
 *         - some images
 *         - some external links.
 *
 *     A content is a list of tabitmdata. Only one tabitmdata is
 *     displayed at a time. A tabitmdata has a an attribute that is
 *     used to match it with a tabitm (Attrs.tabitmdata).
 *
 * A decomps is a list of tabitmdecomp. The first tabitmdecomp is always
 * a special entry that is used to hide decomposition display.
 *
 * Thus, as for the tabitmdata, there's only a single displayed
 * tabitmdecomp. And each tabitmdecomp has an attribute (Attrs.tabdecomp)
 * allowing to match it with a tabitm.
 *
 * Each tabitmdecomp contains a list of vcut (a vcuts then).
 */

/*
 * "Tab" management
 * ----------------
 *
 * When decomposing a word, there is a possibility to display
 * various meta-data related to the word, from definitions to
 * decompositions, and so forth.
 *
 * A high-level "tabs" configuration allows to configure the UI,
 * and determine what meta-datas are available for display.
 *
 * The tabs are described by a list of "tabitms", where each
 * such tabitms is a list of tabitm. Here a schematic example
 * of this "list of list".
 *
 * [
 *	[ decomposition0, decomposition1 ],
 *	[ defs0 ]
 *	[ imgs0, imgs1 ]
 *	[ links0 ]
 * ]
 *
 * - By convention, the first tabitms only contain, and is the
 * only tabitms to contain decompositions.
 *
 * When I say "by convention", I mean that this isn't really
 * enforced in the code (e.g. typechecking), but the code
 * regularly assumes this to be true.
 *
 * - For all the other tabitms, there's a notion of being active.
 * TODO
 * This allows switching back and forth between tabs in what intuition
 * demands.
 *
 *
 * To make the UI visually more compact, and avoid displaying
 * empty data, we have to
 *
 *	- for all but the first tabitms, there is a notion of an
 *	active tabitms (TODO document further)
 *	- this notion of active tabitms is handled at the zm-header
 *	level, because we follow the principle "children don't interact
 *	with each other directly": as the state of this property depends
 *	on all the siblings, it is handled by the parent;
 *	- the rotation of links within a tabitms is handled at the
 *	zm-tabitms level, but is triggered at the zm-header level,
 *	as it depends on the active state (rotation iff the tabitms
 *	is already active);
 */

/*
 * Caching
 * -------
 *
 *	- When moving from a tabitm to another, or from a word to
 *	another, the state of decomposition/study of each word
 *	is cached (meaning, the state of the decomposition grid is
 *	saved on a per-word basis).
 *	- The mechanism/format is identical as the state dumping one,
 *	only with a subset of the data.
 */

/**
 * Create HTML to hold a single definition associated to
 * a sound entry.
 *
 * @param{HTMLElement}    p - where to add the sound entry
 * @param{string} d - definition
 * @returns{HTMLElement}
 */
function mkdictsoundentrydef(p, d) {
	// Tokenize it
	var ts = Data.tokenize(d);

	var pinyin = false;
	ts.forEach(/** @param{Token} t */ function(t) {
		switch(t.t) {
		case TokenType.Word:
			if (Object.keys(t.d).length > 0) {
				p.appendChild(Dom.mka(t.v, Classes.defword));
				break;
			}
			if (pinyin) {
				p.appendChild(Dom.mkspan(Utils.pinyinn2a(t.v)));
				break;
			}
			// fallthrough
		case TokenType.Punct:
			if (t.v == '[') pinyin = true;
			if (t.v == ']') pinyin = false;
			// fallthrough
		default:
			p.appendChild(Dom.mkspan(t.v));
			break;
		}
	});
	p.appendChild(Dom.mkspan(" / "));

	return p;
}

/**
 * Create HTML to hold a DictSoundEntry.
 *
 * @param{HTMLElement} p - where to add the sound entry
 * @param{DictSoundEntry} d - dict entry from which to extract a sound entry
 * @param{string}      s - sound
 * @returns{HTMLElement}
 */
function mkdictsoundentry(p, d, s) {
	let q = document.createElement("b");

	// Lightly emphasizes tweaked entries.
	if (d.tw) p.style.fontStyle = "italic";

	q.innerText = "["+Utils.pinyinsn2a(s)+"]";
	p.appendChild(q);
	let a = Dom.mka("🔊", Classes.audio, "", s+", via "+User.prefs.audio);
	a.setAttribute(Attrs.pinyins, s);
	q.appendChild(a);

	p.appendChild(Dom.mkspan("/ "));

	// For each definition having this pinyin
	for (var i = 0; i < d.ds.length; i++)
		mkdictsoundentrydef(p, d.ds[i]);

	return p;
}

/**
 * Create HTML to hold a single DictEntry.
 *
 * @param{DictEntry} ds
 * @returns{HTMLElement}
 */
function mkdictentry(ds) {
	var p = document.createElement("span");

	// NOTE: a bit of a hack: ds contains "raw", unchained entries, we
	// need/want to chain them on-the-fly before presenting them to the
	// user. But Dict.chain() expects a DictsEntries, not a DictEntry, so
	// we wrap things in a dumb, temporary wrapper.
	var [xs, ms] = Dict.chain(/** @type{DictsEntries} */ ({"auto":ds}), ["auto"]);

	// TODO: log and notify user about the missing entries: it
	// indicates that the user needs to update his patch(es).
	if (ms.length) console.log(ms);

	// For each pinyin
	Object.keys(xs).sort().forEach(function(s) {
		// TODO/XXX I *think* this can happen when a patches removes
		// everything; we need to test this
		if (xs[s].length == 0) return;

		// xs[s] contains a DictSoundEntries. But because
		// we've just chained things, there's only one ([0])
		// DictSoundEntry remaining here.
		mkdictsoundentry(p, xs[s][0], s);
	});

	return p;
}

/**
 * Creates a HTMLElement holding navigable dictionary content
 * for x.
 *
 * @param{TabItmConf} c
 * @param{VCutState} S
 *
 * @returns{HTMLElement}
 */
function mknavdict(c, S) {
	// Safety as tab config is not strictly typed
	if (!c.dict) {
		Assert.assert("No .dict in tab configuration");
		return document.createElement("span");
	}

	// XXX
	let s = S.tok.d[c.dict]["xx5"][0].ds[0];

	console.log("mknavdict", s, S);

	return mksinglenav(s, S);
}

/**
 * Creates a HTMLElement holding navigatable dictionary content
 * for x.
 *
 * @param{TabItmConf} c
 * @param{VCutState} S
 *
 * @returns{HTMLElement}
 */
function mkdictschain(c, S) {
	if (!c.dicts) {
		Assert.assert("No .dicts in tab configuration");
		// @ts-ignore
		return;
	}

	if (c.dicts.length == 0)
		return Dom.mkspan("empty dicts chain!");

	var [ds, ms] = Dict.chain(S.tok.d, c.dicts);

	// TODO: show to user somewhere; seems to be triggered
	// e.g. on 寧
	if (ms.length) console.log(ms);

	return mkdictentry(ds);
}

/**
 * Creates a HTMLElement holding dictionary content for x.
 *
 * @param{TabItmConf} c
 * @param{VCutState}  S
 *
 * @returns{HTMLElement}
 */
function mkdict(c, S) {
	if (!c.dict) {
		Assert.assert("No .dict in tab configuration");
		// @ts-ignore
		return;
	}
	return mkdictentry(S.tok.d[c.dict]);
}

/**
 * Creates a HTMLElement holding images (e.g. strokes, seal scripts, etc.)
 * for x.
 *
 * NOTE: we may want to use the ../../getstrokes.sh to either avoid
 * sending useless requests and/or have a local copy of the files.
 * For now, we don't have that much users, but it's a bit rude.
 * Same goes for the audio files.
 *
 * @param{TabItmConf} c
 * @param{VCutState}     S
 *
 * @returns{HTMLElement}
 */
function mkimgs(c, S) {
	if (!c.imgs) {
		Assert.assert("No .imgs in configuration");
		// @ts-ignore
		return;
	}

	return Dom.mkimgs(
		Links.mget(c.imgs, S.tok.v, "imgs"),
		c.single || false,
		Classes.strokesimg,
		'no images available',
	);
}

/**
 * Create a HTMLElement holding (external) links related to x.
 *
 * @param{TabItmConf} c
 * @param{VCutState}  S
 *
 * @returns{HTMLElement}
 */
function mklinks(c, S) {
	if (!c.links) {
		Assert.assert("No .links in tab configuration");
		return document.createElement("span");
	}

	var ls = Links.mget(c.links, S.tok.v, "links");

	var p = document.createElement('ul');

	for (var i = 0; i < ls.length; i++) {
		var q = document.createElement('li');
		q.appendChild(Dom.mka(ls[i][0], "", ls[i][1]));
		p.appendChild(q);
	}

	return p;
}

/**
 * Create a HTMLElement holding x's decomposition.
 *
 * @param{TabItmConf} c
 * @param{VCutState}  S
 *
 * @returns{HTMLElement}
 */
function mkdecomp(c, S) {
	// Safety as tab config is not strictly typed
	if (!c.decomp) {
		Assert.assert("No .decomp in tab configuration");
		return Dom.mkspan('');
	}

	return mkvcuts({
		stack    : S.stack,
		cache    : S.cache,
		tabsconf : S.tabsconf,
		hasstack : false,
		ts       : (S.tok.c[c.decomp][0].c || []).map(function(c) {
			return Data.cut(c.v)[0];
		})
	});
}

/**
 * Functions store to manipulate tabs.
 *
 * @type{Object.<string, Tab>}
 */
var tabs = {
	[TabType.Decomp]     : {
		mk  : mkdecomp,
		has : function(c, x) {
			return (x.c[c.decomp || ""] || []).length > 0;
		},
	},
	[TabType.Dict]       : {
		mk  : mkdict,
		has : function(c, x) {
			return Object.keys(x.d[c.dict || ""] || {}).length > 0;
		},
	},
	[TabType.NavDict] : {
		mk  : mknavdict,
		has : function(c, x) {
			return Object.keys(x.d[c.dict || ""] || {}).length > 0;
		},
	},
	[TabType.DictsChain] : {
		mk  : mkdictschain,
		has : function(c, x) {
			if (!c.dicts) return false;
			for (var i = 0; i < c.dicts.length; i++)
				if (c.dicts[i] in x.d) return true;
			return false;
		},
	},
	[TabType.Imgs]       : {
		mk  : mkimgs,
		has : function(c, x) { return [...x.v].length == 1; },
	},
	[TabType.Links]      : {
		mk  : mklinks,
		has : function(c, x) { return true; },
	},
};

/**
 * Recall:
 *	S.tok : token
 *	S.cs  : configuration associated to the tabitms
 *	S.i   : tabitms index (locally constant)
 *	S.j   : currently enabled tabitm for current tabitms, may be
 *	        changed on click.
 *
 * @param{TabItmsState} S
 * @returns{MBuildableHTMLElement}
 */
function mktabitms(S) {
	// S.cs is a shortcut for S.tabsconf.confs[S.i][S.j] XXX (?)

	// By convention, first tab is the only one containing
	// decomposition tables.
	let isdecomp = (S.i == 0);

	let b = countenabled();

	// None enabled
	if (b == 0) return Dom.mkspan(
		isdecomp ? "[+]" : S.cs[0].name,
		Classes.tabitms,
	);

	// This'll be completed shortly
	let p = Dom.mka("", Classes.tabitms, undefined, "");

	// Enables special CSS rule to make the element fixed-size
	// TODO: move to classes.js
	// (we could tweak also the bare <span> version)
	if (isdecomp) p.classList.add("zhongmu-tabitms-decomp");

	p.setAttribute(Attrs.itmscount,  b.toString());
	if (b > 1) p.classList.add("zhongmu-with-after");

	/**
	 * @returns{number}
	 */
	function countenabled() {
		let [_x, b, _y, _z] = nextenabled(S.cs, S.tok, -1);
		return b;
	}

	/**
	 * Retrieve the next tabitm enabled after the j-th.
	 *
	 * The first one is returned iff j < 0.
	 * If j > 0, the code assumes that cs[j] is enabled.
	 *
	 * Hence, if we found no cs[k], k > j, enabled, then
	 * we look loop to the first one.
	 *
	 * @param{TabItmsConf} cs
	 * @param{Token} t
	 * @param{number} j
	 * @returns{[number, number, number, boolean]}
	 */
	function nextenabled(cs, t, j) {
		let hasloop = false;
		let b = 0;
		let a = 0;
		let l = -1;

		for (let k = 0; k < cs.length; k++)
			if (tabs[cs[k].type].has(cs[k], t)) {
				b++;
				if (k > j && l == -1) { a = b; l = k;};
			}

		if (l == -1 && j >= 0) {
			[a, b, l] = nextenabled(cs, t, -1);
			hasloop = true;
		}
		return [a, b, l, hasloop];
	}

	// XXX zhongmu-tabitms/zhongmu-tabitm attrs/classes removed
	function setup() {
		p.addEventListener("click", function(e) {
			e.preventDefault(); e.stopPropagation();
			p.dispatchEvent(new CustomEvent("zm-tabitms-click", {
				bubbles : true,
				detail  : { i : S.i, j : S.j },
			}));
		});
	}

	/**
	 * @param{boolean} firstbuild
	 * @returns{number}
	 */
	function build(firstbuild) {
		let [a, b, j, hasloop] = nextenabled(S.cs, S.tok, S.j);

		S.j = j;
		let c = S.cs[j];

		// special case: j === undefined iff first build,
		// where we want decomposition to be hidden.
		if (isdecomp && firstbuild)
			hasloop = true;

		p.innerText = isdecomp ? (hasloop ? "[+]"  : "[-]") : c.name;
		p.title     = c.name;

		// Hide decomposition
		if (isdecomp && hasloop) S.j = -1;

		// Set counters and display them iff we have more
		// than one enabled tabitm.
		// TODO: rename attribute to reduce confusion with tabitms/tabitm
		p.setAttribute(Attrs.currentitm, a.toString());

		return S.j;
	}

	// @ts-ignore
	p.build = build;

	setup();
	build(true);

	return p;
}

/**
 * Recall
 *	S.tok : current token
 *	S.tabsconf.confs: configurations for tabitms/tabitm
 *
 *	S.states = [ j0, j1, ... ];
 *	S.active = i2;
 *
 * @param{TabItmsStates} S
 * @returns{BuildableHTMLElement}
 */
function mkheader(S) {
	let p = Dom.mkbuildable("div");
	p.classList.add(Classes.descrheader);

	/**
	 * @param{number} i
	 * @param{number} j
	 * @returns{void}
	 */
	function toggleactive(i, j) {
		p.children[S.active].classList.remove(Classes.tabactive);
		p.children[i].classList.add(Classes.tabactive);
		S.active = i;
		S.states[S.active] = j;
	}

	/**
	 * @returns{void}
	 */
	function setup() {
		let [tc, t] = [S.tabsconf, S.tok];
		let css = tc.confs;

		p.addEventListener("zm-tabitms-click", function(ev) {
			// For typescript: we're sure this really is a CustomEvent
			// (and thus that it carries a .detail field)
			let e = /** @type{CustomEvent} */ (ev);

			// NOTE: we let the event bubble up, but its detail.i/detail.j
			// are "incorrect" from now on, and one should refer
			// to the shared state instead.

			let i = e.detail.i;
			let j = e.detail.j;

			let isactive = i == S.active;
			let isdecomp = i == 0;

			if (!isdecomp) {
				if (i >= p.children.length || i < 0) {
					Assert.assert("Invalid tabitms index '"+i+"'");
					// @ts-ignore
					return;
				}
				let q = /** @type{BuildableHTMLElement} */ (p.children[i]);
				if (q === undefined) {
					// @ts-ignore
					return;
				}

				// If tabitms is already active, rotate
				// XXX for some reasons, typescript thinks q can be undefined,
				// despite the previous check on 'i'.
				if (q !== undefined && isactive) S.states[S.active] =
					/** @type{number} */ (q.build());

				// Otherwise, enable it
				else          toggleactive(i, j);

			// There's no notion of active decomposition tabitms
			} else S.states[0] =
				(/** @type{BuildableHTMLElement} */ (p.children[0])).build();
		});
	}

	/**
	 * @returns{void}
	 */
	function build() {
		// css for "array of cs", not style/CSS related
		let css = S.tabsconf.confs;

		p.innerHTML = '';

		for (let i = 0; i < css.length; i++)
			// When there's a state for the i-th tabitms, we want
			// to display its j-th tabitm; if a non-undefined
			// j is provided to the build(), it'll rotate to the first
			// tabitm enabled (strictly) after the j-th, hence -1 to
			// enable the j-th one.
			//
			// If there's no states for the i-th tabitms, -2 do as
			// well as -1.
			p.appendChild(mktabitms(Object.assign({}, S, {
				cs: css[i], i: i, j: (S.states[i] || -1)-1,
			})));

		toggleactive(S.active, S.states[S.active]);
	}

	// @ts-ignore
	p.build = build;

	setup();

	// Let parent initiate the build (S.i / S.j unset so far) (XXX)

	return p;
}

/**
 * @param{VCutState} S
 * @param{{class : string}} n
 * @returns{BuildableHTMLElement}
 */
function mktabcontent(S, n) {
	let p = Dom.mkbuildable("div");

	p.classList.add(n.class);

	/**
	 * @param{number} i
	 * @param{number} j
	 * param{any}    args
	 * @returns{void}
	 */
	function build(i, j /*, ...args */) {
		let c = S.tabsconf.confs[i][j];

		p.innerHTML = '';

		let q = tabs[c.type].mk(c, S /*, ...args */);
		p.appendChild(q);
		// NOTE: .focus() for keyboards events on navdict
		q.focus();
	}

	// @ts-ignore
	p.build = build;

	// NOTE: building delegated to parent, once S has been adjusted.

	return p;
}

/**
 *
 * @param{VCutState} S
 * @returns{HTMLElement}
 */
function mkword(S) {
	let p = document.createElement("div");

	let w = S.tok.v;
	let c = S.tabsconf.word;

	/** @returns{HTMLElement} */
	function mktext() {
		let q = Dom.mke('div', undefined, Classes.wordtext);
		q.appendChild(Dom.mke('span', w));
		let r = Dom.mke('sup', '', Classes.wordtextsup);
		r.appendChild(Dom.mka(w, Classes.defwordtop));
		q.appendChild(r);
		return q;
	}

	if (c.prependtext) p.appendChild(mktext());

	// NOTE: No need to check for [...w].length == 1 as this is
	// is already performed by Links.mget when it comes to images.
	p.appendChild(Dom.mkimgs(
		Links.mget(c.imgs, w, "imgs"),
		c.single || false,
		Classes.strokesimg,
		'-',
	));

	if (c.appendtext) p.appendChild(mktext());

	return p;
}

/**
 * @param{HCutState} S
 * @returns{HTMLElement}
 */
function mkhcut(S) {
	var p = document.createElement("div");

		var q = document.createElement("div");

			var pheader  = mkheader(S);
			var pcontent = mktabcontent(S, { class : Classes.descrcontent });

			q.classList.add(Classes.descr);
			q.append(pheader, pcontent);

		// TODO: s/decomps/decomp/
		var pdecomp = mktabcontent(S, { class : Classes.decomps });

	p.append(q, pdecomp);

	// We need a little wrapper for this one so as to manage
	// the extra caching arguments (ic/iw)
	function buildcontent() {
		/** @type{Array<number>} */
		let args = [];

		if (S.cache[S.tok.v])
		if (S.cache[S.tok.v].iciw)
		if (S.cache[S.tok.v].iciw[S.active])
		if (S.cache[S.tok.v].iciw[S.active][S.states[S.active]] !== undefined)
			args = S.cache[S.tok.v].iciw[S.active][S.states[S.active]];

		pcontent.build(S.active, S.states[S.active], ...args);
	}

	function listentabitm() {
		var [tc, t] = [S.tabsconf, S.tok];

		p.addEventListener("zm-tabitms-click", function(ev) {
			// We're sure this is a CustomEvent, hence that it
			// has a .detail field
			let e = /** @type{CustomEvent} */ (ev);

			e.preventDefault(); e.stopPropagation();
			var isdecomp = e.detail.i == 0;

			// special case
			if (isdecomp && S.states[0] == -1)
				pdecomp.innerHTML = "";
			else if (isdecomp)
				pdecomp.build(0, S.states[0]);
			else
				buildcontent();

			S.cache[S.tok.v] ||= {
				active : -1,
				states : [],
				iciw   : {},
			};
			S.cache[S.tok.v].active = S.active;
			S.cache[S.tok.v].states = S.states;

			p.dispatchEvent(new CustomEvent("zm-cache-update", {
				bubbles : true
			}));
		});

		// a hcut may contain a 'function mknavdict('; in which
		// case, we'll want to cache the current position, so as
		// to restore it when moving from tab to tab.
		p.addEventListener("zm-nav-move", function(ev) {
			// We're sure this is a CustomEvent, hence that it
			// has a .detail field
			let e = /** @type{CustomEvent} */ (ev);

			e.preventDefault(); e.stopPropagation();
			S.cache[S.tok.v] ||= {
				active : -1,
				states : [],
				iciw   : {},
			};
			S.cache[S.tok.v].iciw ||= {};
			S.cache[S.tok.v].iciw[S.active] ||= {};
			S.cache[S.tok.v].iciw[S.active][S.states[S.active]] = e.detail;

			p.dispatchEvent(new CustomEvent("zm-cache-update", {
				bubbles : true
			}));
		});
	}

	/**
	 * @param{Token} t
	 * @param{TabItmsConfs} cs
	 * @param{DefDispConf} ps
	 * @returns{[number|undefined, number|undefined]}
	 */
	function getdefaultdisp(t, cs, ps) {
		for (var i = 0; i < ps.length; i++)
		for (var j = 0; j < cs.length; j++)
		for (var k = 0; k < cs[j].length; k++)
			if (cs[j][k].name == ps[i])
			if (tabs[cs[j][k].type].has(cs[j][k], t))
				return [j, k];

		return [undefined, undefined];
	}

	function setup() {
		listentabitm();

		// TODO: check that those are within bounds.
		if (S.cache[S.tok.v]) {
			S.active = S.cache[S.tok.v].active;
			S.states = S.cache[S.tok.v].states;

			return;
		}

		var [i, j] = getdefaultdisp(
			S.tok,
			S.tabsconf.confs,
			S.tabsconf.defaultdisplay || []
		);

		if (i === undefined || j === undefined) {
			Assert.assert("TODO tabdefaultdisplay not found", i !== undefined);
			// @ts-ignore
			return;
		}

		S.active           = i;
		S.states[S.active] = j;
	}

	setup();

	pheader.build();
	buildcontent();

	if (S.states[0] !== undefined && S.states[0] != -1)
		pdecomp.build(0, S.states[0]);

	return p;
}

/**
 * @param{VCutState} S
 * @returns{HTMLElement}
 */
function mkvcut(S) {
	var p = document.createElement("div");
	p.classList.add(Classes.vcut);

	p.appendChild(mkword(S));
	p.appendChild(mkhcut(Object.assign({}, S, {
		active : -1,
	})));

	return p;
}

/**
 * Create a vcuts: a list of vcut (vertical cut). Each vertical
 * cut holds a word on one side of the cut, and random informations
 * about that word on the other side.
 *
 * @param{VCutsState} S
 * @returns{BuildableHTMLElement}
 */
function mkvcuts(S) {
	var p = Dom.mkbuildable("div");

	// TODO rename/document (at least used for help/kao)
	p.classList.add(Classes.vcuts);

	function build() {
		// XXX clarify when this actually happens, if ever.
		// (TODO: typically where we'll want a log)
		if (!S.ts) return;

		p.innerHTML = "";
		for (var i = 0; i < S.ts.length; i++)
			p.appendChild(mkvcut(Object.assign({}, S, {
				tok    : S.ts[i], vcutn : i,
				states : [],
			})));
	}

	p.build = build;

	build();

	return p;
}

/**
 *
 * @param{WithStack} S
 * @returns{BuildableHTMLElement}
 */
function mkstack(S) {
	var p = Dom.mkbuildable("div");

	// TODO rename/document (for now, only used to target
	// for style for help/kao)
	p.classList.add("zhongmu-stack");

	function build() {
		p.innerHTML = "";

		for (var i = 0; i < S.stack.xs.length; i++) {
			// Words are clickable, allowing to navigate the stack
			// TODO: rename decword -> stackword
			p.appendChild(Dom.mka(S.stack.xs[i], Classes.decword));

			// Words are separated by dashes
			if (i < S.stack.xs.length-1)
				p.appendChild(Dom.mkdash());
		}

		return p;
	}

	p.build = build;

	return p;
}

/**
 * Setup a stackvcuts component. This is to allow
 * components to embed a pstack/pvcuts (created from
 * mkstack/mkvcuts) without them being forced into
 * the HTML layouts of a stackvcuts.
 *
 * @param{BuildableHTMLElement} p
 * @param{VCutsState} S
 */
function setupstackvcuts(p, S) {
	function listendefword() {
		/**
		 * @param{Event} e
		 * @returns{boolean}
		 */
		function handler(e) {
			let s = Dom.gettarget(e).innerText;
			console.log("handling defword", e, s);
			if (S.stack.push(s)) p.build();
			p.dispatchEvent(new CustomEvent("zm-cache-update"));
			return false;
		}

		Dom.alisten(Classes.defword, handler, p);

		// Sub-stackgrids are automatically flagged as such
		// on creation; by design, defwordtop are always pushed
		// on the main (top) stack.
		if (!S.hasstack)
			Dom.alisten(Classes.defwordtop, handler, p);
	}

	function listendecword() {
		Dom.alisten(Classes.decword, function(e) {
			let s = Dom.gettarget(e).innerText;

			// Remove pointed element only
			// TODO: this is slightly incorrect, as
			// we're deleting the last occurence of s in
			// the stack instead of the clicked one.
			if (e.ctrlKey)           S.stack.del(s);

			// double click
			else if (e.detail >= 2)  S.stack.popto(s);

			// simple click: just move
			else                     S.stack.backto(s);

			p.build();

			p.dispatchEvent(new CustomEvent("zm-cache-update"));

			return false;
		}, p);
	}

	function listenaudio() {
		// Always only managed once, by the top grid
		if (!S.hasstack)
		Dom.alisten(Classes.audio, function(e) {
			let p  = Dom.gettarget(e);
			let xs = p.getAttribute(Attrs.pinyins) || "";

			// We may have multiple pinyin, eventually capitalized
			Dom.mksound(xs.toLowerCase().split(" ").reduce(
				/**
				 * @param{Array<[string,string]>} acc
				 * @param{string} x
				 * @returns{Array<[string,string]>}
				 */
				function(acc, x) {
					let l = Links.get(User.prefs.audio, x, "audio");
					acc.push([x, l ? l[1] : ""]);
					return acc;
				}, []
			)).play();
			return false;
		}, p);
	}

	function listenforcache() {
		// TODO: essentially, dump this to a string and store
		// to #, and make sure we can load state from # too.
/*
		p.addEventListener("zm-cache-update", function(e) {
			console.log(JSON.stringify(S.cache, null, 4));
			console.log(JSON.stringify(S.stack.xs, null, 4));
			console.log(JSON.stringify(S.stack.n, null, 4));
		});
*/
	}

	function setup() {
		listendefword();
		listendecword();
		listenaudio();
		listenforcache();

		// TODO: for instance, if you display a word's decomposition,
		// open it in a navdict, and encounter this word again in the
		// navdict, then we'll try to display the word using the caching
		// information for this word, and indefinitely recurse.
		//
		// Maybe we could be smarter, and offer a better UI, but for
		// now, this'll do.
		if (S.hasstack) {
			console.log("stackoverflow prevention");
			S.cache = {};
		}

		// inform later setupstackvcuts that there's a working
		// stack higher in the DOM (us).
		S.hasstack = true;
	}

	setup();
}

/**
 *
 * @param{VCutsState} S
 * @param{BuildableHTMLElement} pstack
 * @param{BuildableHTMLElement} pvcuts
 */
function buildstackvcuts(S, pstack, pvcuts) {
	let w = S.stack.current();

	// TODO: this e.g. happens in mkindex(); clarify
	if (w === undefined) return;

	S.ts = Data.cut(w);
	pstack.build();
	pvcuts.build();
}

/**
 * @param{VCutsState} S
 * @param{{class ?: string, nohelp ?: boolean}} [n]
 * @returns{BuildableHTMLElement}
 */
function mkstackvcuts(S, n) {
	let p = Dom.mkbuildable("div");
	n ||= {class : "", nohelp : false};

	if (n.class) p.classList.add(n.class);

	let pstack = mkstack(S);
	let pvcuts = mkvcuts(S);

	function build() { buildstackvcuts(S, pstack, pvcuts);  }

	if (!n.nohelp) p.appendChild(mkinlinehelp());

	p.appendChild(pstack);
	p.appendChild(pvcuts);

	p.build = build;

	setupstackvcuts(p, S);
	build();

	return p;
}

// a <span> containing a button and a modal. The former toggles
// visibility of the latter; the latter contains a closing button
// (but clicking outside the modal
// also exits it), and whatever's returned by n.f().

/**
 * param{} S
 * @param{MBuildableHTMLElement} r
 * @param{{class ?: string, text : string}} n
 * @returns{BuildableHTMLElement}
 */
function mkmodalbtnwith(r, n) {
	let p = Dom.mkbuildable("span");

		let b = document.createElement("button");
		b.innerText = n.text;
		if (n.class) b.classList.add(n.class);

		let m = document.createElement("span");
		m.style.display = "none";
		m.classList.add("zhongmu-modal");

			let q = document.createElement("span");
			q.classList.add("zhongmu-modal-content");

				let c = document.createElement("button");
				c.innerText = "×";
				c.classList.add("zhongmu-modal-close-btn");

				r.classList.add("zhongmu-modal-content");

			q.append(c, r);

		m.appendChild(q);

	p.append(b, m);

	function setup() {
		c.addEventListener("click", function(e) {
			e.preventDefault(); e.stopPropagation();
			Dom.hide(m);
		});
		b.addEventListener("click", function(e) {
			e.preventDefault(); e.stopPropagation();
			Dom.show(m);
		});

		// Clicking outside the modal when its displayed
		document.addEventListener("click", function(e) {
			let r = Dom.gettarget(e);

			if (Dom.isshown(m))
			if (!m.children[0].contains(r))
				Dom.hide(m);
		});
	}

	// NOTE: used for toc in pnav in view/book.js
	// TODO: f is useless, we could just create the element first
	// and thus avoid this
	function build() {
		// @ts-ignore
		if (r.build) r.build();
	}

	setup();

	p.build = build;

	return p;
}

/**
 * param{} S
 * @returns{HTMLElement}
 */
function mkhelp(/* S */) {
	var p = document.createElement("span");
	var q = document.createElement("span");

	q.innerHTML = `
		<h2>Why?</h2>
		<p>
			So far, mainly to help the study of written Chinese language;
			see the following article as an informal introduction:
		</p>
		<ul>
			<li>
				<b>English</b>:
				<a href="https://tales.mbivert.com/on-chinese-language/">On Chinese language</a>;
			</li>
			<li>
				<b>Français</b>:
				<a href="https://tales.mbivert.com/fr/du-chinois/">Du Chinois</a>.
			</li>
		</ul>

		<h2>How?</h2>
			<ul>
				<li>
					<span class="kao-word">Word being decomposed/analyzed;</span>
				</li>
				<li>
					<span class="kao-ancient-forms">Bronze and Seal ancient forms,
					if any;</span>hover to distinguish;
				</li>
				<li>
					<span class="kao-decomps">Toggle decomposition(s),
					if any (click to toggle);</span>
				</li>
				<li><span class="kao-stack">Inspected words stack</span>:
					<ul>
						<li>
							Try clicking on a <span class="kao-defword">word</span>
							or on a <span class="kao-defword-top">word</span>, for
							instance after having <span class="kao-decomps">toggled</span>
							decompositions;
						</li>
						<li>
							Single click on a <span class="kao-stack">word</span> to
							navigate within the stack;
						</li>
						<li>
							Double click on a <span class="kao-stack">word</span>
							to clear all words at its right;
						</li>
						<li>
							Click while pressing the ctrl key to remove a
							<span class="kao-stack">word</span> from the stack;
						</li>
					</ul>
				</li>
				<li>
					<span class="kao-tabs">Toggle definitions, images, etc.
					(click to toggle):</span>
					<ol>
						<li>
							Definitions (english and pictographic interpretations,
							if any);
						</li>
						<li>
							Inspectable ancient Chinese dictionary
							entry (<a href="https://en.wikipedia.org/wiki/Shuowen_Jiezi"
							title="→ wikipedia" class="wp-link">說文</a>), if any;

							<ul>
								<li>
									Click on the <span class="kao-arrows">arrows</span>
									or in the <span class="kao-dict-text">text</span>,
									or use the keyboard’s arrows to move;
								</li>
								<li>
									Note that it has its own
									<span class="kao-dict-stack">stack</span>;
								</li>
								<li>
									Clicks on <span class="kao-defword-top">words</span>
									will always use the <span class="kao-stack">main stack</span>,
									while clicks on <span class="kao-defword">words</span>
									will use the closest stack;
								</li>
							</ul>
						</li>
						<li>
							(Available) strokes and (all available) ancient forms;
							hover to distinguish;
						</li>
						<li>External links;</li>
					</ol>
				</li>
			</ul>`;

		let helptc = {
			"defaultdisplay" : ["defs", "links"],
			"word" : {
				"prependtext" : true,
				"single"      : false,
				"imgs"        : [ "wm-bronze", "wm-seal" ],
			},
			"confs" : [
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
						"type"   : TabType.DictsChain,
						"dicts"  : ["CC-CEDICT", "ZM-add", "CC-CEDICT-singles"],
					},
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
						"defaultdisplay" : undefined,
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
						"imgs"   : [
							"wm-oracle", "wm-bronze",
							"wm-silk",   "wm-seal",
							"wm-bigseal"
						],
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
		};
		p.appendChild(q);

		let r = mksingle("考", /** @type{TabsConf} */ (helptc), true);
		r.id = "kao";

		p.appendChild(r);
	return p;
}

/**
 * @returns{BuildableHTMLElement}
 */
function mkinlinehelp(/* S */) {
	return mkmodalbtnwith(/* S, */ mkhelp(/* S */), {
		text : "?", class : "zhongmu-help-btn"
	});
}

/**
 * ccc : current chunk container
 * @param{WithMove} S
 * @returns{BuildableHTMLElement}
 */
function mkbasiccc(S) {
	var p = Dom.mkbuildable("div");

	function build() {
		// TODO: this happens e.g. in mkindex(); clarify
		if (!S.move.cs)
			return;

		// Current chunk content, length
		// We need an utf8 character array for slicing
		// to work properly, e.g. bugs on 𡕥：舉
		var s = [...S.move.cc().v];
		var n = s.length;

		// Current word slicing integers
		var [i, j] = [S.move.cw().i, S.move.cw().j];

		p.innerHTML = "";
		p.append(
			Dom.mkspan(s.slice(0, i).join("")),
			Dom.mkspan(s.slice(i, j).join(""), Classes.hlcw),
			Dom.mkspan(s.slice(j, n).join("")),
		);
	}

	function setup() { listenmousemove(p); }

	p.build = build;

	setup();
	build();

	return p;
}

/** @param{HTMLElement} p */
function listenmousemove(p) {
	p.addEventListener("click", function (e) {
		// Those are handled by handlepiece() (TODO)
		if (e.ctrlKey) return;

		let x = Dom.countbyteoffset(e, p);
		e.stopPropagation();
		if (x) p.dispatchEvent(new CustomEvent("zm-mouse-move", {
			bubbles : true,
			detail : x[2],
		}));

	});
}
var mainhandler = false;

/**
 * @param{MMovableBuildableHTMLElement} p
 * @param{HTMLElement} psrc
 * @param{SingleNavState} S
 * @param{string} keys
 * @returns{void}
 */
function setupwithnav(p, psrc, S, keys) {
	keys ||= "basic";

	/**
	 * @param{MoveDir} d
	 * @param{MoveWhat|number} w
	 * @returns{void}
	 */
	function moveandbuild(d, w) {
		// s/move/mover/
		var [ic, iw] = p.move ? p.move(d, w) : S.move.move(d, w);

		if (ic == -1        || iw == -1)        return;
		if (S.move.ic == ic && S.move.iw == iw) return;

		S.move.ic = ic;
		S.move.iw = iw;
		S.stack.reset(); S.stack.push(S.move.cwv());
		p.build();
		p.dispatchEvent(new CustomEvent("zm-nav-move", {
			bubbles : true,
			detail : [S.move.ic, S.move.iw],
		}));
	}

	function listenmousemove() {
		psrc.addEventListener("zm-mouse-move", function(ev) {
			let e = /** @type{CustomEvent} */ (ev);
			moveandbuild(/** @type{MoveDir} */ (MoveDir.Offset), e.detail);
			e.stopPropagation();
			e.preventDefault();
		});

	}

	/* @type{Object.<string, Array<{ k : string, m : string, d : MoveDir, w : MoveWhat }>>} */
	/** @type{Object.<string, Array<{ k : string, m : string, d : string, w : string }>>} */
	var kmvs = {
		"basic" : [
			{ k : "ArrowRight", m : "alt",  d : MoveDir.Next, w : MoveWhat.Chunk },
			{ k : "ArrowRight", m : "",     d : MoveDir.Next, w : MoveWhat.Word  },
			{ k : "ArrowLeft",  m : "alt",  d : MoveDir.Prev, w : MoveWhat.Chunk },
			{ k : "ArrowLeft",  m : "",     d : MoveDir.Prev, w : MoveWhat.Word  },
		],
		"onechunk" : [
			{ k : "ArrowRight", m : "",     d : MoveDir.Next, w : MoveWhat.Word  },
			{ k : "ArrowLeft",  m : "",     d : MoveDir.Prev, w : MoveWhat.Word  },
		],
		"pcs" : [
			{ k : "ArrowRight", m : "alt",  d : MoveDir.Next, w : MoveWhat.Chunk },
			{ k : "ArrowRight", m : "ctrl", d : MoveDir.Next, w : MoveWhat.Piece },
			{ k : "ArrowRight", m : "",     d : MoveDir.Next, w : MoveWhat.Word  },
			{ k : "ArrowLeft",  m : "alt",  d : MoveDir.Prev, w : MoveWhat.Chunk },
			{ k : "ArrowLeft",  m : "ctrl", d : MoveDir.Prev, w : MoveWhat.Piece },
			{ k : "ArrowLeft",  m : "",     d : MoveDir.Prev, w : MoveWhat.Word  },
		],
	};

	function listenkeymove() {
		psrc.addEventListener("keydown", function(e) {
			var q = Dom.gettarget(e);

			for (var i = 0; i < kmvs[keys].length; i++) {
				if (e.key != kmvs[keys][i].k)                        continue;
				if ((kmvs[keys][i].m || "") == "ctrl" && !e.ctrlKey) continue;
				if ((kmvs[keys][i].m || "") == "alt"  && !e.altKey)  continue;
				e.preventDefault(); e.stopPropagation();
				// @ts-ignore
				moveandbuild(kmvs[keys][i].d, kmvs[keys][i].w)
				break;
			}

			// This is so that the main handler doesn't trigger the
			// event again
			e.preventDefault(); e.stopPropagation();
		});
	}

	function listenbtns() {
		// TODO: ../events.js ?
		p.addEventListener("zm-move-btn", function(ev) {
			// We're sure this is a CustomEvent, equipped with
			// a .detail field.
			let e = /** @type{CustomEvent} */ (ev);
			moveandbuild(e.detail[0], e.detail[1]);
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
	}

	// TODO: perhaps we could be a bit more generous, and
	// also handle keydown events on e.g. pnav/pstack
	// in the case of a mknavdict()?
	function listenmain() {
		// TODO: navigateable should still be around;
		// store this to a Classes.
		psrc.classList.add("zhongmu-navigable");

		if (mainhandler) return; mainhandler = true;
		var [x, y] = [-1, -1];

		document.addEventListener("mousemove", function(e) {
			[x, y] = [e.clientX, e.clientY];
		});

		document.addEventListener("keydown", function(e) {
			var q = document.elementFromPoint(x, y);
			if (!q) return;

			var r = q.closest('[class*="zhongmu-navigable"]');
			if (!r || !r.classList.contains("zhongmu-navigable")) return;

			// Feels better without the focus
//			r.focus();
			r.dispatchEvent(new KeyboardEvent("keydown", {
				key     : e.key,
				ctrlKey : e.ctrlKey,
				altKey  : e.altKey,
			}));
		});
	}

	function listenall() {
		listenmousemove();
		listenkeymove();
		listenbtns();
		listenmain();
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
	//
	// tabindex is necessary to generate keyboard events on "irregular" (w.r.t.
	// keyboard events) nodes. Some weird outline is automatically created then,
	// so we remove it.
	psrc.setAttribute("tabindex", "-1");
	psrc.style.outline = "none";

	listenall();
}

/**
 * TODO: clarify when n.type isn't a div.
 *
 * param{{ type : string, btns : Array<[string, MoveDir, MoveWhat]> }} n
 * @param{{ type ?: string, btns : Array<[string, string, string]> }} n
 * @returns{HTMLElement}
 */
function mknav(n) {
	let p = document.createElement(n.type || "div");
	p.classList.add(Classes.navbtns);

	n.btns.forEach(function(b) {
		let q = document.createElement("button");
		q.innerText = b[0];
		q.addEventListener("click", function(e) {
			e.preventDefault(); e.stopPropagation();
			q.dispatchEvent(new CustomEvent("zm-move-btn", {
				bubbles : true,
				detail  : [b[1], b[2]],
			}));
		});
		p.appendChild(q);
	});

	return p;
}

/**
 * Actually creates a standalone component to navigate through
 * a piece of text.
 *
 * The state has been fully prepared by the caller ':/function mksinglenav\('
 *
 * @param{SingleNavState} S - single nav's state (stack, move, conf, etc.)
 * @returns{BuildableHTMLElement}
 */
function mksinglenavaux(S) {
	let p = Dom.mkbuildable("div");

	let pnav   = mknav({ btns : [
		[ "←", MoveDir.Prev, MoveWhat.Word ],
		[ "→", MoveDir.Next, MoveWhat.Word ]
	] });

	let pstack = mkstack(S);
	let psrc   = mkbasiccc(S);
	let pvcuts = mkvcuts(S);

	// only when substackvcuts (~ !hasstack) ? XXX/TODO + rename
	// (at least, we don't want this in setupwithnav,
	// as we don't want it e.g. on index.js' psrc)
	if (S.hasstack) p.classList.add(Classes.subsinglenav);

	p.append(pnav, pstack, psrc, pvcuts);

	function setup() {
		S.stack.push(S.move.cwv());

		setupstackvcuts(p, S);
		setupwithnav(p, psrc, S, "onechunk");

		// NOTE: Ideally, we'd want p.focus() here, but this is
		// useless until p has been added to the DOM.
	}

	function build() {
		buildstackvcuts(S, pstack, pvcuts);
		psrc.build();
	}

	p.build = build;

	setup();
	build();

	return p;
}

/****************************************************************
 * Entry points.
 */

/**
 * Creates a standalone component to inspect a single character.
 *
 * @param{string}    w     - word(s) to inspect
 * @param{TabsConf} [tc]   - grid configuration
 * @param{boolean}  [nohelp]
 * @returns{HTMLElement}
 */
function mksingle(w, tc, nohelp) {
	let stack = Stack.mk();

	// XXX This isn't clearly documented, and a bit fragile, as we may
	// have dictionary entries containing spaces. For now, this is a hack
	// to allow to view multiple words through the stack.
	//
	// A better option would be for w to be ws already.
	//
	// NOTE: we're not doing a stack.xs = ws, because the stack.push()
	// will do things like trimming duplicates.
	let ws = w.split(" ");
	for (var i = 0; i < ws.length; i++)
		stack.push(ws[i]);

	// Select (show) first word
	stack.n = 0;

	return mkstackvcuts(/** @type{VCutsState} */ {
		stack    : stack,
		// TODO: document (likely, used when going recursive)
		tabsconf : tc ||= User.prefs.tabs,
		cache    : {},
		ts       : [],
		hasstack : false,
	}, { class : Classes.singleword, nohelp : nohelp });
}

/**
 * Creates a standalone component allowing to move
 * through a string one word at a time.
 *
 * @param{string} s - string to inspect / navigate in
 * @param{UIBaseConf} [S] - Configuration; to be extended as a state inside
 * @param{number} [ic] - chunk index
 * @param{number} [iw] - word index (in current chunk)
 * @returns{HTMLElement}
 */
function mksinglenav(s, S, ic, iw) {
	let ts    = Data.tokenize(s);
	let stack = Stack.mk();
	let move  = Move.mk([{
		t  : ChunkType.Paragraph,
		v  : s,
		ts : ts,
	}], ic, iw);

	S ||= {};

	return mksinglenavaux(/** @type{SingleNavState} */{
		stack    : stack,
		move     : move,
		tabsconf : S.tabsconf || User.prefs.tabs,
		cache    : S.cache || {},
		ts       : [],

		// remember, boolean true iff there's a higher stack
		// in the DOM.
		hasstack : S.hasstack || false,
	});
}

return {
	"mksingle"        : mksingle,
	"mksinglenav"     : mksinglenav,

	"mkhelp"          : mkhelp,

	"mkmodalbtnwith"  : mkmodalbtnwith,
	"mkbasiccc"       : mkbasiccc,
	"mkstackvcuts"    : mkstackvcuts,
	"mknav"           : mknav,
	"setupwithnav"    : setupwithnav,

	"listenmousemove" : listenmousemove,
};

})();// XXX "module" name is a bit unorthodox. Same goes for the ./*/*.js
let Dict = (function() {
/**
 * Remove ys entries from xs; keeping track of ys
 * entries that aren't found in xs.
 *
 * We work on a xs copy, as we don't want to alter the
 * underlying dicts being used.
 *
 * @param{Array<string>} xs -
 * @param{Array<string>} ys
 * @returns{[Array<string>, Array<string>]} - altered copy of xs, and missing entries
 */
function chainrm(xs, ys) {
	let ms = [];

	let zs = Utils.copyarray(xs);

	for (var i = 0; i < ys.length; i++) {
		var found = false;

		// Try to remove ys[i] from zs
		for (var j = 0; j < zs.length; j++)
			if (zs[j] == ys[i]) {
				zs.splice(j, 1);
				found = true;
				break;
			}

		// Keep track of missed entries.
		if (!found) ms.push(ys[i]);
	}

	return [zs, ms];
}

/**
 * Creates a DictSoundEntry by patching multiple entries.
 *
 * NOTE: we've changed the semantic from previous implementation (how so...)
 *
 * @param{Array<DictSoundEntry>} xs
 * @returns{[DictSoundEntry, Array<string>]} - also returns missing entries
 */
function chainsound(xs) {
	/** @type{DictSoundEntry} */
	let r = { ds : [] };

	// Missing entries
	let ms = [];

	for (let i = 0; i < xs.length; i++) {
		// Remove xs[i]'s entries from r.ds
		if (xs[i].rm) {
			let es = [];
			[r.ds, es] = chainrm(r.ds, xs[i].ds);
			ms.push(...es);
			r.tw = true;
		}

		// XXX We could ensure unicity (hasn't been an issue so far)
		else r.ds.push(...xs[i].ds);
	}

	return [r, ms];
}

/**
 * Create a DictEntry by patching all those from e pointed
 * by dictionary names contained in xs.
 *
 * @param{DictsEntries}   e
 * @param{Array<string>} xs
 * @returns{[DictEntry, Array<string>]}
 */
function chain(e, xs) {
	/**
	 * Returned entry.
	 *
	 * @type{DictEntry}
	 */
	let r = {};

	/**
	 *
	 *
	 * @type{Object<string, DictSoundEntries>}
	 */
	let ps = {};

	/**
	 *
	 *
	 * @type{Array<string>}
	 */
	let ms = [];

	// In e, we have dict name -> sound -> defs;.
	//
	// We want here sound -> [defs], for each defs
	// registered in dicts for that sound.
	for (var i = 0; i < xs.length; i++)
		if (xs[i] in e) Object.keys(e[xs[i]]).forEach(function(p) {
			if (!(p in ps)) ps[p] = [];
			ps[p].push(...e[xs[i]][p]);
		});

	// Actually chain those definitions
	Object.keys(ps).forEach(function(p) {
		let es = [];
		r[p] = [{ds:[]}];
		[r[p][0], es] = chainsound(ps[p]);
		ms.push(...es);
	});

	return [r, ms];
}

return {
	"chainrm"    : chainrm,
	"chainsound" : chainsound,
	"chain"      : chain,
};

})();
let ViewBook = (function() {

/**
 * @param{WithMove} S
 * @returns{BuildableHTMLElement}
 */
function mktitle(S) {
	var p = Dom.mkbuildable("span");

	function build() {
		for (var i = 0; i < S.move.cn(); i++)
			if (S.move.cc(i).t == ChunkType.Title) {
				p.innerText = S.move.cc(i).v;
				break;
			}
	}

	// NOTE: build() necessary because we need to wait
	// for the book to be loaded.
	p.build = build;

	return p;
}

/**
 * @param{WithMove} S
 * @returns{BuildableHTMLElement}
 */
function mksection(S) {
	var p = Dom.mkbuildable("span");

	function build() {
		for (var i = S.move.ic; i >= 0; i--)
			if (S.move.cc(i).t == ChunkType.Section) {
				p.innerText = S.move.cc(i).v;
				return;
			}
	}

	p.build = build;

	return p;
}

/**
 * @param{WithMove} S
 * @returns{BuildableHTMLElement}
 */
function mkcn(S) {
	var p = Dom.mkbuildable("span");

	function build() { p.innerText = "Chunk: "+(S.move.ic+1)+"/"+S.move.cn(); }
	p.build = build;

	return p;
}

/**
 * @param{WithMove} S
 * @returns{BuildableHTMLElement}
 */
function mktoc(S) {
	var p = Dom.mkbuildable("span");

	function build() {
		p.appendChild(Dom.mkspan("目錄", Classes.toctitle));
		p.appendChild(Dom.mktoc(Markdown.gettoc(S.move.cs)));
	}

	p.build = build;

	return p;
}

/**
 * @param{BookState} S
 * @param{MMovableBuildableHTMLElement} p
 * @param{HTMLElement} psrc
 * @param{HTMLElement} ptoc
 * @param{Array<BuildableHTMLElement>} qs
 * @param{Array.<SVarDescr>} svars
 * @param{string} navtype
 */
function setup(S, p, psrc, ptoc, qs, navtype, svars) {
	View.setupwithnav(p, psrc, S, navtype);

	/**
	 * @param{Event} [e]
	 */
	function movehandler(e) {
		qs.forEach(function(q) { q.build(); });
		// NOTE: if we write to document.location.hash, we'll
		// generate a popstate event that will be caught by
		// spa.js everytime we move around.
		//
		// It seems we can't distinguish that popstate from
		// a regular movement in history, so it's best to avoid
		// generating it in the first place, so that we can
		// actually manage history movement in spa.js.
		//
		// It feels a bit brittle, and is inefficient, as we'll
		// use SPA.navigate() instead of moving around a book
		// when the history points to a different position in a
		// book, and not to another page.
//		document.location.hash = Bookmark.dump(S, svars);
		history.pushState(null, null, document.location.pathname + "#" + Bookmark.dump(S, svars));
	}

	p.addEventListener("zm-nav-move", movehandler);

	/*
	 * NOTE: because of the SPA, we could even not do that
	 * anymore. This avoids rebuilding the page though.
	 */
	Dom.alisten(Classes.tocentry, function(e) {
		console.log(e);
		if (!(e.target instanceof HTMLAnchorElement)) {
			Assert.assert("ToC entry is not a <a>");
			return;
		}
		var b = Bookmark.preload((e.target.hash || '#').slice(1));
		if (!("c" in b)) {
			Assert.assert("Toc entry has no c= in href");
			return;
		}
		var c = parseInt(b.c);
		if (isNaN(c) || c > S.move.cn()) {
			Assert.assert("Toc entry's c NaN or too great ("+c+")");
			return;
		}
		[S.move.ic, S.move.iw] = [c, 0];
		S.stack.push(S.move.cwv());
		p.build();
		movehandler();
		// XXX fragile
		Dom.hide(/** @type{HideableHTMLElement} */ (ptoc.children[1]));
		console.log("oook");
		return false;
	}, ptoc);
}

/**
 * @param{BookState} S
 * @param{Array<BuildableHTMLElement>} ps
 * @param{Array.<SVarDescr>} svars
 * @param{() => Array<string>} fns
 */
function init(S, ps, svars, fns) {
	Bookmark.load(S, svars);
	return Promise.all(Data.mget(fns())).then(function(xs) {
		S.move.init(
			// By convention, the first file (fns[0]/xs[0]) must
			// be the book's content.
			Data.parseandtok(xs[0]),
			// those potentially came from the bookmark (TODO)
			S.move.ic, S.move.iw
		)
		S.stack.push(S.move.cwv());

		ps.forEach(function(p) { p.build(); });
		return xs;
	});
}

/**
 * @param{BookState} S
 * @returns{Promise<BuildableHTMLElement>}
 */
function mkbook(S) {
	var p = Dom.mkbuildable("div");

	var svars = [
		{ bn : "c", sn : "move.ic", type : SVarType.Number },
		{ bn : "w", sn : "move.iw", type : SVarType.Number },
		{ bn : "b", sn : "book",    type : SVarType.String },
	];

	var ptitle   = mktitle(S);
	var psection = mksection(S);
	var pcn      = mkcn(S);
	var psrc     = View.mkbasiccc(S);
	var pdec     = View.mkstackvcuts(Object.assign({}, S, {
		ts : [],
	}));

	var pnav = document.createElement("div");

		var pnav0 = View.mknav({ type : "span", btns : [
			[ "⇦", MoveDir.Prev, MoveWhat.Chunk ],
			[ "←", MoveDir.Prev, MoveWhat.Word ]
		]});

		var ptoc = View.mkmodalbtnwith(mktoc(S), { text : "目錄" });

		var pnav1 = View.mknav({ type : "span", btns : [
			[ "→", MoveDir.Next, MoveWhat.Word ],
			[ "⇨", MoveDir.Next, MoveWhat.Chunk ]
		] });

		pnav.append(pnav0, ptoc, pnav1);

	var pfontsave = document.createElement("div");

		var pfont = document.createElement("button");
		pfont.innerText = "User bettor font";
		pfont.style.display = "none";

		var psave  = document.createElement("save");
		psave.innerText = "Save";
		psave.style.display = "none";

		pfontsave.append(pfont, psave);

	ptitle.id    = "title";
	psection.id  = "section";
	pcn.id       = "cn";
	pnav.id      = "nav";
	psrc.id      = "src";
	pdec.id      = "dec";
	pfont.id     = "font"
	psave.id     = "save";
	pfontsave.id = "font-save";

	p.classList.add("main-book");

	p.append(ptitle, psection, pcn, pnav, pfontsave, psrc, pdec);

	function xsetup() {
		setup(S, p, psrc, ptoc, [ptitle, psection, pcn], "basic", svars);
	}

	function xbuild() { pdec.build(); psrc.build(); }

	// S.book is provided upon bookmark loading, so fns() will
	// only be correct *after* bookmark loading (and hence why
	// it's not a static list)
	function fns() { return ["data/books/"+S.book+".src"]; }

	function xinit() {
		return init(
			S,     [pdec, psrc, ptitle, psection, pcn, ptoc],
			svars, fns
		);
	}

	// for setupwithnav
	p.build = xbuild;

	xsetup();

	return xinit().then(function() { return p; });
}

/**
 * @param{TabsConf} [tc]
 */
function mk(tc) {
	return mkbook(/** @type{BookState} */{
		stack    : Stack.mk(),
		move     : Move.mk(),
		tabsconf : tc ||= User.prefs.tabs,
		hasstack : false,
		cache    : {},
		book     : "",
		ts       : [],
	});
}

return {
	"mk"        : mk,
	"mktitle"   : mktitle,
	"mksection" : mksection,
	"mkcn"      : mkcn,
	"mktoc"     : mktoc,

	"setup"     : setup,
	"init"      : init,
};

})();let ViewBooks = (function() {

/**
 * For now, just a static list. Eventually, we'll want
 * to loop on our database, as we do for ./about.js.
 *
 * But we'll then have to distinguish between "public" and
 * "private" books.
 *
 * @returns{HTMLElement}
 */
function mk() {
	let p = document.createElement("div");
	p.classList.add("main-books");

	p.innerHTML = `
	<p>San Bai Qian:</p>
	<ul>
		<li><a href="trbook.html#b=san-zi-jing">Sānzì Jīng (三字經)</a>;</li>
		<li><a href="trbook.html#b=san-zi-jing-fr">Sānzì Jīng (三字經) (français)</a>;</li>
		<li><a href="book.html#b=bai-jia-xing">Bǎijiā Xìng (百家姓)</a>;</li>
		<li><a href="book.html#b=qian-zi-wen">Qiānzì Wén (千字文)</a>.</li>
	</ul>
	<p>Seven military classics of ancient China (武經七書):</p>
	<ul>
		<li><a href="trbook.html#b=art-of-war">Sun-Tzu's Art of war (孫子兵法, partial)</a>.</li>
	</ul>
	<p>Ancient dictionaries:</p>
	<ul>
		<li><a href="book.html#b=shuo-wen-jie-zi">Shuōwén Jiězì (說文解字)</a>.</li>
	</ul>
	<p>Russian test:</p>
	<ul>
		<li><a href="book.html#b=father-serge-tolstoi">Father Serge, Tolstoï (Отец Сергий, Толстой)</a>.</li>
	</ul>
`;

	// That's clumsy :shrug
	document.body.style.height   = "unset";
	document.body.style.overflow = "unset";

	document.getElementsByTagName("html")[0].style.height   = "unset";
	document.getElementsByTagName("html")[0].style.overflow = "unset";

	return p;
}

return {
	"mk" : mk,
};
})();
let ViewIndex = (function() {

/** @returns{HTMLTextAreaElement} */
function mkinput() {
	let p = document.createElement("textarea");
	p.setAttribute("rows", "5");
	p.setAttribute("id",   "input");
	p.value = "你好，世界";
	return p;
}

/**
 * @param{IndexState} S
 * @returns{BuildableHTMLElement}
 */
function mkresults(S) {
	var p = Dom.mkbuildable("span");
	p.setAttribute("id", "results");

	/** @param{[string, string]} xs */
	function build(xs) {
		p.innerHTML = '';
		var ul = document.createElement("ul");

		xs.forEach(function(x) {
			var li = document.createElement("li");
			li.appendChild(Dom.mka(x[0], Classes.defword));
			li.appendChild(Dom.mkspan(x[1], Classes.searchdefs));
			ul.appendChild(li);
		});

		p.appendChild(ul);
	}

	p.build = build;
	return p;
}

/** @returns{HTMLElement} */
function mkhelpmsg() {
	var p = document.createElement("span");
	var url = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions";

	p.innerHTML = `
		<p>
			<b>Analyse:</b>
		</p>
		<ol>
			<li>Decomposes input (Chinese text) into chunks (~paragraphs);</li>
			<li>Identifies potential words in current chunk;</li>
			<li>
				Allows to navigate from chunk to chunk, and from
				word to word, either via the buttons, keyboard's arrows,
				or a pointing device (mouse, finger)
			</li>
			<li>
				Analyses the current word (for more, see the
				<a href="help.html">help page</a>).
			</li>
		</ol>
		<p>
			<b>Search</b>:
		</p>
		<p>
			"Reverse" dictionary search:
		</p>
		<ol>
			<li>
				Look for some input in the (often, non-Chinese) <i>definition</i>
				of a Chinese word. The input is interpreted as a
				<a href="`+url+`">regular expression</a>:
				for instance, <code>\\b(language|culture)\\b</code> will
				fetch entries containing either the word <code>language</code>
				or the word <code>culture</code>;
			</li>
			<li>
				Displays all matching entries, sorted by number of Chinese
				characters;
			</li>
			<li>You may now click on entries you wish to explore.</li>
		</ol>
		<p>
			<b>Contains</b>:
		</p>
		<p>
			Look for characters containing another character. For example,
			filling the input field with <code>虎</code> and clicking on
			<code>Contains</code> will display all the Chinese characters
			containing <code>虎</code>.
		</p>
		<p>
			Multiple, spaces-separated characters allows looking for all words
			containing all the specified components. For example,
			<code>一 肀 女</code> will look for all words containing
			<code>一</code>, and,  <code>肀</code> and <code>女</code>
		</p>
		<p>
			As for the previous features, results can be clicked for
			further inspection.
		</p>`
	return p;
}

/**
 * @param{IndexState} S
 */
function mkindex(S) {
	let p = Dom.mkbuildable("div");

	p.classList.add("main-index");
	p.id = "main"; // still used in ../dom.js:/fontFamily

	let pinput   = mkinput();
	let presults = mkresults(S);

	// NOTE: we could have a separate component for
	// clarity to wrap all those, but its convenient
	// to have panalyse/psearch/pcontains and register handlers
	// directly here.
	let pbtns = document.createElement("div");
	pbtns.setAttribute("id", "submit-search");

		let panalyse  = Dom.mke("button", "Analyse");
		let psearch   = Dom.mke("button", "Search");
		let pcontains = Dom.mke("button", "Contains")
		let phelp     = View.mkmodalbtnwith(mkhelpmsg(), {
			text : "Help",
		});
		let psamples = Dom.mkselect([
				["",   "Sample characters:"     ],
				["文", "文 (culture, language)" ],
				["好", "好 (good)"              ],
				["中", "中 (middle, chinese)"   ],
				["教", "教 (to teach)"          ],
				["學", "學 (to study)"          ],
				["嫉", "嫉 (jealousy)"          ],
				["惑", "惑 (to confuse)"        ],
				["愚", "愚 (to be stupid)"      ],
			]);

		pbtns.append(panalyse, psearch, pcontains, phelp, psamples);

	let pnav   = View.mknav({ btns : [
		[ "⇦", MoveDir.Prev, MoveWhat.Chunk ],
		[ "←", MoveDir.Prev, MoveWhat.Word  ],
		[ "→", MoveDir.Next, MoveWhat.Word  ],
		[ "⇨", MoveDir.Next, MoveWhat.Chunk ]
	]});

	let psrc  = View.mkbasiccc(S); // TODO: has/used to have a Classes.navigateable
	let pdec  = View.mkstackvcuts(S);

	pnav.setAttribute("id", "nav");
	psrc.setAttribute("id", "src");
	pdec.setAttribute("id", "dec");

	p.append(pinput, presults, pbtns, pnav, psrc, pdec);

	let svars = [
		{ bn : "c", sn : "move.ic",     type : SVarType.Number },
		{ bn : "w", sn : "move.iw",     type : SVarType.Number },
		{ bn : "a", sn : "toanalyse",   type : SVarType.String },
		{ bn : "s", sn : "tosearch",    type : SVarType.String },
		{ bn : "n", sn : "tocontains",  type : SVarType.String },
	];

	function dumpbm() {
		document.location.hash = Bookmark.dump(S, svars);
	}

	function getinput() { return pinput.value; }

	// NOTE: we need a .build() for setupwithnav(): on
	// movements, we only care about rebuilding psrc/pdec.
	//
	// That's the say, the fact that this is called "build"
	// can be confusing, as it doesn't really refer to a
	// peculiar re-rendering of a mkindex() component.
	function build() { psrc.build(); pdec.build(); }

	/**
	 * @param{string} [s]
	 */
	function analyse(s) {
		S.toanalyse = s || getinput()
		// ic/iw may be coming from bookmark
		S.move.init(Data.parseandtok(S.toanalyse), S.move.ic, S.move.iw);
		S.stack.push(S.move.cwv());
		build();
		dumpbm();
	}

	/**
	 * @param{string} [s]
	 */
	function search(s) {
		S.tosearch = s || getinput();
		presults.build(Data.search(S.tosearch));
		dumpbm();
	}

	/**
	 * @param{string} [s]
	 */
	function contains(s) {
		S.tocontains = s || getinput();
		presults.build(Data.lscontains(S.tocontains).map(function(x) {
			return [x, Data.quickdef(x)];
		}));
		dumpbm();
	}

	function setup() {
		panalyse.addEventListener("click",  function(e) { analyse();  });
		psearch.addEventListener("click",   function(e) { search();   });
		pcontains.addEventListener("click", function(e) { contains(); });
		psamples.addEventListener("change", function(e) {
			if (psamples.selectedIndex > 0) {
				S.stack.push(psamples.value);
				build();
			}

		});

		View.setupwithnav(p, psrc, S, "basic");

		// We have defword in presults; stack them on click
		Dom.alisten(Classes.defword, function(e) {
			let q = Dom.gettarget(e);
			// XXX this is pushandbuild from zm-stackgrid's context.
			if (S.stack.push(q.innerText))
				pdec.build();
			return false;
		}, p);

		p.addEventListener("zm-nav-move", function(e) {
			dumpbm();
		});

		Bookmark.load(S, svars);
	}

	setup();

	if (S.toanalyse)  analyse(S.toanalyse);
	if (S.tosearch)   search(S.tosearch);
	if (S.tocontains) contains(S.tocontains);

	// Work from default text ("你好，世界")
	else analyse();

	p.build = build;

	return p;
}

/**
 * @param{TabsConf} [tc]
 * @returns{BuildableHTMLElement}
 */
function mk(tc) {
	return mkindex({
		stack    : Stack.mk(),
		move     : Move.mk(),
		tabsconf : tc ||= User.prefs.tabs,
		cache    : {},
		hasstack : false,
		ts       : [],
	});
}

return {
	"mk" : mk,
};

})();
let ViewTrBook = (function() {

/**
 * Retrieve current piece as srcp indexes.
 *
 * Return an array of two integers slicing A.srcpcs (!),
 * so the first integer corresponds to the current piece.
 *
 * NOTE: this is used in mktrbook() to move from piece to
 * piece, hence why it's not confined to mkpcscc()
 *
 * @param{TranslatedBookState} S
 * @returns{[number, number]}
 */
function getcp(S) {
	var n = S.move.cw().j;

	for (var i = 0, j = 1; j < S.srcpcs[S.move.ic].length; i++, j++)
		if (n >= S.srcpcs[S.move.ic][i] && n <= S.srcpcs[S.move.ic][j])
			return [i, j];

	Assert.assert("getcp(): current word is not a piece?");
	return [-1, -1];
}

/**
 * We're using the same mkpcscc() to handle both the source
 * and the translated book.
 *
 * The "n" parameter will thus picks on S the data relevant to
 * either the source or translated book.
 *
 * @param{TranslatedBookState} S
 * @param{{ pcs : () => Pieces, cc : (ic ?: number) => Chunk, hlcw ?: boolean}} n
 * @returns{BuildableHTMLElement}
 */
function mkpcscc(S, n) {
	var p = Dom.mkbuildable("div");

	function build() {
		// We need utf8 character arrays for slicing
		// to work properly, e.g. bugs on 𡕥：舉
		var s   = [...n.cc().v];
		var pcs = n.pcs();

		p.innerHTML = '';
		for (var i = 0, j = 1; j < pcs[S.move.ic].length; i++, j++)
			p.appendChild(Dom.mkspan(s.slice(pcs[S.move.ic][i], pcs[S.move.ic][j]).join("")));

		hlps();
		hlcp();
		// TODO have it be a function?
		if (n.hlcw) hlcw();
	}

	// TODO (disabled)
		/*
		 * Add a new piece separator in p at the given offset i.
		 *
		 * type{ViewTrBook["pcut"]}
		 */
/*
		pcut : function(p, i) {
			return Utils.orderedinsert(p[T.m.ic], i);
		},
*/
		/*
		 * Remove piece separator at offset i from p.
		 *
		 * type{ViewTrBook["pjoin"]}
		 */
/*
		pjoin : function(p, i) {
			p[T.m.ic] = p[T.m.ic].filter(function(x) {
				return x != i;
			});
		},
*/

	/**
	 * Return true if we source and translation are
	 * both cut into the same amount of pieces.
	 *
	 * @type{() => boolean}
	 */
	function piecesok() {
		return S.srcpcs[S.move.ic].length == S.trpcs[S.move.ic].length;
	}

	/**
	 * Highlight odd/even pieces in currently loaded chunk.
	 *
	 * NOTE: re-highlighting everything every time we move,
	 *       that is, performing hlcp() here and calling hlpieces()
	 *       in hl(), is noticeably too slow. Tested with one span
	 *       per letter in ptr/psrc. Changing chunk actually gives
	 *       an idea of how slow the process is.
	 *
	 * @type{() => void}
	 */
	function hlps() {
		var c0 = piecesok() ? Classes.okep : Classes.koep;
		var c1 = piecesok() ? Classes.okop : Classes.koop;

		var pcs = n.pcs();

		/*
		 * [a]       : impossible,
		 * [a, b]    : one piece,
		 * [a, b, c] : two pieces,
		 * etc. hence -1.
		 */
		for (var i = 0; i < pcs[S.move.ic].length-1; i++) {
			var c = (i % 2  == 0) ? c1 : c0;
			p.children[i].classList.add(c);
		}
	}

	/**
	 * Highlight current word.
	 *
	 * @type{() => void}
	 */
	function hlcw() {
		var x = getcp(S)[0];

		// We need an utf8 character array for slicing
		// to work properly, e.g. bugs on 𡕥：舉
		var s = [...(p.children[x].textContent || "")];

		var q = /** @type{HTMLElement} */ (p.children[x]);

		/*
		 * T.m.cw().i/j are offset from chunk; also we're always
		 * calling hlcw() when all pieces are wrapped into a
		 * single <span>.
		 */
		var k      = Dom.countpieceoffset(q);
		var [i, j] = [S.move.cw().i-k, S.move.cw().j-k]

		var a = Dom.mkspan(s.slice(0, i).join(""));
		var b = Dom.mkspan(s.slice(i, j).join(""));
		var c = Dom.mkspan(s.slice(j, s.length).join(""));

		q.innerHTML = "";
		// a & c were manually set to p's background (XXX old comment?)
		b.classList.add(Classes.hlcw);

		q.append(a, b, c);
	}

	/**
	 * Remove highlight on current word.
	 *
	 * @type{() => void}
	 */
/*
	function llcw() {
		var n = getcp(S)[0];
		var q = p.children[n];
		if (!(q instanceof HTMLElement)) {
			Assert.assert("psrc "+n+"th child isn'nt an HTMLElement");
			return;
		}
		q.innerHTML = q.innerText;
	}
*/

	/**
	 * Highlight current piece.
	 */
	function hlcp() {
		let x = getcp(S)[0];
		p.children[x].classList.add(Classes.hlcp);
		Dom.scrollintoview(p, x);
	}

		/**
		 * Remove highlight on current piece.
		 *
		 * @type{() => void}
		 */
/*
		llcp : function() {
			var n = T.getcp(S)[0];

			T.psrc.children[n].classList.remove(Classes.hlcp);
			T.ptr.children[n].classList.remove(Classes.hlcp);
		},
*/

	function setup() { View.listenmousemove(p); }

	setup();

	p.build = build;

	return p;
}

/**
 * @param{TranslatedBookState} S
 * @returns{Promise<MovableBuildableHTMLElement>}
 */
function mktrbook(S) {
	var p = Dom.mkmovablebuildable("div");

	var svars = [
		{ bn : "c", sn : "move.ic", type : SVarType.Number },
		{ bn : "w", sn : "move.iw", type : SVarType.Number },
		{ bn : "b", sn : "book",    type : SVarType.String },
	];

	var ptitle   = ViewBook.mktitle(S);
	var psection = ViewBook.mksection(S);
	var pcn      = ViewBook.mkcn(S);
	var psrc     = mkpcscc(S, {
		pcs  : function()   { return S.srcpcs;      },
		/** @type{(ic ?: number) => Chunk} */
		cc   : function(ic) { return S.move.cc(ic); },
		hlcw : true,
	});
	var pdec     = View.mkstackvcuts(Object.assign({}, S, {
		ts : [],
	}));
	var ptr      = mkpcscc(S, {
		pcs : function() { return S.trpcs; },
		// XXX used to be called trcc (in case); do we need the ic
		// parameter?
		/** @type{(ic ?: number) => Chunk} */
		cc : function(ic) {
			return S.trcs[ic === undefined ? S.move.ic : ic];
		}
	});

	var pnav = document.createElement("div");

		var pnav0 = View.mknav({ type : "span", btns : [
			[ "⇦", MoveDir.Prev, MoveWhat.Chunk ],
			[ "⟵",  MoveDir.Prev, MoveWhat.Piece ],
			[ "←", MoveDir.Prev, MoveWhat.Word  ]
		] });

		var ptoc = View.mkmodalbtnwith(ViewBook.mktoc(S), { text : "目錄" });

		var pnav1 = View.mknav({ type : "span", btns : [
			[ "→", MoveDir.Next, MoveWhat.Word  ],
			[ "⟶",  MoveDir.Next, MoveWhat.Piece ],
			[ "⇨", MoveDir.Next, MoveWhat.Chunk ]
		]});

		pnav.append(pnav0, ptoc, pnav1);

	var pfontsave = document.createElement("div");

		var pfont = document.createElement("button");
		pfont.innerText = "User bettor font";
		pfont.style.display = "none";

		var psave  = document.createElement("save");
		psave.innerText = "Save";
		psave.style.display = "none";

		pfontsave.append(pfont, psave);

	ptitle.id    = "title";
	psection.id  = "section";
	pcn.id       = "cn";
	pnav.id      = "nav";
	psrc.id      = "src";
	pdec.id      = "dec";
	pfont.id     = "font"
	psave.id     = "save";
	pfontsave.id = "font-save";
	ptr.id       = "tr";

	p.classList.add("main-trbook");

	p.append(ptitle, psection, pcn, pnav, pfontsave, psrc, pdec, ptr);

	function setup() {
		ViewBook.setup(S, p, psrc, ptoc, [ptitle, psection, pcn], "pcs", svars);
	}

	function build() { pdec.build(); psrc.build(); ptr.build(); }

	/**
	 * Create one piece for each chunck.
	 *
	 *	md : parsed markup
	 *	Pieces in srcp/trp format, so that each chunk
	 *	is exactly covered by one piece.
	 *
	 * @param{TokedChunks} md
	 * @returns{Pieces}
	 */
	function mkdefpieces(md) {
		return md.map(function(x) {
			return [0, [...x.v].length];
		});
	}

	/**
	 * @param{string} tr - translated book (markdown)
	 * @param{string} pcs - Pieces, JSON-encoded
	 */
	function inittr(tr, pcs) {
		S.trcs = Data.parseandtok(tr);

		[S.srcpcs, S.trpcs] = JSON.parse(pcs);

		// TODO: to be improved once we allow user to edit src/tr
		if (S.move.cs.length != S.trcs.length)
			throw "assert: src/tr chunks mismatch"

		// Default pieces
		if (!S.srcpcs || S.srcpcs.length == 0) S.srcpcs = mkdefpieces(S.move.cs);
		if (!S.trpcs  || S.trpcs.length  == 0) S.trpcs  = mkdefpieces(S.trcs);

		if (S.srcpcs.length != S.trpcs.length)
			throw "assert: srcp/trp chunks mismatch"

		// TODO: we should ensure provided pieces don't go beyond
		// the chunks; do so here. If only last element going beyond,
		// noisily warn but automatically fix.

		// All the others have been built already, and we need
		// S.pcs to build psrc
		ptr.build();
		psrc.build();
	}

	function fns() { return [
		"data/books/"+S.book+".src",
		"data/books/"+S.book+".tr",
		"data/books/"+S.book+".pcs"
	]; }

	function init() {
		return ViewBook.init(
			S, [pdec, ptitle, psection, pcn, ptoc],
			svars, fns
		).then(function(xs) { inittr(xs[1], xs[2]); });
	}

	// Wrap S.move.move() to support moving from piece to piece
	/** @type{MoveFun} */
	function move(d, w) {
		if (w != "piece") return S.move.move(d, w);

		var [i, j] = getcp(S);

		/*
		 * TODO/XXX: we're assuming there are no empty pieces,
		 * which is never asserted/tested anywhere (still true?)
		 */
		if (d == MoveDir.Prev) return (i == 0)
			// @ts-ignore
			? S.move.move(MoveDir.Prev, MoveWhat.Chunk)
			// @ts-ignore
			: S.move.move(MoveDir.Offset, S.srcpcs[S.move.ic][i]-1);

		else return (j == S.srcpcs[S.move.ic].length-1)
			// @ts-ignore
			? S.move.move(MoveDir.Next, MoveWhat.Chunk)
			// @ts-ignore
			: S.move.move(MoveDir.Offset, S.srcpcs[S.move.ic][j]+1);
	}

	// for setupwithnav
	p.build = build;
	p.move  = move;

	setup();
	return init().then(function() { return /** @type{MovableBuildableHTMLElement} */ (p); });
}

/**
 * @param{TabsConf} [tc]
 * @returns{Promise<MovableBuildableHTMLElement>}
 */
function mk(tc) {
	return mktrbook({
		stack    : Stack.mk(),
		move     : Move.mk(),
		// TODO: document (likely, used when going recursive)
		tabsconf : tc ||= User.prefs.tabs,
		cache    : {},
		hasstack : false,
		trcs     : [],
		trpcs    : [],
		srcpcs   : [],
		book     : "",
		ts       : [],
	});
}

return {
	"mk" : mk,
};

})();
let Big5 = (function() {

/**
 * Read a line from ../../../data/big5/big5.csv.
 *
 * Lines starting with '#' are comments.
 *
 * First two fields of each non comment, non-empty lines,
 * are BIG5 hex code (in ASCII) and corresponding UTF8
 * hex code (in ASCII).
 *
 * TODO: tests
 * TODO: maybe we'd want to already parse the ascii hex
 *       code to something more usable.
 *
 * @param{[UTF82Big5, ParseError]} accerr - accumulator mapping unicode ascii hex code to
 *  big5 ascii hex code (literally from "0x..." string to a "0x..." string)
 * @param{string} s - current line to read
 * @param{number} n - current line number
 * @returns{[UTF82Big5, ParseError]} - accerr, altered in place
 */
function parseline(accerr, s, n) {
	var [acc, err] = accerr;
	if (err) return accerr;

	s = s.trim();

	// Skip empty lines and comments.
	if (s.startsWith('#'))    return [acc, undefined];
	if (s.trim().length == 0) return [acc, undefined];

	var i = s.indexOf("\t");
	var j = s.indexOf("\t", i+1);

	if (i == -1 || j == -1)
		return [{}, [n, "Invalid big5 entry, not enough tabs: "+s]];

	var b = s.slice(0,   i);
	var u = s.slice(i+1, j);

	acc[u] = b;

	return [acc, undefined];
}

/**
 * Read an UTF8 to BIG5 conversion table.
 *
 * @type{Parser<UTF82Big5>}
 */
function parse(csv, acc) {
	return Utils.splitlines(csv || "").reduce(parseline, [acc || {}, undefined]);
}

return {
	"parseline" : parseline,
	"parse"     : parse,
};

})();
let Markdown = (function() {
/*
 * Mini-markdown-like parsing. This is to provide an uniform
 * book format.
 *
 * We may allow different book formats in the future too,
 * but this should be enough for most classics.
 */

/**
 * Convert markdown to an array of (typed) chunks.
 *
 * @type{Parser<Book>}
 */
function parse(s) {
	/**
	 * Return value
	 * @type{Array.<Chunk>}
	 */
	var r = [];

	/* Current paragraph */
	var p = "";

	/*
	 * Flush p as a paragraph to r if p isn't
	 * empty.
	 *
	 * Input:
	 * Output:
	 *	As a side effect, p is always trimmed.
	 */
	function maybeflushp() {
		if (p.trim()) r.push({
			t : ChunkType.Paragraph,
			v : p.trim(),
		});
		p = "";
	}

	/* Parse line-per-line */
	var xs = s.split("\n");

	for (var i = 0; i < xs.length; i++) {
		/* Empty line: paragraph's end, if any */
		if (xs[i].trim() == "") maybeflushp();

		/* Heading */
		else if (xs[i].startsWith("#")) {
			/* paragraph's end, if any */
			maybeflushp();

			/* count number of '#' */
			var j, x; for (j = 0, x = [...xs[i]]; j < x.length && x[j] == "#"; j++);
			r.push({
				t : j, /* cf. 'enums.js:/^var ChunkType =' */
				v : x.slice(j).join("").trim(),

			});
		}

		/* A paragraph's line */
		else p += xs[i] + "\n";
	}

	maybeflushp();

	return [r, undefined];
}

/**
 * Retrieve a tree-based ToC from a parsed book.
 *
 * NOTE: we depend on enum's order.
 *
 * NOTE: this is one cute little function to iteratively
 * convert a linear data structure into a tree.
 *
 * @param{Array<Chunk>} cs - chunks to inspect.
 * @returns{ToC}
 */
function gettoc(cs) {
	/** @type{ToC} */
	var ps = []; // stack

	return cs.reduce(
		/**
		 * @param{ToC} acc
		 * @param{Chunk} c
		 * @param{number} ic
		 * @returns{ToC}
		 */
		function(acc, c, ic) {
			// ignore
			if (c.t < ChunkType.Title) return acc;

			while (ps.length && c.t <= ps[ps.length-1].t)
				ps.pop();

			/** @type{ToCEntry} */
			var p = { t : c.t, v : c.v, ic : ic, cs : [] };

			if (ps.length) { ps[ps.length-1].cs.push(p); ps.push(p);  }
			else           { ps.push(p);                 acc.push(p); }

			return acc;
		}, []);
}

/**
 * Dump an array of chunks to a markdown string.
 *
 * TODO: move this to data/book/
 *
 * id = parse ° dump = dump ° parse
 *
 * @param{Array<Chunk>} cs - array of chunks
 * @returns{string}
 */
function dump(cs) {
	return cs.reduce(function(acc, c) {
		switch(c.t) {
		case ChunkType.Title:         return acc +"# "     +c.v+"\n";
		case ChunkType.Section:       return acc +"\n## "  +c.v+"\n";
		case ChunkType.Subsection:    return acc +"\n### " +c.v+"\n";
		case ChunkType.Subsubsection: return acc +"\n#### "+c.v+"\n";
		case ChunkType.Paragraph:     return acc +          c.v+"\n\n";
		default:
			Assert.assert("markdown dump unmanaged type "+c.t);
			return acc;
		}
	}, "");
}

return {
	"parse"  : parse,
	"gettoc" : gettoc,
	"dump"   : dump,
};

})();
let WikiSource = (function() {
/**
 * Code to load and convert a wikisource text export.
 *
 * The main goal is to be able to convert it to our
 * mini-markdown format, so that we can keep a clean
 * local version of the file.
 *
 * While we could always read from the wikisource format,
 * it feels quite rough and unstable enough so that we
 * prefer to keep a clean markdown file instead.
 *
 * Another option would be to use an .epub export, but
 * there's nothing to read XML by default with node,
 * and we would still have needed to parse the resulting
 * soup.
 *
 * Yet another option would be to find a better source
 * that wikisource, but ctext.org prevents export, various
 * online PDFs cannot be easily used.
 *
 * There's also https://github.com/shuowenjiezi/shuowen, which
 * seems not only to be maintained, but also to contain various
 * comments. Would also need to be properly parsed to our internal
 * format anyway.
 *
 * NOTE: we currently only support what is needed to parse the
 * Shuowen Jiezi; some specific tweaks have been added to
 * ensure data consistency. We'll likely need to update the
 * code to support other books.
 */

/**
 * Parse wikisource text export to an array of (typed) chunks.
 *
 * NOTE: as mentionned above, only support traditional Chinese
 * version of the Shuowen Jiezi so far.
 *
 * XXX/TODO: this is messy, hopefully temporarily.
 *
 * @param{string} s - string containing "markdown" to be parsed.
 * @returns{[Array<Chunk>, ParseError]} - array of chunks / error
 */
function parse(s) {
	var title = "";
	/** @type{Object.<string, string>} */
	var toc   = {};

	/** @type{Array<Chunk>} */
	var cs    = [];

	var xs    = s.split("\n");
	var n     = 0; // current line in xs

	var err = "";  // error returned by helper function below
	var p   = "";  // paragraph read by readp()

	/** @type{(i ?: number) => boolean} */
	function isempty(i) {
		if (i === undefined) i = n;
		return i < xs.length && xs[i] == "";
	}

	/** @type{(i ?: number) => number} */
	function skipempty(i) {
		if (i === undefined) i = n;
		var j; for (j = i; j < xs.length && isempty(j); j++)
			;
		return j;
	}

	/* Hm? @type{(t : string, i ?: number) => boolean} */
	/**
	 * @param{string} t - error message complement
	 * @param{number} [i] - xs index
	 * @returns{boolean}
	 */
	function iseof(t, i) {
		if (i === undefined) i = n;
		if (i < xs.length) return false;
		err = "EOF reached while looking for "+t
		return true;
	}

	/**
	 * No goto in JS; use "return mkerr(...)" instead of a "goto err;" then.
	 *
	 * @param{string} [e]
	 * @param{number} [i]
	 * @return{[Array<Chunk>, ParseError]}
	 */
	function mkerr(e, i) {
		if (e === undefined) e = err;
		if (i === undefined) i = n;
		return [[], [i+1, e]];
	}

	/**
	 * Is the i-th line matching a license information?
	 *
	 * @param{number} [i]
	 * @returns{boolean}
	 */
	function islicense(i) {
		if (i === undefined) i = n;
		return i < xs.length && xs[i] == "本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。";
	}

	/**
	 * Skip all content until we reach a license line.
	 *
	 * @param{number} [i]
	 * @returns{number}
	 */
	function skiptolicense(i) {
		if (i === undefined) i = n;
		var j; for (j = i; j < xs.length && !islicense(j); j++)
			;
		return j;
	}

	/**
	 * Skip all content until we reach a empty line or license.
	 *
	 * @param{number} [i]
	 * @returns{number}
	 */
	function skiptoendp(i) {
		if (i === undefined) i = n;
		var j; for (j = i; j < xs.length && !isempty(j) && !islicense(j); j++)
			;
		return j;
	}

	/**
	 * Is the line refering to a left arrow, that is,
	 * new section indicator (e.g. 序 ◄ 說文解字).
	 *
	 * undefined means this is an arrow, but format is unexpected
	 * (title not found at arrow's right).
	 *
	 * @param{number} [i]
	 * @returns{boolean|undefined}
	 */
	function isleftarrow(i) {
		if (i === undefined) i = n;
		if (i >= xs.length) return false;
		var m = xs[i].match(/^\s*([^\s]+)\s*◄\s*([^\s]+)$/)
		if (!m) return false;

		// XXX maybe this'd better be a warning?
		if (m[2] != title) {
			err = "Title '"+title+"' missing from ◄";
			return undefined;
		}
		return true;
	}

	/**
	 * Read a right arrow, returning full section name as defined
	 * in the ToC.
	 *
	 * @param{number} [i]
	 * @returns{[string, number]|undefined}
	 */
	function readrightarrow(i) {
		if (i === undefined) i = n;
		if (i >= xs.length) return undefined;

		// Last section of the Shuo wen has an irregular syntax
		// as there are two lines (+2 empty) between the arrows.
		//
		// We thus silently ignore them here.
		var j = i; for (; j < xs.length && xs[j].indexOf("►") == -1; j++)
			;

		var s = xs.slice(i, j+1).join(" ");

		var m = s.match(/^\s*([^\s]+)\s*.*►\s*([^\s]+)?$/);
		if (!m) {
			err = "Expecting a ►: '"+s+"'";
			return undefined;
		}
		if (!(m[1] in toc)) {
			err = "Unknown section '"+m[1]+"'";
			return undefined;
		}
		return [toc[m[1]], j];
	}

	/**
	 * Skip useless lines that we may encounter.
	 *
	 * @param{number} [i]
	 * @returns{number}
	 */
	function skipnoise(i) {
		if (i === undefined) i = n;
		if (xs[i] == "姊妹计划: 数据项")
			i++;
		return i;
	}

	/**
	 * Skip useless lines that we may encounter.
	 *
	 * @param{number} [i]
	 * @returns{boolean}
	 */
	function isnoise(i) {
		if (i === undefined) i = n;
		return xs[i] == "姊妹计划: 数据项";
	}

	// first line is expected to be the title
	// Note that because "".split("\n") will always returns an array of
	// one element, we don't have to check for eof.
	if (!xs[n])  return mkerr("First line is expected to be non-empty title");
	title = xs[n];
	cs.push({ t : ChunkType.Title, v : title });

	// second non-empty line is expected to contains export date
	n = skipempty(n+1);
	if (iseof("export date")) return mkerr();

	if (!xs[n].match(/^于[0-9]+年[0-9]+月[0-9]+/))
		return mkerr("Invalid export date format (have '"+xs[n]+"')");

	// For the Shuowen Jiezi, there is a table of content at the
	// beginning of the book, wrapped between lines containing
	// "-{" and "-}".
	//
	// Each item of this ToC contains is formatted as such:
	//	<chapter/section name> (<"random" text>)
	// For the last one (pre/postface), parenthesis are missing.
	//
	// There's an empty line between each element.

	n = skipempty(n+1);
	if (iseof("ToC starting mark (-{)")) return mkerr()
	if (xs[n] != "-{") return mkerr("Invalid ToC starting mark (have '"+xs[n]+"')");

	for (n = skipempty(n+1);; n = skipempty(n+1)) {
		if (iseof("ToC content")) return mkerr();
		if (isempty(n)) return mkerr("Toc entry shouldn't be empty");

		// ToC ending mark
		if (xs[n] == "}-") break;

		// Grab
		var j = xs[n].indexOf(' ');
		if (j == -1) return mkerr("ToC entry has no space '"+xs[n]+"'");
		toc[xs[n].substring(0, j)] = xs[n]; // .substring(j+1);
	}

	// Following this ToC is a "further reading" section that is
	// useless for our purposes.
	//
	// That section is closed by special mention indicating the
	// works license as public domain:
	//	"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
	//
	// Again, this is followed by empty lines
	n = skiptolicense(n);
	if (iseof("license line")) return mkerr();
	n++;

	// We can detect section/chapter changes through
	// lines containing "A ◄ T" and "C ► D", where:
	//	- T is the book's title
	//	- A is previous section/chapter name
	//	- C is current section/chapter name
	//	- D is next section/chapter name (if any)
	//
	// For the Shuowen Jiezi, note that the first section's previous'
	// section is the last, but the last's has no next's.
	//
	// After those lines may come a special line, useless for our
	// purposes:
	//	"姊妹计划: 数据项"
	//
	// For the Shuowen Jiezi, each section is subdivided in
	// subsection. Each subsection name starts with 4 empty lines,
	// and is followed by two empty lines, assuming each paragraph
	// ends with a empty line. (otherwise s/4/5/).
	//
	// Additionaly for the Shuowen Jiezi, each subsection names is
	// a two (unicode) character 部-terminated string.

	// Each subsection contains paragraphs, terminated by an empty line.

	// Last's chapters content is terminated again by the special
	// public domain string, which is also followed by an about that
	// can be safely ignored.

	// XXX/TODO: if it were not for x/y, I would have no confidence
	// that the code terminates on all input. It's too fragile, but
	// as it's to be use to sparingly, not sure it's worth too much
	// trouble.

	for (var x = n, y = -1;; y = x, x = n) {
//		console.log(cs);
		if (x == y) {
			Assert.assert("endless")
			return [[], undefined];
		}
		if (iseof("text body")) return mkerr();

		var m = n; n = skipempty(m);

		if (islicense()) break;

		// Reading a section
		var b = isleftarrow(n);
		if (b === undefined) return mkerr();
		if (b) {
			n++;
			if (iseof("right arrow")) return mkerr();
			n = skipempty(n);
			var c = readrightarrow(n);
			if (c === undefined) return mkerr();
			cs.push({
				t : ChunkType.Section,
				v : c[0],
			});
			n = c[1]+1;
			if (!iseof("", n) && isempty(n))
				n++;
			if (!iseof("", n) && isnoise(n))
				n++;
//				n = skipnoise(skipempty(n+1));
			continue;
		}

		// Reading a paragraph
		if (n-m <= 3) {
			m = n; n = skiptoendp(m);
			cs.push({
				t : ChunkType.Paragraph,
				v : xs.slice(m, n).join("\n"),
			});
			continue;
		}

		// Reading a subsection
		cs.push({
			t : ChunkType.Subsection,
			v : xs[n],
		});
		n++;
	}

	return [cs, undefined]
}

/**
 * Perform some additional checks and simplification for
 * wikisource Shuowen.
 *
 * TODO/NOTE: this is not tested. The sheer volume of data,
 * the fragility of the original source format makes us a
 * bit relunctant to dig further. Likely, we'll be able to
 * find better structured Shuowen later on, and we'll only
 * keep this one to build a prototype.
 *
 * NOTE: we join all the paragraphs under a subsection as
 * a convenience. There's ~3K chunks already; having a chunk
 * per word would be too bothersome.
 *
 * @param{Array<Chunk>} cs
 * @returns{Array<Chunk>}
 */
function tweakshuowen(cs) {
	var insub = false;
	/** @type{Array<string>} */
	var stack = [];
	/** @type{Array<Chunk>} */
	var xs = [];

	/** @param{Array<Chunk>} acc */
	function maybeflush(acc) {
		if (stack.length) {
			acc.push({
				t : ChunkType.Paragraph,
				v : stack.join("\n"),
			});
			stack = [];
		}
	}

	xs = cs.reduce(
		/**
		 * @param{Array<Chunk>} acc
		 * @param{Chunk}        c
		 * @returns{Array<Chunk>}
		 */
		function(acc, c) {
			// Remove parenthesis after the word being defined, from each
			// paragraph of each subsection. Seal script images are inserted
			// in wikisource's HTML.
			if (c.t == ChunkType.Paragraph)
				// NOTE: those aren't ASCII "()："
				c.v = c.v.replace(/（）：/, "：");

			// Special tweak as this one is unexpectedly formatted.
			if (c.t == ChunkType.Subsection)
			if (c.v.startsWith("古者庖羲氏之王天"))
				c.t = ChunkType.Paragraph;

			// Check that each subsection is a two unicode character 部-terminated
			// string.
			if (c.t == ChunkType.Subsection)
			if (!c.v.endsWith("部"))
				Assert.assert("Unexpected Shuowen Jiezi subsection: "+c.v);

			// Concatenate all paragraphs from each subsection into a single
			// chunk; we expect this to facilitate reading.
			if (c.t == ChunkType.Subsection) {
				insub = true;
				maybeflush(acc);
			} else if (c.t != ChunkType.Paragraph) {
				maybeflush(acc);
				insub = false;
			}

			if (insub && c.t == ChunkType.Paragraph)
				stack.push(c.v);
			else
				acc.push(c);

			return acc;
		}, []);

	maybeflush(xs);

	return xs;
}

return {
	"parse"        : parse,
	"tweakshuowen" : tweakshuowen,
};

})();
let Chise = (function() {

/**
 * Map the characters used in wm-decomp to the previous DecompType.
 * Mostly | awk '/^	\/\/[^\/]/{printf "	''%s'' : ",$3}/^	[A-Z]/{print "DecompType." $1 "," }'|/home/mb/bin/ucol
 * from lib.d.ts's DecompType which should be automatized.
 *
 * >/bin/awk -F'	' 'length($3) > 3 && index($3, "@") == 0 && index($3, "&") == 0' | head
 *
 * @type{Object<string, DecompType>}
 */
let DecompTypeMap = {
	'⿰' : DecompType.CnLeftToRight,
	'⿱' : DecompType.CnAboveToBelow,
	'⿲' : DecompType.CnLeftToMiddleAndRight,
	'⿳' : DecompType.CnAboveToMiddleAndBelow,
	'⿴' : DecompType.CnFullSurround,
	'⿵' : DecompType.CnSurroundFromAbove,
	'⿶' : DecompType.CnSurroundFromBelow,
	'⿷' : DecompType.CnSurroundFromLeft,
	'⿸' : DecompType.CnSurroundFromUpperLeft,
	'⿹' : DecompType.CnSurroundFromUpperRight,
	'⿺' : DecompType.CnSurroundFromLowerLeft,
	'⿻' : DecompType.CnOverlaid,
	'一' : DecompType.CnWmPrimitive,
};

/**
 * Read a line from decomp.csv
 *
 * Input format describe here:
 * 	https://gitlab.chise.org/CHISE/ids/-/blob/master/README.en
 *
 * @type{LineParser<Decomp>}
 */
function parseline(accerr, s, n) {
	var [acc, err] = accerr;
	if (err) return accerr;

	// comments
	if (s.startsWith(';;')) return accerr;

	// NOTE: we can't .split('\t') because there can be some unusual
	// things in last "field".

	var i = s.indexOf("\t");
	if (i == -1) return [acc, [n, "Unexpected number of fields: <1"]];

	var j = s.indexOf("\t", i+1)
	if (j == -1)  return [acc, [n, "Unexpected number of fields: <2"]];

	var c   = s.slice(i+1, j);
	var ids = s.slice(j+1);

	// TODO
	if (c[0] == '&') return accerr;

	if ([...c].length != 1)
		return [acc, [n, "Single character decompositon only: "+c]]

	// TODO
	if (ids.indexOf('@apparent') != -1) return accerr;
	if (ids.indexOf('&')         != -1) return accerr;


	// Don't decompose a character to itself, and ensure
	// components' uniqueness.
	var cs = [...ids].filter(function(x, i, a) {
		return x != c && !(x in DecompTypeMap) && a.indexOf(x) == i
	})

	// Only add if there something to be added
	if (cs.length) {
		// First decomposition for this character
		if (!(c in acc)) acc[c] = [];

		acc[c].push({
			t  : DecompType.Unknown,
			c  : cs,
		});
	}

	return [acc, undefined];
}

/**
 * Prepare a Chise decomposition table.
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
	"parseline" : parseline,
	"parse"     : parse,
};

})();
let WMDecomp = (function() {

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

})();let CEDict = (function() {
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
let SWMarkdown = (function() {
/*
 * Code to parse the Shuowen Jiezi as a markdown file to
 * a dictionary.
 *
 * The markdown file is generated by
 *	- '../book/wikisource.js:/function parse\('
 *	- '../book/wikisource.js:/function tweakshuowen\('
 *
 * from a wikisource text export, and is both used as a book,
 * and as a dictionary.
 */

/**
 * Parse a markdown version of the Shuo Wen, skipping useless lines.
 *
 * TODO: rename CEDict type.
 *
 * TODO: perhaps we'd better be generating proper file
 * in ../../../mkshuowen.js instead of this.
 *
 * TODO: better tests?
 *
 * @type{Parser<Dict>}
 */
function parse(s) {
	var [cs, e] = Markdown.parse(s);
	if (e) return [{}, e];

	var stop = false;
	return cs.reduce(
		/**
		 * @param{[Dict, ParseError]} acc
		 * @param{Chunk}                        c
		 * @param{number}                       n
		 * @returns{[Dict, ParseError]}
		 */
		function(acc, c, n) {
			// Last section (post/pre face, nothing more to read)
			if (c.t == ChunkType.Section)
			if (c.v == "卷十五 說文解字敘（序）")
				stop = true;

			if (stop || c.t != ChunkType.Paragraph) return acc;

			var es = c.v.split("\n");
			for (var i = 0; i < es.length; i++) {
				// NOTE: not ASCII :
				var x = es[i].indexOf("：")
				if (x == -1) {
					stop = true;
					return [{}, [n, "Invalid dict entry format, no '：' : '"+es[i]+"'"]];
				}

				var e = es[i].slice(0, x);
				var d = es[i].slice(x+1);
				acc[0][e]        = {};
				acc[0][e]["xx5"] = [{ ds : [d] }];
			}

			return acc;
		}, [{}, undefined]);
}

return {
	"parse" : parse,
};

})();
let Data = (function() {
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
 * Retrieve "local" (server-wise) compressed file.
 *
 * We automatically prepend server's root directory and version
 * GET parameter for caching.
 *
 * TODO/XXX: no automatic tests.
 *
 * @param{string}                     url - where to fetch data.
 * @param{(arg0 : string) => (void)}  ko  - failure callback
 * @param{(arg0 : string) => (void)}  ok  - success callback
 * @param{XMLHttpRequestResponseType} [r] - responseType
 *
 * @returns{void}
 */
function get(url, ko, ok, r) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', Config.root + url + "?v="+Config.version);

	if (r !== undefined) xhr.responseType = r;

	xhr.onload = function() {
	    if (xhr.status != 200) {
	    	ko("cannot retrieve "+url+": "+xhr.responseText);
	    	return;
		}
		ok(xhr.response);
	};
	xhr.send();
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
 * @param{(arg0 : string) => (void)} ko  - failure callback
 * @param{(arg0 : string) => (void)} ok  - success callback
 *
 * @returns{void}
 */
function zget(url, ko, ok) {
	get(url, ko, function(y) {
		var x; try { x = gunzip(y) }
		catch(e) { ko("cannot decompress "+url+": "+e); return; }
		ok(x);

	/* We want xhr.response to be uint8 array (for pako) */
	}, "arraybuffer");
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
				g(url, reject, resolve);
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
function mget(urls)  { return mxget(urls,  get); }

/**
 * Retrieve meta-datas about the Datas identified by the given
 * names from database.
 *
 * TODO: tests
 *
 * This includes among others path to remote file.
 *
 * @param{Array<string>} xs - data names
 * @returns{[Datas, string|undefined]} - results and a optional
 * error message
 */
function getmetas(xs) {
	// Shortcut.
	var ys = DB.datas;

	var zs = [];

	for (var i = 0; i < xs.length; i++) {
		var found = false;
		for (var j = 0; j < ys.length; j++)
			if (ys[j].Name == xs[i]) {
				found = true;
				zs.push(/** @type{Data} */(ys[j]));
				break;
			}
		if (!found) return [[], "Unknown data: '"+xs[i]+'"'];
	}

	return [zs, undefined];
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
	// Grab meta-datas; we'll want to keep a local copy at
	// some point.
	var [ys, err] = getmetas(xs);

	if (err) return new Promise(function(_, r) {r(err);})

	// Fetch and load all files.
	return getdatas(ys).then(
		/* @param{string[]} zs */
		function(zs) {
			var err = loaddatas(ys, zs);
			// Will reject the promise
			if (err) throw err;
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
// A bit clumsy
let ViewHelp = (function() {

/**
 * @returns{HTMLElement}
 */
function mk() {
	let p = View.mkhelp();
	p.classList.add("main-help");

	// That's clumsy :shrug:
	document.body.style.height   = "unset";
	document.body.style.overflow = "unset";

	document.getElementsByTagName("html")[0].style.height   = "unset";
	document.getElementsByTagName("html")[0].style.overflow = "unset";
	return p;
}


/**
 * @returns{HTMLElement}
 */
return {
	"mk" : mk,
};

})();

let ViewAbout = (function () {

/**
 * Data type : [[name, url, license, license url], ...]
 *
 * @type{Object.<string, Array<[string, string, string, string]>>}
 */
let datas = {
	"dict"   : [],
	"decomp" : [],
	"big5"   : [],
	"book"   : [],

	// Not in database (yet?)
	"audio"  : [
		[
			"AllSet Learning", "https://www.allsetlearning.com/",
			"CC BY-NC-SA 3.0", "https://creativecommons.org/licenses/by-nc-sa/3.0/",
		],
		[
			"Davinfifield", "https://github.com/davinfifield/mp3-chinese-pinyin-sound",
			"Unlicense",    "https://unlicense.org/",
		],
	],
	"img"    : [
		[
			"WikiMedia Stroke Order Project",
			"https://commons.wikimedia.org/wiki/Commons:Ancient_Chinese_characters_project",
			"CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/",
		],
		[
			"WikiMedia Ancient Chinese characters project",
			"https://commons.wikimedia.org/wiki/Commons:Ancient_Chinese_characters_project",
			"CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/",
		],
	],
};

for (var i = 0; i < DB.datas.length; i++) {
	// Home made data; not necessary.
	if (DB.datas[i].UrlInfo == "https://www.zhongmu.eu/")
		continue;

	datas[DB.datas[i].Type].push([
		DB.datas[i].Name,
		DB.datas[i].UrlInfo,
		DB.datas[i].License,
		DB.datas[i].UrlLicense,
	]);
}

/** @type{Object.<string, string>} */
var datanames = {
	"dict"   : "Dictionaries",
	"decomp" : "Decomposition tables",
	"book"   : "Books",
	"img"    : "Images",
	"audio"  : "Audio",
	"big5"   : "Unicode/Big5 tables",
}

/** @type{(arg0 : string) => string} */
function mkdatasection(t) {
	if (!(t in datanames)) {
		Assert.assert(t+" not in datanames");
		return "";
	}

	if (!(t in datas)) {
		Assert.assert(t+" not in datas");
		return "";
	}

	let s = "<h3>"+datanames[t]+"</h3>\n"
	s += "<p>Are currently supported to various degrees:</p><ul>";

	for (var i = 0; i < datas[t].length; i++) {
		s += "<li>"
		s += '<a href="'+datas[t][i][1]+'">'+datas[t][i][0]+'</a>, ';
		s += '<a href="'+datas[t][i][3]+'">'+datas[t][i][2]+'</a>;';
		s += "</li>\n";
	}

	return s+"</ul>\n";
}

/**
 * @returns{HTMLElement}
 */
function mk() {
	let s = `<h2>Contact</h2>
<p>You can contact <a href="https://mbivert.com/about">me</a> by
email at mathieu.<span style="display: none">nope</span>bivert chez:</p>

<img src="${Config.root}/me.png" alt="email" />

<h2>Resources</h2>
<p>We rely on several resources that are at least free for
non-commercial use.</p>

<p>If you find this software useful, you may want to consider
donating to either
<a href="https://www.mdbg.net/chinese/dictionary?page=donation">MDBG</a>
(CC-CEDICT's maintainers) or to
<a href="https://donate.wikimedia.org/wiki/Ways_to_Give">Wikimedia</a>,
or to the maintainers of any other data sources used by this project.</p>
`

	for (var t of ["dict", "decomp", "book", "img", "audio", "big5"])
		s += mkdatasection(t);

	let p = document.createElement("div")
	p.classList.add("main-about");
	p.innerHTML = s;

	// That's clumsy :shrug:
	document.body.style.height   = "unset";
	document.body.style.overflow = "unset";

	document.getElementsByTagName("html")[0].style.height   = "unset";
	document.getElementsByTagName("html")[0].style.overflow = "unset";
	return p;
}

return {
	"mk" : mk,
};
})();

let SPA = (function () {

/** @type{Object.<string, (args0 ?: any) => (HTMLElement|Promise<HTMLElement>)>} */
let pages = {
	"index"  : {
		"mk"    : ViewIndex.mk,
		"title" : "Chinese character inspection",
	},
	"book"   : {
		"mk"    : ViewBook.mk,
		"title" : "Book viewing",
	},
	"trbook" : {
		"mk"    : ViewTrBook.mk,
		"title" : "Translated book viewing",
	},
	"help"   : {
		"mk"    : ViewHelp.mk,
		"title" : "Help",
	},
	"about"  : {
		"mk"    : ViewAbout.mk,
		"title" : "About",
	},
	"books"  : {
		"mk"    : ViewBooks.mk,
		"title" : "Books",
	},
};

/**
 * Navigate to a given page. The page should exists
 * in the `pages` hash.
 *
 * The navigation cleans the `id="main"` node, and rebuilds
 * it with the constructor associated to the page pointed
 * by `to`.
 *
 * @param{string} [to]
 * @returns{Promise<HTMLElement>} - resolved once the page is loaded; rejected in case of error
 */
function navigate(to) {
	if (to === undefined)
		to = "index";

	// That's clumsy :shrug:
	// (This resets things to what's in zm.css)
	document.body.style.height   = "";
	document.body.style.overflow = "";

	document.getElementsByTagName("html")[0].style.height   = "";
	document.getElementsByTagName("html")[0].style.overflow = "";

	to = to.replace(/#.*$/,    "");
	to = to.replace(/\.html$/, "");
	to = to.replace(/^\/+/,    "");

	if (to === "")
		to = "index";

	if (!(to in pages))
		return Promise.reject("unknown page name \""+to+"\"");

	let mk = /** (args0 ?:any) => HTMLElement */ pages[to].mk;

	Dom.loading()
	let p = mk();

	// Some pages (book/trbook) will fetch additional
	// data; their mk() will return a Promise wrapping
	// the final HTMLElement.
	//
	// TODO: we need to handle the error cases better;
	// in particular, in case of failure, Dom.loading()
	// will keep on rotating, and the error messages if
	// any are only in the JS console.
	return Promise.resolve(p).then(function(p) {
		// TODO: this shouldn't be done in e.g. View ../modules/view/book.js:main
		p.setAttribute("id", "main");
		Dom.getbyid("main").replaceWith(p);
		Dom.loaded();
		// TODO: include book title if any
		Dom.settitle("Zhongmu - "+pages[to].title);
		return p;
	});
}

/**
 * @param{string} [to]
 * @param{string} [root]
 * @param{UserPrefs} [prefs]
 * @returns{Promise<HTMLElement>}
 */
function init(to, root, prefs) {
	if (root)
		// @ts-ignore
		Config.root = root;
	if (prefs) User.setprefs(prefs);

	// TODO: extract view/grid.js's mkimgs() mechanism to dom.js
	// and use this instead?
	if (User.prefs.fonts.length)
		Dom.loadfont(Config.root+"/data/fonts/"+User.prefs.fonts[0])

	// XXX/hack demonstration
	// (IIRC this is because of the Russian book?)
	var s = Bookmark.preload((document.location.hash || "#").slice(1));
	if (s.b && User.prefs && User.prefs.books && s.b in User.prefs.books)
	if (User.prefs.books[s.b] && User.prefs.books[s.b].tabs !== undefined)
		// @ts-ignore
		User.prefs.tabs = User.prefs.books[s.b].tabs;

	// probably preferable to do that once we've got
	// a page correctly initialized :shrug:
	function handlenavigate() {

		// Still too early (2024-07-25)
		//	https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
		//
		// Can't figure out a way to make dark incantations work:
		//	https://stackoverflow.com/a/52809105
		//
		// So we're doing it old-fashioned.
/*
		window.navigation.addEventListener("navigate", function(e) {
			e.preventDefault();
			console.log(e);
			console.log('location changed!');
		});
*/

		document.addEventListener("click", function(e) {
			if (e.target.tagName !== "A")
				return;

			console.log(e);

			// That's clumsy: we setup a listener on document
			// via Dom.alisten() in '../modules/view/book.js:/^function setup/'
			// and so such events which theoretically shouldn't come up
			// do come up
			if (e.target.classList.contains(Classes.tocentry))
				return;

			console.log("here", e);

			let link = e.target.getAttribute("href");

			// So far we have nothing else (mailto:, ftp (...), etc.) so
			// this should work
			if (!link.startsWith("http://") && !link.startsWith("https://")) {
				console.log("don't go up!");
				e.preventDefault();
				e.stopPropagation();
				// window.location = ... would actually trigger
				// a navigation to said page.
				//
				// It's important to alter the URL now, before
				// we call navigate(), because the URL is likely
				// to contain a bookmark.
				window.history.pushState(link, "TODO", link);
				SPA.navigate(link);
			}
		});

		// going back in the history
		window.addEventListener("popstate", function(e) {
			e.preventDefault();
			e.stopPropagation();
			console.log(e)

			SPA.navigate(window.location.pathname);
		});
	}

	Dom.loading();
	return Data.init(User.getnames()).then(function() {
		return SPA.navigate(to);
	}).then(function(p) {
		handlenavigate();
		return p;
	});
}

return {
	"init"     : init,
	"pages"    : pages,
	"navigate" : navigate,
};})();
let TestsBookmark = (function() {

/** @type{Array.<Test>} */
let tests = [
	/*
	 * Bookmark.dump()
	 */
	{
		f        : Bookmark.dump,
		args     : [{}, []],
		expected : "",
		descr    : "Nothing to dump",
	},
	{
		f        : Bookmark.dump,
		args     : [{ a : "foo", b : "bar"}, []],
		expected : "",
		descr    : "Nothing to dump (bis)",
	},
	{
		f        : Bookmark.dump,
		args     : [
			{ a : "foo", b : "bar"},
			[{ bn : "a", "sn" : "a", type : SVarType.String}]
		],
		expected : "a=foo",
		descr    : "Single string dumping",
	},
	{
		f        : Bookmark.dump,
		args     : [
			{ a : 89, b : "bar"},
			[{ bn : "a", "sn" : "a", type : SVarType.Number}]
		],
		expected : "a=89",
		descr    : "Single number dumping",
	},
	{
		f        : Bookmark.dump,
		args     : [
			{ a : "foo;", b : "bar"},
			[{ bn : "a", "sn" : "a", type : SVarType.String}]
		],
		expected : undefined,
		error    : "assert(): Bookmark.dump(): a contains a ';'",
		descr    : "Throws when trying to dump a string containing a ';'",
	},
	{
		f        : Bookmark.dump,
		args     : [
			{ a : "foo=", b : "bar"},
			[{ bn : "a", "sn" : "a", type : SVarType.String}]
		],
		expected : undefined,
		error    : "assert(): Bookmark.dump(): a contains a '='",
		descr    : "Throws when trying to dump a string containing a '='",
	},
	{
		f        : Bookmark.dump,
		args     : [
			{ a : "foo", b : "bar"},
			[
				{ bn : "a", "sn" : "a", type : SVarType.String},
				{ bn : "b", "sn" : "b", type : SVarType.String},
			]
		],
		expected : "a=foo;b=bar",
		descr    : "Double string dumping",
	},
	{
		f        : Bookmark.dump,
		args     : [
			{ a : "foo", b : "bar"},
			[
				{ bn : "c", "sn" : "a", type : SVarType.String},
				{ bn : "d", "sn" : "b", type : SVarType.String},
			]
		],
		expected : "c=foo;d=bar",
		descr    : "Double string dumping, altering dumped names",
	},
	{
		f        : Bookmark.dump,
		args     : [
			{ a : { c : "foo" }, b : "bar"},
			[
				{ bn : "c", "sn" : "a.c", type : SVarType.String},
				{ bn : "b", "sn" : "b",   type : SVarType.String},
			]
		],
		expected : "c=foo;b=bar",
		descr    : "Double string dumping, different depth",
	},
	/*
	 * Bookmark.preload()
	 */
	{
		f        : Bookmark.preload,
		args     : [""],
		expected : {},
		descr    : "Empty dump string",
	},
	{
		f        : Bookmark.preload,
		args     : ["a=1"],
		expected : { a : "1"},
		descr    : "Single variable, single depth",
	},
	{
		f        : Bookmark.preload,
		args     : ["a=1;b=hello"],
		expected : { a : "1", b : "hello"},
		descr    : "Double variables, single depth",
	},
	{
		f        : Bookmark.preload,
		args     : ["a=1;b=hello;c.d=true%20story"],
		expected : { a : "1", b : "hello", "c.d" : "true story"},
		descr    : "Three variables, variable depth, HTML code"
	},
	/*
	 * Bookmark.load()
	 */
	{
		f        : Bookmark.load,
		args     : [{}, [], ""],
		expected : {},
		descr    : "Empty dump string/object/svars",
	},
	{
		f        : Bookmark.load,
		args     : [{}, [], "a=42"],
		expected : {},
		descr    : "Dump string data not in svars: ignored",
	},
	{
		f        : Bookmark.load,
		args     : [{}, [{ bn : "a", "sn" : "a", type : SVarType.String}], "a=42"],
		expected : { a : "42" },
		descr    : "Loading a string, no depth, no name change",
	},
	{
		f        : Bookmark.load,
		args     : [{}, [{ bn : "a", "sn" : "a", type : SVarType.Number}], "a=-1"],
		expected : undefined,
		error    : "assert(): Bookmark.load(): a cannot be parsed (-1)",
		descr    : "Negative integer",
	},
	{
		f        : Bookmark.load,
		args     : [
			{
				m : { ic : 0, cs : ["hello, world"] },
			},
			[
				{ bn : "b", "sn" : "book", type : SVarType.String },
				{ bn : "c", "sn" : "m.ic", type : SVarType.Number },
				{ bn : "w", "sn" : "m.iw", type : SVarType.Number },
			],
			"b=San%20Zi%20Jing;c=3;w=2"],
		expected : {
			book : "San Zi Jing",
			m : {
				ic : 3,
				iw : 2,
				cs : ["hello, world"],
			},
		},
		descr    : "With depth, number & strings; partial object update",
	},
];

return { "tests" : tests };

})();

let TestsCut = (function() {

/**
 * Create placeholder dict entries to simplified tests
 * reading/maintainance.
 *
 * @type{(x: string) => DictEntry}
 */
function p(x) { return { "xx5" : [{ ds : [x] }] }; }

let tests = [
	/*
	 * Cut.getword()
	 */
	{
		f        : Cut.getword,
		args     : [[], 0, Data.mktdicts({d:{ "hi" : p("1"), "hit" : p("1"), "hyt" : p("1"), "foo" : p("1")}})],
		expected : [0, {}],
		descr    : "Empty string"
	},
	{
		f        : Cut.getword,
		args     : [["h"], 0, Data.mktdicts({d:{ "h" : p("1"), "hit" : p("1"), "hyt" : p("1"), "foo" : p("1")}}, {})],
		expected : [1, {d:p("1")}],
		descr    : "One character word"
	},
	{
		f        : Cut.getword,
		args     : [[..."hi"], 0, Data.mktdicts({d:{ "hi" : p("e"), "hit" : p("f"), "hyt" : p("g"), "foo" : p("h")}}, {})],
		expected : [ 2, {d:p("e")}],
		descr    : "Word matching full string"
	},
	{
		f        : Cut.getword,
		args     : [[..."hie"], 0, Data.mktdicts({d:{ "hi" : p("e"), "hit" : p("f"), "hyt" : p("g"), "foo" : p("h")}}, {})],
		expected : [2, {d:p("e")}],
		descr    : "Remaining bytes"
	},
	{
		f        : Cut.getword,
		args     : [[..."xxx"], 0, Data.mktdicts({d:{ "hi" : p("1"), "hit" : p("1"), "hyt" : p("1"), "foo" : p("1")}}, {})],
		expected : [3, {}],
		descr    : "No word read: eat first western word anyway"
	},
	{
		f        : Cut.getword,
		args     : [[..."中xx"], 0, Data.mktdicts({d:{ "hi" : p("1"), "hit" : p("1"), "hyt" : p("1"), "foo" : p("1")}}, {})],
		expected : [1, {}],
		descr    : "No word read: eat first chinese character anyway"
	},
	{
		f        : Cut.getword,
		args     : [[..."中心心"], 0, Data.mktdicts({d:{ "中i" : p("1"), "中it" : p("1"), "中yt" : p("1"), "foo" : p("1")}}, {})],
		expected : [1, {}],
		descr    : "No word read, but 1 byte move. Also eat first char anyway."
	},
	{
		f        : Cut.getword,
		args     : [[..."中古心"], 0, Data.mktdicts({d:{ "中盤" : p("1"), "中盤t" : p("1"), "中古盤" : p("1"), "foo" : p("1")}}, {})],
		expected : [1, {}],
		descr    : "No word read, but 2 byte move. Also eat first char anyway"
	},
	{
		f        : Cut.getword,
		args     : [[..."hitte"], 0, Data.mktdicts({d:{ "hi" : p("1"), "hittt" : p("1"), "hyt" : p("1"), "foo" : p("1")}}, {})],
		expected : [2, {d:p("1")}],
		// XXX useless moves were when we didn't distinguish Chinese vs. Western.
		descr    : "A word read, 2 useless move"
	},
	{
		f        : Cut.getword,
		args     : [[..."hittte"], 0, Data.mktdicts({d:{ "hi" : p("1"), "hittt" : p("bl"), "hitttte" : p("1")}}, {})],
		expected : [5, {d:p("bl")}],
		// XXX useless moves were when we didn't distinguish Chinese vs. Western.
		descr    : "Similar to before but with two known words on the path",
	},

	/*
	 * Cut.markpinyin()
	 */
/*
	{
		f        : Cut.markpinyin,
		args     : [
			Cut.rtokenize([...""]),
		],
		expected : [
			{ t : TokenType.EOF,     i : 0,  j : 0,       v : ''       },
		],
		descr    : "Empty input",
	},
	{
		f        : Cut.markpinyin,
		args     : [
			Cut.rtokenize([..."hello world"]),
		],
		expected : [
			{ t : TokenType.Foreign, i : 0,  j : 5,       v : 'hello', },
			{ t : TokenType.Punct,   i : 5,  j : 6,       v : ' '      },
			{ t : TokenType.Foreign, i : 6,  j : 11,      v : 'world'  },
			{ t : TokenType.EOF,     i : 11,  j : 11,     v : ''       },
		],
		descr    : "Nothing to melt",
	},
	{
		f        : Cut.markpinyin,
		args     : [
			Cut.rtokenize([..."[Pan2 gu3] pan2"]),
		],
		expected : [
			{ t : TokenType.Punct,   i : 0,  j : 1,       v : '[',    },
			{ t : TokenType.Pinyin,  i : 1,  j : 5,       v : 'Pan2'  },
			{ t : TokenType.Punct,   i : 5,  j : 6,       v : ' ',    },
			{ t : TokenType.Pinyin,  i : 6,  j : 9,       v : 'gu3'   },
			{ t : TokenType.Punct,   i : 9,  j : 10,      v : ']',    },
			{ t : TokenType.Punct,   i : 10, j : 11,      v : ' ',    },
			{ t : TokenType.Foreign, i : 11, j : 15,      v : 'pan2'  },
			{ t : TokenType.EOF,     i : 15, j : 15,      v : ''      },
		],
		descr    : "Pinyin identified between brackets only",
	},
*/

	/*
	 * Cut.tokenize()
	 */
	{
		f        : Cut.tokenize,
		args     : [
			[..."hello 中 world 心心"],
			Data.mktdicts({d:{'心' : p('heart')}}, {}),
		],
		expected : [
			{ t : TokenType.Word, i : 0,  j : 5,       d : {},  c :{},              v : 'hello', },
			{ t : TokenType.Punct,   i : 5,  j : 6,   d : {},  c :{},                 v : ' '      },
			{ t : TokenType.Word, i : 6,  j : 7,  d : {},  c :{},                       v : '中'     },
			{ t : TokenType.Punct,   i : 7,  j : 8,     d : {},  c :{},                 v : ' '      },
			{ t : TokenType.Word, i : 8,  j : 13,         d : {},  c :{},            v : 'world'  },
			{ t : TokenType.Punct,   i : 13, j : 14,       d : {},  c :{},            v : ' '      },
			{ t : TokenType.Word, i : 14, j : 15, d : {d:p('heart')}, c : {}, v : '心'     },
			{ t : TokenType.Word, i : 15, j : 16, d : {d:p('heart')}, c : {}, v : '心'     },
		],
		descr    : "Basic tokenisation",
	},
	// NOTE/TODO: we used to perform Pinyin marking here; we'll now
	// try to do this in view/grid.js as this is solely useful for
	// tokenized description.
	{
		f        : Cut.tokenize,
		args     : [
			[..."refers to the Pangu 盤古|盘古[Pan2 gu3] creation myth"],
			Data.mktdicts({"d" : {
				'盤古' : p('Pangu'),
				'盘古'  : p('Pangu'),
		}}), {}],
		expected : [
			{ t : TokenType.Word,   i : 0,  j : 6,  v : "refers",   d  : {},             c   : {}   },
			{ t : TokenType.Punct,  i : 6,  j : 7,  v : " ",        d :  {},             c :    {} },
			{ t : TokenType.Word,   i : 7,  j : 9,  v : "to",       d  : {},             c   : {}   },
			{ t : TokenType.Punct,  i : 9,  j : 10, v : " ",        d :  {},             c :    {} },
			{ t : TokenType.Word,   i : 10, j : 13, v : "the",      d  : {},             c   : {}   },
			{ t : TokenType.Punct,  i : 13, j : 14, v : " ",        d :  {},             c :    {} },
			{ t : TokenType.Word,   i : 14, j : 19, v : "Pangu",    d  : {},             c   : {}   },
			{ t : TokenType.Punct,  i : 19, j : 20, v : " ",        d  : {},             c :    {} },
			{ t : TokenType.Word,   i : 20, j : 22, v : "盤古",     d  : {d:p('Pangu')}, c   : {}   },
			{ t : TokenType.Punct,  i : 22, j : 23, v : "|",        d  : {},             c   : {}   },
			{ t : TokenType.Word,   i : 23, j : 25, v : "盘古",      d  : {d:p('Pangu')}, c   : {}},
			{ t : TokenType.Punct,  i : 25, j : 26, v : "[",        d  : {},             c   : {}   },
			{ t : TokenType.Word,   i : 26, j : 30, v : "Pan2",     d  : {},             c   : {}   },
			{ t : TokenType.Punct,  i : 30, j : 31, v : " ",        d :  {},             c :    {} },
			{ t : TokenType.Word,   i : 31, j : 34, v : "gu3",      d  : {},             c   : {}   },
			{ t : TokenType.Punct,  i : 34, j : 35, v : "]",        d  : {},             c   : {}   },
			{ t : TokenType.Punct,  i : 35, j : 36, v : " ",        d :   {},            c :    {} },
			{ t : TokenType.Word,   i : 36, j : 44, v : "creation", d  : {},             c   : {}   },
			{ t : TokenType.Punct,  i : 44, j : 45, v : " ",        d :   {},            c :    {} },
			{ t : TokenType.Word,   i : 45, j : 49, v : "myth",     d  : {},             c   : {}   },
		],
		descr    : "Description sample",
	},
	// We used to perform between brackets pinyin reckognition by hand in
	// the HTML generating code.
	//
	// As such, the tokenizing code was used to group all puncts,
	// not treating '[' and ']' as special cases, as it is now.
	//
	// This is a bit fragile (e.g. we're not checking correct [] balancing)
	// nor exhaustive (we could have a table of all existing pinyins and
	// switch the type on all Foreign matching token), but that should be
	// sturdy enough for now.
	//
	// As the feature may evolve in the future, (e.g. were we to use dictionaries
	// with radically different convention) we keep that test to properly emphasize
	// that point.
	{
		f        : Cut.tokenize,
		args     : [
			[..."],,"],
			Data.mktdicts({}, {})
		],
		expected : [
			{ t : TokenType.Punct, i : 0,  j : 1, v : ']',  d : {}, c : {} },
			{ t : TokenType.Punct, i : 1,  j : 3, v : ',,', d : {}, c : {} },
		],
		descr    : "Make it clear that we do *not* group all puncts (we used to)",
	},
	// Dictionary entries containing punctuations (sentences) aren't
	// supported for now. We have a tokenize() draft in cut.js that
	// support them, but the code is too clumsy.
	{
		f        : Cut.tokenize,
		args     : [
			[..."人,之"],
			Data.mktdicts({ "cedict" : {
				'人,之' : p('meh'),
				'人'    : p('man'),
				'之'    : p('de'),
			}}, {})
		],
/*
		expected : [{
			t : TokenType.Word,
			i : 0,
			j : 3,
			v : "人,之",
			d : { "cedict" : p("meh") },
			c : {},
		}],
*/
		expected : [
			{ "t": TokenType.Word,  "i": 0, "j": 1, "v": "人", "d": {cedict:p("man")}, c : {} },
			{ "t": TokenType.Punct, "i": 1, "j": 2, "v": ",",  "d": {},                c : {} },
			{ "t": TokenType.Word,  "i": 2, "j": 3, "v": "之", "d": {cedict:p("de")},  c : {} },
		],

		descr    : "Guard against entries containing punctuation (ispunct())",
	},
	/*
	 * Cut.meltcn()
	 */
	{
		f        : Cut.meltcn,
		args     : [
			[..."看中文"],
			{ t : TokenType.Word, i : 0, j : 3 },
			Data.mktdicts({ "cedict" : {
				"看中" : p("foo"),
				"中文" : p("bar"),
				"看"   : p("baz"),
				"中"   : p("baz"),
				"文"   : p("baz"),
			}}, {})
		],
		expected : [
			{
				t : TokenType.Word,
				i : 0,
				j : 2,
				d : { "cedict" : p("foo") },
				c : {},
				v : '看中',
			},
			{
				t : TokenType.Word,
				i : 1,
				j : 3,
				d : { "cedict" : p("bar") },
				c : {},
				v : '中文',
			}
		],
		descr    : "Melting two consecute overlaping words.",
	},
	/*
	 * Cut.cut()
	 */
	{
		f        : Cut.cut,
		args     : [
			"",
			Data.mktdecs({},  {}),
			Data.mktdicts({}, {}),
		],
		expected : [],
		descr    : "Empty input",
	},
	{
		f        : Cut.cut,
		args     : [
			"心",
			Data.mktdecs({}, {}),
			Data.mktdicts({
				"cedict" : { '心' : p("heart") }
			}, {}),
		],
		expected : [
			{
				t : TokenType.Word,
				i : 0,
				j : 1,
				d : { "cedict" : p("heart") },
				c : {},
				v : '心',
			}
		],
		descr    : "Defined, unbreakable Chinese word",
	},
	{
		f        : Cut.cut,
		args     : [
			"好",
			Data.mktdecs({
				"wm" : {
					'好' : [{
						t : DecompType.CnLeftToRight,
						c : ['女', '子']
					}],
				},
			}, {}),
			Data.mktdicts({
				"cedict" : {
					'好' : p("good"),
					'女' : p("woman"),
					'子' : p("child"),
				},
			}, {}),
		],
		expected : [
			{
				t : TokenType.Word,
				i : 0,
				j : 1,
				d : { 'cedict' : p("good") },
				v : '好',
				c : {
					"wm" : [{
						t : DecompType.CnLeftToRight,
						c : [
							{ v : '女', d : { 'cedict' : p('woman') }, c : {} },
							{ v : '子', d : { 'cedict' : p('child') }, c : {} },
						],
					}],
				},
			},
		],
		descr    : "Decomposition on single, known, Chinese, single-layer decomposable char",
	},
	{
		f        : Cut.cut,
		args     : [
			"中文",
			Data.mktdecs({}, {}),
			Data.mktdicts({
				"cedict" : {
					"中"   : p("foo"),
					"文"   : p("bar"),
				},
			}, {}),
		],
		expected : [
			{ t : TokenType.Word, i : 0, j : 1, d : { 'cedict' : p('foo') }, c : {}, v : "中" },
			{ t : TokenType.Word, i : 1, j : 2, d : { 'cedict' : p('bar') }, c : {}, v : "文" },
		],
		descr    : "Two consecuting non-overlapping mono-character words",
	},
	{
		f        : Cut.cut,
		args     : [
			"hello 中 world 心心",
			Data.mktdecs({}, {}),
			Data.mktdicts({
				"cedict" : {'心' : p('heart') }
			}, {}),
		],
		expected : [
			{ t : TokenType.Word,  i : 0,  j : 5,  d : {},                         v : 'hello',  c : {} },
			{ t : TokenType.Punct, i : 5,  j : 6,  d : {},                         v : ' ',      c : {} },
			{ t : TokenType.Word,  i : 6,  j : 7,  d : {},                         v : '中',     c : {} },
			{ t : TokenType.Punct, i : 7,  j : 8,  d : {},                         v : ' ',      c : {} },
			{ t : TokenType.Word,  i : 8,  j : 13, d : {},                         v : 'world',  c : {} },
			{ t : TokenType.Punct, i : 13, j : 14, d : {},                         v : ' ',      c : {} },
			{ t : TokenType.Word,  i : 14, j : 15, d : { 'cedict' : p('heart') },  v : '心',     c : {} },
			{ t : TokenType.Word,  i : 15, j : 16, d : { 'cedict' : p('heart') },  v : '心',     c : {} },
		],
		descr    : "Basic tokenisation",
	},
	{
		f        : Cut.cut,
		args     : [
			"乖",
			Data.mktdecs({"wm" : {
				'乖' : [{ t : DecompType.Unknown, c : ['千', '北']}],
				'千' : [{ t : DecompType.Unknown, c : ['丿', '十']}],
				'北' : [{ t : DecompType.Unknown, c : ['爿', '匕']}],
			}}),
			Data.mktdicts({"cedict" : {
				'乖' : p("obedient"),
				'千' : p("thousand"),
				'十' : p("ten"),
				'北' : p("north"),
				'爿' : p("piece of wood"),
				'匕' : p("dagger"),
			}}),
		],
		expected : [
			{
				t : TokenType.Word,
				i : 0,
				j : 1,
				d : { "cedict" : p('obedient') },
				v : '乖',
				c  : { "wm" : [{
					t : DecompType.Unknown,
					c : [
						{
							v  : '千',
							d : { "cedict" : p('thousand') },
							c  : { "wm" : [{
								t : DecompType.Unknown,
								c : [
									{ v  : '丿', d : {},                    c  : {} },
									{ v  : '十', d : {"cedict" : p('ten')}, c  : {} },
								]
							}]},
						},
						{
							v  : '北',
							d : { "cedict" : p('north') },
							c  : { "wm" : [{
								t : DecompType.Unknown,
								c : [
									{ v  : '爿', d : {"cedict" : p('piece of wood')}, c  : {} },
									{ v  : '匕', d : {"cedict" : p('dagger')},        c  : {} }
								],
							}]},
						},
					],
				}]}
			},
		],
		descr    : "Defined, two-layer breakable word",
	},
	{
		f        : Cut.cut,
		args     : [
			'九天是好',
			/*
			 * Incomplete and "inaccurate" according to decomp.csv,
			 * for UTs' only.
			 */
			Data.mktdecs({ "wm" : {
				'天' : [{ t : DecompType.Unknown, c : ['一', '大'] }],
				'大' : [{ t : DecompType.Unknown, c : ['人', '一'] }],
			}}, {}),
			Data.mktdicts({ "cedict" : {
				'九天' : p("the Ninth Heaven"),
				'九'   : p("nine"),
				'天'   : p("Heaven, sky"),
				'是'   : p("to be"),
				'好'   : p("good"),
				'一'   : p("one"),
				'大'   : p("great"),
				'人'   : p("man"),
			}}, {}),
		],
		expected : [
			{
				t : TokenType.Word,
				i : 0,
				j : 2,
				v : '九天',
				d : { "cedict" : p("the Ninth Heaven") },
				c : { "auto" : [{
					t : DecompType.Auto,
					c : [
						{
							v : '九',
							d : { "cedict" : p('nine') },
							c : {},
						},
						{
							v : '天',
							d : { "cedict" : p('Heaven, sky') },
							c : { "wm" : [{
								t : DecompType.Unknown,
								c : [
									{
										v : '一',
										d : {"cedict" : p('one') },
										c : {},
									},
									{
										v : '大',
										d : { "cedict" : p('great') },
										c : { "wm" : [{
											t : DecompType.Unknown,
											c : [
												{
													v : '人',
													d : { "cedict" : p('man') },
													c : {},
												},
												{
													v : '一',
													d : { "cedict" : p('one') },
													c : {},
												},
											],
										}]},
									},
								],
							}]},
						},
					],
				}]},
			},
			{
				t : TokenType.Word,
				i : 2,
				j : 3,
				v : '是',
				d : { "cedict" : p("to be") },
				c : {},
			},
			{
				t : TokenType.Word,
				i : 3,
				j : 4,
				v : '好',
				d : { "cedict" : p("good") },
				c : {},
			},
		],
		descr    : "One two-characters word, two one-character words"
	},
	{
		f        : Cut.cut,
		args     : ["𤴓", Data.mktdecs({}, {}), Data.mktdicts({}, {})],
		expected : [
			{
				t : TokenType.Word,
				i : 0,
				j : 1,
				v : '𤴓',
				d : {},
				c : {},
			},
		],
		descr    : "Encoding issue when naively going through string",
	},
	// Typical example were ancient Cut.cut() would fail and break word
	// in [一, 丁點]
	{
		f        : Cut.cut,
		args     : [
			"一丁點", Data.mktdecs({}, {}), Data.mktdicts({ "cedict" : {
			'一'     : p('[yi1] /one/1/single'),
			'一丁點' : p('[yi1 ding1 dian3] /a tiny bit/a wee bit/'),
			'丁點'   : p('[ding1 dian3] /tiny bit/'),
		}}, {})],
		expected : [
			{
				t : TokenType.Word,
				i : 0,
				j : 3,
				v : '一丁點',
				d : { "cedict" : p('[yi1 ding1 dian3] /a tiny bit/a wee bit/') },
				c : { "auto" : [{
					t : DecompType.Auto,
					c : [
						{
							v : '一',
							d : { "cedict" : p('[yi1] /one/1/single') },
							c : {},
						},
						{
							v : '丁點',
							d : { "cedict" : p('[ding1 dian3] /tiny bit/') },
							c : { "auto" : [{
								t : DecompType.Auto,
								c : [
									{
										v : '丁',
										d : {},
										c : {},
									},
									{
										v : '點',
										d : {},
										c : {},
									},
								],
							}]},
						},
					],
				}]},
			},
		],
		descr    : "Correctly parse long words (ancient bug)",
	},
	{
		f        : Cut.cut,
		args     : [
			"看中文",
			Data.mktdecs({}, {}),
			Data.mktdicts({ "cedict" : {
				"看中" : p("foo"),
				"中文" : p("bar"),
				"看"   : p("baz"),
				"中"   : p("baz"),
				"文"   : p("baz"),
			}}, {}),
		],
		expected : [
			{
				t : TokenType.Word,
				i : 0,
				j : 2,
				d : { "cedict" : p('foo') },
				v : '看中',
				c : { "auto" : [{
					t : DecompType.Auto,
					c : [
						{ v : '看', d : { "cedict" : p('baz') }, c : {} },
						{ v : '中', d : { "cedict" : p('baz') }, c : {} },
					],
				}]},
			},
			{
				t : TokenType.Word,
				i : 1,
				j : 3,
				d : { "cedict" : p('bar') },
				v : '中文',
				c : { "auto" : [{
					t : DecompType.Auto,
					c : [
						{ v : '中', d : { "cedict" : p('baz') }, c : {} },
						{ v : '文', d : { "cedict" : p('baz') }, c : {} },
					],
				}]},
			}
		],
		descr    : "Two consecute overlaping words.",
	},
	{
		f        : Cut.cut2,
		args     : [
			"看中文",
			Data.mktdecs({}, {}),
			Data.mktdicts({ "cedict" : {
				"看中" : p("foo"),
				"中文" : p("bar"),
				"看"   : p("baz"),
				"中"   : p("baz"),
				"文"   : p("baz"),
			}}, {}),
		],
		expected : [
			{
				t : TokenType.Word,
				i : 0,
				j : 2,
				d : { "cedict" : p('foo') },
				v : '看中',
				c : { "auto" : true },
			},
			{
				t : TokenType.Word,
				i : 1,
				j : 3,
				d : { "cedict" : p('bar') },
				v : '中文',
				c : { "auto" : true },
			},
		],
		descr    : "Two consecute overlaping words.",
	},
];

return { "tests" : tests };

})();
let TestsData = (function() {

/**
 * Create placeholder dict entries to simplified tests
 * reading/maintainance.
 *
 * @type{(x: string) => DictEntry}
 */
function p(x) { return { "xx5" : [{ ds : [x]}]}; }

var tests = [
	/*
	 * Data.mktdicts()
	 */
	{
		f        : Data.mktdicts,
		args     : [{}, {}],
		expected : {},
		descr    : "Creating an empty tdicts"
	},
	/*
	 * Weird that tsc(1) does not complain about the string placeholders
	 * used instead of proper DictEntry<string>.
	 */
	{
		f        : Data.mktdicts,
		args     : [
			{ "fst" : { "hi" : "e", "hit" : "f", "hyt" : "g", "foo" : "h"} },
			{},
		],
		expected : {
			h : [{
				i : [
					{ t : [{}, { "fst" : "f"}] },
					{
						"fst" : "e",
					}
				],
				y : [
					{ t : [ {}, { "fst" : "g"}] },
					{},
				],
			}, {}],
			f : [{
				o : [
					{ o : [{}, { "fst" : "h"}] },
					{},
				],
			}, {}],
		},
		descr    : "Basic test, one dict"
	},
	{
		f        : Data.mktdicts,
		args     : [
			{
				"fst" : { "hi"  : "e", "hit" : "f", "hyt" : "g", "foo" : "h"},
				"snd" : { "hie" : "m", "hit" : "g" },
			},
			{},
		],
		expected : {
			h : [{
				i : [
					{
						t : [{}, { "fst" : "f", "snd" : "g"}],
						e : [{}, {              "snd" : "m"}],
					},
					{
						"fst" : "e",
					}
				],
				y : [
					{ t : [ {}, { "fst" : "g"}] },
					{},
				],
			}, {}],
			f : [{
				o : [
					{ o : [{}, { "fst" : "h"}] },
					{},
				],
			}, {}],
		},
		descr    : "Basic test, two dicts"
	},
	/*
	 * Data.mktdecs()
	 */
	{
		f        : Data.mktdecs,
		args     : [{}, {}],
		expected : {},
		descr    : "Creating an empty tdecomps"
	},
	{
		f        : Data.mktdecs,
		args     : [{
			"fst" : {
				"一" : [],
				"丙" : [{ t : DecompType.CnAboveToBelow, cs : ["一", "内"]}],
			},
		}, {}],
		expected : {
			"一" : { "fst" : [] },
			"丙" : { "fst" : [{ t : DecompType.CnAboveToBelow, cs : ["一", "内"]}] },
		},
		descr    : "Basic test, single decomp"
	},
	{
		f        : Data.mktdecs,
		args     : [{
			"fst" : {
				"一" : [],
				"丙" : [{ t : DecompType.CnAboveToBelow, cs : ["一", "内"      ]}],
			},
			"snd" : {
				"一" : [],
				// dummy
				"丙" : [{ t : DecompType.CnWmUnclear,    cs : ["一", "入", "冂"]}],
			},
		}, {}],
		expected : {
			"一" : { "fst" : [], "snd" : [] },
			"丙" : {
				"fst" : [{ t : DecompType.CnAboveToBelow, cs : ["一", "内"      ]}],
				"snd" : [{ t : DecompType.CnWmUnclear,    cs : ["一", "入", "冂"]}],
			},
		},
		descr    : "Basic test, two decomps"
	},

	/*
	 * Data.parseandtok()
	 */
	{
		f        : Data.parseandtok,
		args     : [""],
		expected : [],
		descr    : "empty string",
	},
	{
		f        : Data.parseandtok,
		args     : ["吾", {}, {}],
		expected : [
			{ "t" : ChunkType.Paragraph, "v" : "吾", ts : Data.tokenize("吾")}
		],
		descr    : "single undefined word",
	},

	/*
	 * https://zh.wikisource.org/wiki/%E5%8D%9C%E5%B1%85_(%E5%B1%88%E5%8E%9F)
	 */
	{
		f        : Data.parseandtok,
		args     : ["吾寧悃悃款款,朴以忠乎？", Data.mktdicts({d:{
			"吾"   : p("[Wu2] surname Wu//[wu2] I/my (old)"),
			"寧"   : p("[ning2] peaceful/to pacify/"),
			"悃"   : p("[kun3] sincere"),
			"款款" : p("[kuan3 kuan3] leisurely/sincerely"),
			"款"   : p("[kuan3] section/paragraph/funds"),
			"朴"   : p("[pu3] plain and simple"),
			"以"   : p("[yi3] to use/by means of/according to/"),
			"忠"   : p("[zhong1] loyal/devoted/honest"),
			"乎"   : p("[hu1] in/at/from/because/than"),
		}}, {})],
		expected : [
			{
				"t"  : ChunkType.Paragraph,
				"v"  : "吾寧悃悃款款,朴以忠乎？",
				"ts" : [
					{ "t": TokenType.Word, "i": 0,  "j": 1,  "v": "吾",   "d": {d:p("[Wu2] surname Wu//[wu2] I/my (old)")}, c : {}     },
					{ "t": TokenType.Word, "i": 1,  "j": 2,  "v": "寧",   "d": {d:p("[ning2] peaceful/to pacify/")}, c : {}            },
					{ "t": TokenType.Word, "i": 2,  "j": 3,  "v": "悃",   "d": {d:p("[kun3] sincere")}, c : {}                         },
					{ "t": TokenType.Word, "i": 3,  "j": 4,  "v": "悃",   "d": {d:p("[kun3] sincere")}, c : {}                         },
					{ "t": TokenType.Word, "i": 4,  "j": 6,  "v": "款款", "d": {d:p("[kuan3 kuan3] leisurely/sincerely")}, c : {}      },
					{ "t": TokenType.Punct, "i": 6,  "j": 7,  "v": ",",    "d": {}, c : {}                                              },
					{ "t": TokenType.Word, "i": 7,  "j": 8,  "v": "朴",   "d": {d:p("[pu3] plain and simple")}, c : {}                 },
					{ "t": TokenType.Word, "i": 8,  "j": 9,  "v": "以",   "d": {d:p("[yi3] to use/by means of/according to/")}, c : {} },
					{ "t": TokenType.Word, "i": 9,  "j": 10, "v": "忠",   "d": {d:p("[zhong1] loyal/devoted/honest")}, c : {}          },
					{ "t": TokenType.Word, "i": 10, "j": 11, "v": "乎",   "d": {d:p("[hu1] in/at/from/because/than")}, c : {}          },
					{ "t": TokenType.Punct, "i": 11, "j": 12, "v": "？",    "d": {}, c : {}                                 }

				]
			},
		],
		descr    : "full sentence",
	},
	{
		f        : Data.parseandtok,
		args     : [""
			+"# x y\n"
			+"## x, y\n"
			+"x y z\n"
			+"x\n"
			+"\n"
			+"x\n"
			+"## x y z\n"
			+"x\n",
			Data.mktdicts({}, {}),
		],
		expected : [
			{
				"t": ChunkType.Title,
				"v": "x y",
				"ts": [
					{ "t": TokenType.Word, "i": 0, "j": 1, "v": "x", d : {}, c : {} },
					{ "t": 0, "i": 1, "j": 2, "v": " ", d : {}, c : {} },
					{ "t": TokenType.Word, "i": 2, "j": 3, "v": "y", d : {}, c : {} }
				]
			},
			{
				"t": ChunkType.Section,
				"v": "x, y",
				"ts": [
					{ "t": TokenType.Word, "i": 0, "j": 1, "v": "x", d : {}, c : {}  },
					{ "t": TokenType.Punct, "i": 1, "j": 3, "v": ", ", d : {}, c : {} },
					{ "t": TokenType.Word, "i": 3, "j": 4, "v": "y", d : {}, c : {}  }
				]
			},
			{
				"t": ChunkType.Paragraph,
				"v": "x y z\nx",
				"ts": [
					{ "t": TokenType.Word, "i": 0, "j": 1, "v": "x", d : {}, c : {}  },
					{ "t": TokenType.Punct, "i": 1, "j": 2, "v": " ", d : {}, c : {}  },
					{ "t": TokenType.Word, "i": 2, "j": 3, "v": "y", d : {}, c : {}  },
					{ "t": TokenType.Punct, "i": 3, "j": 4, "v": " " , d : {}, c : {} },
					{ "t": TokenType.Word, "i": 4, "j": 5, "v": "z", d : {}, c : {}  },
					{ "t": TokenType.Punct, "i": 5, "j": 6, "v": "\n", d : {}, c : {} },
					{ "t": TokenType.Word, "i": 6, "j": 7, "v": "x", d : {}, c : {}  }
				]
			},
			{
				"t": ChunkType.Paragraph,
				"v": "x",
				"ts": [
					{ "t": TokenType.Word, "i": 0, "j": 1, "v": "x", d : {}, c : {} }
				]
			},
			{
				"t": ChunkType.Section,
				"v": "x y z",
				"ts": [
					{ "t": TokenType.Word, "i": 0, "j": 1, "v": "x", d : {}, c : {} },
					{ "t": TokenType.Punct, "i": 1, "j": 2, "v": " ", d : {}, c : {} },
					{ "t": TokenType.Word, "i": 2, "j": 3, "v": "y", d : {}, c : {} },
					{ "t": TokenType.Punct, "i": 3, "j": 4, "v": " ", d : {}, c : {} },
					{ "t": TokenType.Word, "i": 4, "j": 5, "v": "z", d : {}, c : {} }
				]
			},
			{
				"t": ChunkType.Paragraph,
				"v": "x",
				"ts": [
					{ "t": TokenType.Word, "i": 0, "j": 1, "v": "x", d : {}, c : {} }
				]
			}
		],
		descr    : "many sections, paragraphs",
	},
];

return { "tests" : tests };

})();
let TestsLinks = (function() {

/**
 * Local utf8 to Big5 converter, to avoid relying on Data.
 *
 * TODO: we can (should) probably rely on Data.utf82big5()
 * anyway (add an extra parameter to tweak the u2b table on
 * the fly).
 *
 * @type{(arg0 : string) => string}
 */
function u2b(c) {
	let x = c.codePointAt(0);
	if (!x) return "";
	let y = "0x"+x.toString(16).toUpperCase();
	/** @type{Object<string, string>} */
	let h = { "0x5B78" : "0xBEC7" };
	return h[y] || "";
}

/**
 * Snapshot from Links.links so as to decorelate tests from default
 * values variability as much as possible.
 *
 * @type{Links}
 */
let links = {
	"en.wiktionary.org" : {
		"fmt"  : "https://en.wiktionary.org/wiki/${w}",
	},
	"baidu.com" : {
		"fmt"  : "https://baike.baidu.com/item/${w}",
	},
	"zdic.net" : {
		"fmt"  : "https://www.zdic.net/hans/${w}",
	},
	"zh.wiktionary.org" : {
		"fmt"  : "https://zh.wiktionary.org/zh-hans/${w}",
	},
	"translate.google.com" : {
		"fmt" : "https://translate.google.com/?sl=zh-CN&tl=en&op=translate&text=${w}",
	},
	"linguee.com" : {
		"fmt" : "https://www.linguee.com/english-chinese/search?source=chinese&query=${w}",
	},
	"ctext.org" : {
		"fmt" : "https://ctext.org/dictionary.pl?char=${w}",
	},
	"mdbg.net (trad.)" : {
		"fmt" : "https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=1&wdqb=${w}",
	},
	"mdbg.net (simpl.)" : {
		"fmt" : "https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${w}",
	},
	"hanzicraft.com" : {
		"fmt" : "https://hanzicraft.com/character/${w}",
	},
	"unicode.org" : {
		"fmt"    : "https://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint=${h}",
		"single" : true,
	},
	"chise.org" : {
		"fmt"    : "https://www.chise.org/est/view/character/${w}",
		"single" : true,
	},
	"chineseetymology.org" : {
		"fmt"    : "http://internationalscientific.org/CharacterEtymology.aspx?submitButton1=Etymology&characterInput=${w}",
		"single" : true,
	},
	"chinese-characters.org" : {
		"fmt"    : "http://chinese-characters.org/meaning/${h[0]}/${h}.html",
		"single" : true,
	},
	"zhongwen.com" : {
		"fmt"    : "http://zhongwen.com/cgi-bin/zipux.cgi?=${b}",
		"single" : true,
		"big5"   : true,
	},
};

var tests = [
	/*
	 * Links.getfrom()
	 */
	{
		f        : Links.getfrom,
		args     : [{}, "nope.com", "hello"],
		expected : undefined,
		error    : "assert(): Links.getfrom(): unknown site nope.com",
		descr    : "Unknown site assertion"
	},
	{
		f        : Links.getfrom,
		args     : [links, "chinese-characters.org", "學"],
		expected : "http://chinese-characters.org/meaning/5/5B78.html",
		descr    : "Hex/first hex byte substitution, single character link"
	},
	{
		f        : Links.getfrom,
		args     : [links, "chinese-characters.org", "神獸"],
		expected : "",
		descr    : "Word has more than one character: no link"
	},
	{
		f        : Links.getfrom,
		args     : [links, "zhongwen.com", "學", u2b],
		expected : "http://zhongwen.com/cgi-bin/zipux.cgi?=%BE%C7",
		descr    : "Link with existing Big5 substitution"
	},
	{
		f        : Links.getfrom,
		args     : [links, "zhongwen.com", "神", u2b],
		expected : "",
		descr    : "Cannot create Big5-only link if big5 entry is missing"
	},
	{
		f        : Links.getfrom,
		args     : [links, "en.wiktionary.org", "學"],
		expected : "https://en.wiktionary.org/wiki/學",
		descr    : "Word substitution"
	},

	/*
	 * Links.expand()
	 */
	{
		f        : Links.expand,
		args     : [links, [
			"chinese-characters.org",
			"zhongwen.com",
			"en.wiktionary.org",
			"zdic.net",
		]],
		expected : [
			"chinese-characters.org",
			"zhongwen.com",
			"en.wiktionary.org",
			"zdic.net",
		],
		descr    : "Nothing to expand"
	},
	{
		f        : Links.expand,
		args     : [links, [
			"chinese-characters.org",
			"zhongwen.com",
			"en.wiktionary.org",
			"zdic.net",
			"...",
		]],
		expected : [
			"chinese-characters.org",
			"zhongwen.com",
			"en.wiktionary.org",
			"zdic.net",
			"baidu.com",
			"chineseetymology.org",
			"chise.org",
			"ctext.org",
			"hanzicraft.com",
			"linguee.com",
			"mdbg.net (simpl.)",
			"mdbg.net (trad.)",
			"translate.google.com",
			"unicode.org",
			"zh.wiktionary.org",
		],
		descr    : "Expanding at the end"
	},
	{
		f        : Links.expand,
		args     : [links, [
			"...",
			"linguee.com",
			"baidu.com",
		]],
		expected : [
			"chinese-characters.org",
			"chineseetymology.org",
			"chise.org",
			"ctext.org",
			"en.wiktionary.org",
			"hanzicraft.com",
			"mdbg.net (simpl.)",
			"mdbg.net (trad.)",
			"translate.google.com",
			"unicode.org",
			"zdic.net",
			"zh.wiktionary.org",
			"zhongwen.com",
			"linguee.com",
			"baidu.com",
		],
		descr    : "Expanding in first position"
	},
	{
		f        : Links.expand,
		args     : [links, [
			"chinese-characters.org",
			"zhongwen.com",
			"en.wiktionary.org",
			"zdic.net",
			"...",
			"linguee.com",
			"baidu.com",
		]],
		expected : [
			"chinese-characters.org",
			"zhongwen.com",
			"en.wiktionary.org",
			"zdic.net",
			"chineseetymology.org",
			"chise.org",
			"ctext.org",
			"hanzicraft.com",
			"mdbg.net (simpl.)",
			"mdbg.net (trad.)",
			"translate.google.com",
			"unicode.org",
			"zh.wiktionary.org",
			"linguee.com",
			"baidu.com",
		],
		descr    : "Expanding at non-extreme position"
	},

	/*
	 * Links.get()
	 */
	{
		f        : Links.get,
		args     : ["en.wiktionary.org", "學"],
		expected : ["en.wiktionary.org", "https://en.wiktionary.org/wiki/學"],
		descr    : "Correct link creation"
	},
	{
		f        : Links.get,
		args     : ["en.wiktionary.org", "學", "audio"],
		expected : undefined,
		error    : "assert(): Links.getfrom(): unknown site en.wiktionary.org",
		descr    : "Not an audio site"
	},

	/*
	 * Links.mget()
	 */
	{
		f        : Links.mget,
		args     : [["en.wiktionary.org", "zdic.net"], "學", "links"],
		expected : [
			["en.wiktionary.org", "https://en.wiktionary.org/wiki/學"],
			["zdic.net",          "https://www.zdic.net/hans/學"],
		],
		descr    : "Multiple get, no expand"
	},
];

return { "tests" : tests };

})();let TestsMove = (function() {

/** @type{Movable} */
let m = Move.mk();

/** @type{(s : string, d : string) => void} */
function init(s, d) {
	Data.mktdicts({});
	m.init(Data.parseandtok(s));
}

/**
 * Effectively move m by altering its state.
 *
 * @type{Movable["move"]}
 */
function move(d, w) {
	let [jc, jw] = m.move(d, w);
	if (jc != -1) [m.ic, m.iw] = [jc, jw];
	return [jc, jw];
}

/**
 * Convenient shortcut to perform multiple consecutive
 * movements on m.
 *
 * @type{(xs : Array<[MoveDir, MoveWhat|number]>) => [number, number]}
 */
function manymove(xs) {
	let [jc, jw] = [-1, -1]
	for (var i = 0; i < xs.length; i++)
		[jc, jw] = move(xs[i][0], xs[i][1]);
	return [jc, jw];
}

let tests = [
	/*
	 * Movable.move()
	 */
	{
		f        : init,
		args     : ["Hello, world!", ""],
		expected : undefined,
		descr    : "Basic initialisation",
	},
	{
		f        : move,
		args     : [MoveDir.Prev, MoveWhat.Word],
		expected : [0, 0],
		descr    : "Can't move more backward.",
	},
	{
		f        : move,
		args     : [MoveDir.Next, MoveWhat.Word],
		expected : [0, 2],
		descr    : "One word forward; punct is skipped",
	},
	{
		f        : m.movep,
		args     : [MoveDir.Next, function() { return true; }, 0, 0],
		expected : [0, 1],
		descr    : "Simulating a move forward from the start (not using M.ic/iw)",
	},
	{
		f        : move,
		args     : [MoveDir.Next, MoveWhat.Word],
		expected : [0, 2],
		descr    : "Can't move beyond last punct",
	},
	{
		f        : move,
		args     : [MoveDir.Prev, MoveWhat.Word],
		expected : [0, 0],
		descr    : "Going back to the start",
	},
	{
		f        : init,
		args     : ["# Chapter title!\n\nHello, world!\n\nIn a third chunk", ""],
		expected : undefined,
		descr    : "Initialized with 3 chunks",
	},
	{
		f        : move,
		args     : [MoveDir.Next, MoveWhat.Chunk],
		expected : [1, 0],
		descr    : "At start of second chunk",
	},
	{
		f        : move,
		args     : [MoveDir.Next, MoveWhat.Chunk],
		expected : [2, 0],
		descr    : "At start of third chunk",
	},
	{
		f        : move,
		args     : [MoveDir.Prev, MoveWhat.Chunk],
		expected : [1, 2],
		descr    : "Going back at end of previous chunk; ending punct skipped",
	},
	{
		f        : move,
		args     : [MoveDir.Next, MoveWhat.Title],
		expected : [1, 2],
		descr    : "There's no following chapter",
	},
	{
		f        : move,
		args     : [MoveDir.Prev, MoveWhat.Title],
		expected : [0, 2],
		descr    : "But there's one before; ending punct skipped",
	},
	{
		f        : move,
		args     : [MoveDir.Offset, 0],
		expected : [0, 0],
		descr    : "Moving to said offset within current chunk",
	},
	{
		f        : move,
		args     : [MoveDir.Offset, 3],
		expected : [0, 0],
		descr    : "First word still covers the given offset",
	},
	{
		f        : move,
		args     : [MoveDir.Offset, 8],
		expected : [0, 2],
		descr    : "Offset in second word, which is a punct, thus moving forward",
	},
	{
		f        : move,
		args     : [MoveDir.Offset, 9001],
		expected : [0, 2],
		descr    : "Offset too large: move to chunk's last word",
	},
	{
		f        : manymove,
		args     : [[[MoveDir.Next, MoveWhat.Chunk], [MoveDir.Next, MoveWhat.Chunk]]],
		expected : [2, 0],
		descr    : "Moving two chunks ahead",
	},
	// used to crash.
	{
		f        : move,
		args     : [MoveDir.Offset, 17],
		expected : [2, 6],
		descr    : "Moving to offset at the end of last word of the last chunk",
	},

	/*
	 * NOTE: We could test deeper (e.g. section, subsection).
	 * Also, we're not directly testing piece movements as it's
	 * implemented over offset movement.
	 */
];

return { "tests" : tests };

})();let TestsTests = (function() {

let tests = [
	/*
	 * dcmp()
	 */
	{
		f        : Tests.dcmp,
		args     : [1, 1],
		expected : true,
		descr    : "Integers, equals",
	},
	{
		f        : Tests.dcmp,
		args     : [1, 2],
		expected : false,
		descr    : "Integers, not equals",
	},
	{
		f        : Tests.dcmp,
		args     : ["hello", "hello"],
		expected : true,
		descr    : "Strings, equals",
	},
	{
		f        : Tests.dcmp,
		args     : ["hello", "world"],
		expected : false,
		descr    : "Strings, not equals",
	},
	{
		f        : Tests.dcmp,
		args     : [[], []],
		expected : true,
		descr    : "Arrays, empty, equals",
	},
	{
		f        : Tests.dcmp,
		args     : [[1, 2], [1, 2]],
		expected : true,
		descr    : "Arrays, 1d, equals",
	},
	{
		f        : Tests.dcmp,
		args     : [[1, 2], [2, 2]],
		expected : false,
		descr    : "Arrays, 1d, not equals",
	},
	{
		f        : Tests.dcmp,
		args     : [[1, 2], [1, 2, 3]],
		expected : false,
		descr    : "Arrays, 1d, not equals (bis)",
	},
	{
		f        : Tests.dcmp,
		args     : [[1, 2, 3], [1, 2]],
		expected : false,
		descr    : "Arrays, 1d, not equals (ter)",
	},
	{
		f        : Tests.dcmp,
		args     : [{}, []],
		expected : false,
		descr    : "Empty hash is not an array",
	},
	{
		f        : Tests.dcmp,
		args     : [{}, {}],
		expected : true,
		descr    : "Hashes, empty, equals",
	},
	{
		f        : Tests.dcmp,
		args     : [{foo : 12}, {foo : 12}],
		expected : true,
		descr    : "Hashes, 1d, equals",
	},
	{
		f        : Tests.dcmp,
		args     : [{foo : 12}, {}],
		expected : false,
		descr    : "Hashes, 1d, not equals",
	},
	{
		f        : Tests.dcmp,
		args     : [{foo : 12}, {bar : 'baz'}],
		expected : false,
		descr    : "Hashes, 1d, not equals (bis)",
	},
	{
		f        : Tests.dcmp,
		args     : [{foo : 12}, {foo : 12, bar : 'baz'}],
		expected : false,
		descr    : "Hashes, 1d, not equals (ter)",
	},
	{
		f        : Tests.dcmp,
		args     : [{foo : [1, 2]}, {foo : [1, 3]}],
		expected : false,
		descr    : "Hashes, 2d, not equals",
	},
	{
		f        : Tests.dcmp,
		args     : [{foo : [1, 2]}, {foo : [1, 2]}],
		expected : true,
		descr    : "Hashes, 2d, equals",
	},
	{
		f        : Tests.dcmp,
		args     : [{foo : [1, 2, [3, 1]]}, {foo : [1, 2, [3, 1]]}],
		expected : true,
		descr    : "Deep object, equals",
	},
	{
		f        : Tests.dcmp,
		args     : [{foo : [1, 2, [3, 1]]}, {foo : [1, 2, [3, 1, {}]]}],
		expected : false,
		descr    : "Deep object, not equals",
	},
];

return { "tests" : tests };

})();
let TestsUser = (function() {

let tests = [
	{
		f        : User.getnames,
		args     : [{}],
		expected : ["Unicode-BIG5"],
		descr    : "Empty configuration: no names"
	},
	{
		f        : User.getnames,
		args     : [{ "tabs" : {}}],
		expected : ["Unicode-BIG5"],
		descr    : "Empty configuration: no names (bis)"
	},
	{
		f        : User.getnames,
		args     : [{ "tabs" : { confs : []}}],
		expected : ["Unicode-BIG5"],
		descr    : "Empty configuration: no names (ter)"
	},
	{
		f        : User.getnames,
		args     : [{ "tabs" : { confs : [
			[],
			[],
		]}}],
		expected : ["Unicode-BIG5"],
		descr    : "Empty configuration: no names (quater)"
	},
	{
		f        : User.getnames,
		args     : [{ "tabs" : { confs : [
			[],
			[],
		]}}],
		expected : ["Unicode-BIG5"],
		descr    : "Empty configuration: no names (quintus)"
	},
	{
		f        : User.getnames,
		args     : [{ "tabs" : { confs : [
			[
				{
					"name"   : "-",
					"type"   : TabType.Decomp,
					"decomp" : "-",
					"entry"  : "-",
				},
				{
					"name"   : "-",
					"type"   : TabType.Decomp,
					"decomp" : "-",
					"entry"  : "-",
				},
			],
			[],
		]}}],
		expected : ["Unicode-BIG5"],
		descr    : "Special case for decomposition decoy"
	},
	{
		f        : User.getnames,
		args     : [{ "tabs" : { confs : [
			[
				{
					"name"   : "-",
					"type"   : TabType.Decomp,
					"decomp" : "-",
					"entry"  : "-",
				},
			],
			[
				{
					"name"   : "-",
					"type"   : TabType.Dict,
					"dict"   : "-",
					"entry"  : "-",
				},
			],
		]}}],
		expected : ["-", "Unicode-BIG5"],
		descr    : "Decoy only for decomposition"
	},
	{
		f        : User.getnames,
		args     : [{ "tabs" : { confs : [
			[
				{
					"name"   : "-",
					"type"   : TabType.Decomp,
					"decomp" : "-",
					"entry"  : "-",
				},
				{
					"name"   : "wm",
					"type"   : TabType.Decomp,
					"decomp" : "wm",
					"entry"  : "-",
				},
				{
					"name"   : "ancient",
					"type"   : TabType.Decomp,
					"decomp" : "ancient",
					"entry"  : "-",
				},
			],
			[
				{
					"name"   : "cedict",
					"type"   : TabType.Dict,
					"dict"   : "cedict",
					"entry"  : "-",
				},
				{
					"name"   : "cedict-fr",
					"type"   : TabType.Dict,
					"dict"   : "cedict-fr",
					"entry"  : "-",
				},
			],
			[
				{
					"name"   : "shuowen",
					"type"   : TabType.NavDict,
					"dict"   : "shuowen",
					"entry"  : "-",
				},
			],
		]}}],
		expected : ["Unicode-BIG5", "ancient", "cedict", "cedict-fr", "shuowen", "wm"],
		descr    : "Two decomposition and some dicts/navdicts; various positions."
	},
	{
		f        : User.getnames,
		args     : [{ "tabs" : { confs : [
			[
				{
					"name"   : "-",
					"type"   : TabType.Decomp,
					"decomp" : "-",
					"entry"  : "-",
				},
				{
					"name"   : "wm",
					"type"   : TabType.Decomp,
					"decomp" : "wm",
					"entry"  : "-",
				},
				{
					"name"   : "ancient",
					"type"   : TabType.Decomp,
					"decomp" : "ancient",
					"entry"  : "-",
				},
			],
			[
				{
					"name"   : "cedict",
					"type"   : TabType.Dict,
					"dict"   : "cedict",
					"entry"  : "-",
				},
				{
					"name"   : "cedict",
					"type"   : TabType.Dict,
					"dict"   : "cedict",
					"entry"  : "-",
				},
				{
					"name"   : "cedict-fr",
					"type"   : TabType.Dict,
					"dict"   : "cedict-fr",
					"entry"  : "-",
				},
				{
					"name"   : "shuowen",
					"type"   : TabType.NavDict,
					"dict"   : "shuowen",
					"entry"  : "-",
				},
			],
			[
				{
					"name"   : "cedict",
					"type"   : TabType.Dict,
					"dict"   : "cedict",
					"entry"  : "-",
				},
				{
					"name"   : "shuowen",
					// Dict vs. NavDict does not matter; in practice
					// names are unique. We could display the shuowen
					// as a regular dict, and as a navdict.
					"type"   : TabType.Dict,
					"dict"   : "shuowen",
					"entry"  : "-",
				},
			],
		]}}],
		expected : ["Unicode-BIG5", "ancient", "cedict", "cedict-fr", "shuowen", "wm"],
		descr    : "Duplicates are removed."
	},
	{
		f        : User.getnames,
		args     : [{ "tabs" : { confs : [
			[
				{
					"name"   : "-",
					"type"   : TabType.Decomp,
					"decomp" : "-",
					"entry"  : "-",
				},
			],
			[
				{
					"name"   : "defs",
					"type"   : TabType.DictsChain,
					"dicts"   : ["CC-CEDICT", "ZM-add", "CC-CEDICT-singles"],
				}
			],
		]}}],
		expected : ["CC-CEDICT", "CC-CEDICT-singles", "Unicode-BIG5", "ZM-add"],
		descr    : "Dict patch chains are supported"
	},
	{
		f        : User.getnames,
		args     : [{ "tabs" : { confs : [
			[
				{
					"name"   : "-",
					"type"   : TabType.Decomp,
					"decomp" : "-",
					"entry"  : "-",
				},
			],
			[
				{
					"name"   : "defs",
					"type"   : TabType.DictsChain,
					"dicts"   : ["CC-CEDICT", "ZM-add", "CC-CEDICT-singles"],
				},
			],
			[
				{
					"name"   : "shuowen",
					"type"   : TabType.NavDict,
					"dict"   : "ZM-pict",
					"tabs"   : { "confs" : [
						[
							{
								"name"   : "defs",
								"type"   : TabType.DictsChain,
								"dicts"   : ["CC-CEDICT", "ZM-add", "CC-CEDICT-singles"],
							},
							{
								"name"   : "pict",
								"type"   : TabType.Dict,
								"dict"   : "ZM-pict",
							},
						],
					]},
				},
			],
			[{
				"name"   : "imgs",
				"type"   : TabType.Imgs,
				"single" : true, // stop loading image once one succeeded.
				"imgs"   : [ "wm-bw-gif", "wm-red-static", "wm-bw-static" ],
			}],
			[{
				"name"   : "links",
				"type"   : TabType.Links,
				"links"  : [
					"chinese-characters.org",
					"zhongwen.com",
					"en.wiktionary.org",
					"zdic.net",
					"...",
				],
			}],
		]}}],
		expected : ["CC-CEDICT", "CC-CEDICT-singles", "Unicode-BIG5", "ZM-add", "ZM-pict"],
		descr    : "NavDict goes recursive; imgs/links ignored"
	},
];

return { "tests" : tests };

})();
let TestsUtils = (function() {

let tests = [
	/*
	 * Utils.haschinese()
	 */
	{
		f        : Utils.haschinese,
		args     : [""],
		expected : false,
		descr    : "Empty string",
	},
	{
		f        : Utils.haschinese,
		args     : ["hello, world!"],
		expected : false,
		descr    : "English-only sentence",
	},
	{
		f        : Utils.haschinese,
		args     : ["好心西"],
		expected : true,
		descr    : "Chinese-only sentence",
	},
	{
		f        : Utils.haschinese,
		args     : ["好心: good heart"],
		expected : true,
		descr    : "Chinese+English sentence",
	},
	{
		f        : Utils.haschinese,
		args     : ["𤴓: bug in your computer"],
		expected : true,
		descr    : "'Long' character",
	},

	/*
	 * Utils.orderedinsert()
	 */
	{
		f        : Utils.orderedinsert,
		args     : [[], 0],
		expected : [0],
		descr    : "Inserting in empty array",
	},
	{
		f        : Utils.orderedinsert,
		args     : [[0], 0],
		expected : [0, 0],
		descr    : "Inserting in a one-element array",
	},
	{
		f        : Utils.orderedinsert,
		args     : [[0], 1],
		expected : [0, 1],
		descr    : "Inserting in a one-element array (bis)",
	},
	{
		f        : Utils.orderedinsert,
		args     : [[1], 0],
		expected : [0, 1],
		descr    : "Inserting in a one-element array (ter)",
	},
	{
		f        : Utils.orderedinsert,
		args     : [[1, 2, 3], 0],
		expected : [0, 1, 2, 3],
		descr    : "Inserting at the beginning on a 'long' array",
	},
	{
		f        : Utils.orderedinsert,
		args     : [[1, 2, 4, 5], 3],
		expected : [1, 2, 3, 4, 5],
		descr    : "Inserting within a 'long' array",
	},
	{
		f        : Utils.orderedinsert,
		args     : [[1, 2, 4, 5], 10],
		expected : [1, 2, 4, 5, 10],
		descr    : "Inserting at the end of a 'long' array",
	},
	/*
	 * Utils.addaccent()
	 */
	{
		f        : Utils.addaccent,
		args     : ["e", 1],
		expected : "ē",
		descr    : "Basic test",
	},
	{
		f        : Utils.addaccent,
		args     : ["p", -1],
		expected : "p",
		descr    : "Tolerance test",
	},
	{
		f        : Utils.addaccent,
		args     : ["p", 6],
		expected : "p",
		descr    : "Tolerance test (bis)",
	},
	/*
	 * Utils.pinyinn2a()
	 */
	{
		f        : Utils.pinyinn2a,
		args     : ["yin1"],
		expected : "yi\u0304n",
		descr    : "Basic test",
	},
	{
		f        : Utils.pinyinn2a,
		args     : ["yi2"],
		expected : "yi\u0301",
		descr    : "Voyel on last position",
	},
	{
		f        : Utils.pinyinn2a,
		args     : ["a3"],
		expected : "a\u030C",
		descr    : "Voyel on first position",
	},
	{
		f        : Utils.pinyinn2a,
		args     : ["hao3"],
		expected : "ha\u030Co",
		descr    : "Double voyel, non-i",
	},
	{
		f        : Utils.pinyinn2a,
		args     : ["qiang4"],
		expected : "qia\u0300ng",
		descr    : "Double voyel, i",
	},
	/*
	 * Utils.pinyinsn2a()
	 */
	{
		f        : Utils.pinyinsn2a,
		args     : ["zhi4 bing4"],
		expected : "zhì bìng",
		descr    : "Basic test",
	},

	/*
	 * Utils.putin()
	 */
	{
		f        : Utils.putin,
		args     : [0, 1, 2],
		expected : 1,
		descr    : "Inferior",
	},
	{
		f        : Utils.putin,
		args     : [3, 1, 2],
		expected : 2,
		descr    : "Superior",
	},
	{
		f        : Utils.putin,
		args     : [2, 1, 3],
		expected : 2,
		descr    : "Already good",
	},

	/*
	 * Utils.deepget()
	 */
	{
		f        : Utils.deepget,
		args     : [{}, ""],
		expected : null,
		descr    : "Empty path, empty object",
	},
	{
		f        : Utils.deepget,
		args     : [{a : "foo"}, ""],
		expected : null,
		descr    : "Empty path, non-empty object",
	},
	{
		f        : Utils.deepget,
		args     : [{}, "a"],
		expected : null,
		descr    : "Non-empty path, empty object",
	},
	{
		f        : Utils.deepget,
		args     : [{a : "foo"}, "a"],
		expected : "foo",
		descr    : "Single-depth existing string entry",
	},
	{
		f        : Utils.deepget,
		args     : [{a : 0}, "a"],
		expected : 0,
		descr    : "Single-depth existing zero entry",
	},
	{
		f        : Utils.deepget,
		args     : [{a : { b : "bar" }}, "a"],
		expected : { b : "bar" },
		descr    : "Single-depth existing object entry",
	},
	{
		f        : Utils.deepget,
		args     : [{a : { b : "bar" }}, "a.b"],
		expected : "bar",
		descr    : "Double-depth existing string entry",
	},
	{
		f        : Utils.deepget,
		args     : [{a : { b : "bar" }}, "a.c"],
		expected : null,
		descr    : "Double-depth non-existing entry",
	},
	/*
	 * Utils.deepset()
	 */
	{
		f        : Utils.deepset,
		args     : [{}, "", 42],
		expected : {},
		descr    : "Empty path, empty object",
	},
	{
		f        : Utils.deepset,
		args     : [{}, "a", 42],
		expected : { a : 42},
		descr    : "Non-empty path, inexisting entry",
	},
	{
		f        : Utils.deepset,
		args     : [{}, "a.b", 42],
		expected : { a : { b : 42 } },
		descr    : "Non-empty path, inexisting entry, with depth",
	},
	{
		f        : Utils.deepset,
		args     : [{ a : { b : 42 } }, "a", 42],
		expected : { a : 42 },
		descr    : "Non-empty path, existing entry",
	},

	/*
	 * Utils.htmlhex()
	 */
	{
		f        : Utils.htmlhex,
		args     : [""],
		expected : "",
		descr    : "Empty string",
	},
	{
		f        : Utils.htmlhex,
		args     : ["BE"],
		expected : "",
		descr    : "0x prefix is missing: garbage",
	},
	{
		f        : Utils.htmlhex,
		args     : ["0xBE"],
		expected : "%BE",
		descr    : "Single byte stiring with 0x prefix",
	},
	{
		f        : Utils.htmlhex,
		args     : ["0xBEC7"],
		expected : "%BE%C7",
		descr    : "Two-bytes string with 0x prefix",
	},

	/*
	 * Utils.splitlines()
	 */
	{
		f        : Utils.splitlines,
		args     : [""],
		expected : [],
		descr    : "Empty string input",
	},
	{
		f        : Utils.splitlines,
		args     : ["\n"],
		expected : [],
		descr    : "Single (trailing) empty line",
	},
	{
		f        : Utils.splitlines,
		args     : ["\r\n"],
		expected : [],
		descr    : "Single (trailing) empty line (bis)",
	},
	{
		f        : Utils.splitlines,
		args     : ["hello world\nfoo bar"],
		expected : ["hello world", "foo bar"],
		descr    : "Two lines",
	},
	{
		f        : Utils.splitlines,
		args     : ["hello world\r\nfoo bar"],
		expected : ["hello world", "foo bar"],
		descr    : "Two lines (bis)",
	},
	{
		f        : Utils.splitlines,
		args     : ["hello world\r\nfoo bar\n"],
		expected : ["hello world", "foo bar"],
		descr    : "Two lines + trailing; different EOL format",
	},
];

return { "tests" : tests };

})();
let TestsDict = (function() {

let tests = [
	/*
	 * Dict.chainrm()
	 */
	{
		f        : Dict.chainrm,
		args     : [[], []],
		expected : [[], []],
		descr    : "Empty inputs: empty output"
	},
	{
		f        : Dict.chainrm,
		args     : [["foo", "bar"], []],
		expected : [["foo", "bar"], []],
		descr    : "Nothing to remove, nothing removed",
	},
	{
		f        : Dict.chainrm,
		args     : [["foo", "bar", "baz"], ["foo", "baz"]],
		expected : [["bar"], []],
		descr    : "All entries are known and properly removed",
	},
	{
		f        : Dict.chainrm,
		args     : [["foo", "bar", "baz"], ["fooo", "foo", "bazz"]],
		expected : [["bar", "baz"], ["fooo", "bazz"]],
		descr    : "Unknown entries set aside",
	},
	// For completeness' sake
	{
		f        : Dict.chainrm,
		args     : [["foo", "bar", "baz"], ["foo", "foo"]],
		expected : [["bar", "baz"], ["foo"]],
		descr    : "double removed entries signaled",
	},
	/*
	 * Dict.chainsound()
	 */
	{
		f        : Dict.chainsound,
		args     : [[]],
		expected : [{ds:[]}, []],
		descr    : "No input defs: no output defs"
	},
	{
		f        : Dict.chainsound,
		args     : [[
			{ds : ["foo", "bar"], },
		]],
		expected : [{ds:["foo", "bar"]}, []],
		descr    : "Adding defs from one dict"
	},
	{
		f        : Dict.chainsound,
		args     : [[
			{ds : ["foo", "bar"], },
			{ds : ["foo", "bar"], },
		]],
		expected : [{ds:["foo", "bar", "foo", "bar"]}, []],
		descr    : "Adding defs from two dicts; no duplicate management on add"
	},
	{
		f        : Dict.chainsound,
		args     : [[
			{ ds : ["foo", "bar"], },
			{ ds : ["foo", "bar"], rm : true },
			{ ds : ["foo", "baz"], },
		]],
		expected : [{ds:["foo", "baz"], tw:true}, []],
		descr    : "Patching one definition"
	},
	{
		f        : Dict.chainsound,
		args     : [[
			{ ds : ["foo", "bar"], },
			{ ds : ["foo", "bar", "baz"], rm : true },
			{ ds : ["foo", "baz"], },
		]],
		expected : [{ds:["foo", "baz"], tw:true}, ["baz"]],
		descr    : "Patching one definition + one missing entries"
	},

	/*
	 * Dict.chain()
	 */
	{
		f        : Dict.chain,
		args     : [{}, []],
		expected : [{}, []],
		descr    : "Empty inputs: empty output"
	},
	{
		f        : Dict.chain,
		args     : [{
			"cedict" : {
				"shang4" : [
					{
						ds : ["still", "yet", "to value", "to esteem"],
					},
					{
						rm : true,
						ds : ["still", "yet", "to value", "to esteem"],
					},
					{
						ds : ["still", "yet", "to value", "to esteem", "even", "fairly"],
					},
				],
			},
		}, ["cedict"]],
		expected : [{
			"shang4" : [{
				tw : true,
				ds : ["still", "yet", "to value", "to esteem", "even", "fairly"],
			}]
		}, []],
		descr    : "Melting single dict patch chain"
	},
	{
		f        : Dict.chain,
		args     : [{
			"cedict" : {
				"shang4" : [
					{
						ds : ["still", "yet", "to value", "to esteem"],
					},
				],
			},
			"zm-add" : {
				"shang4" : [
					{
						rm : true,
						ds : ["still", "yet", "to value", "to esteem"],
					},
					{
						ds : ["still", "yet", "to value", "to esteem", "even", "fairly"],
					},
				],
			},
		}, ["cedict", "zm-add"]],
		expected : [{
			"shang4" : [{
				tw : true,
				ds : ["still", "yet", "to value", "to esteem", "even", "fairly"],
			}]
		}, []],
		descr    : "Same patch chain in two dicts"
	},
];

return { "tests" : tests };

})();
let TestsBig5 = (function() {

/** @type{Array.<Test>} */
let tests = [
];

return { "tests" : tests };

})();
let TestsMarkdown = (function() {

let tests = [
	{
		f        : Markdown.parse,
		args     : [""],
		expected : [[], undefined],
		descr    : "empty string",
	},
	{
		f        : Markdown.parse,
		args     : ["吾"],
		expected : [[
			{ "t" : ChunkType.Paragraph, "v" : "吾" }
		], undefined],
		descr    : "single undefined word",
	},
	{
		f        : Markdown.parse,
		args     : [""
			+"# xxx yyyy\n"
			+"\n"
			+"\n"
			+"## x, y\n"
			+"x y z\n"
			+"x\n"
			+"\n"
			+"xx\n"
			+"## x y z\n"
			+"x\n",
		],
		expected : [[
			{"t" : ChunkType.Title,     "v" : "xxx yyyy" },
			{"t" : ChunkType.Section,   "v" : "x, y"     },
			{"t" : ChunkType.Paragraph, "v" : "x y z\nx" },
			{"t" : ChunkType.Paragraph, "v" : "xx"       },
			{"t" : ChunkType.Section,   "v" : "x y z"    },
			{"t" : ChunkType.Paragraph, "v" : "x"        },
		], undefined],
		descr    : "many sections, paragraphs",
	},
	{
		f        : Markdown.parse,
		args     : ["吾寧悃悃款款,朴以忠乎？"],
		expected : [[
			{ "t" : ChunkType.Paragraph, "v" : "吾寧悃悃款款,朴以忠乎？" },
		], undefined],
		descr    : "full sentence",
	},
	/*
	 * Markdown.gettoc()
	 */
	{
		f        : Markdown.gettoc,
		args     : [Markdown.parse(""
			+"# xxx yyyy\n"
			+"\n"
			+"\n"
			+"## x, y\n"
			+"x y z\n"
			+"x\n"
			+"\n"
			+"xx\n"
			+"## x y z\n"
			+"x\n",
		)[0]],
		expected : [
			{ t : ChunkType.Title, v : "xxx yyyy", ic : 0, cs : [
					{ t : ChunkType.Section, v : "x, y",  ic : 1, cs : [] },
					{ t : ChunkType.Section, v : "x y z", ic : 4, cs : [] },
				]
			},
		],
		descr    : "ToC correctly retrieved",
	},
	{
		f        : Markdown.gettoc,
		args     : [Markdown.parse(""
			+"# xxx yyyy\n"
			+"\n"
			+"\n"
			+"## x, y\n"
			+"x y z\n"
			+"x\n"
			+"\n"
			+"xx\n"
			+"## x y z\n"
			+"### subsection\n"
			+"x\n"
			+"### subsection2\n"
			+"x\n"
			+"## x y\n"
		)[0]],
		expected : [
			{ t : ChunkType.Title, v : "xxx yyyy", ic : 0, cs : [
					{ t : ChunkType.Section, v : "x, y",  ic : 1, cs : [] },
					{ t : ChunkType.Section, v : "x y z", ic : 4, cs : [
						{ t : ChunkType.Subsection, v : "subsection",  ic : 5, cs : [] },
						{ t : ChunkType.Subsection, v : "subsection2", ic : 7, cs : [] },
					] },
					{ t : ChunkType.Section, v : "x y",  ic : 9, cs : [] },
				]
			},
		],
		descr    : "ToC with subsections",
	},
];

return { "tests" : tests };

})();
let TestsWikiSource = (function() {

/** @type{Tests} */
let tests = [
	/*
	 * parse()
	 *
	 * We're being exhaustive/defensive.
	 */
	{
		f        : WikiSource.parse,
		args     : [""],
		expected : [[], [1, "First line is expected to be non-empty title"]],
		descr    : "Empty file is an error",
	},
	{
		f        : WikiSource.parse,
		args     : ["說文解字"],
		expected : [[], [2, "EOF reached while looking for export date"]],
		descr    : "No export date",
	},
	{
		f        : WikiSource.parse,
		args     : ["說文解字\n\n"],
		expected : [[], [4, "EOF reached while looking for export date"]],
		descr    : "No export date (bis)",
	},
	{
		f        : WikiSource.parse,
		args     : ["說文解字\n"+"\n"+"于2021年10月1日从维基文库导出\n"],
		expected : [[], [5, "EOF reached while looking for ToC starting mark (-{)"]],
		descr    : "Export date OK/no ToC starting mark",
	},
	{
		f        : WikiSource.parse,
		args     : ["說文解字\n"+"\n"+"于2021年10月1日从维基文库导出\n-("],
		expected : [[], [4, "Invalid ToC starting mark (have '-(')"]],
		descr    : "Invalid ToC starting mark",
	},
/*
	{
		f        : WikiSource.parse,
		args     : ["說文解字\n"+"\n"+"于2021年10月1日从维基文库导出\n-{"],
		expected : [[], [5, "ToC starting mark should be followed by empty line"]],
		descr    : "Toc starting mark OK, not followed by empty line",
	},
*/
	{
		f        : WikiSource.parse,
		args     : ["說文解字\n"+"\n"+"于2021年10月1日从维基文库导出\n-{\n\n"],
		expected : [[], [7, "EOF reached while looking for ToC content"]],
		descr    : "Empty line after -{; no ToC entry follows",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"+"\n"+"于2021年10月1日从维基文库导出\n-{\n\n"+
			"卷一(一丄示三王玉玨气士丨屮艸蓐茻)"
		],
		expected : [[], [6, "ToC entry has no space '卷一(一丄示三王玉玨气士丨屮艸蓐茻)'"]],
		descr    : "Incorrect ToC entry format",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"+"\n"+"于2021年10月1日从维基文库导出\n-{\n\n"+
			"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)"
		],
		expected : [[], [7, "EOF reached while looking for ToC content"]],
		descr    : "Correct ToC entry format; end marker never reached",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"+
			"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
		],
		expected : [[], [9, "EOF reached while looking for ToC content"]],
		descr    : "Two ToC entries; still no end marker",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"+
			"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			+"\n"+
			"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
			+"}-\n"
		],
		expected : [[], [11, "EOF reached while looking for license line"]],
		descr    : "ToC; variable number of empty lines between entries; no license line",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"
			+"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			+"\n"
			+"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
			+"}-\n"
			+"\n"
			+"延伸閱讀"
			+"\n"
			+"在線閱覽：影印本 《四部叢刊初編》本《說文解字》"
			+"\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
		],
		expected : [[], [14, "EOF reached while looking for text body"]],
		descr    : "License found; nothing after",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"
			+"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			+"\n"
			+"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
			+"}-\n"
			+"\n"
			+"延伸閱讀"
			+"\n"
			+"在線閱覽：影印本 《四部叢刊初編》本《說文解字》"
			+"\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
		],
		expected : [[
			{
				t : ChunkType.Title,
				v : "說文解字",
			},
		], undefined],
		descr    : "End license found; done.",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"
			+"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			+"\n"
			+"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
			+"}-\n"
			+"\n"
			+"延伸閱讀"
			+"\n"
			+"在線閱覽：影印本 《四部叢刊初編》本《說文解字》"
			+"\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。\n"
			+"序 ◄ 說文解字e\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
		],
		expected : [[], [14, "Title '說文解字' missing from ◄"]],
		descr    : "Bad ◄ format",
	},
/* TODO
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"
			+"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			+"\n"
			+"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
			+"}-\n"
			+"\n"
			+"延伸閱讀"
			+"\n"
			+"在線閱覽：影印本 《四部叢刊初編》本《說文解字》"
			+"\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。\n"
			+"序 說文解字e\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
		],
		expected : [[], [14, "Title '說文解字' missing from ◄"]],
		descr    : "Bad ◄ format (bis)",
	},
*/
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"
			+"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			+"\n"
			+"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
			+"}-\n"
			+"\n"
			+"延伸閱讀"
			+"\n"
			+"在線閱覽：影印本 《四部叢刊初編》本《說文解字》"
			+"\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。\n"
			+"序 ◄ 說文解字\n"
			+"\n"
			+"nope\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
		],
		expected : [[], [16, "Expecting a ►: 'nope 本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。'"]],
		descr    : "Bad ► format",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"
			+"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			+"\n"
			+"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
			+"}-\n"
			+"\n"
			+"延伸閱讀"
			+"\n"
			+"在線閱覽：影印本 《四部叢刊初編》本《說文解字》"
			+"\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。\n"
			+"序 ◄ 說文解字\n"
			+"\n"
			+"卷一 ► 卷二\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
		],
		expected : [[
			{
				t : ChunkType.Title,
				v : "說文解字",
			},
			{
				t : ChunkType.Section,
				v : "卷一 (一丄示三王玉玨气士丨屮艸蓐茻)",
			},
		], undefined],
		descr    : "Correct section",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"
			+"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			+"\n"
			+"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
			+"}-\n"
			+"\n"
			+"延伸閱讀"
			+"\n"
			+"在線閱覽：影印本 《四部叢刊初編》本《說文解字》"
			+"\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。\n"
			+"序 ◄ 說文解字\n"
			+"\n"
			+"卷一 ► 卷二\n"
			+"\n"
			+"姊妹计划: 数据项\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
		],
		expected : [[
			{
				t : ChunkType.Title,
				v : "說文解字",
			},
			{
				t : ChunkType.Section,
				v : "卷一 (一丄示三王玉玨气士丨屮艸蓐茻)",
			},
		], undefined],
		descr    : "Correct section, noise line ignored",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"
			+"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			+"\n"
			+"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
			+"}-\n"
			+"\n"
			+"延伸閱讀"
			+"\n"
			+"在線閱覽：影印本 《四部叢刊初編》本《說文解字》"
			+"\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。\n"
			+"序 ◄ 說文解字\n"
			+"\n"
			+"卷一 ► 卷二\n"
			+"\n"
			+"姊妹计划: 数据项\n"
			+"\n"
			+"hello, \n"
			+"world!\n"
			+"\n"
			+"second paragraph.\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
		],
		expected : [[
			{
				t : ChunkType.Title,
				v : "說文解字",
			},
			{
				t : ChunkType.Section,
				v : "卷一 (一丄示三王玉玨气士丨屮艸蓐茻)",
			},
			{
				t : ChunkType.Paragraph,
				v : "hello, \nworld!",
			},
			{
				t : ChunkType.Paragraph,
				v : "second paragraph.",
			},
		], undefined],
		descr    : "Section with no subsection; two paragraphs.",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"
			+"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			+"\n"
			+"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
			+"}-\n"
			+"\n"
			+"延伸閱讀"
			+"\n"
			+"在線閱覽：影印本 《四部叢刊初編》本《說文解字》"
			+"\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。\n"
			+"序 ◄ 說文解字\n"
			+"\n"
			+"卷一 ► 卷二\n"
			+"\n"
			+"姊妹计划: 数据项\n"
			+"\n"
			+"hello, \n"
			+"world!\n"
			+"\n"
			+"second paragraph.\n"
			+"\n"
			+"\n"
			+"\n"
			+"\n"
			+"\n"
			+"一部\n"
			+"\n"
			+"\n"
			+"一（）：惟初太始，道立於一，造分天地，化成萬物。凡一之屬皆从一。\n"
			+"\n"
			+"元（）：始也。从一从兀。\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
		],
		expected : [[
			{
				t : ChunkType.Title,
				v : "說文解字",
			},
			{
				t : ChunkType.Section,
				v : "卷一 (一丄示三王玉玨气士丨屮艸蓐茻)",
			},
			{
				t : ChunkType.Paragraph,
				v : "hello, \nworld!",
			},
			{
				t : ChunkType.Paragraph,
				v : "second paragraph.",
			},
			{
				t : ChunkType.Subsection,
				v : "一部",
			},
			{
				t : ChunkType.Paragraph,
				v : "一（）：惟初太始，道立於一，造分天地，化成萬物。凡一之屬皆从一。",
			},
			{
				t : ChunkType.Paragraph,
				v : "元（）：始也。从一从兀。",
			},
		], undefined],
		descr    : "Adding a section with subsection and some more paragraphs",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"
			+"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			+"\n"
			+"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
			+"\n"
			+"卷十五 說文解字敘（序）\n"
			+"}-\n"
			+"\n"
			+"延伸閱讀"
			+"\n"
			+"在線閱覽：影印本 《四部叢刊初編》本《說文解字》"
			+"\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。\n"
			+"\n"
			+"　卷十四 ◄ 說文解字\n"
			+"\n"
			+"卷十五\n"
			+"\n"
			+"說文解字敘\n"
			+"\n"
			+"漢太尉祭酒許鎮記 ►\n"
			+"\n"
			+"元（）：始也。从一从兀。\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
		],
		expected : [[
			{
				t : ChunkType.Title,
				v : "說文解字",
			},
			{
				t : ChunkType.Section,
				v : "卷十五 說文解字敘（序）",
			},
			{
				t : ChunkType.Paragraph,
				v : "元（）：始也。从一从兀。",
			},
		], undefined],
		descr    : "Special case around arrow detection for last Shuowen entry",
	},
	{
		f        : WikiSource.parse,
		args     : [
			"說文解字\n"
			+"\n"
			+"\n"
			+"于2021年10月1日从维基文库导出\n"
			+"-{\n"
			+"\n"
			+"卷一 (一丄示三王玉玨气士丨屮艸蓐茻)\n"+
			+"\n"
			+"卷二 (小八釆半牛犛告口凵吅哭走止癶步此正是辵彳廴㢟行齒牙足疋品龠冊)\n"
			+"\n"
			+"卷三 (㗊舌干𧮫只㕯句丩古十卅言誩音䇂丵菐𠬞𠬜共異舁𦥑䢅爨革鬲䰜爪丮鬥又𠂇史支𦘒聿畫隶臤臣殳殺𠘧寸皮㼱攴教卜用爻㸚)\n"
			+"\n"
			+"卷十五 說文解字敘（序）\n"
			+"}-\n"
			+"\n"
			+"延伸閱讀"
			+"\n"
			+"在線閱覽：影印本 《四部叢刊初編》本《說文解字》"
			+"\n"
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。\n"
			+"\n"
			+"　卷十四 ◄ 說文解字\n"
			+"\n"
			+"卷十五\n"
			+"\n"
			+"說文解字敘\n"
			+"\n"
			+"漢太尉祭酒許鎮記 ►\n"
			+"\n"
			+"元（）：始也。从一从兀。\n"
			+`
　卷二 ◄ 說文解字

卷三 ► 卷四





㗊部


㗊：眾口也。从四口。凡㗊之屬皆从㗊。讀若戢。又讀若呶。
`
			+"本東漢作品在全世界都属于公有领域，因为作者逝世已经遠遠超过100年。"
		],
		expected : [[
			{
				t : ChunkType.Title,
				v : "說文解字",
			},
			{
				t : ChunkType.Section,
				v : "卷十五 說文解字敘（序）",
			},
			{
				t : ChunkType.Paragraph,
				v : "元（）：始也。从一从兀。",
			},
			{
				t : ChunkType.Section,
				v : "卷三 (㗊舌干𧮫只㕯句丩古十卅言誩音䇂丵菐𠬞𠬜共異舁𦥑䢅爨革鬲䰜爪丮鬥又𠂇史支𦘒聿畫隶臤臣殳殺𠘧寸皮㼱攴教卜用爻㸚)",
			},
			{
				t : ChunkType.Subsection,
				v : "㗊部",
			},
			{
				t : ChunkType.Paragraph,
				v : "㗊：眾口也。从四口。凡㗊之屬皆从㗊。讀若戢。又讀若呶。",
			},
		], undefined],
		descr    : "Special case around arrow detection for last Shuowen entry",
	},
];

return { "tests" : tests };

})();
let TestsChise = (function() {

let tests = [
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], ";; comments are ignored"],
		expected : [{}, undefined],
		descr    : "Comments: ignored"
	},
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], "U+4E00", 3],
		expected : [{}, [3, "Unexpected number of fields: <1"]],
		descr    : "Not enough fields"
	},
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], "U+4E00	一", 3],
		expected : [{}, [3, "Unexpected number of fields: <2"]],
		descr    : "Not enough fields (bis)"
	},
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], "U+4E00 一 一", 3],
		expected : [{}, [3, "Unexpected number of fields: <1"]],
		descr    : "Not enough fields (ter, tab separated only)"
	},
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], "U+4E00	一	一"],
		expected : [{}, undefined],
		descr    : "Character decomposes to itself:. ignored"
	},
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], "U+4E0E	与	⿹&CDP-8BBF;一"],
		expected : [{}, undefined],
		descr    : "Unmanaged non-utf8 font codepoints"
	},
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], "U+4EA5	亥	⿳亠&GT-00154;人"],
		expected : [{}, undefined],
		descr    : "Unmanaged non-utf8 font codepoints (bis)"
	},
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], "U+507C	偼	⿰亻&U-i001+758C;"],
		expected : [{}, undefined],
		descr    : "Unmanaged non-utf8 font codepoints (ter)"
	},
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], "U+4E9A	亚		@apparent=⿱一业"],
		expected : [{}, undefined],
		descr    : "Unmanaged @apparent entries"
	},
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], "U+4EB0	亰	⿱𣅀小	@apparent=⿱亠𣌢"],
		expected : [{}, undefined],
		descr    : "Unmanaged @apparent entries/>3 number of fields"
	},
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], "U+4E22	丢	⿱丿去"],
		expected : [{
			"丢" : [{
				t  : DecompType.Unknown,
				c  : ["丿", "去"],
			}],
		}, undefined],
		descr    : "Basic two components decomposition"
	},
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], "U+4E3D	丽	⿱一⿰⿵冂丶⿵冂丶"],
		expected : [{
			"丽" : [{
				t  : DecompType.Unknown,
				c  : ["冂", "丶"],
			}],
		}, undefined],
		descr    : "Repeated characters, intermixing with structure description char"
	},
	{
		f        : Chise.parseline,
		args     : [[{}, undefined], "U-0002F822	&MJ007573;	⿰⿳宀&MJ006350;口刂"],
		expected : [{}, undefined],
		descr    : "Unmanaged non-utf8 character decomposition"
	},
];

return { "tests" : tests };

})();
let TestsWMDecomp = (function() {
/*
 * NOTE: it's likely there's a bit of redundancy here.
 */

// shortcut
let m = WMDecomp.DecompTypeMap;

let tests = [
	/*
	 * WMDecomp.parseline()
	 */
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "丁	2	吕	一	1		亅	1		MN	一"],
		expected : [{
			"丁" : [{
				t  : m['吕'],
				c  : ["一", "亅"],
				ok : true,
			}],
		}, undefined],
		descr    : "Decomposing to two characters"
	},
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "一	1	一	一	1		*	0		M	*"],
		expected : [{}, undefined],
		descr    : "Decomposing to itself"
	},
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "哥	10	吕	可	5		*	5		MRNR	口"],
		expected : [{
			"哥" :  [{
				t  : m['吕'],
				c  : ["可"],
				ok : true,
			}],
		}, undefined],
		descr    : "Decomposing to one character"
	},
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "展	10	吕	尸	3			7	?	STV	尸"],
		expected : [{
			"展" : [{
				t  : m['吕'],
				c  : ["尸"],
				ok : false,
			}],
		}, undefined],
		descr    : "Decomposing to one character, buggy/unsure entries"
	},
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "発	9	吕	癶	5		井?	4	?	NOMKP	癶"],
		expected : [{
			"発" : [{
				t  : m['吕'],
				c  : ["癶", "井"],
				ok : false,
			}],
		}, undefined],
		descr    : "Decomposing to two characters, unsafe entry",
	},
	{
		f        : WMDecomp.parseline,
		// ~fake data, original is
		// 発	9	吕	癶	5		井?	4	?	NOMKP	癶
		args     : [[{}, undefined], "発	9	吕	癶?	5		井?	4	?	NOMKP	癶"],
		expected : [{
			"発" : [{
				t  : m['吕'],
				c  : ["癶", "井"],
				ok : false,
			}],
		}, undefined],
		descr    : "Decomposing to two characters, unsafe entry (bis)",
	},
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "蕻	16	吕	艹	3		7?共	13	?	TSIC	艸"],
		expected : [{
			"蕻" :[{
				t  : m['吕'],
				c  : ["艹", "共"],
				ok : false,
			}],
		}, undefined],
		descr    : "Decomposing to two characters, unsafe entry (ter)",
	},
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "蕻	16	吕	艹	3		7?共	13		TSIC	艸"],
		expected : [{
			"蕻" :[{
				t  : m['吕'],
				c  : ["艹", "共"],
				// marked as false because of ? in decomposition despite
				// being marked as OK
				ok : false,
			}],
		}, undefined],
		descr    : "Decomposing to two characters, unsafe entry (quater)",
	},
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "皐	11	吕	白	5		夲*	6	?	HAEJ	白"],
		expected : [{
			"皐" : [{
				t : m['吕'],
				c : ["白", "夲"],
				ok : false,
			}],
		}, undefined],
		descr    : "Decomposing to two characters, extra '*'",
	},
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "發	12	吕	癶	5		弓殳	7	?	NONHE	癶"],
		expected : [{
			"發" : [{
				t  : m['吕'],
				c  : ["癶", "弓", "殳"],
				ok : false,
			}]
		}, undefined],
		descr    : "Decomposing to more than two characters",
	},
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "畗	10	吕	亠口	5	?	田	5		YRW	田"],
		expected : [{
			"畗" : [{
				t  : m['吕'],
				c  : ["亠", "口", "田"],
				ok : false,
			}],
		}, undefined],
		descr    : "Decomposing to more than two characters (bis)",
	},
	{
		// See https://stackoverflow.com/a/32961117
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "有	6	吕	𠂇	6		月	0		KB	月"],
		expected : [{
			"有" : [{
				t : m['吕'],
				c : ["𠂇", "月"],
				ok : true,
			}],
		}, undefined],
		descr    : "This bugs with a .split(\"\"), but not with spread op",
	},
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "是	9	吕	日	4		𤴓	5		AMYO	日"],
		expected : [{
			"是" : [{
				t  : m['吕'],
				c  : ["日", "𤴓"],
				ok : true,
			}],
		}, undefined],
		descr    : "mkay",
	},
	// This used to be tolerated because we were parsing overall
	// files through a .split("\n"), which generated a trailing
	// empty line.
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "", 3],
		expected : [{}, [3, "Unexpected number of fields: 1"]],
		descr    : "Empty line is now an error",
	},
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "是	9	waza	日	4		𤴓	5		AMYO	日", 3],
		expected : [{}, [3, "Unknown decomposition type: waza"]],
		descr    : "Unknown decomposition type",
	},
	{
		f        : WMDecomp.parseline,
		args     : [[{}, undefined], "是	9	吕	吕	日	4		𤴓	5		AMYO	日", 3],
		expected : [{}, [3, "Unexpected number of fields: 12"]],
		descr    : "Incorrect number of fields",
	},
	{
		f        : WMDecomp.parseline,
		args     : [
			[{
				"是" : [{
					t  : m['吕'],
					c  : ["日", "𤴓"],
					ok : true,
				}],
			}, undefined],
			"是	9	吕	日	4		正	5	?	AMYO	日"
		],
		expected : [{
			"是" : [
				{
					t  : m['吕'],
					c  : ["日", "𤴓"],
					ok : true,
				},
				{
					t  : m['吕'],
					c  : ["日", "正"],
					ok : false,
				},
			],
		}, undefined],
		descr    : "multiple decompositions",
	},
	// XXX/TODO: set aside for now; not decided on how
	// to solve this yet.
	{
		f        : WMDecomp.parseline,
		args     : [
			[{
				"是" : [{
					t  : m['吕'],
					c  : ["日", "𤴓"],
					ok : true,
				}],
			}, undefined],
			"是	9	吕	日	4		𤴓	5		AMYO	日"
		],
		expected : [{
			"是" : [
				{
					t  : m['吕'],
					c  : ["日", "𤴓"],
					ok : true,
				},
				{
					t  : m['吕'],
					c  : ["日", "𤴓"],
					ok : true,
				},
			],
		}, undefined],
		descr    : "Not checking decomposition unicity",
	},
	/*
	 * WMDecomp.parse()
	 */
	{
		f        : WMDecomp.parse,
		args     : ["是	9	吕	日	4		𤴓	5		AMYO	日"],
		expected : [{
			"是" : [{
				t  : m['吕'],
				c  : ["日", "𤴓"],
				ok : true,
			}],
		}, undefined],
		descr    : "Basic test, no error",
	},
	{
		f        : WMDecomp.parse,
		args     : ["是	9	吕	日	4		𤴓	5		AMYO	日\n"],
		expected : [{
			"是" : [{
				t  : m['吕'],
				c  : ["日", "𤴓"],
				ok : true,
			}],
		}, undefined],
		descr    : "Trailing empty line is ignored",
	},
	{
		f        : WMDecomp.parse,
		args     : ["是	9	吕	日	4		𤴓	5		AMYO	日\r\n"],
		expected : [{
			"是" : [{
				t  : m['吕'],
				c  : ["日", "𤴓"],
				ok : true,
			}],
		}, undefined],
		descr    : "Support for non-Unix EOL",
	},
	{
		f        : WMDecomp.parse,
		args     : [""
			+"是	9	吕	日	4		𤴓	5		AMYO	日\r\n"
			+"是	9	吕	日	4		正	5	?	AMYO	日"],
		expected : [{
			"是" : [
				{
					t  : m['吕'],
					c  : ["日", "𤴓"],
					ok : true,
				},
				{
					t  : m['吕'],
					c  : ["日", "正"],
					ok : false,
				},
			],
		}, undefined],
		descr    : "Support for non-Unix EOL and multiple decompositions",
	},
];

return { "tests" : tests };

})();
let TestsCEDict = (function() {

let tests = [
	/*
	 * NOTE: we used to parse the dict in two steps, a first one transforming
	 * the dict as an array, and a second one reducing it to a hash.
	 *
	 * There is still two series of tests with overlaps because of that.
	 *
	 * We've also skipped undefined ParseError for clarity.
	 */
	{
		f        : CEDict.parseline,
		args     : [[{}], "# 蘭 兰 [Lan2] /surname Lan/abbr. for Lanzhou 蘭州|兰州[Lan2 zhou1], Gansu/"],
		expected : [{}],
		descr    : "Commented lines are ignored"
	},
	{
		f        : CEDict.parseline,
		args     : [[{}], "\t # 蘭 兰 [Lan2] /surname Lan/abbr. for Lanzhou 蘭州|兰州[Lan2 zhou1], Gansu/"],
		expected : [{}],
		descr    : "Commented lines are ignored (bis)"
	},
	{
		f        : CEDict.parseline,
		args     : [[{}], ""],
		expected : [{}],
		descr    : "Empty lines are ignored"
	},
	{
		f        : CEDict.parseline,
		args     : [[{}], "\t\t  "],
		expected : [{}],
		descr    : "Empty lines are ignored (bis)",
	},
	{
		f        : CEDict.parseline,
		args     : [[{}], "蘭 兰 [Lan2] /Surname", 3],
		expected : [{}, [3, "Invalid dict entry, not slash terminated: 蘭 兰 [Lan2] /Surname"]],
		descr    : "Entries must be slash terminated"
	},

	// second series of tests starts here
	{
		f        : CEDict.parseline,
		args     : [[{}], "蘭 兰 [Lan2] /surname Lan/abbr. for Lanzhou 蘭州|兰州[Lan2 zhou1], Gansu/"],
		expected : [{
			"蘭" : {
				"Lan2" : [{
					rm : false,
					ds : ["surname Lan", "abbr. for Lanzhou 蘭州[Lan2 zhou1], Gansu"],
				}],
			},
		}, undefined],
		descr    : "Basic line reading: simplified Chinese has been dropped"
	},
	{
		f        : CEDict.parseline,
		args     : [[{}], "+邑 邑 [yi4] /city/village/"],
		expected : [{
			"邑" : {
				"yi4" : [{
					rm : false,
					ds : ["city", "village"],
				}],
			}
		}, undefined],
		descr    : "Tweaked entry"
	},
	{
		f        : CEDict.parseline,
		args     : [[{
			"疋" : {
				"pi3" : [{
					rm : false,
					ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"],
				}],
			},
		}], "匹 匹 [pi1] /mate/one of a pair/"],
		expected : [{
			"疋" : {
				"pi3" : [{
					rm : false,
					ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"],
				}],
			},
			"匹" : {
				"pi1" : [{
					rm : false,
					ds : ["mate", "one of a pair"],
				}]
			},
		}, undefined],
		descr    : "New entry added in non-empty accumulator"
	},
	{
		f        : CEDict.parseline,
		args     : [[{
			"疋" : {
				"pi3" : [{
					ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]
				}],
			},
			"匹" : {
				"pi1" : [{
					ds : ["mate", "one of a pair"],
				}],
			},
		}, undefined], "匹 匹 [pi3] /classifier for horses, mules etc/ordinary person/classifier for cloth: bolt/"],
		expected : [{
			"疋" : {
				"pi3" : [{
					ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]
				}],
			},
			"匹" : {
				"pi1" : [{
					ds : ["mate", "one of a pair"],
				}],
				"pi3" : [{
					rm : false,
					ds : ["classifier for horses, mules etc", "ordinary person", "classifier for cloth: bolt"],
				}],
			},
		}, undefined],
		descr    : "New entry added to existing character"
	},
	// NOTE: we used to perform data patching here; this is now performed
	// inline in the front. Tests have nevertheless been kept, at least to
	// illustrate current behavior.
	{
		f        : CEDict.parseline,
		args     : [[{
			"疋" : {
				"pi3" : [{ ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"] },],
			},
		}], "-疋 匹 [pi3] /variant of 匹[pi3]/classifier for cloth: bolt/"],
		expected : [{
			"疋" : {
				"pi3" : [
					{ ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]            },
					{ ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"], rm : true },
				],
			},
		}, undefined],
		descr    : "Entry deleted"
	},
	{
		f        : CEDict.parseline,
		args     : [[{
			"疋" : {
				"pi3" : [{
					ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]
				}],
			},
		}], "-疋 匹 [pi3] /variant of 匹[pi3]/classifier for cloth:/"],
		expected : [{
			"疋" : {
				"pi3" : [
					{ ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]           },
					{ ds : ["variant of 匹[pi3]", "classifier for cloth:"],     rm : true },
				],
			},
		}, undefined],
		descr    : "This used to be an error (patching not performed here anymore)"
	},
	{
		f        : CEDict.parseline,
		args     : [[{}], "-疋 匹 [pi3] /variant of 匹[pi3]/classifier for cloth:/"],
		expected : [{
			"疋" : {
				"pi3" : [
					{ ds : ["variant of 匹[pi3]", "classifier for cloth:"], rm : true },
				],
			},
		}, undefined],
		descr    : "This used to be a patching error (now tolerated)"
	},
	{
		f        : CEDict.parseline,
		args     : [[{
			"疋" : {
				"pi3" : [{
					ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]
				}],
			},
		}],"-疋 匹 [pi3] /variant of 匹[pi3]/"],
		expected : [{
			"疋" : {
				"pi3" : [
					{ ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"] },
					{ ds : ["variant of 匹[pi3]" ], rm : true },
				],
			},
		}, undefined],
		descr    : "Partial deletion (is now not really happening)"
	},
	{
		f        : CEDict.parseline,
		args     : [[{
			"唫" : {
				"yin2" : [{
					ds : ["old variant of 吟[yin2]"],
				}],
			},
		}], "唫 唫 [yin2] /variant of 崟[yin2]/"],
		expected : [{
			"唫" : {
				"yin2" : [
					{ ds : ["old variant of 吟[yin2]"],            },
					{ ds : ["variant of 崟[yin2]"],     rm : false },
				],
			},
		}, undefined],
		descr    : "Can add definition to existing entries (used to be patched)"
	},

	/*
	 * rmmodernrefs()
	 */
	{
		f        : CEDict.rmmodernrefs,
		args     : [["蘭 兰 [Lan2] /Surname/"]],
		expected : ["蘭 兰 [Lan2] /Surname/"],
		descr    : "No modern ref: ~id()"
	},
	{
		f        : CEDict.rmmodernrefs,
		args     : [["蘭 兰 [Lan2] /abbr. for Lanzhou 蘭州[Lan2 zhou1], Gansu/"]],
		expected : ["蘭 兰 [Lan2] /abbr. for Lanzhou 蘭州[Lan2 zhou1], Gansu/"],
		descr    : "No modern ref: ~id()"
	},
	{
		f        : CEDict.rmmodernrefs,
		args     : [["蘭 兰 [Lan2] /abbr. for Lanzhou 蘭州|兰州[Lan2 zhou1], Gansu/"]],
		expected : ["蘭 兰 [Lan2] /abbr. for Lanzhou 蘭州[Lan2 zhou1], Gansu/"],
		descr    : "Modern ref is removed"
	},
	{
		f        : CEDict.rmmodernrefs,
		args     : [["月 月 [yue4] /moon/month/monthly/CL:個|个[ge4],輪|轮[lun2]/"]],
		expected : ["月 月 [yue4] /moon/month/monthly/CL:個[ge4],輪[lun2]/"],
		descr    : "Modern refs are all removed (/g/lobal subst)"
	},

	/*
	 * CEDict.clean()
	 */
	{
		f        : CEDict.clean,
		args     : [{
			"吾"    : "[Wu2] surname Wu//[wu2] I/my (old)",
			"寧"    : "[ning2] peaceful/to pacify/to visit (one's parents etc)",
			"悃"    : "[kun3] sincere",
			"款款"  : "[kuan3 kuan3] leisurely/sincerely",
			"款"    : "[kuan3] section/paragraph/funds",
			"朴"    : "[pu3] plain and simple",
			"以"    : "[yi3] to use/by means of/according to/in order to",
			"忠"    : "[zhong1] loyal/devoted/honest",
			"乎"    : "[hu1] in/at/from/because/than",
			"P"     : "[P] /(slang) femme (lesbian stereotype)/to photoshop/",
			"T"     : "[T] /(slang) butch (lesbian stereotype)/",
			"V溝"   : "[V gou1] /low neckline that reveals the cleavage/décolleté/gully/",
			"三K黨" : "[San1 K dang3] /Ku Klux Klan/KKK/",
			"三P"   : "[san1 P] /(slang) threesome/",
		}],
		expected : {
			"吾"   : "[Wu2] surname Wu//[wu2] I/my (old)",
			"寧"   : "[ning2] peaceful/to pacify/to visit (one's parents etc)",
			"悃"   : "[kun3] sincere",
			"款款" : "[kuan3 kuan3] leisurely/sincerely",
			"款"   : "[kuan3] section/paragraph/funds",
			"朴"   : "[pu3] plain and simple",
			"以"   : "[yi3] to use/by means of/according to/in order to",
			"忠"   : "[zhong1] loyal/devoted/honest",
			"乎"   : "[hu1] in/at/from/because/than",
		},
		descr    : "Useless entries removed",
	},
];

return { "tests" : tests };

})();
let TestsSWMarkdown = (function() {

let tests = [
	/*
	 * parse()
	 */
	{
		f        : SWMarkdown.parse,
		args     : [`# 說文解字

## 卷一 (一丄示三王玉玨气士丨屮艸蓐茻)

### 一部
一：惟初太始，道立於一，造分天地，化成萬物。凡一之屬皆从一。
元：始也。从一从兀。
天：顚也。至高無上，从一、大。
丕：大也。从一不聲。
吏：治人者也。从一从史，史亦聲。

## 卷十五 說文解字敘（序）
古者庖羲氏之王天下也，仰則觀象於天，俯則觀法於地，視鳥獸之文與地之宜，近取諸身，遠取諸物；於是始作《易》八卦，以垂憲象。及神農氏，結繩為治，而統其事。庶業其繁，飾偽萌生。黃帝史官倉頡，見鳥獸蹄迒之跡，知分理之可相別異也，初造書契。百工以乂，萬品以察，蓋取諸夬。“夬，揚於王庭”，言文者，宣教明化於王者朝庭，“君子所以施祿及下，居德則忌”也。

`
		],
		expected : [{
			"一" : {
				"xx5"  : [{
					ds : ["惟初太始，道立於一，造分天地，化成萬物。凡一之屬皆从一。"]
				}],
			},
			"元" : {
				"xx5"  : [{
					ds : ["始也。从一从兀。"]
				}],
			},
			"天" : {
				"xx5"  : [{
					ds : ["顚也。至高無上，从一、大。"]
				}],
			},
			"丕" : {
				"xx5"  : [{
					ds : ["大也。从一不聲。"]
				}],
			},
			"吏" : {
				"xx5"  : [{
					ds : ["治人者也。从一从史，史亦聲。"]
				}],
			},
		}, undefined],
		descr    : "Shuowen markdown correctly parsed"
	},
];

return { "tests" : tests };

})();
Tests.run([].concat(
	TestsBookmark.tests,
	TestsCut.tests,
	TestsBig5.tests,
	TestsMarkdown.tests,
	TestsWikiSource.tests,
	TestsChise.tests,
	TestsWMDecomp.tests,
	TestsCEDict.tests,
	TestsDict.tests,
	TestsSWMarkdown.tests,
	TestsData.tests,
	TestsLinks.tests,
	TestsMove.tests,
	TestsTests.tests,
	TestsUser.tests,
	TestsUtils.tests,
))
