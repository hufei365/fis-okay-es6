// 编译vue组件
fis.match('/**.vue', {
    useCompile: true, // need force specific the property  // https://github.com/fex-team/fis3/commit/eadc96bfe112d5d4cf5eb349e8a2b6e195bcb5c2
    isMod: true,
    rExt: 'js',
    useSameNameRequire: true,
    isPartial:false,
    preprocessor: fis.plugin(function(content,file){
        file.isJsLike = true;
        file.isPartial = false;
        return content;
    })
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
