CREATE TABLE Users (
	...
)

CREATE TABLE Groups (
	...
)

CREATE TABLE Authors (
)

CREATE TABLE Translators (
)

CREATE TABLE Books (
	id
	name
)

CREATE TABLE Translations (
	id
	name
)

CREATE TABLE Comments (
	id
	name
//	author
	file // path to local comment file
)

CREATE TABLE BooksTranslations (
	idb
	idt
)

CREATE TABLE BooksComments (
	idb
	idc
)

CREATE TABLE Datas (
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

CREATE TABLE URLs (
	id
	value
	type (info, fetch)

)

CREATE TABLE Licenses (
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
