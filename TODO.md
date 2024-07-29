# Introduction
This is a essentially a rough ticketing-system-in-a-file.
The goal is to document, describe and links various TODO items.
"@foo" is a ~tag/reference associated to a TODO item.

The first few paragraphs are for me to remember where I've left things.

The size (tiny/small/medium/long) is an rough indication of the
expected implementation complexity.

A small amount of old/unsorted items are located at the end of the file.

Current goals:
  - Clean the setup scripts (auto-restart, automatic emails,
  regular ping, etc.: we're not serving static pages anymore).
  - sitemap.xml, at least for googleability.
  - Working on @backend; in particular, the (external) auth module
  feels good enough, let's try it for real

Major user features (~expected order):
  - @backend
  - @flexible-view (see @better-cut) / UI-typing
  - @prefs-edition
  - @multilang
    - http://etym.org/
    - https://www.etymonline.com/columns/post/bio
    - /home/mb/Downloads/etymwn-20130208.zip
      - https://www.danielde.dev/blog/surprising-shared-word-etymologies/
      - https://news.ycombinator.com/item?id=27475193
  - @commented-books
  - @character-recognition-input
  - @extension

Major bugs:
  - @decomp-loop
  - Default display must reference used dictionaries: if default display does
  not contain a working tab, things break

Minor bugs
  - +來說 来说 [lai2 shuo1] /concerning, about/ no italics

Major internal reworks:
  - @better-cut
  - @better-grid-cache

# State
Working, extensible interface. Primitive support for non-Chinese.
A few identified bugs. SQL database scheme prototype.

## small @deverge @french @sanzijing
	Add original text from
		https://archive.wikiwix.com/cache/index2.php?url=http%3A%2F%2Fwww.bextes.org%2Fthintro.html#federation=archive.wikiwix.com&tab=url
	(IIRC, the previous step is now done)

	Work out the pieces, add things to the database/about, etc.

## small @tests-module-names
	There is to my knowledge no way to know the module
	name from a function pointer. So tests currently simply output
	the function name, making tests output difficult to follow.

	A simple workaround would be to add to Test a new field 'm'
	containing the module name.

	Module name could be automatically added via mktestsjs.sh,
	or we could use some tweak around import.meta. First solution
	is a bit meh (using shell as a macro langugae over JS); second
	solution is more verbose/longer to implement.

	NOTE: see also @better-modules

## small @real-logs
	We started modules/log.js for debugging purposes; we'd want
	loglevel to be conditionally enabled.

	Perhaps to be done after @backend: from the few identified
	use cases, we'll want to keep those logs somewhere for later
	inspection.

## small @yellowbridge
	Add links to
		https://www.yellowbridge.com/chinese/character-etymology.php?zi=%E7%BB%8F

## small @grammar-points
	Add (external) links to
		https://resources.allsetlearning.com/chinese/grammar/Keywords
	for all concerned characters (there's a TSV/CSV and a JSON) for automatic
	fetch/update.

## small @current-tab
	Current tab indication; see @mka-replace

## small @no-cache-books
	Requests for books shouldn't be cached (?)

## small @mka-replace
	Replace mka() with properly stylized buttons.
	Try to see if we can remove the underscores because it
	gets confusing on some characters (e.g. 亼 (ren2 over yi1))

## small @big5.readline-tests and @big5.read-tests #minor
	Missing tests.

## small @cedict.mktpatched-tests
	Missing tests

## small @surnames
	Delete surname entries? they are mostly noise for our purposes.
	This could be a preference user option, specific to cedict.

## small @keyboard-only
	Keyboard only mode : hides navigation buttons. Add in URL's hash.
	Can be set in preferences.

## small @pinyin-broken-format
	- 覀: [ya4/xià]🔊 xia4] is broken regarding pinyin replacement,
	likely because we used a / between the [].

	- 女 [nǔ:]🔊 also breaks audio because of the ":".

	- pinyin in pict.csv's entry for 宙 aren't transformed

	- [xī]🔊 dusk / evening / Taiwan pr. [xi4] -> xi4 not transformed.

## small @listenforpiece-triggered-bug
	Clicking on src-dec-tr triggers a listenforpiece() on ptr/psrc.
	Issue still there after src-dec-tr removal.

## small @invalid-pieces
	Code isn't really solid against broken backup/bad pieces data.

## small @bug-sanity-check
	NOTE: this is likely to be cknife bugs. Not sure what this was about:
	Bug on 王羲之 (cf. https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=1&wdqb=%E7%BE%B2 too)

## small @sound-shortcut
	Keyboard shortcut to play sound of currently displayed text

## small @web-archived
	For all external links, add additional links to web.archive.org's latests
	snapshot. We could also automatically send requests to archive such links.

## small @using-offset-in-url
	Using a word counter in URL breaks URLs once the dictionary changes.
	We could use a character offset instead

## small @mkpatched-mktpatched-xcutandrtokdef-tests bugfix
	Typechecking doesn't raise a warning when using mkpatched instead
	of mktpatched to create the test dict, while the type clearly
	are distinct. Try to see if we can reproduce with a smaller example.

## small @returns{void} or @returns{undefined} #minor
	We could explicitely distinguish functions returning no value

## small @piyins-tests #minor
	We could perform stricter checks in
		- 'modules/utils.js:/^function addaccent\('
		- 'modules/utils.js:/^function pinyinn2a\('
		- 'modules/utils.js:/^function pinyinsn2a\('

## small @assert-checks-move
	We defined a few assertions in Moveable.update, but
	we have no tests to ensure that they do work as expected.

	Also, see @non-empty-array-typecheck

## small/medium @non-empty-array-typecheck
	Non-empty array check is performed manually on user input,
	and eventually double-checked by assertions. We could
	use `type NonEmptyArray<T> = [T, ...T[]];` instead.

## small/medium @shortcuts
	Per user shortcuts => stored in preferences.
	Default documented.

	Add as shortcut to toggle ToC. More generally, all buttons should
	be available via a shortcut.

## small/medium @toc-search
	^f when toc is displayed should search on toc in priority
		- when toc is displayed, highjack ^F event?
		- alternatively, we could/should have a search field in toc
		to filter entries matching search expr?
		https://stackoverflow.com/questions/54863749/ctrl-f-search-only-model-popup-html-data

## small @nine-chapters-math
	Import for study:
		https://en.wikipedia.org/wiki/The_Nine_Chapters_on_the_Mathematical_Art
		https://ctext.org/nine-chapters

	Multiple translations are listed on the wp page.

## small @decomp-unicity
	Many times, different sources will have the same decomposition:
	just display it once.

	It's the only reason why the default setting only display the
	first decomposition.

## small @html-body-scrolling
	We have some CSS to be applied on html & body, essentially
	depending on the class of the div with id="main". For now
	this is clumsily managed, but we should be able to get something
	cleaner via:
		https://developer.mozilla.org/en-US/docs/Web/CSS/:has

## medium @pages-state @better-history
	Following the SPA implementation, we've left a few brittle
	bits around history navigation. For example, when history
	navigation is about going back and forth within the same
	book, we're reloading the whole page, while we could be smarter,
	or perhaps implement history navigation a bit differently.

	We may also be interested in keep pages states, so that when
	we move away from index and back to it, we restore the page
	where we left of. It could be as simple as keeping the bookmark
	hash somewhere.

## medium @inline-about
	In order to increase visibility for a ressources, we could add
	a small popup-on-click containing a table of our ressources.

## medium @merge-trbook-book
	Have book be a special case of trbook, where the pieces CSS
	classes do not alter colors in any way.

	If we could have a single way to render current chunk,
	even for index/navdict, etc. this would also help solidify
	our move-on-click feature, which for now is incredibly clumsily
	implemented given its practical usefulness.

	See also:
		- @flexible-view
		- @commented-books

## medium @dict-sentence
	There are sentences in e.g. CC-CEDICT, but for now we can't
	use them correctly.

	More specifically, the issue occurs with punctuation within
	entries, e.g. 達·芬奇

	There are some subtle behaviors around tokenize/rtokenize;
	we have a prototype for a new tokenizer that could avoid us
	such issues, but not yet satifsactory.

	We also could relate this to @multilang.

## medium @decomp-loop
	This will start to be a problem with user-provided decomposition
	tables and @multidec.

	There are two main ways to proceed:
		1. Either we ensure that there's no possible loops between
		all the potential decomposition tables that we have at our
		disposal, as we'll need to prevent it for various combination.
		2. We have xcut() not being recursive, but only being recursive
		on call
		3. We only allow xcut to be recursive up to a 100 levels.

	The first solution is obviously the cleanest, but requires to do
	some graph analysis, and we'll need to check input validity at every
	update.

	The second one would work, but would require to tweak grid.js to
	launch the calculus.

	The third is simple to implement and should avoid most issues.

	NOTE: @better-cut is a solution; UI code already doesn't recurse,
	so we just have to avoid recursing in cut to prevent the issue.
	It'll still be a problem if we want, e.g. LaTeX output.

## medium @flexible-view
	Have some shortcut/button to hide #tr, to maximize #dec, to
	go back to default view, adjusting the empty space accordingly, etc.

	We also could find a way to avoid word restacking on horizontaly
	wide decompositon (e.g. 無窮無盡, 機會), that is mostly a workaround
	for now.

	This shouldn't actually be too hard; some people can even do it
	with pure CSS:
		https://stackoverflow.com/a/53731196

	See also:
		https://codepen.io/lukerazor/pen/GVBMZK
		https://stackoverflow.com/questions/12194469/best-way-to-do-a-split-pane-in-html
		https://www.bypeople.com/drag-drop-sortable-css-grid/
		https://github.com/nathancahill/split
		https://css-tricks.com/snippets/css/a-guide-to-flexbox/
		https://adamlynch.com/flexible-data-tables-with-css-grid/

## medium @user-doc
	Properly maintain user documentation

## medium @tech-doc
	Properly maintain tech documentation. We can
	for instance try to automatically extract jsdoc and
	see what it gives.

	We could also try to render README.md, TODO.md
		-> WIP thanks to github I guess.

## medium @finer-dict-def-tokenizing
	Currently, we're not managing overlapping when we tokenize
	(english) dict's definition, looking for Chinese characters
	to be inspected/pushed on stack.

	If there's no overlap, keep current solution; if there's
	overlap, display small popup on display allowing to stack
	available words being overlapped.

## medium @documentation
	E.g.
		doc.zhongmu.eu  - dev documentation,  @tech-doc
		help.zhongmu.eu - user documentation, @user-doc

## medium @filter-sentences
	Feature that could be useful to researchers: have the ability to
	to look for uses of a word/expression in context.

## medium @dict-parsing-error @parsing-error @patching-error
	We now properly returns errors from parsers/patchers as we're
	about to let users actually manage their own files.

	Still, we could/should:
		- find a way to properly display the errors (...)
		- by default, ignore small punctual errors and keep parsing.
			- this is reasonable, but users need to be notified
			in a subtle way.
		- double check our line numbering works

	See also @multiple-dictionaries and related.

## medium @previous-pinyin-usages @previous-usage @same-defs
	When reading a book, it helps to be able to link the
	pronunciation of a character with what we've already
	saw. E.g. 再/在 (zai4), but also 極 (ji2)/計 (ji4).

	Similarly, we may want to dig previous usage of characters
	e.g. in components. For instance recalling 智 when we later
	find 知.

	Similarly, highlight in a chunk all characters containing
	a selected character (e.g. highlight 道, 類, when selecting 首).

	Similarly again, different words may have overlapping definitions,
	e.g. to arrive: 來, 至, 到, 去.

## medium @cut-latex-cli-display @cut-latex-web-display
	We want the ability to generate a LaTeX table for the
	recursive decomposition of a word on CLI, so we can
	embed those in .pdf to get properly printable data.

	We could also have a button to export LaTeX from the web,
	display in a <textarea> popup.

## medium @books-metadata @database
	We'll want to know e.g. which printed edition is this digital Chinese
	version from, or who wrote that translation, etc.

	We can/could use a SQLite database to store all of it, and use some text
	blobs to store the actual books. The relationship between book and
	their translation could furthermore be engrained into database scheme.

	https://news.ycombinator.com/item?id=28462162
	https://brandur.org/sqlc

	https://aws.amazon.com/free/
	https://en.wikipedia.org/wiki/Amazon_S3
		https://brandur.org/aws-intrinsic-static

	To be correlated with @backend.

## medium @data-organisation
	I'm keeping this one open because the DB isn't really a DB just
	yet.

	See @books-metadata, @database, @backend, @ressources-fetch.
	@dict-sources, @dict-parsing-error, @data-subdivision

	We're working on a SQL database scheme in ./schema.sql and ./schema2.sql,
	which is for now automatically injected as ./modules/db.js via ./Makefile.

	We're starting to conceputalized data access so as to later be able to implement
	various features (@multidict, @multidec, @dict-decomp-web-edition)

	The database would be usefull in multiple ways:
		- data update/fetch: we don't want to have to install node.js or similar
		  on backend, so we'll want those things to either be Golang/Perl/Shell/whatever.
		  More standard unix tooling.
		- front-end access: front-end would access cached, compressed, pre-downloaded
		  version of the data. We'll allow some special data type allowing to e.g.
		  build a dictionary from original source + some user patches. We'll need to
		  develop something handy to allow automatic update without impacting user
		  patches.

	If we allow user patching, update method should take ensure all
	patches are valid before properly updating a dict.

## medium @character-recognition-input
	Add the ability to handwrite characters, using an external module; see
		https://github.com/gugray/HanziLookupJS
			-> used by handedict
		https://github.com/gugray/hanzi_lookup
		https://news.ycombinator.com/item?id=19530079
		https://www.chenyuho.com/project/handwritingjs/ (relies on google)
		https://github.com/skishore/makemeahanzi
		https://tesseract.projectnaptha.com/
		https://tegaki.github.io
		https://www.qhanzi.com/index.html/

## medium @strokes-order-v2
	There seems to be a lot of projects adding the ability to compute
	strokes order from SVG/raw data, perhaps worth taking a look?
		https://www.programmersought.com/article/90494924110/

## medium @character-same-decomposition-type
	E.g., get all characters containing 𦥯 as an upper component.
	Not sure how to integrate it nicely with the rest.

## medium @chise-images
	Some characters are missing from font, we could at least add
	them in a tab, e.g. https://www.chise.org/est/view/character/%F0%A3%A5%82

	Same as for strokes, we could cache either the images or the ones
	that are present/missing.

	There also are some tricks to check whether a character is missing
	from a font, but that's a bit subtle.

## medium @dict-sources @decomp-sources
	When patching a dict, or when sharing a personnal dict, it would
	be pleasant to be able to specify sources, and to be able to consult
	those sources on the web UI.

	Same goes for decomposition tables.

	We could try the following format:
		# source: ...
		+a a [...] /abcd/
		+a a [...] /efgh/
		# source: ...
		+a a [...] /ijkl/mnop/

	We don't parse yet those special lines, but the data structures
	have been prepared to carry them (lib.d.ts:/^interface WithSources)

## medium @better-overlap
	When two words are overlapping, e.g. 'ab' and 'bc', we read either of
	them, but neither 'a' 'bc' and 'ab', 'c'.

	That always breaks the reading flow, and requires the user to break
	down either word to properly get it.

	Not sure how to solve it yet. We could
		- move through a, ab, bc, c, with special highlighting, perhaps by
		  adding a mode to cut, or adding a layer on top of cut to generate
		  such entries.
		- automatically breaks down overlapping word at least by one level
		- automatically stack e.g. c when viewing ab and a when viewing bc

## medium @bookmarks
	NOTE: this is less useful than it used to be, but still can prove useful
	in narrow setting (e.g. research).

	push a position, go somewhere else, pop a position.
	useful to go back to some characters seen a few sentences before.

	Start with one, only with a keyboard shortcut, but prepare
	for an array of bookmark.

	loadbookmark() now allows to be feed with getbookmark()'s return values.
	Some adjustments to be made, create the stack & button/shortcut, take
	into consideration that soon the bookmark will contain more data.

## medium @memory-optimisation
	Besides index.js, for books, we could mark the dictionary entries
	we use and only keep those instead of loading everything.

	We would have to benchmark and see if this is interesting. This
	may become more useful for @non-chinese, as we'll need to somehow
	register all the declination of a word.

## medium @chise-cdp-support @dict-cdp-support @chise-non-utf8
	CHISE project decomposition table can reference CDP encoded characters,
	that is, characters not covered by utf8.

	It would be interesting to see if we can integrate them:
		- .zhongmu-word could look for images as we do for seal scripts with
		Shuowen:
			https://www.chise.org/est/view/character/rep.big5-cdp=0x895C
			https://glyphwiki.org/glyph/cdp-895c.svg
		- perhaps we could also try to find a way to have them stored in
		a typical CC-CEDICT-formatted dictionary, where we to be able
		to find some semantic information.
		- they may be variants, so see if we could manage this around @variants.

	There are others non-utf8 code points (e.g. &GT-K00264) that we may want
	to manage similarly.

## medium @chise-decompositon-type
	CHISE decomposition type is a bit different from what we're used
	to. There are also some things we don't properly understand, e.g.
	why is there a:
		U+4EA8	亨	⿱⿱亠口了
	instead of:
		U+4EA8	亨	⿳亠口了

	Also, there will be overlaps with some extensions used by WikiMedia's,
	e.g. ⿱⿰ for 咒 (CnWmAboveTwiceToBelow)

	For now, as we're not using this data anyway, we've marked them
	all as unknown.

## medium @event-handler-debugging
	We could/should separate event registration from event
	code: everytime we need to tweak a handler, we have to reload
	the page instead of updating the handler.

	Update: this is only to ease debugging in the web console.
	Not sure how it works around modules.

	The following is broken: (f is a pointer to function):
		function h(){};
		function addevent(x, t, f) {
			x.addEventListener(t, function(e) { f(e) });
		}

	The following works:
		function h(){}
		function listenforh() { x.addEventListener("click", function(x) { h(e) }); }

## medium @tree-control
	Perhaps a way to control a whole tree, e.g. recursively display
	all, move to imgs tab for all displayed, etc.

## medium @broken-behavior
	There's a bit of a weird behavior when a word is spread on
	two pieces.

	No JS error, but current words highlight is broken. Not sure
	it's critical; because of word overlapping, this causes an
	issue if we were to want to create a piece breaking an overlapping
	word.

	At least we should document this?

## medium @multiple-pinyins
	Allow to rotate between pinyins representation. Keep track
	of it in URL's hash #, p=

	And/or we could have a user preference entry.

	https://en.wikipedia.org/wiki/Bopomofo, we should easily
	be able to extract a conversion table/function from that.

	https://github.com/gugod/js-bopomofo-to-pinyin/blob/master/bopomofo-to-pinyin.ls
	https://www.yellowbridge.com/chinese/zhuyin.php
	https://www.yellowbridge.com/chinese/syllabary.php

## medium @mobile-view
	Vertical view / mobile view.

## medium @multidict-search
	Subfeature of @multidict, about the ability to make
	search in multiple dictionaries from index.js/index.html.

	This is already implemented to a great extent; we'll
	just need to display pinyins and dictionary names to have it
	fully usable.

## medium @trad-chinese-dict
	Special test case for @multidict. The Shuowen was our
	main testbed,  achieved. We could still push further
	and add more dictionaries:
		https://web.archive.org/web/20120207025728/https://seguecommunity.middlebury.edu/view/html/site/tbilling/node/4226261
		The Yupian 玉篇 (Jade Leaves) of 543, by Gu Yewang 顧野王 (519-581),
			22,561 characters under 542 classifiers
		The Leipian 類篇 (Classified Leaves) of 1066, by Sima Guang 司馬光 (1019-1086) and others
			31,319 characters under 544 classifiers
		The Zihui 字彙 (Word Compilation) of 1615, by Mei Yingzuo 梅膺作 (fl. 1570-1615)
			?? characters under 214 classifiers.
		https://dsturgeon.net/ctext/

	Kangxi
		Text version of the Kangxi, one entry per line
			https://github.com/7468696e6b/kangxiDictText
			https://simonwiles.net/projects/kangxi-zidian/ (source of previous)
			https://simonwiles.net/
		Browsable
			https://ctext.org/kangxi-zidian
			https://www.zdic.net/zd/kx/
			https://zh.wikisource.org/wiki/%E5%BA%B7%E7%86%99%E5%AD%97%E5%85%B8 (partial)
			https://kx.cdict.info/
			https://www.kangxizidian.com/v2/
		Epub
			https://wakufactory.jp/densho/ndl/kouki/ (1.63Go, likely a scan)
		Perhaps looking for it in Chinese 康熙字典 ?

	JSON Shuo Wen Jie Zi with annotations:
		https://github.com/shuowenjiezi/shuowen

## medium @heavenly-stems
	Perhaps we could complete dictionary with more data for those,
	as they often arises in compounds:
		https://en.wikipedia.org/wiki/Earthly_Branches
		https://en.wikipedia.org/wiki/Heavenly_Stems

	How to present them properly is yet to determine.

	See what the Shuowen has to say about those.

	IIRC, they were used e.g. to order entries in the Kangxi.

## medium @simplified-chinese
	NOTE: we're slowly introducing in @data-organisation the ability
	to create ad-hock dictionaries from a series of patch. This can
	allow user dict/decomp edition & al. Users willing to use simplified
	characters would also have the opportunity. We can provide automatically
	generated patches for common needs.

	Some characters, valid as traditional, only exists as simplified
	in CC-CEDICT.

	We solved the issue by introducing dict3.csv, which seems good
	enough for now.

	We may want to tweak the dictionary again and re-introduce modern
	characters thought:

		{
			'尚' : {
				'shang4' : [
					/* trad   */ [tweaked?, [...]]
					/* modern */ [tweaked?, [...]]
				],
				...
			}

		}

	An argument in favor of that would be that some characters from
	decomposition table are actually ~purely simplified forms, e.g.
	产.

	Other issue with current status:
		亇 亇 [ge4] /variant of 個|个[ge4]/
		->
		亇 亇 [ge4] /variant of 個[ge4]/
		ie. we loose the link to 个

	Note that @multidict should naturally solve the issue, by
	allowing simplified/traditional dict.

## medium @variants
	Can we automatically augment the dictionary with references?
	E.g. 巛 is an archaic variant of 川, but 川 doesn't reference it back.

	We could add it to dict3.csv / dict4.csv.

	NOTE: "also written 裏[lǐ]" is a variant of "variant of" etc.

	More generally, a problem with CC-CEDICT is that it is not
	a fully computer-friendly dictionary. Perhaps we would be better
	with a more rigid data framework, e.g.

		- variants dictionaries
		- "real" dictionaries & conversion scripts
		- decompositions tables

## medium/long @zhongmu-trs
	NOTE: the feature has been quickly implemented; this needs
	to be reworked with @multiple-dictionaries in mind, and extended
	so as to provide something more user friendly than bare regexp
	search.

	Main zhongmu field, instead of only holding Chinese, should
	also be able to hold English word and provides translations
	that we can analyze.

	E.g. "music" : display all characters whose defition matches
	music, and allow to stack them. For now, we expect input
	to be a regexp (e.g. \bmusic\b); we'll want something easier
	on users, and the ability to look for AND/OR words:
		OR:  \b(foo|bar|baz)\b,
		AND: ^(?=.*\bfoo\b)(?=.*\bbar\b)(...).*$
	https://stackoverflow.com/a/4389683

## medium @derivate-links
	Once we have @multiple-dictionaries, we would have pict.csv
	as a special dict containing entries for pictographic explanation,
	and likely extended to contain typical symbolic uses for some symbols.

	Aside from that, we could also automatically generate a dictionary
	where each entries would contain a list of characters/words containing
	the character being defined.

	The UI would naturally allow to navigate through such a list, thus
	keeping such entries rather light.

## medium @character-lookup-in-ancient-text
	產, according to wm, is decomposed to 产+生; 产 seems to be a purely new, simplified
	character.

	Typically, we'd want to check in ancient texts if that character actually exists.
	We may want to write some scripts to do all that.

	Note that this may be a consequence of decomposition format restriction?

## medium @same-pronunciation-links
	In the same manner as for @derivate-links, once we have @multiple-dictionaries,
	we could automatically generate a dictionary containing, for each character,
	a list of all the characters that have the same pinyin.

	This could be an activate tab, that would be computed on-demand, rather
	than pre-emptively.

## medium @dict-decomp-web-edition
	NOTE: below is ancient documentation. Patching existing
	dictionary is pleasant, but requires to maintain such
	patches, which can be a burden to the user.

	To be done once we have proper users; add a small
	edit button.

	Upon edition, retrieve all lines from user patch for
	this dict/decomp. If none, retrieve lines from original
	dict.

	Display such lines in a textarea, in a modal, perhaps using
		https://news.ycombinator.com/item?id=26915706

	On submit, push changes to user patch file, rebuild zmdata
	for this user, reload it.

	Perhaps we'd want a function to dump a dict to original cc-cedict
	format?

## medium @index-search-tests
	We could add some tests for Data.search();

	See also @index-search-jump-on-dict.

## medium @index-search-jump-on-dict
	On index.html, when searching some words and trying to stack
	them, automatically display the (first) tab containing the dict
	using that definition.

	See also @index-search-tests.

## medium @ancient-decomp
	There *are* some decomposition table for ancient characters, e.g.
	chinese-characters.org, were there's also a map from seal scripts
	to modern versions.

	We can also try to build one from the Shuowen; which seems to have
	already been done to some degree:
		https://ieeexplore.ieee.org/document/5952739
		https://www.semanticscholar.org/paper/Computer-description-of-Chinese-character-form-on-Hu-Wang/6a852516503e2f71f70871a2424391fc9d2bca85

	Can we have a pict.csv for ancient forms?

## medium/long @backend @database
	The backend originally (in previous prototype that is)
	was a dumb go server handling a few requests, mainly to
	update pieces in a translated book.

	We'll now need something a bit more exhaustive, with proper
	SQL database to store users, books, with nice meta-data, and
	allowing more complete operations.

	There's already a early SQL scheme/DB budding in ./schema.sql,
	that is compiled to JSON/JS (./modules/db.js).

	Use Go as a backend language.

	As for architecture, as we already have plenty of code/CPU
	usage delegated to the frontend, we're likely to keep things
	this way, and have a very dumb backend, whose role would mainly
	be to provide a remote filesystem with permissions/groups.

	As for databases, we're likely to use a sqlite database for
	development/prototyping purposes, and switch to something
	sturdier later on, if/when need be.
		https://news.ycombinator.com/item?id=31318708
		https://news.ycombinator.com/item?id=31364166
			https://datastation.multiprocess.io/blog/2022-05-12-sqlite-in-go-with-and-without-cgo.html

	It would be interesting to see if we could use the filesytem
	to manage permissions, and e.g. keep the meta-datas in
	SQL or in the FS. In a way, rewritting a permissions system
	in a database that already come with a permission system (e.g.
	MySQL's users & such), on an OS which already provides such
	features too, seems quite redundant. We may have a performance
	hit, but a ramfs should help take care of some of it.

	For Go, see sqlc and
		https://news.ycombinator.com/item?id=29351766
		https://alanilling.medium.com/exiting-the-vietnam-of-programming-our-journey-in-dropping-the-orm-in-golang-3ce7dff24a0f

	See also (alpine, django, htmx):
		https://news.ycombinator.com/item?id=29319034
		https://www.saaspegasus.com/guides/modern-javascript-for-django-developers/htmx-alpine/

## medium/long @commented-books
	We'll need to grow this alongside @backend, @database, @data-organisation,
	@flexible-view.

	@qian-zi-wen-notes could be an interesting testing example.

	The goal would be to have an optionally displayed buffer behind/instead
	of #tr. Such buffer would contains notes that are related to currently
	selected character.

	A note would, like a translation piece correspond to a slice
	of #src. Notes could contains Chinese text and should be tokenized
	as a dictionary's definition.

	We'll also want the ability to add/edit/remove/share notes, perhaps
	to have some TeX export.

	Traditionally, books were commented, e.g. http://www.shuowen.org/view/1,
	which exposes comments of the Shuowen by various historical authors.

	Such notes would be in Chinese, and we may want to recurse to a
	src/dec/tr (/notes) view for thoses too.

## medium/long @qian-zi-wen-notes @qian-zi-wen-translation
	Retrieved from https://www.angelfire.com/ns/pingyaozhuan/tce.html

	See also:
		http://www.camcc.org/reading-group/qianziwen
		https://www.yellowbridge.com/onlinelit/qianziwen.php?characterMode=t
		https://web.archive.org/web/20190403231106/http://www.oocities.org/npsturman/tce.html
			https://www.oocities.org/soho/museum/4826/
			https://www.oocities.org/soho/museum/4826/tce.html

	See also @commented-books.

## medium/long @non-chinese @multilang
	Quick first prototype works decently. We'll need:

	- per language links support in modules/links.js-
	- per language tokenisation: we don't need a TreeDicts, and
	current situation about sentences in dictionaries would be
	troublesome e.g. for "aujourd'hui".
	- autodecomp bug on "Касатского"
	- More dictionaries:
		https://freedict.org/downloads/
		https://github.com/freedict/fd-dictionaries
		https://download.freedict.org/
	- decomposition tables:
		@multilang-decomp (https://www.openwords.com/)
		https://www.etymonline.com/
		https://en.wikipedia.org/wiki/Etymological_dictionary
	- https://en.wikipedia.org/wiki/Egyptian_Hieroglyphs_(Unicode_block)
		https://en.wikipedia.org/wiki/Egyptian_hieroglyphs
		https://news.ycombinator.com/item?id=37519368
			https://vega-vocabulaire-egyptien-ancien.fr/en/the-vega/presentation-of-the-tool/
		https://www.hierogl.ch/hiero/ib
		https://www.lexilogos.com/english/hieroglyphs_dictionary.htm
	- https://news.ycombinator.com/item?id=35867935 (greek language etymology)
	- Arabic, with etymological definitions?
		https://www.amazon.fr/Arabic-Stories-Language-Learners-Middle-Eastern/dp/0804843007
		https://fr.wikipedia.org/wiki/Les_Mille_et_Une_Nuits
			https://fr.wikisource.org/wiki/Mille_et_une_nuits
			https://en.wikisource.org/wiki/One_Thousand_and_One_Nights
			https://ar.wikisource.org/wiki/%D8%A3%D9%84%D9%81_%D9%84%D9%8A%D9%84%D8%A9_%D9%88%D9%84%D9%8A%D9%84%D8%A9
		https://sourceforge.net/projects/arabic-wordlist/files/
			/home/mb/Downloads/Arabic-Wordlist-1.6/
				-> only contains words (no definitions)
		https://sourceforge.net/projects/arabeyes/files/Wordlist/
			/home/mb/Downloads/arabic_wordlist-0.6.1/
				-> Word 2 Word mapping (1:1, no "real" definitions;
				still better)
		https://github.com/linuxscout/arramooz
			not a english-arabic dict, but could be useful to decompose
			words
		https://www.clarin.eu/resource-families/dictionaries
			Various dictionaries, likely arabic-arabic
		https://sourceforge.net/directory/linux/?q=arabic+dictionary
			More stuff to inspect
				https://sourceforge.net/projects/nibras/files/
				https://openburhan.net/
					https://sourceforge.net/projects/open-burhan/files/
				https://sourceforge.net/projects/almutarjim/
				https://sourceforge.net/projects/allamy2/
				https://sourceforge.net/projects/adnandict/
				https://sourceforge.net/projects/arabicnewwords/
				https://catalog.ldc.upenn.edu/LDC2004L02
				https://sourceforge.net/projects/arabicrootsandderivatives/
				https://sourceforge.net/projects/hclalexique/
				https://sourceforge.net/projects/maskouk/ (*)
				https://sourceforge.net/projects/aletter/
				https://sourceforge.net/projects/esidzstudentdic/ (*)
				https://sourceforge.net/projects/almuajam/
		https://download.cnet.com/Arabic-Dictionary-English-Free-With-Sound/3000-18495_4-75749312.html
		https://www.jigsawlab.com/arabic-dictionary.html
		https://en.wikipedia.org/wiki/List_of_dictionaries_by_number_of_words
			There are historical Arabic dictionaries, which may have been
			translated?
			https://lexicon.alsharekh.org/
		https://www.mezzoguild.com/learning-arabic-5-books-i-recommend/
			https://www.mezzoguild.com/how-to-start-learning-arabic/

## small @tolstoi-father-serge-full-import
	https://fr.wikipedia.org/wiki/L%C3%A9on_Tolsto%C3%AF ?
		https://fr.wikipedia.org/wiki/Le_P%C3%A8re_Serge
		Отец Сергий
		https://ru.wikisource.org/wiki/%D0%9E%D1%82%D0%B5%D1%86_%D0%A1%D0%B5%D1%80%D0%B3%D0%B8%D0%B9_(%D0%A2%D0%BE%D0%BB%D1%81%D1%82%D0%BE%D0%B9)

## long @multilang-decomp
	For curiosity's sake, https://www.openwords.com/ pretends to mine
	wiktionary data; we may be able to create interesting content from
	this.

## long @pieces-import
	Import pieces mechanism from zf. More generally, the goal
	here would be for zhongmu to be able to allow registered users
	to submit chinese text, a translation, the ability to edit
	the translation, and to link both with pieces.

	This needs to be broken in smaller tasks, and we need to
	define some scope:
		- this should be time consuming, do we have ressources for this?
		- do we allow user to also edit dictionaries? how so? etc.

## long @extension
	Extension has been backed up in ./ext/ and haven't been maintained
	for a while. There were numerous problems with it.

	It is likely that having something similar to Google's translate
	extension does would be good enough for most of our purposes.

	Two first thing to implement:
		- an additional right click menu entry, with the ability to
			1. either display a movable popup with a decomposition
			of what has been selected;
			2. navigating to zhongmu.eu with the selected text in
			URL parameter

	We'll then have to think about how we could re-implement navigating
	in content in a page.

	Especially, the difficult part would be to think about how to handle
	multiple languages, as the old code was really Chinese-dependant.

	We could for instance allow sets of configurations that the user
	can automatically select from the right click menu (e.g. start
	zhongmu with the configuration "only-work-on-Chinese-characters",
	which will select appropriate dictionaries / decomposition tables).

	OTOH, we could also have automatic, per-websites, configuration
	files.

## long @better-cut
	Entry needs to be clarified (used to be intertwined with other
	stuff).

	See also @decomp-loop.

	There are a few clumsy things with current cut mechanism.

	First, cut() always tokenize, while often we already have the
	tokens, as we're calling cut() on a the .v of a token identified
	through parseandtok().

		The problem here is that, as-is, our views organisation prevents
		us from accessing the tokens from withstackgrid.js.

	Second, we systematically compute all the decompositions, which,
	while it could make sense for a LaTeX based rendering, is useless
	from a Web UI perspective; let alone considering @decomp-loop.

	cut() in itself is an antique conceptualisation that arised from
	early prototypes, that we may want to let die now.

	We could keep tokenize(), and instead of cut(), have a mdecompose()
	recursively calling decompose on an array of tokens(), with a mean
	(continuation?) to interupt/resume the decomposition.

	It's likely too that this method would help having a cleaner, fuller
	dump/restore mechanism, which for now is clumsy.

	Also, such a mechanism could help, were need be, to shift heavy
	work back to the server.

## no direct solution yet @better-zhongwen-urls
	Some characters aren't big5 accessible yet still exists
	in zhongwen, e.g.
		糹 : http://zhongwen.com/d/166/x205.htm
		攵 : http://zhongwen.com/d/u/xp2.htm
	Not sure how to compute that URL; not even hexadecimal

	Also, see the header of data/big5/big5.csv, there are some
	weird ranges that aren't properly mapped.

## no direct solution yet @zidian-odict-urls
	links to http://zidian.odict.net/1176077630211/
		-> not sure how to compute the URL.
		Not basic utf8, big5.
		GB2312-80 ? -> nope : 攵 is EBB6 (60342) according
		to http://internationalscientific.org/CharacterEtymology.aspx?submitButton1=Etymology&characterInput=%E6%94%B5
		yet, http://zidian.odict.net/857029649/

	http://internationalscientific.org/ChineseComputing.htm ?


## To be sorted

Also perhaps a idioms.html displaying a few famous idioms:
	微言大義

https://en.wikipedia.org/wiki/Guwen_Guanzhi
https://www.hackingchinese.com/learning-classical-chinese-is-for-everyone-no-seriously/

https://www.dolthub.com/blog/2024-03-08-postgres-logical-replication/

https://en.wiktionary.org/wiki/%E9%92%85
https://www.zdic.net/hans/%E9%92%85

https://en.wikipedia.org/wiki/Complete_Tang_Poems

Old TODO item from modules/data.js, perhaps there are still some interesting
bits: (to be sorted):
/*
	- An interesting solution would be to set things up in tab preferences,
	and allow on-the-fly patching:

		=> This would clearly separate dict reading from dict patching

		=> We need to adjust our dict format to keep track of whether
		we're adding or removing data.

		=> This allows users to furthermore customise their interface

		=> No need for a special preference; all of this is configured
		via tabsprefs.

		=> We could have a mostly silent error management, and allow
		inline-patch edition; thus removing the need for versionning
		and maintaining old version of data: having a similar definition
		~twice isn't much of an issue.

		=> We need to start thinking about the dict edition process/patch
		creation

		=> Patching can also be used for users to re-order entries.

	- How do we handle removal of clumsy (slang, [A-Za-z], etc.) entries?
		- This could be a flag in preferences, either global/local for a dict
		- Imperfect for patches chains, or we could allow it to be a string.

	- How do we handle simplified Chinese?
 */

http://www.chinaknowledge.de/Literature/Classics/baijiaxing.html
https://www.angelfire.com/ns/pingyaozhuan/toc.html
http://onlinebooks.library.upenn.edu/webbin/book/lookupname?key=Sturman%2C%20Nathan

# WIP
	feat: if enabling shuowen/pict, we may want to display wm-seal
	in word if not already.

	- data/book*s*/ vs data/dict/*
	- data/books/* are actually a bunch of files. We can/should either
	have a single blob, or a directory.
	- have the Formatter actually use the FmtParams to prepare clean and
	regular files from the raw files.

	- option to only display text if no images are available in zhongmu-word
		- word would still be available through the <sup>, so still selectable
	- allow to display multiple wm-seal in zhongmu-word (for multiple characters words)
		- we'll need a place holder when an image is lacking.

	- preformat dict correctly in mkshuowen.js, thus avoiding us the swmarkdown
	dict format.
