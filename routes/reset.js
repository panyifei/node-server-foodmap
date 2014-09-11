var path = require('path');
var fse = require('fs-extra');
module.exports = function(req,res){
  var cityName = req.params.cityName;
  var destFolder = path.join(__dirname, '..', '..', 'dest', cityName);
  var trashFolder = path.join(__dirname, '..', '..', 'trash', cityName);
  fse.move(trashFolder, destFolder, function(err){
    if(err){
      res.status(500).send({message:err});
    }else{
      res.redirect("/");
    }
  });
}