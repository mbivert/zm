/* Copyright (C) 1991-2020 Free Software Foundation, Inc.
   This file is part of the GNU C Library.

   The GNU C Library is free software; you can redistribute it and/or
   modify it under the terms of the GNU Lesser General Public
   License as published by the Free Software Foundation; either
   version 2.1 of the License, or (at your option) any later version.

   The GNU C Library is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
   Lesser General Public License for more details.

   You should have received a copy of the GNU Lesser General Public
   License along with the GNU C Library; if not, see
   <https://www.gnu.org/licenses/>.  */
/* This header is separate from features.h so that the compiler can
   include it implicitly at the start of every compilation.  It must
   not itself include <features.h> or any other header that includes
   <features.h> because the implicit include comes before any feature
   test macros that may be defined in a source file before it first
   explicitly includes a system header.  GCC knows the name of this
   header in order to preinclude it.  */
/* glibc's intent is to support the IEC 559 math functionality, real
   and complex.  If the GCC (4.9 and later) predefined macros
   specifying compiler intent are available, use them to determine
   whether the overall intent is to support these features; otherwise,
   presume an older compiler has intent to support these features and
   define these macros by default.  */
/* wchar_t uses Unicode 10.0.0.  Version 10.0 of the Unicode Standard is
   synchronized with ISO/IEC 10646:2017, fifth edition, plus
   the following additions from Amendment 1 to the fifth edition:
   - 56 emoji characters
   - 285 hentaigana
   - 3 additional Zanabazar Square characters */
/*
 * Extension back-end script.
 */
/*
 * Standalone functions.
 */
/*
 * Dump some data to the console in JSON
 *
 * Input:
 *	x : data to dump.
 * Output:
 *	None, but x would have been dumped to console.
 */
function dump(...xs) {
 xs.forEach(function(x) {
  console.log(JSON.stringify(x, null, 4));
 });
}
/*
 * Does this unicode code point refers to a Chinese character?
 *
 * NOTE: ranges taken from:
 *  https://en.wikipedia.org/wiki/CJK_Unified_Ideographs_(Unicode_block)
 *
 * NOTE: later augmented with
 *	https://stackoverflow.com/a/1366113
 *
 * Input:
 *	c: unicode code point
 * Output:
 *	Boolean
 */
function ischinese(c) {
 if (c >= 0x4E00 && c <= 0x62FF) return true;
 if (c >= 0x6300 && c <= 0x77FF) return true;
 if (c >= 0x7800 && c <= 0x8CFF) return true;
 if (c >= 0x8D00 && c <= 0x9FFF) return true;
 if (c >= 0x3400 && c <= 0x4DBF) return true;
 if (c >= 0xF900 && c <= 0xFAFF) return true;
 if (c >= 0x20000 && c <= 0x2A6DF) return true;
 if (c >= 0x2A700 && c <= 0x2B73F) return true;
 if (c >= 0x2B740 && c <= 0x2B81F) return true;
 if (c >= 0x2B820 && c <= 0x2CEAF) return true;
 if (c >= 0x2F800 && c <= 0x2FA1F) return true;
 return false;
}
/* TODO s/ischinesec/ischinese/ with proper adjustments */
function ischinesec(c) {
 return ischinese(c.codePointAt(0));
}
var puncts = {
 '？' : true,
 '?' : true,
 '！' : true,
 '!' : true,
 '、' : true,
 '，' : true,
 ',' : true,
 '。' : true,
 "\n" : true,
 "=" : true,
 " " : true,
 "\t" : true,
 "；" : true,
 ";" : true,
 "…" : true,
 "　" : true,
 "." : true,
 '|' : true,
 "-" : true,
 "'" : true,
 '"' : true,
 "：" : true,
 ":" : true,
 "「" : true,
 "」" : true,
 "《" : true,
 "》" : true,
 "«" : true,
 "»" : true,
 "─" : true,
 "—" : true,
 "(" : true,
 ")" : true,
 "（" : true,
 "）" : true,
 "&" : true,
};
/*
 * Test if given "byte" is punctuation.
 *
 * Input:
 *	c : string to test
 * Output:
 *	true if punctuation
 */
function ispunct(c) { return c in puncts; }
/*
 * End of sentence
 */
var eos = {
 '？' : true,
 '?' : true,
 '！' : true,
 '!' : true,
 '。' : true,
 "." : true,
}
/*
 * Test if given "byte" marks end of sentence.
 *
 * Input:
 *	c : string to test
 * Output:
 *	true if c marks end of sentence
 */
function iseos(c) { return c in eos; }
/*
 * Does the given string contains some Chinese text?
 *
 * Input:
 *	s : string to inspect
 * Output:
 *	Boolean if at least one code point from the string
 *	represent a Chinese character
 */
function haschinese(s) {
 for (var i = 0; i < s.length; i++)
  if (ischinese(s.codePointAt(i))) return true;
 return false;
}
/*
 * Assuming a sorted (small to great) arrays of integers a,
 * insert integer e according to the ordering.
 *
 * NOTE: this isn't used in zhongmu but in one of its dependant;
 *       it was stored here to avoid creating
 *
 * Input:
 *	a : sorted array of integers
 *	e : integer to add in a
 * Output:
 *	a would have been altered and is also returned.
 */
function orderedinsert(a, e) {
 var i;
 /* special cases */
 if (a.length == 0) { a.push(e); return a; }
 if (e <= a[0]) { a.unshift(e); return a; }
 if (a.length == 1) { a.push(e); return a; }
 for (i = 0; i < a.length-1; i++)
  if (a[i] <= e && e <= a[i+1])
   break;
 a.splice(i+1, 0, e);
 return a;
}
/*
 * Code around cut() function.
 *
 * Requires libutils.js
 */
/*
 * cut() usage statistics.
 *
 * All the following are counters such as:
 *	{
 *		word : counter,
 *		...
 *	}
 */
var stats = {
 /*
	 * Words with no definition.
	 * This includes words from source's words
	 * decomposition.
	 */
 "nodefs" : {},
 /*
	 * Words counters from source only.
	 */
 "words" : {},
 /*
	 * Same as before, but split words in symbols ([...s])
	 * before counting.
	 */
 "symbols" : {},
};
/*
 * Add entry to stats, filtering if needed.
 *
 * Input:
 *	e : stats sub entry
 *	w : word to insert
 * Output:
 */
function addstats(e, w) {
 /*
	 * Don't compute stats for "fake" dictionary entry.
	 * cf. 'libdata.js:/function censordict/'
	 */
 if (w >= 'A' && w <= 'Z') return;
 if (w >= 'a' && w <= 'z') return;
 if (w >= '0' && w <= '9') return;
 if (w == 'Ｑ' || w == 'Ｃ') return;
 if (w == 'Ｔ' || w == 'Ｂ') return;
 if (ispunct(w)) return;
 if (w in stats[e]) stats[e][w]++;
 else stats[e][w] = 1;
}
/*
 * cut()'s tokens type.
 */
var ctype = {
 'punct' : 0,
 'chinese' : 1,
 'foreign' : 2,
 'eof' : 3,
};
/*
 * Eat characters from s as long as condition is met.
 *
 * Input:
 *	s : unicode "characters" arrays (e.g. [..."héllo"])
 *	i : index in s at which we should start looking
 *	f : function so that f(s[i]) returns true if we need
 *	    to keep iterating, false otherwise.
 * Output:
 *	Index of s at which condition stops holding, or once
 *	we reached s's end.
 */
function eatwhile(s, i, f) {
 while(i < s.length && f(s[i])) i++;
 return i;
}
/*
 * Retrieve longest word at the beginning
 * of s, according to tdict.
 *
 * If no word is found, eat first (Chinese) unicode character,
 * and return it with an empty definition.
 *
 * Input:
 *	s     : unicode "characters" arrays (e.g. [..."héllo"])
 *	i     : index in s at which we should start looking
 *	tdict : tree dictionnary
 *	k     : if k=0 (default) take longest word. if k=1,
 *			take second longest word. Would work for k>1,
 *			but practically unused.
 * Output:
 *	Array containing:
 *		- length of the known word we we found (0 if none)
 *		- its definition ("-" if none)
 */
function getword(s, i, tdict, k) {
 var p = tdict;
 var ds = [];
 var d = "";
 var j;
 if (k == null) k = 0;
 /*
	 * p moves forward in tdict as long as we
	 * have a path.
	 *
	 * Each time we move p, stack on ds whether
	 * current path points to a known word.
	 */
 for (j = i; j < s.length; p = p[s[j++]][0])
  if (!(s[j] in p))
   break;
  /* Remember definition if we were on a word */
  else ds.push(p[s[j]].length > 1 ? p[s[j]][1] : "");
 /* Backtrack until we found a word */
 for (;ds.length > 0; j--) {
  var x = ds.pop();
  if (x && k-- == 0) {
   d = x;
   break;
  }
 }
 /*
	 * Not moved on non-empty input: assume one character
	 * long, undefined word
	 */
 if (s.length && i == j) {
  j = i+1; d = "-";
  // TODO: have an external function to compute
  // all stats.
//		addstats("nodefs", s.slice(i, j).join(""));
 }
 return [j, d];
}
/*
 * Grab a "raw" token from s, starting at position i.
 *
 * Within a "raw" token, Chinese token have no definition
 * and just consists of a consecutive list of Chinese
 * characters from s. Proper words will be extracted later.
 *
 * Input:
 *	s     : Array of unicode characters ([...string])
 *	i     : current position in s.
 * Output:
 *	Hash containing:
 *		t : token type (punct|foreign|chinese|eof)
 *		i : token position start
 *		j : token position end
 *		v : s.slice(i, j).join("")
 */
function getrtok(s, i) {
 var t, j;
 if (i == s.length) {
  t = ctype.eof;
  j = i;
 }
 else if (ispunct(s[i])) {
  t = ctype.punct;
  j = eatwhile(s, i, ispunct);
 }
 else if (ischinesec(s[i])) {
  t = ctype.chinese;
  j = eatwhile(s, i, ischinesec);
 }
 else {
  t = ctype.foreign;
  j = eatwhile(s, i, function(x) {
   return !ispunct(x) && !ischinesec(x);
  });
 }
 return { t : t, i : i, j : j, v : s.slice(i, j).join("") };
}
/*
 * Raw tokenization of s; raw tokens are introduced in
 * getrtok()'s doc.
 *
 * Input:
 *	s     : Array of unicode characters ([...string])
 * Output:
 *	Array of hashes, where each hash contains:
 *		t : token type (punct|foreign|chinese|eof)
 *		i : token position start
 *		j : token position end (token is s.slice(i, j))
 */
function rtokenize(s) {
 var ts = [];
 var i = 0;
 do {
  ts.push(getrtok(s, i));
  i = ts[ts.length-1].j
 } while (ts[ts.length-1].t != ctype.eof);
 return ts;
}
/*
 * Melt a raw chinese token into proper Chinese words tokens.
 *
 * Input:
 *	s     : Array of unicode characters ([...string])
 *	t     : Raw chinese token to melt.
 *	tdict : Tree dictionary
 *	k     : if k=0 (default) start by taking longest word.
 *          if k=1, take second longest word. Would work for k>1,
 *			but practically unused. Is only used for the first
 *			word, so we can decompose s when s is a word.
 * Output:
 *	Array of hashes, where each hash contains:
 *		t : token type (punct|foreign|chinese|eof)
 *		i : token position start
 *		j : token position end
 *		v : s.slice(i, j).join("")
 *		d : token's definition ('-' if none)
 */
function meltcn(s, t, tdict, k) {
 var ts = [];
 var i, j;
 for (i = t.i; i < t.j; i++) {
  [j, d] = getword(s, i, tdict, k);
  /* k is only for first word */
  if (k) k = 0;
  /*
		 * Only keep words that are not completely covered
		 * by previous word, if any. They would appear in
		 * previous word decomposition.
		 */
  if (!ts.length || j > ts[ts.length-1].j)
   ts.push({
    t : ctype.chinese,
    i : i,
    j : j,
    v : s.slice(i, j).join(""),
    d : d
   });
 }
 return ts;
}
/*
 * Proper tokenisation of s, where each raw Chinese token
 * would have been melted.
 *
 * Input:
 *	s     : Array of unicode characters ([...string])
 *	tdict : Tree dictionary
 * Output:
 *	Array of hashes, where each hash contains:
 *		t : token type (punct|foreign|chinese|eof)
 *		i : token position start
 *		j : token position end (token is s.slice(i, j))
 *	Furthermore, all Chinese tokens would have a:
 *		d : token's definition ('-' if none)
 */
function tokenize(s, tdict) {
 var rs = rtokenize(s);
 var ts = [];
 for (var i = 0; i < rs.length; i++)
  if (rs[i].t == ctype.eof) continue;
  else if (rs[i].t != ctype.chinese) ts.push(rs[i]);
  else ts = ts.concat(meltcn(s, rs[i], tdict));
 return ts;
}
/*
 * Create recursive decomposition for given character.
 *
 * TODO
 */
function decompose1(c, decomp, tdict) {
 return ((c in decomp) ? decomp[c] : []).map(function(x) {
  return {
   v : x,
   d : getword([x], 0, tdict)[1],
   c : decompose1(x, decomp, tdict)
  };
 });
}
/*
 * Decompose a Chinese word (either a dictionary
 * entry, or a single character long undefined character).
 *
 * Input:
 *	w      : word to decompose
 *	decomp : Decomposition data
 *	tdict  : Tree dictionary
 * Output:
 *	Potentially recursive hash on c entry, where hash contains:
 *		v : word value (string)
 *		d : word definition
 *		c : word decomposition
 */
function decompose(w, decomp, tdict) {
 if (w.length == 1) return decompose1(w[0], decomp, tdict);
 return meltcn(w, { i : 0, j : w.length }, tdict, 1).map(function(t) {
  var v = w.slice(t.i, t.j);
  return {
   v : v.join(""),
   d : t.d,
   c : decompose(v, decomp, tdict)
  };
 });
}
/*
 * Improved cut() mechanism, with word overlapping and indexes.
 *
 * Input:
 * Output:
 */
function cut(s, decomp, tdict) {
 if (typeof(s) == "string") s = [...s];
 var ts = tokenize(s, tdict);
 for (var i = 0; i < ts.length; i++)
  if (ts[i].t == ctype.chinese)
   ts[i].c = decompose(s.slice(ts[i].i, ts[i].j), decomp, tdict);
 return ts;
}
/*
 * Recursively tokenize definitions of a cut()'s output.
 *
 * Input:
 *	ts    : cut()'s output
 *	tdict : tree dictionary
 * Output:
 *	All the definition fields (.d) of Chinese entries would
 *	have been replaced by their tokenized value. ts is returned
 *	altered.
 */
function rtokdef(ts, tdict) {
 for (var i = 0; i < ts.length; i++) {
  if (!('t' in ts[i])) ts[i].t = ctype.chinese;
  if (ts[i].t == ctype.chinese) {
   ts[i].d = tokenize([...ts[i].d], tdict);
   ts[i].c = rtokdef(ts[i].c, tdict);
  }
 }
 return ts;
}
/*
 * Clean cut()'s output by removing entries refering to
 * non-chinese characters with no definitions.
 *
 * TODO: tests
 *
 * Input:
 *	ts       : cut()'s output
 * Output:
 *	Filtered ts (same format)
 */
function cleancut(ts) {
 return ts.filter(function(t) {
  return t.t == ctype.chinese;
 });
}
/*
 * Create a standalone cut() function that relies on given
 * decomp/tdict.
 *
 * Input:
 *	decomp : decomposition data
 *	tdict  : tree dictionary
 * Output:
 *	A function taking a string to cut as argument; output
 *	descriptions would have been prepared with rtokdef().
 */
function mkxcut(decomp, tdict) {
 return function(s) {
  return rtokdef(cut(s, decomp, tdict), tdict);
 }
}
/* Generic namespace */
var browser = browser || chrome;
var tdict = null;
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
 id : "reading-mode",
 title : browser.i18n.getMessage("menuEnableReading"),
 contexts : ["all"]
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
