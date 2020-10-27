/* 
C Daniel Vale 2020. All rights reserved.
*/

"use strict";

const br = "<br>"
// var rows = 0;

// Form data
var testPatternWidthInStitches = NaN;
var testPatternWidthMeasure = NaN;
var testPatternLengthInRows = NaN;
var testPatternLengthMeasure = NaN;
var testPatternYarnUsed = NaN;
var testPatternYarnUsedGrams = NaN;
var shape = "";

// calculate ratios from the test pattern
var stitchesPerCm = NaN;
var rowsPerCm = NaN;
var stitchLengthToWidthRatio = NaN;
var testPatternTotalStitches = NaN;
var testPatternYarnPerStitch = NaN;
	

function load() {
	console.log("loaded");
	
	// hide the pattern
	let patternPanel = document.getElementById("pattern");
	patternPanel.style.display = "none";
	
	// show settings for the default shape
	showSettings();
}


// a generalisation of the ellipse/ellipsoid/cone functions
function generateRoundThings(patternStart, startStitches, lastStartRowStitches, rows, targetCircumfrence, getRowCircumfrenceInCm) {
	console.log("generate round thing");
	
	let pattern = patternStart;
	
	let previousRowStitches = lastStartRowStitches;
	let totalStitches = startStitches;
	let targetIncrementStitches = 0; // two stitches into one previous row stitch
	let targetSingleCrochetStitches = 0;
	let targetDecrementStitches = 0; // one stitch into two previous row stitches
	let targetSteps = 0; // a double crochet (inc) counts as one step and two stitches
	let stitchesPerStep = 1; // >1 to grow, <1 to shrink
	// A 'seam' or 'dart' occurs where the double or decrementing stitches run from row to row
	// to prevent this we manage the distance between these stitches so they never appear together.
	let seamSpread = 9999; // no seam until calculated. This is the ratio of steps to doubles (inc/dec).
	let seamSpreadPrevRow = previousRowStitches * 2;
	let seamAdjust = 0; // this is the number of sc to insert at the start of the row
	let prevSeamAdjust = 0;
	let startRow = 2;
	if (startStitches > 6) startRow = 3;
	for (let i = startRow; i < rows; i++) {
		let targetStitch = 0;
		let step = 0;
		let stitch = 0;
		// determine the circumfrence of this row
		let rowCircumfrenceInCm = getRowCircumfrenceInCm(i, rows, targetCircumfrence);
		//console.log("row "+i+" circumfrence "+rowCircumfrenceInCm+" cm");
		let rowCircumfrenceInStitches = Math.round(rowCircumfrenceInCm * stitchesPerCm);
		totalStitches += rowCircumfrenceInStitches
		// show row and stitches in this row
		let rowPattern = new CPattern();
		if (previousRowStitches < rowCircumfrenceInStitches)
		{
			// incrementing
			targetIncrementStitches = rowCircumfrenceInStitches - previousRowStitches;
			targetSingleCrochetStitches = previousRowStitches - targetIncrementStitches;
			targetSteps = targetIncrementStitches + targetSingleCrochetStitches;
			stitchesPerStep = rowCircumfrenceInStitches / targetSteps;
			
            // to prevent darting, rotate the inc/dec over three rows
			seamSpread = targetSteps / targetIncrementStitches;
            if (seamSpread >= 3) {
                seamAdjust = Math.round((seamSpread / 3) * (i % 3));
            } else {
				// or over two rows if every other stitch is in/dec 
                seamAdjust = Math.round((seamSpread / 2) * (i % 2));
            }
            
            // prevent accidental alignment caused by a combination of rotation and a change in stitchSpread (eg when going  from 3 steps to 2 steps near the circumference)
			// this should only occure near the ends, when the number of stitches in the row is small
			
            if (seamAdjust == prevSeamAdjust) {
				if (seamAdjust > 1) {
					seamAdjust--;
				} else {
					seamAdjust++;
				}
            }
			
			// prevent a seam adjustment > the number of sc in the row
			if (seamAdjust > targetSingleCrochetStitches) {
				seamAdjust = targetSingleCrochetStitches;
			}
			
			// do the seam adjustment
			// pattern += " % " + Math.round(10*seamSpread)/10 + " % " + Math.round(10*seamAdjust)/10 + " % ";
            if (seamAdjust >= 1) {
                for (let j = 1; j <= seamAdjust; j++)  {
					step++;
					targetStitch++;// += stitchesPerStep; // to prevent bunching, don't add the full stitchesPerStep
					rowPattern.PushStitch("sc");
					stitch++;
				}
            }

			

			while (stitch < rowCircumfrenceInStitches) {
				step++;
				targetStitch += stitchesPerStep;
				if (targetStitch > stitch + 1.01) {
					stitch += 2;
					rowPattern.PushStitch("inc");
				} else {
					stitch++;
					rowPattern.PushStitch("sc");
				}
			}			

		} else if (previousRowStitches == rowCircumfrenceInStitches) {
			// just single crochet
			for (let j = 1; j <= rowCircumfrenceInStitches; j++) 
				rowPattern.PushStitch("sc");
		} else {
			// decrementing
			targetDecrementStitches = previousRowStitches - rowCircumfrenceInStitches;
			targetSingleCrochetStitches = rowCircumfrenceInStitches - targetDecrementStitches;
			
			seamSpread = targetDecrementStitches / targetSingleCrochetStitches;

			targetSteps = targetDecrementStitches + targetSingleCrochetStitches;
			stitchesPerStep = previousRowStitches / targetSteps;
			
			
			
            // to prevent darting, rotate the inc/dec over three rows
			seamSpread = targetSteps / targetDecrementStitches;
            if (seamSpread >= 3) {
                seamAdjust = Math.round((seamSpread / 3) * (i % 3));
            } else {
				// or over two rows if every other stitch is in/dec 
                seamAdjust = Math.round((seamSpread / 2) * (i % 2));
            }
            
            // prevent accidental alignment caused by a combination of rotation and a change in stitchSpread (eg when going  from 3 steps to 2 steps near the circumference)
			// this should only occure near the ends, when the number of stitches in the row is small
			
            if (seamAdjust == prevSeamAdjust) {
				if (seamAdjust > 1) {
					seamAdjust--;
				} else {
					seamAdjust++;
				}
            }
			
			// prevent a seam adjustment > the number of sc in the row
			if (seamAdjust > targetSingleCrochetStitches) {
				seamAdjust = targetSingleCrochetStitches;
			}
			
			// do the seam adjustment
			//pattern += " % " + Math.round(10*seamSpread)/10 + " % " + Math.round(10*seamAdjust)/10 + " % ";
            if (seamAdjust >= 1) {
                for (let j = 1; j <= seamAdjust; j++)  {
					step++;
					targetStitch++;// += stitchesPerStep; // to prevent bunching, don't add the full stitchesPerStep
					rowPattern.PushStitch("sc");
					stitch++;
				}
            }			
			
			
			
			while (step < targetSteps) {
				step += 1;
				targetStitch += stitchesPerStep;
				if (targetStitch > stitch + 1.01) {
					stitch += 2;
					rowPattern.PushStitch("dec");
				} else {
					stitch += 1;
					rowPattern.PushStitch("sc");
				}
			}	


		}
		
		pattern += 
			`<div id="row-${i}" class="pattern-row" progress="none" onclick="focusRow(event)">
			row ${i}: `;
			
		// pattern +=	" | " + rowCircumfrenceInStitches;
		pattern += rowPattern.GetPattern() + br;
		pattern += "</div>";		
		
		// setup for next row
		previousRowStitches = rowCircumfrenceInStitches;
		seamSpreadPrevRow = seamSpread;
		prevSeamAdjust = seamAdjust;
	}
	pattern += "total stitches: " + totalStitches + br;
	
	// estimate total yarn
	let estimateYarnRequired = totalStitches * testPatternYarnPerStitch;
	let estimateYarnRequiredGrams = totalStitches / testPatternTotalStitches * testPatternYarnUsedGrams
	pattern += "Estimated yarn required: " + Math.round(estimateYarnRequired) + " m" + br;
	pattern += "Estimated yarn required: " + Math.round(estimateYarnRequiredGrams) + " g" + br;
	
	return pattern;
	
}

function getSphereRowCircumfrenceInCm(row, rows, circumfrenceInCm) {
	let progressRatio = row / rows; // how far through are we?
	let progressAngle = progressRatio * Math.PI; // (express progress as a portion of Pi)
	let rowCircumfrenceInCm = circumfrenceInCm * Math.sin(progressAngle);
	
	return rowCircumfrenceInCm;
}

function getCircleRowCircumfrenceInCm(row, rows, circumfrenceInCm) {
	let progressRatio = row / rows; // how far through are we?
	let rowCircumfrenceInCm = circumfrenceInCm * progressRatio; // don't need to recalc from radius as radius is liniarly proportional to circumfrence.
	
	return rowCircumfrenceInCm;
}


function getConeRowCircumfrenceInCm(row, rows, circumfrenceInCm) {
	return row / rows * circumfrenceInCm;
}

function generate() {
	console.log("generate");
	
	// collect test pattern data from the form
	testPatternWidthInStitches = document.forms["test-pattern"]["test-width-stitches"].value;
	testPatternWidthMeasure = document.forms["test-pattern"]["test-width-measure"].value;
	testPatternLengthInRows = document.forms["test-pattern"]["test-length-rows"].value;
	testPatternLengthMeasure = document.forms["test-pattern"]["test-length-measure"].value;
	testPatternYarnUsed = document.forms["test-pattern"]["test-yarn-used"].value;
	testPatternYarnUsedGrams = document.forms["test-pattern"]["test-yarn-used-grams"].value;
	
	console.log("Test pattern width: " + testPatternWidthInStitches + " stitches.");
	console.log("Test pattern width: " + testPatternWidthInStitches + " mm.");
	console.log("Test pattern length: " + testPatternWidthInStitches + " rows.");
	console.log("Test pattern length: " + testPatternWidthInStitches + " mm.");
	console.log("Test pattern yarn used: " + testPatternYarnUsed + " m.");
	console.log("Test pattern yarn used: " + testPatternYarnUsedGrams + " g.");
	
	// calculate ratios from the test pattern
	stitchesPerCm = testPatternWidthInStitches / testPatternWidthMeasure * 10;
	rowsPerCm = testPatternLengthInRows / testPatternLengthMeasure * 10;
	stitchLengthToWidthRatio = (testPatternWidthMeasure / testPatternWidthInStitches) / (testPatternLengthMeasure / testPatternLengthInRows);
	testPatternTotalStitches = testPatternLengthInRows * testPatternWidthInStitches;
	testPatternYarnPerStitch = testPatternYarnUsed / testPatternTotalStitches;
	
	console.log("Test pattern stitches per cm: " + stitchesPerCm);
	console.log("Test pattern rows per cm: " + rowsPerCm);
	console.log("Test pattern stitch length to width ratio: " + stitchLengthToWidthRatio);
	
	// get the target shape details
	// for now, only a sphere. TODO: other shapes
	shape = document.forms["shape"]["shape"].value;
	
	// generate the pattern
	let pattern = "";

	let patternStart = "";
	let startStitches = NaN;
	let lastStartRowStitches = NaN;
	let rows = NaN;
	let circumfrenceInCm = NaN;
	
	switch (shape) {
		case "sphere":
			//pattern = generateSphere();
			patternStart = `
<div id="row-1" class="pattern-row" progress="none" onclick="focusRow(event)">
row 1: magic circle 6 sc (6)
</div>
<div id="row-2" class="pattern-row" progress="none" onclick="focusRow(event)">
row 2: inc in each stitch around (12)
</div>
`;				
			startStitches = 18;
			lastStartRowStitches = 12;

			// figure the number of rows (to make one side, ie half of the circumfrence)
			let sphereRadiusInCm = document.forms["shape"]["sphere-radius"].value;
			circumfrenceInCm = 2.0 * Math.PI * sphereRadiusInCm;
			console.log("circumfrence: " + circumfrenceInCm + " cm");
			rows = Math.round(circumfrenceInCm / 2 * rowsPerCm);
			
			pattern = generateRoundThings(patternStart, startStitches, lastStartRowStitches, rows, circumfrenceInCm, getSphereRowCircumfrenceInCm); // NB: we can re-use the getSphereRowCircumfrenceInCm from a sphere here, as the progress ratio in that function takes care of the distortion factor 
			break;
		case "circle":
			// pattern = generateCircle();
			patternStart = `
<div id="row-1" class="pattern-row" progress="none" onclick="focusRow(event)">
row 1: magic circle 6 sc (6)
</div>
<div id="row-2" class="pattern-row" progress="none" onclick="focusRow(event)">
row 2: inc in each stitch around (12)
</div>
`;				
			startStitches = 18;
			lastStartRowStitches = 12;

			// figure the number of rows (to make one side, ie half of the circumfrence)
			let circleRadius = document.forms["shape"]["circle-radius"].value;
			rows = circleRadius * rowsPerCm;

			circumfrenceInCm = 2.0 * Math.PI * circleRadius;
			console.log("circumfrence: " + circumfrenceInCm + " cm");
			
			pattern = generateRoundThings(patternStart, startStitches, lastStartRowStitches, rows, circumfrenceInCm, getCircleRowCircumfrenceInCm);
			break;
		case "cone":
			// pattern = generateCone();
			

			// figure the number of rows (to make one side)
			// for a cone, this is the slant distance, ie sqrt(height^2 + (base-radius)^2)
			let baseRadius = document.forms["shape"]["cone-base-radius"].value;
			let coneHeight = document.forms["shape"]["cone-height"].value;
			let sideLength = Math.sqrt(baseRadius * baseRadius + (coneHeight * coneHeight));
			rows = sideLength * rowsPerCm;

			circumfrenceInCm = 2.0 * Math.PI * baseRadius;
			console.log("circumfrence: " + circumfrenceInCm + " cm");
			
			let coneRow2Stitches = 2 / rows * circumfrenceInCm * stitchesPerCm;
			let coneMagicCircleStitches = Math.max(3, Math.ceil( coneRow2Stitches / 2 ));
			
			patternStart = `
<div id="row-1" class="pattern-row" progress="none" onclick="focusRow(event)">
row 1: magic circle `;
			patternStart += coneMagicCircleStitches+" sc ("+coneMagicCircleStitches+")</div>";
			startStitches = coneMagicCircleStitches;
			lastStartRowStitches = coneMagicCircleStitches;
			
			pattern = generateRoundThings(patternStart, startStitches, lastStartRowStitches, rows, circumfrenceInCm, getConeRowCircumfrenceInCm);
			break;
		case "ellipsoid":
			patternStart = `
<div id="row-1" class="pattern-row" progress="none" onclick="focusRow(event)">
row 1: magic circle 6 sc (6)
</div>
<div id="row-2" class="pattern-row" progress="none" onclick="focusRow(event)">
row 2: inc in each stitch around (12)
</div>
`;				
			startStitches = 18;
			lastStartRowStitches = 12;

			// figure the number of rows (to make one side, ie half of the circumfrence)
			// for an ellipse the circumfrence is 2 x π x √((a^2 + b^2) ÷ 2)
			// NB: this is the circumfrence that goes the long way around the ends
			let ellipsoidLength = document.forms["shape"]["ellipsoid-length"].value;
			let ellipsoidWidth = document.forms["shape"]["ellipsoid-width"].value;
			let ellipseCircumfrence = 2 * Math.PI * Math.sqrt((ellipsoidLength * ellipsoidLength + ellipsoidWidth * ellipsoidWidth) / 2);
			rows = Math.round(ellipseCircumfrence / 2 * rowsPerCm);
			
			// This is the circumfrence around the middle of the ellipsoid
			circumfrenceInCm = Math.PI * ellipsoidWidth;
			console.log("circumfrence: " + circumfrenceInCm + " cm");
			
			pattern = generateRoundThings(patternStart, startStitches, lastStartRowStitches, rows, circumfrenceInCm, getSphereRowCircumfrenceInCm);			
			break;
		default: 
			pattern = "Error: shape not recognised.";
	}
	
	// put the pattern on the panel
	let patternPanel = document.getElementById("pattern");
	patternPanel.innerHTML = pattern;
	patternPanel.style.display = "block";	
}



// show the shape settings for the currently selected shape
function showSettings() {
	// get the shape
	shape = document.forms["shape"]["shape"].value;
	
	// hide the settings
	document.getElementById("sphere-settings").style.display = "none";
	document.getElementById("ellipsoid-settings").style.display = "none";
	document.getElementById("circle-settings").style.display = "none";
	document.getElementById("ellipse-settings").style.display = "none";
	document.getElementById("cone-settings").style.display = "none";

	// show the settigns div for the currently selected shape
	document.getElementById(shape + "-settings").style.display = "block";
	
}

// select the row we are working on to be 'selected'
// all previous rows become 'done' and all future rows become 'none'
function focusRow(e) {
	let target = e.target || e.srcElement;
	console.log("click: " + target);
	target.setAttribute("progress", "selected");
	
	// get the row number from the target id
	console.log(target.id);
	let targetRow = target.id.substring(4, target.id.length);
	console.log(targetRow);
	
	for (let row = 1; row < rows; row++) {
		if (row < targetRow) {
			let el = document.getElementById("row-" + row);
			el.setAttribute("progress", "done");
		} else if (row > targetRow) {
			let el = document.getElementById("row-" + row);
			el.setAttribute("progress", "none");
		} 
	}
}

function toggleRow(e) {
	let target = e.target || e.srcElement;
	console.log("click: " + target);
	if (target.getAttribute("progress") == "none") target.setAttribute("progress", "selected")
	else if (target.getAttribute("progress") == "selected") target.setAttribute("progress", "done")
	else if (target.getAttribute("progress") == "done") target.setAttribute("progress", "none")
	else target.setAttribute("selected", "none");
}

