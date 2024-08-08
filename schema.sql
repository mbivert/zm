-- NOTE: 2023-03-15: sqlite3 stopped reading this file because
-- of double-quoted strings (see Data table, "CHECK (Type IN (...")
--
-- I've switched to single quotes everywhere, but haven't bothered
-- fixing the possessive s (e.g. Sun Tzu's Art of War)
--
-----------------------------------------------------------------------------
--
-- This is a preemptive attempt to normalize our data management.
-- For now, this is converted to JSON through SQLite, and injected
-- to JavaScript; later on, a similar operation is expected to be performed
-- through an AJAX calls.
--
-- The goal here is to draft data-related upcoming features, and
-- to start sketching our SQL database format.
--
-- We're currently only using a subset from those data, enough
-- to implement a multidict/multidecomp cut mechanism; what remains can
-- be considered unstable. As such, data usage is properly wrapped
-- in JavaScript code to avoid polluting the code too far.
--
-- Later features will include:
--	- [prepared] automatic external ressource update (see ./update-data.go)
--	- [prepared] automatic data formatting (see ./update-data.go)
--	- [prepared] data metadata (license, URLs, description, etc.) web
--	  display
--	- data versioning
--		- This is a bit tricky, but should become handy, especially
--		  considering our the patches-chain feature. We'll likely need an
--		  extra table to store all versions of a Resource, separating
--		  versions per date (YYYYMMDDHHMMSS).
--		- See also ./update-data.go
--	- We intend to prototype the thing with SQLite, and eventually move to
--	  PostgreSQL once the design is stable, so as not to have to worry about
--	  PostgreSQL settings for now.
-----------------------------------------------------------------------------

-- By default, the FOREIGN KEY constraints aren't enforced.
-- but we really don't want to have weird data in the DB.
-- https://stackoverflow.com/a/56369632
PRAGMA foreign_keys = ON;

-- NOTE: this is exactly auth's User table, and we'll depend on this for now.
CREATE TABLE User (
	Id                      INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	Name        TEXT        UNIQUE,
	Email       TEXT        UNIQUE,
	Passwd      TEXT,
	Verified    INTEGER,
	CDate       INTEGER
);

-- External ressources for which we keep a local copy of the raw,
-- unformatted data.
--
-- The same unformatted data can be formatted in multiple ways,
-- e.g. wikisource's 說文解字 gets transformed in a cc-cedict formatted
-- dictionary and as a markdown book.
--
-- NOTE: it seems that Resource will only be used for "internal"
-- data, managed by us, with automatic updates & cie. This will
-- likely need to be systematically managed and supervised, so
-- if users need it, they'll ask to have for it to be managed.
--
-- Otherwise, they'll "only" be able to add regular Data.
--
-- (we already have some Data without a Resource: hand-fetched,
-- essentially immutable stuff, see DataResource)
CREATE TABLE Resource (
	Id        INTEGER   PRIMARY KEY AUTOINCREMENT NOT NULL,

	Name      TEXT      UNIQUE NOT NULL,

	-- URL of file or similar
	UrlFetch  TEXT,

	-- Optional field referencing a command to be executed
	-- to update file's content from remote location.
	Fetcher   TEXT,

	-- Path to local version of the file; enforce
	-- uniqueness for safety.
	File      TEXT      UNIQUE NOT NULL
);

-- Available data files.
CREATE TABLE Data (
	Id        INTEGER   PRIMARY KEY AUTOINCREMENT NOT NULL,

	-- Acts as a textual ID in JavaScript code, for clarity to users.
	-- The Name is unique for each UserId (constrained later)
	Name      TEXT      NOT NULL,

	-- Owner
	UserId    BIGSERIAL,

	Type      TEXT CHECK(Type IN (
		-- Dictionaries
		'dict',

		-- Decomposition tables
		'decomp',

		-- UTF8 / BIG5 correspondance tables
		'big5',

		-- Book, article, text to be inspected
		'book',

		-- Pieces (to tie a source and a translation)
		-- XXX probably temporary
		'pieces'
	))                  NOT NULL,

	Descr     TEXT,

	-- Path to formatted Resource.File
	File       TEXT,

	-- Command used to create .File from Resource.File
	Formatter   TEXT,

	-- .File's format, that is, what .Formatter is supposed
	-- to have created.
	Fmt       TEXT CHECK(Fmt IN (
		-- CC-CEDICT "extended" (+basic patching abilities)
		'cc-cedict',

		-- Wikimedia "extended" (+basic patching abilities)
		'wm-decomp',

		-- CHISE project IDs format
		'chise',

		-- Same format as unicode.org's table
		'unicode-big5',

		-- Pseudo-markdown formatted book.
		'markdown',

		-- XXX to be removed
		'sw-markdown',

		-- Basic "word\tdefinitions" format; perhaps temporary
		'simple-dict',

		-- Only one type of pieces for now
		'pieces'
	))                  NOT NULL,

	-- The code that loads a file from its .Fmt sometimes needs
	-- additional parameters (e.g. EOL). Typically a small JSON blob.
	--
	-- Note that we could have used .Formatter to avoid such peculiarities
	-- and normalize the formats. We may do so in the future.
	--
	-- XXX Should be called FormatterFmt to avoid confusion?
	FmtParams TEXT,

	-- URL of the project if any
	UrlInfo  TEXT,

	-- Name is unique for each user (UI will be clearer)
	-- NOTE: perhaps we'd want (UserId, Name) to be our PRIMARY key then.
	CONSTRAINT uniq UNIQUE (UserId, Name),

	CONSTRAINT fk_user    FOREIGN KEY (UserId)
		REFERENCES User(Id)    ON DELETE CASCADE
);

-- For clarity's sake, we want to display licenses of the
-- various external ressources we're using.
CREATE TABLE License (
	Id    INTEGER   PRIMARY KEY AUTOINCREMENT NOT NULL,
	Name  TEXT      UNIQUE NOT NULL,
	Descr TEXT,
	URL   TEXT
);

-- Let's keep it simple for now
CREATE TABLE Permission (
	DataId          BIGSERIAL,

	Public INTEGER, -- 0 : private; 1 : public

	CONSTRAINT fk_data    FOREIGN KEY (DataId)
		REFERENCES Data(Id)    ON DELETE CASCADE
);

-- Join table between Data & License
CREATE TABLE DataLicense (
	DataId     BIGSERIAL,
	LicenseId  BIGSERIAL,

	-- URL where to check for license
	URL        TEXT,

	-- Comment on license assignment.
	Comment   TEXT,

	CONSTRAINT fk_data    FOREIGN KEY (DataId)
		REFERENCES Data(Id)    ON DELETE CASCADE,
	CONSTRAINT fk_license FOREIGN KEY (LicenseId)
		REFERENCES License(Id) ON DELETE CASCADE
);

-- Join table between Data & Resource
CREATE TABLE DataResource (
	DataId     BIGSERIAL,
	ResourceId BIGSERIAL,

	CONSTRAINT fk_data    FOREIGN KEY (DataId)
		REFERENCES Data(Id)    ON DELETE CASCADE,
	CONSTRAINT fk_ressource FOREIGN KEY (ResourceId)
		REFERENCES Resource(Id) ON DELETE CASCADE
);
