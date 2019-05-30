// 编译vue组件
fis.match('/**.vue', {
    useCompile: true, // need force specific the property  // https://github.com/fex-team/fis3/commit/eadc96bfe112d5d4cf5eb349e8a2b6e195bcb5c2
    isMod: true,
    // useHash: true,
    rExt: 'js',
    useSameNameRequire: true,
	isPartial:false,
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
			isPartial:false,
        })
		// ,fis.plugin('babel-7') // 处理ES6
    ]
});
// 编译vue组件中的sass
fis.match('*.vue:scss', {
    rExt: 'css',
    parser: [
        fis.plugin('scss', {
            sourceMap: true,
        })
    ]
});

// 编译vue组件中的js
fis.match('*.vue:js', {
    useCompile:true,
    rExt: 'js',
    isMod: true,
    isPartial: false,
    parser: [
        fis.plugin('babel-7') , function(c, f){
            console.log('bb');
            f.isJsLike=true;
            f.isPartial = false;
            return c;
        }
    ]
});