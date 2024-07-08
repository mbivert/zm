
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
 * hlword() sequential calls on simulated DOM.
 */
{
	f        : hlword,
	args     : [Object.assign({}, tests_base_state, {
		nodes : [],
		words : ["some", "words"],
	})],
	expected : Object.assign({}, tests_base_state, {
		nodes : [],
		words : ["some", "words"],
	}),
	descr    : "No nodes: unchanged state",
},
{
	f        : hlword,
	args     : [Object.assign({}, tests_base_state, {
		nodes : ["some", "nodes"],
		words : [],
	})],
	expected : Object.assign({}, tests_base_state, {
		nodes : ["some", "nodes"],
		words : [],
	}),
	descr    : "No words: unchanged state",
},
{
	f        : hlword,
	args     : [Object.assign({}, tests_base_state, {
		nodes : ["1234", "56", "7891"],
		words : ["12", "34", "567", "89", "1"],
		wp    : -1,
		npa   : 0,
		npb   : 0,
		rca   : -1,
		rcb   : -1,
	})],
	expected : Object.assign({}, tests_base_state, {
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
	args     : [Object.assign({}, tests_base_state, {
		nodes : [ [{ hl : "12" }, "34"], "56", "7891"],
		words : ["12", "34", "567", "89", "1"],
		npa   : 0,
		npb   : 0,
		wp    : 0,
		rca   : 2,
		rcb   : 0,
	})],
	expected : Object.assign({}, tests_base_state, {
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
	args     : [Object.assign({}, tests_base_state, {
		nodes : [ ["12", { hl : "34" }], "56", "7891"],
		words : ["12", "34", "567", "89", "1"],
		npa   : 0,
		npb   : 0,
		wp    : 1,
		rca   : 0,
		rcb   : 2,
	})],
	expected : Object.assign({}, tests_base_state, {
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
	args     : [Object.assign({}, tests_base_state, {
		nodes : [ "1234", [ { hl : "56" } ], [ { hl : "7" }, "891" ] ],
		words : ["12", "34", "567", "89", "1"],
		npa   : 2,
		npb   : 1,
		wp    : 2,
		rca   : 3,
		rcb   : 0,
	})],
	expected : Object.assign({}, tests_base_state, {
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
	args     : [Object.assign({}, tests_base_state, {
		nodes : [ "1234", "56", [ "7", { hl: "89" }, "1"] ],
		words : ["12", "34", "567", "89", "1"],
		npa   : 2,
		npb   : 2,
		wp    : 3,
		rca   : 1,
		rcb   : 1,
	})],
	expected : Object.assign({}, tests_base_state, {
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
	args     : [Object.assign({}, tests_base_state, {
		nodes : [ "1234", "56", [ "789", { hl :"1" }] ],
		words : ["12", "34", "567", "89", "1"],
		npa   : 2,
		npb   : 2,
		wp    : 4,
		rca   : 0,
		rcb   : 3,
	})],
	expected : Object.assign({}, tests_base_state, {
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
	args     : [Object.assign({}, tests_base_state, {
		nodes : [ "1234", "56", [ "789", { hl :"1" }] ],
		words : ["12", "34", "567", "89", "1"],
		npa   : 2,
		npb   : 2,
		wp    : 4,
		rca   : 0,
		rcb   : 3,
	}), true],
	expected : Object.assign({}, tests_base_state, {
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
	args     : [Object.assign({}, tests_base_state, {
		nodes : [ "1234", "56", [ "7", { hl :"89" }, "1"] ],
		words : ["12", "34", "567", "89", "1"],
		npa   : 2,
		npb   : 2,
		wp    : 3,
		rca   : 1,
		rcb   : 1,
	}), true],
	expected : Object.assign({}, tests_base_state, {
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
	args     : [Object.assign({}, tests_base_state, {
		nodes : [ "1234", [ { hl : "56" } ], [ { hl :"7" }, "891"] ],
		words : ["12", "34", "567", "89", "1"],
		npa   : 2,
		npb   : 1,
		wp    : 2,
		rca   : 3,
		rcb   : 0,
	}), true],
	expected : Object.assign({}, tests_base_state, {
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
	args     : [Object.assign({}, tests_base_state, {
		nodes : [ [ "12", {hl : "34"}], "56", "7891" ],
		words : ["12", "34", "567", "89", "1"],
		npa   : 0,
		npb   : 0,
		wp    : 1,
		rca   : 0,
		rcb   : 2,
	}), true],
	expected : Object.assign({}, tests_base_state, {
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
	args     : [Object.assign({}, tests_base_state, {
		nodes : [ [ { hl : "12" }, "34"], "56", "7891" ],
		words : ["12", "34", "567", "89", "1"],
		npa   : 0,
		npb   : 0,
		wp    : 0,
		rca   : 2,
		rcb   : 0,
	}), true],
	expected : Object.assign({}, tests_base_state, {
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
