-- Default users, for dev purposes.
-- Password: {c=!aW}4:1J~UR]j"q|Q
INSERT INTO User
	(Id, Name, Email, Passwd, Verified, CDate)
VALUES
	(1, 'zhongmu', 'foo@bar.com', '$2a$04$ro3LmI0oCgVRaAEqeNIA.uAJcPopsBL4er0H3bXTIsjpAA0h8Ds3W', 1, 1722726391),
	(2, 'mbivert', 'bar@bar.com', '$2a$04$ro3LmI0oCgVRaAEqeNIA.uAJcPopsBL4er0H3bXTIsjpAA0h8Ds3W', 2, 1722726391)
	;
