import * as Assert from "../modules/assert.js";
import * as Utils  from "../modules/utils.js";
import * as Data   from "../modules/data.js";

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

export {
	getfrom,

	getls,

	expand,

	get,
	mget,
};
