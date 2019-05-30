/**
 * @author nuer
 * @time 2015.12.22
 */


'use script';
var fs = require('fs');
var path = require('path');
var util = require('util');
var tool = require('./tool.js');


module.exports = function( ret, settings, conf, opt ) {
    var map = {
        res : {},
        pkg : {}
    };

    // 将map存储到临时目录;
    saveResourceMap( ret.map );
    mergeResourceMap( ret.map );
    
    fis.util.map(ret.map.res, function( id, res ) {
        var r = map.res[ id ] = {};
        if( res.deps ) r.deps = res.deps;
        // 有打包的话就不要加url了，以减少map的体积
        if( res.pkg ) {
            r.pkg = res.pkg;
        } else {
            r.url = res.uri;
        }
    });
    fis.util.map(ret.map.pkg, function( id, res ) {
        var r = map.pkg[ id ] = {};
        r.url = res.uri;
        // if( res.deps ) r.deps = res.deps;
    });


    var stringify = JSON.stringify(map, null, conf.optimize ? null : 4);
    stringify = '(function(){require.resourceMap(' + stringify + ');})();';

    var map_file = ret.src[ tool.map_file ];
    if ( map_file ) {
        map_file.setContent( stringify );
    } else {
        // 兼容老项目;
        var inputFile = ret.src['/components/lib/require/require.js'];
        if ( inputFile ) {
            inputFile.setContent( inputFile.getContent() + stringify );
        }
    }
};


// 将map记录到临时目录;
function saveResourceMap ( map ) {
 
    if ( fis.util.isString(tool.ns) ) {
        // 存储当前模块目录;
        // 便于其它模块寻找文件关联使用;
        map.project_path = fis.project.getProjectPath();

        tool.maps( tool.ns, JSON.stringify(map), 'utf8' );
    }

}

/**
 * // 将 `import` 中的模块集合与当前编译模块的 `resourceMap` 合并;
 * @param {JSON} map resourceMap
 * @returns {JSON} 多模块 `resourceMap` join;
 */
function mergeResourceMap ( map ) {
    
    fis.util.each(tool.import, function ( val, idx ) {

        try {
            
            var rMap = tool.maps( val );
            fis.util.merge( map, rMap );

        } catch ( e ) {

            fis.log.error(util.format("%s".red + " [`Import` 需先编译引用模块]".yellow, e.message));

        }

    });
}