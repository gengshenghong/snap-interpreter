# snap command line interpreter
Command line Snap! interpreter. You feed it an XML project file and it runs it

Just copy these files into the [Snap!](http://snap.berkeley.edu) root folder, then run:

```
$ npm install canvas hashmap
```

This will install all dependencies. After that, you can load any project by doing:

```
$ node snap.js project.xml
```

For now, the only output comes from say, think and ask blocks, but it's easily doable to add a way to live-stream the contents of the stage.

Also, a Snap4Arduino-capable version is on the way.

The code in this hack is dirty. Hacks are ugly, and that's what makes them fun!

## Third party stuff:
* [node-canvas](https://github.com/Automattic/node-canvas)
* [hashmap](https://www.npmjs.com/package/hashmap)
