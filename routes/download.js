var temp = require('temp');
var archiver = require('archiver');
var fse = require('fs-extra');
var fs = require('fs');
var path = require('path');

module.exports = function (req, res) {
  var cityName = req.params.cityName;
  var zipfile_path = temp.path({
    suffix: ".zip"
  });
  var zipfile = fs.createWriteStream(zipfile_path);
  var archive = archiver('zip');
  var destFolder = path.join(__dirname, '..', '..', 'dest', cityName);

  fs.exists(destFolder, function (exists) {
    if (!exists) {
      res.status(400).send({
        message: cityName + " not exists"
      });
    } else {
      buildZip(function (err) {
        if (err) {
          return res.status(500).send(err);
        }
        res.sendFile(zipfile_path);
      });
    }
  });

  function buildZip(done) {
    zipfile.on('close', done);

    archive.on('error', done);

    archive.pipe(zipfile);
    archive.bulk([{
      expand: true,
      cwd: destFolder,
      src: ['**/*'],
      dest: './' + cityName
    }]);
    archive.finalize();
  }
}