package main

// Probably, to be stored in an external package once we
// have set working, assuming we do.

import (
	"fmt"
	"net/http"
	"path/filepath"
	"github.com/mbivert/auth"
)

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

// have one directory per used under data/ : data/<userId>/
//
// We can easily compute how much data each user eats, and easily restrict
// them accordingly.
//
// But this FsSet is perhaps a bit weird as an interface, unless
// we're just editing a data file: if we're adding a new one, we'll
// need to push bits in the SQL too.
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
