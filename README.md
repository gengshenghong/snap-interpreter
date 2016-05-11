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

Cd into this folder and install dependencies according to your needs:

```
$ cd Snap4Arduino/snap
```

If you need Snap4Arduino compatibility:

```
$ npm install firmata
```

If you want to have full Canvas support to be able to stream your stage over HTTP:

```
$ npm install canvas 
```

If npm fails to install canvas, you may need to install its prerequisites. In Debian/Raspbian, this should suffice:

```
# apt-get install g++ build-essential libgif-dev libpango1.0-dev libjpeg-dev libcairo2-dev
```

Note that you'll need Node 0.10.4x or higher. Follow instructions from https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

For other systems, please refer to https://github.com/Automattic/node-canvas#installation

## Usage

Please note that if you are using an old Node.js version (like 0.10.x), you will most probably need call it with the ``--harmony`` parameter. This is due to old Node.js versions not supporting native hash maps out of the box.

```
node [--harmony] snap.js yourProject.xml [--plain-snap] [--canvas] [--serve]
Runs a Berkeley Snap! project or a Snap4Arduino one on the command line

	--plain-snap
		Runs a plain Snap! project with no Arduino capabilities
	--canvas
		Renders the Stage in an HTTP-streamable canvas. Automatically adds «--serve»
	--serve
		Starts a simple HTTP server at port 42001 with the following entry points:
		http://[IP]:42001/stage
			Streams the Stage in real time. Needs «--canvas»
		http://[IP]:42001/broadcast=[message]
			Broadcasts «message» to Snap! so it can be captured by «When I receive» hat blocks
		http://[IP]:42001/send-messages
			Lists all messages being used in the Snap! program
		http://[IP]:42001/send-vars
			Lists all variables being used in the Snap! program
		http://[IP]:42001/vars-update=[variable]=[value]
			Sets the Snap! variable «variable» to «value»
```

Console outputs the result of *say*, *think* and *ask* blocks, all messages given by the UI and the contents of the stage via a tiny webserver accessible at http://[your-ip]:42001/stage.

## Third party NodeJS packages:
* [node-canvas](https://github.com/Automattic/node-canvas)
* [hashmap](https://www.npmjs.com/package/hashmap)
* [firmata](https://github.com/jgautier/firmata) _(only for Snap4Arduino compatibility)_
