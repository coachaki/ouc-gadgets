# Responsive Images

This gadget will generate multiple, different size images from 1 user input image.

## TODO

1. Use Lanczos algorithm for resizing the image

## Roadmap

### Version 1.0 Feature List

- An image is resized to multiple resolutions of the same aspect ratio.
- No support for cropping
- Simple UX
- Resize algorithm to be good enough but not great. If possible, bicubic.

### Version 2.0 Feature List

- Crop support
- Simple interface for choosing crop-point per aspect ratio

### Version 3.0 Feature List

- Custom crop-point for overriding aspect-ratio crop-point


## Implementation Details

- ImageSet class
    + source
    + image list
    + options
        * crop
        * crop center
        * output filetype (jpg/png/same as input)
    + trigger ready event
- Functions
    + preview
    + push to OU
    + download
    + regenerate
    + change options?
