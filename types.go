package main

import (
	"github.com/mbivert/auth"
)

/********************************************************
 * Authentication
 */

// We override auth's /signin to augment it
// with a captcha.
type SigninIn struct {
	auth.SigninIn

	CaptchaId     string // `json:"captchaid"`
	CaptchaAnswer string // `json:"captchaanswer"`
}

type SigninOut struct {
	auth.SigninOut

	CaptchaMatch  bool   `json:"captchamatch"`
	CaptchaId     string `json:"captchaid"`
	CaptchaB64Img string `json:"captchab64img"`
}

/********************************************************
 * Captcha
 */

type CheckCaptchaIn struct {
	Id     string `json:"id"`
	Answer string `json:"answer"`
}

type CheckCaptchaOut struct {
	Match     bool `json:"match"`
	GetCaptchaOut
}

type GetCaptchaIn struct {
}

type GetCaptchaOut struct {
	Id     string `json:"id"`
	B64Img string `json:"b64img"`
}

/********************************************************
 * DB & data (data.go)
 */

type DataType string

// XXX we have it 3 times now: JS, Go, SQL
const (
	dataTDict DataType = "dict"
	dataTDecomp        = "decomp"
	dataTBig5          = "big5"
	dataTBook          = "book"
	dataTPieces        = "pieces"
)

type DataFmt string

const (
	dataFCCCEdict DataFmt = "cc-cedict"
	dataFWMDecomp         = "wm-decomp"
	dataFChise            = "chise"
	dataFUnicodeBig5      = "unicode-big5"
	dataFMarkdown         = "markdown"
	dataFSWMarkdown       = "sw-markdown"
	dataFSimpleDict       = "simple-dict"
	dataFPieces           = "pieces"
)

// XXX meh, that's quite a reduced book; make it a DataGetBooksOut
// or something perhaps
type Book struct {
	Name    string `json:"name"`
	Descr   string `json:"descr"`
	File    string `json:"file"`
	UrlInfo string `json:"urlinfo"`
	Owned   bool   `json:"owned"`
}

type About struct {
	Type       DataType `json:"type"`
	Name       string   `json:"name"`
	UrlInfo    string   `json:"urlinfo"`
	License    string   `json:"license"`
	UrlLicense string   `json:"urllicense"`
}

// TODO: we may want to merge this with About;
// naming for sure will have to be unified.
type Metas struct {
	Type       DataType `json:"type"`
	Name       string   `json:"name"`
	Fmt        DataFmt  `json:"fmt"`
	File       string   `json:"file"`
}

// NOTE: we're getting close to './lib.d.ts:/^interface Data/',
// but not there yet.
type Data struct {
	Id          int64    `json:"id"`
	Name        string   `json:"name"`

	Type        DataType `json:"type"`
	Descr       string   `json:"descr"`

	// .File is only used to fill content in GetMyData();
	// we return it nevertheless.
	File        string   `json:"file"`
	Fmt         DataFmt  `json:"fmt"`

	UrlInfo     string   `json:"urlinfo"`

	Content     string   `json:"content"`

	Public      bool     `json:"public"`

	LicenseId   int64    `json:"licenseid"`
	LicenseName string   `json:"licensename"`
}

type License struct {
	Id    int64   `json:"id"`
	Name  string  `json:"name"`

	// XXX We currently don't need those, but perhaps we
	// should grab them too?
//	Descr string
//	URL   string
}

/********************************************************
 * Data (data.go)
 */

type SetDataIn struct {
	Token     string   `json:"token"`
	Name      string   `json:"name"`
	Type      DataType `json:"type"`
	Descr     string   `json:"descr"`
	Fmt       DataFmt  `json:"fmt"`

	Public    bool     `json:"public"`

	LicenseId int64    `json:"licenseid"`

	// XXX We at least would want to check that
	// this looks like a URL
	// rename to url?
	UrlInfo   string   `json:"urlinfo"`

	// Okay, we'll do that for now, this should be
	// good enough for a first draft, and small documents.
	Content   string   `json:"content"`

	// This two are automatically computed
	File      string
	UserId    auth.UserId

	// Convention used in 'data.go:/^func SetData\(':
	//	- if set to -1 're adding a new entry
	//	- otherwise, we're updating an existing entry.
	Id        int64
}

type SetDataOut struct {
}

type DataGetBooksIn struct {
	Token string `json:"token"`
}

type DataGetBooksOut struct {
	Books []Book `json:"books"`
}

type DataGetAboutIn struct {
}

type DataGetAboutOut struct {
	Datas []About `json:"datas"`
}

type DataGetMetasIn struct {
	Token string   `json:"token"`
	Names []string `json:"names"`
}

type DataGetMetasOut struct {
	Metas []Metas `json:"metas"`
}

type GetMyDataIn struct {
	Token string `json:"token"`
}

type GetMyDataOut struct {
	Datas []Data
}

type GetLicensesIn struct {
}

type GetLicensesOut struct {
	Licenses []License
}
