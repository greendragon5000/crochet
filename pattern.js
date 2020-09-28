// C Daniel Vale 2020. All rights reserved.

"use strict";

class CPattern {
	constructor() {
		this.pattern = "";
		this.currentStitch = "";
		this.currentStitchCount = 0;
		this.totalStitchCount = 0;
	}
	
	PushStitch(stitch) {
		if (stitch == this.currentStitch || this.currentStitch == "") {
			this.currentStitch = stitch;
			this.currentStitchCount = this.currentStitchCount + 1;
			if (this.currentStitch == "inc") {
				this.totalStitchCount += 2;
			} else {
				this.totalStitchCount += 1;
			}
		} else {
			// put the current stitch buffer into the pattern
			if (this.pattern != "") {
				this.pattern += ", ";
			}
			this.pattern += this.currentStitch;
			if (this.currentStitchCount > 1) {
				this.pattern += " " + this.currentStitchCount + " (" + this.totalStitchCount + ")";
			} else {
				this.pattern += " (" + this.totalStitchCount + ")"
			}
			
			// set the new current stitch
			this.currentStitch = stitch;
			this.currentStitchCount = 1;
			if (this.currentStitch == "inc") {
				this.totalStitchCount += 2;
			} else {
				this.totalStitchCount += 1;
			}
		}
		
		return this.currentStitchCount;
	}
	
	// flush the buffer and return the pattern
	GetPattern() {
		// put the current buffered stitch (if any) into the pattern
		
		if (this.currentStitchCount > 0) {
			if (this.pattern != "") {
				this.pattern += ", ";
			}
			this.pattern += this.currentStitch;
			if (this.currentStitchCount > 1) {
				this.pattern += " " + this.currentStitchCount + " (" + this.totalStitchCount + ")";
			} else {
				this.pattern += " (" + this.totalStitchCount + ")"
			}
		}
		
		return this.pattern;
	}
}