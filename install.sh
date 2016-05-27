#!/bin/sh
wget https://github.com/edutec/Snap4Arduino/archive/master.zip
unzip master.zip
mv Snap4Arduino-master/snap* .
rm -rf Snap4Arduino-master
mkdir /usr/share/snap-interpreter
cp -r * /usr/share/snap-interpreter
ln -s /usr/share/snap-interpreter/snap.js /usr/bin/snap.js
