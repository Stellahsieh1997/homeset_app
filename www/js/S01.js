//引導頁
function lead() {
  $('.lead').attr('onclick', 'lead2()');
  $(".arrow").css({ "left": "35px", "top": "250px" });
  $(".caption").css("top", "350px");
  $("#leadcaption").html("點選類別按鈕<br>可依照類別進行搜尋")
  $(".know").css("top", "450px");
}
function lead2() {
  $('.lead').attr('onclick', 'lead3()');
  $(".arrow").css({ "left": "140px", "top": "250px" });
  $(".caption").css({ "left": "100px", "top": "350px" });
  $("#leadcaption").html("點選所屬人按鈕<br>可依照所屬人進行搜尋")
  $(".know").css("top", "450px");
}
function lead3() {
  $('.lead').attr('onclick', 'lead4()');
  $(".arrow").css({ "left": "250px", "top": "250px" });
  $(".caption").css({ "left": "120px", "top": "350px" });
  $("#leadcaption").html("點選未放回物品的按鈕<br>可搜尋尚未放回之物品")
  $(".know").css("top", "450px");
}
function lead4() {
  $(".lead").css('display', 'none');
}




//資料庫
document.addEventListener("deviceready", onDeviceReady, false);
var db;
var categorypicker
var ownerpicker
var user_email;
var user_token;
var user_id;
function onDeviceReady() {
  db = window.sqlitePlugin.openDatabase({
    name: 'my.db',
    location: 'default',
  });
  //提醒跳轉
  cordova.plugins.notification.local.on("click", function (notification) {
    window.location.href = 'T01_edit.html?thing=' + notification.thingId + ''
  });

  $("#searchinput").val("");
  db.transaction(function (tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS user (id integer primary key, email text, token text, nickname text, backup text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS thing (id text primary key, name text, description text, image text, category text, owner text, furniture_id text, number integer, layer text, out integer, remind integer, time date, content text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS category (id text primary key, name text, user_id integer)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS owner (id text primary key, name text, user_id integer)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS page (id integer primary key, home integer, furniture_page integer, search_page integer, post_page integer)');
  });

  db.transaction(function (tx) {

    tx.executeSql("SELECT * FROM page", [],
      function (tx, res) {
        var len = res.rows.length;
        if (res.rows.length >= 1) {
          var search_page = res.rows.item(0)['search_page']
          if (!search_page) {
            $(".lead").css('display', 'block');
            tx.executeSql("UPDATE page SET search_page = ? WHERE id = ?", [1, 1]);
          }
        }
      });

    tx.executeSql('SELECT * FROM user', [],
      function (tx, res) {
        var len = res.rows.length;
        if (res.rows.length >= 1) {
          user_email = res.rows.item(0)['email'];
          user_token = res.rows.item(0)['token'];
          user_id = res.rows.item(0)['id'];

          //類別滾輪
          var categoryselect = []
          var categoryselect2 = ['包包', '鞋子', '衣服', '文具', '工具', '玩具', '杯子', '飾品', '化妝品', '眼鏡']
          tx.executeSql('SELECT * FROM category WHERE user_id=?', [res.rows.item(0)['id']],
            function (tx, res) {
              var len = res.rows.length;
              if (res.rows.length >= 1) {
                for (var i = 0; i < len; i++) {
                  categoryselect.push(res.rows.item(i)['name'])
                }
              }
              var categoryselect3 = categoryselect.concat(categoryselect2)
              categorypicker = new MobileSelect({
                trigger: '#categorysearch',
                title: '類別',
                cancelBtnColor: '#f0f0f0',
                ensureBtnColor: '#f0f0f0',
                titleBgColor: '#254F6E',
                titleColor: '#f0f0f0',
                ensureBtnText: '確認',
                wheels: [
                  { data: categoryselect3 }
                ],
                position: [0],
                callback: function (indexArr, data) {
                  searchcate();

                } //初始化定位        

              });

            });


          //所屬人滾輪
          var ownerselect = []
          var ownerselect2 = ['自己', '爸爸', '媽媽', '哥哥', '弟弟', '姊姊', '妹妹', '爺爺', '奶奶', '朋友', '同事']
          tx.executeSql('SELECT * FROM owner WHERE user_id=?', [res.rows.item(0)['id']],
            function (tx, res) {
              var len = res.rows.length;
              if (res.rows.length >= 1) {
                for (var i = 0; i < len; i++) {
                  ownerselect.push(res.rows.item(i)['name'])
                }
              }
              var ownerselect3 = ownerselect.concat(ownerselect2)

              ownerpicker = new MobileSelect({
                trigger: '#ownersearch',
                title: '所屬人',
                cancelBtnColor: '#f0f0f0',
                ensureBtnColor: '#f0f0f0',
                titleBgColor: '#254F6E',
                titleColor: '#f0f0f0',
                ensureBtnText: '確認',
                wheels: [
                  { data: ownerselect3 }
                ],
                position: [0], //初始化定位
                callback: function (indexArr, data) {
                  searchown();
                }
              });
            });


        }
      });
  });

}

function searchcate() {
  $(".upcon2").css('color', '#fff');
  $("#searchinput").val("");
  var ownerValue = $("#ownersearch").text();
  var cateValue = $("#categorysearch").text();

  db.transaction(function (tx) {
    $(".box-wrap").html("")
    tx.executeSql('SELECT * FROM planargraph WHERE user_id = ?', [user_id], function (tx, res) {
      if (res.rows.length >= 1) {
        var len = res.rows.length;
        for (var y = 0; y < len; y++) {
          var tran = function (y) {
            tx.executeSql('SELECT * FROM space WHERE planargraph_id = ?', [res.rows.item(y)['id']],
              function (tx, res) {
                var len = res.rows.length;
                if (res.rows.length >= 1) {
                  for (var i = 0; i < len; i++) {
                    var spaceId = res.rows.item(i)['id'];
                    var tr = function (spaceId) {
                      tx.executeSql('SELECT * FROM furniture WHERE space_id = ?', [spaceId], function (tx, res) {
                        var len = res.rows.length;
                        if (res.rows.length >= 1) {
                          for (var x = 0; x < len; x++) {
                            var furnitureId = res.rows.item(x)['id'];
                            var trans = function (furnitureId) {
                              if (ownerValue != "所屬人") {//呈現所屬人與類別物品
                                db.transaction(function (tx) {
                                  $(".box-wrap").html("")
                                  tx.executeSql('SELECT * FROM thing WHERE furniture_id = ?', [furnitureId], function (tx, res) {
                                    if (res.rows.length >= 1) {
                                      for (var j = 0; j < res.rows.length; j++) {
                                        if (res.rows.item(j)['owner'] == ownerValue && res.rows.item(j)['category'] == cateValue) {
                                          $(".box-wrap").append(`<div class="box">
                                                                                          <a href="T01_edit.html?thing=`+ res.rows.item(j)['id'] + `">
                                                                                          <img src="` + res.rows.item(j)['image'] + `" style=width:100%;height:100%>
                                                                                          </a>
                                                                                          </div>`)
                                        }
                                      }
                                    }
                                  });
                                });
                              } else {
                                $(".box-wrap").html("")
                                tx.executeSql('SELECT * FROM thing WHERE furniture_id = ?', [furnitureId], function (tx, res) {
                                  if (res.rows.length >= 1) {
                                    for (var j = 0; j < res.rows.length; j++) {
                                      if (res.rows.item(j)['category'] == cateValue) {
                                        $(".box-wrap").append(`<div class="box">
                                                                                      <a href="T01_edit.html?thing=`+ res.rows.item(j)['id'] + `">
                                                                                      <img src="` + res.rows.item(j)['image'] + `" style=width:100%;height:100%>
                                                                                      </a>
                                                                                      </div>`)
                                      }

                                    }
                                  }
                                });
                              }
                            }(furnitureId)
                          }
                        }

                      });
                    }(spaceId)
                  }
                }
              });
          }(y)
        }
      }
    });
  });
}





function searchown() {
  $("#searchinput").val("");
  $(".upcon2").css('color', '#fff');
  var ownerValue = $("#ownersearch").text();
  var cateValue = $("#categorysearch").text();

  db.transaction(function (tx) {
    $(".box-wrap").html("")
    tx.executeSql('SELECT * FROM planargraph WHERE user_id = ?', [user_id], function (tx, res) {
      if (res.rows.length >= 1) {
        var len = res.rows.length;
        for (var y = 0; y < len; y++) {
          var tran = function (y) {
            tx.executeSql('SELECT * FROM space WHERE planargraph_id = ?', [res.rows.item(y)['id']],
              function (tx, res) {
                var len = res.rows.length;
                if (res.rows.length >= 1) {
                  for (var i = 0; i < len; i++) {
                    var spaceId = res.rows.item(i)['id'];
                    var tr = function (spaceId) {
                      tx.executeSql('SELECT * FROM furniture WHERE space_id = ?', [spaceId], function (tx, res) {
                        var len = res.rows.length;
                        if (res.rows.length >= 1) {
                          for (var x = 0; x < len; x++) {
                            var furnitureId = res.rows.item(x)['id'];
                            var trans = function (furnitureId) {
                              if (cateValue != "類別") {
                                //呈現所屬人與類別物品                                                                        
                                $(".box-wrap").html("");
                                tx.executeSql('SELECT * FROM thing WHERE furniture_id = ?', [furnitureId], function (tx, res) {
                                  if (res.rows.length >= 1) {
                                    for (var j = 0; j < res.rows.length; j++) {
                                      if (res.rows.item(j)['owner'] == ownerValue && res.rows.item(j)['category'] == cateValue) {
                                        $(".box-wrap").append(`<div class="box">
                                                                                          <a href="T01_edit.html?thing=`+ res.rows.item(j)['id'] + `">
                                                                                          <img src="` + res.rows.item(j)['image'] + `" style=width:100%;height:100%>
                                                                                          </a>
                                                                                          </div>`)
                                      }
                                    }
                                  }
                                });

                              } else { //單一所屬人搜尋                                                                         
                                $(".box-wrap").html("");
                                tx.executeSql('SELECT * FROM thing WHERE furniture_id = ?', [furnitureId], function (tx, res) {
                                  if (res.rows.length >= 1) {
                                    for (var j = 0; j < res.rows.length; j++) {
                                      if (res.rows.item(j)['owner'] == ownerValue) {
                                        $(".box-wrap").append(`<div class="box">
                                                                                      <a href="T01_edit.html?thing=`+ res.rows.item(j)['id'] + `">
                                                                                      <img src="` + res.rows.item(j)['image'] + `" style=width:100%;height:100%>
                                                                                      </a>
                                                                                      </div>`)
                                      }

                                    }

                                  }
                                });
                              }
                            }(furnitureId)
                          }
                        }

                      });
                    }(spaceId)
                  }
                }
              });
          }(y)
        }
      }
    });
  });
}

function outgood() {
  
  $(".upcon2").css('color', '#ffee00');
  $("#searchinput").val("");
  $("#categorysearch").text("類別");
  $("#ownersearch").text("所屬人");
  db.transaction(function (tx) {
    $(".box-wrap").html("")
    tx.executeSql('SELECT * FROM planargraph WHERE user_id = ?', [user_id], function (tx, res) {
      if (res.rows.length >= 1) {
        var len = res.rows.length;
        for (var y = 0; y < len; y++) {
          var tran = function (y) {
            tx.executeSql('SELECT * FROM space WHERE planargraph_id = ?', [res.rows.item(y)['id']],
              function (tx, res) {
                var len = res.rows.length;
                if (res.rows.length >= 1) {
                  for (var i = 0; i < len; i++) {
                    var spaceId = res.rows.item(i)['id'];
                    var tr = function (spaceId) {
                      tx.executeSql('SELECT * FROM furniture WHERE space_id = ?', [spaceId], function (tx, res) {
                        var len = res.rows.length;
                        if (res.rows.length >= 1) {
                          for (var x = 0; x < len; x++) {
                            var furnitureId = res.rows.item(x)['id'];
                            var trans = function (furnitureId) {
                              //呈現未放回物品
                              $(".box-wrap").html("")
                              tx.executeSql('SELECT * FROM thing WHERE furniture_id = ?', [furnitureId], function (tx, res) {
                                if (res.rows.length >= 1) {
                                  for (var j = 0; j < res.rows.length; j++) {
                                    if (res.rows.item(j)['out'] == 1) {
                                      $(".box-wrap").append(`<div class="box">
                                                                                  <a href="T01_edit.html?thing=`+ res.rows.item(j)['id'] + `">
                                                                                  <img src="` + res.rows.item(j)['image'] + `" style=width:100%;height:100%>
                                                                                  </a>
                                                                                  </div>`)
                                    }
                                  }
                                }
                              });
                            }(furnitureId)
                          }
                        }
                      });
                    }(spaceId)
                  }
                }
              });
          }(y)
        }
      }
    });
  });

}

function filtersearch() {
  $("#categorysearch").text("類別");
  $("#ownersearch").text("所屬人");
  $(".upcon2").css('color', '#fff');
  var inputValue = $("#searchinput").val();
  var inputevalue2 = String(inputValue)
  if (inputValue == "") {
    $(".box-wrap").html("")
  } else {

    db.transaction(function (tx) {
      $(".box-wrap").html("")
      tx.executeSql('SELECT * FROM planargraph WHERE user_id = ?', [user_id], function (tx, res) {
        if (res.rows.length >= 1) {
          var len = res.rows.length;
          for (var y = 0; y < len; y++) {
            var tran = function (y) {
              tx.executeSql('SELECT * FROM space WHERE planargraph_id = ?', [res.rows.item(y)['id']],
                function (tx, res) {
                  var len = res.rows.length;
                  if (res.rows.length >= 1) {
                    for (var i = 0; i < len; i++) {
                      var spaceId = res.rows.item(i)['id'];
                      var tr = function (spaceId) {
                        tx.executeSql('SELECT * FROM furniture WHERE space_id = ?', [spaceId], function (tx, res) {
                          var len = res.rows.length;
                          if (res.rows.length >= 1) {
                            for (var x = 0; x < len; x++) {
                              var furnitureId = res.rows.item(x)['id'];
                              var trans = function (furnitureId) {
                                $(".box-wrap").html("")
                                tx.executeSql('SELECT * FROM thing WHERE (name LIKE? or description LIKE?) and furniture_id = ? ', ['%' + inputevalue2 + '%', '%' + inputevalue2 + '%', furnitureId], function (tx, res) {
                                  if (res.rows.length >= 1) {
                                    for (var j = 0; j < res.rows.length; j++) {
                                      $(".box-wrap").append(`<div class="box">
                                                                                      <a href="T01_edit.html?thing=`+ res.rows.item(j)['id'] + `">
                                                                                      <img src="` + res.rows.item(j)['image'] + `" style=width:100%;height:100%>
                                                                                      </a>
                                                                                      </div>`)
                                    }
                                  }
                                });
                              }(furnitureId)
                            }
                          }
                        });
                      }(spaceId)
                    }
                  }
                });
            }(y)
          }
        }
      });
    });
  }
}