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
          var nickname = res.rows.item(0)['nickname']
          let urlParams = new URLSearchParams(window.location.search);
          var postid = urlParams.get('post');
          $.ajax({
            headers: {
              "Authorization": "Token " + user_token + ""
            },
            type: "GET",
            url: "http://140.131.114.157/posts/" + postid + "",
            error: function (err) {
              alert("請開啟網路連線")
            },
            success: function (res) {
              if (nickname == res.nickname) {
                $("#postmore").addClass("ion-md-more")
                $("#edittitle").val(res.title);
                $("#editcontent").val(res.content);
                $("#editshowimg").css('display', 'block');
                $("#editshowimg").attr('src', res.image);
                $("#editcategory").val(res.category);
                $('#editpostsend').attr('onclick', 'editpostsend("' + res.id + '")');
                $("#delpostname").html(res.title);
                $('#deletepost').attr('onclick', 'deletepost("' + res.id + '")');

              }
              $("#posttitle").html(res.title);

              var content = res.content.replace(/ /g, "&nbsp;");
              content = content.replace(/\n/g, "<br />");
              // var content = res.content.replace(/\n/g, "<br />");

              $("#postcontent").html(content);
              $("#postsource").append(res.source);
              var obj = document.getElementById("postimg");
              obj.src = res.image;
              if (res.liked == true) {
                $("#post").addClass("selectcolor");
              }

            }
          })
        }
      });
  });
}

function collection() {
  $("#post").toggleClass("selectcolor");
  let urlParams = new URLSearchParams(window.location.search);
  var id = urlParams.get('post');
  $.ajax({
    headers: {
      "Authorization": "Token " + user_token + ""
    },
    type: "POST",
    url: "http://140.131.114.157/posts/" + id + "/like",
    error: function (err) {
      alert("請開啟網路連線")
    }
  })
}

// 三個點點
function postmore(id) {
  $("#editpost").modal('show');
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
      location.reload();
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
      history.back();
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