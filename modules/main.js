import * as ViewTrBook    from "../modules/view/trbook.js";
import * as ViewBook      from "../modules/view/book.js";
import * as ViewIndex     from "../modules/view/index.js";
import * as View          from "../modules/view.js";
import * as Config        from "../modules/config.js";
import * as User          from "../modules/user.js";
import * as Data          from "../modules/data.js";
import * as Cut           from "../modules/cut.js";
import * as Dom           from "../modules/dom.js";
import * as Bookmark      from "../modules/bookmark.js";
import * as Utils         from "../modules/utils.js";
import * as Classes       from "../modules/classes.js";

/**
 * @param{string} [root]
 * @param{UserPrefs} [prefs]
 */
function init(root, prefs) {
	if (root)
		// @ts-ignore
		Config.root = root;
	if (prefs) User.setprefs(prefs);

	Dom.loading();
	return Data.init(User.getnames()).then(function() {
		Dom.loaded();
	});
}

/**
 * @param{string} page
 */
function main(page) {
	// TODO: extract view/grid.js's mkimgs() mechanism to dom.js
	// and use this instead?
	if (User.prefs.fonts.length)
		Dom.loadfont(Config.root+"/data/fonts/"+User.prefs.fonts[0])

	// XXX/hack demonstration
	var s = Bookmark.preload((document.location.hash || "#").slice(1));
	if (s.b && User.prefs && User.prefs.books && s.b in User.prefs.books)
	if (User.prefs.books[s.b] && User.prefs.books[s.b].tabs !== undefined)
		// @ts-ignore
		User.prefs.tabs = User.prefs.books[s.b].tabs;

	init().then(function() {
		var p;

		Dom.loading();

		switch(page) {
		case "book":   p = ViewBook.mk();                  break;
		case "index":  p = ViewIndex.mk();                 break;
		case "trbook": p = ViewTrBook.mk();                break;
		// the help component by default has no id, as it can be
		// embedded everywhere.
		case "help":   p = View.mkhelp(); p.id = "main";   break;
		default:
			console.log("Unknown page: "+page);
			return;
		}

		// book/trbook fetch additional data and thus
		// their mk returns a Promise.
		Promise.resolve(p).then(function(p) {
			Dom.getbyid("main").replaceWith(p);
			Dom.loaded();
		});
	});
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
	var q = View.mksinglenav(s);
//	q.id = p.id;
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
	var q = View.mksingle(w);
//	q.id = p.id;
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
	init,
	main,
	single,
	singlenav,
	singles,
};
