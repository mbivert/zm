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
 * Extension front-end script.
 *
 * NOTE: the extension was imported "quickly" from a previous version,
 * were cutting mechanism was quite different.
 *
 * We should now be able to optimize a few things, especially in reading
 * mode, by simply tokenizing the data instead of cutting it. Also, dict
 * variable in listenforread seems to be useless.
 */
/*
 * Keeping it just in case.
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
/*
 * Generic browser code aiming at providing a "component"
 * to display cutted word, and enough auxiliary code to
 * make it work.
 *
 * Requires a browser (DOM), pako, libcut.js (thus libutils.js).
 *
 * Calling code should provide decomposition data and tree dictionary
 * via pushdecword() (and listenfordefword()).
 */
/*
 * Class names used to provide features.
 * See '../ext-front.js:/^czmdefword '
 *
 * TODO: make a hash out of this, and adjust hashe's values
 * in ../ext-front.js instead.
 */
var czmdefword = "zhongmu-def-word";
var czmtoggledec = "zhongmu-toggle-decomp";
var czmhcut = "zhongmu-hcut";
var czmvcut = "zhongmu-vcut";
var czmword = "zhongmu-word";
var czmdescr = "zhongmu-descr";
var czmtoggleext = "zhongmu-toggle-ext-trs";
var czmdecword = "zhongmu-dec-word";
/*
 * Uncompress tdict.js.gz with pako.
 *
 * Input:
 *	x : uint8 array
 * Output:
 *	tdict as returned by 'libdata.js:/^function mktdict/';
 *	throws on error
 */
function gunziptdict(x) {
 return JSON.parse(new TextDecoder("utf-8").decode(
  pako.inflate(new Uint8Array(x))
 ));
}
/*
 * Retrieve tdict.js.gz.
 *
 * Input:
 *	url : URL/path to tdict.js.gz
 *	ko  : callback to execute on error; only arg is error message
 *	ok  : callback to execute on success;
 */
function gettdict(url, ko, ok) {
 var xhr = new XMLHttpRequest();
 xhr.open('GET', url);
 /*
	 * We want xhr.response to be uint8 array (for pako)
	 */
 xhr.responseType = "arraybuffer";
 xhr.onload = function() {
     if (xhr.status != 200) {
      ko("critical failure: "+xhr.responseText);
      return;
  }
  var td; try { td = gunziptdict(xhr.response) }
  catch(e) { ko("cannot decompress tdict: "+e); return; }
  ok(td);
 };
 xhr.send();
}
/*
 * Create <a> with given class. Links point to
 * h if specified, # otherwise.
 *
 * This is often used for links behaving as button.
 *
 * Input:
 *	t : link's text
 *	c : link's class
 *	h : link's URL (href)
 *	i : link's title
 * Output:
 *	<a> element with given properties.
 */
function mka(t, c, h, i) {
 var x = document.createElement('a');
 x.href = h || "#";
 x.className = c;
 x.innerText = t;
 x.title = i || "";
 return x;
}
/*
 * Put a separating dash in a span.
 *
 * Input:
 * Output:
 *	<span> element containing a dash.
 */
function mkdash() {
 var x = document.createElement('span');
 x.innerText = " - ";
 return x;
}
/*
 * Is this an non-empty definition?
 *
 * TODO: this seems too sophisticated.
 *
 * Input:
 *	d : definition to test
 * Output:
 *	true if d is non-empty, false otherwise.
 */
function hasdef2(d) {
 if (d.length == 0) return false;
 if (d.length > 1) return true;
 return d[0].v != "-";
}
/*
 * Create links to potential strokes images files for
 * this word. Add them to external definition blocks
 */
function mkstrokes(defc, w) {
 /* Files works for single word */
 if ([...w].length > 1) return;
 var b = "https://commons.wikimedia.org/wiki/Special:Redirect/file?wptype=file&wpvalue=";
 defc.appendChild(mka("[png]", "", b+w+"-bw.png", "Static strokes (may be missing)"));
 defc.appendChild(mka("[gif]", "", b+w+"-order.gif", "Animated strokes (may be missing)"));
}
/*
 * Create external definitions links, all wrapped into
 * a <span>
 *
 * Input:
 *	w : word for which we want external definition links
 * Output:
 *	<span> element containing an <a> element per external link.
 */
function mkextdefc(w) {
 var defc = document.createElement('span');
 defc.appendChild(mka("[1]", "", "https://en.wiktionary.org/wiki/"+w, "en.wiktionary"));
 defc.appendChild(mka("[2]", "", "https://baike.baidu.com/item/"+w, "baidu"));
 defc.appendChild(mka("[3]", "", "https://www.zdic.net/hans/"+w, "zdic"));
 defc.appendChild(mka("[4]", "", "https://zh.wiktionary.org/zh-hans/"+w, "zh.wiktionary"));
 defc.appendChild(mka("[5]", "", "https://translate.google.com/?sl=zh-CN&tl=en&text="+w+"&op=translate", "translate.google"));
 defc.appendChild(mka("[6]", "", "https://www.linguee.com/english-chinese/search?source=chinese&query="+w, "linguee"));
 mkstrokes(defc, w);
 return defc;
}
/*
 * Make HTML description of a word.
 *
 * Input:
 *	d  : word definition (string)
 * Output:
 *	<span> element wrapping the definition. The definition
 *	has been transformed so that every known Chinese word
 *	it contains is now a link classed czmdefword
 */
function mkdefc(d) {
 var defc = document.createElement('span');
 var c = d;
 var s = "";
 function maybeflush() {
  if (s == "") return;
  var x = document.createElement('span');
  /*
		 * Quick fix: insert spaces so we can break
		 * on "long" definition instead of seing
		 * #dec's width automatically extended.
		 */
  x.innerText = s.replaceAll("/", " / ");
  defc.appendChild(x);
  s = "";
 }
 for (var i = 0, s = ""; i < c.length; i++) {
  switch(c[i].t) {
  case ctype.foreign:
  case ctype.punct:
   s += c[i].v;
   break;
  case ctype.chinese:
   maybeflush();
   defc.appendChild(mka(c[i].v, czmdefword));
   break;
  default:
   console.log("mkdefc() bug: ", c[i]);
   break;
  }
 }
 maybeflush();
 return defc;
}
/*
 * Create decomposition grid.
 *
 * NOTE: This is a key function.
 *
 * Input:
 *	cds   : cut() output to display in the grid.
 *	pgrid : DOM node where to store the grid.
 * Output:
 */
function mkgrid(cds, pgrid) {
 pgrid.className = czmvcut;
 cds.forEach(function(cd) {
  if (cd.t != ctype.chinese) return;
  /* Is there a composition for that word ? */
  var hascomp = cd.c.length > 0;
  /* word container */
  var w = document.createElement('div');
  w.innerText = cd.v;
  w.className = czmword;
  /*
		 * hcut for word (definition on top of
		 * decomposition).
		 */
  var h = document.createElement('div');
  h.className = czmhcut;
  /* definition */
  var def = document.createElement('div');
  def.className = czmdescr;
  /* Eventually, add decomposition visibility toggle link */
  if (hascomp)
   def.appendChild(mka('[+]', czmtoggledec));
  /* Create and insert definition */
  var d, ed = mkextdefc(cd.v);
  if (hasdef2(cd.d)) {
   d = mkdefc(cd.d);
   d.appendChild(document.createElement('br'));
   d.appendChild(mka('[*]', czmtoggleext));
   ed.style.display = 'none';
   d.appendChild(ed);
  } else d = ed;
  def.appendChild(d);
  /* Decomposition (empty if none) */
  var dec = document.createElement('div');
  /* By default, hide */
  dec.style.display = 'none';
  /* Recurse on composition if any */
  if (hascomp) mkgrid(cd.c, dec);
  /* Create hcut */
  h.appendChild(def);
  h.appendChild(dec);
  /* Create vcut */
  pgrid.appendChild(w);
  pgrid.appendChild(h);
 });
}
/*
 * Whenever we push a new entry, we also keep track
 * of HTML, that is, of how the decompositon is
 * currently being inspected by the user.
 *
 * XXX Maybe we'd better be off by clearly separating
 * data and rendering.
 *
 * XXX maybe this would be better as a function argument,
 *     in which case, we could have a state variable holding
 *     pgrid, pstack, decomp, tdict, decwords.
 */
var decwords = {};
/*
 * Retrieve current words being decomposed in pgrid.
 *
 * Input:
 *	pgrid : DOM node where a grid has been installed (cf. mkgrid())
 * Output:
 *	highest-level word being currently defined in grid.
 */
function getcdwords(pgrid) {
 // meh.
 return [].slice.call(pgrid.children).filter(function(n) {
  return n.className == czmword;
 }).map(function(n) { return n.innerText }).join(" ");
}
/*
 * When toggling decomposition, update
 * related entry in decwords.
 *
 * Input:
 *	pgrid : DOM node where a grid has been installed (cf. mkgrid())
 * Output:
 *	decwords updated.
 */
function updatedecwords(pgrid) {
 /* Update decwords entry for current word being decomposed */
 decwords[getcdwords(pgrid)] = pgrid.innerHTML;
}
/*
 * Push a word in the decomposition stack.
 *
 * Decomposition stack is stored directly in the DOM,
 * as a list of link tagged with czmdecword.
 *
 * As stated earlier, maybe this would be be better
 * to clearly separate the stack from the HTML.
 *
 * Input:
 *	w      : word to push (string)
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 *	pstack : DOM node containing the decomposition stack.
 *	xcut   : "standalone" cut function taking word to cut as single argument,
 *           returning cut() data prepared with rqcutdescr().
 * Output:
 *	None, but stack, the grid and decwords would have been updated.
 */
async function pushdecword(w, pgrid, pstack, xcut) {
 var n = pstack.children.length;
 /*
	 * If some words have been stacked
	 */
 if (n > 0) {
  // last word
  var t = pstack.children[n-1].innerText;
  // w is already last word, don't duplicate
  if (t == w)
   return;
  pstack.appendChild(mkdash());
 }
 pgrid.innerHTML = "";
 /*
	 * Restore previous state if any.
	 */
 if (w in decwords)
  pgrid.innerHTML = decwords[w];
 /*
	 * Otherwise, launch new decomposition, and
	 * store it.
	 */
 else {
  var cds = await xcut(w);
  mkgrid(cds, pgrid);
  updatedecwords(pgrid);
 }
 pstack.appendChild(mka(getcdwords(pgrid), czmdecword));
}
/*
 * Pop the stack until we reach a given node.
 *
 * Input:
 *	n      : DOM node where we want to stop poping
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 *	pstack : DOM node containing the decomposition stack.
 * Output:
 *	None, but stack and the grid would have been updated.
 */
function popdecwordto(n, pgrid, pstack) {
 var l = pstack.children.length;
 if (l <= 1) return;
 while (l > 1) {
  /*
		 * We reached last node: finished
		 */
  if (n.isSameNode(pstack.children[l-1]))
   break;
  /*
		 * Otherwise, pop() that word and
		 * the separating dash.
		 */
  pstack.removeChild(pstack.children[l-1]);
  pstack.removeChild(pstack.children[l-2]);
  l -= 2;
 }
 pgrid.innerHTML = decwords[n.innerText];
}
/*
 * Listen on click for "fake" '<a>' elements with
 * given class.
 *
 * Input:
 *	c : class on which we want to registers click events.
 *	f : code to execute when clicking on such elements; takes
 *	    event as argument.
 * Output:
 *	Click listener added to document.
 */
function alisten(c, f) {
 document.addEventListener("click", function(e) {
  if (e.target.className != c)
   return true;
  e.preventDefault();
  f(e);
 });
}
/*
 * Listen for click on a stack word.
 *
 * On such click, pop the stack until we reach the node
 * we just clicked.
 *
 * Input:
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 *	pstack : DOM node containing the decomposition stack.
 * Output:
 *	Click listener added to document.
 */
function listenfordecword(pgrid, pstack) {
 alisten(czmdecword, function(e) {
  popdecwordto(e.target, pgrid, pstack);
 });
}
/*
 * Listen for click on a definition word.
 *
 * On such click, push that word on the stack and display
 * its decomposition.
 *
 * Input:
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 *	pstack : DOM node containing the decomposition stack.
 *	xcut   : "standalone" cut function taking word to cut as single argument,
 *           returning cut() data prepared with rqcutdescr().
 * Output:
 *	Click listener added to document.
 */
function listenfordefword(pgrid, pstack, xcut) {
 alisten(czmdefword, function(e) {
  pushdecword(e.target.innerText, pgrid, pstack, xcut);
 });
}
/*
 * Toggle next sibbling's visibility.
 *
 * Input:
 *	m : element to update according to n's visibility (e.g. link/button)
 *	n : element for which we want to toggle next sibling's visibility
 *	h : m's content if we hide n's next sibling
 *	s : m's content if we show n's next sibling
 * Output:
 *	n's sibling's visibility would have been toggled; m would
 *	have been updated to reflect m's visibility.
 */
function togglenextsibling(m, n, h, s) {
 n = n.nextElementSibling
 /* hidden; show */
 if (n.style.display == 'none') {
  n.style.display = '';
  m.innerText = h;
 }
 /* shown; hide */
 else {
  n.style.display = 'none';
  m.innerText = s;
 }
}
/*
 * Toggle word's decomposition's visibility in grid.
 *
 * Input:
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 * Output:
 *	Click listener added to document.
 */
function listenfortoggledecomp(pgrid) {
 alisten(czmtoggledec, function(e) {
  togglenextsibling(e.target, e.target.parentElement, '[-]', '[+]');
  updatedecwords(pgrid);
 });
}
/*
 * Toggle word's external definition links's visibility
 *
 * Input:
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 * Output:
 *	Click listener added to document.
 */
function listenfortoggleexttrs(pgrid) {
 alisten(czmtoggleext, function(e) {
  togglenextsibling(e.target, e.target, '[×]', '[*]');
  updatedecwords(pgrid);
 });
}
/*
 * Register all listeners for "component" to fully work.
 *
 * Input:
 *	pgrid  : DOM node where a grid has been installed (cf. mkgrid())
 *	pstack : DOM node containing the decomposition stack.
 *	xcut   : "standalone" cut function taking word to cut as single argument,
 * Output:
 */
function libshowlistenall(pgrid, pstack, xcut) {
 listenfordecword(pgrid, pstack);
 listenfordefword(pgrid, pstack, xcut);
 listenfortoggledecomp(pgrid);
 listenfortoggleexttrs(pgrid);
}
/*
 * Code around hlword() function.
 *
 */
/* Node.* unavailable during tests */
var Node = Node || {
 ELEMENT_NODE : 1,
 TEXT_NODE : 3,
 CDATA_SECTION_NODE : 4,
 PROCESSING_INSTRUCTION_NODE : 7,
 COMMENT_NODE : 8,
 DOCUMENT_NODE : 9,
 DOCUMENT_TYPE_NODE : 10,
 DOCUMENT_FRAGMENT_NODE : 11,
};
/* Again, for tests */
var document = document || { body : {} };
/*
 * Forward / backward DOM walking looking for a TEXT_NODE,
 * potentially containing Chinese characters.
 *
 * Input:
 *	x : where to start the walk
 *	d : "forward" / "backward" [default: "forward"]
 * Output:
 *	next / previous TEXT_NODE, or null when reaching document.body
 */
function walkthedom(x, d) {
 if (!x) x = document.body;
 if (!d) d = "next";
 /* get next / previous sibling */
 function sibling(x) {
  return d == "next" ? x.nextSibling : x.previousSibling;
 }
 /* get first / last child */
 function child(x) {
  return d == "next" ? x.firstChild : x.lastChild;
 }
 /*
	 * Go one step up in the DOM.
	 * Input:
	 *	x : node from where to climb up
	 * Output:
	 *	next step up, or null when reaching document.body
	 */
 function uponestep(x) {
  for (;;) {
   var y = sibling(x);
   if (y)
    return y;
   else if (x.parentNode == document.body)
    break;
   else
    x = x.parentNode;
  }
  return null;
 }
 /* If we start on a TEXT_NODE, go up a little */
 if (x.nodeType == Node.TEXT_NODE) x = uponestep(x);
 while (x) {
  switch(x.nodeType) {
  /* Maybe there's something here */
  case Node.TEXT_NODE:
   return x;
  /* DFS */
  case Node.ELEMENT_NODE:
   x = x.hasChildNodes() ? child(x) : uponestep(x);
   break;
  /* Ignore */
  case Node.CDATA_SECTION_NODE:
  case Node.PROCESSING_INSTRUCTION_NODE:
  case Node.COMMENT_NODE:
   x = uponestep(x);
   break;
  /* ~Impossible (XXX ensure its the case in practice) */
  case Node.DOCUMENT_NODE:
  case Node.DOCUMENT_TYPE_NODE:
  case Node.DOCUMENT_FRAGMENT_NODE:
  default:
   x = null;
   break;
  }
 }
 /* Journey's end */
 return x;
}
/*
 * Create a "fake" DOM for testing walkthedom().
 *
 * Only used for tests.
 *
 * Input:
 *	x : partial "fake" DOM, with nodeType and data elements
 *  n : boolean, setting parentNode to document.body when false.
 * Output:
 *	"walkable" DOM, that is, objects with just enough
 *	properties so that walkthedom() would work.
 */
function mkfakedom(x, n) {
 if (!n)
  x.parentNode = document.body;
 if (x.nodeType == Node.ELEMENT_NODE) {
  x.firstChild = x.children[0];
  x.lastChild = x.children[x.children.length-1];
  x.hasChildNodes = x.children.length
   ? function() { return true; }
   : function() { return false; };
  for (var i = 0; i < x.children.length; i++) {
   x.children[i].parentNode = x;
   x.children[i].nextSibling = x.children[i+1];
   x.children[i].previousSibling = x.children[i-1];
   x.children[i] = mkfakedom(x.children[i], true);
  }
 }
 return x;
}
/*
 * Iteratively call walkthedom(); ease walkthedom()'s testing.
 *
 * Only used for UTs.
 *
 * Input:
 *	x : where to start the iteration in the DOM.
 *  d : walking direction ("prev" / "next")
 * Output:
 *	Array of text found, in order
 */
function walkalldom(x, d) {
 var ts = [];
 for (;;) {
  x = walkthedom(x, d);
  if (x) ts.push(x.data);
  else break;
 }
 return ts;
}
/*
 * Remove previous highlight, if any
 *
 * Input:
 *	s : hlword()'s state variable, cf. below.
 * Output:
 *	All highlight has been removed.
 */
function hlwordll(s) {
 for (var i = s.npb; i <= s.npa; i++)
  if (s.ishl(s.nodes[i])) s.nodes[i] = s.ll(s.nodes[i]);
}
/*
 * Highlight next / previous word.
 *
 * Delicate piece of code.
 *
 * NOTE: function made quite generic so that we can
 *       test it easily [without a DOM].
 *
 * NOTE: a node is said to be highlighted if it is being
 *       broken to highlight a word; not to be confused with
 *       word highlightening thus, cf. ishl().
 *
 * XXX/TODO 看中文 : manage word overlapping.
 *	e.g. if previous word has a suffix matching a prefix of current
 *       word to highlight, and if the concatenation of both words isn't
 *       found in the dom, assume overlapping.
 *
 * Input:
 *	s : state variable. The state is a hash containing the
 * 	    following keys:
 *	    	- nodes : array of "DOM" nodes
 *	    	- words : words spread on previous nodes
 *	    	- npb   : nodes pointer (nodes index); index of
 *	    	          node on which words[wp-1] starts (before).
 *	    	- npa   : nodes pointer (nodes index); index of
 *	    	          node on which words[wp-1] ends (after).
 *	    	- wp    : words pointer (words index); word to highlight
 *	    	- rcb   : remaining characters in nodes[npb] before
 *	    	          words[wp].
 *	    	- rca   : remaining characters in nodes[npa] after
 *	    	          words[wp].
 *	    	- hl(n, i,j) : function used to highlight characters i to j
 *	    	               (i included, j excluded) of node n
 *	    	- ll(n)   : function to remove highlighting on given node
 *	    	- len(n)  : function to compute a node's length
 *	    	- ishl(n) : function to check if a node is highlighted
 *	    	- error   : error string; used for assertions.
 *
 * Output:
 *	Updated state variable.
 */
function hlword(s, prev) {
 /*------------------------------------------------------------
	 * Initialisation
	 */
 /* Reasonable */
 if (s.nodes.length == 0) return s;
 if (s.words.length == 0) return s;
 /* Remove previous highlight, if any */
 hlwordll(s);
 /* Move forward by default */
 var next = !prev;
 /* From end to start */
 if (next && s.wp == s.words.length-1)
  s.npa = s.npb = 0, s.wp = s.rca = s.rcb = -1;
 /* From start to end */
 if (prev && s.wp == 0) {
  s.wp = s.words.length;
  s.npb = s.npa = s.nodes.length-1;
  s.rca = s.rcb = -1;
 }
 /* Starting */
 if (next && s.rca == -1) s.rca = s.len(s.nodes[s.npa]);
 if (prev && s.rcb == -1) s.rcb = s.len(s.nodes[s.npb]);
 /*------------------------------------------------------------
	 * Directions wrapper
	 */
 /* Current node */
 var np = next ? s.npa : s.npb;
 /* Available space on current node (np) */
 var rc = next ? s.rca : s.rcb;
 /* move a word / node pointer */
 function mv(x) { return next ? x+1 : x-1; }
 /* move in reverse direction */
 function rmv(x) { return next ? x-1 : x+1; }
 /* is x before y */
 function before(x, y) { return next ? x < y : x > y; }
 /*
	 * Partial node highlighting and state update preparation
	 */
 s.npb = s.nodes.length;
 s.npa = -1;
 s.rca = s.rcb = 0;
 function hl(n, m, o) {
  var l = s.len(s.nodes[n]);
  var i = next ? m : l-m;
  var j = next ? i+o : i-o;
  if (next) {
   s.nodes[n] = s.hl(s.nodes[n], i, j);
   if (n <= s.npb) s.npb = n, s.rcb = i;
   if (n >= s.npa) s.npa = n, s.rca = l-j;
  }
  if (prev) {
   s.nodes[n] = s.hl(s.nodes[n], j, i);
   if (n <= s.npb) s.npb = n, s.rcb = j;
   if (n >= s.npa) s.npa = n, s.rca = l-i;
  }
 }
 /*------------------------------------------------------------
	 * Main code, direction-agnostic.
	 */
 /* Move word pointer */
 s.wp = mv(s.wp);
 /* Length of word to be highlighted */
 var l = s.words[s.wp].length;
 /* Currently available place */
 var a = rc;
 /* Currently written characters */
 var b = 0;
 /* Current node */
 var c = np;
 /* Collect enough nodes to place current word */
 while (a < l) {
  if (c > s.nodes.length) {
   s.error = "Not enough nodes for '"+s.words[s.wp]+"'";
   return s;
  }
  if (c < 0) {
   s.error = "Not enough nodes for '"+s.words[s.wp]+"'";
   return s;
  }
  c = mv(c);
  a += s.len(s.nodes[c]);
 }
 /* Start by hl remaining bytes on current node if any */
 if (rc) {
  var i = s.len(s.nodes[np])-rc;
  var j = l > rc ? rc : l;
  hl(np, i, j);
  b += j;
 }
 /* Then, hl full nodes in between if any */
 for (var d = mv(np); before(d, c); d = mv(d)) {
  var k = s.len(s.nodes[d]);
  hl(d, 0, k);
  b += k;
 }
 /* And hl remaining bytes on last node if any */
 if (b < l) hl(c, 0, l-b);
 return s;
}
/*
 * Reset hlword's state variable.
 *
 * Input:
 *	s : hlword()'s state variable to reset
 * Output:
 *	s, after is has been reseted.
 */
function hlwordrst(s) {
 if (s.wp != -1) hlwordll(s);
 /* reset state variables */
 s.nodes = [];
 s.words = [];
 s.rca = -1;
 s.rcb = -1;
 s.npa = 0;
 s.npb = 0;
 s.wp = -1;
 return s;
}
/*
 * Base state for hlword()'s UTs.
 */
var tests_base_state = {
 nodes : [],
 words : [],
 rca : -1,
 rcb : -1,
 npa : 0,
 npb : 0,
 wp : -1,
 hl : function (n, i, j) {
  var b = n.slice(0, i);
  var c = n.slice(i, j);
  var e = n.slice(j, n.length);
  var out = [];
  if (b) out.push(b);
  out.push({ hl : c });
  if (e) out.push(e);
  return out;
 },
 ll : function(n) {
  var m = n.reduce(function(acc, x) {
   return acc + (typeof(x) == 'object' ? x.hl.toString() : x);
  }, '');
  return m;
 },
 ishl : function(n) { return Array.isArray(n); },
 len : function(n) {
  return Array.isArray(n)
   ? n.reduce(function(acc, x) { return acc+(
     (typeof(x) == 'object') ? x.hl.toString().length : x.length
    );}, 0)
   : n.length;
 }
};
/*
 * Rename all class names so that enabling the extension
 * doesn't break zm site.
 */
czmdefword = "zhongmu-ext-def-word";
czmtoggledec = "zhongmu-ext-toggle-decomp";
czmhcut = "zhongmu-ext-hcut";
czmvcut = "zhongmu-ext-vcut";
czmword = "zhongmu-ext-word";
czmdescr = "zhongmu-ext-descr";
czmtoggleext = "zhongmu-ext-toggle-ext-trs";
czmdecword = "zhongmu-ext-dec-word";
/* Generic namespace */
var browser = browser || chrome;
/*
 * Popup/bar/stack/grid DOM elements / ids.
 *
 * The popup contains the bar, the stack & the grid.
 * The bar contains the mover & the closer.
 */
var popupid = "zhongmu-popup";
var barid = "zhongmu-bar";
var moverid = "zhongmu-mover";
var stackid = "zhongmu-stack";
var gridid = "zhongmu-grid";
var ppopup;
var pbar;
var pmover;
var pcloser;
var pgrid;
var pstack;
var czmclosepopup = "zhongmu-closer";
/*
 * Move the popup to the given coordinates.
 *
 * Input:
 *	x, y : left/top coordinates
 * Output:
 *	Popup has been moved.
 */
function moveto(x, y) {
 ppopup.style.left = x + "px";
 ppopup.style.top = y + "px";
}
/*
 * Allows the popup to be dragged when clicking
 * on the mover.
 *
 * Input:
 * Output:
 */
function listenfordrag() {
 var candrag = false;
 var ox, oy;
 ppopup.draggable = true;
 ppopup.addEventListener("mousedown", function(e) {
  candrag = (e.target == pmover);
  ox = e.offsetX;
  oy = e.offsetY;
 });
 ppopup.addEventListener("dragstart", function(e) {
  if (!candrag) { e.preventDefault(); return; }
  e.target.style.opacity = "0.5";
 });
 ppopup.addEventListener("dragend", function(e) {
  e.target.style.opacity = "";
  moveto(e.pageX-ox, e.pageY-oy);
 });
}
/*
 * Create popup grid in the DOM and registers
 * pointers in the namespace.
 *
 * Input:
 * Output:
 *	Popup container is added at the end of the body.
 */
function addpopup() {
 ppopup = document.createElement('div');
 pbar = document.createElement('div');
 pstack = document.createElement('div');
 pgrid = document.createElement('div');
 pmover = document.createElement('div');
 pcloser = mka("[×]", czmclosepopup);
 pmover.innerText = "☰";
 ppopup.id = popupid;
 pbar.id = barid;
 pmover.id = moverid;
 pstack.id = stackid;
 pgrid.id = gridid;
 ppopup.style.display = 'none';
 pbar.appendChild(pmover);
 pbar.appendChild(pcloser);
 ppopup.appendChild(pbar);
 ppopup.appendChild(pstack);
 ppopup.appendChild(pgrid);
 document.body.appendChild(ppopup);
}
/*
 * TODO
 *
 * Input:
 *	ts  : cut()'s output
 * Output:
 *	Popup displayed with cds; if cds is empty,
 *	popup is hidden.
 */
function preparepopup(ts) {
 if (!ts.length) {
  ppopup.style.display = "none";
  return;
 }
 ppopup.style.display = "block";
 pgrid.innerHTML = "";
}
/*
 * Call cut() through backend script; store output to popup.
 *
 * Input:
 *	s : string to cut
 * Output:
 *	Promise resolved once popup is displayed (XXX not sure)
 */
function xcut(s) {
 /*
	 * In inspect mode, always use a cleancut():
	 * garbage / unknown words are removed.
	 */
 var m = { 't' : 'cleancut', 's' : s };
 return new Promise(function(resolve, reject) {
  browser.runtime.sendMessage(m, function(c) {
   preparepopup(c);
   resolve(c);
  });
 });
}
/*
 * On click, if we found Chinese text in selection,
 * display a cut() grid with in-depth analysis.
 *
 * Input:
 * Output:
 *	Click event would have been registered.
 */
function listenforcut() {
 document.addEventListener("click", function(e) {
  var s = window.getSelection().toString();
  if (ppopup.contains(e.target)) return;
  if (!s) return;
  if (!haschinese(s)) return;
  // TODO: make this configurable
  if ([...s].length > 64) return;
  moveto(e.pageX, e.pageY);
  pushdecword(s, pgrid, pstack, xcut);
 });
}
function rststack() {
 decwords = {};
 pstack.innerHTML = "";
}
/*
 * Listen for popup closing.
 */
function listenforclosepopup() {
 alisten(czmclosepopup, function(e) {
  ppopup.style.display = "none";
  rststack();
 });
}
/*
 * Register listeners for reading mode.
 *
 * NOTE: a keyboard shortcut might be handy here,
 *       but may be hard to implement generically.
 *
 * Input:
 * Output
 */
function listenforread() {
 var dict = {}; /* known Chinese words so far      */
 var started = false; /* is the reading mode enabled?    */
 var hx, hy; /* where to start reading mode     */
 /* Create a <span> holding the given text */
 function mkspan(t) {
  var n = document.createElement('span');
  n.appendChild(document.createTextNode(t));
  return n;
 }
 /* hlword() state */
 var S = {
  nodes : [], /* DOM nodes containing chinese chars */
  words : [], /* words located on nodes */
  npb : 0, /* first node on which current word is being highlighted */
  npa : 0, /* last -- */
  wp : -1, /* next word from words to highlight */
  rca : -1, /* remaining chars on nodes[npa] */
  rcb : -1, /* remaining chars on nodes[npb] */
  /* XXX actually assert */
  error : null,
  /*
		 * HL functions and friends
		 *
		 * NOTE: hlword() only take care of its required state.
		 *       If S.nodes are modified, caller must adjust
		 *       DOM, other state variable in consequence.
		 */
  hl : function(n, i, j) {
   var m = document.createElement('span');
   var t = n.textContent;
   var b = t.slice(0, i);
   var c = t.slice(i, j);
   var a = t.slice(j, t.length);
   if (b) m.appendChild(mkspan(b));
   c = mkspan(c);
   c.style.backgroundColor = 'gold';
   m.appendChild(c);
   if (a) m.appendChild(mkspan(a));
   n.parentNode.replaceChild(m, n);
   return m;
  },
  ll : function(n) {
   var m = document.createTextNode(n.textContent)
   n.parentNode.replaceChild(m, n); /* new, old */
   return m;
  },
  len : function(n) { return n.textContent.length; },
  ishl : function(n) { return n.nodeType == Node.ELEMENT_NODE; },
 };
 /*
	 * Read the DOM keeping track of all TEXT_NODES
	 * containing Chinese characters in S.nodes, and
	 * translate resulting content.
	 */
 function start() {
  var s = '';
  var np = document.body;
  started = true;
  for (;;) {
   /* next TEXT_NODE */
   np = walkthedom(np);
   if (!np) break;
   if (haschinese(np.textContent)) {
    S.nodes.push(np);
    s += np.textContent;
   }
  }
  /* void */
  if (!s) return Promise.resolve();
  /* launch translation process */
  return new Promise(function(resolve, reject) {
   var m = { 't' : 'cut', 's' : s };
   /* Cut those nodes' content */
   browser.runtime.sendMessage(m, function(c) {
    for (var i = 0; i < c.length; i++) {
     S.words.push(c[i].v);
     dict[c[i].v] = c[i];
    }
    resolve('ok');
   });
  });
 }
 /*
	 * Display popup for current word being highlighted.
	 */
 function showword() {
  /* Current popup position */
  var x = ppopup.style.left;
  var y = ppopup.style.top;
  /* Show popup near highlighted word if hidden */
  if (ppopup.style.display == 'none') {
   x = S.nodes[S.npa].offsetLeft;
   y = S.nodes[S.npa].offsetTop + S.nodes[S.npa].offsetHeight;
  }
  moveto(x, y);
  pushdecword(S.words[S.wp], pgrid, pstack, xcut);
 }
 /*
	 * Highlight previous/next word.
	 */
 function hl(prev) {
  if (S.words.length == 0) return;
  do { hlword(S, prev); } while (!haschinese(S.words[S.wp]));
  /*
		 * Send current position to background script
		 * NOTE: shouldn't we / can't we store it here?
		 *
		 * TODO
		 */
  showword();
 }
 function stop() { dict = {}; started = false; hlwordrst(S); }
 /*
	 * State machine fetching data from the DOM, feeding it to
	 * background dictionary script, and highlighting current word.
	 */
 function run(state) {
  switch(state) {
  // NOTE: lambda to remove Promise parameters
  case "start": return start().then(function() { hl() });
  case "next": return hl();
  case "prev": return hl(true);
  case "stop": return stop();
  }
 }
 /*
	 * message from extensions about reading mode
	 * activation / de-activation.
	 */
 browser.runtime.onMessage.addListener(function(m, s, sr) {
  if (!m.here && !m.wp)
   return m.reading ? run("start") : run("stop");
  if (m.here) return Promise.resolve().then(function() {
   hlwordrst(S); return start();
  }).then(function() {
   var found = -1;
   var here = textoffset(hx, hy);
   for (var i = 0; i < S.nodes.length; i++)
    if (S.nodes[i] == here[0]) found = i;
   if (found == -1) return;
   for (var r = false, o = 0;;) {
    hl();
    if (!r && S.npb <= found && found <= S.npa) r = true, o = 0;
    /*
				 * we went pass the node, reasonable to stop here
				 * XXX should be a NO-OP
				 */
    else if (r && S.npb > found) return;
    var p = o + S.words[S.wp].length;
    /* close enough */
    if (r && o <= here[1] && here[1] <= p+1) return;
    /* keep moving */
    o = p;
   }
  });
  return Promise.resolve().then(function() {
   hlwordrst(S); return start();
  }).then(function() {
   if (m.wp > S.words.length) {
    console.log("Invalid position, starting from the top");
    m.wp = 0;
   }
   while (S.wp != m.wp)
    hl();
  });
 });
 document.addEventListener("contextmenu", function(e) {
  /*
		 * NOTE: we don't call textoffset() here: in case we're
		 * clicking here on a node being highlighted, the TEXT_NODE
		 * we'll get would be removed when removing the highlight,
		 * and would thus never be found.
		 */
  hx = e.clientX, hy = e.clientY;
 });
 /* movements in reading mode */
 document.addEventListener("keydown", function(e) {
  if (!started) return;
  switch(e.code) {
  case 'ArrowRight': e.preventDefault(); rststack(); run("next"); break;
  case 'ArrowLeft': e.preventDefault(); rststack(); run("prev"); break;
  }
 });
}
window.addEventListener("load", function() {
 addpopup();
 listenforcut();
 libshowlistenall(pgrid, pstack, xcut);
 listenforclosepopup();
 listenfordrag();
 listenforread(xcut);
});
