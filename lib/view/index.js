let ViewIndex = (function() {

/** @returns{HTMLTextAreaElement} */
function mkinput() {
	let p = document.createElement("textarea");
	p.setAttribute("rows", "5");
	p.setAttribute("id",   "input");
	p.value = "你好，世界";
	return p;
}

/**
 * @param{IndexState} S
 * @returns{BuildableHTMLElement}
 */
function mkresults(S) {
	var p = Dom.mkbuildable("span");
	p.setAttribute("id", "results");

	/** @param{[string, string]} xs */
	function build(xs) {
		p.innerHTML = '';
		var ul = document.createElement("ul");

		xs.forEach(function(x) {
			var li = document.createElement("li");
			li.appendChild(Dom.mka(x[0], Classes.defword));
			li.appendChild(Dom.mkspan(x[1], Classes.searchdefs));
			ul.appendChild(li);
		});

		p.appendChild(ul);
	}

	p.build = build;
	return p;
}

/** @returns{HTMLElement} */
function mkhelpmsg() {
	var p = document.createElement("span");
	var url = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions";

	p.innerHTML = `
		<p>
			<b>Analyse:</b>
		</p>
		<ol>
			<li>Decomposes input (Chinese text) into chunks (~paragraphs);</li>
			<li>Identifies potential words in current chunk;</li>
			<li>
				Allows to navigate from chunk to chunk, and from
				word to word, either via the buttons, keyboard's arrows,
				or a pointing device (mouse, finger)
			</li>
			<li>
				Analyses the current word (for more, see the
				<a href="help.html">help page</a>).
			</li>
		</ol>
		<p>
			<b>Search</b>:
		</p>
		<p>
			"Reverse" dictionary search:
		</p>
		<ol>
			<li>
				Look for some input in the (often, non-Chinese) <i>definition</i>
				of a Chinese word. The input is interpreted as a
				<a href="`+url+`">regular expression</a>:
				for instance, <code>\\b(language|culture)\\b</code> will
				fetch entries containing either the word <code>language</code>
				or the word <code>culture</code>;
			</li>
			<li>
				Displays all matching entries, sorted by number of Chinese
				characters;
			</li>
			<li>You may now click on entries you wish to explore.</li>
		</ol>
		<p>
			<b>Contains</b>:
		</p>
		<p>
			Look for characters containing another character. For example,
			filling the input field with <code>虎</code> and clicking on
			<code>Contains</code> will display all the Chinese characters
			containing <code>虎</code>.
		</p>
		<p>
			Multiple, spaces-separated characters allows looking for all words
			containing all the specified components. For example,
			<code>一 肀 女</code> will look for all words containing
			<code>一</code>, and,  <code>肀</code> and <code>女</code>
		</p>
		<p>
			As for the previous features, results can be clicked for
			further inspection.
		</p>`
	return p;
}

/**
 * @param{IndexState} S
 */
function mkindex(S) {
	let p = Dom.mkbuildable("div");

	p.classList.add("main-index");
	p.id = "main"; // still used in ../dom.js:/fontFamily

	let pinput   = mkinput();
	let presults = mkresults(S);

	// NOTE: we could have a separate component for
	// clarity to wrap all those, but its convenient
	// to have panalyse/psearch/pcontains and register handlers
	// directly here.
	let pbtns = document.createElement("div");
	pbtns.setAttribute("id", "submit-search");

		let panalyse  = Dom.mke("button", "Analyse");
		let psearch   = Dom.mke("button", "Search");
		let pcontains = Dom.mke("button", "Contains")
		let phelp     = View.mkmodalbtnwith(mkhelpmsg(), {
			text : "Help",
		});
		let psamples = Dom.mkselect([
				["",   "Sample characters:"     ],
				["文", "文 (culture, language)" ],
				["好", "好 (good)"              ],
				["中", "中 (middle, chinese)"   ],
				["教", "教 (to teach)"          ],
				["學", "學 (to study)"          ],
				["嫉", "嫉 (jealousy)"          ],
				["惑", "惑 (to confuse)"        ],
				["愚", "愚 (to be stupid)"      ],
			]);

		pbtns.append(panalyse, psearch, pcontains, phelp, psamples);

	let pnav   = View.mknav({ btns : [
		[ "⇦", MoveDir.Prev, MoveWhat.Chunk ],
		[ "←", MoveDir.Prev, MoveWhat.Word  ],
		[ "→", MoveDir.Next, MoveWhat.Word  ],
		[ "⇨", MoveDir.Next, MoveWhat.Chunk ]
	]});

	let psrc  = View.mkbasiccc(S); // TODO: has/used to have a Classes.navigateable
	let pdec  = View.mkstackvcuts(S);

	pnav.setAttribute("id", "nav");
	psrc.setAttribute("id", "src");
	pdec.setAttribute("id", "dec");

	p.append(pinput, presults, pbtns, pnav, psrc, pdec);

	let svars = [
		{ bn : "c", sn : "move.ic",     type : SVarType.Number },
		{ bn : "w", sn : "move.iw",     type : SVarType.Number },
		{ bn : "a", sn : "toanalyse",   type : SVarType.String },
		{ bn : "s", sn : "tosearch",    type : SVarType.String },
		{ bn : "n", sn : "tocontains",  type : SVarType.String },
	];

	function dumpbm() {
		document.location.hash = Bookmark.dump(S, svars);
	}

	function getinput() { return pinput.value; }

	// NOTE: we need a .build() for setupwithnav(): on
	// movements, we only care about rebuilding psrc/pdec.
	//
	// That's the say, the fact that this is called "build"
	// can be confusing, as it doesn't really refer to a
	// peculiar re-rendering of a mkindex() component.
	function build() { psrc.build(); pdec.build(); }

	/**
	 * @param{string} [s]
	 */
	function analyse(s) {
		S.toanalyse = s || getinput()
		// ic/iw may be coming from bookmark
		S.move.init(Data.parseandtok(S.toanalyse), S.move.ic, S.move.iw);
		S.stack.push(S.move.cwv());
		build();
		dumpbm();
	}

	/**
	 * @param{string} [s]
	 */
	function search(s) {
		S.tosearch = s || getinput();
		presults.build(Data.search(S.tosearch));
		dumpbm();
	}

	/**
	 * @param{string} [s]
	 */
	function contains(s) {
		S.tocontains = s || getinput();
		presults.build(Data.lscontains(S.tocontains).map(function(x) {
			return [x, Data.quickdef(x)];
		}));
		dumpbm();
	}

	function setup() {
		panalyse.addEventListener("click",  function(e) { analyse();  });
		psearch.addEventListener("click",   function(e) { search();   });
		pcontains.addEventListener("click", function(e) { contains(); });
		psamples.addEventListener("change", function(e) {
			if (psamples.selectedIndex > 0) {
				S.stack.push(psamples.value);
				build();
			}

		});

		View.setupwithnav(p, psrc, S, "basic");

		// We have defword in presults; stack them on click
		Dom.alisten(Classes.defword, function(e) {
			let q = Dom.gettarget(e);
			// XXX this is pushandbuild from zm-stackgrid's context.
			if (S.stack.push(q.innerText))
				pdec.build();
			return false;
		}, p);

		p.addEventListener("zm-nav-move", function(e) {
			dumpbm();
		});

		Bookmark.load(S, svars);
	}

	setup();

	if (S.toanalyse)  analyse(S.toanalyse);
	if (S.tosearch)   search(S.tosearch);
	if (S.tocontains) contains(S.tocontains);

	// Work from default text ("你好，世界")
	else analyse();

	p.build = build;

	return p;
}

/**
 * @param{TabsConf} [tc]
 * @returns{BuildableHTMLElement}
 */
function mk(tc) {
	return mkindex({
		stack    : Stack.mk(),
		move     : Move.mk(),
		tabsconf : tc ||= User.prefs.tabs,
		cache    : {},
		hasstack : false,
		ts       : [],
	});
}

return {
	"mk" : mk,
};

})();
