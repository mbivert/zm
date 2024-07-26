let TestsWikiSource = (function() {

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
