# fis-okay
Front-end Integrated Solution（前端集成解决方案）

[![npm version](https://badge.fury.io/js/fis-okay.png)](http://badge.fury.io/js/fis-okay)


## FIS-OKAY简介

FIS-OKAY是采用百度FEX研发的开源前端集成解决方案[FIS](https://github.com/fex-team/fis3)为依托构建的，旨在解决我司前端基础架构与开发规范化。


## 特性
* 生成map到页面或map文件并引入(default: `</head>`后面);
* 将面中的特定`script`标签移到`</body>`后;
* 根据map自动引入framework.js、base.css、page目录下与页面同路径同名的js和css文件;
* `okay server start`默认启用java服务;
* [less css方法封装](https://www.npmjs.com/package/fis-parser-nuer-less)
* [支持markdown语法，根据md文件和js注释生成文档](https://www.npmjs.com/package/mackdoc)

## 快速上手

* [安装]
    * `npm install -g fis-okay`
* 三条命令，满足你的所有开发需求：
    * okay install &lt;name&gt;
    * okay release &#91;options&#93;
    * okay server &lt;command&gt; &#91;options&#93;


## 外部依赖
* fis3 (前端集成解决方案)
* 验证js
* markdown编译
* fis-parser-less (支持css less)
* fis3-parser-sass (支持css sass)
* 打包方式
* fis-deploy-tar (deploy打包tar)
* `handlebars.js`前端模板，需满足以下几点需求
    * 1. 可在模板加载中异步请求其它模板
    * 2. 可在架构内预编译
    * 3. 可方便使用js函数及外部函数
* velocity 主要实现可继承
* 多模块支持
* okay-upload 远程服务器部署
* 可本地启动jetty or tomcat, 可自模拟API接口和模板变量


## 目录结构
    teacher
        --components
        	--common (无界面的公共功能模块)
        		--submit
        			index.js
        		--dialog
        			--img
        			index.js
        			index.tmpl
        			index.scss
        		--class
        		--event
        	--widget
        		--menu
        			index.js
        			index.html
        		--list
        			index.js
        			index.tmpl
        		--submit
        	--page
        		--group-question
        			--chapter
        				index.html
        				index.js
        			--knowledge
        				index.html
        				index.js
        	--lib (第三方)
        --doc (markdown)
        --output (编译产出)
        --views (实体页面)
        	--group-question
        		index.vm
        		router.js
        okay-conf.js
        server.conf (api及模板变量路由)


## okay-conf打包配置


## 待续
* html压缩 (html-minifier, 遇到`<a href="{%...%}">...</a>`此类代码会抛出异常)


> 本前端开发解决方案基于fis二次封装，如需进一步了解请移驾到[这里](https://github.com/fex-team/fis3)。
