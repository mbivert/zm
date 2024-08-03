CREATE TABLE User (
	...
)

CREATE TABLE Group (
	...
)

CREATE TABLE Author (
)

CREATE TABLE Translator (
)

CREATE TABLE Book (
	id
	name
)

CREATE TABLE Translation (
	id
	name
)

CREATE TABLE Comment (
	id
	name
//	author
	file // path to local comment file
)

CREATE TABLE BooksTranslation (
	idb
	idt
)

CREATE TABLE BooksComment (
	idb
	idc
)

CREATE TABLE Data (
	id
	type (dict, decomp, big5)
	name string
	descr string/blob
	fmt string/enum
	fmtparams blob/string (JSON)
	file // path to local, compressed file
	url_info
	url_fetch
)

CREATE TABLE URL (
	id
	value
	type (info, fetch)

)

CREATE TABLE License (
	id
	name
	comment
	url/urlid
)

-- getbook() : retrieve a hash with all book informations, joining tables
-- where needed, optional translations/comments.

	-> how do we handle comments edition? public/private comments?
	-> do we allow multiple comments files/translations at once with
	   user-specified rotation + bookmark of current value?
