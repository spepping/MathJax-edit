MathJax edit
============

MathJax-edit is a small Javascript application that allows you to mark
part of a MathML formula in an HTML page and apply a correction to it.

MathJax-edit depends on MathJax. It uses a slight modification of
MathJax, which marks inferred mrows in the HTML page.

MathJax-edit consists of two javascript files:

1. MathJax-edit.js, the core library. It takes a selection as input
and prepares it for modification. Then it takes a correction formula
as input and replaces the selected part with the correction.

2. call-mathjax-edit.js, an application of MathJax-edit.js. It
provides a button which, when pressed, reads the selected range. Then
it sets up a form in which the correction can be entered. Finally the
correction is applied to the selected range.

Sample page
===========

You may check editing of MathJax formulas in the sample page
sample1.html.

1. Open it in your browser.
2. Select part of a formula.
3. Press the button 'Modify selected range'.
4. Write a correction formula in the correction text box.
5. Click the radio button for your type of formula.
6. Press the button 'Apply correction'.

Quick start
===========

Call MathJax, MathJax-edit and call-mathjax-edit in your web page, as
follows:

	<script type="text/javascript"
			src="path/to/MathJax.js?config=TeX-MML-AM_HTMLorMML">
	</script>
	<script type="text/javascript" src="path/to/MathJax-edit.js"></script>
	<script type="text/javascript" src="path/to/call-mathjax-edit.js"></script>

Edit 'path/to/' to match the paths to your scripts. Make sure you use
the modified version of MathJax (or make sure that your formulas
explicitly contain all mrows).

All formulas in your web page should be in MathML.

For debugging purposes you may set verbose mode as follows:

	<script type="text/javascript">callMathJaxCorrection.setVerbose(true)</script>

Writing your own application
============================

Consult the documentation for the API of MathJax-edit. Consult
call-mathjax-edit.js and its documentation as an example.

1. Create a MathJaxCorrection object:
   var correction = new MathJaxCorrection().
2. Let the object read the selection: correction.readSelection().
3. Let the object apply the correction:
   correction.applyCorrection(correctionText, correctionType), where
   correctionText is the text of the correction formula.
4. Ask MathJax to rerender the corrected formula:
   MathJax.Hub.Update(ancestor), where ancestor is any ancestor
   containing the corrected formula.
