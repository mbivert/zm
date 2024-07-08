import * as Data       from "../modules/data.js";

import { DecompType, ChunkType, TokenType }  from "../modules/enums.js";

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

export { tests };
