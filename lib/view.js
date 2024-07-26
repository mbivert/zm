let View = (function() {
/*
 * Core UI code containing the main "components".
 */

/*
	TODO: remove id used for style (no?), rework css, class names, naming,
	code organization & cie, thorough testing.

	TODO: still a click-moving bug on e.g. (long line)
		http://localhost:8001/book.html#c=198;w=41;b=shuo-wen-jie-zi

	TODO: the logic behind hidding decomposition by default is
	still foggy.

	TODO: we should re-import the code related to cutting/joining
	pieces

	TODO: why aren't books in data.js?

	TODO: listenforcache (state <-> URL)
		Underlying logic is a bit foggy.
		For now, basic caching (the one we had before) works (index.js)

		TODO: how do we handle state dumping for multiple singles
		on the same page?

	TODO: keyboard events handling could be refined further

	TODO: https://news.ycombinator.com/item?id=35108672
		https://www.joshwcomeau.com/react/common-beginner-mistakes/

	TODO: can we factorize book/trbook.js ?
		-> Yes, probably, but for now this should be good
		enough.
*/

/*
 * "Components":
 * -----------
 *
 * We follow a framework-less design, where each "component"
 * is represented by a function.
 *
 * The function returns an HTMLElement (a DOM node) and usually
 * takes as arguments:
 *	- a shared "state" (sometimes just a configuration), often called "S";
 *	- some options to configure the node
 *	- some additional arguments when needed
 *
 * Furthermore, the returned HTMLElement often is augmented with
 * a "build()" function so as to be able to re-render the node
 * from anyone (e.g. a parent node) who keeps a pointer to this node.
 *
 * Such building operation are (almost?) always performed by
 * ancestors.
 *
 * For more on this aspect of the design, see this article:
 *	https://tales.mbivert.com/on-frameworkless-js/
 */

/*
 * mksingle() / mksinglenav()
 * --------------------------
 *
 * This file is rather big; one reason is that there is
 * an interdependance between two main components, mksingle()
 * and mksinglenav(), which are standalone components respectively
 * allowing to inspect a single word, or a single sentence.
 *
 * The interdependance arises on one side from the fact that
 * mksinglenav() essentially is an extension of mksingle(),
 * and on the other side from the fact that some dictionaries
 * entries of a mksingle() can themselves be mksinglenav()
 * (this happens e.g. with the Shuo Wen, whose entries can
 * be navigated).
 *
 * While mutually recursive modules should be supported, I
 * prefered to keep them mixed here.
 */

/*
 * mkvcuts() (Decomposition grid)
 * ------------------------------
 *
 * The most sophisticated and most important component is the
 * decomposition grid, used to decompose a word, display its
 * definitions, etc.
 *
 * It is often referred to as a "vcuts" (list of "vcut"), and
 * is always created alongside a "stack", which allows to switch
 * between the decomposition grid (the vcuts) of multiple words
 * at once.
 *
 * A precise vocabulary is used to describe each part of the
 * decomposition grid (the vcuts). Each such part is described
 * by a component, that is, by a function, as previously described.
 *
 * Here's how the decomposition grid is architectured; you may want to
 * open a web page, such as https://zhongmu.eu/help.html to help with it.
 *
 *                              ***
 *
 * The "decomposition grid" is a vcuts (Classes.vcuts, vertical cuts).
 *
 *	-> 'function mkvcuts('
 *
 * TODO: this needs to be adjusted following some of the recent
 * simplification.
 *
 * A vcuts (':/function mkvcuts\(') is a list of vcut (Classes.vcut).
 *
 * A vcut contains:
 *	- a word (Classes.word)
 *	- a hcut (Classes.hcut, horizontal cut)
 *
 * A hcut contains:
 *	- a descr   (Classes.descr,   description)
 *	- a decomps (Classes.decomps, decompositions)
 *
 * A descr contains:
 *	- a header  (Classes.descrheader)
 *	- a content (Classes.descrcontent)
 *
 *     A header is a list of tabitems (Classes.tabitms).
 *
 *         A tabitems:
 *         - contains a list (Classes.tabitms of tabitem (Classes.tabitm)
 *         - can be active/inactive (Classes.tabactive)
 *
 *         A tabitem can refer to:
 *         - a tabitmdata   via its tabdata   attribute's value (Attrs.tabdata)
 *         - a tabitmdecomp via its tabdecomp attribute's value (Attrs.tabdecomp)
 *
 *         Note that while the tabitm data are stored in hcut -> descr -> content,
 *         the tabitmdecomp are stored in hcut -> decomps.
 *
 *         The first tabitems in a header always only contains tabitem
 *         refering to decompositions; while others only refers to
 *         datas.
 *
 *         A data is here, for now, either:
 *         - a dictionnary entry
 *         - some images
 *         - some external links.
 *
 *     A content is a list of tabitmdata. Only one tabitmdata is
 *     displayed at a time. A tabitmdata has a an attribute that is
 *     used to match it with a tabitm (Attrs.tabitmdata).
 *
 * A decomps is a list of tabitmdecomp. The first tabitmdecomp is always
 * a special entry that is used to hide decomposition display.
 *
 * Thus, as for the tabitmdata, there's only a single displayed
 * tabitmdecomp. And each tabitmdecomp has an attribute (Attrs.tabdecomp)
 * allowing to match it with a tabitm.
 *
 * Each tabitmdecomp contains a list of vcut (a vcuts then).
 */

/*
 * "Tab" management
 * ----------------
 *
 * When decomposing a word, there is a possibility to display
 * various meta-data related to the word, from definitions to
 * decompositions, and so forth.
 *
 * A high-level "tabs" configuration allows to configure the UI,
 * and determine what meta-datas are available for display.
 *
 * The tabs are described by a list of "tabitms", where each
 * such tabitms is a list of tabitm. Here a schematic example
 * of this "list of list".
 *
 * [
 *	[ decomposition0, decomposition1 ],
 *	[ defs0 ]
 *	[ imgs0, imgs1 ]
 *	[ links0 ]
 * ]
 *
 * - By convention, the first tabitms only contain, and is the
 * only tabitms to contain decompositions.
 *
 * When I say "by convention", I mean that this isn't really
 * enforced in the code (e.g. typechecking), but the code
 * regularly assumes this to be true.
 *
 * - For all the other tabitms, there's a notion of being active.
 * TODO
 * This allows switching back and forth between tabs in what intuition
 * demands.
 *
 *
 * To make the UI visually more compact, and avoid displaying
 * empty data, we have to
 *
 *	- for all but the first tabitms, there is a notion of an
 *	active tabitms (TODO document further)
 *	- this notion of active tabitms is handled at the zm-header
 *	level, because we follow the principle "children don't interact
 *	with each other directly": as the state of this property depends
 *	on all the siblings, it is handled by the parent;
 *	- the rotation of links within a tabitms is handled at the
 *	zm-tabitms level, but is triggered at the zm-header level,
 *	as it depends on the active state (rotation iff the tabitms
 *	is already active);
 */

/*
 * Caching
 * -------
 *
 *	- When moving from a tabitm to another, or from a word to
 *	another, the state of decomposition/study of each word
 *	is cached (meaning, the state of the decomposition grid is
 *	saved on a per-word basis).
 *	- The mechanism/format is identical as the state dumping one,
 *	only with a subset of the data.
 */

/**
 * Create HTML to hold a single definition associated to
 * a sound entry.
 *
 * @param{HTMLElement}    p - where to add the sound entry
 * @param{string} d - definition
 * @returns{HTMLElement}
 */
function mkdictsoundentrydef(p, d) {
	// Tokenize it
	var ts = Data.tokenize(d);

	var pinyin = false;
	ts.forEach(/** @param{Token} t */ function(t) {
		switch(t.t) {
		case TokenType.Word:
			if (Object.keys(t.d).length > 0) {
				p.appendChild(Dom.mka(t.v, Classes.defword));
				break;
			}
			if (pinyin) {
				p.appendChild(Dom.mkspan(Utils.pinyinn2a(t.v)));
				break;
			}
			// fallthrough
		case TokenType.Punct:
			if (t.v == '[') pinyin = true;
			if (t.v == ']') pinyin = false;
			// fallthrough
		default:
			p.appendChild(Dom.mkspan(t.v));
			break;
		}
	});
	p.appendChild(Dom.mkspan(" / "));

	return p;
}

/**
 * Create HTML to hold a DictSoundEntry.
 *
 * @param{HTMLElement} p - where to add the sound entry
 * @param{DictSoundEntry} d - dict entry from which to extract a sound entry
 * @param{string}      s - sound
 * @returns{HTMLElement}
 */
function mkdictsoundentry(p, d, s) {
	let q = document.createElement("b");

	// Lightly emphasizes tweaked entries.
	if (d.tw) p.style.fontStyle = "italic";

	q.innerText = "["+Utils.pinyinsn2a(s)+"]";
	p.appendChild(q);
	let a = Dom.mka("🔊", Classes.audio, "", s+", via "+User.prefs.audio);
	a.setAttribute(Attrs.pinyins, s);
	q.appendChild(a);

	p.appendChild(Dom.mkspan("/ "));

	// For each definition having this pinyin
	for (var i = 0; i < d.ds.length; i++)
		mkdictsoundentrydef(p, d.ds[i]);

	return p;
}

/**
 * Create HTML to hold a single DictEntry.
 *
 * @param{DictEntry} ds
 * @returns{HTMLElement}
 */
function mkdictentry(ds) {
	var p = document.createElement("span");

	// NOTE: a bit of a hack: ds contains "raw", unchained entries, we
	// need/want to chain them on-the-fly before presenting them to the
	// user. But Dict.chain() expects a DictsEntries, not a DictEntry, so
	// we wrap things in a dumb, temporary wrapper.
	var [xs, ms] = Dict.chain(/** @type{DictsEntries} */ ({"auto":ds}), ["auto"]);

	// TODO: log and notify user about the missing entries: it
	// indicates that the user needs to update his patch(es).
	if (ms.length) console.log(ms);

	// For each pinyin
	Object.keys(xs).sort().forEach(function(s) {
		// TODO/XXX I *think* this can happen when a patches removes
		// everything; we need to test this
		if (xs[s].length == 0) return;

		// xs[s] contains a DictSoundEntries. But because
		// we've just chained things, there's only one ([0])
		// DictSoundEntry remaining here.
		mkdictsoundentry(p, xs[s][0], s);
	});

	return p;
}

/**
 * Creates a HTMLElement holding navigable dictionary content
 * for x.
 *
 * @param{TabItmConf} c
 * @param{VCutState} S
 *
 * @returns{HTMLElement}
 */
function mknavdict(c, S) {
	// Safety as tab config is not strictly typed
	if (!c.dict) {
		Assert.assert("No .dict in tab configuration");
		return document.createElement("span");
	}

	// XXX
	let s = S.tok.d[c.dict]["xx5"][0].ds[0];

	console.log("mknavdict", s, S);

	return mksinglenav(s, S);
}

/**
 * Creates a HTMLElement holding navigatable dictionary content
 * for x.
 *
 * @param{TabItmConf} c
 * @param{VCutState} S
 *
 * @returns{HTMLElement}
 */
function mkdictschain(c, S) {
	if (!c.dicts) {
		Assert.assert("No .dicts in tab configuration");
		// @ts-ignore
		return;
	}

	if (c.dicts.length == 0)
		return Dom.mkspan("empty dicts chain!");

	var [ds, ms] = Dict.chain(S.tok.d, c.dicts);

	// TODO: show to user somewhere; seems to be triggered
	// e.g. on 寧
	if (ms.length) console.log(ms);

	return mkdictentry(ds);
}

/**
 * Creates a HTMLElement holding dictionary content for x.
 *
 * @param{TabItmConf} c
 * @param{VCutState}  S
 *
 * @returns{HTMLElement}
 */
function mkdict(c, S) {
	if (!c.dict) {
		Assert.assert("No .dict in tab configuration");
		// @ts-ignore
		return;
	}
	return mkdictentry(S.tok.d[c.dict]);
}

/**
 * Creates a HTMLElement holding images (e.g. strokes, seal scripts, etc.)
 * for x.
 *
 * NOTE: we may want to use the ../../getstrokes.sh to either avoid
 * sending useless requests and/or have a local copy of the files.
 * For now, we don't have that much users, but it's a bit rude.
 * Same goes for the audio files.
 *
 * @param{TabItmConf} c
 * @param{VCutState}     S
 *
 * @returns{HTMLElement}
 */
function mkimgs(c, S) {
	if (!c.imgs) {
		Assert.assert("No .imgs in configuration");
		// @ts-ignore
		return;
	}

	return Dom.mkimgs(
		Links.mget(c.imgs, S.tok.v, "imgs"),
		c.single || false,
		Classes.strokesimg,
		'no images available',
	);
}

/**
 * Create a HTMLElement holding (external) links related to x.
 *
 * @param{TabItmConf} c
 * @param{VCutState}  S
 *
 * @returns{HTMLElement}
 */
function mklinks(c, S) {
	if (!c.links) {
		Assert.assert("No .links in tab configuration");
		return document.createElement("span");
	}

	var ls = Links.mget(c.links, S.tok.v, "links");

	var p = document.createElement('ul');

	for (var i = 0; i < ls.length; i++) {
		var q = document.createElement('li');
		q.appendChild(Dom.mka(ls[i][0], "", ls[i][1]));
		p.appendChild(q);
	}

	return p;
}

/**
 * Create a HTMLElement holding x's decomposition.
 *
 * @param{TabItmConf} c
 * @param{VCutState}  S
 *
 * @returns{HTMLElement}
 */
function mkdecomp(c, S) {
	// Safety as tab config is not strictly typed
	if (!c.decomp) {
		Assert.assert("No .decomp in tab configuration");
		return Dom.mkspan('');
	}

	return mkvcuts({
		stack    : S.stack,
		cache    : S.cache,
		tabsconf : S.tabsconf,
		hasstack : false,
		ts       : (S.tok.c[c.decomp][0].c || []).map(function(c) {
			return Data.cut(c.v)[0];
		})
	});
}

/**
 * Functions store to manipulate tabs.
 *
 * @type{Object.<string, Tab>}
 */
var tabs = {
	[TabType.Decomp]     : {
		mk  : mkdecomp,
		has : function(c, x) {
			return (x.c[c.decomp || ""] || []).length > 0;
		},
	},
	[TabType.Dict]       : {
		mk  : mkdict,
		has : function(c, x) {
			return Object.keys(x.d[c.dict || ""] || {}).length > 0;
		},
	},
	[TabType.NavDict] : {
		mk  : mknavdict,
		has : function(c, x) {
			return Object.keys(x.d[c.dict || ""] || {}).length > 0;
		},
	},
	[TabType.DictsChain] : {
		mk  : mkdictschain,
		has : function(c, x) {
			if (!c.dicts) return false;
			for (var i = 0; i < c.dicts.length; i++)
				if (c.dicts[i] in x.d) return true;
			return false;
		},
	},
	[TabType.Imgs]       : {
		mk  : mkimgs,
		has : function(c, x) { return [...x.v].length == 1; },
	},
	[TabType.Links]      : {
		mk  : mklinks,
		has : function(c, x) { return true; },
	},
};

/**
 * Recall:
 *	S.tok : token
 *	S.cs  : configuration associated to the tabitms
 *	S.i   : tabitms index (locally constant)
 *	S.j   : currently enabled tabitm for current tabitms, may be
 *	        changed on click.
 *
 * @param{TabItmsState} S
 * @returns{MBuildableHTMLElement}
 */
function mktabitms(S) {
	// S.cs is a shortcut for S.tabsconf.confs[S.i][S.j] XXX (?)

	// By convention, first tab is the only one containing
	// decomposition tables.
	let isdecomp = (S.i == 0);

	let b = countenabled();

	// None enabled
	if (b == 0) return Dom.mkspan(
		isdecomp ? "[+]" : S.cs[0].name,
		Classes.tabitms,
	);

	// This'll be completed shortly
	let p = Dom.mka("", Classes.tabitms, undefined, "");

	// Enables special CSS rule to make the element fixed-size
	// TODO: move to classes.js
	// (we could tweak also the bare <span> version)
	if (isdecomp) p.classList.add("zhongmu-tabitms-decomp");

	p.setAttribute(Attrs.itmscount,  b.toString());
	if (b > 1) p.classList.add("zhongmu-with-after");

	/**
	 * @returns{number}
	 */
	function countenabled() {
		let [_x, b, _y, _z] = nextenabled(S.cs, S.tok, -1);
		return b;
	}

	/**
	 * Retrieve the next tabitm enabled after the j-th.
	 *
	 * The first one is returned iff j < 0.
	 * If j > 0, the code assumes that cs[j] is enabled.
	 *
	 * Hence, if we found no cs[k], k > j, enabled, then
	 * we look loop to the first one.
	 *
	 * @param{TabItmsConf} cs
	 * @param{Token} t
	 * @param{number} j
	 * @returns{[number, number, number, boolean]}
	 */
	function nextenabled(cs, t, j) {
		let hasloop = false;
		let b = 0;
		let a = 0;
		let l = -1;

		for (let k = 0; k < cs.length; k++)
			if (tabs[cs[k].type].has(cs[k], t)) {
				b++;
				if (k > j && l == -1) { a = b; l = k;};
			}

		if (l == -1 && j >= 0) {
			[a, b, l] = nextenabled(cs, t, -1);
			hasloop = true;
		}
		return [a, b, l, hasloop];
	}

	// XXX zhongmu-tabitms/zhongmu-tabitm attrs/classes removed
	function setup() {
		p.addEventListener("click", function(e) {
			e.preventDefault(); e.stopPropagation();
			p.dispatchEvent(new CustomEvent("zm-tabitms-click", {
				bubbles : true,
				detail  : { i : S.i, j : S.j },
			}));
		});
	}

	/**
	 * @param{boolean} firstbuild
	 * @returns{number}
	 */
	function build(firstbuild) {
		let [a, b, j, hasloop] = nextenabled(S.cs, S.tok, S.j);

		S.j = j;
		let c = S.cs[j];

		// special case: j === undefined iff first build,
		// where we want decomposition to be hidden.
		if (isdecomp && firstbuild)
			hasloop = true;

		p.innerText = isdecomp ? (hasloop ? "[+]"  : "[-]") : c.name;
		p.title     = c.name;

		// Hide decomposition
		if (isdecomp && hasloop) S.j = -1;

		// Set counters and display them iff we have more
		// than one enabled tabitm.
		// TODO: rename attribute to reduce confusion with tabitms/tabitm
		p.setAttribute(Attrs.currentitm, a.toString());

		return S.j;
	}

	// @ts-ignore
	p.build = build;

	setup();
	build(true);

	return p;
}

/**
 * Recall
 *	S.tok : current token
 *	S.tabsconf.confs: configurations for tabitms/tabitm
 *
 *	S.states = [ j0, j1, ... ];
 *	S.active = i2;
 *
 * @param{TabItmsStates} S
 * @returns{BuildableHTMLElement}
 */
function mkheader(S) {
	let p = Dom.mkbuildable("div");
	p.classList.add(Classes.descrheader);

	/**
	 * @param{number} i
	 * @param{number} j
	 * @returns{void}
	 */
	function toggleactive(i, j) {
		p.children[S.active].classList.remove(Classes.tabactive);
		p.children[i].classList.add(Classes.tabactive);
		S.active = i;
		S.states[S.active] = j;
	}

	/**
	 * @returns{void}
	 */
	function setup() {
		let [tc, t] = [S.tabsconf, S.tok];
		let css = tc.confs;

		p.addEventListener("zm-tabitms-click", function(ev) {
			// For typescript: we're sure this really is a CustomEvent
			// (and thus that it carries a .detail field)
			let e = /** @type{CustomEvent} */ (ev);

			// NOTE: we let the event bubble up, but its detail.i/detail.j
			// are "incorrect" from now on, and one should refer
			// to the shared state instead.

			let i = e.detail.i;
			let j = e.detail.j;

			let isactive = i == S.active;
			let isdecomp = i == 0;

			if (!isdecomp) {
				if (i >= p.children.length || i < 0) {
					Assert.assert("Invalid tabitms index '"+i+"'");
					// @ts-ignore
					return;
				}
				let q = /** @type{BuildableHTMLElement} */ (p.children[i]);
				if (q === undefined) {
					// @ts-ignore
					return;
				}

				// If tabitms is already active, rotate
				// XXX for some reasons, typescript thinks q can be undefined,
				// despite the previous check on 'i'.
				if (q !== undefined && isactive) S.states[S.active] =
					/** @type{number} */ (q.build());

				// Otherwise, enable it
				else          toggleactive(i, j);

			// There's no notion of active decomposition tabitms
			} else S.states[0] =
				(/** @type{BuildableHTMLElement} */ (p.children[0])).build();
		});
	}

	/**
	 * @returns{void}
	 */
	function build() {
		// css for "array of cs", not style/CSS related
		let css = S.tabsconf.confs;

		p.innerHTML = '';

		for (let i = 0; i < css.length; i++)
			// When there's a state for the i-th tabitms, we want
			// to display its j-th tabitm; if a non-undefined
			// j is provided to the build(), it'll rotate to the first
			// tabitm enabled (strictly) after the j-th, hence -1 to
			// enable the j-th one.
			//
			// If there's no states for the i-th tabitms, -2 do as
			// well as -1.
			p.appendChild(mktabitms(Object.assign({}, S, {
				cs: css[i], i: i, j: (S.states[i] || -1)-1,
			})));

		toggleactive(S.active, S.states[S.active]);
	}

	// @ts-ignore
	p.build = build;

	setup();

	// Let parent initiate the build (S.i / S.j unset so far) (XXX)

	return p;
}

/**
 * @param{VCutState} S
 * @param{{class : string}} n
 * @returns{BuildableHTMLElement}
 */
function mktabcontent(S, n) {
	let p = Dom.mkbuildable("div");

	p.classList.add(n.class);

	/**
	 * @param{number} i
	 * @param{number} j
	 * param{any}    args
	 * @returns{void}
	 */
	function build(i, j /*, ...args */) {
		let c = S.tabsconf.confs[i][j];

		p.innerHTML = '';

		let q = tabs[c.type].mk(c, S /*, ...args */);
		p.appendChild(q);
		// NOTE: .focus() for keyboards events on navdict
		q.focus();
	}

	// @ts-ignore
	p.build = build;

	// NOTE: building delegated to parent, once S has been adjusted.

	return p;
}

/**
 *
 * @param{VCutState} S
 * @returns{HTMLElement}
 */
function mkword(S) {
	let p = document.createElement("div");

	let w = S.tok.v;
	let c = S.tabsconf.word;

	/** @returns{HTMLElement} */
	function mktext() {
		let q = Dom.mke('div', undefined, Classes.wordtext);
		q.appendChild(Dom.mke('span', w));
		let r = Dom.mke('sup', '', Classes.wordtextsup);
		r.appendChild(Dom.mka(w, Classes.defwordtop));
		q.appendChild(r);
		return q;
	}

	if (c.prependtext) p.appendChild(mktext());

	// NOTE: No need to check for [...w].length == 1 as this is
	// is already performed by Links.mget when it comes to images.
	p.appendChild(Dom.mkimgs(
		Links.mget(c.imgs, w, "imgs"),
		c.single || false,
		Classes.strokesimg,
		'-',
	));

	if (c.appendtext) p.appendChild(mktext());

	return p;
}

/**
 * @param{HCutState} S
 * @returns{HTMLElement}
 */
function mkhcut(S) {
	var p = document.createElement("div");

		var q = document.createElement("div");

			var pheader  = mkheader(S);
			var pcontent = mktabcontent(S, { class : Classes.descrcontent });

			q.classList.add(Classes.descr);
			q.append(pheader, pcontent);

		// TODO: s/decomps/decomp/
		var pdecomp = mktabcontent(S, { class : Classes.decomps });

	p.append(q, pdecomp);

	// We need a little wrapper for this one so as to manage
	// the extra caching arguments (ic/iw)
	function buildcontent() {
		/** @type{Array<number>} */
		let args = [];

		if (S.cache[S.tok.v])
		if (S.cache[S.tok.v].iciw)
		if (S.cache[S.tok.v].iciw[S.active])
		if (S.cache[S.tok.v].iciw[S.active][S.states[S.active]] !== undefined)
			args = S.cache[S.tok.v].iciw[S.active][S.states[S.active]];

		pcontent.build(S.active, S.states[S.active], ...args);
	}

	function listentabitm() {
		var [tc, t] = [S.tabsconf, S.tok];

		p.addEventListener("zm-tabitms-click", function(ev) {
			// We're sure this is a CustomEvent, hence that it
			// has a .detail field
			let e = /** @type{CustomEvent} */ (ev);

			e.preventDefault(); e.stopPropagation();
			var isdecomp = e.detail.i == 0;

			// special case
			if (isdecomp && S.states[0] == -1)
				pdecomp.innerHTML = "";
			else if (isdecomp)
				pdecomp.build(0, S.states[0]);
			else
				buildcontent();

			S.cache[S.tok.v] ||= {
				active : -1,
				states : [],
				iciw   : {},
			};
			S.cache[S.tok.v].active = S.active;
			S.cache[S.tok.v].states = S.states;

			p.dispatchEvent(new CustomEvent("zm-cache-update", {
				bubbles : true
			}));
		});

		// a hcut may contain a 'function mknavdict('; in which
		// case, we'll want to cache the current position, so as
		// to restore it when moving from tab to tab.
		p.addEventListener("zm-nav-move", function(ev) {
			// We're sure this is a CustomEvent, hence that it
			// has a .detail field
			let e = /** @type{CustomEvent} */ (ev);

			e.preventDefault(); e.stopPropagation();
			S.cache[S.tok.v] ||= {
				active : -1,
				states : [],
				iciw   : {},
			};
			S.cache[S.tok.v].iciw ||= {};
			S.cache[S.tok.v].iciw[S.active] ||= {};
			S.cache[S.tok.v].iciw[S.active][S.states[S.active]] = e.detail;

			p.dispatchEvent(new CustomEvent("zm-cache-update", {
				bubbles : true
			}));
		});
	}

	/**
	 * @param{Token} t
	 * @param{TabItmsConfs} cs
	 * @param{DefDispConf} ps
	 * @returns{[number|undefined, number|undefined]}
	 */
	function getdefaultdisp(t, cs, ps) {
		for (var i = 0; i < ps.length; i++)
		for (var j = 0; j < cs.length; j++)
		for (var k = 0; k < cs[j].length; k++)
			if (cs[j][k].name == ps[i])
			if (tabs[cs[j][k].type].has(cs[j][k], t))
				return [j, k];

		return [undefined, undefined];
	}

	function setup() {
		listentabitm();

		// TODO: check that those are within bounds.
		if (S.cache[S.tok.v]) {
			S.active = S.cache[S.tok.v].active;
			S.states = S.cache[S.tok.v].states;

			return;
		}

		var [i, j] = getdefaultdisp(
			S.tok,
			S.tabsconf.confs,
			S.tabsconf.defaultdisplay || []
		);

		if (i === undefined || j === undefined) {
			Assert.assert("TODO tabdefaultdisplay not found", i !== undefined);
			// @ts-ignore
			return;
		}

		S.active           = i;
		S.states[S.active] = j;
	}

	setup();

	pheader.build();
	buildcontent();

	if (S.states[0] !== undefined && S.states[0] != -1)
		pdecomp.build(0, S.states[0]);

	return p;
}

/**
 * @param{VCutState} S
 * @returns{HTMLElement}
 */
function mkvcut(S) {
	var p = document.createElement("div");
	p.classList.add(Classes.vcut);

	p.appendChild(mkword(S));
	p.appendChild(mkhcut(Object.assign({}, S, {
		active : -1,
	})));

	return p;
}

/**
 * Create a vcuts: a list of vcut (vertical cut). Each vertical
 * cut holds a word on one side of the cut, and random informations
 * about that word on the other side.
 *
 * @param{VCutsState} S
 * @returns{BuildableHTMLElement}
 */
function mkvcuts(S) {
	var p = Dom.mkbuildable("div");

	// TODO rename/document (at least used for help/kao)
	p.classList.add(Classes.vcuts);

	function build() {
		// XXX clarify when this actually happens, if ever.
		// (TODO: typically where we'll want a log)
		if (!S.ts) return;

		p.innerHTML = "";
		for (var i = 0; i < S.ts.length; i++)
			p.appendChild(mkvcut(Object.assign({}, S, {
				tok    : S.ts[i], vcutn : i,
				states : [],
			})));
	}

	p.build = build;

	build();

	return p;
}

/**
 *
 * @param{WithStack} S
 * @returns{BuildableHTMLElement}
 */
function mkstack(S) {
	var p = Dom.mkbuildable("div");

	// TODO rename/document (for now, only used to target
	// for style for help/kao)
	p.classList.add("zhongmu-stack");

	function build() {
		p.innerHTML = "";

		for (var i = 0; i < S.stack.xs.length; i++) {
			// Words are clickable, allowing to navigate the stack
			// TODO: rename decword -> stackword
			p.appendChild(Dom.mka(S.stack.xs[i], Classes.decword));

			// Words are separated by dashes
			if (i < S.stack.xs.length-1)
				p.appendChild(Dom.mkdash());
		}

		return p;
	}

	p.build = build;

	return p;
}

/**
 * Setup a stackvcuts component. This is to allow
 * components to embed a pstack/pvcuts (created from
 * mkstack/mkvcuts) without them being forced into
 * the HTML layouts of a stackvcuts.
 *
 * @param{BuildableHTMLElement} p
 * @param{VCutsState} S
 */
function setupstackvcuts(p, S) {
	function listendefword() {
		/**
		 * @param{Event} e
		 * @returns{boolean}
		 */
		function handler(e) {
			let s = Dom.gettarget(e).innerText;
			console.log("handling defword", e, s);
			if (S.stack.push(s)) p.build();
			p.dispatchEvent(new CustomEvent("zm-cache-update"));
			return false;
		}

		Dom.alisten(Classes.defword, handler, p);

		// Sub-stackgrids are automatically flagged as such
		// on creation; by design, defwordtop are always pushed
		// on the main (top) stack.
		if (!S.hasstack)
			Dom.alisten(Classes.defwordtop, handler, p);
	}

	function listendecword() {
		Dom.alisten(Classes.decword, function(e) {
			let s = Dom.gettarget(e).innerText;

			// Remove pointed element only
			// TODO: this is slightly incorrect, as
			// we're deleting the last occurence of s in
			// the stack instead of the clicked one.
			if (e.ctrlKey)           S.stack.del(s);

			// double click
			else if (e.detail >= 2)  S.stack.popto(s);

			// simple click: just move
			else                     S.stack.backto(s);

			p.build();

			p.dispatchEvent(new CustomEvent("zm-cache-update"));

			return false;
		}, p);
	}

	function listenaudio() {
		// Always only managed once, by the top grid
		if (!S.hasstack)
		Dom.alisten(Classes.audio, function(e) {
			let p  = Dom.gettarget(e);
			let xs = p.getAttribute(Attrs.pinyins) || "";

			// We may have multiple pinyin, eventually capitalized
			Dom.mksound(xs.toLowerCase().split(" ").reduce(
				/**
				 * @param{Array<[string,string]>} acc
				 * @param{string} x
				 * @returns{Array<[string,string]>}
				 */
				function(acc, x) {
					let l = Links.get(User.prefs.audio, x, "audio");
					acc.push([x, l ? l[1] : ""]);
					return acc;
				}, []
			)).play();
			return false;
		}, p);
	}

	function listenforcache() {
		// TODO: essentially, dump this to a string and store
		// to #, and make sure we can load state from # too.
/*
		p.addEventListener("zm-cache-update", function(e) {
			console.log(JSON.stringify(S.cache, null, 4));
			console.log(JSON.stringify(S.stack.xs, null, 4));
			console.log(JSON.stringify(S.stack.n, null, 4));
		});
*/
	}

	function setup() {
		listendefword();
		listendecword();
		listenaudio();
		listenforcache();

		// TODO: for instance, if you display a word's decomposition,
		// open it in a navdict, and encounter this word again in the
		// navdict, then we'll try to display the word using the caching
		// information for this word, and indefinitely recurse.
		//
		// Maybe we could be smarter, and offer a better UI, but for
		// now, this'll do.
		if (S.hasstack) {
			console.log("stackoverflow prevention");
			S.cache = {};
		}

		// inform later setupstackvcuts that there's a working
		// stack higher in the DOM (us).
		S.hasstack = true;
	}

	setup();
}

/**
 *
 * @param{VCutsState} S
 * @param{BuildableHTMLElement} pstack
 * @param{BuildableHTMLElement} pvcuts
 */
function buildstackvcuts(S, pstack, pvcuts) {
	let w = S.stack.current();

	// TODO: this e.g. happens in mkindex(); clarify
	if (w === undefined) return;

	S.ts = Data.cut(w);
	pstack.build();
	pvcuts.build();
}

/**
 * @param{VCutsState} S
 * @param{{class ?: string, nohelp ?: boolean}} [n]
 * @returns{BuildableHTMLElement}
 */
function mkstackvcuts(S, n) {
	let p = Dom.mkbuildable("div");
	n ||= {class : "", nohelp : false};

	if (n.class) p.classList.add(n.class);

	let pstack = mkstack(S);
	let pvcuts = mkvcuts(S);

	function build() { buildstackvcuts(S, pstack, pvcuts);  }

	if (!n.nohelp) p.appendChild(mkinlinehelp());

	p.appendChild(pstack);
	p.appendChild(pvcuts);

	p.build = build;

	setupstackvcuts(p, S);
	build();

	return p;
}

// a <span> containing a button and a modal. The former toggles
// visibility of the latter; the latter contains a closing button
// (but clicking outside the modal
// also exits it), and whatever's returned by n.f().

/**
 * param{} S
 * @param{MBuildableHTMLElement} r
 * @param{{class ?: string, text : string}} n
 * @returns{BuildableHTMLElement}
 */
function mkmodalbtnwith(r, n) {
	let p = Dom.mkbuildable("span");

		let b = document.createElement("button");
		b.innerText = n.text;
		if (n.class) b.classList.add(n.class);

		let m = document.createElement("span");
		m.style.display = "none";
		m.classList.add("zhongmu-modal");

			let q = document.createElement("span");
			q.classList.add("zhongmu-modal-content");

				let c = document.createElement("button");
				c.innerText = "×";
				c.classList.add("zhongmu-modal-close-btn");

				r.classList.add("zhongmu-modal-content");

			q.append(c, r);

		m.appendChild(q);

	p.append(b, m);

	function setup() {
		c.addEventListener("click", function(e) {
			e.preventDefault(); e.stopPropagation();
			Dom.hide(m);
		});
		b.addEventListener("click", function(e) {
			e.preventDefault(); e.stopPropagation();
			Dom.show(m);
		});

		// Clicking outside the modal when its displayed
		document.addEventListener("click", function(e) {
			let r = Dom.gettarget(e);

			if (Dom.isshown(m))
			if (!m.children[0].contains(r))
				Dom.hide(m);
		});
	}

	// NOTE: used for toc in pnav in view/book.js
	// TODO: f is useless, we could just create the element first
	// and thus avoid this
	function build() {
		// @ts-ignore
		if (r.build) r.build();
	}

	setup();

	p.build = build;

	return p;
}

/**
 * param{} S
 * @returns{HTMLElement}
 */
function mkhelp(/* S */) {
	var p = document.createElement("span");
	var q = document.createElement("span");

	q.innerHTML = `
		<h2>Why?</h2>
		<p>
			So far, mainly to help the study of written Chinese language;
			see the following article as an informal introduction:
		</p>
		<ul>
			<li>
				<b>English</b>:
				<a href="https://tales.mbivert.com/on-chinese-language/">On Chinese language</a>;
			</li>
			<li>
				<b>Français</b>:
				<a href="https://tales.mbivert.com/fr/du-chinois/">Du Chinois</a>.
			</li>
		</ul>

		<h2>How?</h2>
			<ul>
				<li>
					<span class="kao-word">Word being decomposed/analyzed;</span>
				</li>
				<li>
					<span class="kao-ancient-forms">Bronze and Seal ancient forms,
					if any;</span>hover to distinguish;
				</li>
				<li>
					<span class="kao-decomps">Toggle decomposition(s),
					if any (click to toggle);</span>
				</li>
				<li><span class="kao-stack">Inspected words stack</span>:
					<ul>
						<li>
							Try clicking on a <span class="kao-defword">word</span>
							or on a <span class="kao-defword-top">word</span>, for
							instance after having <span class="kao-decomps">toggled</span>
							decompositions;
						</li>
						<li>
							Single click on a <span class="kao-stack">word</span> to
							navigate within the stack;
						</li>
						<li>
							Double click on a <span class="kao-stack">word</span>
							to clear all words at its right;
						</li>
						<li>
							Click while pressing the ctrl key to remove a
							<span class="kao-stack">word</span> from the stack;
						</li>
					</ul>
				</li>
				<li>
					<span class="kao-tabs">Toggle definitions, images, etc.
					(click to toggle):</span>
					<ol>
						<li>
							Definitions (english and pictographic interpretations,
							if any);
						</li>
						<li>
							Inspectable ancient Chinese dictionary
							entry (<a href="https://en.wikipedia.org/wiki/Shuowen_Jiezi"
							title="→ wikipedia" class="wp-link">說文</a>), if any;

							<ul>
								<li>
									Click on the <span class="kao-arrows">arrows</span>
									or in the <span class="kao-dict-text">text</span>,
									or use the keyboard’s arrows to move;
								</li>
								<li>
									Note that it has its own
									<span class="kao-dict-stack">stack</span>;
								</li>
								<li>
									Clicks on <span class="kao-defword-top">words</span>
									will always use the <span class="kao-stack">main stack</span>,
									while clicks on <span class="kao-defword">words</span>
									will use the closest stack;
								</li>
							</ul>
						</li>
						<li>
							(Available) strokes and (all available) ancient forms;
							hover to distinguish;
						</li>
						<li>External links;</li>
					</ol>
				</li>
			</ul>`;

		let helptc = {
			"defaultdisplay" : ["defs", "links"],
			"word" : {
				"prependtext" : true,
				"single"      : false,
				"imgs"        : [ "wm-bronze", "wm-seal" ],
			},
			"confs" : [
				[
					{
						"name"   : "auto",
						// @ts-ignore
						"type"   : TabType.Decomp,
						"decomp" : "auto",
					},
					{
						"name"   : "wikimedia",
						// @ts-ignore
						"type"   : TabType.Decomp,
						"decomp" : "WM-decomp",
					},
					{
						"name"   : "zm-decomp",
						// @ts-ignore
						"type"   : TabType.Decomp,
						"decomp" : "ZM-decomp",
					},
				],
				[
					{
						"name"   : "defs",
						// @ts-ignore
						"type"   : TabType.DictsChain,
						"dicts"  : ["CC-CEDICT", "ZM-add", "CC-CEDICT-singles"],
					},
					{
						"name"   : "pict",
						// @ts-ignore
						"type"   : TabType.Dict,
						"dict"   : "ZM-pict",
					}
				],
				[{
					"name"   : "說文",
					// @ts-ignore
					"type"   : TabType.NavDict,
					"dict"   : "WS-shuowen",
					"tabs"   : {
						"word" : {
							"prependtext" : true,
							"single"      : false,
							"imgs"        : [ "wm-seal" ],
						},
						"confs"          : undefined,
						"defaultdisplay" : undefined,
					},
				}],
				[
					{
						"name"   : "imgs",
						// @ts-ignore
						"type"   : TabType.Imgs,
						"single" : true, // stop loading image once one succeeded.
						"imgs"   : [ "wm-bw-gif", "wm-red-static", "wm-bw-static" ],
					},
					{
						"name"   : "olds",
						// @ts-ignore
						"type"   : TabType.Imgs,
						"single" : false,
						"imgs"   : [
							"wm-oracle", "wm-bronze",
							"wm-silk",   "wm-seal",
							"wm-bigseal"
						],
					},
				],
				[{
					"name"   : "links",
					// @ts-ignore
					"type"   : TabType.Links,
					"links"  : [
						"chinese-characters.org",
						"zhongwen.com",
						"en.wiktionary.org",
						"zdic.net",
						"...",
					],
				}],
			],
		};
		p.appendChild(q);

		let r = mksingle("考", /** @type{TabsConf} */ (helptc), true);
		r.id = "kao";

		p.appendChild(r);
	return p;
}

/**
 * @returns{BuildableHTMLElement}
 */
function mkinlinehelp(/* S */) {
	return mkmodalbtnwith(/* S, */ mkhelp(/* S */), {
		text : "?", class : "zhongmu-help-btn"
	});
}

/**
 * ccc : current chunk container
 * @param{WithMove} S
 * @returns{BuildableHTMLElement}
 */
function mkbasiccc(S) {
	var p = Dom.mkbuildable("div");

	function build() {
		// TODO: this happens e.g. in mkindex(); clarify
		if (!S.move.cs)
			return;

		// Current chunk content, length
		// We need an utf8 character array for slicing
		// to work properly, e.g. bugs on 𡕥：舉
		var s = [...S.move.cc().v];
		var n = s.length;

		// Current word slicing integers
		var [i, j] = [S.move.cw().i, S.move.cw().j];

		p.innerHTML = "";
		p.append(
			Dom.mkspan(s.slice(0, i).join("")),
			Dom.mkspan(s.slice(i, j).join(""), Classes.hlcw),
			Dom.mkspan(s.slice(j, n).join("")),
		);
	}

	function setup() { listenmousemove(p); }

	p.build = build;

	setup();
	build();

	return p;
}

/** @param{HTMLElement} p */
function listenmousemove(p) {
	p.addEventListener("click", function (e) {
		// Those are handled by handlepiece() (TODO)
		if (e.ctrlKey) return;

		let x = Dom.countbyteoffset(e, p);
		e.stopPropagation();
		if (x) p.dispatchEvent(new CustomEvent("zm-mouse-move", {
			bubbles : true,
			detail : x[2],
		}));

	});
}
var mainhandler = false;

/**
 * @param{MMovableBuildableHTMLElement} p
 * @param{HTMLElement} psrc
 * @param{SingleNavState} S
 * @param{string} keys
 * @returns{void}
 */
function setupwithnav(p, psrc, S, keys) {
	keys ||= "basic";

	/**
	 * @param{MoveDir} d
	 * @param{MoveWhat|number} w
	 * @returns{void}
	 */
	function moveandbuild(d, w) {
		// s/move/mover/
		var [ic, iw] = p.move ? p.move(d, w) : S.move.move(d, w);

		if (ic == -1        || iw == -1)        return;
		if (S.move.ic == ic && S.move.iw == iw) return;

		S.move.ic = ic;
		S.move.iw = iw;
		S.stack.reset(); S.stack.push(S.move.cwv());
		p.build();
		p.dispatchEvent(new CustomEvent("zm-nav-move", {
			bubbles : true,
			detail : [S.move.ic, S.move.iw],
		}));
	}

	function listenmousemove() {
		psrc.addEventListener("zm-mouse-move", function(ev) {
			let e = /** @type{CustomEvent} */ (ev);
			moveandbuild(/** @type{MoveDir} */ (MoveDir.Offset), e.detail);
			e.stopPropagation();
			e.preventDefault();
		});

	}

	/* @type{Object.<string, Array<{ k : string, m : string, d : MoveDir, w : MoveWhat }>>} */
	/** @type{Object.<string, Array<{ k : string, m : string, d : string, w : string }>>} */
	var kmvs = {
		"basic" : [
			{ k : "ArrowRight", m : "alt",  d : MoveDir.Next, w : MoveWhat.Chunk },
			{ k : "ArrowRight", m : "",     d : MoveDir.Next, w : MoveWhat.Word  },
			{ k : "ArrowLeft",  m : "alt",  d : MoveDir.Prev, w : MoveWhat.Chunk },
			{ k : "ArrowLeft",  m : "",     d : MoveDir.Prev, w : MoveWhat.Word  },
		],
		"onechunk" : [
			{ k : "ArrowRight", m : "",     d : MoveDir.Next, w : MoveWhat.Word  },
			{ k : "ArrowLeft",  m : "",     d : MoveDir.Prev, w : MoveWhat.Word  },
		],
		"pcs" : [
			{ k : "ArrowRight", m : "alt",  d : MoveDir.Next, w : MoveWhat.Chunk },
			{ k : "ArrowRight", m : "ctrl", d : MoveDir.Next, w : MoveWhat.Piece },
			{ k : "ArrowRight", m : "",     d : MoveDir.Next, w : MoveWhat.Word  },
			{ k : "ArrowLeft",  m : "alt",  d : MoveDir.Prev, w : MoveWhat.Chunk },
			{ k : "ArrowLeft",  m : "ctrl", d : MoveDir.Prev, w : MoveWhat.Piece },
			{ k : "ArrowLeft",  m : "",     d : MoveDir.Prev, w : MoveWhat.Word  },
		],
	};

	function listenkeymove() {
		psrc.addEventListener("keydown", function(e) {
			var q = Dom.gettarget(e);

			for (var i = 0; i < kmvs[keys].length; i++) {
				if (e.key != kmvs[keys][i].k)                        continue;
				if ((kmvs[keys][i].m || "") == "ctrl" && !e.ctrlKey) continue;
				if ((kmvs[keys][i].m || "") == "alt"  && !e.altKey)  continue;
				e.preventDefault(); e.stopPropagation();
				// @ts-ignore
				moveandbuild(kmvs[keys][i].d, kmvs[keys][i].w)
				break;
			}

			// This is so that the main handler doesn't trigger the
			// event again
			e.preventDefault(); e.stopPropagation();
		});
	}

	function listenbtns() {
		// TODO: ../events.js ?
		p.addEventListener("zm-move-btn", function(ev) {
			// We're sure this is a CustomEvent, equipped with
			// a .detail field.
			let e = /** @type{CustomEvent} */ (ev);
			moveandbuild(e.detail[0], e.detail[1]);
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
	}

	// TODO: perhaps we could be a bit more generous, and
	// also handle keydown events on e.g. pnav/pstack
	// in the case of a mknavdict()?
	function listenmain() {
		// TODO: navigateable should still be around;
		// store this to a Classes.
		psrc.classList.add("zhongmu-navigable");

		if (mainhandler) return; mainhandler = true;
		var [x, y] = [-1, -1];

		document.addEventListener("mousemove", function(e) {
			[x, y] = [e.clientX, e.clientY];
		});

		document.addEventListener("keydown", function(e) {
			var q = document.elementFromPoint(x, y);
			if (!q) return;

			var r = q.closest('[class*="zhongmu-navigable"]');
			if (!r || !r.classList.contains("zhongmu-navigable")) return;

			// Feels better without the focus
//			r.focus();
			r.dispatchEvent(new KeyboardEvent("keydown", {
				key     : e.key,
				ctrlKey : e.ctrlKey,
				altKey  : e.altKey,
			}));
		});
	}

	function listenall() {
		listenmousemove();
		listenkeymove();
		listenbtns();
		listenmain();
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
	//
	// tabindex is necessary to generate keyboard events on "irregular" (w.r.t.
	// keyboard events) nodes. Some weird outline is automatically created then,
	// so we remove it.
	psrc.setAttribute("tabindex", "-1");
	psrc.style.outline = "none";

	listenall();
}

/**
 * TODO: clarify when n.type isn't a div.
 *
 * param{{ type : string, btns : Array<[string, MoveDir, MoveWhat]> }} n
 * @param{{ type ?: string, btns : Array<[string, string, string]> }} n
 * @returns{HTMLElement}
 */
function mknav(n) {
	let p = document.createElement(n.type || "div");
	p.classList.add(Classes.navbtns);

	n.btns.forEach(function(b) {
		let q = document.createElement("button");
		q.innerText = b[0];
		q.addEventListener("click", function(e) {
			e.preventDefault(); e.stopPropagation();
			q.dispatchEvent(new CustomEvent("zm-move-btn", {
				bubbles : true,
				detail  : [b[1], b[2]],
			}));
		});
		p.appendChild(q);
	});

	return p;
}

/**
 * Actually creates a standalone component to navigate through
 * a piece of text.
 *
 * The state has been fully prepared by the caller ':/function mksinglenav\('
 *
 * @param{SingleNavState} S - single nav's state (stack, move, conf, etc.)
 * @returns{BuildableHTMLElement}
 */
function mksinglenavaux(S) {
	let p = Dom.mkbuildable("div");

	let pnav   = mknav({ btns : [
		[ "←", MoveDir.Prev, MoveWhat.Word ],
		[ "→", MoveDir.Next, MoveWhat.Word ]
	] });

	let pstack = mkstack(S);
	let psrc   = mkbasiccc(S);
	let pvcuts = mkvcuts(S);

	// only when substackvcuts (~ !hasstack) ? XXX/TODO + rename
	// (at least, we don't want this in setupwithnav,
	// as we don't want it e.g. on index.js' psrc)
	if (S.hasstack) p.classList.add(Classes.subsinglenav);

	p.append(pnav, pstack, psrc, pvcuts);

	function setup() {
		S.stack.push(S.move.cwv());

		setupstackvcuts(p, S);
		setupwithnav(p, psrc, S, "onechunk");

		// NOTE: Ideally, we'd want p.focus() here, but this is
		// useless until p has been added to the DOM.
	}

	function build() {
		buildstackvcuts(S, pstack, pvcuts);
		psrc.build();
	}

	p.build = build;

	setup();
	build();

	return p;
}

/****************************************************************
 * Entry points.
 */

/**
 * Creates a standalone component to inspect a single character.
 *
 * @param{string}    w     - word(s) to inspect
 * @param{TabsConf} [tc]   - grid configuration
 * @param{boolean}  [nohelp]
 * @returns{HTMLElement}
 */
function mksingle(w, tc, nohelp) {
	let stack = Stack.mk();

	// XXX This isn't clearly documented, and a bit fragile, as we may
	// have dictionary entries containing spaces. For now, this is a hack
	// to allow to view multiple words through the stack.
	//
	// A better option would be for w to be ws already.
	//
	// NOTE: we're not doing a stack.xs = ws, because the stack.push()
	// will do things like trimming duplicates.
	let ws = w.split(" ");
	for (var i = 0; i < ws.length; i++)
		stack.push(ws[i]);

	// Select (show) first word
	stack.n = 0;

	return mkstackvcuts(/** @type{VCutsState} */ {
		stack    : stack,
		// TODO: document (likely, used when going recursive)
		tabsconf : tc ||= User.prefs.tabs,
		cache    : {},
		ts       : [],
		hasstack : false,
	}, { class : Classes.singleword, nohelp : nohelp });
}

/**
 * Creates a standalone component allowing to move
 * through a string one word at a time.
 *
 * @param{string} s - string to inspect / navigate in
 * @param{UIBaseConf} [S] - Configuration; to be extended as a state inside
 * @param{number} [ic] - chunk index
 * @param{number} [iw] - word index (in current chunk)
 * @returns{HTMLElement}
 */
function mksinglenav(s, S, ic, iw) {
	let ts    = Data.tokenize(s);
	let stack = Stack.mk();
	let move  = Move.mk([{
		t  : ChunkType.Paragraph,
		v  : s,
		ts : ts,
	}], ic, iw);

	S ||= {};

	return mksinglenavaux(/** @type{SingleNavState} */{
		stack    : stack,
		move     : move,
		tabsconf : S.tabsconf || User.prefs.tabs,
		cache    : S.cache || {},
		ts       : [],

		// remember, boolean true iff there's a higher stack
		// in the DOM.
		hasstack : S.hasstack || false,
	});
}

return {
	"mksingle"        : mksingle,
	"mksinglenav"     : mksinglenav,

	"mkhelp"          : mkhelp,

	"mkmodalbtnwith"  : mkmodalbtnwith,
	"mkbasiccc"       : mkbasiccc,
	"mkstackvcuts"    : mkstackvcuts,
	"mknav"           : mknav,
	"setupwithnav"    : setupwithnav,

	"listenmousemove" : listenmousemove,
};

})();