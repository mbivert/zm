import * as View          from "../modules/view.js";
import * as Classes       from "../modules/classes.js";

/*
 * NOTE: this used to contain what's now in ../lib/spa.js;
 * it's now only used as entry points over view.js, for when
 * zm is used as a lib on external websites.
 *
 * TODO: we may be able to plug this in view.js directly.
 */

/**
 * Render a ViewSingleNav for given input, at given
 * location in the DOM.
 *
 * @param{string}           s - word to analyse
 * @param{HTMLElement} p      - pointer to installation node
 *
 * @returns{void}
 */
function singlenav(s, p) {
	let q = View.mksinglenav(s);
	// a bit clumsy
	q.classList.add(Classes.singlenav);
	p.replaceWith(q);
}

/**
 * Render a ViewSingle for given word at given
 * location in the DOM.
 *
 * @param{string}           w - word to analyse
 * @param{HTMLElement}      p - where to install
 *
 * @returns{HTMLElement}
 */
function single(w, p) {
	let q = View.mksingle(w);
	p.replaceWith(q);
	return q;
}

/**
 * Shortcut to create multiple single() all at once.
 *
 * @param{Array<[string, HTMLElement]>} xs
 * @returns{Array<HTMLElement>}
 */
function singles(xs) { return xs.map(function([w, p]) { return single(w, p) }); }

export {
	single,
	singlenav,
	singles,
};
