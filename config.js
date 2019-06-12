/**
 * @author nuer
 * @time 20151218
 */

fis.set('server.type', 'jello');
var _okay = fis.get('okay');


fis
	.match('image', {
		useHash: true
	})
	.match('**.tmpl', {
		isJsLike: true,
		useHash: true,
		useMap: true,
		parser: fis.plugin('handlebars-x', {
			isTmpl: true
		}),
		rExt: 'tmpl.js'
	})
	.match('**.{html,htm,jsp,vm}', {
		parser: fis.plugin('handlebars-x', {
			script_type: 'template',
			isPage: true
		})
	})
	.match('**.scss', {
		parser: fis.plugin('scss'),
		rExt: '.css'
	})
	.match('**.md', {
		parser: fis.plugin('marked'),
		rExt: '.html'
	})

	// es6文件后缀默认为.es6
	.match('/src/**.es6', {
		isMod: true,
		parser: fis.plugin('babel-7', {
			sourceMap: false,
		})
	})

	.match('/okay-conf.js', {
		release: false
	})
	.match('/server.conf', {
		release: '/WEB-INF/$0'
	})
	.match('/node_modules/(**.js)', {
		isMod: true
	})

	// 编译vue组件
	.match('/**.vue', {
		// "useCompile" need force specific the property  // https://github.com/fex-team/fis3/commit/eadc96bfe112d5d4cf5eb349e8a2b6e195bcb5c2
		useCompile: true,
		isMod: true,
		rExt: 'js',
		isPartial: false,
		preprocessor: fis.plugin(function (content, file) {
			file.isJsLike = true;
			file.isPartial = false;
			return content;
		})
	})
	// 编译vue组件中的sass
	.match('*.vue:scss', {
		rExt: 'css',
		useSprite: true,
		parser: [
			fis.plugin('scss', {
				sourceMap: true,
			})
		]
	})

	.hook('commonjs', {
		paths: {
			$: '/components/common/base/base.js'
		}
	});

	fis.hook('common-npm');

// online settings;
fis.util.map(['qa', 'online'], function (index, name) {
	fis
		.media(name)
		// js, css, scss加md5;
		.match('**.{js,css,scss}', {
			useHash: true
		})
		// 图片加md5;
		.match(':image', {
			useHash: true
		})
		/*
		// 压缩 png 图片;
		.match('*.png', {
			optimizer: fis.plugin('png-compressor')
		})
		.match('::package', {
			// 图片合并
            spriter: fis.plugin('csssprites', {
                // 排列方式, linear || matrix
                layout: 'linear'
            })
		})
*/

		.match('{/test/*,/server.conf,okay-conf.js}', {
			release: false
		})
		.match('**', {
			domain: _okay.domain || ''
		})
		.match('*.{css,scss}', {
			// 开启图片压缩;
			// useSprite: true,
			// css 压缩;
			optimizer: fis.plugin('clean-css')
			// ,packTo: '/pkg/quizcenter.css'
		})
		.match('{*.js,*.vm:js,*.html:js}', {
			// js 压缩;
			optimizer: fis.plugin('uglify-js', {})
		})
		.match('highcharts/**', {
			optimizer: false
		})
		.match('**.{js,css,scss,html,jpg,png,gif,swf,tmpl,svg}', {
			release: '$0',
			deploy: [
				fis.plugin('tar', {
					filename: _okay.namespace + '.static.tar.gz'
				}),
				fis.plugin('local-deliver', {
					to: './dest'
				})
			]
		})
		.match('/views/(**.{vm,jsp})', {
			release: '$1',
			deploy: [
				fis.plugin('tar', {
					filename: _okay.namespace + '.tar.gz'
				}),
				fis.plugin('local-deliver', {
					to: './dest'
				})
			]
		});
});