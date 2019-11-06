//收藏
var user_email;
var user_token;
var user_id;
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
          user_id = res.rows.item(0)['id']
          $.ajax({
            headers: {
              "Authorization": "Token " + user_token + ""
            },
            type: "GET",
            url: "http://140.131.114.157/posts/likes",
            error: function (err) {
              alert(JSON.stringify(err))
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
                  $(".content").append(post)

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


function collection(id) {
  $("#post" + id + "").toggleClass("selectcolor");

  $.ajax({
    headers: {
      "Authorization": "Token " + user_token + ""
    },
    type: "POST",
    url: "http://140.131.114.157/posts/" + id + "/like",
    error: function (err) {
      alert(JSON.stringify(err))
    }
  })
}