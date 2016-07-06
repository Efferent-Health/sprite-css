'use strict';

var async = require('async'),
    glob = require('glob'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    _ = require('underscore'),
    compositor = require('./compositor/jimp'),    
    changeDetector = require('./utils/changeDetector'),
    layout = require('./layout/packed'),
    stylesheet = require('./stylesheet/prefixed-css');

var defaults = {
    src: [],
    spritePath: '',
    stylesheetPath: '',
    layoutOptions: {},
    compositorOptions: {},
    stylesheetOptions: {}
};

function generateSprite(options, callback) {
    options = options || {};
    options = _.extend({}, defaults, options);

    // do glob pattern matching
    async.map(options.src, glob, function (globError, fileNames) {
        if (globError) {
            callback(globError);
            return;
        }

        // filter duplicates from glob pattern matching
        fileNames = _(fileNames).chain().flatten().uniq().value();

        async.waterfall([
            function readImages(cb) {
                compositor.readImages(fileNames, cb);
            },
            function generateLayout(images, cb) {
                layout(images, options.layoutOptions, cb);
            },
            function (generatedLayout, cb) {
                async.series([
                    function createDirs(dCb) {
                        async.parallel([
                            mkdirp.bind(null, path.dirname(options.spritePath)),
                            mkdirp.bind(null, path.dirname(options.stylesheetPath))
                        ], dCb);
                    },
                    function writeFiles(wCb) {
                        async.parallel([
                            compositor.render.bind(null, generatedLayout, options.spritePath, options.compositorOptions),
                            stylesheet.bind(null, generatedLayout, options.stylesheetPath, options.spritePath, options.stylesheetOptions)
                        ], wCb);
                    }
                ], cb);
            }
        ], function (pipelineError) {
            if (callback) {
                callback(pipelineError);
            }
        });
    });
}

module.exports = generateSprite;
