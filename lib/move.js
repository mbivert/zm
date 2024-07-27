var Move = (function() {
/*
 * We're not using genuine class-based/prototype based OOP
 * as they're too constraining for our purposes regarding
 * "optimal" code sharing.
 *
 * We're also avoid `this` because of its implicit nature
 * in JS, and use explicit closures to wrap state object instead.
 *
 * Hopefully, this will make the code easier to understand,
 * albeit less idiomatic.
 *
 * You may want to look at interfaces and documentation in ../lib.d.ts
 */

/**
 * "Constructor" for a Movable.
 *
 * NOTE: if cs isn't provided, object is considered uninitialized,
 * and caller is responsible to initialize it by calling init();
 * mk()'s parameters are provided as convenience.
 *
 * TODO: see if we keep them; they're unused so far.
 *
 *	@param{Movable["cs"]} [cs] - input chunks
 *	@param{Movable["ic"]} [ic] - current chunk number
 *	@param{Movable["iw"]} [iw] - current word number in current chunk
 *
 *	@returns{Movable}
 */
function mk(cs, ic, iw) {
	/** @type{Movable} */
	var M = {};

	/**
	 * Update/re-initialize state from given input.
	 *	 *
	 * @type{Movable["init"]}
	 */
	M.init = function(cs, ic, iw) {
		/*
		 * TODO: encode assertions in typing (NonEmptyArray should
		 * be do-able).
		 *
		 * - Chunks array is indexed at least by ic=0
		 * - Tokens are indexed by iw=0 at least
		 * - movew() skip punctuations; we would have issues with
		 *   entries containing only puncts. We're being stricter here.
		 *
		 * NOTE: last assertion is dependant upon default movement
		 * choice: were we to systematically enable movecw (defined later,
		 * not used yet), we would need to assert that we there's at
		 * least one chinese character somewhere in cs.
		 */
		Assert.assert("Movable chunk list is empty", cs.length > 0);
		for (var i = 0; i < cs.length; i++) {
			Assert.assert(
				"M.update: chunk "+i+" has no tokens",
				cs[i].ts.length > 0,
			);

			var ok = false;
			for (var j = 0; j < cs[i].ts.length; j++)
				if (cs[i].ts[j].t != TokenType.Punct) {
					ok = true; break
				}
			Assert.assert("M.update: chunk "+i+" only has puncts token", ok)
		}

		/**
		 * Chunks.
		 * @type{Movable["cs"]}
		 */
		M.cs = cs;

		/**
		 * Current chunk/word in current chunk indexes
		 * @type{Movable["ic"]}
		 */
		M.ic = ic === undefined ? 0 : ic;

		/** @type{Movable["iw"]} */
		M.iw = iw === undefined ? 0 : iw;

		// We'll be indexing arrays with those. This isn't
		// critical as we'll be using sanitized ic/iw, but
		// this should not happens.
		Assert.assert("M.update: negative ic", M.ic >= 0);
		Assert.assert("M.update: negative iw", M.iw >= 0);

		// Sanitize entries
		M.ic = Utils.putin(M.ic, 0, M.cn()-1);
		M.iw = Utils.putin(M.iw, 0, M.wn()-1);
	};

	/**
	 * Number of chunks.
	 * @type{Movable["cn"]}
	 */
	M.cn = function()   { return M.cs.length; }

	/**
	 * Number of words in a given chunk.
	 * @type{Movable["wn"]}
	 */
	M.wn = function(ic) {
		return M.cs[ic === undefined ? M.ic : ic].ts.length;
	}

	/**
	 * Current chunk.
	 *
	 * @type{Movable["cc"]}
	 */
	M.cc = function(ic) {
		return M.cs[ic === undefined ? M.ic : ic]
	}

	/**
	 * Current word in current chunk.
	 *
	 * @type{Movable["cw"]}
	 */
	M.cw = function(ic, iw) {
		return M.cs[ic === undefined ? M.ic : ic].ts[iw === undefined ? M.iw : iw];
	}

	/**
	 * Current word in current chunk, as a string.
	 * Used for the web UI.
	 *
	 * @type{Movable["cwv"]}
	 */
	M.cwv = function(ic, iw) { return M.cw(ic, iw) ? M.cw(ic, iw).v : ""; }

	/**
	 * Move until given predicate is met.
	 *
	 * NOTE: Log.debug calls are disabled because they noticeably slow
	 * things down (measured) when moving from chunk to chunk, because
	 * M.movec() is achieved by calling M.movep() until we actually change
	 * chunks. This may be a performance issue later on if/when working with
	 * big chunks; kept as-is for now because of design clarity/uniformity.
	 *
	 * This should almost never be called directly;
	 * move() (cf. below) should be the public interface.
	 *
	 * @type{Movable["movep"]}
	 */
	M.movep = function(d, p, ic, iw) {
		// XXX ic not tested (there has been a bug on iw)
		if (ic === undefined) ic = M.ic;
		if (iw === undefined) iw = M.iw;

		// Can't move further; predicate wasn't met: impossible move
		if (d == MoveDir.Next && ic == M.cn()-1 && iw == M.wn()-1) return [-1, -1];
		if (d == MoveDir.Prev && ic == 0        && iw == 0)        return [-1, -1];

//		Log.debug("movep, before: ic:"+iw+" iw:"+iw);

		/* Move one step. */
		switch(d) {
		case MoveDir.Next:
			if (iw < M.wn()-1) {       iw++;             }
			else               { ic++; iw = 0;           }
			break;
		case MoveDir.Prev:
			if (iw > 0)        {       iw--;             }
			else               { ic--; iw = M.wn(ic)-1;  }
			break;
		case MoveDir.Offset:
		default:
			Assert.assert("movep() shouldn't work on offset (or should it?)");
			break;
		}

//		Log.debug("movep, after: ic:"+iw+" iw:"+iw);
//		Log.debug("movep, match: "+p(M, ic, iw));

		// Stop if predicate matches here.
		return p(M, ic, iw) ? [ic, iw] : M.movep(d, p, ic, iw);
	}

	/**
	 * Convenient shortcut.
	 *
	 * @type{(M : Movable, ic : number, iw : number) => boolean}
	 */
	function ispunct(M, ic, iw) { return M.cw(ic, iw).t == TokenType.Punct; }

	/**
	 * @type{MoveDirF}
	 */
	function movew(M, d, ic, iw) {
		return M.movep(d, function(M, jc, jw) {
			return !ispunct(M, jc, jw) && (jc != ic || jw != iw);
		}, ic, iw);
	}

	/**
	 * @type{MoveDirF}
	 */
	function movec(M, d, ic, iw) {
		return M.movep(d, function(M, jc, jw) {
			return !ispunct(M, jc, jw) && jc != ic;
		}, ic, iw);
	}

	/**
	 * @type{(
	 *	M : Movable, d : MoveDir, t : ChunkType, jc : number, jw : number
	 * ) => [number, number]}
	 */
	function movect(M, d, t, ic, iw) {
		return M.movep(d, function(M, jc, jw) {
			return !ispunct(M, jc, jw) && M.cc(jc).t == t && jc != ic;
		}, ic, iw);
	}

	/**
	 * @type{(M : Movable, o : number, ic : number, iw : number) => [number, number]}
	 */
	function moveo(M, o, ic, iw) {
		// special case: movep() always starts by moving before
		// checking predicate.
		if (o <= M.cw(ic, 0).j)
			return ispunct(M, ic, 0)
				// @ts-ignore
				? movew(M, MoveDir.Next, ic, 0)
				: [ic, 0]

		// Ensure we're not going beyond last chunk
		if (o >=  M.cw(M.ic, M.wn()-1).j)
			return ispunct(M, ic, M.wn()-1)
				// @ts-ignore
				? movew(M, MoveDir.Prev, ic, M.wn()-1)
				: [ic, M.wn()-1];

		// @ts-ignore
		var [jc, jw] = M.movep(MoveDir.Next, function(M, jc, jw) {
			return !ispunct(M, jc, jw) && ((jc != ic) || M.cw(jc, jw).j >= o);
		}, ic, 0);

		// Used to be a bug here with o at the end+1 of
		// last word of last chunk.
		Assert.assert("can move to offset", jc != -1);

		// Move to chunk's last word instead of going
		// to next chunk.
		// @ts-ignore
		return (jc == ic) ? [jc, jw] : movew(M, MoveDir.Prev, jc, 0);
	}

	/**
	 * Move
	 *
	 * @type{Movable["move"]}
	 */
	M.move = function(d, w) {
		/**
		 * @type{(t : ChunkType) => MoveDirF}
		 */
		function mkmovect(t) { return function(M, d, ic, iw) {
			return movect(M, d, t, ic, iw)
		}};

		/**
		 * NOTE: currently unused; do we even want/need?
		 * (to be called after a MoveDifF call).
		 *
		 * @type{MoveDirF}
		 */
		function movecw(M, d, ic, iw) {
			if (M.cw(ic, iw).t == TokenType.Chinese)
				return [ic, iw];
			return M.movep(d, function(M, jc, jw) {
				return M.cw(jc, jw).t == TokenType.Chinese && (jc != ic || jw != iw);
			}, ic, iw);
		}

		// XXX/TODO Perhaps we could avoid implementing this as
		// such a corner case, e.g. by having all move functions
		// to be M, d, w, ic, iw ?
		if (d == MoveDir.Offset) {
			// @ts-ignore
			if (isNaN(w)) {
				Assert.assert("move(): offset is NaN: "+w);
				return [-1, -1];
			}
			// @ts-ignore
			return moveo(M, w, M.ic, M.iw);
		}

		/**
		 * ~clumsy
		 * @type{MoveDirF}
		 */
		var f;
		switch(w) {
		case MoveWhat.Word:          f = movew;                             break;
		case MoveWhat.Chunk:         f = movec;                             break;
		case MoveWhat.Title  :       f = mkmovect(ChunkType.Title);         break;
		case MoveWhat.Section:       f = mkmovect(ChunkType.Section);       break;
		case MoveWhat.Subsection:    f = mkmovect(ChunkType.Subsection);    break;
		case MoveWhat.Subsubsection: f = mkmovect(ChunkType.Subsubsection); break;
		default:
			Assert.assert("move(): unexpected 'what': "+w);
			return [-1, -1];
		}

		var [jc, jw] = f(M, d, M.ic, M.iw);

		// Failed predicate
		if (jc == -1) return [M.ic, M.iw]

		return [jc, jw];
	}

	if (cs !== undefined)
		M.init(cs, ic, iw);

	return M;
}

return {
	"mk" : mk,
};

})();
