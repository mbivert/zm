/**
 * Basic utilities to simplify DOM management.
 */

import * as Assert  from "../modules/assert.js";
import * as Classes from "../modules/classes.js";

/**
 * Display the element pointed by x.
 *
 * @param{HideableHTMLElement} x - (pointer) to DOM node.
 * @returns{HTMLElement} - x
 */
function show(x) {
	x.style.display = x.oldDisplay || '';
	return x
}

/**
 * Show the x's first child.
 *
 * @param{HTMLElement} x
 * @param{string}      [c] - optional class to assign to c
 * @returns{HTMLElement} - x
 */
function showfirst(x, c) {
	if (x.firstElementChild)
		show(/** @type{HTMLElement} */ (x.firstElementChild));
	return x;
}

/**
 * Is x displayed?
 *
 * @param{HideableHTMLElement} x - (pointer) to DOM node.
 * @returns{boolean}
 */
function isshown(x) { return x.style.display != 'none'; }

/**
 * Hides the element pointed by x.
 *
 * @param{HideableHTMLElement} x - (pointer) to DOM node.
 * @returns{HTMLElement} - x
 */
function hide(x) {
	if (isshown(x)) {
		x.oldDisplay    = x.style.display;
		x.style.display = 'none';
	}

	return x
}

/**
 * Hides x's children.
 *
 * @param{HTMLElement} x
 * @returns{HTMLElement} - x
 */
function hidechildren(x) {
	for (let i = 0; i < x.children.length; i++)
		hide(/** @type{HideableHTMLElement} */ (x.children[i]));
	return x;
}

/** @type{HideableHTMLElement | undefined} */
var ploading = document.getElementById("loading") || undefined;

/**
 * Show the "loading" element.
 *
 * @returns{void}
 */
function loading() { if (ploading) show(ploading); }

/**
 * Hide the "loading" element.
 *
 * @returns{void}
 */
function loaded()  { if (ploading) hide(ploading); }

/**
 * Create a <span> with given text content.
 *
 * @param{string} [t] - <span>'s text
 * @param{string} [c] - class
 *
 * @returns{HTMLElement} - <span> element containing given text.
 */
function mkspan(t, c) { return mke("span", t, c); }

/**
 * Create a <element> with given text content.
 *
 * @param{string} n   - element name (span, div, etc.)
 * @param{string} [t] - innerText
 * @param{string} [c] - className
 *
 * @returns{HTMLElement} - <span> element containing given text.
 */
function mke(n, t, c) {
	let x = document.createElement(n);
	if (t !== undefined) x.innerText = t;
	if (c !== undefined) x.className = c;
	return x;
}

/**
 * Recursively create HTML for a ToC.
 *
 * @param{ToC} cs
 * @returns{HTMLElement}
 */
function mktoc(cs) {
	let x = document.createElement("ul");
	for (let i = 0; i < cs.length; i++) {
		let y = document.createElement('li');
		y.appendChild(mka(cs[i].v, Classes.tocentry, "#c="+cs[i].ic));
		y.append(mktoc(cs[i].cs));
		x.appendChild(y);
	}
	return x;
}

/**
 * Put a separating dash in a span.
 *
 * @returns{HTMLElement} <span> element containing a dash.
 */
function mkdash() { return mkspan(" - "); }

/**
 * Create <a> with given class. Links point to
 * h if specified, # otherwise.
 *
 * This is often used for links behaving as buttons,
 * hence the defaults.
 *
 * @param{string} t   - link's text
 * @param{string} [c] - link's class      [default: ""]
 * @param{string} [h] - link's URL (href) [default: "#"]
 * @param{string} [i] - link's title      [default: "" ]
 *
 * @returns{HTMLElement} - <a> element with given properties.
 */
function mka(t, c, h, i) {
	let x       = document.createElement("a");
	x.innerText = t;
	x.className = c || "";
	x.href      = h || "#";
	x.title     = i || "";

	return x;
}

/**
 * Creates a <select> from the given options.
 *
 * @param{Array<[string, string]>} xs  - text/values of the <option>s
 *
 * @returns{HTMLSelectElement}
 */
function mkselect(xs) {
	let p = document.createElement("select");
	for (let i = 0; i < xs.length; i++) {
		let q = document.createElement("option")
		q.value     = xs[i][0];
		q.innerText = xs[i][1];
		p.appendChild(q)
	}

	return p;
}

/**
 * Listen on click for "fake" '<a>' elements with a
 * given class.
 *
 * TODO: <a> perhaps should be stylized <buttons>, see
 * also ':/^function mka\('
 *
 * @param{string}                c - class on which we want to registers click events.
 * @param{(e : PointerEvent) => (boolean|void)} f - event handler
 * @param{HTMLElement}           [p] - where to attach handler [default: document]
 *
 * @returns{void}
 */
function alisten(c, f, p) {
	(p || document).addEventListener("click",
		/** @type{(e : Event) => (boolean)} */
		function(e) {
			if (!(e.target instanceof HTMLElement)) return true;
			if (!(e instanceof PointerEvent))       return true;
			if (!e.target.classList.contains(c))    return true;

			let b;
			// TODO: this should work, but things are expected to break
			e.preventDefault(); if ((b = f(e)) === false) e.stopPropagation();
			return b || false;
		});
}

/**
 * Assuming n points to a DOM node, and contains
 * a piece of text, as its siblings, compute
 * the number of utf8 characters find in all
 * preceeding siblings.
 *
 * NOTE: see also counttextoffset()
 * NOTE: naming is a bit weird but matches the fact that
 * we're using pieces in trbook. We'll rework all this
 * code later.
 *
 * NOTE: there used to be a bug between countpieceoffset()
 * and counttextoffset() due to how newlines were counted.
 *
 * @param{Element}  n - pointer to DOM node.
 * @returns{number} - Total number of utf8 characters from all
 *                    n's siblings located before n.
 */
function countpieceoffset(n) {
	var i = 0;
	/** @type{Element|null} */
	var m = n;

	while (m = m.previousElementSibling)
		// NOTE: we *want* .innerText over .textContent, as
		// .textContent doesn't contain newlines for instance.
		i += [...(( /** @type{HTMLElement} */(m)).innerText || "")].length;

	return i;
}

/**
 * Assuming n points to a DOM node, and contains
 * a piece of text, as its siblings, compute
 * the number of utf8 characters find in all
 * preceeding siblings.
 *
 * NOTE: We likely could have replace countpieceoffset()
 * with counttextoffset(), but we prefer to be cautious.
 *
 * We do not iterate on Element because e.g. in the Shuowen,
 * our psrc contain a few <br>: psrc does not as such contain
 * a single Text node, but a collection of them, and the offset
 * we get from selection is relative to the text node being
 * clicked, and needs to be made relative to that collections
 * of text node before we can make it relative to something else.
 *
 * Also at some point we'll remove the distinctions between
 * book and trbook, and likely, will use a single function to
 * render current chunk, even for index, just with convenient
 * classes.
 *
 * @param{Node}   n - pointer to DOM node.
 * @returns{number} - Total number of utf8 characters from all
 *                    n's siblings located before n.
 */
function counttextoffset(n) {
	var i = 0;
	/** @type{Node|null} */
	var m = n;

	// confident we have no comments or weird stuff here.
	while (m = m.previousSibling) {
		if (!m.textContent && m.nodeName == 'BR') i++;
		// Nodes (not Element) have no .innerText, only .textContent
		else i += [...(m.textContent || "")].length;
	}

	return i;
}


/**
 * When clicking on psrc/ptr, convert the click position
 * into a character offset relative to current chunk, whether
 * in ptr/psrc, *if possible*
 *
 * We rely on window.getSelection() on a click event
 * to find the offset.
 *
 * The selection works on caret rather than characters,
 * works on Text nodes, not Element, and is theoretically
 * conceived to span multiple (Text) nodes.
 *
 * As a consequence, the anchorNode (start of the selection)
 * pointed by the selection doesn't always match the target
 * of the event, e.g. clicking on the first part of the first
 * character of a piece: event's target is the piece containing
 * the character, while the anchorNode is the previous piece.
 *
 * It follows that the anchorOffset, which is computed for
 * the anchorNode, won't naturally works with e.target.
 *
 * Furthermore, the current piece of the source is a special
 * case, as it isn't wrapped in a single <span> like all the
 * others. It requires ajustement to get the <span> covering
 * the piece, and further adjustement to get the correct
 * offset.
 *
 * NOTE: getSelection() is triggered on mouseup, so things
 * would break were we to listen on mousedown.
 *
 * @param{Event} e          - click event
 * @param{HTMLElement} psrc - pointer to psrc.
 * @returns{[HTMLElement, HTMLElement, number]|undefined} -
 * undefined if there's no range, and if thus we can't compute
 * the offset. Otherwise, array containing:
 *	[
 *		pointer to piece element where the click happened,
 *		point to either psrc/ptr (ie. previous element's parent)
 *		actual byte offset,
 *	]
 */
function countbyteoffset(e, psrc) {
	// We're listening on the whole document: avoid raising
	// warnings when there's no selection/anchorNode (happens).
	if (!window)       return undefined;

	var s = window.getSelection();
	if (!s)            return undefined;
	if (!s.anchorNode) return undefined;

	var a = s.anchorNode;
	var i = s.anchorOffset;

	// Anchor node may have a few other text sibling, so first,
	// make offset relative to anchor's node parent
	i += counttextoffset(a);

	// Grab the Element covering the Text node pointed by the
	// anchorNode and the parent of that Element, and its parent
	var t = /** @type{HTMLElement} */ (a.parentElement);
	var p = /** @type{HTMLElement} */ (t.parentNode);

	// Current node in src is always the only child of src
	// being split in 3 <spans>.
	if (p.parentNode == psrc) {
		// make it relative to pieces
		i += countpieceoffset(t);
		t = p;

		p = /** @type{HTMLElement} */ (t.parentNode);
	}

	// Make offset relative to current chunk
	i += countpieceoffset(t);

	return [p, t, i];
}

/**
 * Toggle an element's visibility when clicking on
 * an other element.
 *
 * Input:
 * @param{HTMLElement} m - element to update according to n's visibility (e.g. link/button)
 * @param{HTMLElement} n - element for which we want to toggle visibility
 * @param{string}      h - m's content if we hide n
 * @param{string}      s - m's content if we show n
 *
 * @returns{void}
 */
function togglefromlink(m, n, h, s) {
	/* hidden; show */
	if (n.style.display == 'none') {
		n.style.display = '';
		m.innerText     = h;
	}

	/* shown; hide */
	else {
		n.style.display = 'none';
		m.innerText     = s;
	}
}

/**
 * Wraps p.closest() with Assert and casts to HTMLElement.
 *
 * @param{HTMLElement}   p
 * @param{string}        s - selector
 * @returns{HTMLElement}
 */
function closest(p, s) {
	var q = /** @type{HTMLElement} */ (p.closest(s));
	if (!q) {
		console.log(p);
		Assert.assert("No closest such as "+s);
		// @ts-ignore
		return;
	}
	return q;
}

/**
 * Same as closest(), but for querySelector()
 *
 * @param{HTMLElement}   p
 * @param{string}        s - selector
 * @returns{HTMLElement}
 */
function queryselector(p, s) {
	var q = /** @type{HTMLElement} */ (p.querySelector(s));
	if (!q) {
		Assert.assert("No children such as "+s);
		// @ts-ignore
		return;
	}
	return q;
}

/**
 * Retrieve HTMLElement target of the given event.
 *
 * Typescript noise.
 *
 * @param{Event} e - event to check
 * @returns{HTMLElement}
 */
function gettarget(e) {
	return /** @type{HTMLElement} */ (/** @type{UIEvent} */ (e).target);
}

/**
 * Ensure the p.children[i] is ~at the middle of the screen,
 * assuming p is a scrollable element.
 *
 * This is practically good enough.
 *
 * @param{HTMLElement} p - container
 * @param{number}      i - p's i-th children should be visible.
 */
function scrollintoview(p, i) {
	var x = /** @type{HTMLElement} */ (p.children[i]);
	p.scrollTop = x.offsetTop - p.offsetTop - (p.offsetHeight/2);
}

/**
 * Grab concerned element or throw
 *
 * NOTE: View*.mk(...ids.map(getbyid), ...) won't
 * work unless we play magic.
 *
 * @param{string} id
 * @returns{HTMLElement}
 */
function getbyid(id) {
	var n = document.getElementById(id);
	if (!n) {
		Assert.assert('#'+id+' not found');
		// @ts-ignore
		return;
	}

	return n;
}

/**
 * Create an <audio> element linking to external .mp3 pinyin files.
 *
 * @param{Array<[string, string]>} ss - file name|info / url for each sound to play.
 * @returns{HTMLAudioElement}  - Audio element ready to start sequentially
 *                               playing all pinyin.
 */
function mksound(ss) {
	// Reasonable
	if (ss.length == 0) return new Audio();

	var a = new Audio(ss[0][1]);
	var i = 1;

	a.addEventListener('error', function() {
		var msg = ss[i-1][0]+" ("+a.src+")";

		if (a.error) switch(a.error.code) {
		case MediaError.MEDIA_ERR_ABORTED:
			msg = "aborted: "+msg;
			break;
		case MediaError.MEDIA_ERR_NETWORK:
			msg = "network error: "+msg;
			break;
		case MediaError.MEDIA_ERR_DECODE:
			msg = "broken file: "+msg;
			break;
		case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
			msg = "not found: "+msg;
			break;
		default:
			msg = "unexpected error code: "+a.error.code+" "+msg;

		}
		// a bit intrusive
		alert(msg);
	});

	a.addEventListener('ended', function() {
		a.pause();
		if (i < ss.length) {
			a.src =  ss[i++][1] || "";
			a.load();
			a.play()
		}

	});

	return a;
}

/**
 * Load the given font.
 *
 * @param{string} p - path to given font
 * @returns{Promise<any>}
 */
function loadfont(p) {
	// TODO: Utils.basename(path[, ext]) + tests.
	// e.g. /path/to/foo.ttf -> foo.ttf -> foo
	var n = (p.split("/").pop() || "undefined").split(".").shift() || "undefined";
	var f = new FontFace(n, 'url('+p+')');

	return f.load().then(function(x) {
		// XXX/TODO: https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/add,
		// yet: error TS2339: Property 'add' does not exist on type 'FontFaceSet'.
		// @ts-ignore
		document.fonts.add(x);
		getbyid("main").style.fontFamily = n;
		return true;
	}).catch(function(e) {
		alert(e);
		console.log(e);
		return false;
	});
}

/**
 * Creates a HTMLElement holding various images (e.g. strokes, ancient forms)
 * for the given chinese character.
 *
 * TODO: allow the creation of a grid of images instead of an array.
 * TODO: have a type for those [string, string] links.
 *
 * @param{Array<[string, string]>} imgs - links to images to be displayed
 * @param{boolean}                 single - if true, stops at first successfully loaded image
 * @param{string}                  c - class to assing img HTMLElement
 * @param{string}                  [err] - error message to display if all images failed.
 * @returns{HTMLElement}
 */
function mkimgs(imgs, single, c, err) {
	let y  = mkspan();

	// One item is expected later on.
	if (imgs.length == 0) return y; // mkspan(err, c);

	// true if at least one image was loaded.
	let ok = false;

	/**
	 * Callback based iteration:
	 *	- if single is true, iteration stops once an image
	 *	  has (sucessfully) been loaded
	 *	- if single is false, iteration keeps going until the end.
	 *	- an error message is displayed if no image was (successfully)
	 *	  loaded.
	 * @type{(i : number) => void }
	 */
	function addimg(i) {
		// we can't iterate further
		if (i == imgs.length) {
			// and no images have been successufully loaded
			if (!ok) y.appendChild(mkspan(err, c))
			return;
		}
		let z       = document.createElement("img");
		z.loading   = "lazy";
		z.src       = imgs[i][1];
		z.title     = imgs[i][0];
		z.alt       = "not found";
		z.className = c;
		z.onload    = function() { ok = true; if (!single) addimg(i+1); }
		z.onerror   = function() {
			console.log(imgs[i][1]+" failed; iterating");
			y.removeChild(z);
			addimg(i+1);
		}
		y.appendChild(z);
	}

	addimg(0);

	return y;
}

/**
 * Wraps the creation of an HTMLElement equipped a "build()"
 * "method". This is to isolate typescript noise.
 *
 * @param{string} t
 * @returns{BuildableHTMLElement}
 */
function mkbuildable(t) {
	let p = document.createElement(t);
	// @ts-ignore
	p.build = function(){}
	return /** @type{BuildableHTMLElement} */ (p);
}

/**
 * Wraps the creation of an HTMLElement equipped a "build()"
 * and a "move()" methods. Agaain, this is to isolate typescript noise.
 *
 * @param{string} t
 * @returns{MovableBuildableHTMLElement}
 */
function mkmovablebuildable(t) {
	let p = document.createElement(t);
	// @ts-ignore
	p.build = function(){}
	// @ts-ignore
	p.move  = function(){}
	return /** @type{MovableBuildableHTMLElement} */ (p);
}


export {
	isshown,
	show,
	hide,
	showfirst,

	loading,
	loaded,

	togglefromlink,
	scrollintoview,

	countpieceoffset,
	countbyteoffset,

	mkspan,
	mke,
	mka,
	mkselect,
	mkdash,
	mktoc,

	alisten,

	gettarget,

	getbyid,

	hidechildren,

	closest,
	queryselector,

	mksound,
	mkimgs,

	loadfont,

	mkbuildable,
	mkmovablebuildable,
};
