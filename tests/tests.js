var TestsTests = (function() {

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
