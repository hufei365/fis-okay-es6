// 编译vue组件
fis.match('*.vue', {
    // useMap: true,
    isMod: true,
    rExt: 'js',
    useSameNameRequire: true,
    parser: [
        // https://github.com/ccqgithub/fis3-parser-vue-component
        fis.plugin('vue-component', {
            runtimeOnly: true,
            styleNameJoin: '',
            extractCSS: false,
            cssScopedIdPrefix: '_v-',
            cssScopedHashType: 'sum',
            cssScopedHashLength: 8,
            cssScopedFlag: '__vuec__',
        })
    ],
    postprocessor: fis.plugin('okay-es2015')
});
// 编译vue组件中的sass
fis.match('*.vue:scss', {
    rExt: 'css',
    parser: [
        fis.plugin('scss', {
            sourceMap: true,
        })
    ],
    // postprocessor: fis.plugin('autoprefixer', {
    //     // detail config (https://github.com/postcss/autoprefixer#browsers)
    //     'browsers': ['Android >= 2.3', 'ChromeAndroid > 1%', 'iOS >= 4'],
    //     'cascade': true,
    // }),
});
// 编译vue组件中的es6到es5
fis.match('*.vue:js', {
    isMod: true,
    rExt: 'js',
    // useSameNameRequire: true,
    parser: [
        // https://github.com/fex-team/fis-parser-babel-6.x
        // fis.plugin(require('../local-plugin/node_modules/fis-parser-okay-es2015'), {
        fis.plugin('okay-es2015', {
			sourceMap: 'inline'
        }),
        
        // fis.plugin(function(content){
        //     return content.replace(/var _elementUi = require\("element-ui"\);/g, 'require("teacher:components/element-ui/index.js")');
        // })
    ],
    postprocessor: fis.plugin('okay-es2015')
});