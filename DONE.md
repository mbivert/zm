# Introduction
Started a bit late: those are "closed" tickets originally located in
``TODO.md``. I've sometimes found useful to have an easily available
history of past entries.

First paragraph of each closed entry contains a closing statement.

# Entries

## medium @captcha
	2024-08-06: Not sure how great the selected captcha lib is;
	should be good enough to prevent automated abuse from dumb
	bots.

	Some ideas:
	  - historical (not solid): https://github.com/dchest/captcha
	  - very young, requires some JS, behavioral: https://github.com/wenlng/go-captcha/
	  - https://github.com/steambap/captcha
	  - https://github.com/mojocn/base64Captcha
	    I'm not sure how much better it is from dchest in terms
	    of efficiency, seems to be the same kind of generated captchas

## medium/long @backend @database
	2024-08-03: still a WIP too, decluttering TODO.md.
	.
	The backend isn't complete, but it's advanced enough to consider
	(almost) closing this (tests and corresponding updates remains).
	Later features to consider (split in existing @-entries):
		- identification of books translations & storage
		- meta-data,
		- comments,
		- etc.
	.
	No generic fs or perms module as we have for auth. Perhaps
	later, but that's currently overkill for zm.

		- schema.sql integration, ie.
			- get rid of bin/mkdbjs.sh
			- rework lib/db.js to actually perform RPCs
				- we'll want to be able to perform public RPCs (to
				keep the website working by default)
				- and private ones
		- schema2.sql review

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

## medium @data-organisation
	2024-08-03: this is still a WIP, but to declutter TODO.md
	Regarding file access, we want them to be cached by the browser
	(loading them is already time consuming, we'd like to avoid having
	to download them as well).
	.
	A "regular" RPC request will imply a POST, which will kill the
	cache (required by the spec). We could probably cache by hand
	anyway via a IndexedDB, but for now, we'll accept the special
	case.
	.
	Note also that for a "regular" RPC request, we'd need to discuss
	how to handle the return value: if this is JSON, then the file
	would need to be unziped, and the request compressed on the
	fly (slightly inefficient, but OTOH, if the request is properly
	cached, who cares).
	.
	Note also that for now, we keep pako, but we should be able
	to leverage the browser's ability to automatically gunzip
	content by setting the proper header; see @remove-pako.
	.
	See also @cache-loaded-dicts: I thought caching (file downloading)
	was an issue, but data file loading is also problematic.
	.
	Perms scheme has been kept simple but useful (public/private)

	FTR:
		http.HandleFunc("/data/get", func(w http.ResponseWriter, r *http.Request) {
			// Perhaps we should at least make sure that the browser
			// supports it?
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Content-Encoding", "gzip")

			gw := gzip.NewWriter(w)
			defer gw.Close()

			xs := &DataGetOut{
				"whatever",
				"something",
			}

			if err := json.NewEncoder(gw).Encode(xs); err != nil {
				log.Println(err)
			}
		})


## small @spa-broken-firefox
	2024-08-03: This and a som Dom.alisten()-based features were
	broken because of TypeScript boilerplate, and the fact that
	Firefox generates MouseEvent instead of PointerEvent on clicks:
	https://stackoverflow.com/a/76900433

	SPA navigation is broken on firefox (Linux) for <a>;
	history navigation works.

## medium @better-modules
	2024-07-27: This has been implemented with relative success. There
	are a few clumsy bits, but we can now access the modules from the
	JS console, got rid of the require() dependencies, and FWIW, sped
	up noticibly the full.js generation.

	We can't directly refer to ES6 modules from the dev console,
	which is annoying to test some code on the fly.

	Here's an alternative; the main issue would be the typing annotations:

		var Module = {};
		(function() {
		Module.var = value;
		Module.set = function() {
		};
		// basically, module content here.
		})()

	Or:

		var Module = (function() {
			return {
				...
			};
		})();

	Also, do we need to minify the code?

## medium @multidec-per-table @multidec-merge @multidec-patch
	We now can have multiple decomposition tables; code also support
	to various degree the ability to have multiple decomposition in
	a single table. /* Yet, only the first decomposition is displayed. */

	We'll need to be able to display all available decompositions.
	Also, we'll want the ability to merge different decomposition table
	and/or to chain patch them, as we do for dictionaries.
		If so, we'll also need to adjust our :after indicating number
		of enabled tab items; perhaps a second counters with colors?
		Or we just display them like chise-0 chise-1, etc.? (simpler)

## medium @better-grid-cache @partial-dumping
	2024-07-09: irrelevant since @view-hierarchy

	Current solution is clumsy, bug prone, and does not truly cache
	the full state (e.g. we're not caching the state of hidden
	navdicts).

	A simpler and more accurate solution would be to cache a pointer
	to the DOM nodes; current prototype breaks e.g. because of handlers
	registered on S.pgrid.

	Handlers are overall a bit clumsily registered here and there,
	and we intend on updating @view-hierarchy, so for now, this is
	pending.

	Perhaps just having pgrid holding one child and caching that
	child would be enough, but we'll need to go over the handlers anyway.

	NOTE: perhaps there's now a better way to solve this using embryo/zi.

## medium @view-hierarchy @bookmark-view-decorelation
	2024-07-09: cleaning up TODO.md; this has been fully implemented.

	modules/view.js is highly correlated with modules/bookmark.js,
	as they are used to initialized the View, most of the time.

	Sometimes we'd prefer it to be decorelated, e.g inline SWJZ,
	but decorrelating is annoying from a type-checking point of view,
	given our current ways of proceeding.

	Also, the Object.assign() dance is hacky, and is there only
	because of typechecking.

	Around here, the typechecking is mostly useful for documentating
	the code.

	Perhaps an other way of dealing with all this would be to have
	modules instead of mk() functions, where all such functions would
	take the state as a parameter.

	For now, we've been manually decorelating with an 'if' bookmark
	from the view.

	We'd also want a solution that can be progressively implemented.

	We're starting to see if we can have a function based implementation
	by progressively developping e.g. modules/view/utils.js.

## small @font-root-path
	2024-07-09: irrelevant since @view-hierarchy. The fonts can be configured
	in user preferences, and are loaded with the correct root path.

	HTTP root path defined in Makefile isn't respected in site/base/zm.css.

## small @data-subdivision #minor
	2024-07-09: has been irrelevant since schema.sql: each data file has
	a type (dict, decomp, book, etc.) and a format (cc-cedict, markdown, etc.).
	Thinking about it, it's a bit weird (e.g. we can have a dict with a "chise"
	format, at least in the DB). @data-organisation will be the occasion to
	review all that anyway.

	Started. We need proper interface, support for different dict types, etc.
	Cf. @data-organisation


## small/medium @defaultdisplay-auto-activate @navdict-tab-conf
	2024-07-09: This should have been solved by @view-hierarchy,
	as we don't generate the HTML pre-emptively anymore. I haven't
	tested that it's okay though.

	We now can choose to locally override grid configuration for
	a navdict.

	But, were we to specify a defaultdisplay starting with an
	activeable data, it will actually recursively activate all
	those, as we generate HTML systematically.

	Thus, were we to specify shuowen, as the first defaultdisplay
	for a navdict shuowen, this will loop indefinitely.

	One solution would be to make all tabs activable-tabs, that is,
	never generate the HTML until users decides to *view* the tab
	content, and recurse one layer upon click.

	This would unify the behavior, prevents infinite looping, and
	allow an acceptable use-case.

## medium @inline-help
	2024-07-09: This has been implemented during @view-hierarchy.

	Instead of having the kao example in a single page, it would
	be handy if we had a cliquable "?" on a(ny?) decomposition grid,
	where clicking it would display a popup as the one we use for
	the ToC, with the kao example.

	See also @inline-about

## medium @bug-multi-move
	2024-07-09: As stated by the end of the entry, this has been
	implemented during @view-hierarchy. Other issues aren't documented,
	so pointless to keep this around.

	When we have e.g. two ViewWithNav on a page, keyboard move are
	performed on all at once. This isn't critical, but that's visible.

	NOTE: this is currently solved, but there are other issues with
	keyboard moves so I'm keeping this.

## medium @better-mouse-click-moves
	2024-07-09: This has been fixed a while ago.

	Mouse clicking moves are counter intuitive and clumsy.
	It's better than nothing as-is, but we'll want something
	finer.
	^ Not sure what this was about; kept in case.

	The imprecision bug has been fixed though.

## medium @qianziwen
	2024-07-09: No more details; book has been imported a while ago.


## medium @multiple-fonts @better-font
	2024-07-09: Implemented a while ago. The last point (button for font
	rotation) can be done when we work on the user preferences page.

	~Implemented. Ancient todo item: "See hannoma.ttf of opfd, test how it
	behaves".

	Perhaps we'll need a button to allow font rotation?

## medium @ancient-forms
	2024-07-09: Implemented a while ago. Some further ideas are
	already documented in isolated tickets.

	We now allow displaying of ancient form from wikimedia either
	in an imgs tabs, or through .zhongmu-word.

	We could eventually try to find other sources:
		- @chise-images (see also @chise)
		- Richard Sears, http://internationalscientific.org/CharacterEtymology.aspx,
		but most of it seem to be imported to wikimedia.
		- http://chinese-characters.org/ which likely borrow from Richard Sears

	We could push this sub-project further:
		- @ancient-decomp, see also @multidec

## medium @multiple-decomp-tables @chise @multidec
	2024-07-09: Implemented alongside @view-hierarchy.

	smaller tasks:
		- Prepare: ts.c should now contains an array of potential
		  decompositions. Ensure it all works with a single decomposition.
		- decomp2.csv : add a new decomposition table
		- UI: we may need to add a few bells & whistles in case we allow
		  a single decomposition table to provides multilpe decompositions
		  for a single character.
		- chise get & convert : to make data, proper get/convert scripts.

		- Try to name the decomposition and keep them in order. We can
		  show them on hovering on the [3/4] link for instance.

	Decomposition data:
		https://github.com/nieldlr/hanzi/blob/master/lib/hanzidecomposer.js
		https://github.com/cjkvi/cjkvi-ids
		http://www.chise.org/

## medium @ressources-fetch
	2024-07-09: Implemented a while ago.

	Move ressources fetching code from Makefile to
	individual scripts, eventually making them less brittle.

## medium @multiple-dictionaries @multidict
	2024-07-09: Implemented alongside @view-hierarchy. some
	bits related to @multidict-search remains (dedicated entry).

	This is implemented to a great extent.

	Overall a key feature, would help solve:
		- @trad-chinese-dict (Kangxi mainly)
		- @variants (find a dict/automatic generation, TODO)
		- @derivate-links (automatic generation, TODO)
		- @dict-decomp-web-edition
		- @same-pronunciation-links (automatic generation, TODO)

	Also, see @non-chinese: we'll want to prepare tokenisation
	mechanism to support non-chinese dict/src.

## long @on-the-fly-grid
	2024-07-09: Was tied to @better-cut; solved with @view-hierarchy.

## @_unknown_
	2024-07-09: Unsorted items, now irrelevant.

	- automatic creation of special dict (related by sound, variants, etc.)
		- try to see if we can implement it with an activeable tab. We could
		cache results.
	- on index.js move event that cannot be achieve on main psrc is forwarded
	to smaller one.
	- if movement on a grid that contains a psrc, forward to that psrc instead
	of forwarding to main psrc.
