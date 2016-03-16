var fs = require('fs'),
    project;

// Let's tweak some files a bit (really dirty stuff!)

if (!fs.readFileSync('node_modules/canvas/lib/context2d.js', {encoding: 'utf-8'}).match('SNAP4ARDUINO')) {
    fs.appendFileSync('node_modules/canvas/lib/context2d.js','\n\n// ADDED BY SNAP4ARDUINO\n\nCanvasGradient.prototype.oldAddColorStop = CanvasGradient.prototype.addColorStop;\nCanvasGradient.prototype.addColorStop = function(where, color) {\n\tthis.oldAddColorStop(where, color.toString());\n};');
}

if (!fs.readFileSync('node_modules/canvas/lib/canvas.js', {encoding: 'utf-8'}).match('SNAP4ARDUINO')) {
    fs.appendFileSync('node_modules/canvas/lib/canvas.js','\n\n// ADDED BY SNAP4ARDUINO\n\nCanvas.prototype.addEventListener = function() {};\nCanvas.prototype.focus = function() {};');
}


// Yes, no "var"
// We need to keep it ugly if we want everybody to be able to access these

modules = {};
vm = require('vm');
projectFileName = process.argv[2];
snapMode = process.argv[3] === '--plain-snap';
Canvas = require('canvas');
HTMLCanvasElement = Canvas;
Image = Canvas.Image;
canvas = new Canvas(200, 200);
Map = require('hashmap');
include = function(moduleName) { return require(moduleName )};

if (projectFileName) {
    project = fs.readFileSync(projectFileName, { encoding: 'utf-8' });
}


// Oh, you miss your DOM, don't you?

document = {
    createElement: function(elementName) {
        if (elementName === 'canvas') {
            return new Canvas(200, 200);
        } else {
            console.error('I don\'t know how to make a ' + elementName);
        }
    },
    body: {
        addEventListener: function() {}
    }
};

window = {
    addEventListener: function() {}
};

location = {
    hash: ''
}

localStorage = null;


// A hackety "include" that just appends js files in context

var includeInThisContext = function(path) {
    // we can't "require" modules from within "appended" js files
    var code = fs.readFileSync(path, {encoding: 'utf-8'});

    if (path.match('s4a')) {
        code = code.replace('require', 'include');
    }

    vm.runInThisContext(code, path);

}.bind(this);


// Let's load it all

includeInThisContext('morphic.js');

if (!snapMode) {
    includeInThisContext('s4a/morphic.js');
}

includeInThisContext('widgets.js');
includeInThisContext('blocks.js');

if (!snapMode) {
    includeInThisContext('s4a/blocks.js');
}

includeInThisContext('threads.js');

if (!snapMode) {
    includeInThisContext('s4a/threads.js');
}

includeInThisContext('objects.js');

if (!snapMode) {
    includeInThisContext('s4a/objects.js');
}

includeInThisContext('gui.js');

includeInThisContext('s4a/httpserver.js');

includeInThisContext('lists.js');
includeInThisContext('byob.js');
includeInThisContext('tables.js');
includeInThisContext('xml.js');
includeInThisContext('store.js');

if (!snapMode) {
    includeInThisContext('s4a/store.js');
}

includeInThisContext('cloud.js');


// One World

Morph.prototype.world = function() {
    return world;
}


// Some decorations and overrides

includeInThisContext('decorators.js');


// Actual world and IDE construction

world = new WorldMorph(canvas);

if (!snapMode) {
    world.Arduino.keepAlive = true;
}

ide = new IDE_Morph();
ide.openIn(world);
ide.rawOpenProjectString(project);
ide.runScripts();

setInterval(loop, 1);

function loop() {
    world.doOneCycle();
}
