package main

import (
	"database/sql"
	"errors"
	"fmt"
	"sync"
	"strings"
	_ "github.com/mattn/go-sqlite3"

	// XXX clumsy; temporary
	"github.com/mbivert/auth"
)

type DB struct {
	*sql.DB
	*sync.Mutex
}

// Assumes that the DB has been initialized beforehand.
func NewDB(path string) (*DB, error) {
	db, err := sql.Open("sqlite3", "file:"+path)

	if err != nil {
		return nil, err
	}

	return &DB{db,&sync.Mutex{}}, nil
}

// XXX eventually, we'll want this to be cached, but for zm's purposes,
// this should be moore than enough.
func (db *DB) CanGet(uid auth.UserId, path string) (bool, error) {
	db.Lock()
	defer db.Unlock()

	// XXX this shouldn't happen anymore, but that's
	// probably handled too lightly upstream.
	if strings.HasPrefix(path, "/") {
		panic(path)
		path = path[1:]
	}

	fmt.Println(path)

	var owner auth.UserId
	var public int

	// XXX: meh, path vs. File
	err := db.QueryRow(`
		SELECT
			Permission.Public, User.Id
		FROM
			Data, Permission, User
		WHERE
			File = $1
		AND Data.Id = Permission.DataId
		AND Data.UserId == User.Id
	`, path).Scan(&public, &owner)

	if err != nil {
		return false, err
	}

	return public >= 1 || owner == uid, nil
}

func (db *DB) AddData(d *DataSetIn) error {
	db.Lock()
	defer db.Unlock()

	err := db.QueryRow(`
		INSERT INTO
			Data (
				Name, UserId, Type, Descr, File, Formatter,
				Fmt, FmtParams, UrlInfo
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING Id`,
			d.Name, d.UserId, d.Type,
			d.Descr, d.File, "cat",
			d.Fmt, "", d.UrlInfo).Scan(&d.UserId)

	return err
}

// Below is essentially copy-pasted from ../auth/db-sqlite.go,
// so that we implements auth.DB.
//
// (XXX temporary I guess, but see ../auth/TODO.md)

// XXX/TODO: we're probably leaking email address bytes
// https://www.usenix.org/system/files/sec21-shahverdi.pdf also
// https://faculty.cc.gatech.edu/~orso/papers/halfond.viegas.orso.ISSSE06.pdf
func (db *DB) AddUser(u *auth.User) error {
	db.Lock()
	defer db.Unlock()

	// TODO: clarify exec vs. query (is there a prepare here?)
	err := db.QueryRow(`INSERT INTO
		User (Name, Email, Passwd, Verified, CDate)
		VALUES($1, $2, $3, $4, $5)
		RETURNING Id`, u.Name, u.Email, u.Passwd, u.Verified, u.CDate,
	).Scan(&u.Id)

	// Improve error message (this is for tests purposes: caller
	// is expected to provide end user with something less informative)
	if err != nil && err.Error() == "UNIQUE constraint failed: User.Email" {
		err = fmt.Errorf("Email already used")
	}
	if err != nil && err.Error() == "UNIQUE constraint failed: User.Name" {
		err = fmt.Errorf("Username already used")
	}

	return err
}

// Okay so we're checking the user via its name; could it be
// convenient to also allow to do it via email?
func (db *DB) VerifyUser(uid auth.UserId) error {
	db.Lock()
	defer db.Unlock()

	x := 0

	// NOTE: if we were only doing an .Exec, we wouldn't
	// be able to detect failure; returning a dumb row
	// on success allows us to check whether the update
	// did occured.
	err := db.QueryRow(`
		UPDATE
			User
		SET
			Verified = $1
		WHERE
			Id  = $2
		RETURNING
			1
	`, 1, uid).Scan(&x)


	if errors.Is(err, sql.ErrNoRows) {
		err = fmt.Errorf("Invalid uid")
	}

	return err
}

// XXX/TODO: any reasons for not (also) returning u?
func (db *DB) GetUser(u *auth.User) error {
	db.Lock()
	defer db.Unlock()

	verified := 0

	// TODO: clarify exec vs. query (is there a prepare here?)
	err := db.QueryRow(`SELECT
			Id, Name, Email, Passwd, Verified, CDate
		FROM User WHERE
			Name  = $1
		OR  Email = $2
	`, u.Name, u.Email).Scan(&u.Id, &u.Name, &u.Email, &u.Passwd, &verified, &u.CDate)

	if err == nil && verified > 0 {
		u.Verified = true
	}

	// Improve error message
	if errors.Is(err, sql.ErrNoRows) {
		err = fmt.Errorf("Invalid username or email")
	}

	return err
}

func (db *DB) RmUser(uid auth.UserId) (email string, err error) {
	db.Lock()
	defer db.Unlock()

	err = db.QueryRow(`DELETE FROM User WHERE Id = $1
		RETURNING Email`, uid).Scan(&email)

	if errors.Is(err, sql.ErrNoRows) {
		err = fmt.Errorf("Invalid username")
	}

	return email, err
}

func (db *DB) EditUser() error {
	return fmt.Errorf("TODO")
}
