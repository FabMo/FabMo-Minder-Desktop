FabMo-Tool-Minder-Desktop
===============
The FabMo Tool Minder Desktop is a Cross-Platform desktop application for finding FabMo capable tool on your local network and connect to them.

# Features
- Display the available machines on your network
- Give you the state, the job that is running if it's apply & the best Ip address to connect to your machine.
- quick access button to your machine using your default browser

#Installation instructions

## Windows

Simply get the latest installer from the [release page](https://github.com/jlucidar/FabMo-Tool-Minder-Desktop/releases/latest) and install it. You're all set up !

## Mac OSX

There is also a package file for MAC on the [release page](https://github.com/jlucidar/FabMo-Tool-Minder-Desktop/releases/latest), but I didn't test it as I'm not a MAC user. I'll apreciate any feedback for it.

## Linux

There is currently no installer for Linux, but you can easily run this app from sources as described below.

# Running from sources

## instructions

- First clone this repo into the desired folder : `git clone https://github.com/jlucidar/FabMo-Tool-Minder-Desktop`
- go to the folder that was created : `cd FabMo-Tool-Minder-Desktop`
- then run the `npm i` command to install the required dependencies
- finally run `npm start` to launch the Tool Minder each time you need it.

##Limitation

- you can't start the Tool Minder on system startup. you need to install the [nw.js binaries](http://nwjs.io/downloads/) in the Tool Minder app root's folder to get it to work, and start the Tool Minder by clicking on the nw executable.


# Technical specification / Credits
- This application relies on [nw.js](https://github.com/nwjs/nw.js) wich is a framework for building cross-platform desktop applications. The application is written in HTML/CSS/Javascript and Node.jS
- The design is made with the [purecss](http://purecss.io) framework
- The network detection tool relies on UDP broadcast, so you might check that your network allow this kind of request as it may be blocked by your router. 
