/**
 * @author nuer
 * @time 20171117
 * @description `Element` 带命名空间引用;
 */

'use strict';
var util = require('util');


var reg = /(<(script|link)+.*?(src|href)=[\"\'])(.*?)([\"\'].*?(><\/script>|\/>|>))/gi;



module.exports = function ( ret, settings, conf, opt ) {
    var ns = fis.get( 'import' ) || [];
    if ( 0 === ns.length ) {
        return ;    // 如果没有 `import` 则表示不需要跨模块引用;
    }
    // 记录打包文件的引入, 防止重复引入;
    var pkgMap = {};
    // 命名空间正则;
    var nsReg = new RegExp( '^(' + ns.join('|') + '):', 'i' );

    fis.util.each(ret.src, function ( file, id ) {

        // 只处理页面;
        if ( !file.isHtmlLike ) {
            return true;
        }
        pkgMap = {};
        file.setContent(
            file.getContent().replace(reg, replaceTagPath)
        );
    });

    function replaceTagPath ( $0, $1, $2, $3, $4, $5 ) {
        if ( nsReg.test($4) ) {
            try {
                var res = ret.map.res[ $4 ];
                var pkg = res.pkg;
                var url;
                if ( pkg ) {
                    if ( !pkgMap[ pkg ] ) {
                        url = ret.map.pkg[ pkg ].uri;
                        pkgMap[ pkg ] = true;
                    } else {
                        return '';
                    }
                } else {
                    url = res.uri;
                }
                return $1 + url + $5;
            } catch( e ) {
                fis.log.error(
                    util.format(
                        "%s".red + " [`ElementTag` script]: %s".yellow,
                        e.message,
                        $4
                    )
                );
            }
        } else {
            return $0;
        }
    }

};
