/**
 * @author nuer
 * @time 20151203
 */


var path = require('path');
var util = require('util');
var fis = module.exports = require('fis3');
require('colors');

fis.require.prefixes.unshift([ 'okay', 'fis-okay' ]);



fis.cli.name 		  = 'okay';

fis.cli.version 	  = require('./version.js');

fis.cli.info 		  = fis.util.readJSON( __dirname + '/package.json' );

fis.cli.help.commands = [ 'release', 'install', 'server', 'inspect' ];



require('./config.js');

require('./config/vue-build');

//TODO: 实在找不到地儿放了, 因为是要配置它, 所以就靠它触发吧;
var deployReg = /^(qa|online)$/i;
Object.defineProperty(fis.config.data, 'map_file', {
    get: function () {
        var media = fis.project.currentMedia();

        if ( fis.util.isString(this.value) && deployReg.test(media) ) {
            fis.util.write(
                path.join(fis.project.getProjectPath(), this.value),
                ''
            );
        }
        return this.value;
    },
    set: function ( v ) {
        var media = fis.project.currentMedia();
        if ( deployReg.test(media) ) {
            fis.util.write(
                path.join(fis.project.getProjectPath(), v),
                util.format('module.exports = { now: %s };', Date.now())
            );
        }
        this.value = v;
    }
});

fis.match('**', {

    // 跨模块 `__inline` 没有 `cache` 不能使用;
    // parser: fis.plugin( require('./lib/standard') ),

    postpackager: [

        fis.plugin(require('./lib/map'), {
            optimize: true
        }),

        // 若需处理跨模块 `script | link` 引用请将此类文件加 `isHtmlLike` 标记
        fis.plugin( require('./lib/element') )

    ]
    
}, -100);
fis.match('/{views,pages}/**.{tpl,php,vm,jsp,html}', {

    isHtmlLike: true,
    extras: {
        isPage: true
    },
    preprocessor: fis.plugin('extlang')
    
}, -100);
fis.match('/pages/**.{vm,jsp}', {
    
    release: '/WEB-INF/$0'

}, -100);