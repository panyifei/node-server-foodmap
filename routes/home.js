var fs = require('fs');
var path = require('path');
var async = require('async');

module.exports = function(req,res,next){
  var destDir = path.join(__dirname,'../../dest');
  var trashDir = path.join(__dirname,'../../trash');
  var isHome = req.url == "/";
  var baseDir = isHome ? destDir : trashDir;
  var dataDir = path.join(__dirname,'../../data');
  var cities = [];

  async.waterfall([
    function(done){
      fs.readdir(baseDir, done);
    },
    function(dirs, done){
      var metas = dirs.map(function(dirname){
        return path.join(dataDir, dirname, 'meta');
      });

      async.filter(metas, function(metapath, done){
        try{
          require(metapath);
        }catch(e){
          return done(false);
        }
        return done(true);
      }, function(metas){
        done(null, metas);
      });
    },
    function(metas,done){
      async.map(metas, function(metapath, done){
        var err;
        try{
          var meta = require(metapath);
          meta.cityEnName = path.basename(path.dirname(metapath));
        }catch(e){
          err = e;
        }
        done(err, meta);
      }, done);
    }
  ],function(err,list){
    if(err){
      return next(err);
    }

    res.render('home',{
      isHome: isHome,
      cities: list
    });
  });
}