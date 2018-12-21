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

	.match('/(es2015-polyfill/**.js)', {
		id: '$1'
		,moduleId: '$1'
		// ,parser: require('./lib/babel-parser') // 一行代码引发了血案
		,postprocessor: require('./lib/babel-parser').postprocessor
	})
	.match('/**.es6', {
		isMod: true,
		rExt: '.js',
		parser: require('./lib/babel-parser')
		,postprocessor: require('./lib/babel-parser').postprocessor
	})
	.match('/**.{vm, html, tpl}:js', {
		parser: require('./lib/babel-parser')
		,postprocessor: require('./lib/babel-parser').asyncParser
	})
	.match('::package', {
		// 合并es6 polyfill
		packager: fis.plugin('map', {
			'pkg/es2015-polyfill.js': [
				'es2015-polyfill/**.js'
			]
		})
	})

	.match('/okay-conf.js', {
		release: false
	})

	.match('/server.conf', {
		release: '/WEB-INF/$0'
	})

	.hook('commonjs', {
		paths: {
			$: '/components/common/base/base.js'
		}
	});



// online settings;
fis.util.map(['qa', 'online'], function(index, name) {
	fis.media(name)

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

		.match('{\/test/*,/server\.conf,okay-conf\.js}', {
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
			optimizer: fis.plugin('uglify-js', {

			})
		})

		.match('highcharts/**', {
			optimizer: false
		})

		.match('**.{js,css,scss,html,jpg,png,gif,swf,tmpl,svg}', {
			release: '$0',
			deploy: [fis.plugin('tar', {
				filename: _okay.namespace + '.static.tar.gz'
			}), fis.plugin('local-deliver', {
				to: './dest'
			})]
		})

		.match('/views/(**.{vm,jsp})', {
			release: '$1',
			deploy: [fis.plugin('tar', {
				filename: _okay.namespace + '.tar.gz'
			}), fis.plugin('local-deliver', {
				to: './dest'
			})]
		});
});








