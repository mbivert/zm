/*
 * To be written:
 *
 * Connect to SQL Database.
 * Fetch list of raw resources.
 * Actually fetch all raw resources.
 *	Keep a copy of old version if any.
 *	Keep track of which file were updated.
 * Fetch list of datas.
 * Reformat datas whose raw resources have been updated.
 *	In case of error, later:
 *		- notify owner of resource
 *		- link data to old resource version
 */

/*
 * As is, patches chains could rely on other Data, and should
 * thus be formatted last. Would remain the matter of a chain of
 * patches referencing a chain of patches.
 *
 * More generally, note that we're recreating yet-another dependency
 * manager.
 *
 * The problem with pre-formatting patch chain is that not only we
 * lose the italics, but it complicates web-based data edition.
 */
