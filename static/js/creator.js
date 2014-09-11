(function(){

  var cityList = [];

  function readFileText(fileinput, callback){
    var reader = new FileReader();
    reader.onloadend = function(e){
      callback(e.target.result);
    }
    reader.readAsText(fileinput.files[0]);
  }

  function readFileDataURL(fileinput, callback){
    var reader = new FileReader();
    reader.onloadend = function(e){
      callback(e.target.result);
    }
    reader.readAsDataURL(fileinput.files[0]);
  }

  function getFileNames(fileinput, callback){
    var files = Array.prototype.slice.apply(fileinput.files);
    return files.map(function(file){
      return {
        name: file.name,
        basename: file.name.split(".")[0],
        ext: file.name.split(".")[1]
      }
    });
  }

  function getCityList(csv){
    var cityList = [];
    csv.split("\n").slice(1).forEach(function(row){
      var items = row.split(",");
      var cityName = items[0];
      if(cityList.indexOf(cityName) === -1){
        cityList.push(cityName)
      }
    });

    return cityList;
  }

  function saveForm(form, key){
    var data = {};
    form.find("input[type=text]").each(function(i,el){
      var $el = $(el);
      data[$el.attr("name")] = $el.val();
    });

    localStorage.setItem(key, JSON.stringify(data));
  }

  function loadForm(key, form){
    var data = JSON.parse(localStorage.getItem(key));
    for(var k in data){
      form.find("[name=" + k + "]").val(data[k]);
    }
  }

  function showError(fileinput, message){
    var error_hint = $(fileinput).parent().find(".error-hint");
    error_hint.text(message).show()
  }

  function hideError(fileinput){
    var error_hint = $(fileinput).parent().find(".error-hint");
    error_hint.hide();
  }

  function checkType(fileinput, ext){
    var ok = Array.prototype.slice.apply(fileinput.files).every(function(file){
      return file.name.indexOf(ext) !== -1;
    });

    if(!ok){
      showError(fileinput, "扩展名不匹配" + ext);
    }else{
      hideError(fileinput);
    }

    return ok;
  }

  function checkLength(fileinput){
    var ok = fileinput.files.length == cityList.length;
    if(!ok){
      showError(fileinput,"图片张数不匹配");
    }else{
      hideError(fileinput);
    }
    return ok;
  }

  $("#csv").on("change", function(){
    if(checkType(this,".csv")){
      readFileText(this, function(csv){
        $("#pics").prop("disabled",false);
        $("#maps").prop("disabled",false);
        cityList = getCityList(csv);
        $(".citylist").text(cityList.join(","));
      });
    }
  });

  $("#banner").on("change", function(){
    if(!checkType(this, ".png")){
      return;
    }

    var el = $(this);
    var pic = el.next(".pic");
    readFileDataURL(this, function(dataurl){
      var img = $("<img />");
      img.attr("src",dataurl);
      pic.empty().append(img);
    });
  });

  $("#pics").on("change", function(){
    if(!checkType(this, ".jpg") || !checkLength(this)){
      return;
    }

    var names = getFileNames(this);
    var error_message = null;

    for(var i=0; i < names.length; i++){
      var name = names[i];
      if(cityList.indexOf(name.basename) === -1){
        error_message = "不匹配数据的图片文件名：" + name.name;
        break;
      }
    }

    if(error_message){
      showError(this, error_message);
    }else{
      hideError(this);
    }
  });

  $("#maps").on("change", function(){
    if(!checkType(this, ".jpg") || !checkLength(this)){
      return;
    }
    var names = getFileNames(this);
    var error_message = null;

    for(var i=0; i < names.length; i++){
      var name = names[i];
      if(cityList.indexOf(name.basename) === -1){
        error_message = "不匹配数据的图片文件名：" + name.name;
      }
    }

    var error_hint = $(this).next(".error-hint");
    if(error_message){
      showError(this, error_message);
    }else{
      hideError(this);
    }
  });

  var generating = false;
  var socket = io.connect('http://localhost');
  socket.on('step', function (data) {
    $("<p />").html(data).appendTo($("#console"));
  });

  window.onbeforeunload = function(){
    //- return false
    return generating ? "正在生成文件，确认要关闭当前窗口么" : undefined;
  }

  // deserialize form
  loadForm('fields',$("form"));
  $("form").on("submit",function(){
    if($(".error-hint:visible").length){
      alert("还有字段不对呢");
      return false;
    }


    generating = true;
    $('#console-modal').modal({
      backdrop:"static"
    });
    $("#console").empty();
    // serialize form
    saveForm($("form"),'fields');
    $.ajax({
      url: '/generate',
      data: new FormData($('form')[0]),
      processData: false,
      contentType: false,
      type: 'POST'
    }).done(function(){
      alert("生成成功！");
      location.href = "/preview/" + $("[name=cityName]").val() + "/foodmap/";
    }).fail(function(xhr){
      $('#console-modal').modal('hide');
      alert(xhr.responseJSON.message);
    }).complete(function(){
      generating = false;
    });
    return false;
  });

})();