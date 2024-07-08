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
 * NOTE/TODO: we could/should document all those properly.
 */

let defword      = "zhongmu-def-word";
let defwordtop   = "zhongmu-def-word-top";
let hcut         = "zhongmu-hcut";
let vcuts        = "zhongmu-vcuts";
let vcut         = "zhongmu-vcut";
let word         = "zhongmu-word";
let wordtext     = "zhongmu-word-text";
let singleword   = "zhongmu-single-word";
let wordtextsup  = "zhongmu-word-text-sup";
let descr        = "zhongmu-descr";
let decomps      = "zhongmu-decomps";
let decword      = "zhongmu-dec-word";
let strokesimg   = "zhongmu-strokes-img";
let toggledefs   = "zhongmu-toggle-defs";
let toggleimgs   = "zhongmu-toggle-imgs";
let toggleexts   = "zhongmu-toggle-exts";
let togglepict   = "zhongmu-toggle-pict";
let descrheader  = "zhongmu-descr-header";
let descrcontent = "zhongmu-descr-content";
let tabitms      = "zhongmu-tab-items";
let tabitm       = "zhongmu-tab-item";
let tabitmdata   = "zhongmu-tab-item-data";
let tabitmdecomp = "zhongmu-tab-item-decomp";
let tabactive    = "zhongmu-tab-active";
let audio        = "zhongmu-audio";
let hlcw         = "zhongmu-hl-cw";
let hlcp         = "zhongmu-hl-cp";
let okep         = "zhongmu-ok-ep";
let okop         = "zhongmu-ok-op";
let koep         = "zhongmu-ko-ep";
let koop         = "zhongmu-ko-op";
let searchdefs   = "zhongmu-search-defs";
let tocclose     = "zhongmu-toc-close";
let tocentry     = "zhongmu-toc-entry";
let toccontent   = "zhongmu-toc-content";
let toctitle     = "zhongmu-toc-title";
let navigateable = "zhongmu-navigateable";
let navbtns      = "zhongmu-nav-btns";
// single nav that are within a decomposition
let subsinglenav = "zhongmu-sub-single-nav";
// XXX unused but in external page with a single nav
let singlenav    = "zhongmu-single-nav";

export {
	defword,
	defwordtop,
	hcut,
	vcuts,
	vcut,
	word,
	wordtext,
	singleword,
	wordtextsup,
	descr,
	decomps,
	decword,
	strokesimg,
	toggledefs,
	toggleimgs,
	toggleexts,
	togglepict,
	descrheader,
	descrcontent,
	tabitms,
	tabitm,
	tabitmdata,
	tabitmdecomp,
	tabactive,
	audio,
	hlcw,
	hlcp,
	okep,
	okop,
	koep,
	koop,
	searchdefs,
	tocclose,
	tocentry,
	toccontent,
	toctitle,
	navigateable,
	navbtns,
	subsinglenav,
	singlenav,
};
