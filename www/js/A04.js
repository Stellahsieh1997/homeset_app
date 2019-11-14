$("#title").change(function () {
  $("#addtitlewarn").html("");
});
$("#content").change(function () {
  $("#addcontentwarn").html("");
});
$("#edittitle").change(function () {
  $("#edittitlewarn").html("");
});
$("#editcontent").change(function () {
  $("#editcontentwarn").html("");
});

var user_email;
var user_token;
document.addEventListener("deviceready", onDeviceReady, false);
var db;
function onDeviceReady() {
  db = window.sqlitePlugin.openDatabase({
    name: 'my.db',
    location: 'default',
  });
  //提醒跳轉
  cordova.plugins.notification.local.on("click", function (notification) {
    window.location.href = 'T01_edit.html?thing=' + notification.thingId + ''
  });

  db.transaction(function (tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS user (id integer primary key, email text, token text, nickname text, backup text)');
  });

  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM user', [],
      function (tx, res) {
        var len = res.rows.length;
        if (res.rows.length >= 1) {
          user_email = res.rows.item(0)['email']
          user_token = res.rows.item(0)['token']

          $.ajax({
            headers: {
              "Authorization": "Token " + user_token + ""
            },
            url: "http://140.131.114.157/posts/my",
            type: "GET",
            success: function (res) {
              if (res.length >= 1) {
                $(".posts").html("");
                for (i = res.length - 1; i >= 0; i--) {
                  var category
                  switch (parseInt(res[i].category)) {
                    case 1:
                      category = "客廳";
                      break;
                    case 2:
                      category = "廚房";
                      break;
                    case 3:
                      category = "臥室";
                      break;
                    case 4:
                      category = "浴室";
                      break;
                    case 5:
                      category = "技巧";
                      break;
                    case 6:
                      category = "設計";
                      break;
                    default:
                      category = "無類別";
                  }
                  var title = res[i].title;
                  if (title.length > 25) {
                    title = res[i].title.substr(0, 24) + "...";
                  }
                  var post = `<div style="position: relative">
                                          <i class="icon collection ion-md-heart" id="post`+ res[i].id + `" onclick="collection('` + res[i].id + `')"></i>
                                          <i id="postmore" onclick='postmore("`+ res[i].id + `")' class='icon ion-md-more imore'></i>
                                          <p class="likes" id="likes`+ res[i].id + `">` + res[i].likes + `人收藏 </p>
                                          <a href="A03.html?post=`+ res[i].id + `">
                                              <div class="row card1 border rounded">
                                                  <div class="col left rounded-left ">
                                                      <img src="`+ res[i].image + `">
                                                  </div>
                                                  <div class="col right rounded-right ">
                                                      <h5>`+ category + `收納</h5>
                                                      <h4>`+ title + `</h4>
                                                  </div>
                                              </div>
                                          </a>
                                      </div>`
                  $(".posts").append(post)

                  if (res[i].liked == true) {
                    $("#post" + res[i].id + "").addClass("selectcolor");
                  }

                }
              } else {
                var post = `<div class="objcenter">
                                              在此的貼文將會向所有人公開，同步分享至收納資訊上。
                                          </div>`
                $(".posts").html(post)
              }
            }
          })



        }
      });
  });
}



//新增文章
$('#insertpost').click(function () {
  var addtitle = $("#title").val();
  if (!addtitle) {
    $('#addtitlewarn').html('<i class="icon ion-md-information-circle"></i>');
    $('#addtitlewarn').append("請輸入標題");
    return
  }
  var addimage = document.getElementById("image").files[0];
  if (!addimage) {
    $('#addimagewarn').html('<i class="icon ion-md-information-circle"></i>');
    $('#addimagewarn').append("請上傳圖片");
    return
  }
  var addcontent = $('#content').val();
  if (!addcontent) {
    $('#addcontentwarn').html('<i class="icon ion-md-information-circle"></i>');
    $('#addcontentwarn').append("請輸入文章內容");
    return
  }
  var formData = new FormData();
  formData.append('title', $('#title').val())
  formData.append('category', $('#category').val())
  formData.append('image', document.getElementById("image").files[0])
  formData.append('content', $('#content').val())
  $.ajax({
    headers: {
      "Authorization": "Token " + user_token + ""
    },
    url: "http://140.131.114.157/posts",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: function (data) {
      location.href = "A04.html";
    },
    error: function (err) {
      location.href = "A04.html";
    }
  })
})

//form 預覽圖片
function readURL(input) {
  if (input.files && input.files[0]) {
    $("#showimg").css('display', 'block');
    var reader = new FileReader();
    reader.onload = function (e) {
      $("#showimg").attr('src', e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
  }
}
$("#image").change(function () {
  readURL(this);
});

//收藏
function collection(id) {
  $("#post" + id + "").toggleClass("selectcolor");

  $.ajax({
    headers: {
      "Authorization": "Token " + user_token + ""
    },
    type: "POST",
    async: false,
    url: "http://140.131.114.157/posts/" + id + "/like",
    error: function (err) {
      alert("請開啟網路連線")
    }
  })

  $.ajax({
    headers: {
      "Authorization": "Token " + user_token + ""
    },
    type: "GET",
    async: false,
    url: "http://140.131.114.157/posts/" + id + "",
    success: function (res) {

      $("#likes" + id + "").html(res.likes + "人收藏 ");
      // alert(JSON.stringify(res))
    }
  })
}
// 三個點點
function postmore(id) {
  $("#editpost").modal('show');

  $.ajax({
    headers: {
      "Authorization": "Token " + user_token + ""
    },
    type: "GET",
    url: "http://140.131.114.157/posts/" + id + "",
    error: function (err) {
      alert("請開啟網路連線")
    },
    success: function (res) {
      $("#edittitle").val(res.title);
      $("#editcontent").val(res.content);
      $("#editshowimg").css('display', 'block');
      $("#editshowimg").attr('src', res.image);
      $("#editcategory").val(res.category);
      $('#editpostsend').attr('onclick', 'editpostsend("' + res.id + '")');
      $("#delpostname").html(res.title);
      $('#deletepost').attr('onclick', 'deletepost("' + res.id + '")');
    }
  })
}

//確認刪除文章
function deletepost(id) {
  $.ajax({
    headers: {
      "Authorization": "Token " + user_token + ""
    },
    url: "http://140.131.114.157/posts/" + id + "",
    type: "DELETE",
    success: function (data) {
      location.href = "A04.html";
    }
  })
}



//確認修改文章
function editpostsend(id) {
  var edittitle = $("#edittitle").val();
  if (!edittitle) {
    $('#edittitlewarn').html('<i class="icon ion-md-information-circle"></i>');
    $('#edittitlewarn').append("請輸入標題");
    return
  }
  var editcontent = $('#editcontent').val();
  if (!editcontent) {
    $('#editcontentwarn').html('<i class="icon ion-md-information-circle"></i>');
    $('#editcontentwarn').append("請輸入文章內容");
    return
  }
  var formData = new FormData();
  formData.append('title', $('#edittitle').val())
  formData.append('category', $('#editcategory').val())
  formData.append('content', $('#editcontent').val())
  var editimage = document.getElementById("editimage").files[0];
  if (!editimage) {

  } else {
    formData.append('image', document.getElementById("editimage").files[0])
  }
  $.ajax({
    headers: {
      "Authorization": "Token " + user_token + ""
    },
    url: "http://140.131.114.157/posts/" + id + "",
    type: "PATCH",
    data: formData,
    processData: false,
    contentType: false,
    success: function (data) {
      location.href = "A04.html";
    }
  })

}

//form 修改的預覽圖片
function editreadURL(input) {
  if (input.files && input.files[0]) {
    $("#editshowimg").css('display', 'block');
    var reader = new FileReader();
    reader.onload = function (e) {
      $("#editshowimg").attr('src', e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
  }
}
$("#editimage").change(function () {
  editreadURL(this);
});


//關閉修改文章互動視窗
function closespace() {
  $("#editpost").modal('hide');
}