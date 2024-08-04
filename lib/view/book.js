var ViewBook = (function() {

/**
 * @param{WithMove} S
 * @returns{BuildableHTMLElement}
 */
function mktitle(S) {
	var p = Dom.mkbuildable("span");

	function build() {
		for (var i = 0; i < S.move.cn(); i++)
			if (S.move.cc(i).t == ChunkType.Title) {
				p.innerText = S.move.cc(i).v;
				break;
			}
	}

	// NOTE: build() necessary because we need to wait
	// for the book to be loaded.
	p.build = build;

	return p;
}

/**
 * @param{WithMove} S
 * @returns{BuildableHTMLElement}
 */
function mksection(S) {
	var p = Dom.mkbuildable("span");

	function build() {
		for (var i = S.move.ic; i >= 0; i--)
			if (S.move.cc(i).t == ChunkType.Section) {
				p.innerText = S.move.cc(i).v;
				return;
			}
	}

	p.build = build;

	return p;
}

/**
 * @param{WithMove} S
 * @returns{BuildableHTMLElement}
 */
function mkcn(S) {
	var p = Dom.mkbuildable("span");

	function build() { p.innerText = "Chunk: "+(S.move.ic+1)+"/"+S.move.cn(); }
	p.build = build;

	return p;
}

/**
 * @param{WithMove} S
 * @returns{BuildableHTMLElement}
 */
function mktoc(S) {
	var p = Dom.mkbuildable("span");

	function build() {
		p.appendChild(Dom.mkspan("目錄", Classes.toctitle));
		p.appendChild(Dom.mktoc(Markdown.gettoc(S.move.cs)));
	}

	p.build = build;

	return p;
}

/**
 * @param{BookState} S
 * @param{MMovableBuildableHTMLElement} p
 * @param{HTMLElement} psrc
 * @param{HTMLElement} ptoc
 * @param{Array<BuildableHTMLElement>} qs
 * @param{Array.<SVarDescr>} svars
 * @param{string} navtype
 */
function setup(S, p, psrc, ptoc, qs, navtype, svars) {
	View.setupwithnav(p, psrc, S, navtype);

	/**
	 * @param{Event} [e]
	 */
	function movehandler(e) {
		qs.forEach(function(q) { q.build(); });
		// NOTE: if we write to document.location.hash, we'll
		// generate a popstate event that will be caught by
		// spa.js everytime we move around.
		//
		// It seems we can't distinguish that popstate from
		// a regular movement in history, so it's best to avoid
		// generating it in the first place, so that we can
		// actually manage history movement in spa.js.
		//
		// It feels a bit brittle, and is inefficient, as we'll
		// use SPA.navigate() instead of moving around a book
		// when the history points to a different position in a
		// book, and not to another page.
//		document.location.hash = Bookmark.dump(S, svars);
		history.pushState(null, "", document.location.pathname + "#" + Bookmark.dump(S, svars));
	}

	p.addEventListener("zm-nav-move", movehandler);

	/*
	 * NOTE: because of the SPA, we could even not do that
	 * anymore. This avoids rebuilding the page though.
	 */
	Dom.alisten(Classes.tocentry, function(e) {
		console.log(e);
		if (!(e.target instanceof HTMLAnchorElement)) {
			Assert.assert("ToC entry is not a <a>");
			return;
		}
		var b = Bookmark.preload((e.target.hash || '#').slice(1));
		if (!("c" in b)) {
			Assert.assert("Toc entry has no c= in href");
			return;
		}
		var c = parseInt(b.c);
		if (isNaN(c) || c > S.move.cn()) {
			Assert.assert("Toc entry's c NaN or too great ("+c+")");
			return;
		}
		[S.move.ic, S.move.iw] = [c, 0];
		S.stack.push(S.move.cwv());
		p.build();
		movehandler();
		// XXX fragile
		Dom.hide(/** @type{HideableHTMLElement} */ (ptoc.children[1]));
		console.log("oook");
		return false;
	}, ptoc);
}

/**
 * @param{BookState} S
 * @param{Array<BuildableHTMLElement>} ps
 * @param{Array.<SVarDescr>} svars
 * @param{() => Array<string>} fns
 */
function init(S, ps, svars, fns) {
	Bookmark.load(S, svars);
	return Promise.all(Data.mget(fns())).then(function(xs) {
		S.move.init(
			// By convention, the first file (fns[0]/xs[0]) must
			// be the book's content.
			Data.parseandtok(xs[0]),
			// those potentially came from the bookmark (TODO)
			S.move.ic, S.move.iw
		)
		S.stack.push(S.move.cwv());

		ps.forEach(function(p) { p.build(); });
		return xs;
	});
}

/**
 * @param{BookState} S
 * @returns{Promise<BuildableHTMLElement>}
 */
function mkbook(S) {
	var p = Dom.mkbuildable("div");

	var svars = [
		{ bn : "c", sn : "move.ic", type : SVarType.Number },
		{ bn : "w", sn : "move.iw", type : SVarType.Number },
		{ bn : "b", sn : "book",    type : SVarType.String },
	];

	var ptitle   = mktitle(S);
	var psection = mksection(S);
	var pcn      = mkcn(S);
	var psrc     = View.mkbasiccc(S);
	var pdec     = View.mkstackvcuts(Object.assign({}, S, {
		ts : [],
	}));

	var pnav = document.createElement("div");

		var pnav0 = View.mknav({ type : "span", btns : [
			[ "⇦", MoveDir.Prev, MoveWhat.Chunk ],
			[ "←", MoveDir.Prev, MoveWhat.Word ]
		]});

		var ptoc = View.mkmodalbtnwith(mktoc(S), { text : "目錄" });

		var pnav1 = View.mknav({ type : "span", btns : [
			[ "→", MoveDir.Next, MoveWhat.Word ],
			[ "⇨", MoveDir.Next, MoveWhat.Chunk ]
		] });

		pnav.append(pnav0, ptoc, pnav1);

	var pfontsave = document.createElement("div");

		var pfont = document.createElement("button");
		pfont.innerText = "User bettor font";
		pfont.style.display = "none";

		var psave  = document.createElement("save");
		psave.innerText = "Save";
		psave.style.display = "none";

		pfontsave.append(pfont, psave);

	ptitle.id    = "title";
	psection.id  = "section";
	pcn.id       = "cn";
	pnav.id      = "nav";
	psrc.id      = "src";
	pdec.id      = "dec";
	pfont.id     = "font"
	psave.id     = "save";
	pfontsave.id = "font-save";

	p.classList.add("main-book");

	p.append(ptitle, psection, pcn, pnav, pfontsave, psrc, pdec);

	function xsetup() {
		setup(S, p, psrc, ptoc, [ptitle, psection, pcn], "basic", svars);
	}

	function xbuild() { pdec.build(); psrc.build(); }

	// S.book is provided upon bookmark loading, so fns() will
	// only be correct *after* bookmark loading (and hence why
	// it's not a static list)
	function fns() {
		// TODO/WIP: those are the new links created
		// on books.html; we'll rework book.js/trbook.js
		// once we've correctly stored translations & cie
		// in the DB, and thus, how fns() are implemented
		// on both.
		if (S.book.startsWith("data/"))
			return [S.book];
		else
			return ["data/books/"+S.book+".src"];
	}

	function xinit() {
		return init(
			S,     [pdec, psrc, ptitle, psection, pcn, ptoc],
			svars, fns
		);
	}

	// for setupwithnav
	p.build = xbuild;

	xsetup();

	return xinit().then(function() { return p; });
}

/**
 * @param{TabsConf} [tc]
 */
function mk(tc) {
	return mkbook(/** @type{BookState} */{
		stack    : Stack.mk(),
		move     : Move.mk(),
		tabsconf : tc ||= User.prefs.tabs,
		hasstack : false,
		cache    : {},
		book     : "",
		ts       : [],
	});
}

return {
	"mk"        : mk,
	"mktitle"   : mktitle,
	"mksection" : mksection,
	"mkcn"      : mkcn,
	"mktoc"     : mktoc,

	"setup"     : setup,
	"init"      : init,
};

})();