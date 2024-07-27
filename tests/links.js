var TestsLinks = (function() {

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

})();