function selectListener() {

	// 1. Get and sanitize selected range
	var selection = document.getSelection();
	// alert("Selection: " + selection);
	var range = selection.getRangeAt(0);
	if (range.startContainer.nodeType == Node.TEXT_NODE) {
		range.setStart(range.startContainer.parentElement, 0);
	}
	if (range.endContainer.nodeType == Node.TEXT_NODE) {
		if (range.endOffset == 0) {
			range.setEnd(range.endContainer.parentElement.previousElementSibling, 1);
		} else {
			range.setEnd(range.endContainer.parentElement, 1);
		}
	}
	var docFragment = range.cloneContents();
	var text = docFragment.textContent;
	if (text.length != 0) {
		alert('You selected: ' + text);
	}

	// 2. Get range in mathml formula
	var jax = MathJax.Hub.getJaxFor(range.startContainer);
	var sourceElt = jax.SourceElement();
	var outputElt = sourceElt.previousElementSibling;
	// alert('outputElt: ' + outputElt.textContent);
	var mrange = elementToMathmlWithRange(outputElt,range);
	var text = mrange.text;
	if (text.substr(0, "<math><mrow>".length) == "<math><mrow>") {
		text = text.replace("<math><mrow>", "<math>");
		text = text.replace("</mrow></math>", "</math>");
		mrange.text = text;
		mrange.start -= "<mrow>".length;
		mrange.end -= "<mrow>".length;
	}
	// text = text.substring(0, mrange.start) + "|" + text.substring(mrange.start, mrange.end) + "|" + text.substring(mrange.end, text.length);
	// alert("reconstructed formula: " + text);

	// 3. Get input for corrected formula
	var form = document.getElementById("correctionForm");
	button = document.createElement("input");
	button.setAttribute("type", "submit");
	button.setAttribute("value", "Submit");
	button.addEventListener('click', function(event) {
	    applyCorrection(sourceElt, mrange, event.target);
	}, false);
	form.appendChild(button);
}

function applyCorrection(sourceElt, mrange, button) {

	var mimeTypes = {MathML: "math/mml", TeX: "math/tex", AsciiMath: "math/asciimath"};
	var displayAttr = {MathML: " display='block'", TeX: "; mode=display", AsciiMath: ""};

	// alert("Correction applied to button " + button.attributes.getNamedItem("type").nodeValue);
	var form = button.parentNode;
	form.removeChild(button);
	var correctionText = form.elements["correction"].value;
	var type;
	var types = form.elements["inputType"];
	for (var i = 0; i < types.length; ++i) {
		if (types[i].checked) {
			type = types[i].value;
			break;
		}
	}
	// alert("Correction: " + correctionText + ", type: " + type);

	// allow for <math id="..."> and other attributes
	var mathEltString = sourceElt.innerHTML.substring(0,sourceElt.innerHTML.indexOf(">") + 1);
	var start = mrange.start - "<math>".length + mathEltString.length;
	var end = mrange.end - "<math>".length + mathEltString.length;

	var delScript = document.createElement("script");
	delScript.setAttribute("type","math/mml");
	delScript.innerHTML = "<math><mrow>" + sourceElt.innerHTML.substring(start, end) + "</mrow></math>";

	// todo: allow for different types
	var insScript = document.createElement("script");
	insScript.setAttribute("type", mimeTypes["MathML"]);
	var correctionMathml;
	if (type != "MathML") {
		correctionMathml = OtherToMathml(correctionText, mimeTypes[type], sourceElt);
		// allow for <math id="..."> and other attributes
		correctionText = correctionMathml.replace(/^<math.*>/,"").replace(/<\/math>$/,"");
	} else {
		if (correctionText.substr(0, "<math".length) != "<math") {
			correctionMathml = "<math><mrow>" + correctionText + "</mrow></math>";
		} else {
			correctionMathml = correctionText;
			correctionText = correctionMathml.replace(/^<math.*>/,"").replace(/<\/math>$/,"");
		}
	}
	insScript.innerHTML = correctionMathml;

	var oldScript = document.createElement("script");
	oldScript.setAttribute("type","math/mml");
	oldScript.innerHTML = sourceElt.innerHTML;

	var formula = sourceElt.innerHTML;
	var newFormula = formula.substring(0, start) + correctionText + formula.substring(end, formula.lenth);
	// MathJax.HTML.addText(messages, "new formula: " + newFormula);
	// MathJax.HTML.addElement(messages, "br");
	sourceElt.innerHTML = newFormula;

	var span = document.createElement("span");
	var text1 = document.createTextNode("(you replaced ");
	var text2 = document.createTextNode(" with ");
	var text3 = document.createTextNode("; your old formula is: ");
	var text4 = document.createTextNode(") ");
	span.appendChild(text1);
	span.appendChild(delScript);
	span.appendChild(text2);
	span.appendChild(insScript);
	span.appendChild(text3);
	span.appendChild(oldScript);
	span.appendChild(text4);

	var parent = sourceElt.parentNode;
	parent.insertBefore(span,sourceElt.previousElementSibling);

	MathJax.Hub.Update(parent);
}

function OtherToMathml(correctionText, mimeType, sourceElt) {
	var span = document.createElement("span");
	var insScript = document.createElement("script");
	insScript.setAttribute("type", mimeType);
	insScript.innerHTML = correctionText;
	span.appendChild(insScript);
	var parent = sourceElt.parentNode;
	parent.insertBefore(span,sourceElt.previousElementSibling);
	MathJax.Hub.Update(parent);
	var jax = MathJax.Hub.getAllJax(span)[0];
	correctionMathml = jax.root.toMathML();
	parent.removeChild(span);
	return correctionMathml;
}

function elementToMathmlWithRange(elt,range,mrange) {
	if (mrange == undefined) {
		mrange = {text: "", start: -1, end: -1};
	}
	if (elt.nodeType == Node.TEXT_NODE) {
		mrange.text += elt.data;
	} else if (elt.nodeType == Node.ELEMENT_NODE) {
		if (elt == range.startContainer) {
			mrange.start = mrange.text.length;
		}
		var className = elt.className;
		if (className != undefined && className != "" && className != "MathJax") {
			mrange.text += "<" + className + ">";
		}
		var children = elt.childNodes;
		for (var i = 0; i < children.length; ++i) {
			mrange = elementToMathmlWithRange(children[i],range,mrange);
		}
		if (className != undefined && className != "" && className != "MathJax") {
			mrange.text += "</" + className + ">";
		}
		if (elt == range.endContainer) {
			mrange.end = mrange.text.length;
		}
	}
	return mrange;
}
