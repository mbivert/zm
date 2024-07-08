/*
 * Extension background script.
 *
 * 	- ensure reasonable memory footprint access to dict.csv
 *	  and decomp.csv
 *	- provides right-click menu entry for toggling reading mode
 */

#include "lib.js"
#include "libload.js"
#include "libcut.js"

/* Generic namespace */
var browser = browser || chrome;

/* ------------------------------------------------------------
 * Ressources access
 */

/*
 * Read a resource file accessible to browser extension.
 *
 * TODO: make a per-line reader stream to be more efficient.
 *
 * Input:
 *	path : path to file
 * Output:
 *	Promise wrapping file's content.
 */
function readres(path) {
	return fetch(browser.extension.getURL(path)).then(function(r) {
		var reader  = r.body.getReader();
		var out     = '';

		return reader.read().then(function pump(x) {
			if (x.done) return;
			out += new TextDecoder().decode(x.value);
			return reader.read().then(pump);
		}).then(function() { return out; });
	});
}

/*
 * Load decomp.csv file.
 *
 * Input:
 * 	path : path/to/decomp.csv [default: decomp.csv]
 * Output:
 *	Hash indexed by character for which there is a known
 *	decomposition; values are array of at most two elements,
 *	containing the direct sub-components.
 *	A character that only decomposes to itself (according to
 *	decomp.csv) is removed.
 *
 * 	Example:
 *		{
 *			丩  : [丨],
 *			-- 心 : [心], -- removed
 *
 *			您  : [你, 心],
 *			好 : [女, 子],
 *		}
 *
 */
function readdecomp(path) {
	return readres(path || "decomp.csv").then(mkdecomp);
}

/*
 * Load the Chinese dictionnary.
 *
 * TODO
 *
 * Input:
 * 	path : path/to/dict.csv
 * Output:
 *	Hash indexed by characters; values is an array of
 *	definition.
 */
function readdict(path) {
	return readres(path || "dict.csv").then(mkdict);
}

/* ------------------------------------------------------------
 * Messages-passing API
 */

/*
 * Message is a hash with two entries:
 *
 *	type : cut's type, either cut or cleancut.
 *	str  : string to cut
 *
 * Result is (obviously) a cut['s result].
 */
browser.runtime.onMessage.addListener(function(m, s, sr) {
	/*
	 * TODO Promise API broken on chrome, try firefox
	 * NOTE: doc says sr() is deprecated API
	 */
	switch(m.type) {
	case 'cut':
	case 'cleancut':
		Promise.all([readdecomp(), readdict()]).then(function(ds) {
		var c = cut(m.str, ds[0], mktdict(ds[1]));
			sr(m.type == 'cleancut' ? cleancut(c) : c);
		});
		break;
	case 'setpos':
#if 0
		browser.storage.local.get(s.url).then(function(x) {
			if (!x || x.ts > m.ts) return;
			var o = {}; o[s.url] = { wp : m.wp, ts : m.ts };
			return browser.storage.local.set(o);
		});
#endif
		browser.storage.local.get(s.url, function(x) {
			if (!x || x.ts > m.ts) return;
			var o = {}; o[s.url] = { wp : m.wp, ts : m.ts };
			browser.storage.local.set(o);
		});
		break;
	default:
		console.log("Unknown message", m);
	}

	return true
});

/* ------------------------------------------------------------
 * Menu
 */

function onCreated() {
	if (browser.runtime.lastError)
		console.log(browser.runtime.lastError);
}

browser.contextMenus.create({
	id       : "slice",
	title    : browser.i18n.getMessage("menuSlice"),
	contexts : ["all"],
}, onCreated);

browser.contextMenus.create({
	id       : "read-from-here",
	title    : browser.i18n.getMessage("menuReadFromHere"),
	contexts : ["all"],
}, onCreated);

browser.contextMenus.create({
	id       : "read-from-last",
	title    : browser.i18n.getMessage("menuReadFromLast"),
	contexts : ["all"],
}, onCreated);

browser.contextMenus.create({
	id        : "reading-mode",
	title     : browser.i18n.getMessage("menuEnableReading"),
	contexts  : ["all"]
}, onCreated);

/* reading mode enabled? */
var reading = false;

browser.contextMenus.onClicked.addListener(function(info, tab) {
	switch (info.menuItemId) {
	case "reading-mode":
		reading = !reading;
		browser.contextMenus.update("reading-mode", {
			title : browser.i18n.getMessage(
				reading ? "menuDisableReading" : "menuEnableReading"
			),
		});

		/*
		 * XXX/TODO raise an back error:
		 *
		 * Unchecked runtime.lastError: The message port
		 * closed before a response was received.
		 */
		chrome.tabs.sendMessage(tab.id, {
			reading: reading, here: false
		}, function() {});
		break;
	case "read-from-here":
		reading = true;
		browser.contextMenus.update("reading-mode", {
			title : browser.i18n.getMessage("menuDisableReading")
		});

		/*
		 * XXX/TODO error? see above
		 */
		chrome.tabs.sendMessage(tab.id, {
			reading: reading, here: true
		}, function() {});
		break;
	case "read-from-last":
		reading = true;
		browser.contextMenus.update("reading-mode", {
			title : browser.i18n.getMessage("menuDisableReading")
		});

		/*
		 * XXX/TODO error? see above
		 */
		browser.storage.local.get(tab.url, function(x) {
			var wp = x ? x[tab.url].wp : 0;
			chrome.tabs.sendMessage(tab.id, {
				reading: reading, here: false, 'wp' : wp
			}, function() {});
		});
		break;
	}
});
