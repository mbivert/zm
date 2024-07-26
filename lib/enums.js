let SVarType = {
	Number : 0,
	String : 1,
};

let ChunkType = {
	Invalid          : -1,
	Paragraph        : 0,
	Title            : 1,
	Section          : 2,
	Subsection       : 3,
	Subsubsection    : 4,
	Subsubsubsection : 5,
};

let MoveDir = {
	Offset : "offset",
	Next   : "next",
	Prev   : "prev",
};

let MoveWhat = {
	Word             : "word",
	Piece            : "piece",
	Chunk            : "chunk",
	Title            : "title",         // A bit weird; that's basically a move to start.
	Section          : "section",
	Subsection       : "subsection",
	Subsubsection    : "subsubsection",
	Subsubsubsection : "subsubsubsection",
};

let TokenType = {
	Punct   : 0,
	Chinese : 1,
	Foreign : 2,
	Pinyin  : 3,
	Word    : 4, // NEW; to replace Chinese/Foreign
	EOF     : 5,
};

let TabType = {
	Decomp        : "decomp",
	Dict          : "dict",
	NavDict       : "navdict",
	Imgs          : "imgs",
	Links         : "links",
	DictsChain    : "dicts-chain",
	DecompsChain  : "decomps-chain", //  TODO global s/decomps/decs/
};

let DataType = {
	Dict   : "dict",
	Decomp : "decomp",
	Big5   : "big5",
	Book   : "book",
};

let DataFmt = {
	CEDict          : "cc-cedict",
	WMDecomp        : "wm-decomp",
	Chise           : "chise",
	UnicodeBig5     : "unicode-big5",
	Markdown        : "markdown",
	SWMarkdown      : "sw-markdown", // temporary, to be removed
	SimpleDict      : "simple-dict",
};

let DecompType = {
	// u u Reserved
	Unknown      : 0,

	/// ISO 10646
	// 吅	⿰	0x2FF0	IDC LEFT TO RIGHT	IDC2	A
	CnLeftToRight  : 1,

	// 吕	⿱	0x2FF1	IDC ABOVE TO BELOW	IDC2	B
	CnAboveToBelow : 2,

	// 罒	⿲	0x2FF2	IDC LEFT TO MIDDLE AND RIGHT	IDC3	K
	CnLeftToMiddleAndRight : 3,

	// 目	⿳	0x2FF3	IDC ABOVE TO MIDDLE AND BELOW	IDC3	L
	CnAboveToMiddleAndBelow : 4,

	// 回	⿴	0x2FF4 	IDC FULL SURROUND	IDC2	I
	CnFullSurround : 5,

	// 冂	⿵	0x2FF5 	IDC SURROUND FROM ABOVE	IDC2	F
	CnSurroundFromAbove : 6,

	// 凵	⿶	0x2FF6 	IDC SURROUND FROM BELOW	IDC2	G
	CnSurroundFromBelow : 7,

	// 匚	⿷	0x2FF7 	IDC SURROUND FROM LEFT	IDC2	H
	CnSurroundFromLeft : 8,

	// 厂	⿸	0x2FF8 	IDC SURROUND FROM UPPER LEFT	IDC2	D
	CnSurroundFromUpperLeft : 9,

	// 勹	⿹	0x2FF9 	IDC SURROUND FROM UPPER RIGHT	IDC2	C
	CnSurroundFromUpperRight : 10,

	// 匕	⿺	0x2FFA	IDC SURROUND FROM LOWER LEFT	IDC2	E
	CnSurroundFromLowerLeft : 11,

	// .	⿻	0x2FFB	IDC OVERLAID	IDC2	J
	CnOverlaid : 12,

	/// Wikimedia table extension
	/// Similar patterns are identified in CHISE data, only with different symbols
	/// E.g. 一 is used by CHISE
	// 一	一	Graphical primitive, non composition (second character is always *)
	CnWmPrimitive : 13,

	// 咒	⿱⿰	Vertical composition, the top part being a repetition.
	CnWmAboveTwiceToBelow : 14,

	// 弼		Horizontal composition of three, the third being the repetition of the first.
	CnWmLeftToMiddleToLeft : 15,

	// 品		Repetition of three.
	CnWmThrice : 16,

	// 叕		Repetition of four.
	CnWmQuarce : 17,

	// 冖		Vertical composition, separated by "冖".
	CnWmVerticalCover : 18,

	// ?		Unclear, seems compound but ...
	CnWmUnclear : 19,

	// +		Graphical superposition or addition.
	CnWmSuperpos : 20,

	// *		[!] Assuming WIP; undocumented
	CnWmWIP : 21,

	/// Ours
	// a a Auto	Automatic decomposition through dictionaries.
	Auto        : 22,
};

