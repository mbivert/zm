/*
 * Code below was used by front.js of the currently
 * defunct extension.
 *
 * It may be revived as some point.
 */

/* Node.* unavailable during UTs */
var Node = Node || {
	ELEMENT_NODE                : 1,
	TEXT_NODE                   : 3,
	CDATA_SECTION_NODE          : 4,
	PROCESSING_INSTRUCTION_NODE : 7,
	COMMENT_NODE                : 8,
	DOCUMENT_NODE               : 9,
	DOCUMENT_TYPE_NODE          : 10,
	DOCUMENT_FRAGMENT_NODE      : 11,
};

/* Again, for UTs */
var document = document || { body : {} };

/*
 * Forward / backward DOM walking looking for a TEXT_NODE,
 * potentially containing Chinese characters.
 *
 * Input:
 *	x : where to start the walk
 *	d : "forward" / "backward" [default: "forward"]
 * Output:
 *	next / previous TEXT_NODE, or null when reaching document.body
 */
function walkthedom(x, d) {
	if (!x) x = document.body;
	if (!d) d = "next";

	/* get next / previous sibling */
	function sibling(x) {
		return d == "next" ? x.nextSibling : x.previousSibling;
	}

	/* get first / last child */
	function child(x) {
		return d == "next" ? x.firstChild : x.lastChild;
	}

	/*
	 * Go one step up in the DOM.
	 * Input:
	 *	x : node from where to climb up
	 * Output:
	 *	next step up, or null when reaching document.body
	 */
	function uponestep(x) {
		for (;;) {
			var y = sibling(x);
			if (y)
				return y;
			else if (x.parentNode == document.body)
				break;
			else
				x = x.parentNode;
		}

		return null;
	}

	/* If we start on a TEXT_NODE, go up a little */
	if (x.nodeType == Node.TEXT_NODE) x = uponestep(x);

	while (x) {
		switch(x.nodeType) {
		/* Maybe there's something here */
		case Node.TEXT_NODE:
			return x;

		/* DFS */
		case Node.ELEMENT_NODE:
			x = x.hasChildNodes() ? child(x) : uponestep(x);
			break;

		/* Ignore */
		case Node.CDATA_SECTION_NODE:
		case Node.PROCESSING_INSTRUCTION_NODE:
		case Node.COMMENT_NODE:
			x = uponestep(x);
			break;

		/* ~Impossible (XXX ensure its the case in practice) */
		case Node.DOCUMENT_NODE:
		case Node.DOCUMENT_TYPE_NODE:
		case Node.DOCUMENT_FRAGMENT_NODE:
		default:
			x = null;
			break;
		}
	}

	/* Journey's end */
	return x;
}

/*
 * Create a "fake" DOM for testing walkthedom().
 *
 * Only used for UTs.
 *
 * Input:
 *	x : partial "fake" DOM, with nodeType and data elements
 *  n : boolean, setting parentNode to document.body when false.
 * Output:
 *	"walkable" DOM, that is, objects with just enough
 *	properties so that walkthedom() would work.
 */
function mkfakedom(x, n) {
	if (!n)
		x.parentNode = document.body;

	if (x.nodeType == Node.ELEMENT_NODE) {
		x.firstChild = x.children[0];
		x.lastChild  = x.children[x.children.length-1];
		x.hasChildNodes = x.children.length
			? function() { return true;  }
			: function() { return false; };
		for (var i = 0; i < x.children.length; i++) {
			x.children[i].parentNode      = x;
			x.children[i].nextSibling     = x.children[i+1];
			x.children[i].previousSibling = x.children[i-1];
			x.children[i]                 = mkfakedom(x.children[i], true);
		}
	}

	return x;
}

/*
 * Iteratively call walkthedom(); ease walkthedom()'s testing.
 *
 * Only used for UTs.
 *
 * Input:
 *	x : where to start the iteration in the DOM.
 *  d : walking direction ("prev" / "next")
 * Output:
 *	Array of text found, in order
 */
function walkalldom(x, d) {
	var ts = [];

	for (;;) {
		x = walkthedom(x, d);
		if (x) ts.push(x.data);
		else   break;
	}

	return ts;
}

/* Remove previous highlight, if any */
function hlwordll(s) {
	for (var i = s.npb; i <= s.npa; i++)
		if (s.ishl(s.nodes[i])) s.nodes[i] = s.ll(s.nodes[i]);
}

/*
 * Highlight next / previous word.
 *
 * Delicate, central piece of code.
 *
 * NOTE: function made quite generic so that we can
 *       test it easily [without a DOM].
 *
 * NOTE: a node is said to be highlighted if it is being
 *       broken to highlight a word; not to be confused with
 *       word highlightening thus, cf. ishl().
 *
 * XXX/TODO 看中文 : manage word overlapping.
 *	e.g. if previous word has a suffix matching a prefix of current
 *       word to highlight, and if the concatenation of both words isn't
 *       found in the dom, assume overlapping.
 *
 * Input:
 *	s : state variable. The state is a hash containing the
 * 	    following keys:
 *	    	- nodes : array of "DOM" nodes
 *	    	- words : words spread on previous nodes
 *	    	- npb   : nodes pointer (nodes index); index of
 *	    	          node on which words[wp-1] starts (before).
 *	    	- npa   : nodes pointer (nodes index); index of
 *	    	          node on which words[wp-1] ends (after).
 *	    	- wp    : words pointer (words index); word to highlight
 *	    	- rcb   : remaining characters in nodes[npb] before
 *	    	          words[wp].
 *	    	- rca   : remaining characters in nodes[npa] after
 *	    	          words[wp].
 *	    	- hl(n, i,j) : function used to highlight characters i to j
 *	    	               (i included, j excluded) of node n
 *	    	- ll(n)   : function to remove highlighting on given node
 *	    	- len(n)  : function to compute a node's length
 *	    	- ishl(n) : function to check if a node is highlighted
 *	    	- error   : error string; used for assertions.
 *
 * Output:
 *	Updated state variable.
 */
function hlword(s, prev) {
	/*------------------------------------------------------------
	 * Initialisation
	 */
	/* Reasonable */
	if (s.nodes.length == 0) return s;
	if (s.words.length == 0) return s;

	/* Remove previous highlight, if any */
	hlwordll(s);

	/* Move forward by default */
	var next = !prev;

	/* From end to start */
	if (next  && s.wp == s.words.length-1)
		s.npa = s.npb = 0, s.wp = s.rca = s.rcb = -1;

	/* From start to end */
	if (prev && s.wp == 0) {
		s.wp  = s.words.length;
		s.npb = s.npa = s.nodes.length-1;
		s.rca = s.rcb = -1;
	}

	/* Starting */
	if (next && s.rca == -1) s.rca = s.len(s.nodes[s.npa]);
	if (prev && s.rcb == -1) s.rcb = s.len(s.nodes[s.npb]);

	/*------------------------------------------------------------
	 * Directions wrapper
	 */

	/* Current node */
	var np = next ? s.npa : s.npb;

	/* Available space on current node (np) */
	var rc = next ? s.rca : s.rcb;

	/* move a word / node pointer */
	function mv(x)      { return next ? x+1   : x-1;   }

	/* move in reverse direction */
	function rmv(x)     { return next ? x-1   : x+1;   }

	/* is x before y */
	function before(x, y) { return next ? x < y : x > y; }

	/*
	 * Partial node highlighting and state update preparation
	 */
	s.npb = s.nodes.length;
	s.npa = -1;
	s.rca = s.rcb = 0;
	function hl(n, m, o) {
		var l = s.len(s.nodes[n]);
		var i = next ?   m : l-m;
		var j = next ? i+o : i-o;

		if (next) {
			s.nodes[n] = s.hl(s.nodes[n], i, j);

			if (n <= s.npb) s.npb = n, s.rcb = i;
			if (n >= s.npa) s.npa = n, s.rca = l-j;
		}
		if (prev) {
			s.nodes[n] = s.hl(s.nodes[n], j, i);

			if (n <= s.npb) s.npb = n, s.rcb = j;
			if (n >= s.npa) s.npa = n, s.rca = l-i;
		}
	}

	/*------------------------------------------------------------
	 * Main code, direction-agnostic.
	 */

	/* Move word pointer */
	s.wp = mv(s.wp);

	/* Length of word to be highlighted */
	var l = s.words[s.wp].length;

	/* Currently available place */
	var a = rc;

	/* Currently written characters */
	var b = 0;

	/* Current node */
	var c = np;

	/* Collect enough nodes to place current word */
	while (a < l) {
		if (c > s.nodes.length) {
			s.error = "Not enough nodes for '"+s.words[s.wp]+"'";
			return s;
		}
		if (c < 0) {
			s.error = "Not enough nodes for '"+s.words[s.wp]+"'";
			return s;
		}

		c = mv(c);
		a += s.len(s.nodes[c]);
	}

	/* Start by hl remaining bytes on current node if any */
	if (rc) {
		var i = s.len(s.nodes[np])-rc;
		var j = l > rc ? rc : l;
		hl(np, i, j);

		b += j;
	}

	/* Then, hl full nodes in between if any */
	for (var d = mv(np); before(d, c); d = mv(d)) {
		var k = s.len(s.nodes[d]);
		hl(d, 0, k);

		b += k;
	}

	/* And hl remaining bytes on last node if any */
	if (b < l) hl(c, 0, l-b);

	return s;
}

function hlwordrst(s) {
	if (s.wp != -1) hlwordll(s);

	/* reset state variables */
	s.nodes = [];
	s.words = [];
	s.rca   = -1;
	s.rcb   = -1;
	s.npa   =  0;
	s.npb   =  0;
	s.wp    = -1;

	return s;
}

/*
 * Base state for hlword()'s UTs.
 */
var uts_base_state = {
	nodes : [],
	words : [],
	rca   : -1,
	rcb   : -1,
	npa   :  0,
	npb   :  0,
	wp    : -1,

	hl   : function (n, i, j) {
		var b = n.slice(0, i);
		var c = n.slice(i, j);
		var e = n.slice(j, n.length);

		var out = [];
		if (b) out.push(b);
		out.push({ hl : c });
		if (e) out.push(e);

		return out;
	},
	ll   : function(n) {
		var m = n.reduce(function(acc, x) {
			return acc + (typeof(x) == 'object' ? x.hl.toString() : x);
		}, '');
		return m;
	},
	ishl : function(n) { return Array.isArray(n); },
	len  : function(n) {
		return Array.isArray(n)
			? n.reduce(function(acc, x) { return acc+(
					(typeof(x) == 'object') ? x.hl.toString().length : x.length
				);}, 0)
			: n.length;
	}
};
