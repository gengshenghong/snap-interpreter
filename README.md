# Snap4Arduino command line interpreter
Command line Snap4Arduino interpreter. You feed it an XML project file and it runs it

## Installation

First, get the Snap4Arduino sources:

```
$ git clone https://github.com/edutec/Snap4Arduino
```

Then, clone this repo and move all of its files inside the Snap4Arduino _snap_ folder:

```
$ git clone https://github.com/bromagosa/snap-interpreter.git
$ mv snap-interpreter/* Snap4Arduino/snap
```

Cd into this folder and install all dependencies:

```
$ cd Snap4Arduino/snap
$ npm install
```

If you don't need Snap4Arduino compatibility (plain Snap! mode), just remove _firmata_ from the packages to install:

```
$ npm install canvas hashmap
```

If npm fails to install canvas, you may need to install its prerequisites. In Debian/Raspbian, this should suffice:

```
# apt-get install g++ build-essential libgif-dev libpango1.0-dev libjpeg-dev libcairo2-dev
```

Note that you'll need Node 0.10.4x or higher. Follow instructions from https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions


For other systems, please refer to https://github.com/Automattic/node-canvas#installation

After installing all dependencies, you can run any project by doing:

```
$ node snap.js project.xml
```

If your project is a plain Snap one, add a _--plain-snap_ parameter:

```
$ node snap.js project.xml --plain-snap
```

For now, the only output comes from say, think and ask blocks, but it's easily doable to add a way to live-stream the contents of the stage.

## Third party NodeJS packages:
* [node-canvas](https://github.com/Automattic/node-canvas)
* [hashmap](https://www.npmjs.com/package/hashmap)
* [firmata](https://github.com/jgautier/firmata) _(only for Snap4Arduino compatibility)_
