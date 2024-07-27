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
