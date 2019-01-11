/**
 * 记录每个文件袋compile耗时, 单位是ms（毫秒）
 */

var compileLog = {};

fis.on('compile:start', function (ret) {
    compileLog[ret.id] = +new Date();
});

fis.on('compile:end', function(ret){
	compileLog[ret.id] = (+new Date()) - compileLog[ret.id];
})

var fs = require('fs');
fis.on('release:end', function(){
	var keys = Object.keys(compileLog), arr = [];
	for(var i = 0 ; i< keys.length; i++){
		arr.push({key: keys[i], time: compileLog[keys[i]]});
	}
	fs.writeFile('./compile-'+ (+new Date) +'-.log', JSON.stringify(arr.sort(function(a,b){return b.time - a.time ;}), null, 4), {}, function(err){
		!err && console.log('write a compile log');
	}  )
});