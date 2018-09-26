var NwBuilder = require('nw-builder');
var os = require('os');

var platforms = [];
switch(os.platform()) {
	case 'win32':
		platforms.push('win32', 'win64');
		break;
	case 'darwin':
		platforms.push('osx64');
		break;
}

var nw = new NwBuilder({
    files: './src/**', // use the glob format
    buildDir : './build',
    platforms: platforms,
    version : '0.12.3'
});

// Log stuff you want
nw.on('log',  console.log);
 
nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});