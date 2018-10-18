'use strict';

// eslint-disable-next-line no-unused-vars
function ImageSet(source, widths) {
    if (!(source instanceof HTMLImageElement)) {
        throw 'The source must be an HTMLImageElement.';
    }
    else if(!source.complete) {
        throw 'Please call the ImageSet constructor after the image has been loaded.';
    }

    var self = this;

    this.output = {type: 'image/jpeg'};
    this.source = {image: source, width: source.naturalWidth, height: source.naturalHeight};
    this.widths = widths || [1920, 1280, 800, 600, 480];
    this.widths.sort(function(a, b) { return b - a;}); // largest to smallest, so we can scale down efficiently

    this.resize = function() {
        simpleResize();
    };

    this.toHTML = function(element) {
        if (!(element instanceof HTMLElement)) {
            throw 'The argument must be an HTMLElement.';
        }

        var original = new Image();
        original.src = this.output.original;
        element.append(original);

        for(var i = 0; i < this.widths.length; i++) {
            var key = this.widths[i];
            if (this.output[key] === null) {
                continue;
            }
            var image = new Image();
            image.src = this.output[key];

            element.append(image);
        }
    };

    // A resize algorithm that resizes images by steps.
    var simpleResize = function(maxScaleStep) {
        if (typeof(maxScaleStep) !== 'number') {
            maxScaleStep = .01; // set default maximum scale step to 1% size reduction for maximum quality.
        }
        console.log('simpleResize');
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        canvas.width = self.source.width;
        canvas.height = self.source.height;
        context.drawImage(self.source.image, 0, 0);

        self.output.original = canvas.toDataURL(self.output.type);

        var tempCanvas = document.createElement('canvas');
        var tempContext = tempCanvas.getContext('2d');
        for (var i = 0; i < self.widths.length; i++) {
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempContext.drawImage(canvas, 0, 0);
            var w0 = tempCanvas.width;
            var w1 = self.widths[i];
            var scale = w1 / w0;
            var h0 = tempCanvas.height;
            var h1 = h0 * scale;
            if (w1 > w0) {
                self.output[w1] = null;
                continue; // only scale down
            }

            // non-outputting image scaling for increasing output image quality
            while (scale >= maxScaleStep) {
                var w1Temp = w0 * maxScaleStep;
                var h1Temp = h0 * maxScaleStep;

                canvas.width = w1Temp;
                canvas.height = h1Temp;
                context.drawImage(tempCanvas, 0, 0, w1Temp, h1Temp);

                w0 = w1Temp; // update the new starting width, height, and image
                h0 = h1Temp;
                tempCanvas.width = w0;
                tempCanvas.height = h0;
                tempCanvas.drawImage(canvas, 0, 0);

                scale = w1 / w0; // check for new scale value based on final desired output width and new starting width
            }

            canvas.width = w1;
            canvas.height = h1;

            context.drawImage(tempCanvas, 0, 0, w1, h1);
            self.output[w1] = canvas.toDataURL(self.output.type);
        }
    };

    // eslint-disable-next-line no-unused-vars
    var bicubicResize = function() { console.log('bicubicResize'); };
}

// eslint-disable-next-line no-unused-vars
function resize(source, filetype, newSizes) {
    var output = [];
    var canvas = document.createElement('canvas');
    var sourceWidth = source.naturalWidth;
    var sourceHeight = source.naturalHeight;

    for (var i = 0; i < newSizes.length; i++) {
        var newSize = newSizes[i];
        if (newSize.width > sourceWidth || newSize.height > sourceHeight) {
            continue; // only resize down. don't resize up
        }
        canvas.width = newSize.width;
        canvas.height = newSize.height;

        var ratio = Math.max(newSize.width / sourceWidth, newSize.height / sourceHeight);

        var context = canvas.getContext('2d');

        context.drawImage(source, 0, 0, sourceWidth * ratio, sourceHeight * ratio);
        output.push(canvas.toDataURL(filetype));
    }
    return output;
}

// eslint-disable-next-line no-unused-vars
function preview(output) {
    clearPreview();
    for (var i = 0; i < output.length; i++) {
        var img = document.createElement('img');
        img.src = output[i];
        console.log(output[i].split(',')[1]);
        console.log(img);
        $('main').append(img); // eslint-disable-line no-undef
    }
}

function clearPreview() {
    var images = document.getElementsByTagName('img');
    console.log(images);
    for (var i = images.length - 1; i >= 0; i--) {
        var img = images[i];
        if (img.parentNode) {
            img.parentNode.removeChild(img);
        }
    }
}

// cubic interpolation based on the formulas on this page: http://www.paulinternet.nl/?page=bicubic
function cubicInterpolation(p, x) {
    if (Array.isArray(p) && p.length === 4) {
        var a = -.5 * p[0] + 1.5 * p[1] - 1.5 * p[2] + .5 * p[3];
        var b = p[0] - 2.5 * p[1] + 2 * p[2] - .5 * p[3];
        var c = -.5 * p[0] + .5 * p[2];
        var d = p[1];

        return a * x ^ 3 + b * x ^ 2 + c * x + d;
    }
    else {
        throw 'p is not an array';
    }
}

// eslint-disable-next-line no-unused-vars
function bicubicInterpolation(p, x, y) {
    var f_p = [];
    if (Array.isArray(p) && p.length === 4) {
        f_p[0] = cubicInterpolation(p[0], y);
        f_p[1] = cubicInterpolation(p[1], y);
        f_p[2] = cubicInterpolation(p[2], y);
        f_p[3] = cubicInterpolation(p[3], y);

        return cubicInterpolation(f_p, x);
    }
}