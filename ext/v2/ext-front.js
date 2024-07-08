/*
 * Extension front-end script.
 *
 * NOTE: the extension was imported "quickly" from a previous version,
 * were cutting mechanism was quite different.
 *
 * We should now be able to optimize a few things, especially in reading
 * mode, by simply tokenizing the data instead of cutting it. Also, dict
 * variable in listenforread seems to be useless.
 */

/*
 * Keeping it just in case.
 */
#define NAMESPACING 0

#if NAMESPACING
(function(zhongmu) {
#endif

#include "libutils.js"
#include "libcut.js"
#include "libshow.js"
#include "libhlword.js"

/*
 * Rename all class names so that enabling the extension
 * doesn't break zm site.
 */
czmdefword    = "zhongmu-ext-def-word";
czmtoggledec  = "zhongmu-ext-toggle-decomp";
czmhcut       = "zhongmu-ext-hcut";
czmvcut       = "zhongmu-ext-vcut";
czmword       = "zhongmu-ext-word";
czmdescr      = "zhongmu-ext-descr";
czmtoggleext  = "zhongmu-ext-toggle-ext-trs";
czmdecword    = "zhongmu-ext-dec-word";
czmstrokesimg = "zhongmu-ext-strokes-img";
czmtoggledefs = "zhongmu-ext-toggle-defs";
czmtoggleimgs = "zhongmu-ext-toggle-imgs";
czmtoggleexts = "zhongmu-ext-toggle-exts";
czmtogglepict = "zhongmu-ext-toggle-pict";
czmtabcontent = "zhongmu-ext-tab-content";

/* Generic namespace */
var browser = browser || chrome;

/*
 * Popup/bar/stack/grid DOM elements / ids.
 *
 * The popup contains the bar, the stack & the grid.
 * The bar contains the mover & the closer.
 */
var popupid = "zhongmu-popup";
var barid   = "zhongmu-bar";
var moverid = "zhongmu-mover";
var stackid = "zhongmu-stack";
var gridid  = "zhongmu-grid";
var ppopup;
var pbar;
var pmover;
var pcloser;
var pgrid;
var pstack;

var czmclosepopup = "zhongmu-closer";

/*
 * Move the popup to the given coordinates.
 *
 * Input:
 *	x, y : left/top coordinates
 * Output:
 *	Popup has been moved.
 */
function moveto(x, y) {
	ppopup.style.left = x + "px";
	ppopup.style.top  = y + "px";
}

/*
 * Allows the popup to be dragged when clicking
 * on the mover.
 *
 * Input:
 * Output:
 */
function listenfordrag() {
	var candrag = false;
	var ox, oy;

	ppopup.draggable = true;

	ppopup.addEventListener("mousedown", function(e) {
		candrag = (e.target == pmover);
		ox = e.offsetX;
		oy = e.offsetY;
	});
	ppopup.addEventListener("dragstart", function(e) {
		if (!candrag) { e.preventDefault(); return; }
		e.target.style.opacity = "0.5";
	});

	ppopup.addEventListener("dragend", function(e) {
		e.target.style.opacity = "";
		moveto(e.pageX-ox, e.pageY-oy);
	});
}

/*
 * Create popup grid in the DOM and registers
 * pointers in the namespace.
 *
 * Input:
 * Output:
 *	Popup container is added at the end of the body.
 */
function addpopup() {
	ppopup  = document.createElement('div');
	pbar    = document.createElement('div');
	pstack  = document.createElement('div');
	pgrid   = document.createElement('div');
	pmover  = document.createElement('div');
	pcloser = mka("[×]", czmclosepopup);

#if NAMESPACING
	zhongmu.ppopup  = ppopup;
	zhongmu.pbar    = pbar;
	zhongmu.pstack  = pstack;
	zhongmu.pgrid   = pgrid;
	zhongmu.pmover  = pmover;
	zhongmu.pcloser = pcloser;
#endif

	pmover.innerText = "☰";

	ppopup.id        = popupid;
	pbar.id          = barid;
	pmover.id        = moverid;
	pstack.id        = stackid;
	pgrid.id         = gridid;

	ppopup.style.display = 'none';

	pbar.appendChild(pmover);
	pbar.appendChild(pcloser);
	ppopup.appendChild(pbar);
	ppopup.appendChild(pstack);
	ppopup.appendChild(pgrid);
	document.body.appendChild(ppopup);
}

/*
 * TODO
 *
 * Input:
 *	ts  : cut()'s output
 * Output:
 *	Popup displayed with cds; if cds is empty,
 *	popup is hidden.
 */
function preparepopup(ts) {
	if (!ts.length) {
		ppopup.style.display = "none";
		return;
	}

	ppopup.style.display = "block";

	pgrid.innerHTML = "";
}

/*
 * Call cut() through backend script; store output to popup.
 *
 * Input:
 *	s : string to cut
 * Output:
 *	Promise resolved once popup is displayed (XXX not sure)
 */
function xcut(s) {
	/*
	 * In inspect mode, always use a cleancut():
	 * garbage / unknown words are removed.
	 */
	var m = { 't' : 'cleancut', 's' : s };

	return new Promise(function(resolve, reject) {
		browser.runtime.sendMessage(m, function(c) {
			preparepopup(c);
			resolve(c);
		});
	});
}

/*
 * On click, if we found Chinese text in selection,
 * display a cut() grid with in-depth analysis.
 *
 * Input:
 * Output:
 *	Click event would have been registered.
 */
function listenforcut() {
	document.addEventListener("click", function(e) {
		var s = window.getSelection().toString();
		if (ppopup.contains(e.target)) return;
		if (!s)                        return;
		if (!haschinese(s))            return;
		// TODO: make this configurable
		if ([...s].length > 64)        return;

		moveto(e.pageX, e.pageY);
		pushdecword(s, pgrid, pstack, xcut);
	});
}

function rststack() {
	decwords         = {};
	pstack.innerHTML = "";
}

/*
 * Listen for popup closing.
 */
function listenforclosepopup() {
	alisten(czmclosepopup, function(e) {
		ppopup.style.display = "none";
		rststack();
	});
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
			var m = { 't' : 'cut', 's' : s };

			/* Cut those nodes' content */
			browser.runtime.sendMessage(m, function(c) {
				for (var i = 0; i < c.length; i++) {
					S.words.push(c[i].v);
					dict[c[i].v] = c[i];
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
		var x = ppopup.style.left;
		var y = ppopup.style.top;

		/* Show popup near highlighted word if hidden */
		if (ppopup.style.display == 'none') {
			x = S.nodes[S.npa].offsetLeft;
			y = S.nodes[S.npa].offsetTop + S.nodes[S.npa].offsetHeight;
		}

		moveto(x, y);
		pushdecword(S.words[S.wp], pgrid, pstack, xcut);
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
		 *
		 * TODO
		 */
#if 0
		browser.runtime.sendMessage({
			type : 'setpos',
			wp   : S.wp,
			ts   : Date.now(),
		});
#endif

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
		case 'ArrowRight': e.preventDefault(); rststack(); run("next"); break;
		case 'ArrowLeft':  e.preventDefault(); rststack(); run("prev"); break;
		}
	});
}

#if NAMESPACING
/*
 * Exporting functions to namespace
 */
zhongmu.xcut                  = xcut;
zhongmu.addpopup              = addpopup;
zhongmu.listenforcut          = listenforcut;
zhongmu.libshowlistenall      = libshowlistenall;
zhongmu.listenforclosepopup   = listenforclosepopup;
zhongmu.listenfordrag         = listenfordrag;
zhongmu.listenforread         = listenforread;

}(window.zhongmu = window.zhongmu || {}));
#endif

window.addEventListener("load", function() {
#if NAMESPACING
	zhongmu.addpopup();
	zhongmu.listenforcut();
	zhongmu.libshowlistenall(zhongmu.pgrid, zhongmu.pstack, zhongmu.xcut);
	zhongmu.listenforclosepopup();
	zhongmu.listenfordrag();
	zhongmu.listenforread(xcut);
#endif
	addpopup();
	listenforcut();
	libshowlistenall(pgrid, pstack, xcut);
	listenforclosepopup();
	listenfordrag();
	listenforread(xcut);
});
