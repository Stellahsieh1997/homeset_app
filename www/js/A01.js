//收藏
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
    tx.executeSql('CREATE TABLE IF NOT EXISTS page (id integer primary key, home integer, furniture_page integer, search_page integer, post_page integer)');
  });

  db.transaction(function (tx) {

    tx.executeSql("SELECT * FROM page", [],
      function (tx, res) {
        var len = res.rows.length;
        if (res.rows.length >= 1) {
          var post_page = res.rows.item(0)['post_page']
          if (!post_page) {
            $(".lead").css('display', 'block');
          }
        }
      });

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
            type: "GET",
            url: "http://140.131.114.157/posts/likes",
            error: function (err) {
              alert("請開啟網路連線")
            },
            success: function (res) {
              if (res.length >= 1) {
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
                                            <h6 class="nicknamestyle">`+ res[i].nickname + `</h6>
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
                  $("#likepost").append(post)

                  if (res[i].liked == true) {
                    $("#post" + res[i].id + "").addClass("selectcolor");
                  }

                }
              }
            }
          })
        }
      });
  });
}

function lead() {
  $(".lead").css('display', 'none');
  db.transaction(function (tx) {
    tx.executeSql("UPDATE page SET post_page = ? WHERE id = ?", [1, 1]);
  });
}

function collection(id) {
  $("#post" + id + "").toggleClass("selectcolor");

  $.ajax({
    headers: {
      "Authorization": "Token " + user_token + ""
    },
    async: false,
    type: "POST",
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

//跳轉特定頁面應用
// window.handleOpenURL = function (url) {
//     alert(url)
//     location.href = "A04.html";
//     // window.location.hash = url.slice(7) 
// }