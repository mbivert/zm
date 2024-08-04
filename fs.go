package main

// Probably, to be stored in an external package once we
// have set working, assuming we do.

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"github.com/mbivert/auth"
)

type SomeErr struct {
	Err string `json:"err"`
}

func fails(w http.ResponseWriter, err error) {
	w.WriteHeader(http.StatusBadRequest)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	err2 := json.NewEncoder(w).Encode(&SomeErr{err.Error()})
	if err2 != nil {
		// XXX this will have to do for now
		w.Write([]byte("{ err : \"error while encoding '" +
			err.Error() + "': " + err2.Error() + "\"}"))
	}
}

type FSContext interface {
	Root() string
	IsValidToken(token string) (bool, auth.UserId, error)
	CanGet(uid auth.UserId, path string) (bool, error)
	CanSet(uid auth.UserId, path, data string) (bool, error)
}

func wrap2(
	ctx FSContext,
	f func (FSContext, http.ResponseWriter, *http.Request, auth.UserId) error,
) (func (http.ResponseWriter, *http.Request)) {
	return func(w http.ResponseWriter, r *http.Request) {
		var uid auth.UserId
		var err error
		var ok bool

		ctok, err := r.Cookie("token")

		// if !, should always be ErrNoCookie, but we perhaps should check
		tok := ""
		if err == nil {
			tok = ctok.Value
		}

		// This is a special case: if there's no token, we're dealing
		// with an anonymous user, who can still access public files.
		if tok == "" {
			uid = -1
		} else {
			ok, uid, err = ctx.IsValidToken(tok)
			if err != nil {
				fails(w, err)
				return
			}

			// XXX the cookie has e.g. expired, so consider
			// this a logged-out query, and reset the cookie.
			//
			// This is clumsy, and we'll probably need to do
			// something like this elsewhere, let alone the
			// hardcoded cookie name.
			if !ok {
				// XXX hack: the cookie has e.g. expired
				http.SetCookie(w, &http.Cookie{
					Name:     "token",
					Value:    "",
					Path:     "/",
					MaxAge:   -1,
					HttpOnly: true,
				})
				uid = -1
	//			return fmt.Errorf("Not connected!")
			}
		}

		if err = f(ctx, w, r, uid); err != nil {
			fails(w, err)
		}
	}
}

func NewFS(ctx FSContext) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /",  wrap2(ctx, FsGet))
	mux.HandleFunc("POST /", wrap2(ctx, FsSet))

	return mux
}

func FsGet(
	ctx FSContext, w http.ResponseWriter, r *http.Request, uid auth.UserId,
) error {
	fpath := filepath.Join(ctx.Root(), r.URL.Path)

	ok, err := ctx.CanGet(uid, fpath)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("Access forbidden")
	}

	http.ServeFile(w, r, fpath)

	return nil
}

// have one directory per used under data/ : data/<userId>/ would be the
// most resilient to e.g. username changes. But currently, we don't have
// the id!
//
// We can easily compute how much data each user eats, and easily restrict
// them accordingly.
//
// User preferences could eventually be stored there too.
//
// The prelude of FsSet/FsGet is identical: we want a wrap()
func FsSet(
	ctx FSContext, w http.ResponseWriter, r *http.Request, uid auth.UserId,
) error {
	fpath := filepath.Join(ctx.Root(), r.URL.Path)

	ok, err := ctx.CanSet(uid, fpath, "TODO")
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("Access forbidden")
	}

	// TODO

	return nil
}


// What it would have looked like with a RPC-like handling.
/*

type GetIn struct {
	Token   string `json:"token"`
	Path    string `json:"path"`
}

type SetIn struct {
	Token   string `json:"token"`
	Path    string `json:"path"`
}

func wrap[Tin any](
	ctx FSContext, f func(FSContext, *Tin, http.ResponseWriter, *http.Request) error,
) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var in Tin

		r.Body = http.MaxBytesReader(w, r.Body, 1048576)
		err := json.NewDecoder(r.Body).Decode(&in)
		if err != nil {
			log.Println(err)
			err = fmt.Errorf("JSON decoding failure")
			goto err
		}

		err = f(ctx, &in, w, r)
		if err == nil {
			return
		}

	err:
		fails(w, err)
		return
	}
}

func NewFS(ctx FSContext) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/get", wrap[GetIn](ctx, FsGet))
//	mux.HandleFunc("/set", wrap[SetIn](ctx, FsSet))

	return mux
}
*/
/*
func FsGet(ctx FSContext, in *GetIn, w http.ResponseWriter, r *http.Request) error {
	var name string
	var err error
	var ok bool

	// This is a special case: if there's no token, we're dealing
	// with an anonymous user, who can still access public files.
	if in.Token == "" {
		name = ""

	// But if he's logged-in, then things should check
	} else {
		ok, name, err = ctx.IsValidToken(in.Token)
		if err != nil {
			return err
		}
		if !ok {
			return fmt.Errorf("Not connected!")
		}
	}

	fpath := filepath.Join(dir, in.Path)

	ok, err = ctx.CanGet(name, fpath)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("Access forbidden")
	}

	fh, err := os.Open(fpath)
	defer fh.Close()
	if err != nil {
		return err
	}

	// TODO: So, if this is set, the browser automatically
	// uncompress things: we should be able to get rid
	// of paco.

//	if strings.HasSuffix(fpath, ".gz") {
//		w.Header().Set("Content-Encoding", "gzip")
//	}

	w.Header().Set("Cache-Control", "public, max-age=31104000")

	http.ServeFile(w, r, fpath)

	return nil
}

*/

// And for the record: another way this could have
// been tackled is by relying on
//	http.Handle("/data/", http.FileServerFS(&OurFs{}))
// But then, I'm not sure how we could have fetched our token:
// (perhaps by filling OurFs with some proper context?)
/*
type OurFs struct {}

func (*OurFs) Open(name string) (fs.File, error) {
	var uname string
	var err error
	var ok bool

	// There, :-/
//	tok := r.Cookie("token")

	// This is a special case: if there's no token, we're dealing
	// with an anonymous user, who can still access public files.
	if tok == "" {
		uname = ""

	// But if he's logged-in, then things should check
	} else {
		ok, uname, err = auth.IsValidToken(tok)
		if err != nil {
			return nil, err
		}
		if !ok {
			return nil, fmt.Errorf("Not connected!")
		}
	}

	uname = uname
	fpath := filepath.Join(dir, name)

	return os.Open(fpath)

}
*/
