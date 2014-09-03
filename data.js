var q = require('q');
var fs = require('fs');
var async = require('async');
var cheerio = require('cheerio');
var request = require('request');
var path = require('path');
var CSVConverter=require("csvtojson").core.Converter;


var csvConverter=new CSVConverter();
var data = null;

function getPicUrl(item, done){
  var id = item["商户ID"];
  request('http://m.dianping.com/shop/' + id,function(err, res, html){
    if(err){
      return done(err);
    }
    var $ = cheerio.load(html);
    try{
      item['商户图片'] = $(".pic img").attr("src").replace("_s.jpg","_m.jpg");
    }catch(e){
      console.log(e,id);
    }
    //console.log(item['商户图片'],"fetched");
    done(null,item);
  });
}

function deal(data,done){
  async.map(data, getPicUrl, function(err, results){
    if(err){
      done(err);
    }else{
      done(null, split(results));
    }
  });

}

function split(data){
  var result = {};
  data.forEach(function(item){
    var name = item['景点'];
    if(!result[name]){
      result[name] = [];
    }
    result[name].push(item);
  });
  return result;
}

function santitize(data){

  for(var loc in data){
    data[loc] = data[loc].map(function(item){
      if(["NULL","暂无"].indexOf(item['人均'])!==-1){
        item['人均'] = "";
      }
      return item;
    });
  }

  return data;
}

exports.get = function(cityNameP){
  var filename = '../data/'+cityNameP+'/origin.csv';
  var parsedFilePath = "../data/" + cityNameP + "/parsed.json";
  var exists = fs.existsSync(parsedFilePath);
  var deferred = q.defer();
  var content;
  if(exists){
    content = fs.readFileSync(parsedFilePath);
    deferred.resolve(santitize(JSON.parse(content)));
  }else{
    content = fs.readFileSync(filename).toString();
    if(data){
      deferred.resolve(santitize(data));
    }else{
      csvConverter.on("end_parsed", function(d) {
        deal(d, function(err, d){
          if(err){
            deferred.reject(err);
          }else{
            data = d;
            fs.writeFileSync(parsedFilePath,JSON.stringify(data,null,2));
            deferred.resolve(santitize(data));
          }
        });
      });
      csvConverter.fromString(content,function(err,data){});
    }
  }
}
