var babel = require('babel-core');
var presetEnv = require('babel-preset-env');
var transformRuntime = require('babel-plugin-transform-runtime');

var resolve = require('resolve');
var path = require('path');

var MODULE_DIR = 'es2015-polyfill';
var config = {
    presets: [ ["env", {
      "targets": {
        "browsers": ["last 2 versions", "safari >= 7"]
      }
    }]],
    plugins: [ 'transform-runtime']
};

var source = null,
    projectRoot = null;

fis.on('compile:start', function (ret) {
    source = ret;
    projectRoot = fis.project.getProjectPath();
});


module.exports = function (content, file, option) {
    var t = babel.transform(content, config).code;
    t = resolveRequire(t);
    return t;
}

// node_modules dirname
var baseDir = path.dirname(path.dirname(process.argv[1])) || '';
fis.log.info( 'baseDir is :' + baseDir );


function resolveRequire(content) {

    return content.replace(/require\(('|")(babel-runtime[a-zA-Z\-_\d\/\.]+)\1\)/g, function (match, quote, moduleid) {
        try {
            var realPath = resolve.sync(moduleid, {
                basedir: baseDir
            });
        } catch(e) {
            fis.log.error( 'Can not find the module file~~ :(' )
        }
        
        moduleid = joinNPMPkg(realPath);

        return 'require("' + moduleid + '")';
    });
}

function requireNPM(t, subdirname) {
    var fileDir = subdirname;
    t = t.replace(/require\(('|")([a-zA-Z\-\d_\.\/]+)\1\)/g, function (match, quote, rmodule) {
        fis.log.info('resolve npm module['+ rmodule + '] ......');
        try {
            var realPath = resolve.sync(rmodule, {
                basedir: /^\.\.?\//.test(rmodule) ? fileDir : baseDir
            });
        } catch (e) {
            fis.log.error('Can not resolve the module ['+ rmodule +'] file~~ :(')
        }

        var moduleid = joinNPMPkg(realPath);

        return 'require("' + moduleid + '")';

    });
    return t;
}

function joinNPMPkg(filepath) {
    var moduleid =  path.join(MODULE_DIR, path.relative(path.join(baseDir, '/node_modules'), filepath));

    if (moduleid && source[moduleid] === undefined) {

        var targetPath = path.resolve(projectRoot, moduleid);
        fis.util.write(targetPath, requireNPM(fis.util.read(filepath), path.dirname(filepath)) );
        
        var file = fis.file(targetPath);
        file.isNPM = true;
        source[moduleid] = file;
    }
    return moduleid;
}




// start compile , modify the file.id
fis.on('compile:add', function(file){
	var reg = new RegExp('^' + fis.get('namespace') + ':(es2015-polyfill)', 'g');
	file.id = file.id.replace(reg, '$1');
});

// delete the the es2015-polyfill (a dir generated when compile)
fis.on('release:end', function(){
	var node_modules = path.join( fis.project.getProjectPath(), 'es2015-polyfill');
	fis.log.warn(node_modules);
	fis.util.del(node_modules);
	fis.log.info('end release');
});


