var Node = require('../modules/node.js');

eval(Node.readf("./site/base/full.js").toString());

console.log(ViewAbout.mkdata());
