var babel_dir = fis.get('babel_dir');

fis.match('/(' + babel_dir + '/**.js)', {
    isMod: true,
    id: '$1'
    , moduleId: '$1'
    , postprocessor: fis.plugin('okay-es2015')
})
.match('/**.es6', {
    isMod: true,
    rExt: '.js',
    parser: fis.plugin('okay-es2015', {
        sourceMap: 'inline'
    })
    , postprocessor: fis.plugin('okay-es2015')
})
.match('/**.{vm, html, tpl}:js', {
    parser: fis.plugin('okay-es2015', {
        sourceMap: 'inline'
    })
    , postprocessor: fis.plugin('okay-es2015-asyncParser')
})
.match('::package', {
    // 合并es6 polyfill
    packager: fis.plugin('map', {
        ['pkg/es2015-polyfill_'+(+ new Date())+'.js']: [
            'es2015-polyfill/**.js'
        ]
    })
})