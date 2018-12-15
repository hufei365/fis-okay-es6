/**
 * @author nuer
 * @time 20171201
 */


var path = require('path');

var _ = module.exports = {};

Object.defineProperties(_, {

    // 配置文件存储地址, 例如 `okay-conf | module-map`;
    'conf_path': {
        writable: false,
        value: fis.project.getCachePath('conf')
    },
    
    // current namespace;
    'ns': {
        get: function () {
            return fis.get( 'namespace' );
        }
    },

    // `resourceMap` file path;
    'map_file': {
        get: function () {
            return fis.get( 'map_file' );
        }
    },

    // import namespace;
    'import': {
        get: function () {
            return fis.get( 'import' ) || [];
        }
    }

});

fis.util.merge(_, {
    // 读取指定模块 `resourceMap`;
    'maps': function ( ns, data, charset ) {
        var realpath = path.join( _.conf_path, ns + '-map.json' );

        if ( data ) {
            return fis.util.write(realpath, data, charset || 'utf8');
        }
        return JSON.parse( fis.file(realpath).getContent() );
    }
});