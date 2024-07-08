import * as Assert   from "../../modules/assert.js";
import * as Bookmark from "../../modules/bookmark.js";
import * as Data     from "../../modules/data.js";
import * as User     from "../../modules/user.js";
import * as Stack    from "../../modules/stack.js";
import * as Move     from "../../modules/move.js";
import * as Dom      from "../../modules/dom.js";
import * as Classes  from "../../modules/classes.js";
import * as Markdown from "../../modules/data/book/markdown.js";
import * as View     from "../../modules/view.js";

import { SVarType, ChunkType } from "../../modules/enums.js";
import { MoveDir, MoveWhat   } from "../../modules/enums.js";

function mktitle(S) {
	var p = document.createElement("span");

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

function mksection(S) {
	var p = document.createElement("span");

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

function mkcn(S) {
	var p = document.createElement("span");

	function build() { p.innerText = "Chunk: "+(S.move.ic+1)+"/"+S.move.cn(); }
	p.build = build;

	return p;
}

function mktoc(S) {
	var p = document.createElement("span");

	function build() {
		p.appendChild(Dom.mkspan("目錄", Classes.toctitle));
		p.appendChild(Dom.mktoc(Markdown.gettoc(S.move.cs)));
	}

	p.build = build;

	return p;
}

function setup(S, p, psrc, ptoc, qs, navtype, svars) {
	View.setupwithnav(p, psrc, S, navtype);

	function movehandler(_) {
		qs.forEach(function(q) { q.build(); });
		document.location.hash = Bookmark.dump(S, svars);
	}

	p.addEventListener("zm-nav-move", movehandler);

	Dom.alisten(Classes.tocentry, function(e) {
		e.preventDefault();
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
			Assert.assert("Toc entry's c NaN or too great");
			return;
		}
		[S.move.ic, S.move.iw] = [c, 0];
		S.stack.push(S.move.cwv());
		p.build();
		movehandler();
		// XXX fragile
		Dom.hide(ptoc.children[1]);
	});
}

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

function mkbook(S) {
	var p = document.createElement("div");

	var svars = [
		{ bn : "c", sn : "move.ic", type : SVarType.Number },
		{ bn : "w", sn : "move.iw", type : SVarType.Number },
		{ bn : "b", sn : "book",    type : SVarType.String },
	];

	var ptitle   = mktitle(S);
	var psection = mksection(S);
	var pcn      = mkcn(S);
	var psrc     = View.mkbasiccc(S);
	var pdec     = View.mkstackvcuts(S);

	var pnav = document.createElement("div");

		var pnav0 = View.mknav(S, { type : "span", btns : [
			[ "⇦", MoveDir.Prev, MoveWhat.Chunk ],
			[ "←", MoveDir.Prev, MoveWhat.Word ]
		] });

		var ptoc = View.mkmodalbtnwith(S, mktoc(S), { text : "目錄" });

		var pnav1 = View.mknav(S, { type : "span", btns : [
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
	p.id         = "main";

	p.classList.add("main-book");

	p.append(ptitle, psection, pcn, pnav, pfontsave, psrc, pdec);

	function xsetup() {
		setup(S, p, psrc, ptoc, [ptitle, psection, pcn], "basic", svars);
	}

	function xbuild() { pdec.build(); psrc.build(); }

	// S.book is provided upon bookmark loading, so fns() will
	// only be correct *after* bookmark loading (and hence why
	// it's not a static list)
	function fns() { return ["data/books/"+S.book+".src"]; }

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

function mk(tc) {
	// TODO: document (likely, used when going recursive)
	tc ||= User.prefs.tabs;

	return mkbook({
		stack    : Stack.mk(),
		move     : Move.mk(),
		tabsconf : tc,
		cache    : {},
	});
}

export {
	mk,
	mktitle,
	mksection,
	mkcn,
	mktoc,

	setup,
	init,
};
