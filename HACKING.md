# Introduction
The code is still in an early form, and wasn't that intended to be
published yet; some cleanup is underway.

``./FILES.md`` contains among other things a file listing. ``./TODO.md``
contains an exhaustive overview of the roadmap. I've (only) recently
started to dump closed items of ``./TODO.md`` in ``./DONE.md``.

The types are described and heavily documented in ``./lib.d.ts``.
Pay in particular attention to the way dictionaries are typed:

  - It's a central data-structure;
  - The structures have been pre-emptively extended during a
  previous rework so as to encompass upcoming features (e.g. @dict-sources)
  - Its structure is rather complex.

If you want to hack on the UI, you most definitely want to keep
``./lib.d.ts`` around.

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
I had a habit of using ``var`` systematically. I'm
slowly replacing them with ``let``.

``const`` on the other hand tends not only to get viral, but also to
get in the way when the const needs to be punctually tweaked, e.g.
during dev. If you want it to be const, then don't alter it.

## Typing
Provide typescript static typing info through jsdoc comments;
shared data structures are defined in ``lib.d.ts``. This allows
the code to remain bare bone JavaScript.

## Enums
Declared in ``lib.d.ts`` and compiled (cf. Makefile) to ``./modules/enums.js``
via ``./bin/mkenumsjs.sh``. Not only is this clumsy, but we're
losing the typing in the code.

Haven't bothered to look for a better alternative just yet.

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

[gh-ts-exceptions]: https://github.com/microsoft/TypeScript/issues/13219
