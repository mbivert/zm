/*
 * This file serves to provide documentation and tsc(1)
 * based typechecking data for global shared data structures.
 *
 * NOTE/TODO: this file is getting messy. We'll need to at least
 * organise it in section, or to break it in smaller files.
 */

declare enum SVarType {
	Number = 0,
	String = 1,
}

/*
 * We currently rely on this being integers in markdown parsing:
 * the number of '#' matches the value of Title/Section/etc.
 */
declare enum ChunkType {
	Invalid          = -1,
	Paragraph        = 0,
	Title            = 1,
	Section          = 2,
	Subsection       = 3,
	Subsubsection    = 4,
	Subsubsubsection = 5,
}

declare enum MoveDir {
	Offset = "offset",
	Next   = "next",
	Prev   = "prev",
}

// XXX we could/should use integers?
declare enum MoveWhat {
	Word             = "word",
	Piece            = "piece",
	Chunk            = "chunk",
	Title            = "title",         // A bit weird; that's basically a move to start.
	Section          = "section",
	Subsection       = "subsection",
	Subsubsection    = "subsubsection",
	Subsubsubsection = "subsubsubsection",
}

declare enum TokenType {
	Punct   = 0,
	Chinese = 1,
	Foreign = 2,
	Pinyin  = 3,
	Word    = 4, // NEW; to replace Chinese/Foreign
	EOF     = 5,
}

declare enum TabType {
	Decomp        = "decomp",
	Dict          = "dict",
	NavDict       = "navdict",
	Imgs          = "imgs",
	Links         = "links",
	DictsChain    = "dicts-chain",
	DecompsChain  = "decomps-chain", //  TODO global s/decomps/decs/
}

/*
 * Parsing error for data file: line number and error message;
 * undefined for no error.
 */
type ParseError = [number, string]|undefined;

interface HideableHTMLElement extends HTMLElement {
	oldDisplay ?: string,
}

interface ActiveableHTMLElement extends HTMLElement {
	activate  ?: () => void,
	activated ?: boolean,
}

// TODO: do we really need to distuinguish betwen Maybe* and *?
interface BuildableHTMLElement extends HTMLElement {
	build  : (...args : any[]) => any,
}

interface MBuildableHTMLElement extends HTMLElement {
	build  ?: (...args : any[]) => any,
}

// MaybeMovable
interface MMovableBuildableHTMLElement extends BuildableHTMLElement {
	move ?: (d : MoveDir, w : (MoveWhat|number)) => [number, number],
}

interface MovableBuildableHTMLElement extends BuildableHTMLElement {
	move : (d : MoveDir, w : (MoveWhat|number)) => [number, number],
}
interface Test {
	f        : Function,
	args     : any[],
	expected : any,
	descr    : string,
	error    ?: string,
}

type Tests = Array<Test>;

// Table of Content
interface ToCEntry {
	t  : ChunkType,
	v  : string,
	ic : number,
	cs : ToC,
}
type ToC      = Array<ToCEntry>;

/*
 * Available data types.
 *
 * NOTE/TODO: this should matches SQL's Data.Type's allowed
 * values.
 */
declare enum DataType {
	Dict   = "dict",
	Decomp = "decomp",
	Big5   = "big5",
	Book   = "book",
}

/*
 * Available data formats.
 *
 * NOTE/TODO: this should matches SQL's Data.Fmt's allowed
 * values.
 */
declare enum DataFmt {
	CEDict          = "cc-cedict",
	WMDecomp        = "wm-decomp",
	Chise           = "chise",
	UnicodeBig5     = "unicode-big5",
	Markdown        = "markdown",
	SWMarkdown      = "sw-markdown", // temporary, to be removed
	SimpleDict      = "simple-dict",
}

/*
 * Decomposition type.
 *
 * Currently reflecting our focus on Chinese characters,
 * yet naming is prepared for other cases.
 *
 * ISO 10646 systematizes CJK character's visual decomposition.
 * See https://dl.acm.org/doi/10.3115/1118759.1118768
 *
 * The wikimedia decomposition table that we use extends it
 * to some degree.
 * See https://commons.wikimedia.org/wiki/User:Artsakenos/CCD-ISO10646
 */
declare enum DecompType {
	// u u Reserved
	Unknown      = 0,

	/// ISO 10646
	// 吅	⿰	0x2FF0	IDC LEFT TO RIGHT	IDC2	A
	CnLeftToRight  = 1,

	// 吕	⿱	0x2FF1	IDC ABOVE TO BELOW	IDC2	B
	CnAboveToBelow = 2,

	// 罒	⿲	0x2FF2	IDC LEFT TO MIDDLE AND RIGHT	IDC3	K
	CnLeftToMiddleAndRight = 3,

	// 目	⿳	0x2FF3	IDC ABOVE TO MIDDLE AND BELOW	IDC3	L
	CnAboveToMiddleAndBelow = 4,

	// 回	⿴	0x2FF4 	IDC FULL SURROUND	IDC2	I
	CnFullSurround = 5,

	// 冂	⿵	0x2FF5 	IDC SURROUND FROM ABOVE	IDC2	F
	CnSurroundFromAbove = 6,

	// 凵	⿶	0x2FF6 	IDC SURROUND FROM BELOW	IDC2	G
	CnSurroundFromBelow = 7,

	// 匚	⿷	0x2FF7 	IDC SURROUND FROM LEFT	IDC2	H
	CnSurroundFromLeft = 8,

	// 厂	⿸	0x2FF8 	IDC SURROUND FROM UPPER LEFT	IDC2	D
	CnSurroundFromUpperLeft = 9,

	// 勹	⿹	0x2FF9 	IDC SURROUND FROM UPPER RIGHT	IDC2	C
	CnSurroundFromUpperRight = 10,

	// 匕	⿺	0x2FFA	IDC SURROUND FROM LOWER LEFT	IDC2	E
	CnSurroundFromLowerLeft = 11,

	// .	⿻	0x2FFB	IDC OVERLAID	IDC2	J
	CnOverlaid = 12,

	/// Wikimedia table extension
	/// Similar patterns are identified in CHISE data, only with different symbols
	/// E.g. 一 is used by CHISE
	// 一	一	Graphical primitive, non composition (second character is always *)
	CnWmPrimitive = 13,

	// 咒	⿱⿰	Vertical composition, the top part being a repetition.
	CnWmAboveTwiceToBelow = 14,

	// 弼		Horizontal composition of three, the third being the repetition of the first.
	CnWmLeftToMiddleToLeft = 15,

	// 品		Repetition of three.
	CnWmThrice = 16,

	// 叕		Repetition of four.
	CnWmQuarce = 17,

	// 冖		Vertical composition, separated by "冖".
	CnWmVerticalCover = 18,

	// ?		Unclear, seems compound but ...
	CnWmUnclear = 19,

	// +		Graphical superposition or addition.
	CnWmSuperpos = 20,

	// *		[!] Assuming WIP; undocumented
	CnWmWIP = 21,

	/// Ours
	// a a Auto	Automatic decomposition through dictionaries.
	Auto        = 22,
}

/*
 * Let me clarify the structure of the loaded dictionaries, because
 * it's awfully complex. The complexity stems from the user features
 * we want to provide:
 *
 *	- patching existing dictionaries. For example, CC-CEDICT isn't
 *	interested in receiving entries pertaining to classical Chinese,
 *	and so they'll never be merged upstream.
 *
 *	"Patches" are meant to be applied on upstream on-the-fly, so
 *	as to lightly tweak upstream entries. The benefits of doing
 *	this on the fly is that we don't have to bother too much about
 *	handling upstream update on the backend: eventually in case of
 *	conflicts/issue, the user will be able to tweak things on his
 *	own as he wishes.
 *
 *	- We want to eventually source dictionary entries. In particular,
 *	patches entry, so as to more easily check the data from the UI
 *	(the UI feature is missing, but the data structures support it).
 *
 *	- Finally, we want to try to optimize for space, because that's
 *	all loaded in memory on the browser, and can get pretty voluminous.
 *
 *
 * As for the data structures:
 *	Given a single word, we could have entries for it in multiple
 *	dictionaries.
 *
 *	Hence, we use an "interface DictsEntries", which maps a dictionary
 *	name to the entry corresponding to that word.
 *
 *	Each of those entries is represented by an "interface DictEntry".
 *
 *	Now, because Chinese is a bit peculiar, we must subdivide each
 *	of those entries once more: once per sound. Meaning, a DictEntry
 *	will be a hash, mapping a sound to a "type DictSoundEntries".
 *
 *	A DictSoundEntries is a weird thing, poorly named (but what else).
 *	In theory, we would just want at that stage to get a list of the
 *	definitions associated to the sound.
 *
 *	But because we want to support on-the-fly patching, a DictSoundEntries
 *	actually contains a sequence of patching entries, to be applied
 *	once after the other.
 *
 *	For example, imagine we have something like:

			"疋" : @type{DictEntry} {
				"pi3" : @type{DictSoundEntries} [
					@type{DictSoundEntry} {
						ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]
					},
					@type{DictSoundEntry} {
						{ ds : ["variant of 匹[pi3]" ], rm : true },
					}
				],
			},
 *
 *	Then, if we were to display this entry to the user, we would compute
 *	a final entry with "variant of 匹[pi3]" removed, as instructed by the
 *	second DictSoundEntry.
 *
 *	And that's also why our DictSoundEntry aren't just a bare list of
 *	definitions: those are stored in its .ds field, alongside other fields,
 *	either indicating patching infos, or sourcing information ("where did
 *	that entry came from")
 */

/*
 * Overall, sourcing data could be helpful to evaluate material's
 * quality, for instance when submitting changes to external
 * resources maintainers (e.g. CC-CEDICT).
 *
 * NOTE: for our files, whether dictionaries or decomposition, we (will)
 * implement a mechanism allowing us to keep track of various sources,
 * thus e.g. extending CC-CEDICT format with special comments; this
 * is for now unused.
 */
interface Source {
	comment  : string,
	url     ?: string,
	book    ?: string,
}

type Sources = Array<Source>

/*
 * Interface augmenting data with sources.
 */
interface WithSources {
	// For now, flag for wikimedia data; we may extend this
	// later, e.g. have a list of users, use a %
	// of correctness, some user comments, etc.
	//
	// Thus it being stored for all data.
	//
	// TODO: this is memory-suboptimized.
	ok   ?: boolean,

	// Optional sources.
	srcs ?: Sources,
}

/*
 * Interface allowing to create data "patching":
 * mark an entry as being either positively added
 * or to be removed.
 *
 * Both default to false, hence optionality. I *suppose*
 * this would also free us a little bit of memory.
 */
interface WithPatching {
	// Is this entry supposed to be a removal?
	rm ?: boolean,

	// When constructing a patched DictEntry, flag indicating
	// whether the entry has been altered by a patch, either
	// positively or negatively
	// (tw-eaked)
	tw ?: boolean,
}

/*
 * Single dictionary entry associating word/sound/definitions plus
 * some meta data regarding sources and patching.
 *
 * TODO/XXX: Do we keep s/ds/d ? (also s/rm/r/ and s/tw/t/?). Perhaps
 * we should try to do some measuring and see if it's really impactful
 * memory wise: having distinct fields names at each layer of the structure
 * would improve readability.
 *
 * TODO/XXX should this be renamed? (switched with DictEntry)
 */
interface DictSoundEntry extends WithSources, WithPatching {
	// Actual definitions
	ds : Array<string>,
}

type DictSoundEntries = Array<DictSoundEntry>

/*
 * Single dictionary entry, to which multiple sounds can
 * be provided, to which multiple definitions can be provided.
 *
 * Note that because we allow dictionary patching, and because
 * the patching itself is performed on-the-fly on the web interface,
 * we have to cary here potentially multiple sound entries,
 * each potentially describing successive patching operations.
 *
 * Thus, most of the time, there will only be a single entry here.
 */
interface DictEntry {
	[details: string] : DictSoundEntries
}

/*
 * A decomposition component that can itself be
 * redecomposed.
 *
 * A Component is only used in a Token context; decomposition
 * tables aren't recursive, and only store strings.
 */
interface Component {
	v : string,
	d : DictsEntries,
	c : DecompsEntries<Component>,
}

/*
 * Single decomposition entry.
 * T is either a string (decomposition table) or a Component<U> (Token).
 */
interface DecompEntry<T> extends WithSources, WithPatching {
	t : DecompType,
	c : Array<T>,
}

/*
 * We allow a single decomposition table to propose
 * multiple decomposition for a single character.
 */
type DecompEntries<T> = Array<DecompEntry<T>>

/*
 * Dictionary and decomposition entries for a Token (see below),
 * both indexed by dictionary/decomposition table textual ids.
 *
 * Both are parametrized by T, which is either a string or
 * an array of token, as the definitions provided through the
 * dictionaries cat be tokenized so as to be analyzed.
 */
interface DictsEntries      { [details: string] : DictEntry        }
interface DecompsEntries<T> { [details: string] : DecompEntries<T> }

/*
 * A token is a slice of a piece of text that we wish
 * to inspect through one or many dictionary.
 *
 * Goals: cleaner interface; support for multiple languages;
 * definition tokenization is performed by front code, not pre-emptively.
 */
interface Token {
	t  : TokenType,

	// The slice's integers; the container indexed by those
	// integers is stored elsewhere.
	i  : number,
	j  : number,

	// Actual slice as an utf8 string
	v  : string,

	// Definitions
	d : DictsEntries,

	// Decompositions
	c : DecompsEntries<Component>,
}

type Tokens = Array<Token>;

// We now have a mean to remove our cumbersome token typing...
type IJToken = Pick<Token, "i" | "j">

/*
 * A typical hash-based dictionary.
 *
 * Used as an intermediary step for TreeDicts creation, but
 * also directly to provide search feature on index page. We
 * will may want to use them for regular lookup too.
 */
interface Dict {
	[details: string] : DictEntry,
}

/*
 * Decomposition table.
 */
interface Decomp {
	[details: string] : DecompEntries<string>,
}

/*
 * A parser takes a string and returns an object
 * of type T or a parsing error.
 */
type Parser<T> = (arg0: string, arg1 ?: T) => [T, ParseError];

/*
 * A LineParser parse a single line; to be used with a Parser.
 */
type LineParser<T> = (arg0 : [T, ParseError], arg1 : string, arg2 : number) => [T, ParseError];

/*
 * A tree-based structure used to identify Tokens in a
 * piece of text using multiple dictionaries.
 *
 * e.g.
 *  {
 *		h : [{
 *			i : [{
 *				t : [{}, <hit definition(s)>]
 *			}, <hi definition(s)>],
 *		}]
 *	}
 */
interface TreeDicts {
	[details: string] : [TreeDicts, DictsEntries],
}

/*
 * A decomposition table that holds the content of multiple
 * decomposition tables.
 */
interface TreeDecomps {
	[details: string] : DecompsEntries<string>,
}

/*
 * Generic data wrapper, holding various meta-datas.
 *
 * Format matches what is stored (and fetch from) SQL database,
 * hence the unusual verbose naming (compared to other interface
 * fields from this file).
 */
interface Data {
	Descr      : string,
	File       : string,
	Fmt        : DataFmt,
	FmtParams  : string,
	Id         : number,
	License    : string,
	Name       : string,
	Type       : DataType,
	UrlInfo    : string,
	UrlLicense : string,
}

type Datas = Array<Data>;
type Book  = Array<Chunk>;


/*
 * A chunk is a piece of markdown corresponding to either
 * a chapter name/section name/etc. or to a paragraph.
 */
interface Chunk {
	t : ChunkType,
	v : string,
}

/*
 * A tokenized Chunk is a Chunk whose content has
 * been tokenized byt cut(). Original content as a
 * string is still available.
 */
interface TokedChunk extends Chunk {
	ts : Array<Token>,
}

type TokedChunks = Array<TokedChunk>;

/*
 * Move predicate provided for convenience:
 * True if the current position pointed by jc/jw in S
 * match the predicate.
 */
type MoveP = (S : Movable, jc : number, jw : number) => boolean

/*
 * A move function built upon movep, thus wrapping a predicate,
 * to move in a given
 * direction.
 */
type MoveDirF = (
	S : Movable, d : MoveDir, jc : number, jw : number
) => [number, number]

type MoveFun = (d : MoveDir, w : (MoveWhat|number)) => [number, number]

interface Movable {
	ic : number,
	iw : number,
	cs : TokedChunks,

	// Numbers of chunks
	cn : () => number,

	// Number of words in a given chunk
	wn : (ic ?: number) => number,

	// Current chunk
	cc : (ic ?: number, iw ?: number) => Chunk,

	// Current word as a token
	cw : (ic ?: number, iw ?: number) => Token,

	// Current word as a string ("value")
	cwv : (ic ?: number, iw ?: number) => string,

	movep : (
		d   : MoveDir,
		p   : MoveP,
		ic ?: number,
		iw ?: number,
	) => [number, number],

	move  : (d : MoveDir, w : (MoveWhat|number)) => [number, number],

	init  : (cs : Array<TokedChunk>, ic ?: number, iw ?: number) => void,
}

interface SVarLD {
	load : (s : string) => any,
	dump : (x : any)    => string,
}

// XXX/TODO: should we provide a default value?
interface SVarDescr {
	// variable name in dump string (bookmark name)
	bn : string,

	// variable name in destination object (state name)
	sn : string,

	// variable type
	type : SVarType,
}

/*
 * UTF8 to BIG5 translation table "0xYYY" to "0xZZZ".
 */
interface UTF82Big5 {
	[details: string] : string,
}

/*
 * Navigation buttons textual description.
 *
 * TODO: actually index with MoveDir; this may
 * be cumbersome to initialize a Map<> like that.
 *
 * E.g.: {
 *	'prev' : [ [ "word",  "←" ], [ "piece", "⟵" ], [ "chunk", "⇦" ] ],
 *	'next' : [ [ "word",  "→" ], [ "piece", "⟶" ], [ "chunk", "⇨" ] ],
 * }
 */
interface NavBtns {
//	[details: MoveDir] : Array<[MoveWhat, string]>
	[details: string]  : Array<[MoveWhat, string]>
}

// e.g. [ "ArrowRight", "ctrl", MoveWhat.Piece ],
interface KMove  {
	k  : string,
	m ?: string,
	d  : MoveDir,
	w  : MoveWhat,
}
type KMoves = Array<KMove>;

/*
 * Abstract "generic" view, allowing to render/unrender "something."
 */
interface View {
	svars : SVarDescr[],

	loadbm   : () => void,
	load     : () => Promise<any>,

	render   : () => void,
	unrender : () => void,

	renderbm : () => void,
	loadandrender : () => Promise<any>,
}

/*
 * word => grid's recursive state
 */
/*
interface GridCache {
	[details: string] : DumpVcuts,
}
*/

/*
 * Abstract view containing DOM pointers to render
 * a decomposition grid and a stack of words, typically
 * used to inspect Chinese word found in the decomposition
 * grid.
 */
/*
interface ViewWithStackGrid extends View {
	// Where to display the stack.
	pstack : HTMLElement,

	// Where to display the decomposition grid.
	pgrid  : HTMLElement,

	// Stack of currently displayed words in pstack
	stack  : Array<string>,

	// Current word (stack index) being rendered
	n : number,

	// Where to store word's current decomposition:
	// when navigating words/the stack, words decomposition
	// is cached so that it is displayed as users left
	// it last time he saw that word.
	cache  : GridCache,

	// Returns last word on the stack; undefined if stack
	// is empty.
	last : () => string|undefined,

	// Returns current word on the stack; undefined if stack
	// is empty.
	current : () => string|undefined,

	// Push a word on the stack if it's not already in last
	// position.
	push : (w : string) => void,

	// Execute f by going back in the stack until we found word w
	// No-op if w not found.
	findback : (w : string, f : (arg0 : number) => void) => void,

	// Delete pointed word from the stack.
	del : (w : string) => void,

	// Pop the stack until the given word is met
	popto : (w : string) => void,

	// Set .n by going through the stack until the given word is met
	backto : (w : string) => void,

	// Cache current element of the stack (the one being decomposed)
	cachecurrent  : () => void,

	renderstack   : () => void,
	rendergrid    : () => void,
	unrenderstack : () => void,
	unrendergrid  : () => void,

	pushandrender : (w : string) => void,
}
*/

/*
 * View allowing to display a single word/character.
 *
 * Main difference with ViewWithStackGrid is that ViewSingle
 * has an implemented cw() method; not an abstract interface then.
 * (TODO: clarify: whis is there no cw() in here then?)
 */
/*
interface ViewSingle extends ViewWithStackGrid {
}

interface ViewMovable extends ViewWithStackGrid {
	m               : Movable,

	// m.cw() as a string
	cw              : () => string,

	// Load/render/unrender current chunk. All abstract.
	loadcc          : () => void,
	rendercc        : () => void,
	unrendercc      : () => void,

	// By default, m.move(); we allow it to be tweaked (cf. ViewTrBook)
	move            : (d : MoveDir, w : (MoveWhat|number)) => [number, number],

	// move() + render()
	moveandrender   : (d : MoveDir, w : (MoveWhat|number)) => void,

	// m.init() + render()
	updateandrender : (cs : Array<TokedChunk>, ic ?: number, iw ?: number) => void,
}
*/
/*
 * Abstract view containing DOM pointers to render
 * navigation button, alongside a textual description
 * of such buttons.
 */
/*
interface ViewWithNav extends ViewMovable {
	psrc  : HTMLElement,
	pnav  : HTMLElement,
	btns  : NavBtns,
	kmvs  : KMoves,
	skip ?: HTMLElement,
}

interface ViewSingleNav extends ViewMovable, ViewWithNav {
	loadhandlers : () => void,
}
*/

/*
 * Rendered moveable (psrc) on user provided input (pinput)
 */
/*
interface ViewIndex extends ViewMovable, ViewWithNav {
	pinput    : HTMLTextAreaElement, // We need .value, which is not on HTMLElement.
	panalyse  : HTMLElement,
	psearch   : HTMLElement,
	presults  : HTMLElement,

	// Expression being searched and displayed/to be displayed in
	// presults. This is mainly for bookmarking purposes.
	expr      : string,

	loadhandlers : () => void,
	loadexpr     : () => void,
	loadinput    : () => void,
}

interface ViewABook extends ViewMovable, ViewWithNav {
	book  : string, // book id/name

	// book related files to be downloaded
	getfns : () => Array<string>,

	pchap : HTMLElement,
	psec  : HTMLElement,
	pcn   : HTMLElement,
	ptoc  : HTMLElement,

	ptocb : HTMLElement,

	hlcw : () => void,
	llcw : () => void,

	preloadcc : () => void,
	doloadcc  : () => void,

	// XXX weird, typescript rejects, not sure why
	getccs   : () => string[], // [string, string],

	// current chapter/section (pchap/psec)
	renderchapsec : () => void,

	// chunk counter (pcn)
	rendercn : () => void,

	fetch : () => Promise<Array<string>>,

	handletoc    : () => void,

	loadbook     : (xs : Array<string>) => void,
	loadtoc      : () => void,
	loadhandlers : () => void,
}

interface ViewBook extends ViewABook {
	loadhandlers : () => void,
}
*/

/*
 * p[i][j]: there is a piece separator in the i-th chunk
 * at the j-th position.
 */
type Pieces = Array<Array<number>>

/*
interface ViewTrBook extends ViewABook {
	trcs   : Array<TokedChunk>,
	trpcs  : Pieces,
	srcpcs : Pieces,

	ptr    : HTMLElement,

	getcp    : () => [number, number],

	trcc     : (ic ?: number) => Chunk,

	pcut     : (p : Pieces, i : number) => any,
	pjoin    : (p : Pieces, i : number) => any,

	piecesok : () => boolean,

	hlps : () => void,
	hlcp : () => void,
	llcp : () => void,

	loadhandlers : () => void,
}
*/
/*
 * Formattable external link.
 */
interface Link {
	// Format string; format is described in modules/view/links.js
	fmt     : string

	// Link only available for single-character word
	single ?: boolean,

	// Link only available if we have a big5 version of this word/character
	big5   ?: boolean,
}

interface Links {
	[details: string] : Link,
}

interface Tab {
	// Generate HTML for given config/word
	mk  : (c : TabItmConf, S : VCutState) => HTMLElement,

	// Is there anything to display for given config/word?
	has : (c : TabItmConf, x : Token) => boolean,
}

/*
 * Preferences
 */

/*
 * The typechecking is a bit weak here; perhaps
 * this could be refined, but a basic sum type
 * is noisy to introduce.
 */
interface TabItmConf {
	// Tab (displayed) name
	name  : string,
	type  : TabType,

	// TabType = "decomp":
	//	which decomposition table to use?
	decomp  ?: string,

	// TabType = "dict":
	//	which dictionary to use?
	dict  ?: string,

	// TabType = "navdict":
	//	which dictionary to use? (dict)
	//	how should sub-tabs be configured (will default to main's values)
//	dict  ?: string,
	tabs  ?: Partial<TabsConf>,

	// TabType = "imgs":
	//	which imgs to use? (imgs)
	//	should we stop loading them once one has been found? (single)

	imgs   ?: Array<string>,
	single ?: boolean,

	// TabType = "links":
	//	which external links should be displayed?

	links ?: Array<string>,

	// TabType = DictsChain
	//	which dicts to use?
	dicts ?: Array<string>,

	// TabType = DecompsChain
	//	which decompositions tables to use (TODO; unused)
	decomps ?: Array<string>,
}

interface TabsWordConf {
	appendtext  ?: boolean,
	prependtext ?: boolean,
	single      ?: boolean,
	imgs         : Array<string>,
}

type TabItmsConf  = Array<TabItmConf>
type TabItmsConfs = Array<TabItmsConf>
type DefDispConf  = Array<string>

interface TabsConf {
	word           : TabsWordConf,
	defaultdisplay : DefDispConf,
	confs          : TabItmsConfs,
}

interface BookConf {
	tabs ?: TabsConf,
}

interface BooksConf { [details: string] : BookConf }

interface UserPrefs {
	fonts  : Array<string>,
	audio  : string,
	tabs   : TabsConf,
	books ?: BooksConf,
}

/*
 * Grid dumping for local caching.
 *
 * TODO: This should be deprecated.
 */
/*
interface DumpView {
	ic   : number,
	iw   : number,
	dump : DumpVcuts,
}

type DumpDecomp = [string, DumpVcuts];
type DumpData   = [string, DumpView|undefined];

interface DumpVcut {
	dec : DumpDecomp,
	dat : DumpData,
}

type DumpVcuts = Array<DumpVcut>;
*/

interface Stack {
	// Stack of currently displayed words in pstack
	xs  : Array<string>,

	// Current word (stack index) being rendered
	n : number,

	// Re-initialize the stack
	reset  : () => void,

	// Returns last word on the stack; undefined if stack
	// is empty.
	last : () => string|undefined,

	// Returns current word on the stack; undefined if stack
	// is empty.
	current : () => string|undefined,

	// Push a word on the stack if it's not already in last
	// position.
	push : (w : string) => boolean,

	// Execute f by going back in the stack until we found word w
	// No-op if w not found.
	findback : (w : string, f : (arg0 : number) => void) => void,

	// Delete pointed word from the stack.
	del : (w : string) => void,

	// Set .n by going through the stack until the given word is met
	backto : (w : string) => void,

	// Pop the stack until the given word is met
	popto : (w : string) => void,
}

/*
 * TODO
 */

// tabitms -> tabitm
interface States {
	[details: number] : number,
}

// tabitm -> [ic, iw]
interface CacheEntryIcIwTabItm {
	[details: number] : [number, number],
}

// tabitms -> tabitm -> [ic, iw]
interface CacheEntryIcIw {
	[details: number] : CacheEntryIcIwTabItm,
}

interface CacheEntry {
	// Currently active tabitms
	active : number,

	// number -> number: associate to each tabitms
	// the currently active tabitm
	states : States,

	// The ic/iw for each tabitm
	// (tabitms -> tabitm -> [ic, iw])
	iciw   : CacheEntryIcIw,
}

// word => state of the grid for that word
// (NOTE: Cache is already defined in lib.dom.d.ts)
interface GridCache {
	[details: string] : CacheEntry,
}

interface WithStack {
	// We always have a stack (mksingle(), mksinglenav())
	stack : Stack,
}

interface WithMove {
	// We always have a stack (mksingle(), mksinglenav())
	move : Movable,
}

interface WithTokens {
	// Tokens extracted from the current word in the stack
	// TODO: rename the field (s/ts/tokens/)
	ts    : Tokens,
}

interface WithToken {
	// Current token (in a vcut)
	tok   : Token,
}

interface WithStates {
	// TODO
	states : States,
}

interface UIBaseConf {
	//	true iff there's a higher stack in the DOM
	hasstack ?: boolean,

	//	defaults to User.prefs.tabs
	tabsconf ?: TabsConf,

	// Caching the state of the grid on a per-word basis.
	cache    ?: GridCache,
}

// UIBaseConf but with all fields mandatory
interface UIBaseState {
	// Configuration elements
	//	true iff there's a higher stack in the DOM
	hasstack : boolean,

	//	defaults to User.prefs.tabs
	tabsconf : TabsConf,

	// Caching the state of the grid on a per-word basis.
	cache    : GridCache,
}

interface SingleNavState extends UIBaseState, WithStack, WithMove, WithTokens {}

interface TranslatedBookState extends SingleNavState {
	trcs   : Array<TokedChunk>,
	trpcs  : Pieces,
	srcpcs : Pieces,
	book   : string,
}

interface BookState extends SingleNavState {
	book   : string,
}

interface IndexState extends SingleNavState, WithTokens {
	toanalyse  ?: string,
	tosearch   ?: string,
	tocontains ?: string,
}

// - the stack is needed in the vcuts because it will be
//   needed in the vcut: that's how we'll be able to push words
//   located e.g. in definition for inspection
// - the tokens correspond to all the tokens extracted from the current
//   word in the stack (?)
interface VCutsState extends UIBaseState, WithStack, WithTokens {}

interface SingleNavStateWithToken extends SingleNavState, WithToken {}

interface VCutState extends VCutsState, WithToken, WithStates {}

interface TabItmsState extends WithToken {
	// Configuration for the TabItms
	cs : TabItmsConf,

	// TabItms index (locally constant)
	i  : number,

	// TabItm index,
	j  : number,
}

interface TabItmsStates extends UIBaseState, WithStates, WithToken {
	// Currently active TabItms
	active : number,
}

interface HCutState extends TabItmsStates, WithStack, WithTokens {}
