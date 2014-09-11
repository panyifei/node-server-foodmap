var fse = require('fs-extra');

fse.move("./a","./b",{clobber:true},function(){
  console.log(arguments);
});