/*
 * Extension front-end script
 *
 *	- manage character cutting display
 *	- forward user-events to background script to retrieve
 *	  character cutting data
 */

#include "lib.js"
#include "libfront.js"

/* Generic namespace */
var browser = browser || chrome;

/*
 * TEXT_NODE and offset matching given position.
 *
 * Input:
 *	x : x-axis position
 *	y : y-axis position
 * Output:
 *	[text_node, offset]
 */
function textoffset(x, y) {
	var r, n, o;

	/* Firefox, Safari */
	if (document.caretPositionFromPoint) {
		r = document.caretPositionFromPoint(x, y);
		n = r.offsetNode;
		o = r.offset;
	}

	/* Chrome, Edge, Opera */
	else if (document.caretRangeFromPoint) {
		r = document.caretRangeFromPoint(x, y);
		n = r.startContainer;
		o = r.startOffset;
	}

	return [n, o];
}

/* ------------------------------------------------------------
 * Extensions tools
 */

var popupid     = 'cknife-popup';
var containerid = 'cknife-container';

var popup;
var container;

/*
 * Register clicks events for the inspector mode.
 *
 * Input:
 * Output:
 */
function listenforinspect() {
	document.addEventListener("click", function(e) {
		var s = window.getSelection().toString();
		if (!s)                 return;
		if (!haschinese(s))     return;
		if ([...s].length > 32) return;

		/*
		 * In inspect mode, always use a cleancut():
		 * garbage / unknown words are removed.
		 */
		var m = { 'type' : 'cleancut', 'str' : s };

		/* TODO generic sub to wrap message sending */
		browser.runtime.sendMessage(m, function(c) {
			showpopup(e.pageX, e.pageY, c);
		});
	});
}

/*
 * Register drag-related event(s) to move the cknife popup
 *
 * Input:
 * Output:
 */
function listenfordrag() {
	var ox, oy;

	popup.addEventListener("mousedown", function(e) {
		ox = e.offsetX + XPADDING;
		oy = e.offsetY + YPADDING;
	});

	popup.addEventListener("dragstart", function(e) {
		e.target.style.opacity = "0.5";
	});

	popup.addEventListener("dragend", function(e) {
		e.target.style.opacity = "";
		moveto(e.pageX-ox, e.pageY-oy);
	});
}

/*
 * Toggle the display attribute of a node.
 *
 * Input:
 *	TODO
 * Output:
 *	TODO
 */
function toggle(x) {
	if (x.style.display != "none") {
		x.style.olddisplay = x.style.display;
		x.style.display    = "none";
	} else {
		x.style.display    = x.style.olddisplay;
	}
}

/* 0.5s temporisation for double / triple clicks */
var timer = 500;

/* state for double / triple clicks (folding) */
var lasttarget;
var lasttime;
/* Number of clicks */
var ccount = 1;

/*
 * Listen for folding characters decomposition.
 *
 * Input:
 * Output:
 */
function listenforfold() {

	/*
	 * Retrieve decomposition of given target.
	 */
	function getdecomp(t, cn) {
		/*
		 * e.g. margin click, a bit buggy to hide the popup
		 * from UI perspective, so ignore
		 */
		if (t.id == popupid) return null;

		/* NOTE: strongly correlated with mkgrid() */
		if (cn.indexOf("cknife-word") != -1)
			return t.nextSibling.lastChild;
		else if (cn.indexOf("cknife-hcut") != -1)
			return t;
		else if (cn.indexOf("cknife-descr") != -1)
			if (t.nextSibling.className.indexOf("cknife-vcut") != -1)
				return t.nextSibling;

		return null;
	}

	function show(x) {
		x.style.display    = "";
		x.style.olddisplay = "hide";
	}

	function hide(x) {
		x.style.display    = "hide";
		x.style.olddisplay = "";
	}

	/*
	 * On (simple) click, toggle decomposition of target.
	 */
	function fold1(t, cn) {
		var x = getdecomp(t, cn);
		if (x) toggle(x);
	}

	/*
	 * On double click, if decomposition of target is opened,
	 * open all sub-decompositions, close them all otherwise.
	 */
	function fold2(t, cn) {
		var x = getdecomp(t, cn);
		if (!x) return;

		var xs = x.getElementsByClassName("cknife-vcut");
		console.log(xs);

		var f = x.style.display != "none" ? show : hide;

		for (var i = 0; i < xs.length; i++)
			f.call(undefined, xs[i]);
	}

	/*
	 * On triple click, if decomposition of target is opened,
	 * open all decomposition of the popup, close them all otherwise
	 */
	function fold3(t, cn) {
		var x = getdecomp(t, cn);
		if (!x) return;

		var xs = container.getElementsByClassName("cknife-vcut");

		var f = x.style.display != "none" ? show : hide;

		for (var i = 0; i < xs.length; i++)
			f.call(undefined, xs[i]);
	}

	popup.addEventListener("click", function(e) {
		console.log(lasttarget, e.target, lasttime, e.timeStamp, ccount);
		console.log(lasttarget == e.target);

		if (lasttarget == e.target && e.timeStamp - lasttime <= timer)
			ccount++;
		else
			ccount = 1;
		lasttarget = e.target;
		lasttime   = e.timeStamp;

		console.log(ccount);

		switch(ccount) {
		case 1: fold1(e.target, e.target.className); break;
		case 2: fold2(e.target, e.target.className); break;
		case 3: fold3(e.target, e.target.className); break;
		default:
		}
	});
}

/*
 * Listen for a click event outside of the popup, hidding it.
 *
 * Input:
 * Output:
 */
function listenforclose() {
	popup.addEventListener("click", function(e) {
		e.stopPropagation();
	});

	document.addEventListener("click", function() {
		popup.style.display = "none";
	});
}

/*
 * (Recursively) create a definition/decompositon grid
 * for character from cds.
 *
 * TODO: improve recursive flow
 *
 * Input:
 *	TODO
 * Output:
 *	TODO
 */
function mkgrid(cds, p) {
	p.className = "cknife-vcut";
	cds.forEach(function(cd) {
		var c1 = document.createElement('div');
		var c2 = document.createElement('div');
		var r1 = document.createElement('div');
		var r2 = document.createElement('div');

		var hascomp = cd.comp.length > 0;

		var c1c = document.createTextNode(cd.word);
		var r1c = document.createTextNode(
			(hascomp ? "[+]" : "")
			+cd.descr.replace(/\//g, " / ")
		);

		c1.className = "cknife-word";
		c2.className = "cknife-hcut";
		r1.className = "cknife-descr";

		if (hascomp) {
			toggle(r2); /* hides (sets olddisplay) */
			mkgrid(cd.comp, r2);
		}

		c1.appendChild(c1c);
		r1.appendChild(r1c);
		c2.appendChild(r1);

		/* XXX/TODO breaks folding (of course) */
//		if (hascomp)
			c2.appendChild(r2);

		p.appendChild(c1);
		p.appendChild(c2);
	});
}

function moveto(x, y) {
	popup.style.left = x + "px";
	popup.style.top  = y + "px";
}

/*
 * Display popup at given coordinates.
 *
 * Input:
 *	x, y : left/top coordinates of the popup
 *	cds  : cutting data
 * Output:
 *	None, but popup would have been placed at given coordinates
 */
function showpopup(x, y, cds) {
	if (!cds.length) {
		popup.style.display = "none";
		return;
	}

	popup.style.display = "block";

	moveto(x, y);

	container.innerHTML = "";

	mkgrid(cds, container);
}

/*
 * Register the popup for displaying cutting data at
 * the end of <body>.
 *
 * Input:
 * Output:
 *	None, but hidden popup has been stored in the DOM.
 */
function addpopup() {
	popup     = document.createElement('div');
	container = document.createElement('div');

	popup.id        = popupid;
	popup.draggable = true;
	container.id    = containerid;

	popup.appendChild(container);
	document.body.appendChild(popup);
}


/*
 * Register listeners for reading mode.
 *
 * NOTE: a keyboard shortcut might be handy here,
 *       but may be hard to implement generically.
 *
 * Input:
 * Output
 */
function listenforread() {
	var dict    = {};    /* known Chinese words so far      */
	var started = false; /* is the reading mode enabled?    */
	var hx, hy;          /* where to start reading mode     */

	/* Create a <span> holding the given text */
	function mkspan(t) {
		var n = document.createElement('span');
		n.appendChild(document.createTextNode(t));
		return n;
	}

	/* hlword() state */
	var S = {
		nodes : [], /* DOM nodes containing chinese chars */
		words : [], /* words located on nodes */
		npb   : 0,  /* first node on which current word is being highlighted */
		npa   : 0,  /* last -- */
		wp    : -1, /* next word from words to highlight */
		rca   : -1, /* remaining chars on nodes[npa] */
		rcb   : -1, /* remaining chars on nodes[npb] */

		/* XXX actually assert */
		error : null,

		/*
		 * HL functions and friends
		 *
		 * NOTE: hlword() only take care of its required state.
		 *       If S.nodes are modified, caller must adjust
		 *       DOM, other state variable in consequence.
		 */
		hl    : function(n, i, j) {
			var m = document.createElement('span');
			var t = n.textContent;

			var b = t.slice(0, i);
			var c = t.slice(i, j);
			var a = t.slice(j, t.length);

			if (b) m.appendChild(mkspan(b));

			c = mkspan(c);
			c.style.backgroundColor = 'gold';
			m.appendChild(c);

			if (a) m.appendChild(mkspan(a));
			n.parentNode.replaceChild(m, n);

			return m;
		},
		ll    : function(n) {
			var m = document.createTextNode(n.textContent)
			n.parentNode.replaceChild(m, n); /* new, old */

			return m;
		},
		len   : function(n) { return n.textContent.length;            },
		ishl  : function(n) { return n.nodeType == Node.ELEMENT_NODE; },
	};

	/*
	 * Read the DOM keeping track of all TEXT_NODES
	 * containing Chinese characters in S.nodes, and
	 * translate resulting content.
	 */
	function start() {
		var s  = '';
		var np = document.body;

		started = true;

		for (;;) {
			/* next TEXT_NODE */
			np = walkthedom(np);
			if (!np) break;

			if (haschinese(np.textContent)) {
				S.nodes.push(np);
				s += np.textContent;
			}
		}

		/* void */
		if (!s) return Promise.resolve();

		/* launch translation process */
		return new Promise(function(resolve, reject) {
			var m = { 'type' : 'cut', 'str' : s };

			/* Cut those nodes' content */
			browser.runtime.sendMessage(m, function(c) {
				for (var i = 0; i < c.length; i++) {
					S.words.push(c[i].word);
					dict[c[i].word] = c[i];
				}
				resolve('ok');
			});
		});
	}

	/*
	 * Display popup for current word being highlighted.
	 */
	function showword() {
		/* Current popup position */
		var x = popup.style.left;
		var y = popup.style.top;

		/* Show popup near highlighted word if hidden */
		if (popup.style.display == 'none') {
			x = S.nodes[S.npa].offsetLeft;
			y = S.nodes[S.npa].offsetTop + S.nodes[S.npa].offsetHeight;
		}

		showpopup(x, y, [dict[S.words[S.wp]]]);

		function show(x) {
			x.style.display    = "";
			x.style.olddisplay = "hide";
		}

		/* cf. fold3() */
		var xs = container.getElementsByClassName("cknife-vcut");
		for (var i = 0; i < xs.length; i++)
			show(xs[i]);
	}

	/*
	 * Highlight previous/next word.
	 */
	function hl(prev) {
		if (S.words.length == 0) return;

		do { hlword(S, prev); } while (!haschinese(S.words[S.wp]));

		/*
		 * Send current position to background script
		 * NOTE: shouldn't we / can't we store it here?
		 */
		browser.runtime.sendMessage({
			type : 'setpos',
			wp   : S.wp,
			ts   : Date.now(),
		});

		showword();
	}

	function stop() { dict = {}; started = false; hlwordrst(S); }

	/*
	 * State machine fetching data from the DOM, feeding it to
	 * background dictionary script, and highlighting current word.
	 */
	function run(state) {
		switch(state) {
		// NOTE: lambda to remove Promise parameters
		case "start": return start().then(function() { hl() });
		case "next":  return hl();
		case "prev":  return hl(true);
		case "stop":  return stop();
		}
	}

	/*
	 * message from extensions about reading mode
	 * activation / de-activation.
	 */
	browser.runtime.onMessage.addListener(function(m, s, sr) {
		if (!m.here && !m.wp)
			return m.reading ? run("start") : run("stop");

		if (m.here) return Promise.resolve().then(function() {
			hlwordrst(S); return start();
		}).then(function() {
			var found = -1;
			var here  = textoffset(hx, hy);

			for (var i = 0; i < S.nodes.length; i++)
				if (S.nodes[i] == here[0]) found = i;

			if (found == -1) return;

			for (var r = false, o = 0;;) {
				hl();

				if (!r && S.npb <= found && found <= S.npa) r = true, o = 0;

				/*
				 * we went pass the node, reasonable to stop here
				 * XXX should be a NO-OP
				 */
				else if (r && S.npb > found) return;

				var p = o + S.words[S.wp].length;

				/* close enough */
				if (r && o <= here[1] &&  here[1] <= p+1) return;

				/* keep moving */
				o = p;
			}
		});

		return Promise.resolve().then(function() {
			hlwordrst(S); return start();
		}).then(function() {
			if (m.wp > S.words.length) {
				console.log("Invalid position, starting from the top");
				m.wp = 0;
			}

			while (S.wp != m.wp)
				hl();
		});
	});

	document.addEventListener("contextmenu", function(e) {
		/*
		 * NOTE: we don't call textoffset() here: in case we're
		 * clicking here on a node being highlighted, the TEXT_NODE
		 * we'll get would be removed when removing the highlight,
		 * and would thus never be found.
		 */
		hx = e.clientX, hy = e.clientY;
	});

	/* movements in reading mode */
	document.addEventListener("keydown", function(e) {
		if (!started)                    return;

		switch(e.code) {
		case 'ArrowRight': e.preventDefault(); run("next"); break;
		case 'ArrowLeft':  e.preventDefault(); run("prev"); break;
		}
	});
}

window.addEventListener("load", function() {
	addpopup();
	listenforinspect();
	listenfordrag();
	listenforclose();
	listenforfold();
	listenforread();
});

