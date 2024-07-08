/*
 * Generic browser code aiming at providing a "component"
 * to display cut()ted word, and enough auxiliary code to
 * make it work.
 *
 * Requires a browser (DOM), pako, libcut.js (thus libutils.js).
 *
 * Calling code should provide decomposition data and tree dictionary
 * via pushdecword() (and listenfordefword()).
 */

/*
 * Class names used to provide features.
 * See '../ext-front.js:/^czmdefword '
 *
 * TODO: make a hash out of this, and adjust hashe's values
 * in ../ext-front.js instead.
 */
var czmdefword    = "zhongmu-def-word";
var czmtoggledec  = "zhongmu-toggle-decomp";
var czmhcut       = "zhongmu-hcut";
var czmvcut       = "zhongmu-vcut";
var czmword       = "zhongmu-word";
var czmdescr      = "zhongmu-descr";
var czmtoggleext  = "zhongmu-toggle-ext-trs";
var czmdecword    = "zhongmu-dec-word";
var czmstrokesimg = "zhongmu-strokes-img";
var czmtoggledefs = "zhongmu-toggle-defs";
var czmtoggleimgs = "zhongmu-toggle-imgs";
var czmtoggleexts = "zhongmu-toggle-exts";
var czmtogglepict = "zhongmu-toggle-pict";
var czmtabcontent = "zhongmu-tab-content";
var czmaudio      = "zhongmu-audio";

/*
 * Available URLs for pinyin audio, one entry per URL.
 *
 * Each URL is an array containing the base URL and the extension.
 * The filename to be looked is to be placed in between.
 *
 * allsetlearning.com has better quality, slightly more complete (64 more files
 * out of 1645), but is not available for commercial use.
 *
 * davinfifield is lower quality, but public domain.
 */
var audiourls = [
	[ "https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/",               ".mp3"          ],
	[ "https://raw.githubusercontent.com/davinfifield/mp3-chinese-pinyin-sound/master/mp3/", ".mp3"          ],
	// This one below indirectly redirect to the above.
	[ "https://github.com/davinfifield/mp3-chinese-pinyin-sound/blob/master/mp3/",           ".mp3?raw=true" ],
];

/*
 * Uncompress and parse a gziped JSON file.
 *
 * Uses pako for decomporession.
 *
 * TODO: move this somewhere else?
 *
 * Input:
 *	x : uint8 array
 * Output:
 *	tdict as returned by 'libdata.js:/^function mktdict/';
 *	throws on error
 */
function gunzipjson(x) {
	return JSON.parse(new TextDecoder("utf-8").decode(
		pako.inflate(new Uint8Array(x))
	));
}

/*
 * Retrieve zmdata.js.gz.
 *
 * Input:
 *	url : URL/path to tdict.js.gz
 *	ko  : callback to execute on error; only arg is error message
 *	ok  : callback to execute on success;
 */
function getzmdata(url, ko, ok) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url);

	/*
	 * We want xhr.response to be uint8 array (for pako)
	 */
	xhr.responseType = "arraybuffer";

	xhr.onload = function() {
	    if (xhr.status != 200) {
	    	ko("critical failure: "+xhr.responseText);
	    	return;
		}
		var x; try { x = gunzipjson(xhr.response) }
		catch(e) { ko("cannot decompress tdict: "+e); return; }
		ok(x);
	};
	xhr.send();
}

/*
 * Create <a> with given class. Links point to
 * h if specified, # otherwise.
 *
 * This is often used for links behaving as buttons,
 * hence the defaults
 *
 * Input:
 *	t : link's text
 *	c : link's class
 *	h : link's URL (href) [default: "#"]
 *	i : link's title      [default: "" ]
 * Output:
 *	<a> element with given properties.
 */
function mka(t, c, h, i) {
	var x       = document.createElement('a');
	x.innerText = t;
	x.className = c;
	x.href      = h || "#";
	x.title     = i || "";

	return x;
}

/*
 * Create a <span> with given text content.
 *
 * Input:
 *	t : optional <span>'s text
 *	c : optional class
 * Output:
 *	<span> element containing given text.
 */
function mkspan(t, c) {
	var x = document.createElement('span');
	x.innerText = t || "";
	x.className = c || "";
	return x;
}

/*
 * Put a separating dash in a span.
 *
 * Input:
 * Output:
 *	<span> element containing a dash.
 */
function mkdash() { return mkspan(" - "); }

/*
 * Is this an non-empty definition?
 *
 * Input:
 *	d : definition to test
 * Output:
 *	true if d is non-empty, false otherwise.
 */
function hasdef(d) {
	return Object.keys(d || {}).length > 0;
}

/*
 * Create links to potential strokes images files, all
 * wrapped into a <span>.
 *
 * Input:
 *	cd  : piece of cut()'s output.
 * Output:
 *	<span> element containing an links to strokes files.
 */
function mkimgsc(cd) {
	var w = cd.v;
	var x = mkspan("", czmtabcontent);
	var b  = "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=";

	/* Single rune only (XXX assert) */
	if ([...w].length > 1) return x;

	var exts = ["-bw.png", "-order.gif", "-red.png"];

	for (var i = 0; i < exts.length; i++) {
		var y       = document.createElement("img");
		y.src       = b+w+exts[i];
		y.alt       = "not found";
		y.className = czmstrokesimg;
		x.appendChild(y);
	}

	return x;
}

/*
 * Create external definitions links, all wrapped into
 * a <span>
 *
 * TODO: split into 2/3 subs, one to create data, one to create
 * HTML from data.
 *
 * Input:
 *	cd  : piece of cut()'s output.
 * Output:
 *	<span> element containing an <a> element per external link.
 */
function mkextsc(cd) {
	var w   = cd.v;
	var x   = mkspan("", czmtabcontent);
	var hex = w.codePointAt(0).toString(16).toUpperCase();
	var h   = hex[0];

	// starred, name, URL
	var links = [
		[1, "en.wiktionary.org",    "https://en.wiktionary.org/wiki/"+w                                      ],
		[0, "baidu.com",            "https://baike.baidu.com/item/"+w                                        ],
		[1, "zdic.net",             "https://www.zdic.net/hans/"+w                                           ],
		[0, "zh.wiktionary.org",    "https://zh.wiktionary.org/zh-hans/"+w                                   ],
		[0, "translate.google.com", "https://translate.google.com/?sl=zh-CN&tl=en&op=translate&text="+w      ],
		[0, "linguee.com",          "https://www.linguee.com/english-chinese/search?source=chinese&query="+w ],
		[0, "ctext.org",            "https://ctext.org/dictionary.pl?char="+w                                ],
		[0, "mdbg.net (trad.)",     "https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=1&wdqb="+w  ],
		[0, "mdbg.net (simpl.)",    "https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb="+w  ],
		[0, "hanzicraft.com",       "https://hanzicraft.com/character/"+w                                    ],
	];

	// TODO If many characters, sublist one entry per sub char?
	if ([...w].length == 1) {
		links.push(
			[0, "unicode.org",                "https://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint="+hex                                      ],
			[0, "chise.org",                  "https://www.chise.org/est/view/character/"+w                                                          ],
			[0, "chineseetymology.org" ,      "http://internationalscientific.org/CharacterEtymology.aspx?submitButton1=Etymology&characterInput="+w ],
			[1, "chinese-characters.org",     "http://chinese-characters.org/meaning/"+h+"/"+hex+".html"                                             ],
//			[1, "chinese-characters.org (a)", "https://web.archive.org/web/http://chinese-characters.org/meaning/"+h+"/"+hex+".html"                 ],
		);
		if (cd.b) links.push(
			[1, "zhongwen.com",               "http://zhongwen.com/cgi-bin/zipux.cgi?="+cd.b                                                         ],
		);
	}

	var ul = document.createElement('ul');
	for (var i = 0; i < links.length; i++) {
		var li = document.createElement('li');
		li.appendChild(mka(links[i][1], "", links[i][2]));
		if (links[i][0] == 1) li.appendChild(mkspan("٭"));
		ul.appendChild(li);
	}
	x.appendChild(ul);

	return x;
}

/*
 * Create an <audio> element linking to files from
 * https://resources.allsetlearning.com/pronwiki/resources/pinyin-audio/
 *
 * Input:
 *	p : pinyin(s) to play, as a single string
 * Output:
 *	Audio element ready to start sequentially playing all pinyin.
 */
function mksound(p) {
	/* There may be multiple pinyin, with capitalized letters. */
	var ps = p.toLowerCase().split(" ");

	/* Reasonable */
	if (ps.length == 0) return new Audio();

	// XXX make it configurable somehow.
	var audiourl = audiourls[0];

	var a = new Audio(audiourl[0]+ps[0]+audiourl[1]);
	var i = 1;

	a.addEventListener('error', function() {
		var msg = ps[i-1]+" ("+a.src+")";

		switch(a.error.code) {
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
		if (i < ps.length) {
			a.src = audiourl[0]+ps[i++]+audiourl[1];
			a.load();
			a.play()
		}

	});

	return a;
}

/*
 * Auxiliary function to create a container wrapping
 * the given definitions
 *
 * NOTE: too hairy and difficult to tests because we're toying
 *       with HTML. Improved tokenize() might help, or at least
 *       having a function allowing to change tokenize()'s output
 *       and insert proper tokens for pinyin would help.
 *
 * Input:
 *	defs: definitions to be compiled to HTML.
 * Output:
 *	Container wrapping all the definitions.
 */
function xmkdefsc(defs) {
	var defc = mkspan("", czmtabcontent);
	var s = "";

	/*
	 * XXX x is a quick fix because we don't want to automatically
	 * add spaces before Chinese characters.
	 */
	function maybeflush(x) {
		if (s == " / ") return;
		defc.appendChild(mkspan(x ? s : s+" "));
		s = "";
	}

	var q = "";

	foreachdef(defs, function(p, t, d) {
		/*
		 * Transform number-based pinyin to accent-based ones
		 * in definitions.
		 */
		var intone = false;
		var tone = "";

		if (q != p) {
			var x = document.createElement('b');

			/* Lightly emphasizes tweaked entries. */
			if (t) x.style.fontStyle = 'italic';

			x.innerText = "["+pinyinsn2a(p)+"]";
			defc.appendChild(x)
			defc.appendChild(mka("🔊", czmaudio, "", p));
			q = p;
			s = " ";
		} else s = " / "
		for (var i = 0 ; i < d.length; i++) {
			switch(d[i].t) {
			case ctype.foreign:
			case ctype.punct:
				if (intone) {
					/*
					 * XXX Pathological case, in "CL:個[ge4],位[wei4]",
					 * "]," get tokenized together. Quick fix here as
					 * IIRC, we rely on that behavior to identify "...".
					 */
					if (d[i].v[0] == ']') {
						s += pinyinsn2a(tone);
						intone = false; tone = "";
					} else {
						tone += d[i].v
						break;
					}
				}
				if (d[i].v == '[') intone = true ;
				s += d[i].v;
				break;
			case ctype.chinese:
				maybeflush(true);
				defc.appendChild(mka(d[i].v, czmdefword));
				break;
			default:
				console.log("xmkdefsc() bug: ", d[i]);
				break;
			}
		}
		maybeflush();
	});
	maybeflush();

	return defc;
}

/*
 * Create definitions container.
 *
 * Input:
 *	cd  : piece of cut()'s output.
 * Output:
 *	<span> element wrapping the definition. The definition
 *	has been transformed so that every known Chinese word
 *	it contains is now a link classed czmdefword
 */
function mkdefsc(cd) { return xmkdefsc(cd.d); }

/*
 * Create pictogram explanations container.
 *
 * Input:
 *	cd  : piece of cut()'s output.
 * Output:
 *	<span> element wrapping the definition. The definition
 *	has been transformed so that every known Chinese word
 *	it contains is now a link classed czmdefword
 */
function mkpictc(cd) { return xmkdefsc(cd.p); }

/*
 * Create decomposition grid.
 *
 * NOTE: This is a key function.
 *
 * Input:
 *	cds   : cut() output to display in the grid.
 *	pgrid : DOM node where to store the grid.
 * Output:
 */
function mkgrid(cds, pgrid) {
	pgrid.className = czmvcut;
	cds.forEach(function(cd) {
		if (cd.t != ctype.chinese) return;

		/* Are there composition/definition/pictogram data for that word ? */
		var hascomp = cd.c.length > 0;
		var isdef   = hasdef(cd.d);
		var haspict = hasdef(cd.p);

		/* word container */
		var word       = document.createElement('div');
		word.innerText = cd.v;
		word.className = czmword;

		/*
		 * hcut for word (definition on top of
		 * decomposition).
		 */
		var hcut       = document.createElement('div');
		hcut.className = czmhcut;

		/* definition */
		var def       = document.createElement('div');
		def.className = czmdescr;

		/*
		 * Store word; we'll run xcut() over it again when
		 * we change tab; we could find ways to cache cd
		 * in the DOM, but that's cheap; we could even
		 * avoid storing word, but that feels a bit better
		 * than dancing in the DOM to retrieve it.
		 */
		def.dataset.word = cd.v;

		/* Header */
		if (hascomp) def.appendChild(mka('[+]', czmtoggledec));
		else         def.appendChild(mkspan(''));
		if (isdef)   def.appendChild(mka('defs', czmtoggledefs));
		else         def.appendChild(mkspan('defs'));
		if (haspict) def.appendChild(mka('pict', czmtogglepict));
		else         def.appendChild(mkspan('pict'));

		if ([...cd.v].length == 1) def.appendChild(mka('imgs',  czmtoggleimgs));
		else                       def.appendChild(mkspan('imgs'));

		def.appendChild(mka('links', czmtoggleexts));

		/* Current tab-content (XXX do it better) */
		var tc = isdef ? mkdefsc(cd) : mkextsc(cd);
		def.appendChild(tc);

		/* Decomposition (empty if none) */
		var dec = document.createElement('div');

		/* By default, hide */
		dec.style.display = 'none';

		/* Recurse on decomposition if any */
		if (hascomp) mkgrid(cd.c, dec);

		/* Create hcut */
		hcut.appendChild(def);
		hcut.appendChild(dec);

		/* Create vcut */
		pgrid.appendChild(word);
		pgrid.appendChild(hcut);
	});
}

/*
 * Whenever we push a new entry, we also keep track
 * of HTML, that is, of how the decompositon is
 * currently being inspected by the user.
 *
 * XXX Maybe we'd better be off by clearly separating
 * data and rendering.
 *
 * XXX maybe this would be better as a function argument,
 *     in which case, we could have a state variable holding
 *     pgrid, pstack, decomp, tdict, decwords.
 */
var decwords = {};

/*
 * Retrieve current words being decomposed in pgrid.
 *
 * Input:
 *	pgrid : DOM node where a grid has been installed (cf. mkgrid())
 * Output:
 *	highest-level word being currently defined in grid.
 */
function getcdwords(pgrid) {
	// meh.
	return [].slice.call(pgrid.children).filter(function(n) {
		return n.className == czmword;
	}).map(function(n) { return n.innerText }).join(" ");
}

/*
 * When toggling decomposition, update
 * related entry in decwords.
 *
 * Input:
 *	pgrid : DOM node where a grid has been installed (cf. mkgrid())
 * Output:
 *	decwords updated.
 */
function updatedecwords(pgrid) {
	/* Update decwords entry for current word being decomposed */
	decwords[getcdwords(pgrid)] = pgrid.innerHTML;
}

/*
 * Push a word in the decomposition stack.
 *
 * Decomposition stack is stored directly in the DOM,
 * as a list of link tagged with czmdecword.
 *
 * As stated earlier, maybe this would be be better
 * to clearly separate the stack from the HTML.
 *
 * NOTE: async function only because of xcut() which can
 *       be async in the case of the browser extension.
 *
 * Input:
 *	w      : word to push (string)
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 *	pstack : DOM node containing the decomposition stack.
 *	xcut   : "standalone" cut function taking word to cut as single argument,
 *           returning cut() data prepared with rqcutdescr().
 * Output:
 *	None, but stack, the grid and decwords would have been updated.
 */
async function pushdecword(w, pgrid, pstack, xcut) {
	var n = pstack.children.length;

	/*
	 * If some words have been stacked
	 */
	if (n > 0) {
		// last word
		var t = pstack.children[n-1].innerText;

		// w is already last word, don't duplicate
		if (t == w)
			return;

		pstack.appendChild(mkdash());
	}

	pgrid.innerHTML = "";

	/*
	 * Restore previous state if any.
	 */
	if (w in decwords)
		pgrid.innerHTML = decwords[w];

	/*
	 * Otherwise, launch new decomposition, and
	 * store it.
	 */
	else {
		var cds = await xcut(w);
		mkgrid(cds, pgrid);
		updatedecwords(pgrid);
	}

	pstack.appendChild(mka(getcdwords(pgrid), czmdecword));
}


/*
 * Pop the stack until we reach a given node.
 *
 * Input:
 *	n      : DOM node where we want to stop poping
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 *	pstack : DOM node containing the decomposition stack.
 * Output:
 *	None, but stack and the grid would have been updated.
 */
function popdecwordto(n, pgrid, pstack) {
	var l = pstack.children.length;
	if (l <= 1) return;

	while (l > 1) {
		/*
		 * We reached last node: finished
		 */
		if (n.isSameNode(pstack.children[l-1]))
			break;

		/*
		 * Otherwise, pop() that word and
		 * the separating dash.
		 */
		pstack.removeChild(pstack.children[l-1]);
		pstack.removeChild(pstack.children[l-2]);
		l -= 2;
	}

	pgrid.innerHTML = decwords[n.innerText];
}

/*
 * Listen on click for "fake" '<a>' elements with
 * given class.
 *
 * Input:
 *	c : class on which we want to registers click events.
 *	f : code to execute when clicking on such elements; takes
 *	    event as argument.
 * Output:
 *	Click listener added to document.
 */
function alisten(c, f) {
	document.addEventListener("click", function(e) {
		if (e.target.className != c)
			return true;
		e.preventDefault();
		f(e);
	});
}

/*
 * Listen for click on a stack word.
 *
 * On such click, pop the stack until we reach the node
 * we just clicked.
 *
 * Input:
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 *	pstack : DOM node containing the decomposition stack.
 * Output:
 *	Click listener added to document.
 */
function listenfordecword(pgrid, pstack) {
	alisten(czmdecword, function(e) {
		popdecwordto(e.target, pgrid, pstack);
	});
}

/*
 * Listen for click on a definition word.
 *
 * On such click, push that word on the stack and display
 * its decomposition.
 *
 * Input:
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 *	pstack : DOM node containing the decomposition stack.
 *	xcut   : "standalone" cut function taking word to cut as single argument,
 *           returning cut() data prepared with rqcutdescr().
 * Output:
 *	Click listener added to document.
 */
function listenfordefword(pgrid, pstack, xcut) {
	alisten(czmdefword, function(e) {
		pushdecword(e.target.innerText, pgrid, pstack, xcut);
	});
}

/*
 * Toggle next sibbling's visibility.
 *
 * Input:
 *	m : element to update according to n's visibility (e.g. link/button)
 *	n : element for which we want to toggle visibility
 *	h : m's content if we hide n's next sibling
 *	s : m's content if we show n's next sibling
 * Output:
 *	n's sibling's visibility would have been toggled; m would
 *	have been updated to reflect m's visibility.
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

/*
 * Toggle word's decomposition's visibility in grid.
 *
 * Input:
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 * Output:
 *	Click listener added to document.
 */
function listenfortoggledecomp(pgrid) {
	alisten(czmtoggledec, function(e) {
		togglefromlink(
			e.target, e.target.parentElement.nextElementSibling,
			'[-]', '[+]'
		);
		updatedecwords(pgrid);
	});
}

/*
 * Toggle word's external definition links's visibility
 *
 * Input:
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 * Output:
 *	Click listener added to document.
 */
function listenfortoggleexttrs(pgrid) {
	alisten(czmtoggleext, function(e) {
		togglefromlink(
			e.target, e.target.parentElement.lastElementChild,
			'[×]', '[*]'
		);
		updatedecwords(pgrid);
	});
}

/*
 * Register listener for "tab" changing.
 *
 * Input:
 * Output:
 */
function listenfortab(xcut) {
	document.addEventListener("click", function(e) {
		var f;
		switch(e.target.className) {
		case czmtoggledefs: f = mkdefsc; break;
		case czmtoggleimgs: f = mkimgsc; break;
		case czmtoggleexts: f = mkextsc; break;
		case czmtogglepict: f = mkpictc; break;
		default:            return true; break;
		}
		e.preventDefault();

		var p = e.target.parentElement
		p.lastElementChild.replaceWith(f(xcut(p.dataset.word)[0]));
		updatedecwords(pgrid);
	});
}

function listenforaudio() {
	alisten(czmaudio, function(e) {
		mksound(e.target.title).play();
	});
}

/*
 * Register all listeners for "component" to fully work.
 *
 * Input:
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 *	pstack : DOM node containing the decomposition stack.
 *	xcut   : "standalone" cut function taking word to cut as single argument,
 * Output:
 */
function libshowlistenall(pgrid, pstack, xcut) {
	listenfordecword(pgrid, pstack);
	listenfordefword(pgrid, pstack, xcut);
	listenfortoggledecomp(pgrid);
	listenfortoggleexttrs(pgrid);
	listenforaudio();
	listenfortab(xcut);
}

