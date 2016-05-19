// Yes, no "var"
// We need to keep it ugly if we want everybody to be able to access these

fs = require('fs');
project = null;
modules = {};
vm = require('vm');

// Let's parse all parameters

projectFileName = process.argv.filter(function(any) { return any.substr(-4) === '.xml' });

if (projectFileName) {
    projectFileName = projectFileName[0];
}

snapMode = process.argv.indexOf('--plain-snap') > -1;
canvasMode = process.argv.indexOf('--canvas') > -1;
httpServerMode = process.argv.indexOf('--serve') > -1 || canvasMode;

// Let's treat all parameters

if (process.argv.indexOf('--help') > -1) {
    printHelp();
};

if (!projectFileName) {
    console.error('Please provide an xml Snap! project file to run');
    printHelp();
    process.exit(1);
}

if (!global.Map) { 
    console.error('Please use node --harmony to run snap.js');
    printHelp();
    process.exit(1);
}

if (projectFileName) {
    project = fs.readFileSync(projectFileName, { encoding: 'utf-8' });
}

function printHelp() {
    console.log('Usage: node [--harmony] snap.js yourProject.xml [--plain-snap] [--canvas] [--serve]');
    console.log('Runs a Berkeley Snap! project or a Snap4Arduino one on the command line\n');
    console.log('\t--plain-snap\n\t\tRuns a plain Snap! project with no Arduino capabilities');
    console.log('\t--canvas\n\t\tRenders the Stage in an HTTP-streamable canvas. Automatically adds «--serve»');
    console.log('\t--serve\n\t\tStarts a simple HTTP server at port 42001 with the following entry points:');
    console.log('\t\thttp://[IP]:42001/stage\n\t\t\tStreams the Stage in real time. Needs «--canvas»');
    console.log('\t\thttp://[IP]:42001/broadcast=[message]\n\t\t\tBroadcasts «message» to Snap! so it can be captured by «When I receive» hat blocks');
    console.log('\t\thttp://[IP]:42001/send-messages\n\t\t\tLists all messages being used in the Snap! program');
    console.log('\t\thttp://[IP]:42001/send-vars\n\t\t\tLists all variables being used in the Snap! program');
    console.log('\t\thttp://[IP]:42001/vars-update=[variable]=[value]\n\t\t\tSets the Snap! variable «variable» to «value»');
    process.exit(0);
}

// A hackety "include" that just appends js files in context

include = function(moduleName) { return require(moduleName) };

var includeInThisContext = function(path, needsRequire) {
    // we can't "require" modules from within "appended" js files
    var code = fs.readFileSync(path, {encoding: 'utf-8'});

    if (needsRequire) {
        code = code.replace('require', 'include');
    }

    vm.runInThisContext(code, path);

}.bind(this);


// Let's load it all

if (!Object.assign) {
    require('es6-shim');
}

includeInThisContext(canvasMode ? 'canvas.js' : 'nodify.js');

includeInThisContext('snap/morphic.js');

if (!snapMode) {
    includeInThisContext('snap/s4a/morphic.js', true);
}

includeInThisContext('snap/widgets.js');
includeInThisContext('snap/blocks.js');

if (!snapMode) {
    includeInThisContext('snap/s4a/blocks.js');
}

includeInThisContext('snap/threads.js');

if (!snapMode) {
    includeInThisContext('snap/s4a/threads.js');
}

includeInThisContext('snap/objects.js');

if (!snapMode) {
    includeInThisContext('snap/s4a/objects.js');
}

includeInThisContext('snap/gui.js');

if (httpServerMode) {
    includeInThisContext('snap/s4a/httpserver.js', true);
}

includeInThisContext('snap/lists.js');
includeInThisContext('snap/byob.js');
includeInThisContext('snap/tables.js');
includeInThisContext('snap/xml.js');
includeInThisContext('snap/store.js');

if (!snapMode) {
    includeInThisContext('snap/s4a/store.js');
}

includeInThisContext('snap/cloud.js');

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

if (httpServerMode) {
    ide.startServer();
}

ide.rawOpenProjectString(project);
ide.runScripts();

setInterval(loop, 1);

function loop() {
    world.doOneCycle();
}
