// 编译vue组件
fis.match('/**.vue', {
    useCompile: true, // need force specific the property  // https://github.com/fex-team/fis3/commit/eadc96bfe112d5d4cf5eb349e8a2b6e195bcb5c2
    isMod: true,
    // useHash: true,
    rExt: 'js',
    useSameNameRequire: true,
	isPartial:false,
    parser: [
        (function(c, f){
            f.isJsLike=true;
            f.isPartial = false;
            return c;
        }),
        // https://github.com/ccqgithub/fis3-parser-vue-component
        fis.plugin('vue-component', {
            runtimeOnly: true,
            styleNameJoin: '',
            extractCSS: false,
            cssScopedIdPrefix: '_v-',
            cssScopedHashType: 'sum',
            cssScopedHashLength: 8,
            cssScopedFlag: '__vuec__',
			isPartial:false,
        })
		,fis.plugin('babel-7') // 处理ES6
    ]
});
// 编译vue组件中的sass
fis.match('*.vue:scss', {
    rExt: 'css',
    useSprite: true,
    parser: [
        fis.plugin('scss', {
            sourceMap: true,
        })
    ]
});
