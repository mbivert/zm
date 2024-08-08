
-- SQLite JSON export:
-- .mode json

-- NOTE: we're not linking to Resource because not all Data have a Resource,
-- such Data would be skipped.
--
-- Also, the Resource won't be of much use JS-side, so this should be
-- realistic enough.

-- NOTE: this is essentially obsolete but for bin/mklicense.js and
-- bin/check-data.js.
SELECT
	Data.Id, Data.Name, Data.Type, Data.Descr, Data.Fmt, Data.FmtParams,
	Data.File, Data.UrlInfo,
	License.name AS License,
	License.url  AS UrlLicense
FROM Data, License, DataLicense
	WHERE Data.Id      = DataLicense.DataId
	AND   License.Id   = DataLicense.LicenseId;
