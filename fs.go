package main

// Probably, to be stored in an external package once we
// have set working, assuming we do.

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
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
	IsValidToken(token string) (bool, string, error)
	CanGet(username, path string) (bool, error)
	CanSet(username, path, data string) (bool, error)
}

func NewFS(ctx FSContext) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		if err := FsGet(ctx, w, r); err != nil {
			fails(w, err)
		}
	})

	return mux
}

func FsGet(ctx FSContext, w http.ResponseWriter, r *http.Request) error {
	var name string
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
		name = ""

	// But if he's logged-in, then things should check
	} else {
		ok, name, err = ctx.IsValidToken(tok)
		if err != nil {
			return err
		}
		if !ok {
			return fmt.Errorf("Not connected!")
		}
	}

	fpath := filepath.Join(ctx.Root(), r.URL.Path)

	ok, err = ctx.CanGet(name, fpath)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("Access forbidden")
	}

	// TODO: So, if this is set, the browser automatically
	// uncompress things: we should be able to get rid
	// of paco.

//	if strings.HasSuffix(fpath, ".gz") {
//		w.Header().Set("Content-Encoding", "gzip")
//	}

	http.ServeFile(w, r, fpath)

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
