import * as Move     from '../modules/move.js'
import * as Markdown from '../modules/data/book/markdown.js'
import * as Utils    from '../modules/utils.js'
import * as Data     from '../modules/data.js'

import { MoveWhat, MoveDir } from '../modules/enums.js'

/** @type{Movable} */
var m = Move.mk();

/** @type{(s : string, d : string) => void} */
function init(s, d) {
	Data.mktdicts({});
	m.init(Data.parseandtok(s));
}

/**
 * Effectively move m by altering its state.
 *
 * @type{Movable["move"]}
 */
function move(d, w) {
	var [jc, jw] = m.move(d, w);
	if (jc != -1) [m.ic, m.iw] = [jc, jw];
	return [jc, jw];
}

/**
 * Convenient shortcut to perform multiple consecutive
 * movements on m.
 *
 * @type{(xs : Array<[MoveDir, MoveWhat|number]>) => [number, number]}
 */
function manymove(xs) {
	var [jc, jw] = [-1, -1]
	for (var i = 0; i < xs.length; i++)
		[jc, jw] = move(xs[i][0], xs[i][1]);
	return [jc, jw];
}

var tests = [
	/*
	 * Movable.move()
	 */
	{
		f        : init,
		args     : ["Hello, world!", ""],
		expected : undefined,
		descr    : "Basic initialisation",
	},
	{
		f        : move,
		args     : [MoveDir.Prev, MoveWhat.Word],
		expected : [0, 0],
		descr    : "Can't move more backward.",
	},
	{
		f        : move,
		args     : [MoveDir.Next, MoveWhat.Word],
		expected : [0, 2],
		descr    : "One word forward; punct is skipped",
	},
	{
		f        : m.movep,
		args     : [MoveDir.Next, function() { return true; }, 0, 0],
		expected : [0, 1],
		descr    : "Simulating a move forward from the start (not using M.ic/iw)",
	},
	{
		f        : move,
		args     : [MoveDir.Next, MoveWhat.Word],
		expected : [0, 2],
		descr    : "Can't move beyond last punct",
	},
	{
		f        : move,
		args     : [MoveDir.Prev, MoveWhat.Word],
		expected : [0, 0],
		descr    : "Going back to the start",
	},
	{
		f        : init,
		args     : ["# Chapter title!\n\nHello, world!\n\nIn a third chunk", ""],
		expected : undefined,
		descr    : "Initialized with 3 chunks",
	},
	{
		f        : move,
		args     : [MoveDir.Next, MoveWhat.Chunk],
		expected : [1, 0],
		descr    : "At start of second chunk",
	},
	{
		f        : move,
		args     : [MoveDir.Next, MoveWhat.Chunk],
		expected : [2, 0],
		descr    : "At start of third chunk",
	},
	{
		f        : move,
		args     : [MoveDir.Prev, MoveWhat.Chunk],
		expected : [1, 2],
		descr    : "Going back at end of previous chunk; ending punct skipped",
	},
	{
		f        : move,
		args     : [MoveDir.Next, MoveWhat.Title],
		expected : [1, 2],
		descr    : "There's no following chapter",
	},
	{
		f        : move,
		args     : [MoveDir.Prev, MoveWhat.Title],
		expected : [0, 2],
		descr    : "But there's one before; ending punct skipped",
	},
	{
		f        : move,
		args     : [MoveDir.Offset, 0],
		expected : [0, 0],
		descr    : "Moving to said offset within current chunk",
	},
	{
		f        : move,
		args     : [MoveDir.Offset, 3],
		expected : [0, 0],
		descr    : "First word still covers the given offset",
	},
	{
		f        : move,
		args     : [MoveDir.Offset, 8],
		expected : [0, 2],
		descr    : "Offset in second word, which is a punct, thus moving forward",
	},
	{
		f        : move,
		args     : [MoveDir.Offset, 9001],
		expected : [0, 2],
		descr    : "Offset too large: move to chunk's last word",
	},
	{
		f        : manymove,
		args     : [[[MoveDir.Next, MoveWhat.Chunk], [MoveDir.Next, MoveWhat.Chunk]]],
		expected : [2, 0],
		descr    : "Moving two chunks ahead",
	},
	// used to crash.
	{
		f        : move,
		args     : [MoveDir.Offset, 17],
		expected : [2, 6],
		descr    : "Moving to offset at the end of last word of the last chunk",
	},

	/*
	 * NOTE: We could test deeper (e.g. section, subsection).
	 * Also, we're not directly testing piece movements as it's
	 * implemented over offset movement.
	 */
];

export { tests };
