# Introduction
[Zhongmu][zhongmu] ("中目") is a website/JS-library allowing to systematically
inspect Chinese characters using external resources
(dictionaries, decomposition tables, etc.). In particular, we try
to make good use of various "open" resources.

This can be used on isolated characters, words, pieces of texts,
or complete works.

See [this article][tales-on-chinese] for more information about
why/how this can be useful.

# Files
This list is a WIP/TODO.

  - ``./TODO.md``: rough roadmap and ticketing-system-in-a-file
  - ``./DONE.md``: contains closed entries from ``TODO.md``. This has been
  started quite late, so not all the history is in here.

  - ``./modules/*``: modules, one per file.
    - ``./modules/data.js``: Wraps access to various data submodules. We have a few
      different data types:
        - ``modules/data/dict/*``: dictionaries
        - ``modules/data/decomp/*``: character decomposition tables
        - ``modules/data/big5/``: big5 related encoding table
        - ``modules/data/book/*``: some books which can be studied with zhongmu
      For each data types, the submodules correspond to individual parsers
      and parsing utilities.
    - ``modules/cut.js``: relies on data files to identify words in a chunk
    of Chinese text (there is no spaces between words in Chinese, hence we
    can't just split on spaces to extract words);
    - ``modules/db.js``: for now, just a JSON/JavaScript dump of the SQL
    database. Later, we'll perform requests to a backend to get the database.
    - ``modules/view.js``: this is the core of the UI. We use a simple, peculiar
    JS pattern which avoids us the need for React or any modern framework, which
    seems to be as expressive: to each (DOM) node type, we associate a "constructor":
    a function which takes some paramaters, and return a DOM node. Naturally,
    complex nodes (trees) are built by calling "constructors" within other
    "constructors".
    We can then use various mechanism to send data back and forth within
    the DOM (e.g. keep pointers to specific nodes, event bubbling).
    - ``modules/view/*``: specific, per-page UI code;
    - ``modules/dom.js``: DOM manipulation utilities;
    - ``modules/move.js``: state machine handling user motion through a piece
    of Chinese text;
    - ``modules/node.js``: Node.js related code. We rely on Node.js to run
    a few JS scripts, mainly to prepare data.
    - ``./modules/utils.js``: small, independent utilities;
    - ``./modules/bookmark.js``: contains code to dump/load some of a page's
    state (e.g. user location within a piece of Chinese) to/from the URL's hash;
    - ``./modules/links.js``: tools and ad-hoc databases of available
    external links (e.g. external dictionaries);
    - ``./modules/user.js``: user preferences management (not the UI code,
    just the internal stuff);
    - ``./modules/assert.js``: dumb wrapper to provide assertions;
    - ``./modules/stack.js``: on the UI, we can have a stack of decomposed
    words, allowing to switch back and forth between different words: this module
    implements that stack;
    - ``./modules/log.js``: for now just a dumb debugging wrapper;
    - ``./modules/main.js``: bootstrap the creation of the UI;
    - ``./modules/enums.js``: automatically generated enums from typescript data;
    - ``./modules/classes.js``: names corresponding to CSS classes;
    - ``./modules/config.js``: automatically generated; allows to set a deployment
    version (for (broken btw) caching) and the HTTP path root of the deployment
    (e.g. GET /$x vs. GET /zm/$x)

  - ``./mkabout.js``: builds the ``about.html`` page (the goal is to use
    the DB to properly reference and credits all data sources);
  - ``./mkshuowen.js``: builds a markdown version of the Shuowen
  - ``./mksite.js``: ad-hoc static site builder (~temporary);
  - ``./check-data.js``: ensure that the data files can be loaded successfully.
  - ``./mktestsjs.sh``: builds ``tests.js``;
  - ``./tests/*``: all our tests; ``tests/$x.js`` contains the tests
  for the module ``./modules/$x.js``. Tests are automatically ran on import
  of a test file.


# Code conventions
We're using a subset of JavaScript (e.g. no OO features, exceptional
use of exceptions only), with typescript jsdoc annotions. We limit
external dependencies to the strict minimum.

This is one way to counter-balance the great inertia and lack of
maturity of the frontend ecosystem.

## Modules
For now, we're using ESM modules syntax over CommonJS. I
used to have a ``cpp(1)``-based mechanism, which wasn't perfect,
but the current solutions is annoying (see './TODO.md:/^##.*@better-modules').

Always import modules as such

```
	import * as Module    from './modules/module.js'
	import * as TheModule from './modules/themodule.js'
	import * as FooModule from './modules/foo/module.js'
```

XXX we're not doing this for ``modules/data/*/*`` atm; see for
example ``modules/data.js``.

All modules are stored under modules/ as .js files but the
tests.

## Tests
Tests are special modules, stored in tests/. They should
only be imported by tests.js

All tests must be performed through the utilities provided
by modules/tests.js (Tests.run()). Each test files is expected
to export a ``tests`` array, containing all the tests to be
run.

## Functions over OOP
Avoid class-based OOP as much as possible.

Avoid using `this` as much as possible. This can sometimes
be confusing, especially when *not* using JS's OOP syntactic
sugar.

As a rule, use functions as the main abstraction building
block. Those are easily tested, cf. '`./modules/tests.js:/^function run1\(``

## Exceptions
Exceptions should only be used for assertions, cf. ``./modules/assert.js``,
or temporary, for development purposes.

IIRC, [until about a year ago][gh-ts-exceptions], they weren't
supported by TypeScript. They also make the code harder to read
(aka, non-local; an exception *is* a non-local goto).

## ``var``, ``let``, ``const``
For now at least, avoid ``const`` and ``let``.

This is mostly out of personnal habit for `let`; main goal is to
have uniform variable declaration syntax. The switch to ``let`` will
be done later.

``const`` on the other hand tends not only to get viral, but also to
get annoying when the const needs to be punctually tweaked, e.g. during
dev.

Typescript should soon support a @const jsdoc tag anyway.

## Typing
Provide typescript static typing info through jsdoc comments;
shared data structures are defined in ``lib.d.ts``; enumerations from
lib.d.ts are compiled (cf. Makefile) to ``./modules/enums.js``.

## Naming
Function name is all lowercase. Module names are CamelCase.
Keep name short, generally proportional to scope/frequency usage.

# History
The project has evolved from a few prototypes, discarded to various
degrees.

The first prototype ("cknife") was a browser extension: on selection,
it would display what is now a decomposition grid. A reading mode was
implemented, allowing to navigate through Chinese text on the current
page. Word overlapping wasn't managed in that reading mode.

While overall useful, the interface was clumsy when it came to reading
a book. This browser extension was slowly given up. Some of this
legacy code has been included in the ``ext/`` directory. There are plans
to revive it in the future, see ``./TODO.md:/##.*@extensio``

The second prototype was about keeping that extension, and sharing
JS code with a small website providing a clean reading mode, with full
control over the UI (a primitive form of what is now mostly
``./modules/view/trbook.js``).

Sharing code between the site and the extension forced some weird structural
choices, e.g. we needed a cut()-like function wrapping access to the
dictionary/decomposition table ("xcut") that was asynchronous for the
extension.

The third prototype was about implemented the random word exploration
feature that was implemented in the extension, but from the website
(the feature is now included in ``./modules/view/index.js``).

This prototype also saw some primitive developments for allowing
multiple decomposition components on a single page, which was a step
toward multidict with Chinese dictionaries.

The code is now useful, reasonably well tested (manually &
automatically), most of it can be considered stable. We have
a solid base on which to build.

The fourth prototype, the current implementation, was about cleaning
the code for publishing:

  - no more cpp(1) hacks to share code: using proper ES6 modules;
  - tsc(1) annotations everywhere possible;
  - improved documentation, testing.

We've also implemented major features:

  - multiple dictionaries, including the ability to use/navigate
  Chinese dictionaries
  - multiple decomposition tables

And e.g. prepared the codebase for upcoming features

  - './TODO.md:/^##.*@flexible-view'
  - './TODO.md:/^##.*@backend' : proper user login/logout, database, etc.

[zhongmu]: https://zhongmu.eu/
[tales-on-chinese]: https://tales.mbivert.com/on-chinese-language/
[gh-ts-exceptions]: https://github.com/microsoft/TypeScript/issues/13219
