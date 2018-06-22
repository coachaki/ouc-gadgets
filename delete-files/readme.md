# Responsive Images

This gadget will generate multiple, different size images from 1 user input image.

## TODO

1. Use Lanczos algorithm for resizing the image
2. Turn ImageSet into a class like function

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