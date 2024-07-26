let TestsChise = (function() {

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
