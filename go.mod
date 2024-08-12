module github.com/mbivert/zm

go 1.22.5

replace github.com/mbivert/auth => /home/mb/gits/auth/

require (
	github.com/golang-jwt/jwt/v5 v5.2.1
	github.com/mattn/go-sqlite3 v1.14.22
	github.com/mbivert/auth v0.0.0-20240811015513-ee68f233a1a8
	github.com/mbivert/ftests v1.0.0
	github.com/mojocn/base64Captcha v1.3.6
)

require (
	github.com/golang/freetype v0.0.0-20170609003504-e2365dfdc4a0 // indirect
	golang.org/x/crypto v0.26.0 // indirect
	golang.org/x/image v0.19.0 // indirect
)
