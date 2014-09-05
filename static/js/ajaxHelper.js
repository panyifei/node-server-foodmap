$(document).ready(function(){

    var siteNames=[];

    //阻止表单默认
    $(".nosubmitform").on("submit",function(e){
        e.preventDefault();
    });
    //发送添加meta文件的请求
    $('#addMeta').click(function(){
        $.ajax({ type:"POST",
                 url: "./addmeta", 
                 data: {
                     cityid:$("input[name='cityid']").val(),
                     cityname:$("input[name='cityname']").val(),
                     title:$("input[name='title']").val(),
                     pdfLink:$("input[name='pdfLink']").val(),
                     thumbnail:$("input[name='thumbnail']").val(),
                     shareDesc:$("input[name='shareDesc']").val(),
                     priceConvert:$("input[name='priceConvert']").val()
                        }, 
                 success: function(data){
                    if(data.status==='ok'){
                        changeToNextState($('#addMetaDiv'),$('#addMetaCollapse'),$('#uploadCsvCollapse'));
                    }
                }});

    });

    //上传csv文件
    $("#csvBox, #csvMultiple").html5Uploader({
            name: "csv",
            postUrl: "./uploadCsv" ,
            onSuccess:function(){
                $('#showCsvStatus').text('生成数据中...');
                console.log('上传成功');
                $.ajax({
                 type:"POST",
                 url: "./parsedJson", 
                 data: {
                     cityname:$("input[name='cityname']").val(),
                        }, 
                 success: function(data){
                    if(data.status==='ok'){
                         console.log('parsedJson生成成功');
                         $('#showCsvStatus').text('数据生成成功');
                         var str = '';
                         data.siteNames.forEach(function(value,index,array){
                             str = str + value + ";";
                         });
                         siteNames=data.siteNames;
                         $('#showSiteNames').text(str);
                         changeToNextState($('#uploadCsvDiv'),$('#uploadCsvCollapse'),$('#uploadPicCollapse'));
                    }
                }});
            }
    });

    //上传banner图片
    $("#bannerBox, #bannerMultiple").html5Uploader({
            name: "banner",
            postUrl: "./uploadBanner" ,
            onClientLoad:function(e, file ,imgUrl){
                var img = document.createElement('img');
                var span = document.createElement('span');
                $(img).css('width','150px');
                $(span).text(file.name);
                img.src = imgUrl;
                var newdiv = document.createElement('div');
                newdiv.appendChild(img);
                newdiv.appendChild(span);
                $("#previewBannerDiv").empty();
                document.getElementById("previewBannerDiv").appendChild(newdiv);
            },
            onSuccess:function(){
                console.log('上传Banner成功');
                $.ajax({
                 type:'POST',
                 url: "./bannerMove", 
                 data: {
                    cityname:$("input[name='cityname']").val(),
                 }, 
                 success: function(data){
                    if(data.status==='ok'){
                         console.log('banner生成成功');
                    }
                }});
            }
    });



    //上传商家图片
    $("#picturesBox, #picturesMultiple").html5Uploader({
            name: "pictures",
            postUrl: "./uploadPictures" ,
            onClientLoad:function(e, file ,imgUrl){
                var img = document.createElement('img');
                var span = document.createElement('span');
                $(img).css('width','150px');
                $(span).text(file.name);
                var ifExist = siteNames.some(function(value,index,array){
                    value+='.jpg';
                    return value === file.name;
                });
                if(!ifExist){
                    $(span).css('color','red');
                }
                img.src = imgUrl;
                var newdiv = document.createElement('div');
                newdiv.appendChild(img);
                newdiv.appendChild(span);
                document.getElementById("previewPicturesDiv").appendChild(newdiv);
            },
            onSuccess:function(){
                console.log('上传pictures成功');
            }
    });

    $('#rePicturesUpload').click(function(){
        $.ajax({
                 type:"GET",
                 url: "./rePicturesUpload", 
                 success: function(data){
                    if(data.status==='ok'){
                         console.log('删去已上传商家图片');
                         $('#previewPicturesDiv').empty();
                         $('#previewMapDiv').empty();
                    }
        }});
    });


    //上传map图片
    $('#mapPicBox, #mapPicMultiple').html5Uploader({
            name: "mapPic",
            postUrl: "./uploadMapPic" ,
            onClientLoad:function(e, file ,imgUrl){
                var img = document.createElement('img');
                var span = document.createElement('span');
                $(img).css('width','150px');
                $(span).text(file.name);
                var ifExist = siteNames.some(function(value,index,array){
                    value+='.jpg';
                    return value === file.name;
                });
                if(!ifExist){
                    $(span).css('color','red');
                }
                img.src = imgUrl;
                var newdiv = document.createElement('div');
                newdiv.appendChild(img);
                newdiv.appendChild(span);
                document.getElementById("previewMapDiv").appendChild(newdiv);
            },
            onSuccess:function(){
                console.log('上传map图片成功');
            }
    });

    $('#reMapPicUpload').click(function(){
        $.ajax({
                 type:"GET",
                 url: "./reMapPicUpload", 
                 success: function(data){
                    if(data.status==='ok'){
                         console.log('删去已上传图片');
                         $('#previewMapDiv').empty();
                    }
        }});
    });


    //所有图片上传完毕
    $('#uploadPicDoneBtn').click(function(){
                $.ajax({
                     type:"POST",
                     url: "./allPicUpDone", 
                     data: {
                         cityname:$("input[name='cityname']").val(),
                            }, 
                     success: function(data){
                        if(data.status==='ok'){
                             console.log('所有图片上传成功');
                             changeToNextState($('#uploadPicDiv'),$('#uploadPicCollapse'),$('#finalBuildCollapse'));
                             $('#mapBuildStatus').text('地图正在生成中...');
                             //发送一个最后的build请求
                             $.ajax({
                             type:'POST',
                             url: "./buildFoodmap", 
                             data: {
                                cityname:$("input[name='cityname']").val(),
                             }, 
                             success: function(data){
                                if(data.status==='ok'){
                                     console.log('build成功');
                                     $('#mapBuildStatus').text('地图生成完毕');
                                     $('#downloadFoodmapBtn').removeAttr('disabled');
                                     $('#downloadFoodmapBtn').attr('data-url',data.url);
                                     $('#showFoodmapA').removeAttr('disabled');
                                     $('#showFoodmapA').attr('href',data.showurl);
                                }
                            }});
                        }
                }});
    });


    $('#downloadFoodmapBtn').click(function(){
        location.href=$('#downloadFoodmapBtn').attr('data-url');
        changeToNextState($('#finalBuildDiv'),$('#finalBuildCollapse'),null);
    });
    

    //转换状态
    function changeToNextState(thisDiv,thisCo,nextCo){
        thisDiv.removeClass('bs-callout-danger').addClass('bs-callout-info');
        thisCo.collapse('hide');
        if(nextCo !== null)
        nextCo.collapse('show');
    }

    // //上传csv文件
    // $('#uploadCsv').click(function(){
    // });


});