// ImageSet should trigger a custom ready event
let ImageSet = new function() {
	this.source = {}; // HTMLImageElement? Yes. Send a "load" event on load.
	this.output = {}; // array of resized images
	this.newSizes = []; // array of width, height numbers
	this.crop = true;
	this.cropCenter = {}; // x, y coordinates
}();


function resize(source, filetype, newSizes) {
	let output = [];
	let canvas = document.createElement('canvas');
	let sourceWidth = source.naturalWidth;
	let sourceHeight = source.naturalHeight;
	for(let i = 0; i < newSizes.length; i++) {
		let newSize = newSizes[i];
		if (newSize.width > sourceWidth || newSize.height > sourceHeight) {
			continue; // only resize down. don't resize up
		}
		canvas.width = newSize.width;
		canvas.height = newSize.height;

		let ratio = Math.max(newSize.width / sourceWidth, newSize.height / sourceHeight);

		let context = canvas.getContext('2d');

		context.drawImage(source, 0, 0, sourceWidth*ratio, sourceHeight*ratio);
		output.push(canvas.toDataURL(filetype));
	}
	return output;
}

function preview(output) {
	clearpreview();
	for(let i = 0; i < output.length; i++) {
		let img = document.createElement('img');
		img.src = output[i];
		console.log(img);
		$('#main').append(img);
	}
}

function clearpreview() {
	let images = document.getElementsByTagName('img');
	console.log(images);
	for(let i = images.length-1; i >= 0; i--) {
		let img = images[i];
		if (img.parentNode) {
			img.parentNode.removeChild(img);
		}
	}
}