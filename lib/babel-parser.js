var babel = require('babel-core');
var presetEnv = require('babel-preset-env');
var transformRuntime = require('babel-plugin-transform-runtime');

var resolve = require('resolve');
var path = require('path');

var MODULE_DIR = 'es2015-polyfill';
var config = {
    presets: [presetEnv],
    plugins: [
        [transformRuntime, 
            // { moduleName: moduleName}
        ]
    ]
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

// C:\Users\habc\ws\es6-fis-okay\fis-okay
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
        content = content.replace(/[\s\n]*var\s+([a-zA-Z\d_]+) *= *require\(("es2015-polyfill[a-zA-Z_\d\/\-\.]+")\);\n+(.+)\n/g, function (all, variable, moduleid, expression) {
            variables.push(variable);
            moduleids.push(moduleid);
            expressions.push(expression);
            return '';
        });

        
    }
    var reg = /require(\.async)?\(\[([\.a-zA-Z\-\d_\/:,"']+)\],\s*function\s*\(([$a-zA-Z_,\s]*)\)\s*{/g;
    if (variables.length) {
        content = content.replace(reg, function (all, asyncStr, ids, variable) {
            variable = chkDefineAndExport(ids, variable).join(', ');

            ids = ids.replace(/,/g, ',\n') + (',\n' + moduleids.join(',\n'));
            variable += (', ' + variables.join(', '));
            return 'require.async([' + ids + '], function(' + variable + '){\n\n' + expressions.join('\n\n') + '\n\n';
        });
    }
    return content;


    //TODO: 需要校验 require.async['', ''] 和 exports数量是否相等
    function chkDefineAndExport(ids, variable){
        ids = ids ? ids.split(',') : [];
        variable = variable ? variable.split(',') : [];

        var len = ids.length - variable.length;

        if(len > 0){
            var r = (new Array(len+1)).join('__NoUse__,').split(',');
            r.length--;
            variable = variable.concat( r );
        }

        return variable;
    }
}

exports.postprocessor=function(content, file, option){
    var reg = new RegExp('^' + fis.get('namespace') + ':(es2015-polyfill)', 'g');
    for(var i = 0; i<file.requires.length; i++){
        file.requires[i] = file.requires[i].replace(reg, "$1");
    }

    var reg = new RegExp( 'require\\\((\'|")' + fis.get('namespace') + ':(es2015-polyfill)', 'g');
    content = content.replace(reg, function(match, $1, $2){
        return 'require(' + $1 + $2;
    });
    return content;
}


fis.on('compile:add', function(file){
	var reg = new RegExp('^' + fis.get('namespace') + ':(es2015-polyfill)', 'g');
	file.id = file.id.replace(reg, '$1');
});

fis.on('release:end', function(){
	var node_modules = path.join( fis.project.getProjectPath(), 'es2015-polyfill');
	fis.log.warn(node_modules);
	fis.util.del(node_modules);
	fis.log.info('end release');
});


