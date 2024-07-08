/*
 * Extension back-end script.
 */

#include "libutils.js"
#include "libcut.js"

/* Generic namespace */
var browser = browser || chrome;

var tdict  = null;
var decomp = null;

/*
 * Read ressource JSON file.
 *
 * Input:
 *	fn : ressource's filename
 * Output:
 *	Promise wrapping parsed JSON.
 */
function readjsonfn(fn) {
	return fetch(browser.extension.getURL(fn)).then(function(r) {
		return r.json();
	});
}

/*
 * Message is a hash with two entries:
 *
 * Input:
 *	m.t : cut's type, either cut or cleancut.
 *	m.s : string to cut
 * Output:
 *	Cutted string, as returned by 'lib/libcut.js:/^function cut'
 */
function listentomsg(m, s, sr) {
	/*
	 * TODO Promise API broken on chrome, try firefox
	 * NOTE: doc says sr() is deprecated API
	 */
	switch(m.t) {
	case 'cleancut':
	case 'cut':
		if (tdict == null || decomp == null) {
			sr("failed to load ressources");
			break;
		}
		var c = cut(m.s, decomp, tdict);
		if (m.t == 'cleancut') c = cleancut(c);
		sr(rtokdef(c, tdict));
		break;
	default:
		console.log("Unknown message type: "+JSON.stringify(m, null, 4));
		break;
	}

	return true;
};

function onCreated() {
	if (browser.runtime.lastError)
		console.log(browser.runtime.lastError);
}

browser.contextMenus.create({
	id        : "reading-mode",
	title     : browser.i18n.getMessage("menuEnableReading"),
	contexts  : ["all"]
}, onCreated);

/*
 * reading mode enabled?
 * XXX bugged: reading mode on multiple pages.
 */
var reading = false;

function listentomenu(info, tab) {
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
	default:
		console.log("Unknown menu click: "+JSON.stringify(info));
	}
}

/*
 * Main: read ressources, then register events.
 */
readjsonfn("tdict.js").then(function(td) {
	tdict = td;
	return readjsonfn("decomp.js");
}).then(function(dec) {
	decomp = dec;
}).then(function() {
	console.log("loaded");
	browser.runtime.onMessage.addListener(listentomsg);
	browser.contextMenus.onClicked.addListener(listentomenu);
});
