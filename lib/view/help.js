var ViewHelp = (function() {

/**
 * @returns{HTMLElement}
 */
function mk() {
	let p = View.mkhelp();
	p.classList.add("main-help");

	// That's clumsy :shrug:
	document.body.style.height   = "unset";
	document.body.style.overflow = "unset";

	document.getElementsByTagName("html")[0].style.height   = "unset";
	document.getElementsByTagName("html")[0].style.overflow = "unset";
	return p;
}


/**
 * @returns{HTMLElement}
 */
return {
	"mk" : mk,
};

})();
