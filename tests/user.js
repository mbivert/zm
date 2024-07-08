import * as User       from "../modules/user.js";

import { TabType } from "../modules/enums.js";

var tests = [
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

export { tests, };
