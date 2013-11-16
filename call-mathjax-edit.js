/**
 * MathJax-edit/call-mathjax-edit.js
 *
 * An application of the MathJax-edit functionality, defines the CallMathJaxCorrection class.
 * Usage:
 * <script type="text/javascript"
 *         src="MathJax/MathJax.js?config=TeX-MML-AM_HTMLorMML">
 * </script>
 * <script type="text/javascript" src="MathJax-edit.js"></script>
 * <script type="text/javascript" src="call-mathjax-edit.js"></script>
 * optionally switch on verbose mode:
 * <script type="text/javascript">callMathJaxCorrection.verbose=true</script>
 *
 * This software is free software; you may redistribute it and/or modify it under the terms
 * of the GNU General Public License as published by the Free Software Foundation Version 2,
 * June 1991, aka "copyleft" or the GPL.
 *
 * This software is distributed in the hope that it will be useful, but without any warranty;
 * without even the implied warranty of merchantability or fitness for a particular purpose.
 * See the GNU General Public License for more details.
 *
 * Along with this software you should have received a copy of the GNU General
 * Public License. If not, see http://www.gnu.org/licenses/old-licenses/gpl-2.0.html.
 *
 * MathJax-edit, Copyright © 2012-2013 Simon Pepping,
 * License: GNU General Public License Version 2, June 1991.
 *
 * $Format:%an %ai$
 */

/**
 * Represents a MathJaxCorrection call
 * @constructor
 * @property {boolean} verbose The verbosity
 * @param {boolean} verbose Set the verbosity
 * @access public
 */
function CallMathJaxCorrection(verbose) {
	this.verbose = verbose;
}

/**
 * mime types
 * @enum {MathJaxCorrection.MathJaxMimeTypes}
 * @access private
 * @readonly
 */
CallMathJaxCorrection.mathJaxMimeTypes
	= {MathML: MathJaxCorrection.MathJaxMimeTypes.MATHML,
	   TeX: MathJaxCorrection.MathJaxMimeTypes.TEX,
	   AsciiMath: MathJaxCorrection.MathJaxMimeTypes.ASCIIMATH};

/**
 * Reset the correction dialog
 * @method
 * @property {MathJaxCorrection} correction
 * @property {Element} correctionWrapper
 * @property insScript {Element} the insertion script
 * @property oldScript {Element} the old script
 * @property delScript {Element} the deletion script
 * @access private
 */
CallMathJaxCorrection.prototype._reset = function() {
	this.correction = undefined;
	this.correctionWrapper = undefined;
	this.insScript = null;
	this.oldScript = null;
	this.delScript = null;
}

/**
 * The CallMathJaxCorrection object that manages the HTML page and its corrections
 * @type {CallMathJaxCorrection}
 * @access public
 */
var callMathJaxCorrection = new CallMathJaxCorrection(false);

/**
 * Set up the form to activate reading the selection
 * @method
 * @access private
 */
CallMathJaxCorrection.prototype.setup = function() {
	this._reset();
	var formId = "correctionForm";
	var form = document.getElementById(formId);
	if (form == undefined) {
		form = document.createElement("form");
		form.setAttribute("id", formId);
		form.setAttribute("action", "#");
		var bodies = document.getElementsByTagName("body");
		var body = bodies[0];
		body.appendChild(form);
	}
	var button = document.createElement("button");
	button.setAttribute("type", "button");
	var c = this;
	button.addEventListener('click', function(event) {
		c.selectListener(event.target);
	}, false);
	button.appendChild(document.createTextNode("Modify selected range"));
	form.appendChild(button);
}

/**
 * Call setup in the onload event
 */
window.addEventListener("load", function(){callMathJaxCorrection.setup()});

/**
 * Setter for verbose
 * @method
 * @param verbose
 * @access public
 */
CallMathJaxCorrection.prototype.setVerbose = function(verbose) {
	this.verbose = verbose;
}

/**
 * Setter for correction
 * @param correction
 * @method
 * @access private
 */
CallMathJaxCorrection.prototype.setCorrection = function(correction) {
	this.correction = correction;
}

/**
 * Setter for correctionWrapper
 * @param correctionWrapper
 * @method
 * @access private
 */
CallMathJaxCorrection.prototype.setCorrectionWrapper = function(correctionWrapper) {
	this.correctionWrapper = correctionWrapper;
}

/**
 * Setter for insScript
 * @param insScript
 * @method
 * @access private
 */
CallMathJaxCorrection.prototype.setInsScript = function(insScript) {
	this.insScript = insScript;
}

/**
 * Setter for oldScript
 * @param odlScript
 * @method
 * @access private
 */
CallMathJaxCorrection.prototype.setOldScript = function(oldScript) {
	this.oldScript = oldScript;
}

/**
 * Setter for delScript
 * @param delScript
 * @method
 * @access private
 */
CallMathJaxCorrection.prototype.setDelScript = function(delScript) {
	this.delScript = delScript;
}

/**
 * The selectListener
 * @method
 * @param button {Button} the activating button
 * @access private
 */
CallMathJaxCorrection.prototype.selectListener = function(button) {

	// 1. Get and sanitize selected range
	this.setCorrection(new MathJaxCorrection());
	try {
		this.correction.readSelection();
	} catch(e) {
		alert(e.message);
		return;
	}

	var form = button.parentNode;
	form.removeChild(button);

	// highlight the range, so that it remains visible when the user writes the correction
	var range = document.getSelection().getRangeAt(0);
	this.setCorrectionWrapper(document.createElement("span"));
	this.correctionWrapper.setAttribute("id", "callMathJaxCorrectionWrapper");
	this.correctionWrapper.style.background = "yellow";
	this.correctionWrapper.appendChild(range.extractContents());
	range.insertNode(this.correctionWrapper);

	if (this.verbose) {
		alert('You selected: ' + this.correction.getSelectedText());
		alert("reconstructed formula: " + this.correction.getReconstructedFormula());
		alert('Reconstructed selection: ' + this.correction.getSelectedFormula());
		alert('Your selection was expanded to: ' + this.correction.getExpandedSelectedText());
	}
	
	// 5. Get input for corrected formula
	this.buildCorrectionForm(form);
}

/**
 * Build the correction form
 * @method
 * @param {Element} form The form to reuse
 * @access private
 */
CallMathJaxCorrection.prototype.buildCorrectionForm = function(form) {
	var correctionForm = new CorrectionForm(form);
	correctionForm.createTextArea("correction", 4, 30);
	correctionForm.createLineBreak();
	correctionForm.createRadioButton("AsciiMath", true);
	correctionForm.createText("AsciiMath ");
	correctionForm.createRadioButton("TeX");
	correctionForm.createText("TeX ");
	correctionForm.createRadioButton("MathML");
	correctionForm.createText("MathML");
	correctionForm.createLineBreak();
	var c = this;
	correctionForm.createButton("Apply correction", function(event) {
	    c.applyCorrection(event.target);
	}, false);
	correctionForm.createText(" ");
	correctionForm.createButton("Cancel", function(event) {
	    c.cancelCorrection(event.target);
	}, false);
}

/**
 * Wraps a form with a specific behaviour
 * @constructor
 * @param {Element} form The wrapped form
 * @access private
 */
function CorrectionForm(form) {
	this.form = form;
}

/**
 * Create the text area
 * @method
 * @param id {string} the text area ID
 * @param numRows {int} the number of rows
 * @param numCols {int} the number of columns
 * @access private
 */
CorrectionForm.prototype.createTextArea = function(id, numRows, numCols) {
	var element = document.createElement("textarea");
	element.setAttribute("id", id);
	element.setAttribute("rows", numRows);
	element.setAttribute("cols", numCols);
	this.form.appendChild(element);
}

/**
 * Create a linebreak
 * @method
 * @access private
 */
CorrectionForm.prototype.createLineBreak = function() {
	element = document.createElement("br");
	this.form.appendChild(element);
}

/**
 * Create a radio button
 * @method
 * @param value {string} the value
 * @param checked {boolean} whether the button is checked
 * @access private
 */
CorrectionForm.prototype.createRadioButton = function(value, checked) {
	element = document.createElement("input");
	element.setAttribute("type", "radio");
	element.setAttribute("name", "inputType");
	element.setAttribute("value", value);
	if (checked) {
		element.setAttribute("checked", "true");
	}
	this.form.appendChild(element);
}

/**
 * Create a text node
 * @method
 * @param text {string} the text
 * @access private
 */
CorrectionForm.prototype.createText = function(text) {
	element = document.createTextNode(text);
	this.form.appendChild(element);
}

/**
 * Create a button
 * @method
 * @param value {string} the value
 * @param clickEventListener {function} the click event listener
 * @param b {boolean} 
 * @access private
 */
CorrectionForm.prototype.createButton = function(value, clickEventListener, b) {
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("value", value);
	button.addEventListener('click', clickEventListener, b);
	this.form.appendChild(button);
}

/**
 * Apply the correction and update the document;
 * show verbose information if verbose=true;
 * reset the form for a new selection
 * @method
 * @param button {Button} the button that activated the event
 * @access private
 */
CallMathJaxCorrection.prototype.applyCorrection = function(button) {

	// alert("Correction applied to button " + button.attributes.getNamedItem("type").nodeValue);
	var form = button.parentNode;
	var correctionTextAndType = CallMathJaxCorrection.readAndRemoveForm(form);

	try {
		this.correction.applyCorrection(correctionTextAndType.correctionText,
						CallMathJaxCorrection.mathJaxMimeTypes[correctionTextAndType.type]);
	} catch(e) {
		alert(e.message);
		return;
	}
	while (form.childNodes.length != 0) {
		form.removeChild(form.firstChild);
	}

	if (this.verbose) {
		try {
			// Correction piece
			this.setInsScript(document.createElement("script"));
			this.insScript.setAttribute("type", MathJaxCorrection.MathJaxMimeTypes.MATHML);
			var serializer = new XMLSerializer();
			var text = serializer.serializeToString(this.correction.getCorrectionDoc());
			this.insScript.innerHTML = text;
		
			// old formula
			this.setOldScript(document.createElement("script"));
			this.oldScript.setAttribute("type", MathJaxCorrection.MathJaxMimeTypes.MATHML);
			this.oldScript.innerHTML = this.correction.getOriginalFormulaHTML();
		
			// deleted piece and corrected formula
			this.setDelScript(document.createElement("script"));
			this.delScript.setAttribute("type", MathJaxCorrection.MathJaxMimeTypes.MATHML);
			var serializer = new XMLSerializer();
			var text = serializer.serializeToString(this.correction.getDeletedDoc());
			this.delScript.innerHTML = text;
		} catch(e) {
			alert(e.message);
		}
	}

	this.updateDocument();

	this.setup();
}

/**
 * Read the form
 * @method
 * @param {Element} form The form to be read
 * @access private
 */
CallMathJaxCorrection.readAndRemoveForm = function(form) {
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
	return {correctionText: correctionText, type: type};
}

/**
 * Update the document with the corrected formula;
 * show verbose information if available
 * @method
 * @access private
 */
CallMathJaxCorrection.prototype.updateDocument = function() {
	var span = null;
	if (this.delScript != null && this.insScript != null && this.oldScript != null) {
		var span = document.createElement("span");
		var text1 = document.createTextNode("(you replaced ");
		var text2 = document.createTextNode(" with ");
		var text3 = document.createTextNode("; your old formula is: ");
		var text4 = document.createTextNode(") ");
		span.appendChild(text1);
		span.appendChild(this.delScript);
		span.appendChild(text2);
		span.appendChild(this.insScript);
		span.appendChild(text3);
		span.appendChild(this.oldScript);
		span.appendChild(text4);
	}
		
	var sourceScript = this.correction.getSourceScript();
	var parent = sourceScript.parentNode;
	if (span != null) {
		parent.insertBefore(span,sourceScript.previousElementSibling);
	}

	MathJax.Hub.Update(parent);
}

/**
 * Cancel the correction and reset the form for a new selection
 * @method
 * @param button {Button} the button that activated the event
 * @access private
 */
CallMathJaxCorrection.prototype.cancelCorrection = function(button) {
	// alert("Correction applied to button " + button.attributes.getNamedItem("type").nodeValue);
	var form = button.parentNode;
	while (form.childNodes.length != 0) {
		form.removeChild(form.firstChild);
	}
	var parent = this.correctionWrapper.parentNode;
	while (this.correctionWrapper.childNodes.length != 0) {
		parent.insertBefore(this.correctionWrapper.firstChild, this.correctionWrapper);
	}
	parent.removeChild(this.correctionWrapper);
	this.setup();
}