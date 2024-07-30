module github.com/mbivert/zm

go 1.22.5

replace github.com/mbivert/auth => /home/mb/gits/auth/

require github.com/mbivert/auth v0.0.0-20240730223949-8a5925b238b3

require (
	github.com/golang-jwt/jwt/v5 v5.2.1 // indirect
	github.com/mattn/go-sqlite3 v1.14.22 // indirect
	golang.org/x/crypto v0.25.0 // indirect
)
