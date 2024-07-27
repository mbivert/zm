var TestsBookmark = (function() {

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

var TestsCut = (function() {

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
var TestsData = (function() {

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

})();var TestsMove = (function() {

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

})();var TestsTests = (function() {

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
var TestsUser = (function() {

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
var TestsUtils = (function() {

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
var TestsDict = (function() {

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
var TestsBig5 = (function() {

/** @type{Array.<Test>} */
let tests = [
];

return { "tests" : tests };

})();
var TestsMarkdown = (function() {

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
var TestsWikiSource = (function() {

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
var TestsChise = (function() {

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
var TestsWMDecomp = (function() {
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
var TestsCEDict = (function() {

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
var TestsSWMarkdown = (function() {

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
