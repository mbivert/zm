var Classes = (function() {
/*
 * This module only contain and export (HTML/CSS) class names
 * that are used throughout the codebase.
 *
 * Originally (cf. '../README.md:/^# History'), this was to
 * allow class names to be altered for the now abandonned browser
 * extension. Note that not all classes were used in the
 * extension: a bunch were added in later versions.
 *
 * Such classes are used to provide not specific CSS styling,
 * but also UI features.
 *
 * NOTE/TODO: Some of those have been deprecated already, some
 * seems to now be useless: all have been marked with a "TODO".
 */

return {
	/**
	 * Used to make clickable words that can be pushed on
	 * a stack and inspected. We register events handlers
	 * for those (Dom.alisten())
	 */
	"defword"      : "zhongmu-def-word",
	/**
	 * Same as before, but those allow to take a word already
	 * being inspected, and to start inspecting it again on the
	 * stack. This is because we have less space as we go down
	 * in the decomposition tree.
	 */
	"defwordtop"   : "zhongmu-def-word-top",

	/**
	 * A horizontal cut. There's a CSS rule for it, but the
	 * class is never assigned (TODO; see ../site/base/show.css:/hcut).
	 */
	"hcut"         : "zhongmu-hcut",

	/**
	 * A list of vertical cuts. Currently used only for CSS
	 * rules; see ../site/base/show.css:/vcuts.
	 */
	"vcuts"        : "zhongmu-vcuts",

	/**
	 * A vertical cut. Currently used only for CSS
	 * rules; see ../site/base/show.css:/vcut.
	 */
	"vcut"         : "zhongmu-vcut",

	/**
	 * The word part of a vcut. There's a CSS rule, but
	 * the class isn't applied in view.js TODO
	 */
	"word"         : "zhongmu-word",

	/**
	 * The word part of a vcut is itself separated in multiple
	 * elements. The wordtext corresponds to the actual word, ...
	 */
	"wordtext"     : "zhongmu-word-text",

	/**
	 * while the wordtextsup is a <sup></sup> containing
	 * the defwordtop that we aluded to earlier.
	 */
	"wordtextsup"  : "zhongmu-word-text-sup",

	/**
	 * The descr part of a hcut.
	 */
	"descr"        : "zhongmu-descr",

	/**
	 * And the decomps part of a hcut.
	 * TODO: the class seems to be set, but no CSS rules nor
	 * logic associated to them anymore.
	 */
	"decomps"      : "zhongmu-decomps",

	/**
	 * The descr part of a hcut contains an element which
	 * is the actual content of the descr: the descrcontent.
	 */
	"descrcontent" : "zhongmu-descr-content",

	/**
	 * Aside of the descrcontent, we have the descrheader,
	 * located above, which contains all the tab items.
	 */
	"descrheader"  : "zhongmu-descr-header",

	/**
	 * The decword are <a></a> on which an event handler
	 * can be registered (Dom.alisten()): those are the words
	 * located on the stack whcih can be decomposed when
	 * being clicked.
	 */
	"decword"      : "zhongmu-dec-word",

	/**
	 * Set to stroke images, but apparently for any images actually
	 * (e.g. old scripts); so TODO: rework the name.
	 * There's a CSS rule associated to it.
	 */
	"strokesimg"   : "zhongmu-strokes-img",

	/**
	 * In the header of a hcut, a tabitms is a collection
	 * of tabitm: it's essentially the rotating-header for
	 * a single "tab" of the header.
	 *
	 * Hence the header contains a list of tabitms, one
	 * per tab.
	 */
	"tabitms"      : "zhongmu-tab-items",

	/**
	 * A single tab-itm, stored under a tabitms.
	 */
	"tabitm"       : "zhongmu-tab-item",

	/**
	 * Class which can be set on a tabitms indicating
	 * whether the tabitm is being active.
	 *
	 * TODO: this is correctly set/unset, but currently unused
	 * (no CSS rules). IIRC, there's a todo entry about making
	 * it a more visible.
	 */
	"tabactive"    : "zhongmu-tab-active",

	/**
	 * This is set on the "sound entry" of a dictionary, aka
	 * the pinyin so far. An event handler is registered to
	 * play the corresponding audio file.
	 */
	"audio"        : "zhongmu-audio",

	/**
	 * Used on the index page: it's the definition associated to
	 * a dict entry that has been searched (using the "Search" button).
	 */
	"searchdefs"   : "zhongmu-search-defs",

	/**
	 * Probably for the ToC x button: there's a CSS rule, but
	 * it's never set: we should now be using the generic modal
	 * "component" for the ToC, so it's likely that this can
	 * be trimmed (TODO)
	 */
	"tocclose"     : "zhongmu-toc-close",

	/**
	 * This now seems to be unused. TODO
	 */
	"toccontent"   : "zhongmu-toc-content",

	/**
	 * Used to register click handlers so as to navigate
	 * in the book via the ToC.
	 */
	"tocentry"     : "zhongmu-toc-entry",

	/**
	 * Element containing the ToC title ("目錄"). Currently
	 * unused (TODO)
	 */
	"toctitle"     : "zhongmu-toc-title",

	/**
	 * TODO: there's a CSS rule associated to this; from a comment,
	 * used to be set on psrc (mkbasicccc()). See if still relevant.
	 */
	"navigateable" : "zhongmu-navigateable",

	/**
	 * Used to style the element containing the navigation buttons
	 * in a book/translated book.
	 */
	"navbtns"      : "zhongmu-nav-btns",

	/**
	 * Single nav that are within a decomposition (e.g. Shuowen)
	 */
	"subsinglenav" : "zhongmu-sub-single-nav",

	/**
	 * Both of those are used when zm is used as an external
	 * lib, to decompose characters on external websites: respectively
	 * for:
	 *	- a single navigation component;
	 *	- a single word component.
	 */
	"singlenav"    : "zhongmu-single-nav",
	"singleword"   : "zhongmu-single-word",

	/**
	 * Highlight current word.
	 */
	"hlcw"         : "zhongmu-hl-cw",

	/**
	 * Highlight current piece.
	 */
	"hlcp"         : "zhongmu-hl-cp",

	/**
	 * Matching even pieces
	 */
	"okep"         : "zhongmu-ok-ep",

	/**
	 * Matching odd pieces
	 */
	"okop"         : "zhongmu-ok-op",

	/**
	 * Mismatching even pieces
	 */
	"koep"         : "zhongmu-ko-ep",

	/**
	 * Mismatching odd pieces.
	 */
	"koop"         : "zhongmu-ko-op",

	/**
	 * Both are used to stylize the login page.
	 */
	"account" : "zhongmu-account",
	"twocols" : "zhongmu-two-columns",
};

})();
