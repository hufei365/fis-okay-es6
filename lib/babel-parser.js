var path = require('path');
var MODULE_DIR = fis.get('babel_dir') || 'es2015-polyfill';
var extend = require('extend')
var babel = require('babel-core');
var presetEnv = require('babel-preset-env');
var transformRuntime = require('babel-plugin-transform-runtime');


var resolve = require('resolve');


var tool = require('./tool');


var MODULE_DIR = fis.get('babel_dir') || 'es2015-polyfill';
var config = {
    babelrc: false,
    ast: false,
    presets: [presetEnv],
    plugins: [
        [transformRuntime, 
            // { moduleName: moduleName} // don't support custom module name 
        ]
    ]
};

var source = null, // compile output, contain the files's infomation of project
    projectRoot = null; // project root path

fis.on('compile:start', function (ret) {
    source = ret;
    projectRoot = fis.project.getProjectPath();
});

var baseDir = path.dirname(path.dirname(process.argv[1])) || '';

var imports = null;

module.exports = function (content, file, option) {
    imports = imports || getImports();
    var output = babel.transform(content, extend({}, config, option, {
        sourceMaps: 'both',
        filename: file.isInline ?  file.dirname + file.release : file.fullname  // fis will override write filename, so redefined here
    } ) );
    content = output.code;
    content = resolveRequire(content, file);
    return content;
}

function resolveRequire(content, file) {

    return content.replace(/require\(('|")(babel-runtime[a-zA-Z\-_\d\/\.]+)\1\)/g, function (match, quote, moduleid) {
        try {
            var realPath = resolve.sync(moduleid, {
                basedir: baseDir
            });
        } catch(e) {
            fis.log.error( 'Can not find the module file~~ :(' )
        }
        moduleid = joinNPMPkg(realPath, file);

        return 'require("' + moduleid + '")';
    });
}

function requireNPM(content, subdirname) {
    var fileDir = subdirname;
    content = content.replace(/require\(('|")([a-zA-Z\-\d_\.\/]+)\1\)/g, function (match, quote, rmodule) {
        // fis.log.info('resolve npm module['+ rmodule + '] ......');
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
    return content;
}

function joinNPMPkg(filepath, originFile) {
    var moduleid =  path.join(MODULE_DIR, path.relative(path.join(baseDir, '/node_modules'), filepath));

    source = source || fis.project.getSource();
    projectRoot = projectRoot || fis.project.getProjectPath();

    if (moduleid && !imports.res[moduleid.replace(/\\/g, '/')] && source[moduleid] === undefined) {

        var targetPath = path.resolve(projectRoot, moduleid);

        source[moduleid] = fis.file(targetPath);
        
        fis.util.write(targetPath, requireNPM(fis.util.read(filepath), path.dirname(filepath)) );
        
        originFile && originFile.cache.addDeps(targetPath);
    }
    return moduleid;
}

function getImports(){
    var resMaps = {res:{}};
    fis.util.each(tool.import, function ( val, idx ) {
        try {
            var rMap = tool.maps( val );
            fis.util.merge( resMaps, rMap);

        } catch ( e ) {
            fis.log.error(fis.util.format("%s".red + " [`Import` 需先编译引用模块]".yellow, e.message));
        }
    });
    return resMaps;
}

var exports = module.exports;
exports.asyncParser = function (content, file, option) {
    var variables = [],
        moduleids = [],
        expressions = [],
        interopRequireDefault;

    content = content.replace(/\n(function _interopRequireDefault\(obj\).+)\n/, function(match, line){
        interopRequireDefault = line;
        return match;
    });

    if(interopRequireDefault){
        var reg = new RegExp('[\\s\\n]*var\\s+([a-zA-Z\\d_]+) *= *require\\(("'+MODULE_DIR+'[a-zA-Z_\\d\/\\-\\.]+")\\);\\n+(.+)\\n', 'g');
        //reg: /[\s\n]*var\s+([a-zA-Z\d_]+) *= *require\(("es2015-polyfill[a-zA-Z_\d\/\-\.]+")\);\n+(.+)\n/g
        content = content.replace(reg, function (all, variable, moduleid, expression) {
            variables.push(variable);
            moduleids.push(moduleid);
            expressions.push(expression);
            return '';
        });

        
    }
    var reg = /require(\.async)?\(\[([\.a-zA-Z\-\d_\/:,"']+)\],\s*function\s*\(([$a-zA-Z_\d,\s]*)\)\s*{/g;
    if (variables.length) {
        if(reg.test(content)){
            content = content.replace(reg, function (all, asyncStr, ids, variable) {
                ids = ids ? ids.split(',') : [];
                variable = variable ? variable.split(',') : [];
                return 'require.async([' + moduleids.concat(ids).join(',') + '], function(' + variables.concat(variable).join(',') + '){\n\n' + expressions.join('\n\n') + '\n\n';
            });
        } else {
            content = content.replace(/^('|")use strict\1;\n/, '\'use strict\';\n' + 'require.async([' +moduleids.join(',\n')+ '], function('+ variables.join(',')+'){\n\n' + expressions.join('\n\n')) + '\n});'
        }
        
    }
    return content;
}

exports.postprocessor=function(content, file, option){
    var reg = new RegExp('^' + fis.get('namespace') + ':('+MODULE_DIR+')', 'g');
    for(var i = 0; i<file.requires.length; i++){
        file.requires[i] = file.requires[i].replace(reg, "$1");
    }

    var reg = new RegExp( 'require\\\((\'|")' + fis.get('namespace') + ':('+MODULE_DIR+')', 'g');
    content = content.replace(reg, function(match, $1, $2){
        return 'require(' + $1 + $2;
    });
    return content;
}


fis.on('compile:add', function(file){
	var reg = new RegExp('^' + fis.get('namespace') + ':('+MODULE_DIR+')', 'g');
	file.id = file.id.replace(reg, '$1');
});

fis.on('release:end', function(){
	var node_modules = path.join( fis.project.getProjectPath(), MODULE_DIR);
	fis.log.warn('delete tmp dir [babel]: ' + node_modules);
	fis.util.del(node_modules);
	fis.log.info('end release');
});

