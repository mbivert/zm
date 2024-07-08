import * as Utils from '../modules/utils.js'
import * as Tests from '../modules/tests.js'

var tests = [
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

export { tests };
