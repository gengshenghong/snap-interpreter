// Let's tweak Canvas a bit (really dirty stuff!)

var fs = require('fs'),
    project;

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
Canvas = require('canvas');
Image = Canvas.Image;
canvas = new Canvas(200, 200);
Map = require('hashmap');

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


// Let's load it all

var includeInThisContext = function(path) {
    vm.runInThisContext(fs.readFileSync(path), path);
}.bind(this);

includeInThisContext('morphic.js');
includeInThisContext('widgets.js');
includeInThisContext('blocks.js');
includeInThisContext('threads.js');
includeInThisContext('objects.js');
includeInThisContext('gui.js');
//includeInThisContext('paint.js');
includeInThisContext('lists.js');
includeInThisContext('byob.js');
includeInThisContext('xml.js');
includeInThisContext('store.js');
//includeInThisContext('locale.js');
includeInThisContext('cloud.js');
//includeInThisContext('sha512.js');


// One World

Morph.prototype.world = function() {
    return world;
}


// Some decorations and overrides

includeInThisContext('decorators.js');


// Actual world and IDE construction

world = new WorldMorph(canvas);
ide = new IDE_Morph();
ide.openIn(world);
ide.rawOpenProjectString(project);
ide.runScripts();

setInterval(loop, 1);

function loop() {
    world.doOneCycle();
}