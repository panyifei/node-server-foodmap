var mkdirp = require('mkdirp');
var path = require('path')
var async = require('async');
var fse = require('fs-extra');
var fs = require('fs');
var spawn = require('child_process').spawn;

function validate(done){
  var body = this.body;
  var required = ['cityId','cityEnName','cityName','pdf','thumbnail'];
  var i,k;
  for(i = 0; i < required.length; i++){
    k = required[i];
    if(!body[k]){
      return done(k + ' required');
    }
  }

  var files = this.files;
  var required_files = ['csv','banner','maps','pics'];

  for(i = 0; i < required_files.length; i++){
    k = required_files[i];
    if(!files[k]){
      return done(k + ' required');
    }
  }

  var cityFolder = path.join(__dirname, '..', '..', 'dest', body.cityEnName);
  fs.exists(cityFolder, function(exists){
    if(exists){
      return done(body.cityEnName + " already exists");
    }
    done(null);
  });
}

function generateMeta(done){
  this.sockets.emit('step','generating meta');
  var body = this.body;
  var meta = {};

  var cityFolder = path.join(__dirname, '..', '..', 'data', body.cityEnName);

  mkdirp(cityFolder,function(err){
    if(err){
      return done(err);
    }
    fs.writeFile(path.join(cityFolder,'meta.json'), JSON.stringify(body, null, 4), done);
  });
}

function moveData(done){
  this.sockets.emit('step','move data');
  var cityFolder = path.join(__dirname, '..', '..', 'data', this.body.cityEnName);
  fse.move(this.files.csv.path, path.join(cityFolder, 'origin.csv'), {clobber:true}, done);
}


function moveBanner(done){
  this.sockets.emit('step','move banner');
  var bannerFolder = path.join(__dirname, '..', '..', 'img', 'banner', this.body.cityEnName);
  fse.move(this.files.banner.path, path.join(bannerFolder, 'banner.png'), {clobber:true}, done);
}

function movePics(done){
  this.sockets.emit('step','move pics');
  var picFolder = path.join(__dirname, '..', '..', 'pics', this.body.cityEnName);
  async.map(this.files.pics, function(pic, done){
    fse.move(pic.path, path.join(picFolder, pic.originalname), {clobber:true}, done);
  }, done);
}

function moveMaps(done){
  this.sockets.emit('step','move maps');
  var picFolder = path.join(__dirname, '..', '..', 'maps', this.body.cityEnName);
  async.map(this.files.maps, function(pic, done){
    fse.move(pic.path, path.join(picFolder, pic.originalname), {clobber:true}, done);
  }, done);
}

function runGulp(done){
  this.sockets.emit('step','run gulp');

  var process = spawn('gulp',['--city',this.body.cityEnName]);

  function log(data){
    var message = data.toString();
    console.log(message);
    this.sockets.emit('step',message);
  }

  process.stdout.on('data',log.bind(this));
  process.stderr.on('data',log.bind(this));
  process.on('close', done);
}

var generating = false;

module.exports = function(io){
  return function(req, res, next){
    req.sockets = io.sockets;

    if(generating){
      return res.status(400).send({message:"其他人正在生成"});
    }

    generating = true;

    async.series([
      validate.bind(req),
      generateMeta.bind(req),
      moveData.bind(req),
      moveBanner.bind(req),
      movePics.bind(req),
      moveMaps.bind(req),
      runGulp.bind(req)
    ],function(err){
      generating = false;
      if(err){
        return res.status(500).send({message:err});
      }
      res.status(200).send({message:"ok"});

    });
  }
}