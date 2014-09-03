$(document).ready(function(){

    

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
                         changeToNextState($('#uploadCsvDiv'),$('#uploadCsvCollapse'),$('#uploadPicCollapse'));
                    }
                }});
            }
    });

    //上传banner图片
    $("#bannerBox, #bannerMultiple").html5Uploader({
            name: "banner",
            postUrl: "./uploadBanner" ,
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
            onSuccess:function(){
                console.log('上传pictures成功');
            }
    });

    //上传map图片
    $('#mapPicBox, #mapPicMultiple').html5Uploader({
            name: "mapPic",
            postUrl: "./uploadMapPic" ,
            onSuccess:function(){
                console.log('上传map图片成功');
            }
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
                                     $('#downloadFoodmapBtn').removeAttr('disabled');
                                     $('#downloadFoodmapBtn').attr('data-url',data.url);
                                }
                            }});
                        }
                }});
    });


    $('#downloadFoodmapBtn').click(function(){
        location.href=$('#downloadFoodmapBtn').attr('data-url');
    });
    

    //转换状态
    function changeToNextState(thisDiv,thisCo,nextCo){
        thisDiv.removeClass('bs-callout-danger').addClass('bs-callout-info');
        thisCo.collapse('hide');
        nextCo.collapse('show');
    }

    // //上传csv文件
    // $('#uploadCsv').click(function(){
    // });


});