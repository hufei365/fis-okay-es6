/**
 * @author nuer
 * @time 20171130
 * @description 内置标准化函数处理 (__inline|__uri);
 */

// TODO: 仅限跨模块引用处理;
// 同时兼容本模块命名空间引用, 但不建议大面积使用, 毕竟非原逻辑实现;
var path = require('path');
var tool = require('./tool.js');


// 命名空间集合;
var nsArr;


module.exports = function ( content, file, conf ) {
    // 没有 `import` 代表不需要跨模块引用;
    if ( 0 !== tool.import.length && typeof content === 'string' ) {
        var type;

        nsArr = [ tool.ns ].concat( tool.import );
        if (conf.type && conf.type !== 'auto') {
            type = conf.type;
        } else {
            type = file.isHtmlLike ? 'html' : (file.isJsLike ? 'js' : (file.isCssLike ? 'css' : ''));
        }

        switch (type) {
            case 'html':
                // content = extHtml(content, null, file);
                break;

            case 'js':
                content = extJs( content, null, file );
                break;

            case 'css':
                // content = extCss(content, null, file);
                break;

            default:
                // unrecognized.
                break;
        };

    }
    return content;
};


var regCss = /(\/\*[\s\S]*?(?:\*\/|$))|(?:@import\s+)?\burl\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|[^)}\s]+)\s*\)(\s*;?)|\bsrc\s*=\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|[^\s}]+)/g;
var regHtml = /(<script(?:(?=\s)[\s\S]*?["'\s\w\/\-]>|>))([\s\S]*?)(?=<\/script\s*>|$)|(<style(?:(?=\s)[\s\S]*?["'\s\w\/\-]>|>))([\s\S]*?)(?=<\/style\s*>|$)|<(img|embed|audio|video|link|object|source)\s+[\s\S]*?["'\s\w\/\-](?:>|$)|<!--inline\[([^\]]+)\]-->|(<!(?:--)?\[[^>]+>)|<!--(?!\[|>)([\s\S]*?)(-->|$)|\bstyle\s*=\s*("(?:[^\\"\r\n\f]|\\[\s\S])+"|'(?:[^\\'\n\r\f]|\\[\s\S])+')/ig;


function extJs ( content, callback, file ) {
    var reg  = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(\/\/[^\r\n\f]+|\/\*[\s\S]*?(?:\*\/|$))|\b(__inline|__uri)\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*')\s*\)/g;
    var lang = fis.compile.lang;

    return content.replace(reg, callback || function ( m, comment, type, value ) {
        
        if ( type ) {
            // 去除首尾引号;
            value = value.slice( 1, -1 );
            var curNs = value.split( ':' );

            // 没有命名空间可以直接无视了;
            if ( 1 === curNs.length ) {
                return m;
            }
            switch ( type ) {
                case '__inline':
                    // 得依托缓存, 没有cache则不能使用;
                    var project_path = tool.maps( curNs[0] ).project_path;
                    var cache = fis.cache( path.join(project_path, curNs[1]), 'compile/release-online' );
                    m = fis.util.fs.readFileSync(cache.cacheFile).toString(
                        fis.get('charset') || 'utf-8'
                    );
                    break;
            };
    
        }
        return m;
    });
}
