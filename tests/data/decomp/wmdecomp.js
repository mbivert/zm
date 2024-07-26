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
