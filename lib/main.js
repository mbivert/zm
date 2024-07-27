var Main = (function() {

/*
 * NOTE: this used to contain what's now in ../lib/spa.js;
 * it's now only used as entry points over view.js, for when
 * zm is used as a lib on external websites.
 *
 * TODO: we may be able to plug this in view.js directly.
 */

/**
 * Kept here because it's being used e.g. on tales (zm-as-a-lib).
 *
 * XXX/TODO: there's definitely overlap with SPA.init()
 *
 * @param{string} [root]
 * @param{UserPrefs} [prefs]
 */
function init(root, prefs) {
	if (root)
		// @ts-ignore
		Config.root = root;
	if (prefs) User.setprefs(prefs);
	return Data.init(User.getnames());
}
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

return {
	"init"      : init,
	"single"    : single,
	"singlenav" : singlenav,
	"singles"   : singles,
};

})();
