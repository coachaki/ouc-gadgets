'use strict';

// eslint-disable-next-line no-unused-vars
function ImageSet(source, options) {

    /* private functions */
    var randomString = function(length) {
        if (typeof length !== 'number' || length < 1) {
            length = 10;
        }
        var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var output = '';

        for (var i = 0; i < length; i++) {
            var pos = Math.floor(Math.random() * chars.length);
            output += chars[pos];
        }

        return output;
    };
    
    // A resize algorithm that resizes images by steps.
    var simpleResize = function(maxScaleStep) {
        if (typeof(maxScaleStep) !== 'number') {
            maxScaleStep = .667; // Set the default maximum scale step to 33.3% size reduction for maximum quality. When this number is higher, the image can be over-smoothed.
        }
        console.info('simpleResize');
        var canvas = document.createElement('canvas'), context = canvas.getContext('2d');
        var tempCanvas = document.createElement('canvas'), tempContext = tempCanvas.getContext('2d');
        context.msImageSmoothingEnabled  = true;
        context.imageSmoothingEnabled = true;
        tempContext.msImageSmoothingEnabled  = true;
        tempContext.imageSmoothingEnabled = true;

        canvas.width = self.source.width;
        canvas.height = self.source.height;
        context.drawImage(self.source.image, 0, 0);

        self.output.original = canvas.toDataURL(self.output.type);

        for (var i = 0; i < self.widths.length; i++) {
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempContext.drawImage(canvas, 0, 0);
            var w0 = tempCanvas.width;
            var w1 = self.widths[i];
            var scale = Math.round((w1 / w0) * 1000) / 1000;
            var h0 = tempCanvas.height;
            var h1 = Math.round(h0 * scale);
            if (w1 > w0) {
                self.output[w1] = null;
                continue; // only scale down
            }

            // non-outputting image scaling for increasing output image quality
            while (scale <= maxScaleStep) {
                var w1Temp = Math.round(w0 * maxScaleStep);
                var h1Temp = Math.round(h0 * maxScaleStep);

                canvas.width = w1Temp;
                canvas.height = h1Temp;
                context.drawImage(tempCanvas, 0, 0, w1Temp, h1Temp);

                w0 = w1Temp; // update the new starting width, height, and image
                h0 = h1Temp;
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempContext.drawImage(canvas, 0, 0);

                scale = Math.round((w1 / w0) * 1000) / 1000; // check for new scale value based on final desired output width and new starting width
            }

            canvas.width = w1;
            canvas.height = h1;

            context.drawImage(tempCanvas, 0, 0, w1, h1);
            self.output[w1] = canvas.toDataURL(self.output.type);
        }
    };

    // eslint-disable-next-line no-unused-vars
    var bicubicResize = function() { console.log('bicubicResize'); };

    if (!(source instanceof HTMLImageElement)) {
        throw 'The source must be an HTMLImageElement.';
    }
    else if(!source.complete) {
        throw 'Please call the ImageSet constructor after the image has been loaded.';
    }

    var defaultOptions = {
        name: randomString(12),
        widths: [1920, 1280, 800, 600, 480]
    };

    if (options == null || typeof options == 'object') {
        options = defaultOptions;
    }

    var self = this;

    this.output = {
        type: 'image/jpeg',
        name: options.name || defaultOptions.name
    };
    this.source = {
        image: source,
        width: source.naturalWidth,
        height: source.naturalHeight
    };
    this.widths = options.widths || defaultOptions.widths;
    this.widths.sort(function(a, b) { return b - a;}); // largest to smallest, so we can scale down efficiently

    this.resize = function() {
        simpleResize();
    };

    this.toLinks = function(element) {
        if (!(element instanceof HTMLElement)) {
            throw 'The argument must be an HTMLElement.';
        }

        var ul = document.createElement('ul');
        for(var i = 0; i < this.widths.length; i++) {
            var key = this.widths[i];
            if (this.output[key] === null) {
                continue;
            }
            var li = document.createElement('li');
            var link = document.createElement('a');
            link.text = this.output.name + '-x' + key;
            link.href = this.output[key];

            li.appendChild(link);
            ul.appendChild(li);
        }
        element.appendChild(ul);
    };

    this.toImages = function(element) {
        if (!(element instanceof HTMLElement)) {
            throw 'The argument must be an HTMLElement.';
        }

        for(var i = 0; i < this.widths.length; i++) {
            var key = this.widths[i];
            if (this.output[key] === null) {
                continue;
            }
            var image = new Image();
            image.src = this.output[key];

            element.appendChild(image);
        }
    };

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