var express = require("express");
var bodyParser = require("body-parser");
var multer = require('multer');
var fs = require('fs-extra')
var parser = require('./data');
var exec  = require('child_process').exec;
var archiver = require('archiver');
var url = require('url');
var app = express();


app.use('/', express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: false }));


// //预览
app.use('/preview',express.static(require('path').join(__dirname, '/../dest')));

    //第一步，添加meta
    app.use('/addmeta',function(req, res){
        var cityId = req.body.cityid;
        var cityname = req.body.cityname;
        var cityNameArr = cityname.split(";");
        var cityName = cityNameArr[0];
        var cityNameP = cityNameArr[1];
        var title = req.body.title;
        var pdfLink = req.body.pdfLink;
        //下面3个可选
        var thumbnail = req.body.thumbnail;
        var shareDesc = req.body.shareDesc;
        var priceConvert = req.body.priceConvert;
        var data = "module.exports = {\n"+
          "'cityId':"+cityId+",\n"+
          "'cityName':'"+cityName+"',\n"+
          "'title':'"+title+"',\n"+
          "'pdf':'"+pdfLink+"',\n";
          if(thumbnail !== ""){
            data = data +"'thumbnail':'" +  thumbnail  + "',\n";
          }
          if(shareDesc !== ''){
            data = data + "'shareDesc':'" + shareDesc + "',\n";
          }
          if(priceConvert !== ''){
            data = data +  "'priceConvert': function(price){ return " + priceConvert + "}\n}";
          }else{
            data = data + '}';
          }
          

        fs.mkdir('../data/'+cityNameP,function(err){
            if (err) {};//出错代表有文件了，直接改写
            fs.writeFile('../data/'+cityNameP+'/meta.js', data , function (err) {
                if (err) throw err;
                res.status(200).send({status:'ok'});
            });
        });
    });


    //上传Csv文件
    app.use('/uploadCsv',multer({ 
      dest: './uploads/',
      rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase()
      },
    }),function(req, res){
      res.status(200).send({status:'ok'});
    });


    //转换成parsedJson
    app.use('/parsedJson',function(req, res){
      var cityname = req.body.cityname;
      var cityNameP = cityname.split(";")[1];
      //转文件到城市下
      fs.renameSync('./uploads/origin.csv', '../data/'+cityNameP+'/origin.csv');

      fs.remove('../data/'+cityNameP+'/parsed.json', function(err){
          if (err) {}
          //转换成parsedJson
          var pj = exec ('gulp data --city '+cityNameP,
          function (error, stdout, stderr) {

              //运行完gulp，生成了parsed.json
              
              var jsonString = fs.readFileSync('../data/'+cityNameP+'/parsed.json', {encoding :'utf8'});
              var names = JSON.parse(jsonString);
              var siteNames=[];
              for(key in names){
                siteNames.push(key);
              }
              


              res.status(200).send({status:'ok',siteNames:siteNames});
          });
      });
    });


    //上传banner文件
    app.use('/uploadBanner',multer({ 
      dest: './uploads/',
      rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase()
      },
    }),function(req, res){
      res.status(200).send({status:'ok'});
    });

    //移到指定目录
    app.use('/bannerMove',function(req, res){
      var cityname = req.body.cityname;
      var cityNameP = cityname.split(";")[1];
      //新建城市文件夹,再转文件到城市下
      fs.mkdir('../img/banner/'+cityNameP,function(err){
            if (err) {};//出错代表有文件了，直接改写
            fs.renameSync('./uploads/banner.png', '../img/banner/'+cityNameP+'/banner.png');
            res.status(200).send({status:'ok'});
      });
    });


    //上传商家图片包
    app.use('/uploadPictures',multer({ 
      dest: './uploads/pictures',
      rename: function (fieldname, filename) {
        return filename;
      },
    }),function(req, res){
      res.status(200).send({status:'ok'});
    });

    //上传地图包
    app.use('/uploadMapPic',multer({ 
      dest: './uploads/pictures/map',
      rename: function (fieldname, filename) {
        return filename;
      },
    }),function(req, res){
      res.status(200).send({status:'ok'});
    });

    //上传地图包
    app.use('/allPicUpDone',function(req, res){
      var cityname = req.body.cityname;
      var cityNameP = cityname.split(";")[1];
      //新建城市文件夹,再转文件到城市下
      fs.remove('../pics/'+cityNameP, function(err){
        if (err) {}
        fs.mkdir('../pics/'+cityNameP,function(err){
            if (err) {};//出错代表有文件了，直接改写
            //移动文件夹
            fs.move('./uploads/pictures', '../pics/'+cityNameP,function(){
                fs.mkdirSync('./uploads/pictures');
                fs.mkdirSync('./uploads/pictures/map');
                res.status(200).send({status:'ok'});
            });
        });
      });

    });


    //生成最后的地图网址
    app.use('/buildFoodmap',function(req, res){
      var cityname = req.body.cityname;
      var cityNameP = cityname.split(";")[1];
      //调用gulp
      var gu = exec ('gulp --city '+cityNameP,
        function (error, stdout, stderr) {
          console.log('stdout: ' + stdout);
          if (error !== null) {
          console.log('exec error: ' + error);}

          fs.remove('./static/target.zip', function(err){
            if (err) {}
                var output = fs.createWriteStream('./static/target.zip');
                var archive = archiver('zip');

                output.on('close', function () {
                    console.log(archive.pointer() + ' total bytes');
                    console.log('archiver has been finalized and the output file descriptor has closed.');
                });

                archive.on('error', function(err){
                    throw err;
                });

                archive.pipe(output);
                archive.bulk([
                    { expand: true, cwd: '../dest/'+cityNameP, src: ['**/*'], dest: './'+cityNameP}
                ]);
                archive.finalize();

                res.status(200).send({status:'ok',url:"./target.zip",showurl:"../preview/"+cityNameP+'/foodmap'});
          });
       });




    });

    app.listen(3000,function(){
        console.log("started at",3000);
    });