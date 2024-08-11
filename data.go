package main

/*
 * Manage all "/data/" related routes.
 * This is mostly a wrapper above the corresponding
 * database functions (db-data.go)
 */

import (
	"fmt"
	"github.com/mbivert/auth"
	"os"
	"net/http"
	"path/filepath"
)

// Simple wrapper to guard the access to dir (global)
func writeDataFile(fn, content string) error {
	fpath := filepath.Join(dir, fn)
	return writeFile(fpath, []byte(content))
}


// TODO: have per user size limits
func SetData(db *DB, in *SetDataIn, out *SetDataOut) error {
	ok, uid, err := auth.CheckToken(in.Token)
	if err != nil {
		return err
	} else if !ok {
		return fmt.Errorf("Not connected!")
	}

	in.UserId = uid

	// We're trying to update an already existing entry
	if in.Id == -1 {
		in.File = mkRandPath(uid)
		return db.AddData(in)
	}

	return db.UpdateData(in)
}

func DataGetBooks(db *DB, in *DataGetBooksIn, out *DataGetBooksOut) error {
	ok, uid, err := auth.CheckToken(in.Token)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("Not connected!")
	}

	out.Books, err = db.GetBooks(uid)
	return err
}

func DataGetAbout(db *DB, in *DataGetAboutIn, out *DataGetAboutOut) (err error) {
	// TODO: add the configuration to our context as well
	out.Datas, err = db.GetAbouts(C.ZmId)
	return err
}

// NOTE: the meta datas are computed from user preferences: they
// are used to download the files which will be needed for inspection.
// This should work for anonymous users as well; when authenticated, in
// addition to public files, we'll want to also be able to access owned files.
func DataGetMetas(db *DB, in *DataGetMetasIn, out *DataGetMetasOut) (err error) {
	ok, uid, err := auth.CheckToken(in.Token)
	if err != nil {
		return err
	}
	if !ok {
		uid = -1
	}

	out.Metas, err = db.GetMetas(uid, in.Names)
	return err
}

// "Special" request: this is a "GET /data/..." request; it's
// been kept as a GET because we want to involve the browser cache
// For more, see 'DONE.md:/^## medium @data-organisation/'
func GETData(db *DB, root string, w http.ResponseWriter, r *http.Request) {
	var ok bool
	var uid auth.UserId

	tok, err := auth.GetCookie(w, r)
	if err != nil {
		goto Err
	}
	ok, uid, err = auth.CheckToken(tok)
	if err != nil {
		goto Err
	}
	// e.g. token expired
	if !ok {
		uid = -1
	}

	ok, err = db.CanGet(uid, r.URL.Path)
	if !ok {
		err = fmt.Errorf("Access forbidden")
	}
	if err != nil {
		goto Err
	}

	http.ServeFile(w, r, filepath.Join(root, r.URL.Path))
	return

Err:
	fails(w, err)
}

func loadContents(ds []Data) (error) {
	for i, d := range ds {
		// XXX dir is a CLI arg
		xs, err := os.ReadFile(filepath.Join(dir, d.File))
		if err != nil {
			return err
		}

		ds[i].Content = string(xs)
	}
	return nil
}

func GetMyData(db *DB, in *GetMyDataIn, out *GetMyDataOut) (err error) {
	ok, uid, err := auth.CheckToken(in.Token)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("Not connected!")
	}

	out.Datas, err = db.GetDataOf(uid)
	if err != nil {
		return err
	}

	return loadContents(out.Datas)
}

func GetLicenses(db *DB, in *GetLicensesIn, out *GetLicensesOut) (err error) {
	out.Licenses, err = db.GetLicenses()
	return err
}

func initData(db *DB) *http.ServeMux {
	mux := http.NewServeMux()

	// TODO: data edition field
	// TODO: JS typing
	// TODO: add an extra CLI parameter --dev or so, and make it so that
	// the getCaptcha route returns the answer alongside it, so that we
	// can test things in the front.
	mux.HandleFunc(
		"/set/data",
		auth.Wrap[*DB, SetDataIn, SetDataOut](db, SetData),
	)
	mux.HandleFunc(
		"/get/books",
		auth.Wrap[*DB, DataGetBooksIn, DataGetBooksOut](db, DataGetBooks),
	)
	mux.HandleFunc(
		"/get/about",
		auth.Wrap[*DB, DataGetAboutIn, DataGetAboutOut](db, DataGetAbout),
	)

	mux.HandleFunc(
		"/get/metas",
		auth.Wrap[*DB, DataGetMetasIn, DataGetMetasOut](db, DataGetMetas),
	)

	mux.HandleFunc(
		"/get/my/data",
		auth.Wrap[*DB, GetMyDataIn, GetMyDataOut](db, GetMyData),
	)

	mux.HandleFunc(
		"/get/licenses",
		auth.Wrap[*DB, GetLicensesIn, GetLicensesOut](db, GetLicenses),
	)

	mux.HandleFunc("GET /data/",  func(w http.ResponseWriter, r *http.Request) {
		GETData(db, dir, w, r)
	})

	return mux
}
