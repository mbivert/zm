/*
 * Unit-Tests for lib.js' and libfront.js' functions
 */

#include "lib.js"

#include "libuts.js"
#include "libfront.js"
#include "libcut.js"
#include "libload.js"

/*
 * All known tests.
 */
var tests = [
	/*
	 * dcmp()
	 */
	{
		f        : dcmp,
		args     : [1, 1],
		expected : true,
		descr    : "Integers, equals",
	},
	{
		f        : dcmp,
		args     : [1, 2],
		expected : false,
		descr    : "Integers, not equals",
	},
	{
		f        : dcmp,
		args     : ["hello", "hello"],
		expected : true,
		descr    : "Strings, equals",
	},
	{
		f        : dcmp,
		args     : ["hello", "world"],
		expected : false,
		descr    : "Strings, not equals",
	},
	{
		f        : dcmp,
		args     : [[], []],
		expected : true,
		descr    : "Arrays, empty, equals",
	},
	{
		f        : dcmp,
		args     : [[1, 2], [1, 2]],
		expected : true,
		descr    : "Arrays, 1d, equals",
	},
	{
		f        : dcmp,
		args     : [[1, 2], [2, 2]],
		expected : false,
		descr    : "Arrays, 1d, not equals",
	},
	{
		f        : dcmp,
		args     : [[1, 2], [1, 2, 3]],
		expected : false,
		descr    : "Arrays, 1d, not equals (bis)",
	},
	{
		f        : dcmp,
		args     : [[1, 2, 3], [1, 2]],
		expected : false,
		descr    : "Arrays, 1d, not equals (ter)",
	},
	{
		f        : dcmp,
		args     : [{}, []],
		expected : false,
		descr    : "Empty hash is not an array",
	},
	{
		f        : dcmp,
		args     : [{}, {}],
		expected : true,
		descr    : "Hashes, empty, equals",
	},
	{
		f        : dcmp,
		args     : [{foo : 12}, {foo : 12}],
		expected : true,
		descr    : "Hashes, 1d, equals",
	},
	{
		f        : dcmp,
		args     : [{foo : 12}, {}],
		expected : false,
		descr    : "Hashes, 1d, not equals",
	},
	{
		f        : dcmp,
		args     : [{foo : 12}, {bar : 'baz'}],
		expected : false,
		descr    : "Hashes, 1d, not equals (bis)",
	},
	{
		f        : dcmp,
		args     : [{foo : 12}, {foo : 12, bar : 'baz'}],
		expected : false,
		descr    : "Hashes, 1d, not equals (ter)",
	},
	{
		f        : dcmp,
		args     : [{foo : [1, 2]}, {foo : [1, 3]}],
		expected : false,
		descr    : "Hashes, 2d, not equals",
	},
	{
		f        : dcmp,
		args     : [{foo : [1, 2]}, {foo : [1, 2]}],
		expected : true,
		descr    : "Hashes, 2d, equals",
	},
	{
		f        : dcmp,
		args     : [{foo : [1, 2, [3, 1]]}, {foo : [1, 2, [3, 1]]}],
		expected : true,
		descr    : "Deep object, equals",
	},
	{
		f        : dcmp,
		args     : [{foo : [1, 2, [3, 1]]}, {foo : [1, 2, [3, 1, {}]]}],
		expected : false,
		descr    : "Deep object, not equals",
	},

	/*
	 * haschinese()
	 */
	{
		f        : haschinese,
		args     : [""],
		expected : false,
		descr    : "Empty string",
	},
	{
		f        : haschinese,
		args     : ["hello, world!"],
		expected : false,
		descr    : "English-only sentence",
	},
	{
		f        : haschinese,
		args     : ["好心西"],
		expected : true,
		descr    : "Chinese-only sentence",
	},
	{
		f        : haschinese,
		args     : ["好心: good heart"],
		expected : true,
		descr    : "Chinese+English sentence",
	},
	{
		f        : haschinese,
		args     : ["𤴓: bug in your computer"],
		expected : true,
		descr    : "'Long' character",
	},

	/*
	 * readdictline()
	 */
	{
		f        : readdictline,
		args     : [{}, "蘭 兰 [Lan2] /surname Lan/abbr. for Lanzhou 蘭州|兰州[Lan2 zhou1], Gansu/"],
		expected : {
			"蘭" : "[Lan2] surname Lan/abbr. for Lanzhou 蘭州|兰州[Lan2 zhou1], Gansu",
			"兰"  : "[Lan2] surname Lan/abbr. for Lanzhou 蘭州|兰州[Lan2 zhou1], Gansu",
		},
		descr    : "Basic line reading"
	},
	{
		f        : readdictline,
		args     : [{}, "# 蘭 兰 [Lan2] /surname Lan/abbr. for Lanzhou 蘭州|兰州[Lan2 zhou1], Gansu/"],
		expected : {},
		descr    : "Comment line is ignored"
	},
	{
		f        : readdictline,
		args     : [{}, ""],
		expected : {},
		descr    : "Empty line ignored"
	},
	{
		f        : readdictline,
		args     : [{}, "   \t"],
		expected : {},
		descr    : "Empty line ignored (bis)"
	},
	{
		f        : readdictline,
		args     : [{}, "-邑 邑 [yi4] /city/village/"],
		expected : {},
		descr    : "Ignore lines starting with a '-'"
	},
	{
		f        : readdictline,
		args     : [{}, "+邑 邑 [yi4] /city/village/"],
		expected : {
			"邑" : "[yi4] city/village",
		},
		descr    : "Skip heading + if any"
	},

	/*
	 * mktdict()
	 */
	{
		f        : mktdict,
		args     : [{ "hi" : "e", "hit" : "f", "hyt" : "g", "foo" : "h"}],
		expected : {
			h : [{
				i : [
					{ t : [{}, "f"] },
					"e"
				],
				y : [
					{ t : [ {}, "g"] },
				],
			}],
			f : [{
				o : [
					{ o : [{}, "h"] },
				],
			}],
		},
		descr    : "Basic test"
	},

	/*
	 * getword()
	 */
	{
		f        : getword,
		args     : ["", mktdict({ "hi" : 1, "hit" : 1, "hyt" : 1, "foo" : 1})],
		expected : ["", "", ""],
		descr    : "Empty string"
	},
	{
		f        : getword,
		args     : ["hi", mktdict({ "hi" : "e", "hit" : "f", "hyt" : "g", "foo" : "h"})],
		expected : ["hi", "", "e"],
		descr    : "Word matching full string"
	},
	{
		f        : getword,
		args     : ["hie", mktdict({ "hi" : "e", "hit" : "f", "hyt" : "g", "foo" : "h"})],
		expected : ["hi", "e", "e"],
		descr    : "Remaining bytes"
	},
	{
		f        : getword,
		args     : ["xxx", mktdict({ "hi" : 1, "hit" : 1, "hyt" : 1, "foo" : 1})],
		expected : ["", "xxx", ""],
		descr    : "No word read"
	},
	{
		f        : getword,
		args     : ["hxx", mktdict({ "hi" : 1, "hit" : 1, "hyt" : 1, "foo" : 1})],
		expected : ["", "hxx", ""],
		descr    : "No word read, but 1 byte move"
	},
	{
		f        : getword,
		args     : ["hyx", mktdict({ "hi" : 1, "hit" : 1, "hyt" : 1, "foo" : 1})],
		expected : ["", "hyx", ""],
		descr    : "No word read, but 2 byte move"
	},
	{
		f        : getword,
		args     : ["hitte", mktdict({ "hi" : 1, "hittt" : 1, "hyt" : 1, "foo" : 1})],
		expected : ["hi", "tte", 1],
		descr    : "A word read, 2 useless move"
	},
	{
		f        : getword,
		args     : ["hittte", mktdict({ "hi" : 1, "hittt" : "bl", "hitttte" : 1})],
		expected : ["hittt", "e", "bl"],
		descr    : "Similar to before but with two known words on the path",
	},

	/*
	 * cut()
	 */
	{
		f        : cut,
		args     : ["", {}, {}],
		expected : [],
		descr    : "Empty string",
	},
	{
		f        : cut,
		args     : ["心", {}, mktdict({'心' : 'heart'})],
		expected : [
			{
				word  : '心',
				descr : 'heart',
				link  : [],
				comp  : [],
			},
		],
		descr    : "Defined, unbreakable word",
	},
	{
		f        : cut,
		args     : [
			"好",
			{ '好' : ['女', '子'] },
			mktdict({
				'好' : "good",
				'女' : "woman",
				'子' : "child",
			}),
		],
		expected : [
			{
				word  : '好',
				descr : 'good',
				link : [],
				comp  : [
					{
						word  : '女',
						descr : 'woman',
						link : [],
						comp  : []
					},
					{
						word  : '子',
						descr : 'child',
						link : [],
						comp  : []
					},
				],
			},
		],
		descr    : "Defined, single-layer breakable word",
	},
	{
		f        : cut,
		args     : [
			"乖",
			{
				'乖' : ['千', '北'],
				'千' : ['丿', '十'],
				'北' : ['爿', '匕'],
			},
			mktdict({
				'乖' : "obedient",
				'千' : "thousand",
				'十' : "ten",
				'北' : "north",
				'爿' : "piece of wood",
				'匕' : "dagger",
			})
		],
		expected : [
			{
				word  : '乖',
				descr : 'obedient',
				link : [],
				comp  : [
					{
						word  : '千',
						descr : 'thousand',
						link : [],
						comp  : [
							{
								word  : '丿',
								descr : '-',
								link : [],
								comp  : []
							},
							{
								word  : '十',
								descr : 'ten',
								link : [],
								comp  : []
							}
						]
					},
					{
						word  : '北',
						descr : 'north',
						link : [],
						comp  : [
							{
								word  : '爿',
								descr : 'piece of wood',
								link : [],
								comp  : []
							},
							{
								word  : '匕',
								descr : 'dagger',
								link : [],
								comp  : []
							}
						]
					},
				],
			},
		],
		descr    : "Defined, two-layer breakable word",
	},
	{
		f        : cut,
		args     : [
			'九天是好',
			/*
			 * Incomplete and "inaccurate" according to decomp.csv,
			 * for UTs' only.
			 */
			{
				'天' : ['一', '大'],
				'大' : ['人', '一'],
			},
			mktdict({
				'九天' : "the Ninth Heaven",
				'九'   : "nine",
				'天'   : "Heaven, sky",
				'是'   : "to be",
				'好'   : "good",
				'一'   : "one",
				'大'   : "great",
				'人'   : "man",
			}),
		],
		expected : [
			{
				word  : '九天',
				descr : "the Ninth Heaven",
				link : [],
				comp  : [
					{
						word  : '九',
						descr : 'nine',
						link : [],
						comp  : [],
					},
					{
						word  : '天',
						descr : 'Heaven, sky',
						link : [],
						comp  : [
							{
								'word'  : '一',
								'descr' : 'one',
								link : [],
								'comp'  : [],
							},
							{
								'word'  : '大',
								'descr' : 'great',
								link : [],
								'comp'  : [
									{
										'word'  : '人',
										'descr' : 'man',
										link : [],
										'comp'  : [],
									},
									{
										'word'  : '一',
										'descr' : 'one',
										link : [],
										'comp'  : [],
									},
								],
							},
						],
					},
				]
			},
			{
				word  : '是',
				descr : "to be",
				link : [],
				comp  : [],
			},
			{
				word  : '好',
				descr : "good",
				link : [],
				comp  : [],
			},
		],
		descr    : "One two-characters word, two one-character words"
	},
	{
		f        : cut,
		args     : [" 心 he心", {}, mktdict({'心' : 'heart'})],
		expected : [
			{
				word  : ' ',
				descr : '-',
				link : [],
				comp  : [],
			},
			{
				word  : '心',
				descr : 'heart',
				link : [],
				comp  : [],
			},
			{
				word  : ' ',
				descr : '-',
				link : [],
				comp  : [],
			},
			{
				word  : 'h',
				descr : '-',
				link : [],
				comp  : [],
			},
			{
				word  : 'e',
				descr : '-',
				link : [],
				comp  : [],
			},
			{
				word  : '心',
				descr : 'heart',
				link : [],
				comp  : [],
			},
		],
		descr    : "Spaces, garbage and real words",
	},
	{
		f        : cut,
		args     : ["𤴓", {}, {}],
		expected : [
			{
				word  : '𤴓',
				descr : '-',
				link : [],
				comp  : [],
			},
		],
		descr    : "Encoding issue when naively going through string",
	},
	/*
	 * Typical example were old cut() would fail and break word
	 * in [一, 丁點]
	 */
	{
		f        : cut,
		args     : ["一丁點", {}, mktdict({
			'一'     : '[yi1] /one/1/single',
			'一丁點' : '[yi1 ding1 dian3] /a tiny bit/a wee bit/',
			'丁點'   : '[ding1 dian3] /tiny bit/',
		})],
		expected : [
			{
				word  : '一丁點',
				descr : '[yi1 ding1 dian3] /a tiny bit/a wee bit/',
				link  : [],
				comp  : [
					{
						word  : '一',
						descr : '[yi1] /one/1/single',
						link  : [],
						comp  : [],
					},
					{
						word  : '丁點',
						descr : '[ding1 dian3] /tiny bit/',
						link  : [],
						comp  : [
							{
								word  : '丁',
								descr : '-',
								link  : [],
								comp  : [],
							},
							{
								word  : '點',
								descr : '-',
								link  : [],
								comp  : [],
							},
						],
					},
				],
			},
		],
		descr    : "Encoding issue when naively going through string",
	},
	{
		f        : cut,
		args     : ["泝", {}, mktdict({
			'泝' : '[su4] /variant of 溯[su4]/',
			'溯' : '[su4] /to go upstream/to trace the source/',
		}), 1],
		expected : [
			{
				word   : '泝',
				descr  : '[su4] /variant of 溯[su4]/',
				link  : [{
					word  : "溯",
					descr : "[su4] /to go upstream/to trace the source/",
					link : [],
					comp : []
				}],
				comp  : [],
			},
		],
		descr    : "Simple variant, 1 depth",
	},
	{
		f        : cut,
		args     : ["泝", {}, mktdict({
			'泝' : '[su4] /variant of 泝[su4]/',
		}), 0],
		expected : [
			{
				word   : '泝',
				descr  : '[su4] /variant of 泝[su4]/',
				link  : [],
				comp  : [],
			},
		],
		descr    : "Self recursive with no depth",
	},
	{
		f        : cut,
		args     : ["泝", {}, mktdict({
			'泝' : '[su4] /variant of 泝[su4]/',
		}), 1],
		expected : [
			{
				word   : '泝',
				descr  : '[su4] /variant of 泝[su4]/',
				link  : [{
					word  : '泝',
					descr : '[su4] /variant of 泝[su4]/',
					link  : [],
					comp  : [],
				}],
				comp  : [],
			},
		],
		descr    : "Self recursive with depth",
	},
	{
		f        : cut,
		args     : ["㞙", {}, mktdict({
			'㞙'  : '[niao4] /old variant of 尿[niao4]/',
			'尿' : '[niao4] /to urinate/urine/CL:泡[pao1]/㞙',
			'泡' : '[pao1] /puffed/swollen/spongy/small lake/㞙尿'
		}), 2],
		expected : [
			{
				word  : '㞙',
				descr : '[niao4] /old variant of 尿[niao4]/',
				comp  : [],
				link  : [{
					word  : "尿",
					descr : "[niao4] /to urinate/urine/CL:泡[pao1]/㞙",
					comp  : [],
					link  : [
						{
							word  : "泡",
							descr : '[pao1] /puffed/swollen/spongy/small lake/㞙尿',
							comp  : [],
							link  : [],
						},
						{
							word  : "㞙",
							descr : '[niao4] /old variant of 尿[niao4]/',
							comp  : [],
							link  : [],
						},
					],
				}],
			},
		],
		descr    : "Two layers, invented circular refs (depth=2)",
	},
	{
		f        : cut,
		args     : ["一族", {}, mktdict({
			'一族' : '[yi1 zu2] /social group/subculture/family/clan/see also 族[zu2]/',
			'族'   : '[zu2] /race/nationality/ethnicity/clan/',
		}), 1],
		expected : [
			{
				word  : '一族',
				descr : '[yi1 zu2] /social group/subculture/family/clan/see also 族[zu2]/',
				link  : [{
					word  : "族",
					descr : "[zu2] /race/nationality/ethnicity/clan/",
					link  : [],
					comp  : [],
				}],
				comp  : [
		            {
						word  : "一",
						descr : "-",
						link  : [],
						comp  : [],
		            },
		            {
						word  : "族",
						descr : "[zu2] /race/nationality/ethnicity/clan/",
						link  : [],
						comp  : [],
					}
		        ]
			},
		],
		descr    : "Variant in decomposition, present once only (depth=1)",
	},
	{
		f        : cut,
		args     : ["一族", {}, mktdict({
			'一族' : '[yi1 zu2] /social group/subculture/family/clan/see also 一族[zu2]/',
			'族'   : '[zu2] /race/nationality/ethnicity/clan/',
		})],
		expected : [
			{
				word  : '一族',
				descr : '[yi1 zu2] /social group/subculture/family/clan/see also 一族[zu2]/',
				link  : [],
				comp  : [
		            {
						word  : "一",
						descr : "-",
						link  : [],
						comp  : [],
		            },
		            {
						word  : "族",
						descr : "[zu2] /race/nationality/ethnicity/clan/",
						link  : [],
						comp  : [],
					}
		        ]
			},
		],
		descr    : "Self referencing multiple-character word (no depth)",
	},
	{

		f        : cut,
		args     : ["論", {}, mktdict({
			'論'     : '[Lun2] /abbr. for 論語|论语[Lun2 yu3], The Analects (of Confucius)/',
			'論語'   : '[Lun2 yu3] /The Analects of Confucius 孔子[Kong3 zi3]/',
			'孔子'   : '[Kong3 zi3] /Confucius (551-479 BC), Chinese thinker and social philosopher, also known as 孔夫子[Kong3 fu1 zi3]/',
			'孔夫子' : '[Kong3 fu1 zi3] /Confucius (551-479 BC), Chinese thinker and social philosopher, also known as 孔子[Kong3 zi3]/',
			'語'     : '[yu3] /dialect/language/speech/[yu4] /to tell to/',
		}), 2],
		expected : [
			{
				word  : '論',
				descr : '[Lun2] /abbr. for 論語|论语[Lun2 yu3], The Analects (of Confucius)/',
				link  : [{
					word  : '論語',
					descr : '[Lun2 yu3] /The Analects of Confucius 孔子[Kong3 zi3]/',
					link  : [{
						word  : '孔子',
						descr : '[Kong3 zi3] /Confucius (551-479 BC), Chinese thinker and social philosopher, also known as 孔夫子[Kong3 fu1 zi3]/',
						link  : [],
						comp  : [
							{
								word  : "孔",
								descr : "-",
								link  : [],
								comp  : [],
							},
							{
								word  : "子",
								descr : "-",
								link  : [],
								comp  : [],
							},
						],
					}],
					comp  : [
						{
							word  : "論",
							descr : "[Lun2] /abbr. for 論語|论语[Lun2 yu3], The Analects (of Confucius)/",
							link  : [
								{
									word  : '論語',
									descr : '[Lun2 yu3] /The Analects of Confucius 孔子[Kong3 zi3]/',
									link  : [],
									comp  : [
										{
											word  : "論",
											descr : "[Lun2] /abbr. for 論語|论语[Lun2 yu3], The Analects (of Confucius)/",
											link  : [],
											comp  : [],
										},
										{
											word  : "語",
											descr : "[yu3] /dialect/language/speech/[yu4] /to tell to/",
											link  : [],
											comp  : [],
										},
									],
								},
								{
									word  : "论",
									descr : "-",
									link  : [],
									comp  : [],
								},
								{
									word  : "语",
									descr : "-",
									link  : [],
									comp  : [],
								},
							],
							comp  : [],
						},
						{
							word  : "語",
							descr : "[yu3] /dialect/language/speech/[yu4] /to tell to/",
							link  : [],
							comp  : [],
						},
					],
				}, {
					word  : "论",
					descr : "-",
					link  : [],
					comp  : [],
				}, {
					word  : "语",
					descr : "-",
					link  : [],
					comp  : [],
				}],
				comp  : []
			},
		],
		descr    : "Self referencing multiple-character word",
	},
	{
		f        : cut,
		args     : ["開天闢地", {}, mktdict({
			'開天闢地' : '[kai1 tian1 pi4 di4] /to split heaven and earth apart (idiom);',
			'無窮無盡' : '[wu2 qiong2 wu2 jin4] /endless/boundless/infinite/',
			'開'       : '[kai1] /to open/to start/to turn on/',
			'天'       : '[tian1] /day/sky/heaven/',
			'闢'       : '[pi4] /to open (a door)/to open up (for development)',
			'地'       : '[de5] /-ly/structural particle:...',
		}), 2],
		expected : [
			{
				word  : '開天闢地',
				descr : '[kai1 tian1 pi4 di4] /to split heaven and earth apart (idiom);',
				comp  : [
					{
						word  : '開',
						descr : '[kai1] /to open/to start/to turn on/',
						link  : [],
						comp  : [],
					},
					{
						word  : '天',
						descr : '[tian1] /day/sky/heaven/',
						link  : [],
						comp  : [],
					},
					{
						word  : '闢',
						descr : '[pi4] /to open (a door)/to open up (for development)',
						link  : [],
						comp  : [],
					},
					{
						word  : '地',
						descr : '[de5] /-ly/structural particle:...',
						link  : [],
						comp  : [],
					},
				],
				link  : [],
			},
		],
		descr    : "Two layers, invented circular refs (depth=2)",
	},

	/*
	 * quickcut()
	 */
	{
		f        : qcut,
		args     : [
			"refers to the Pangu 盤古|盘古[Pan2 gu3] creation myth",
			mktdict({
				'盤古' : 'Pangu',
				'盘古'  : 'Pangu',
		})],
		expected : [
			{ t : "foreign", v : "refers"    },
			{ t : "punct",   v : " "         },
			{ t : "foreign", v :"to"         },
			{ t : "punct",   v : " "         },
			{ t : "foreign", v :"the"        },
			{ t : "punct",   v : " "         },
			{ t : "foreign", v :"Pangu"      },
			{ t : "punct",   v : " "         },
			{ t : "chinese", v :"盤古"       },
			{ t : "punct",   v : "|"         },
			{ t : "chinese", v :"盘古"        },
			{ t : "foreign", v :"[Pan2"      },
			{ t : "punct",   v : " "         },
			{ t : "foreign", v :"gu3]"       },
			{ t : "punct",   v : " "         },
			{ t : "foreign", v :"creation"   },
			{ t : "punct",   v : " "         },
			{ t : "foreign", v :"myth"       },
		],
		descr    : "Basic example",
	},

	/*
	 * readdecompline()
	 */
	{
		f        : readdecompline,
		args     : [{}, "丁 一 亅"],
		expected : {
			"丁" : ["一", "亅"],
		},
		descr    : "Decomposing to two characters"
	},
	{
		f        : readdecompline,
		args     : [{}, "一 一 *"],
		expected : {},
		descr    : "Decomposing to itself"
	},
	{
		f        : readdecompline,
		args     : [{}, "哥 可 *"],
		expected : {
			"哥" : ["可"],
		},
		descr    : "Decomposing to one character"
	},
	{
		f        : readdecompline,
		args     : [{}, "展 尸"],
		expected : {
			"展" : ["尸"],
		},
		descr    : "Decomposing to one character, buggy entries"
	},
	{
		f        : readdecompline,
		args     : [{}, "発 癶 井?"],
		expected : {
			"発" : ["癶", "井"],
		},
		descr    : "Decomposing to two characters, unsafe entry",
	},
	{
		f        : readdecompline,
		args     : [{}, "発 癶? 井?"], // ~fake data
		expected : {
			"発" : ["癶", "井"],
		},
		descr    : "Decomposing to two characters, unsafe entry (bis)",
	},
	{
		f        : readdecompline,
		args     : [{}, "皐 白  夲*"],
		expected : {
			"皐" : ["白", "夲"],
		},
		descr    : "Decomposing to two characters, extra '*'",
	},
	{
		f        : readdecompline,
		args     : [{}, "發 癶 弓殳"],
		expected : {
			"發" : ["癶", "弓", "殳"],
		},
		descr    : "Decomposing to more than two characters",
	},
	{
		f        : readdecompline,
		args     : [{}, "發 癶弓 殳"], // ~fake data, just in case
		expected : {
			"發" : ["癶", "弓", "殳"],
		},
		descr    : "Decomposing to more than two characters (bis)",
	},
	{
		f        : readdecompline,
		args     : [{}, ""],
		expected : {},
		descr    : "Empty line adds nothing",
	},
	{
		/*
		 * See https://stackoverflow.com/a/32961117
		 */

		f        : readdecompline,
		args     : [{}, "有 𠂇 月"],
		expected : {
			"有" : ["𠂇", "月"],
		},
		descr    : "This bugs with a .split(\"\"), but not with spread op",
	},
	{
		f        : readdecompline,
		args     : [{}, "是 日 𤴓"],
		expected : {
			"是" : ["日", "𤴓"],
		},
		descr    : "mkay",
	},

	/*
	 * cleancut()
	 */
	{
		f        : cleancut,
		args     : [[]],
		expected : [],
		descr    : "Nothing to clean"
	},
	{
		f        : cleancut,
		args     : [[{ word : "hello", descr : "world"}]],
		expected : [{ word : "hello", descr : "world"}],
		descr    : "Defined non-chinese word (kept)"
	},
	{
		f        : cleancut,
		args     : [[{ word : "hello", descr : "-"}]],
		expected : [],
		descr    : "Undefined non-chinese word (cleaned)"
	},
	{
		f        : cleancut,
		args     : [[{ word : "蘭", descr : "-"}]],
		expected : [{ word : "蘭", descr : "-"}],
		descr    : "Undefined chinese word (kept)"
	},
	{
		f        : cleancut,
		args     : [[{ word : "蘭", descr : "[Lan2] surname Lan"}]],
		expected : [{ word : "蘭", descr : "[Lan2] surname Lan"}],
		descr    : "Defined chinese word (kept)"
	},

	/*
	 * walkthedom() / walkalldom() / mkfakedom()
	 *
	 * XXX We're trying to limit dependencies, but perhaps
	 *     jsdom would make sense here; UTs are becoming a bit
	 *     crafty. Notably, we're not sure our fake DOM is looking
	 *     like real DOM.
	 *
	 * TODO: Generate basic fake DOM skeleton from real HTML in the
	 *       browser for better accuracy. JSON.stringify mess up because
	 *       of circularity.
	 *
	 * TODO: more complete UTs (e.g. what happens with comments)
	 */
	{
		f        : walkalldom,
		args     : [mkfakedom({
			nodeType : Node.ELEMENT_NODE,
			children : [
				{
					nodeType : Node.TEXT_NODE,
					data     : "foo bar"
				},
				{
					nodeType : Node.ELEMENT_NODE,
					children : [{
						nodeType : Node.TEXT_NODE,
						data     : " hello "
					}]
				},
				{
					nodeType : Node.ELEMENT_NODE,
					children : []
				},
				{
					nodeType : Node.TEXT_NODE,
					data     : "what what"
				}
			],
		}), "next"],
		expected : ["foo bar", " hello ", "what what"],
		descr    : "Basic DOM walking"
	},
	{
		f        : walkalldom,
		args     : [mkfakedom({
			nodeType : Node.ELEMENT_NODE,
			children : [
				{
					nodeType : Node.ELEMENT_NODE,
					children : [
						{
							nodeType : Node.TEXT_NODE,
							data     : "foo bar"
						},
					]
				},
				{
					nodeType : Node.ELEMENT_NODE,
					children : [
						{
							nodeType : Node.ELEMENT_NODE,
							children : [],
						},
						{
							nodeType : Node.TEXT_NODE,
							data     : " hello "
						},
					]
				},
			],
		})],
		expected : ["foo bar", " hello "],
		descr    : "Defaulting to forward walk, different DOM"
	},
	{
		f        : walkalldom,
		args     : [mkfakedom({
			nodeType : Node.ELEMENT_NODE,
			children : [
				{
					nodeType : Node.ELEMENT_NODE,
					children : [
						{
							nodeType : Node.TEXT_NODE,
							data     : "foo bar"
						},
					]
				},
				{
					nodeType : Node.ELEMENT_NODE,
					children : [
						{
							nodeType : Node.ELEMENT_NODE,
							children : [],
						},
						{
							nodeType : Node.TEXT_NODE,
							data     : " hello "
						},
					]
				},
			],
		}), "prev"],
		expected : [" hello ", "foo bar", ],
		descr    : "backward DOM walking."
	},

	/*
	 * hlword() sequences of calls on abstract data
	 *
	 * TODO: hlprevword() UTs + add history here.
	 */
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : [],
			words : ["some", "words"],
		})],
		expected : Object.assign({}, uts_base_state, {
			nodes : [],
			words : ["some", "words"],
		}),
		descr    : "No nodes: unchanged state",
	},
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : ["some", "nodes"],
			words : [],
		})],
		expected : Object.assign({}, uts_base_state, {
			nodes : ["some", "nodes"],
			words : [],
		}),
		descr    : "No words: unchanged state",
	},
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : ["1234", "56", "7891"],
			words : ["12", "34", "567", "89", "1"],
			wp    : -1,
			npa   : 0,
			npb   : 0,
			rca   : -1,
			rcb   : -1,
		})],
		expected : Object.assign({}, uts_base_state, {
			nodes : [ [{ hl : "12" }, "34"], "56", "7891"],
			words : ["12", "34", "567", "89", "1"],
			npa   : 0,
			npb   : 0,
			wp    : 0,
			rca   : 2,
			rcb   : 0,
		}),
		descr    : "partial first node hl",
	},
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : [ [{ hl : "12" }, "34"], "56", "7891"],
			words : ["12", "34", "567", "89", "1"],
			npa   : 0,
			npb   : 0,
			wp    : 0,
			rca   : 2,
			rcb   : 0,
		})],
		expected : Object.assign({}, uts_base_state, {
			nodes : [ ["12", { hl : "34" }], "56", "7891"],
			words : ["12", "34", "567", "89", "1"],
			npa   : 0,
			npb   : 0,
			wp    : 1,
			rca   : 0,
			rcb   : 2,
		}),
		descr    : "Continuing on a node",
	},
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : [ ["12", { hl : "34" }], "56", "7891"],
			words : ["12", "34", "567", "89", "1"],
			npa   : 0,
			npb   : 0,
			wp    : 1,
			rca   : 0,
			rcb   : 2,
		})],
		expected : Object.assign({}, uts_base_state, {
			nodes : [ "1234", [ { hl : "56" } ], [ { hl : "7" }, "891" ] ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 2,
			npb   : 1,
			wp    : 2,
			rca   : 3,
			rcb   : 0,
		}),
		descr    : "Closing a node; word spread on two nodes",
	},
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : [ "1234", [ { hl : "56" } ], [ { hl : "7" }, "891" ] ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 2,
			npb   : 1,
			wp    : 2,
			rca   : 3,
			rcb   : 0,
		})],
		expected : Object.assign({}, uts_base_state, {
			nodes : [ "1234", "56", [ "7", { hl: "89" }, "1"] ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 2,
			npb   : 2,
			wp    : 3,
			rca   : 1,
			rcb   : 1,
		}),
		descr    : "Continuing in middle of mode",
	},
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : [ "1234", "56", [ "7", { hl: "89" }, "1"] ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 2,
			npb   : 2,
			wp    : 3,
			rca   : 1,
			rcb   : 1,
		})],
		expected : Object.assign({}, uts_base_state, {
			nodes : [ "1234", "56", [ "789", { hl :"1" }] ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 2,
			npb   : 2,
			wp    : 4,
			rca   : 0,
			rcb   : 3,
		}),
		descr    : "Last word",
	},
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : [ "1234", "56", [ "789", { hl :"1" }] ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 2,
			npb   : 2,
			wp    : 4,
			rca   : 0,
			rcb   : 3,
		})],
		expected : Object.assign({}, uts_base_state, {
			nodes : [ [{ hl : "12" }, "34"], "56", "7891"],
			words : ["12", "34", "567", "89", "1"],
			npa   : 0,
			npb   : 0,
			wp    : 0,
			rca   : 2,
			rcb   : 0,
		}),
		descr    : "Looping back to first word",
	},
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : [ "1234", "56", [ "789", { hl :"1" }] ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 2,
			npb   : 2,
			wp    : 4,
			rca   : 0,
			rcb   : 3,
		}), true],
		expected : Object.assign({}, uts_base_state, {
			nodes : [ "1234", "56", [ "7", { hl :"89" }, "1"] ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 2,
			npb   : 2,
			wp    : 3,
			rca   : 1,
			rcb   : 1,
		}),
		descr    : "Reversing direction, starting from last word",
	},
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : [ "1234", "56", [ "7", { hl :"89" }, "1"] ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 2,
			npb   : 2,
			wp    : 3,
			rca   : 1,
			rcb   : 1,
		}), true],
		expected : Object.assign({}, uts_base_state, {
			nodes : [ "1234", [ { hl : "56" } ], [ { hl :"7" }, "891"] ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 2,
			npb   : 1,
			wp    : 2,
			rca   : 3,
			rcb   : 0,
		}),
		descr    : "keep going backward",
	},
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : [ "1234", [ { hl : "56" } ], [ { hl :"7" }, "891"] ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 2,
			npb   : 1,
			wp    : 2,
			rca   : 3,
			rcb   : 0,
		}), true],
		expected : Object.assign({}, uts_base_state, {
			nodes : [ [ "12", {hl : "34"}], "56", "7891" ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 0,
			npb   : 0,
			wp    : 1,
			rca   : 0,
			rcb   : 2,
		}),
		descr    : "keep going backward (bis)",
	},
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : [ [ "12", {hl : "34"}], "56", "7891" ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 0,
			npb   : 0,
			wp    : 1,
			rca   : 0,
			rcb   : 2,
		}), true],
		expected : Object.assign({}, uts_base_state, {
			nodes : [ [ { hl : "12" }, "34"], "56", "7891" ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 0,
			npb   : 0,
			wp    : 0,
			rca   : 2,
			rcb   : 0,
		}),
		descr    : "keep going backward (ter)",
	},
	{
		f        : hlword,
		args     : [Object.assign({}, uts_base_state, {
			nodes : [ [ { hl : "12" }, "34"], "56", "7891" ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 0,
			npb   : 0,
			wp    : 0,
			rca   : 2,
			rcb   : 0,
		}), true],
		expected : Object.assign({}, uts_base_state, {
			nodes : [ "1234", "56", [ "789", { hl :"1" }] ],
			words : ["12", "34", "567", "89", "1"],
			npa   : 2,
			npb   : 2,
			wp    : 4,
			rca   : 0,
			rcb   : 3,
		}),
		descr    : "and going from front to last",
	},
	{
		f        : parsemarkup,
		args     : [""
			+"= xxx yyyy\n"
			+"\n"
			+"\n"
			+"== x, y\n"
			+"x y z\n"
			+"x\n"
			+"\n"
			+"xx\n"
			+"== x y z\n"
			+"x\n",
		],
		expected : [
			{"t" : "chapter",   "v" : "xxx yyyy" },
			{"t" : "section",   "v" : "x, y"     },
			{"t" : "paragraph", "v" : "x y z\nx" },
			{"t" : "paragraph", "v" : "xx"       },
			{"t" : "section",   "v" : "x y z"    },
			{"t" : "paragraph", "v" : "x"        },
		],
		descr    : "many sections, paragraphs",
	},
	/*
	 * NOTE: we're testing parsemarkup through loadsrc().
	 */
	{
		f        : loadsrc,
		args     : ["", {}, {}],
		expected : [],
		descr    : "empty string",
	},
	{
		f        : loadsrc,
		args     : ["吾", {}, {}],
		expected : [
			{ "t" : "paragraph", "v" : ["吾"] }
		],
		descr    : "single undefined word",
	},
	/*
	 * https://zh.wikisource.org/wiki/%E5%8D%9C%E5%B1%85_(%E5%B1%88%E5%8E%9F)
	 */
	{
		f        : loadsrc,
		args     : ["吾寧悃悃款款,朴以忠乎？", {}, mktdict({
			"吾"   : "[Wu2] surname Wu//[wu2] I/my (old)",
			"寧"   : "[ning2] peaceful/to pacify/to visit (one's parents etc)",
			"悃"   : "[kun3] sincere",
			"款款" : "[kuan3 kuan3] leisurely/sincerely",
			"款"   : "[kuan3] section/paragraph/funds",
			"朴"   : "[pu3] plain and simple",
			"以"   : "[yi3] to use/by means of/according to/in order to",
			"忠"   : "[zhong1] loyal/devoted/honest",
			"乎"   : "[hu1] in/at/from/because/than",
		})],
		expected : [
			{ "t" : "paragraph", "v" : [
				"吾", "寧", "悃", "悃", "款款", ",", "朴", "以", "忠", "乎", "？",
			]},
		],
		descr    : "full sentence",
	},
	{
		f        : loadsrc,
		args     : [""
			+"= x y\n"
			+"== x, y\n"
			+"x y z\n"
			+"x\n"
			+"\n"
			+"x\n"
			+"== x y z\n"
			+"x\n",
			{},
			mktdict({
				"x" : "-",
				"y" : "-",
				"z" : "-",
			}),
		],
		expected : [
			{"t" : "chapter",   "v" : ["x", " ", "y"]                      },
			{"t" : "section",   "v" : ["x", ",", " ", "y"]                 },
			{"t" : "paragraph", "v" : ["x", " ", "y", " ", "z", "\n", "x"] },
			{"t" : "paragraph", "v" : ["x"]                                },
			{"t" : "section",   "v" : ["x", " ", "y", " ", "z"]            },
			{"t" : "paragraph", "v" : ["x"]                                },
		],
		descr    : "many sections, paragraphs",
	},

	/*
	 * loadtr()
	 *
	 * XXX most of the work already tested through loadsrc()
	 */
	{
		f        : loadtr,
		args     : [""],
		expected : [],
		descr    : "empty string",
	},
	{
		f        : loadtr,
		args     : [""
			+"= xxx yyyy\n"
			+"== x, y\n"
			+"x y z\n"
			+"x\n"
			+"\n"
			+"xx\n"
			+"== x y z\n"
			+"x\n",
		],
		expected : [
			{"t" : "chapter",   "v" : ["xxx ", "yyyy"]         },
			{"t" : "section",   "v" : ["x,", " ", "y"]         },
			{"t" : "paragraph", "v" : ["x ", "y ", "z\n", "x"] },
			{"t" : "paragraph", "v" : ["xx"]                   },
			{"t" : "section",   "v" : ["x ", "y ", "z"]        },
			{"t" : "paragraph", "v" : ["x"]                    },
		],
		descr    : "many sections, paragraphs, peculiar punct management",
	},

];

run_tests(tests);
