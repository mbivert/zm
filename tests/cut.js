import * as Cut  from "../modules/cut.js";
import * as Data from "../modules/data.js";

import { TokenType, DecompType } from "../modules/enums.js";

/**
 * Create placeholder dict entries to simplified tests
 * reading/maintainance.
 *
 * @type{(x: string) => DictEntry}
 */
function p(x) { return { "xx5" : [{ ds : [x] }] }; }

var tests = [
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

export { tests, };
