package main

/*
 * NOTE: tests for db-user.go can be found in ../auth/db-sqlite_test.go;
 * we're here, for now, focusing on testing data access.
 *
 * NOTE: Regarding errors, in particular broken FOREIGN KEYS constraint,
 * we can't build a sqlite3.Error correctly here, because its err field
 * is unexported.
 *
 * NOTE: we're, for now, using schema*.sql as test data. It's a bit clumsy
 * as there's already lots of data there, so perhaps we should work on
 * a subset. In particular, data reloading is a bit slow already, and "must"
 * be performed for each Test*(). Perhaps copying a .sqlite file would be
 * faster than running the SQL.
 */

import (
	"testing"
	"time"
	"os"
	"fmt"
	"log"
	"errors"
	"database/sql"
	"github.com/mbivert/auth"
	"github.com/mbivert/ftests"
)

var db *DB
var now int64

// Tests below rely heavily on what's in schema.sql; the
// goal of those variables is to clarify what we use, and
// to make the tests more resilient to potential changes
// (though we may also keep the current schema.sql for
// tests regardless).
var zmId = auth.UserId(1)
var mbId = auth.UserId(2)
var ccCEDictPath = "data/dict/cc-cedict.csv.gz"
var cc0Id = int64(1) // CC0 1.0 license (~public domain)

// Individual tests rely on a ~fresh DB; `init()` cannot be
// called directly.
func initTestDB() {
	dbfn := "./db-test.sqlite"
	err := os.RemoveAll(dbfn) // won't complain if dbfn doesn't exist
	if err != nil {
		log.Fatal(err)
	}

	// multiStatements=true required for the rough
	// SQL injection performed by loadTestSQL()
	db, err = NewDB(dbfn+"?multiStatements=true")
	if err != nil {
		log.Fatal(err)
	}

	if err := loadTestSQL("schema.sql"); err != nil {
		log.Fatal(err)
	}

	if err := loadTestSQL("schema-user-dev.sql"); err != nil {
		log.Fatal(err)
	}

	if err := loadTestSQL("schema-values.sql"); err != nil {
		log.Fatal(err)
	}

	now = time.Now().Unix()
}

// Bare SQL injections
func loadTestSQL(path string) error {
	x, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	_, err = db.Exec(string(x))
	return err
}

// For tests purposes only
func (db *DB) hasDataWithName(name string) (bool, error) {
	db.Lock()
	defer db.Unlock()

	did := -1

	err := db.QueryRow(`
		SELECT Id FROM Data WHERE name = $1
	`, name).Scan(&did)

	// Should never happen in normal circumstances
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	} else if err != nil {
		return false, err
	}
	return true, nil
}

// This is to test AddData, which eats a DataSetIn: the
// fields we want to tests are essentially there too.
func (db *DB) getDataByNameUid(name string, uid auth.UserId) (*DataSetIn, error) {
	db.Lock()
	defer db.Unlock()

	var x DataSetIn

	err := db.QueryRow(`
		SELECT
			Data.Name, Data.UserId, Data.Type, Data.Descr, Data.File,
			Data.Fmt, Data.UrlInfo, Permission.Public, License.Id
		FROM
			Data, License, DataLicense, Permission
		WHERE
			DataLicense.DataId    = Data.Id
		AND DataLicense.LicenseId = License.Id
		AND Permission.DataId     = Data.Id
		AND Data.Name             = $1
		AND Data.UserId           = $2
	`, name, uid).Scan(
		&x.Name, &x.UserId, &x.Type, &x.Descr, &x.File,
		&x.Fmt,  &x.UrlInfo, &x.Public, &x.LicenseId,
	)

	if err != nil {
		return nil, err
	}
	return &x, nil
}

func (db *DB) deleteAllBooks() error {
	_, err := db.Exec("DELETE FROM Data WHERE Type = 'book'")
	return err
}

func (db *DB) deleteAllData() error {
	_, err := db.Exec("DELETE FROM Data")
	return err
}

func (db *DB) deleteAllLicenses() error {
	_, err := db.Exec("DELETE FROM License")
	return err
}

func TestCanGet(t *testing.T) {
	initTestDB()

	path := "private/data/path"

	x := DataSetIn{
		Token     : "x",
		Name      : "foo",
		Type      : "book",
		Descr     : "foo",
		Fmt       : "markdown",
		Public    : false,
		LicenseId : 1,
		UrlInfo   : "x",
		Content   : "foo",
		File      : path,
		UserId    : zmId,
		Id        : -1,
	}

	// TODO: test the path starting with a / or not, to be done
	// while testing data.go.
	ftests.Run(t, []ftests.Test{
		{
			"Public files available to read for zm",
			db.CanGet,
			[]any{zmId, ccCEDictPath},
			[]any{true, nil},
		},
		{
			"Can't get inexistant paths",
			db.CanGet,
			[]any{zmId, "nowhere/to/be/found"},
			[]any{false, fmt.Errorf("No DB entry with given path: 'nowhere/to/be/found'")},
		},
		{
			"Add some private data",
			db.AddData,
			[]any{&x},
			[]any{nil},
		},
		{
			"Can't get private paths for mb",
			db.CanGet,
			[]any{mbId, path},
			[]any{false, nil},
		},
		{
			"Can get private paths for zm",
			db.CanGet,
			[]any{zmId, path},
			[]any{true, nil},
		},
	})
}

func TestAddData(t *testing.T) {
	initTestDB()

	path := "private/data/path"

	name := "superbuniquename"

	mkd := func(uid auth.UserId, lid int64, pub bool) *DataSetIn {
		return &DataSetIn{
			Token     : "x",
			Name      : name,
			Type      : "book",
			Descr     : "foo",
			Fmt       : "markdown",
			Public    : pub,
			LicenseId : lid,
			UrlInfo   : "x",
			Content   : "foo",
			File      : path,
			UserId    : uid,
			Id        : -1,
		}
	}

	// TODO: test the path starting with a / or not, to be done
	// while testing data.go.
	ftests.Run(t, []ftests.Test{
		{
			"Foreign key constraint broke on unknown uid",
			db.AddData,
			[]any{mkd(89, 1, false)},
			[]any{fmt.Errorf("Unknown UserId")},
		},
		{
			"Foreign key constraint broke on unknown license id",
			db.AddData,
			[]any{mkd(zmId, 1000, false)},
			[]any{fmt.Errorf("Unknown LicenseId")},
		},
		{
			"No dangling data from previous failure",
			db.hasDataWithName,
			[]any{name},
			[]any{false, nil},
		},
		{
			"Random data with okay foreign keys",
			db.AddData,
			[]any{mkd(zmId, cc0Id, true)},
			[]any{nil},
		},
		{
			"Data seems to have been registered in Data",
			db.hasDataWithName,
			[]any{name},
			[]any{true, nil},
		},
		{
			"Data correctly added",
			db.getDataByNameUid,
			[]any{name, zmId},
			[]any{&DataSetIn{
				Token     : "", // not set
				Name      : name,
				Type      : "book",
				Descr     : "foo",
				Fmt       : "markdown",
				Public    : true,
				LicenseId : cc0Id,
				UrlInfo   : "x",
				Content   : "", // not set
				File      : path,
				UserId    : zmId,
				Id        : 0, // not set
			}, nil },
		},
		{
			"Same Data name for different users",
			db.AddData,
			[]any{mkd(mbId, cc0Id, false)},
			[]any{nil},
		},
		{
			"Data correctly added (bis)",
			db.getDataByNameUid,
			[]any{name, mbId},
			[]any{&DataSetIn{
				Token     : "", // not set
				Name      : name,
				Type      : "book",
				Descr     : "foo",
				Fmt       : "markdown",
				Public    : false,
				LicenseId : cc0Id,
				UrlInfo   : "x",
				Content   : "", // not set
				File      : path,
				UserId    : mbId,
				Id        : 0, // not set
			}, nil },
		},
	})
}

// Edit x/^		{\n/+,/^		},?\n/- | qcol -k -n
func mkDefaultBooks(pub bool) []Book {
	return []Book {
		{
			Name:    "Shuowen Jiezi, book (Wikisource)",
			Descr:   "WikiSource version of the ShuoWen JieZi",
			File:    "data/books/shuo-wen-jie-zi.src",
			UrlInfo: "https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97",
			Owned:   pub,
		},
		{
			Name:    "Bai Jia Xing",
			Descr:   "Bai Xia Jing",
			File:    "data/books/bai-jia-xing.src",
			UrlInfo: "https://www.gutenberg.org/files/25196/25196-0.txt",
			Owned:   pub,
		},
		{
			Name:    "Qian Zi Wen",
			Descr:   "Qian Zi Wen",
			File:    "data/books/qian-zi-wen.src",
			UrlInfo: "https://zh.wikisource.org/wiki/%E5%8D%83%E5%AD%97%E6%96%87",
			Owned:   pub,
		},
		{
			Name:    "三字經 (Three Character Classic)",
			Descr:   "Three Character Classic, original",
			File:    "data/books/san-zi-jing.src",
			UrlInfo: "https://ctext.org/three-character-classic",
			Owned:   pub,
		},
		{
			Name:    "Art of war (partial)",
			Descr:   "Sun-Tzu s Art of war",
			File:    "data/books/art-of-war.src",
			UrlInfo: "https://ctext.org/art-of-war/",
			Owned:   pub,
		},
		{
			Name:    "Three Character Classic (translation)",
			Descr:   "Three Character Classic translated by Herbert Giles",
			File:    "data/books/san-zi-jing.tr",
			UrlInfo: "https://ctext.org/three-character-classic",
			Owned:   pub,
		},
		{
			Name:    "Art of war (translation)",
			Descr:   "Sun-Tzu s Art of war",
			File:    "data/books/art-of-war.tr",
			UrlInfo: "https://ctext.org/art-of-war/",
			Owned:   pub,
		},
		{
			Name:    "Le Classique des Trois Caractères",
			Descr:   "Le Classique des Trois Caractères, traduit par Deverge",
			File:    "data/books/san-zi-jing-fr.tr",
			UrlInfo: "http://wengu.tartarie.com/wg/wengu.php?l=Sanzijing\u0026s=1\u0026lang=fr",
			Owned:   pub,
		},
		{
			Name:    "Father Serge, Tolstoï (Отец Сергий, Толстой) (partial)",
			Descr:   "First few paragraphs from Tolstoï s Father Serge, in Russian",
			File:    "data/books/father-serge-tolstoi.src",
			UrlInfo: "https://en.wikisource.org/wiki/Father_Sergius",
			Owned:   pub,
		},
	}
}

func TestGetBooks(t *testing.T) {
	initTestDB()

	path := "private/data/path"

	name := "superbuniquename"

	mkd := func(uid auth.UserId, lid int64, pub bool) *DataSetIn {
		return &DataSetIn{
			Token     : "x",
			Name      : name,
			Type      : "book",
			Descr     : "foo",
			Fmt       : "markdown",
			Public    : pub,
			LicenseId : lid,
			UrlInfo   : "x",
			Content   : "foo",
			File      : path,
			UserId    : uid,
			Id        : -1,
		}
	}

	book := mkd(zmId, cc0Id, false)
	book1 := mkd(mbId, cc0Id, true)

	ftests.Run(t, []ftests.Test{
		{
			"Default books",
			db.GetBooks,
			[]any{zmId},
			[]any{mkDefaultBooks(true), nil},
		},
		{
			"Add a private book",
			db.AddData,
			[]any{book},
			[]any{nil},
		},
	})

	books := append(mkDefaultBooks(true), Book{
		Name:    book.Name,
		Descr:   book.Descr,
		File:    book.File,
		UrlInfo: book.UrlInfo,
		Owned:   true,
	})

	ftests.Run(t, []ftests.Test{
		{
			"Default books + one privately owned",
			db.GetBooks,
			[]any{zmId},
			[]any{books, nil},
		},
		{
			"Default books + one privately not owned",
			db.GetBooks,
			[]any{mbId},
			[]any{mkDefaultBooks(false), nil},
		},
		{
			"Add a private book",
			db.AddData,
			[]any{book1},
			[]any{nil},
		},
	})

	books1 := append(books, Book{
		Name:    book1.Name,
		Descr:   book1.Descr,
		File:    book1.File,
		UrlInfo: book1.UrlInfo,
		Owned:   false,
	})

	ftests.Run(t, []ftests.Test{
		{
			"Default books + one privately owned + a public one",
			db.GetBooks,
			[]any{zmId},
			[]any{books1, nil},
		},
		{
			"Removing all books",
			db.deleteAllBooks,
			[]any{},
			[]any{nil},
		},
		{
			"No books is not an error",
			db.GetBooks,
			[]any{zmId},
			[]any{[]Book{}, nil},
		},
	})
}

// Edit x/^	{\n/+,/^	},?\n/- | qcol -k -n
var allAbouts = []About{
	{
		Type:       "dict",
		Name:       "CC-CEDICT",
		UrlInfo:    "https://cc-cedict.org/wiki/",
		License:    "CC BY-SA 4.0",
		UrlLicense: "https://creativecommons.org/licenses/by-sa/4.0/",
	},
	{
		Type:       "dict",
		Name:       "ZM-add",
		UrlInfo:    "https://zhongmu.eu/",
		License:    "CC BY-SA 4.0",
		UrlLicense: "https://creativecommons.org/licenses/by-sa/4.0/",
	},
	{
		Type:       "dict",
		Name:       "CC-CEDICT-singles",
		UrlInfo:    "https://zhongmu.eu/",
		License:    "CC BY-SA 4.0",
		UrlLicense: "https://creativecommons.org/licenses/by-sa/4.0/",
	},
	{
		Type:       "decomp",
		Name:       "CHISE-ids",
		UrlInfo:    "http://chise.org",
		License:    "GPLv2",
		UrlLicense: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html",
	},
	{
		Type:       "dict",
		Name:       "ZM-pict",
		UrlInfo:    "https://zhongmu.eu/",
		License:    "CC BY-SA 4.0",
		UrlLicense: "https://creativecommons.org/licenses/by-sa/4.0/",
	},
	{
		Type:       "decomp",
		Name:       "WM-decomp",
		UrlInfo:    "https://commons.wikimedia.org/wiki/Commons:Chinese_characters_decomposition",
		License:    "CC BY-SA 3.0",
		UrlLicense: "https://creativecommons.org/licenses/by-sa/3.0/",
	},
	{
		Type:       "big5",
		Name:       "Unicode-BIG5",
		UrlInfo:    "https://unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/OTHER/BIG5.TXT",
		License:    "Unicode ToS",
		UrlLicense: "https://www.unicode.org/copyright.html",
	},
	{
		Type:       "book",
		Name:       "Shuowen Jiezi, book (Wikisource)",
		UrlInfo:    "https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97",
		License:    "CC0 1.0",
		UrlLicense: "https://creativecommons.org/publicdomain/zero/1.0/",
	},
	{
		Type:       "dict",
		Name:       "WS-shuowen",
		UrlInfo:    "https://en.wikisource.org/wiki/zh:%E8%AA%AA%E6%96%87%E8%A7%A3%E5%AD%97",
		License:    "CC0 1.0",
		UrlLicense: "https://creativecommons.org/publicdomain/zero/1.0/",
	},
	{
		Type:       "dict",
		Name:       "CFDICT",
		UrlInfo:    "https://chine.in/mandarin/dictionnaire/CFDICT/",
		License:    "CC BY-SA 4.0",
		UrlLicense: "https://creativecommons.org/licenses/by-sa/4.0/",
	},
	{
		Type:       "dict",
		Name:       "HanDeDict",
		UrlInfo:    "https://handedict.zydeo.net/",
		License:    "CC BY-SA 2.0",
		UrlLicense: "https://creativecommons.org/licenses/by-sa/2.0/",
	},
	{
		Type:       "book",
		Name:       "Bai Jia Xing",
		UrlInfo:    "https://www.gutenberg.org/files/25196/25196-0.txt",
		License:    "Gutenberg license",
		UrlLicense: "http://gutenberg.org/license",
	},
	{
		Type:       "book",
		Name:       "Qian Zi Wen",
		UrlInfo:    "https://zh.wikisource.org/wiki/%E5%8D%83%E5%AD%97%E6%96%87",
		License:    "CC0 1.0",
		UrlLicense: "https://creativecommons.org/publicdomain/zero/1.0/",
	},
	{
		Type:       "book",
		Name:       "三字經 (Three Character Classic)",
		UrlInfo:    "https://ctext.org/three-character-classic",
		License:    "CC0 1.0",
		UrlLicense: "https://creativecommons.org/publicdomain/zero/1.0/",
	},
	{
		Type:       "dict",
		Name:       "OpenRussian",
		UrlInfo:    "https://en.openrussian.org/",
		License:    "CC BY-SA 4.0",
		UrlLicense: "https://creativecommons.org/licenses/by-sa/4.0/",
	},
	{
		Type:       "decomp",
		Name:       "ZM-decomp",
		UrlInfo:    "https://zhongmu.eu/",
		License:    "CC BY-SA 3.0",
		UrlLicense: "https://creativecommons.org/licenses/by-sa/3.0/",
	},
	{
		Type:       "dict",
		Name:       "CFDICT-singles",
		UrlInfo:    "https://zhongmu.eu/",
		License:    "CC BY-SA 4.0",
		UrlLicense: "https://creativecommons.org/licenses/by-sa/4.0/",
	},
	{
		Type:       "dict",
		Name:       "HanDeDict-singles",
		UrlInfo:    "https://zhongmu.eu/",
		License:    "CC BY-SA 2.0",
		UrlLicense: "https://creativecommons.org/licenses/by-sa/2.0/",
	},
	{
		Type:       "book",
		Name:       "Art of war (partial)",
		UrlInfo:    "https://ctext.org/art-of-war/",
		License:    "CC0 1.0",
		UrlLicense: "https://creativecommons.org/publicdomain/zero/1.0/",
	},
	{
		Type:       "book",
		Name:       "Three Character Classic (translation)",
		UrlInfo:    "https://ctext.org/three-character-classic",
		License:    "CC0 1.0",
		UrlLicense: "https://creativecommons.org/publicdomain/zero/1.0/",
	},
	{
		Type:       "pieces",
		Name:       "Three Character Classic (pieces)",
		UrlInfo:    "https://ctext.org/three-character-classic",
		License:    "CC0 1.0",
		UrlLicense: "https://creativecommons.org/publicdomain/zero/1.0/",
	},
	{
		Type:       "book",
		Name:       "Art of war (translation)",
		UrlInfo:    "https://ctext.org/art-of-war/",
		License:    "CC0 1.0",
		UrlLicense: "https://creativecommons.org/publicdomain/zero/1.0/",
	},
	{
		Type:       "pieces",
		Name:       "Art of war (pieces)",
		UrlInfo:    "https://ctext.org/art-of-war/",
		License:    "CC0 1.0",
		UrlLicense: "https://creativecommons.org/publicdomain/zero/1.0/",
	},
	{
		Type:       "book",
		Name:       "Le Classique des Trois Caractères",
		UrlInfo:    "http://wengu.tartarie.com/wg/wengu.php?l=Sanzijing\u0026s=1\u0026lang=fr",
		License:    "CC0 1.0",
		UrlLicense: "https://creativecommons.org/publicdomain/zero/1.0/",
	},
	{
		Type:       "pieces",
		Name:       "Le Classique des Trois Caractères (pieces)",
		UrlInfo:    "http://wengu.tartarie.com/wg/wengu.php?l=Sanzijing\u0026s=1\u0026lang=fr",
		License:    "CC0 1.0",
		UrlLicense: "https://creativecommons.org/publicdomain/zero/1.0/",
	},
	{
		Type:       "book",
		Name:       "Father Serge, Tolstoï (Отец Сергий, Толстой) (partial)",
		UrlInfo:    "https://en.wikisource.org/wiki/Father_Sergius",
		License:    "CC0 1.0",
		UrlLicense: "https://creativecommons.org/publicdomain/zero/1.0/",
	},
}

func TestGetAbouts(t *testing.T) {
	initTestDB()

	ftests.Run(t, []ftests.Test{
		{
			"Default data",
			db.GetAbouts,
			[]any{zmId},
			[]any{allAbouts, nil},
		},
		{
			"Removing all data",
			db.deleteAllData,
			[]any{},
			[]any{nil},
		},
		{
			"No data is not an error",
			db.GetAbouts,
			[]any{zmId},
			[]any{[]About{}, nil},
		},
	})
}

func TestGetMetas(t *testing.T) {
	initTestDB()

	path := "private/data/path"

	name := "superbuniquename"

	mkd := func(uid auth.UserId, lid int64, pub bool) *DataSetIn {
		return &DataSetIn{
			Token     : "x",
			Name      : name,
			Type      : "book",
			Descr     : "foo",
			Fmt       : "markdown",
			Public    : pub,
			LicenseId : lid,
			UrlInfo   : "x",
			Content   : "foo",
			File      : path,
			UserId    : uid,
			Id        : -1,
		}
	}

	book := mkd(zmId, cc0Id, false)

	ftests.Run(t, []ftests.Test{
		{
			"Try to fetch metas for nothing",
			db.GetMetas,
			[]any{zmId, []string{}},
			[]any{[]Metas{}, nil},
		},
		{
			"Metas for a single public (and owned) book",
			db.GetMetas,
			[]any{zmId, []string{"Shuowen Jiezi, book (Wikisource)"}},
			[]any{[]Metas{
				{
					Type: "book",
					Name: "Shuowen Jiezi, book (Wikisource)",
					Fmt:  "markdown",
					File: "data/books/shuo-wen-jie-zi.src",
				},
			}, nil},
		},
		{
			"Metas for a single public (not owned) book",
			db.GetMetas,
			[]any{mbId, []string{"Shuowen Jiezi, book (Wikisource)"}},
			[]any{[]Metas{
				{
					Type: "book",
					Name: "Shuowen Jiezi, book (Wikisource)",
					Fmt:  "markdown",
					File: "data/books/shuo-wen-jie-zi.src",
				},
			}, nil},
		},
		{
			"Metas for a single public book, anonymous access",
			db.GetMetas,
			[]any{auth.UserId(-1), []string{"Shuowen Jiezi, book (Wikisource)"}},
			[]any{[]Metas{
				{
					Type: "book",
					Name: "Shuowen Jiezi, book (Wikisource)",
					Fmt:  "markdown",
					File: "data/books/shuo-wen-jie-zi.src",
				},
			}, nil},
		},
		{
			"Add a private book",
			db.AddData,
			[]any{book},
			[]any{nil},
		},
		{
			"Private, owned book is available",
			db.GetMetas,
			[]any{zmId, []string{name}},
			[]any{[]Metas{
				{
					Type: "book",
					Name: name,
					Fmt:  "markdown",
					File: path,
				},
			}, nil},
		},
		{
			"Private, not owned book is unavailable",
			db.GetMetas,
			[]any{mbId, []string{name}},
			[]any{[]Metas{}, nil},
		},
		{
			"Private book unavailable via anonymous access",
			db.GetMetas,
			[]any{auth.UserId(-1), []string{name}},
			[]any{[]Metas{}, nil},
		},
		{
			"Querying multiple books",
			db.GetMetas,
			[]any{zmId, []string{name, "Shuowen Jiezi, book (Wikisource)"}},
			[]any{[]Metas{
				{
					Type: "book",
					Name: "Shuowen Jiezi, book (Wikisource)",
					Fmt:  "markdown",
					File: "data/books/shuo-wen-jie-zi.src",
				},
				{
					Type: "book",
					Name: name,
					Fmt:  "markdown",
					File: path,
				},
			}, nil},
		},
		{
			"Removing all data",
			db.deleteAllData,
			[]any{},
			[]any{nil},
		},
		{
			"No data is not an error",
			db.GetMetas,
			[]any{zmId, []string{}},
			[]any{[]Metas{}, nil},
		},
	})
}

// Edit x/^	{\n/+,/^	},?\n/- | qcol -k -n
var defaultLicenses = []License{
	{
		Id:   1,
		Name: "CC0 1.0",
	},
	{
		Id:   2,
		Name: "CC BY-SA 3.0",
	},
	{
		Id:   3,
		Name: "CC BY-SA 4.0",
	},
	{
		Id:   4,
		Name: "Unicode ToS",
	},
	{
		Id:   5,
		Name: "GPLv2",
	},
	{
		Id:   6,
		Name: "CC BY-SA 2.0",
	},
	{
		Id:   7,
		Name: "CC BY-NC-SA 3.0",
	},
	{
		Id:   8,
		Name: "Unlicense",
	},
	{
		Id:   9,
		Name: "Gutenberg license",
	},
}

func TestGetLicenses(t *testing.T) {

	ftests.Run(t, []ftests.Test{
		{
			"Removing all licenses",
			db.deleteAllLicenses,
			[]any{},
			[]any{nil},
		},
		{
			"No licenses is not an error",
			db.GetLicenses,
			[]any{},
			[]any{[]License{}, nil},
		},
	})
}