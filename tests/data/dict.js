import * as Dict       from "../../modules/data/dict.js";

var tests = [
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

export { tests, };
