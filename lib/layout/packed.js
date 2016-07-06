'use strict';

var _ = require('underscore');
var binPack = require('bin-pack');

var scaleImages = function(images, options) {
    return _(images).map(function (image) {
        return _.extend({}, image, {
            width: Math.round(image.width * options.scaling),
            height: Math.round(image.height * options.scaling)
        });
    });
}

var defaultOptions = {
    padding: 0,
    scaling: 1
};

module.exports = function generateLayout(images, options, callback) {
    var packed;

    options = _.extend({}, defaultOptions, options);

    images = scaleImages(images, options);
    images = _.map(images, function (image) {
        image.width += options.padding;
        image.height += options.padding;
        return image;
    });

    packed = binPack(images);
    images = _.map(packed.items, function (image) {
        var paddingOffset = options.padding / 2;

        return _.extend({}, image.item, {
            x: image.x + paddingOffset,
            y: image.y + paddingOffset,
            width: image.width - options.padding,
            height: image.height - options.padding
        });
    });

    callback(null, {
        width: packed.width,
        height: packed.height,
        images: images
    });
};

