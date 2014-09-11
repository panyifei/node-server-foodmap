var fs = require('fs');
var path = require('path');

var dirs = fs.readdirSync(__dirname);

console.log(dirs);

var obj = {};

dirs.forEach(function(file){
  if(file !== "index.js"){
    obj[file.replace(/\.js$/,'')] = require( path.join(__dirname, file) );
  }
});

module.exports = obj;