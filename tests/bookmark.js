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

