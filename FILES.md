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

  - ``./bin/``
    - ``./bin/mkabout.js``: builds the ``about.html`` page (the goal is to use
      the DB to properly reference and credits all data sources);
    - ``./bin/mkshuowen.js``: builds a markdown version of the Shuowen
    - ``./bin/mksite.js``: ad-hoc static site builder (~temporary);
    - ``./bin/check-data.js``: ensure that the data files can be loaded successfully.
    - ``./bin/mktestsjs.sh``: builds ``tests.js``;
  - ``./tests/*``: all our tests; ``tests/$x.js`` contains the tests
  for the module ``./modules/$x.js``. Tests are automatically ran on import
  of a test file.
