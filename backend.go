package main

/*
 * We need at least a basic backend to serve both our
 * single page (SPA) and data files/CSS/images/etc.
 *
 * For now, the configuration (config.json) is somewhat
 * clumsily generated by bin/mkconfigjs.sh.
 */

import (
	"flag"
	"html/template"
	"io"
	"log"
	"net"
	"net/http"
	"net/http/fcgi"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"

	"github.com/mbivert/auth"

	//	"compress/gzip"
	"fmt"
	//	"io/fs"
	"testing"

	"github.com/mojocn/base64Captcha"
)

var C Config

// CLI parameters
var port string
var usock string
var dir string
var fastcgi bool
var confFn string
var authConfFn string
var dbFn string
var openbsd bool

var indexPageTmpl = template.Must(template.New("").Parse("" +
	`<!DOCTYPE html>
<html>
	<head>
		<!-- Google tag (gtag.js) -->
		<script async src="https://www.googletagmanager.com/gtag/js?id=G-CR2JJD19S0"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			gtag('config', 'G-CR2JJD19S0');
		</script>

		<title>Zhongmu</title>

		<meta charset="utf-8" />

		<link type="text/css" rel="stylesheet" href="{{ .root }}/zm.css?v={{ .version }}"   />
		<link type="text/css" rel="stylesheet" href="{{ .root }}/show.css?v={{ .version }}" />

		<script src="{{ .root }}/pako.min.js?v={{ .version }}"></script>
		<script src="{{ .root }}/full.js?v={{ .version }}"></script>

		<meta name="description" content="Chinese character deep recursive inspection" />
		<meta name="robots" content="index, archive" />
		<meta name="keywords" content="Chinese language, character decomposition, San Bai Qian">
		<meta name="author" content="Mathieu Bivert" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	</head>
	<body>
		<div id="loading"><span id="loading-wheel"></span></div>

		<div id="content">
			<div id="header">
				<div id="menu">
					<ul>
						<li><a href="{{ .root }}/index.html">🏠</a></li>
						<li><a href="{{ .root }}/books.html">Books</a></li>
						<li><a href="{{ .root }}/help.html">Help</a></li>
						<li><a href="{{ .root }}/about.html">About</a></li>
						<li><a href="{{ .root }}/account.html">Account</a></li>
					</ul>
				</div>
				<div id="important">
					You may want to
					<a href="https://organharvestinvestigation.net/">document</a>
					yourself about human rights in China.
				</div>
			</div>
			<script>window.addEventListener('load', function() {
				SPA.init(window.location.pathname);
			});</script>
			<div id="main"></div>
			<div id="footer">
				<p>
					© Last update: 2024-08-12 - WIP -
					<a href="https://github.com/mbivert/zm/">code</a> -
					<a href="https://github.com/mbivert/zm-data/">data</a>;
					optimized for desktop</p>
			</div>
		</div>
	</body>
</html>
`))

func init() {
	if testing.Testing() {
		return
	}
	flag.StringVar(&port, "p", ":8001", "TCP address to listen to")
	flag.StringVar(&dir, "d", "./site-ready/", "HTTP root location")
	flag.StringVar(&usock, "u", "", "If set, listen on unix socket over TCP port")
	flag.BoolVar(&fastcgi, "f", false, "If set, use the UNIX socket and FastCGI")
	flag.StringVar(&confFn, "c", "config.json", "/path/to/config.json")
	flag.StringVar(&authConfFn, "a", "config.auth.json", "/path/to/config.auth.json")
	flag.StringVar(&dbFn, "s", "db-dev.sqlite", "/path/to/db.sqlite")
	flag.BoolVar(&openbsd, "o", false, "Tweaks for OpenBSD")

	flag.Parse()

	if err := loadConf(confFn, &C); err != nil {
		log.Fatal(err)
	}
}

var captcha *base64Captcha.Captcha

func GetCaptcha(_ *DB, in *GetCaptchaIn, out *GetCaptchaOut) error {
	id, b64s, _, err := captcha.Generate()
	if err != nil {
		return err
	}

	out.Id = id
	out.B64Img = b64s
	return nil
}

func CheckCaptcha(_ *DB, in *CheckCaptchaIn, out *CheckCaptchaOut) error {
	// true means we want to delete the captcha
	// (we'll generate a new one automatically)
	if out.Match = captcha.Verify(in.Id, in.Answer, true); out.Match {
		return nil
	}

	// Failure: regenerate a new captcha
	id, b64s, _, err := captcha.Generate()
	if err != nil {
		return err
	}

	out.Id = id
	out.B64Img = b64s
	return nil
}

func Signin(db *DB, in *SigninIn, out *SigninOut) error {
	fmt.Println(in)
	ccout := CheckCaptchaOut{}
	err := CheckCaptcha(
		db,
		&CheckCaptchaIn{in.CaptchaId, in.CaptchaAnswer},
		&ccout,
	)

	out.CaptchaMatch = ccout.Match
	out.CaptchaId = ccout.Id
	out.CaptchaB64Img = ccout.B64Img

	if err != nil || !out.CaptchaMatch {
		return err
	}

	return auth.Signin(db, &in.SigninIn, &out.SigninOut)
}

func mkServeMux(db *DB) *http.ServeMux {
	mux := initData(db)

	mux.Handle("/auth/", http.StripPrefix("/auth", auth.New(db)))

	// XXX Overide auth.Signin to add captcha checks; should
	// be temporary.
	//
	// TODO: if we were using the same mux, this should panic(): test
	// and eventually document it
	mux.HandleFunc("/auth/signin", auth.Wrap[*DB, SigninIn, SigninOut](db, Signin))

	captcha = base64Captcha.NewCaptcha(
		base64Captcha.NewDriverDigit(100, 240, 4, 0.7, 80),
		base64Captcha.DefaultMemStore,
	)

	mux.HandleFunc("/captcha/get", auth.Wrap[*DB, GetCaptchaIn, GetCaptchaOut](db, GetCaptcha))
	mux.HandleFunc("/captcha/check", auth.Wrap[*DB, CheckCaptchaIn, CheckCaptchaOut](db, CheckCaptcha))

	// Won't change
	var s strings.Builder
	indexPageTmpl.Execute(&s, map[string]any{
		"root":    C.Root,
		"version": C.Version,
	})

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Clean(r.URL.Path)
		log.Println("Request to " + path)
		if path == "/" {
			path = "/index.html"
		}
		fpath := filepath.Join(dir, path)
		isdir, err := isDir(fpath)
		if isdir || err != nil {
			path = "index.html"
		}

		// rough guard: this shouldn't happen anymore
		if strings.HasPrefix(path, "/data/") {
			w.WriteHeader(http.StatusBadRequest)
		}

		if strings.HasSuffix(path, ".html") {
			// Should barely ever happen
			if _, err := io.WriteString(w, s.String()); err != nil {
				log.Println(err)
			}
		} else {
			fmt.Println("HandleFunc /: " + fpath)
			http.ServeFile(w, r, fpath)
		}
	})

	return mux
}

func main() {
	db, err := NewDB(dbFn)
	if err != nil {
		log.Fatal(err)
	}

	if err := auth.LoadConf(authConfFn); err != nil {
		log.Fatal(err)
	}

	mux := mkServeMux(db)

	if usock != "" {
		// This isn't needed on Linux thanks to the proper socket closing
		// which follows, but that dance doesn't appease the OpenBSD go^wdaemons,
		// so we must remove it (otherwise, fails with a "bind: address already in use")
		if openbsd {
			if err := os.RemoveAll(usock); err != nil {
				log.Fatal(err)
			}
		}

		l, err := net.Listen("unix", usock)
		if err != nil {
			log.Fatal(err)
		}

		// NOTE: the socket needs to be properly closed on exit, for
		// otherwise, it'll stay bound. In production, it becomes tricky
		// to simply remove the socket before starting.
		//
		// https://stackoverflow.com/a/16702173
		sigc := make(chan os.Signal, 1)
		signal.Notify(sigc, os.Interrupt, os.Kill, syscall.SIGTERM)
		go func(c chan os.Signal) {
			// Wait for signal/interrupt
			sig := <-c
			log.Printf("Caught signal %s: shutting down.", sig)
			l.Close()
			os.Exit(0)
		}(sigc)

		log.Printf("Listening on unix:%s (fastcgi: %t)\n", usock, fastcgi)

		if fastcgi {
			log.Fatal(fcgi.Serve(l, mux))
		} else {
			log.Fatal(http.Serve(l, mux))
		}
	} else {
		log.Println("Listening on " + port)
		log.Fatal(http.ListenAndServe(port, mux))
	}
}
