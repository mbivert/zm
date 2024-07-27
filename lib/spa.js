var SPA = (function () {

/**
 * @type{Object.<string,SPAPage>}
 */
let pages = {
	"index"  : {
		"mk"    : ViewIndex.mk,
		"title" : "Chinese character inspection",
	},
	"book"   : {
		"mk"    : ViewBook.mk,
		"title" : "Book viewing",
	},
	"trbook" : {
		"mk"    : ViewTrBook.mk,
		"title" : "Translated book viewing",
	},
	"help"   : {
		"mk"    : ViewHelp.mk,
		"title" : "Help",
	},
	"about"  : {
		"mk"    : ViewAbout.mk,
		"title" : "About",
	},
	"books"  : {
		"mk"    : ViewBooks.mk,
		"title" : "Books",
	},
};

/**
 * Navigate to a given page. The page should exists
 * in the `pages` hash.
 *
 * The navigation cleans the `id="main"` node, and rebuilds
 * it with the constructor associated to the page pointed
 * by `to`.
 *
 * @param{string} [to]
 * @returns{Promise<HTMLElement>} - resolved once the page is loaded; rejected in case of error
 */
function navigate(to) {
	if (to === undefined)
		to = "index";

	// That's clumsy :shrug:
	// (This resets things to what's in zm.css)
	document.body.style.height   = "";
	document.body.style.overflow = "";

	document.getElementsByTagName("html")[0].style.height   = "";
	document.getElementsByTagName("html")[0].style.overflow = "";

	to = to.replace(/#.*$/,    "");
	to = to.replace(/\.html$/, "");
	to = to.replace(/^\/+/,    "");

	if (to === "")
		to = "index";

	if (!(to in pages))
		return Promise.reject("unknown page name \""+to+"\"");

	let mk = /** (args0 ?:any) => HTMLElement */ pages[to].mk;

	Dom.loading()
	let p = mk();

	// Some pages (book/trbook) will fetch additional
	// data; their mk() will return a Promise wrapping
	// the final HTMLElement.
	//
	// TODO: we need to handle the error cases better;
	// in particular, in case of failure, Dom.loading()
	// will keep on rotating, and the error messages if
	// any are only in the JS console.
	return Promise.resolve(p).then(function(p) {
		// TODO: this shouldn't be done in e.g. View ../modules/view/book.js:main
		p.setAttribute("id", "main");
		Dom.getbyid("main").replaceWith(p);
		Dom.loaded();
		// TODO: include book title if any
		Dom.settitle("Zhongmu - "+pages[to].title);
		return p;
	});
}

/**
 * @param{string} [to]
 * @param{string} [root]
 * @param{UserPrefs} [prefs]
 * @returns{Promise<HTMLElement>}
 */
function init(to, root, prefs) {
	if (root)
		// @ts-ignore
		Config.root = root;
	if (prefs) User.setprefs(prefs);

	// TODO: extract view/grid.js's mkimgs() mechanism to dom.js
	// and use this instead?
	if (User.prefs.fonts.length)
		Dom.loadfont(Config.root+"/data/fonts/"+User.prefs.fonts[0])

	// XXX/hack demonstration
	// (IIRC this is because of the Russian book?)
	var s = Bookmark.preload((document.location.hash || "#").slice(1));
	if (s.b && User.prefs && User.prefs.books && s.b in User.prefs.books)
	if (User.prefs.books[s.b] && User.prefs.books[s.b].tabs !== undefined)
		// @ts-ignore
		User.prefs.tabs = User.prefs.books[s.b].tabs;

	// probably preferable to do that once we've got
	// a page correctly initialized :shrug:
	function handlenavigate() {

		// Still too early (2024-07-25)
		//	https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
		//
		// Can't figure out a way to make dark incantations work:
		//	https://stackoverflow.com/a/52809105
		//
		// So we're doing it old-fashioned.
/*
		window.navigation.addEventListener("navigate", function(e) {
			e.preventDefault();
			console.log(e);
			console.log('location changed!');
		});
*/

		document.addEventListener("click", function(e) {
			if (!(e.target instanceof HTMLElement)) return true;
			if (!(e instanceof PointerEvent))       return true;

			if (e.target.tagName !== "A")
				return;

			console.log(e);

			// That's clumsy: we setup a listener on document
			// via Dom.alisten() in '../modules/view/book.js:/^function setup/'
			// and so such events which theoretically shouldn't come up
			// do come up
			if (e.target.classList.contains(Classes.tocentry))
				return;

			console.log("here", e);

			let link = e.target.getAttribute("href") || "";

			// So far we have nothing else (mailto:, ftp (...), etc.) so
			// this should work
			if (!link.startsWith("http://") && !link.startsWith("https://")) {
				console.log("don't go up!");
				e.preventDefault();
				e.stopPropagation();
				// window.location = ... would actually trigger
				// a navigation to said page.
				//
				// It's important to alter the URL now, before
				// we call navigate(), because the URL is likely
				// to contain a bookmark.
				window.history.pushState(link, "TODO", link);
				SPA.navigate(link);
			}
		});

		// going back in the history
		window.addEventListener("popstate", function(e) {
			e.preventDefault();
			e.stopPropagation();
			console.log(e)

			SPA.navigate(window.location.pathname);
		});
	}

	Dom.loading();
	return Data.init(User.getnames()).then(function() {
		return SPA.navigate(to);
	}).then(function(p) {
		handlenavigate();
		return p;
	});
}

return {
	"init"     : init,
	"pages"    : pages,
	"navigate" : navigate,
};})();
