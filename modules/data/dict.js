import * as Utils from "../../modules/utils.js";

/**
 * Remove ys entries from xs; keeping track of ys
 * entries that aren't found in xs.
 *
 * We work on a xs copy, as we don't want to alter the
 * underlying dicts being used.
 *
 * @param{Array<string>} xs -
 * @param{Array<string>} ys
 * @returns{[Array<string>, Array<string>]} - altered copy of xs, and missing entries
 */
function chainrm(xs, ys) {
	let ms = [];

	let zs = Utils.copyarray(xs);

	for (var i = 0; i < ys.length; i++) {
		var found = false;

		// Try to remove ys[i] from zs
		for (var j = 0; j < zs.length; j++)
			if (zs[j] == ys[i]) {
				zs.splice(j, 1);
				found = true;
				break;
			}

		// Keep track of missed entries.
		if (!found) ms.push(ys[i]);
	}

	return [zs, ms];
}

/**
 * Creates a DictSoundEntry by patching multiple entries.
 *
 * NOTE: we've changed the semantic from previous implementation (how so...)
 *
 * @param{Array<DictSoundEntry>} xs
 * @returns{[DictSoundEntry, Array<string>]} - also returns missing entries
 */
function chainsound(xs) {
	/** @type{DictSoundEntry} */
	let r = { ds : [] };

	// Missing entries
	let ms = [];

	for (let i = 0; i < xs.length; i++) {
		// Remove xs[i]'s entries from r.ds
		if (xs[i].rm) {
			let es = [];
			[r.ds, es] = chainrm(r.ds, xs[i].ds);
			ms.push(...es);
			r.tw = true;
		}

		// XXX We could ensure unicity (hasn't been an issue so far)
		else r.ds.push(...xs[i].ds);
	}

	return [r, ms];
}

/**
 * Create a DictEntry by patching all those from e pointed
 * by dictionary names contained in xs.
 *
 * @param{DictsEntries}   e
 * @param{Array<string>} xs
 * @returns{[DictEntry, Array<string>]}
 */
function chain(e, xs) {
	/**
	 * Returned entry.
	 *
	 * @type{DictEntry}
	 */
	let r = {};

	/**
	 *
	 *
	 * @type{Object<string, DictSoundEntries>}
	 */
	let ps = {};

	/**
	 *
	 *
	 * @type{Array<string>}
	 */
	let ms = [];

	// In e, we have dict name -> sound -> defs;.
	//
	// We want here sound -> [defs], for each defs
	// registered in dicts for that sound.
	for (var i = 0; i < xs.length; i++)
		if (xs[i] in e) Object.keys(e[xs[i]]).forEach(function(p) {
			if (!(p in ps)) ps[p] = [];
			ps[p].push(...e[xs[i]][p]);
		});

	// Actually chain those definitions
	Object.keys(ps).forEach(function(p) {
		let es = [];
		r[p] = [{ds:[]}];
		[r[p][0], es] = chainsound(ps[p]);
		ms.push(...es);
	});

	return [r, ms];
}

export {
	chainrm,
	chainsound,
	chain,
};
