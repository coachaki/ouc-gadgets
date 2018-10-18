// ImageSet should trigger a custom ready event
let ImageSet = new function () {
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

    for (let i = 0; i < newSizes.length; i++) {
        let newSize = newSizes[i];
        let scale = 1;
        if (newSize.scale) {
            if (newSize.scale > 1) {
                continue; // only resize down.
            }
            scale = newSize.scale;
            canvas.width = sourceWidth * scale;
            canvas.height = sourceHeight * scale;
        } else if (newSize.width && newSize.height) {
            if (newSize.width > sourceWidth || newSize.height > sourceHeight) {
                continue; // only resize down. don't resize up
            }
            scale = Math.max(newSize.width / sourceWidth, newSize.height / sourceHeight);
            canvas.width = newSize.width;
            canvas.height = newSize.height;
        }

        let context = canvas.getContext('2d');

        context.drawImage(source, 0, 0, sourceWidth * scale, sourceHeight * scale);
        output.push(canvas.toDataURL(filetype));
    }
    return output;
}

function preview(output) {
    clearPreview();
    for (let i = 0; i < output.length; i++) {
        let img = document.createElement('img');
        img.src = output[i];
        console.log(output[i].split(',')[1]);
        console.log(img);
        $('main').append(img);
    }
}

function clearPreview() {
    let images = document.getElementsByTagName('img');
    console.log(images);
    for (let i = images.length - 1; i >= 0; i--) {
        let img = images[i];
        if (img.parentNode) {
            img.parentNode.removeChild(img);
        }
    }
}

// function simpleResize(imageData) {

// }

// function bicubicResize(imageData) {

// }

// cubic interpolation based on the formulas on this page: http://www.paulinternet.nl/?page=bicubic
function cubicInterpolation(p, x) {
    if (Array.isArray(p) && p.length === 4) {
        let a = -.5 * p[0] + 1.5 * p[1] - 1.5 * p[2] + .5 * p[3];
        let b = p[0] - 2.5 * p[1] + 2 * p[2] - .5 * p[3];
        let c = -.5 * p[0] + .5 * p[2];
        let d = p[1];

        return a * x ^ 3 + b * x ^ 2 + c * x + d;
    }
    else {
        throw 'p is not an array';
    }
}

function bicubicInterpolation(p, x, y) {
    let f_p = [];
    if (Array.isArray(p) && p.length === 4) {
        f_p[0] = cubicInterpolation(p[0], y);
        f_p[1] = cubicInterpolation(p[1], y);
        f_p[2] = cubicInterpolation(p[2], y);
        f_p[3] = cubicInterpolation(p[3], y);

        return cubicInterpolation(f_p, x);
    }
}