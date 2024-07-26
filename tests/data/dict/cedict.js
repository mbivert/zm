let TestsCEDict = (function() {

let tests = [
	/*
	 * NOTE: we used to parse the dict in two steps, a first one transforming
	 * the dict as an array, and a second one reducing it to a hash.
	 *
	 * There is still two series of tests with overlaps because of that.
	 *
	 * We've also skipped undefined ParseError for clarity.
	 */
	{
		f        : CEDict.parseline,
		args     : [[{}], "# 蘭 兰 [Lan2] /surname Lan/abbr. for Lanzhou 蘭州|兰州[Lan2 zhou1], Gansu/"],
		expected : [{}],
		descr    : "Commented lines are ignored"
	},
	{
		f        : CEDict.parseline,
		args     : [[{}], "\t # 蘭 兰 [Lan2] /surname Lan/abbr. for Lanzhou 蘭州|兰州[Lan2 zhou1], Gansu/"],
		expected : [{}],
		descr    : "Commented lines are ignored (bis)"
	},
	{
		f        : CEDict.parseline,
		args     : [[{}], ""],
		expected : [{}],
		descr    : "Empty lines are ignored"
	},
	{
		f        : CEDict.parseline,
		args     : [[{}], "\t\t  "],
		expected : [{}],
		descr    : "Empty lines are ignored (bis)",
	},
	{
		f        : CEDict.parseline,
		args     : [[{}], "蘭 兰 [Lan2] /Surname", 3],
		expected : [{}, [3, "Invalid dict entry, not slash terminated: 蘭 兰 [Lan2] /Surname"]],
		descr    : "Entries must be slash terminated"
	},

	// second series of tests starts here
	{
		f        : CEDict.parseline,
		args     : [[{}], "蘭 兰 [Lan2] /surname Lan/abbr. for Lanzhou 蘭州|兰州[Lan2 zhou1], Gansu/"],
		expected : [{
			"蘭" : {
				"Lan2" : [{
					rm : false,
					ds : ["surname Lan", "abbr. for Lanzhou 蘭州[Lan2 zhou1], Gansu"],
				}],
			},
		}, undefined],
		descr    : "Basic line reading: simplified Chinese has been dropped"
	},
	{
		f        : CEDict.parseline,
		args     : [[{}], "+邑 邑 [yi4] /city/village/"],
		expected : [{
			"邑" : {
				"yi4" : [{
					rm : false,
					ds : ["city", "village"],
				}],
			}
		}, undefined],
		descr    : "Tweaked entry"
	},
	{
		f        : CEDict.parseline,
		args     : [[{
			"疋" : {
				"pi3" : [{
					rm : false,
					ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"],
				}],
			},
		}], "匹 匹 [pi1] /mate/one of a pair/"],
		expected : [{
			"疋" : {
				"pi3" : [{
					rm : false,
					ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"],
				}],
			},
			"匹" : {
				"pi1" : [{
					rm : false,
					ds : ["mate", "one of a pair"],
				}]
			},
		}, undefined],
		descr    : "New entry added in non-empty accumulator"
	},
	{
		f        : CEDict.parseline,
		args     : [[{
			"疋" : {
				"pi3" : [{
					ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]
				}],
			},
			"匹" : {
				"pi1" : [{
					ds : ["mate", "one of a pair"],
				}],
			},
		}, undefined], "匹 匹 [pi3] /classifier for horses, mules etc/ordinary person/classifier for cloth: bolt/"],
		expected : [{
			"疋" : {
				"pi3" : [{
					ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]
				}],
			},
			"匹" : {
				"pi1" : [{
					ds : ["mate", "one of a pair"],
				}],
				"pi3" : [{
					rm : false,
					ds : ["classifier for horses, mules etc", "ordinary person", "classifier for cloth: bolt"],
				}],
			},
		}, undefined],
		descr    : "New entry added to existing character"
	},
	// NOTE: we used to perform data patching here; this is now performed
	// inline in the front. Tests have nevertheless been kept, at least to
	// illustrate current behavior.
	{
		f        : CEDict.parseline,
		args     : [[{
			"疋" : {
				"pi3" : [{ ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"] },],
			},
		}], "-疋 匹 [pi3] /variant of 匹[pi3]/classifier for cloth: bolt/"],
		expected : [{
			"疋" : {
				"pi3" : [
					{ ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]            },
					{ ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"], rm : true },
				],
			},
		}, undefined],
		descr    : "Entry deleted"
	},
	{
		f        : CEDict.parseline,
		args     : [[{
			"疋" : {
				"pi3" : [{
					ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]
				}],
			},
		}], "-疋 匹 [pi3] /variant of 匹[pi3]/classifier for cloth:/"],
		expected : [{
			"疋" : {
				"pi3" : [
					{ ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]           },
					{ ds : ["variant of 匹[pi3]", "classifier for cloth:"],     rm : true },
				],
			},
		}, undefined],
		descr    : "This used to be an error (patching not performed here anymore)"
	},
	{
		f        : CEDict.parseline,
		args     : [[{}], "-疋 匹 [pi3] /variant of 匹[pi3]/classifier for cloth:/"],
		expected : [{
			"疋" : {
				"pi3" : [
					{ ds : ["variant of 匹[pi3]", "classifier for cloth:"], rm : true },
				],
			},
		}, undefined],
		descr    : "This used to be a patching error (now tolerated)"
	},
	{
		f        : CEDict.parseline,
		args     : [[{
			"疋" : {
				"pi3" : [{
					ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"]
				}],
			},
		}],"-疋 匹 [pi3] /variant of 匹[pi3]/"],
		expected : [{
			"疋" : {
				"pi3" : [
					{ ds : ["variant of 匹[pi3]", "classifier for cloth: bolt"] },
					{ ds : ["variant of 匹[pi3]" ], rm : true },
				],
			},
		}, undefined],
		descr    : "Partial deletion (is now not really happening)"
	},
	{
		f        : CEDict.parseline,
		args     : [[{
			"唫" : {
				"yin2" : [{
					ds : ["old variant of 吟[yin2]"],
				}],
			},
		}], "唫 唫 [yin2] /variant of 崟[yin2]/"],
		expected : [{
			"唫" : {
				"yin2" : [
					{ ds : ["old variant of 吟[yin2]"],            },
					{ ds : ["variant of 崟[yin2]"],     rm : false },
				],
			},
		}, undefined],
		descr    : "Can add definition to existing entries (used to be patched)"
	},

	/*
	 * rmmodernrefs()
	 */
	{
		f        : CEDict.rmmodernrefs,
		args     : [["蘭 兰 [Lan2] /Surname/"]],
		expected : ["蘭 兰 [Lan2] /Surname/"],
		descr    : "No modern ref: ~id()"
	},
	{
		f        : CEDict.rmmodernrefs,
		args     : [["蘭 兰 [Lan2] /abbr. for Lanzhou 蘭州[Lan2 zhou1], Gansu/"]],
		expected : ["蘭 兰 [Lan2] /abbr. for Lanzhou 蘭州[Lan2 zhou1], Gansu/"],
		descr    : "No modern ref: ~id()"
	},
	{
		f        : CEDict.rmmodernrefs,
		args     : [["蘭 兰 [Lan2] /abbr. for Lanzhou 蘭州|兰州[Lan2 zhou1], Gansu/"]],
		expected : ["蘭 兰 [Lan2] /abbr. for Lanzhou 蘭州[Lan2 zhou1], Gansu/"],
		descr    : "Modern ref is removed"
	},
	{
		f        : CEDict.rmmodernrefs,
		args     : [["月 月 [yue4] /moon/month/monthly/CL:個|个[ge4],輪|轮[lun2]/"]],
		expected : ["月 月 [yue4] /moon/month/monthly/CL:個[ge4],輪[lun2]/"],
		descr    : "Modern refs are all removed (/g/lobal subst)"
	},

	/*
	 * CEDict.clean()
	 */
	{
		f        : CEDict.clean,
		args     : [{
			"吾"    : "[Wu2] surname Wu//[wu2] I/my (old)",
			"寧"    : "[ning2] peaceful/to pacify/to visit (one's parents etc)",
			"悃"    : "[kun3] sincere",
			"款款"  : "[kuan3 kuan3] leisurely/sincerely",
			"款"    : "[kuan3] section/paragraph/funds",
			"朴"    : "[pu3] plain and simple",
			"以"    : "[yi3] to use/by means of/according to/in order to",
			"忠"    : "[zhong1] loyal/devoted/honest",
			"乎"    : "[hu1] in/at/from/because/than",
			"P"     : "[P] /(slang) femme (lesbian stereotype)/to photoshop/",
			"T"     : "[T] /(slang) butch (lesbian stereotype)/",
			"V溝"   : "[V gou1] /low neckline that reveals the cleavage/décolleté/gully/",
			"三K黨" : "[San1 K dang3] /Ku Klux Klan/KKK/",
			"三P"   : "[san1 P] /(slang) threesome/",
		}],
		expected : {
			"吾"   : "[Wu2] surname Wu//[wu2] I/my (old)",
			"寧"   : "[ning2] peaceful/to pacify/to visit (one's parents etc)",
			"悃"   : "[kun3] sincere",
			"款款" : "[kuan3 kuan3] leisurely/sincerely",
			"款"   : "[kuan3] section/paragraph/funds",
			"朴"   : "[pu3] plain and simple",
			"以"   : "[yi3] to use/by means of/according to/in order to",
			"忠"   : "[zhong1] loyal/devoted/honest",
			"乎"   : "[hu1] in/at/from/because/than",
		},
		descr    : "Useless entries removed",
	},
];

return { "tests" : tests };

})();
