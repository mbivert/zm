import * as Bookmark from "../../modules/bookmark.js";
import * as Data     from "../../modules/data.js";
import * as User     from "../../modules/user.js";
import * as Stack    from "../../modules/stack.js";
import * as Move     from "../../modules/move.js";
import * as Assert   from "../../modules/assert.js";
import * as Dom      from "../../modules/dom.js";
import * as Classes  from "../../modules/classes.js";
import * as View     from "../../modules/view.js";
import * as ViewBook from "../../modules/view/book.js";

import { SVarType, ChunkType } from "../../modules/enums.js";
import { MoveWhat, MoveDir }   from "../../modules/enums.js";

/**
 * Retrieve current piece as srcp indexes.
 *
 * Return an array of two integers slicing A.srcpcs (!),
 * so the first integer corresponds to the current piece.
 *
 * NOTE: this is used in mktrbook() to move from piece to
 * piece, hence why it's not confined to mkpcscc()
 *
 * @param{TranslatedBookState} S
 * @returns{[number, number]}
 */
function getcp(S) {
	var n = S.move.cw().j;

	for (var i = 0, j = 1; j < S.srcpcs[S.move.ic].length; i++, j++)
		if (n >= S.srcpcs[S.move.ic][i] && n <= S.srcpcs[S.move.ic][j])
			return [i, j];

	Assert.assert("getcp(): current word is not a piece?");
	return [-1, -1];
}

/**
 * We're using the same mkpcscc() to handle both the source
 * and the translated book.
 *
 * The "n" parameter will thus picks on S the data relevant to
 * either the source or translated book.
 *
 * @param{TranslatedBookState} S
 * @param{{ pcs : () => Pieces, cc : (ic ?: number) => Chunk, hlcw ?: boolean}} n
 * @returns{BuildableHTMLElement}
 */
function mkpcscc(S, n) {
	var p = Dom.mkbuildable("div");

	function build() {
		// We need utf8 character arrays for slicing
		// to work properly, e.g. bugs on 𡕥：舉
		var s   = [...n.cc().v];
		var pcs = n.pcs();

		p.innerHTML = '';
		for (var i = 0, j = 1; j < pcs[S.move.ic].length; i++, j++)
			p.appendChild(Dom.mkspan(s.slice(pcs[S.move.ic][i], pcs[S.move.ic][j]).join("")));

		hlps();
		hlcp();
		// TODO have it be a function?
		if (n.hlcw) hlcw();
	}

	// TODO (disabled)
		/*
		 * Add a new piece separator in p at the given offset i.
		 *
		 * type{ViewTrBook["pcut"]}
		 */
/*
		pcut : function(p, i) {
			return Utils.orderedinsert(p[T.m.ic], i);
		},
*/
		/*
		 * Remove piece separator at offset i from p.
		 *
		 * type{ViewTrBook["pjoin"]}
		 */
/*
		pjoin : function(p, i) {
			p[T.m.ic] = p[T.m.ic].filter(function(x) {
				return x != i;
			});
		},
*/

	/**
	 * Return true if we source and translation are
	 * both cut into the same amount of pieces.
	 *
	 * @type{() => boolean}
	 */
	function piecesok() {
		return S.srcpcs[S.move.ic].length == S.trpcs[S.move.ic].length;
	}

	/**
	 * Highlight odd/even pieces in currently loaded chunk.
	 *
	 * NOTE: re-highlighting everything every time we move,
	 *       that is, performing hlcp() here and calling hlpieces()
	 *       in hl(), is noticeably too slow. Tested with one span
	 *       per letter in ptr/psrc. Changing chunk actually gives
	 *       an idea of how slow the process is.
	 *
	 * @type{() => void}
	 */
	function hlps() {
		var c0 = piecesok() ? Classes.okep : Classes.koep;
		var c1 = piecesok() ? Classes.okop : Classes.koop;

		var pcs = n.pcs();

		/*
		 * [a]       : impossible,
		 * [a, b]    : one piece,
		 * [a, b, c] : two pieces,
		 * etc. hence -1.
		 */
		for (var i = 0; i < pcs[S.move.ic].length-1; i++) {
			var c = (i % 2  == 0) ? c1 : c0;
			p.children[i].classList.add(c);
		}
	}

	/**
	 * Highlight current word.
	 *
	 * @type{() => void}
	 */
	function hlcw() {
		var x = getcp(S)[0];

		// We need an utf8 character array for slicing
		// to work properly, e.g. bugs on 𡕥：舉
		var s = [...(p.children[x].textContent || "")];

		var q = /** @type{HTMLElement} */ (p.children[x]);

		/*
		 * T.m.cw().i/j are offset from chunk; also we're always
		 * calling hlcw() when all pieces are wrapped into a
		 * single <span>.
		 */
		var k      = Dom.countpieceoffset(q);
		var [i, j] = [S.move.cw().i-k, S.move.cw().j-k]

		var a = Dom.mkspan(s.slice(0, i).join(""));
		var b = Dom.mkspan(s.slice(i, j).join(""));
		var c = Dom.mkspan(s.slice(j, s.length).join(""));

		q.innerHTML = "";
		// a & c were manually set to p's background (XXX old comment?)
		b.classList.add(Classes.hlcw);

		q.append(a, b, c);
	}

	/**
	 * Remove highlight on current word.
	 *
	 * @type{() => void}
	 */
/*
	function llcw() {
		var n = getcp(S)[0];
		var q = p.children[n];
		if (!(q instanceof HTMLElement)) {
			Assert.assert("psrc "+n+"th child isn'nt an HTMLElement");
			return;
		}
		q.innerHTML = q.innerText;
	}
*/

	/**
	 * Highlight current piece.
	 */
	function hlcp() {
		let x = getcp(S)[0];
		p.children[x].classList.add(Classes.hlcp);
		Dom.scrollintoview(p, x);
	}

		/**
		 * Remove highlight on current piece.
		 *
		 * @type{() => void}
		 */
/*
		llcp : function() {
			var n = T.getcp(S)[0];

			T.psrc.children[n].classList.remove(Classes.hlcp);
			T.ptr.children[n].classList.remove(Classes.hlcp);
		},
*/

	function setup() { View.listenmousemove(p); }

	setup();

	p.build = build;

	return p;
}

/**
 * @param{TranslatedBookState} S
 * @returns{Promise<MovableBuildableHTMLElement>}
 */
function mktrbook(S) {
	var p = Dom.mkmovablebuildable("div");

	var svars = [
		{ bn : "c", sn : "move.ic", type : SVarType.Number },
		{ bn : "w", sn : "move.iw", type : SVarType.Number },
		{ bn : "b", sn : "book",    type : SVarType.String },
	];

	var ptitle   = ViewBook.mktitle(S);
	var psection = ViewBook.mksection(S);
	var pcn      = ViewBook.mkcn(S);
	var psrc     = mkpcscc(S, {
		pcs  : function()   { return S.srcpcs;      },
		/** @type{(ic ?: number) => Chunk} */
		cc   : function(ic) { return S.move.cc(ic); },
		hlcw : true,
	});
	var pdec     = View.mkstackvcuts(Object.assign({}, S, {
		ts : [],
	}));
	var ptr      = mkpcscc(S, {
		pcs : function() { return S.trpcs; },
		// XXX used to be called trcc (in case); do we need the ic
		// parameter?
		/** @type{(ic ?: number) => Chunk} */
		cc : function(ic) {
			return S.trcs[ic === undefined ? S.move.ic : ic];
		}
	});

	var pnav = document.createElement("div");

		var pnav0 = View.mknav({ type : "span", btns : [
			[ "⇦", MoveDir.Prev, MoveWhat.Chunk ],
			[ "⟵",  MoveDir.Prev, MoveWhat.Piece ],
			[ "←", MoveDir.Prev, MoveWhat.Word  ]
		] });

		var ptoc = View.mkmodalbtnwith(ViewBook.mktoc(S), { text : "目錄" });

		var pnav1 = View.mknav({ type : "span", btns : [
			[ "→", MoveDir.Next, MoveWhat.Word  ],
			[ "⟶",  MoveDir.Next, MoveWhat.Piece ],
			[ "⇨", MoveDir.Next, MoveWhat.Chunk ]
		]});

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
	ptr.id       = "tr";

	p.classList.add("main-trbook");

	p.append(ptitle, psection, pcn, pnav, pfontsave, psrc, pdec, ptr);

	function setup() {
		ViewBook.setup(S, p, psrc, ptoc, [ptitle, psection, pcn], "pcs", svars);
	}

	function build() { pdec.build(); psrc.build(); ptr.build(); }

	/**
	 * Create one piece for each chunck.
	 *
	 *	md : parsed markup
	 *	Pieces in srcp/trp format, so that each chunk
	 *	is exactly covered by one piece.
	 *
	 * @param{TokedChunks} md
	 * @returns{Pieces}
	 */
	function mkdefpieces(md) {
		return md.map(function(x) {
			return [0, [...x.v].length];
		});
	}

	/**
	 * @param{string} tr - translated book (markdown)
	 * @param{string} pcs - Pieces, JSON-encoded
	 */
	function inittr(tr, pcs) {
		S.trcs = Data.parseandtok(tr);

		[S.srcpcs, S.trpcs] = JSON.parse(pcs);

		// TODO: to be improved once we allow user to edit src/tr
		if (S.move.cs.length != S.trcs.length)
			throw "assert: src/tr chunks mismatch"

		// Default pieces
		if (!S.srcpcs || S.srcpcs.length == 0) S.srcpcs = mkdefpieces(S.move.cs);
		if (!S.trpcs  || S.trpcs.length  == 0) S.trpcs  = mkdefpieces(S.trcs);

		if (S.srcpcs.length != S.trpcs.length)
			throw "assert: srcp/trp chunks mismatch"

		// TODO: we should ensure provided pieces don't go beyond
		// the chunks; do so here. If only last element going beyond,
		// noisily warn but automatically fix.

		// All the others have been built already, and we need
		// S.pcs to build psrc
		ptr.build();
		psrc.build();
	}

	function fns() { return [
		"data/books/"+S.book+".src",
		"data/books/"+S.book+".tr",
		"data/books/"+S.book+".pcs"
	]; }

	function init() {
		return ViewBook.init(
			S, [pdec, ptitle, psection, pcn, ptoc],
			svars, fns
		).then(function(xs) { inittr(xs[1], xs[2]); });
	}

	// Wrap S.move.move() to support moving from piece to piece
	/** @type{MoveFun} */
	function move(d, w) {
		if (w != "piece") return S.move.move(d, w);

		var [i, j] = getcp(S);

		/*
		 * TODO/XXX: we're assuming there are no empty pieces,
		 * which is never asserted/tested anywhere (still true?)
		 */
		if (d == MoveDir.Prev) return (i == 0)
			// @ts-ignore
			? S.move.move(MoveDir.Prev, MoveWhat.Chunk)
			// @ts-ignore
			: S.move.move(MoveDir.Offset, S.srcpcs[S.move.ic][i]-1);

		else return (j == S.srcpcs[S.move.ic].length-1)
			// @ts-ignore
			? S.move.move(MoveDir.Next, MoveWhat.Chunk)
			// @ts-ignore
			: S.move.move(MoveDir.Offset, S.srcpcs[S.move.ic][j]+1);
	}

	// for setupwithnav
	p.build = build;
	p.move  = move;

	setup();
	return init().then(function() { return /** @type{MovableBuildableHTMLElement} */ (p); });
}

/**
 * @param{TabsConf} [tc]
 * @returns{Promise<MovableBuildableHTMLElement>}
 */
function mk(tc) {
	return mktrbook({
		stack    : Stack.mk(),
		move     : Move.mk(),
		// TODO: document (likely, used when going recursive)
		tabsconf : tc ||= User.prefs.tabs,
		cache    : {},
		hasstack : false,
		trcs     : [],
		trpcs    : [],
		srcpcs   : [],
		book     : "",
		ts       : [],
	});
}

export {
	mk,
};
