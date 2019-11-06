// 當輸入時錯誤提醒訊息消失
$("#insertpname").change(function () {
  $("#pniwarn").html("");
});
$("#editpname").change(function () {
  $("#pnewarn").html("");
});
$("#insertsname").change(function () {
  $("#sniwarn").html("");
});
$("#editsnameval").change(function () {
  $("#snewarn").html("");
});
$("#editcname").change(function () {
  $("#cnewarn").html("");
});
$("#insertcname").change(function () {
  $("#cniwarn").html("");
});
$("#editoname").change(function () {
  $("#onewarn").html("");
});
$("#insertoname").change(function () {
  $("#oniwarn").html("");
});

//引導頁
function lead() {
  $('.lead').attr('onclick', 'lead2()');
  $("#leadarrow").removeClass("arrow")
  $("#leadarrow").addClass("arrow2")
  $("#leadcaption").removeClass("caption")
  $("#leadcaption").addClass("caption2")
  $("#leadcaption").html("點擊可以新增格局。")
  $("#leadknow").removeClass("know")
  $("#leadknow").addClass("know2")
}
function lead2() {
  $('.lead').attr('onclick', 'lead3()');
  $("#leadarrow").removeClass("arrow2")
  $("#leadarrow").addClass("arrow")
  $(".arrow").css("left", "3px");
  $("#leadcaption").removeClass("caption2")
  $("#leadcaption").addClass("caption")
  $(".caption").css("left", "40px");
  $("#leadcaption").html("點擊進入功能選單:<br>觀看儲存的文章、物品提醒、<br>備份、復原、重設密碼、<br>物品類別設定、物品所屬人設定、<br>登出。")
  $("#leadknow").removeClass("know2")
  $("#leadknow").addClass("know")
  $(".know").css({ "left": "100px", "top": "220px" });
}
function lead4() {
  $('.lead').attr('onclick', 'lead5()');
  $('#leadarrow').removeAttr("style")
  $("#leadarrow").removeClass("arrow");
  $("#leadarrow").addClass("arrow5");
  $(".lead").css('display', 'block');
  $(".caption").css({ "left": "100px", "top": "150px" });
  $("#leadcaption").html("點擊開啟QR Code掃描器，<br>快速查找物品")
  $(".know").css({ "left": "200px", "top": "200px" });
}
function lead5() {
  $(".lead").css('display', 'none');
}

var user_email;
var user_token;
var user_id;
// 建立側邊欄
new Mmenu(document.querySelector('#menu'));

//建立sqllite 
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
    tx.executeSql('CREATE TABLE IF NOT EXISTS planargraph (id text primary key, name text, user_id integer)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS space (id text primary key, name text, number integer, space_color text, planargraph_id text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS thing (id text primary key, name text, description text, image text, category text, owner text, furniture_id text, number integer, layer text, out integer, remind integer, time date, content text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS furniture (id text primary key, name text, image text, layer text, space_id text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS page (id integer primary key, home integer, furniture_page integer, search_page integer, post_page integer)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS category (id text primary key, name text, user_id integer)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS owner (id text primary key, name text, user_id integer)');
  });

  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM user', [],
      function (tx, res) {
        var len = res.rows.length;
        if (res.rows.length >= 1) {
          user_email = res.rows.item(0)['email']
          user_token = res.rows.item(0)['token']
          user_id = res.rows.item(0)['id']
          $("#backup").html(res.rows.item(0)['backup'])
          $(".mm-navbar__title").html("Hi~" + " " + res.rows.item(0)['nickname']);
          $(".mm-navbar__title").css({ "background-color": "#254F6E", "color": "white" });
          tx.executeSql("SELECT * FROM planargraph WHERE user_id = ?", [res.rows.item(0)['id']], function (tx, res) {
            var len = res.rows.length;
            if (res.rows.length >= 1) {
              for (var i = 0; i < len; i++) {
                $(".plan1").prepend(`<a class="dropdown-item" onclick="pnidclick('` + res.rows.item(i)['id'] + `')">` + res.rows.item(i)['name'] + `</a>`)
              }
              $("#pedit").css('display', 'block');
              $("#pdelete").css('display', 'block');
              $("#saddbutton").css('display', 'block');
              let urlParams = new URLSearchParams(window.location.search);
              var planargraphId = urlParams.get('planargraph');
              if (!planargraphId) {
                pnidclick(res.rows.item(0)['id'])
              } else {
                pnidclick(planargraphId)
              }
              tx.executeSql("SELECT * FROM page", [],
                function (tx, res) {
                  var len = res.rows.length;
                  if (res.rows.length >= 1) {
                    var home = res.rows.item(0)['home']
                    if (!home) {
                      $(".lead").css('display', 'block');
                    }
                  }
                });
            } else {
              var timestamp = (new Date()).valueOf();
              var email = user_email.replace(/@/g, "").split(".").join("");
              var planargraphId = email + timestamp;
              tx.executeSql('INSERT INTO planargraph (id, name, user_id) VALUES (?,?,?)', [planargraphId, "一樓", user_id],
                function (tx, res) {
                  location.href = "H01.html?planargraph=" + planargraphId + "";
                });
            }
          });

          // qrcode 掃描跳轉 homeset://
          window.handleOpenURL = function (url) {
            var open = url.split("/")[2]
            var spaceId = open.split("=")[1].slice(0, 13)
            var furnitureId = open.split("=")[2].slice(0, 13)
            var email = user_email.replace(/@/g, "").split(".").join("");
            location.replace("F01.html?space=" + email + spaceId + "&furniture=" + email + furnitureId + "");
          }
        }
      });
  });
}

//引導頁
function lead3() {
  $(".lead").css('display', 'none');
  db.transaction(function (tx) {
    tx.executeSql("UPDATE page SET home = ? WHERE id = ?", [1, 1], function (tx, res) {
      location.reload()
    });
  });
}

// 生成pdf base64
function createpdf() {
  let options = {
    documentSize: 'A4',
    type: 'base64'
  }
  var spacepdf = $("#spacepdf").html()
  pdf.fromData(spacepdf, options)
    .then((base64) => furnitureshare(base64))
    .catch((err) => alert(err))
}

//分享
function furnitureshare(name) {
  var snamepdf = $("#prints").html()
  var options = {
    message: snamepdf, 
    subject: snamepdf, 
    files: ['data:application/pdf;base64,' + name + ''], 
  };
  var onSuccess = function (result) {
    console.log("Share completed? " + result.completed); 
    console.log("Shared to app: " + result.app); 
  };

  var onError = function (msg) {
    console.log("Sharing failed with message: " + msg);
  };

  window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
}




// 更改點擊選單中的平面圖
// pnid為標題顯示文字
// editpname 為編輯輸入框
//editPlanargraph 為編輯平面圖名稱的確認鍵
//delPlanargraph  為編刪除平面圖的確認鍵
//insertspace 新增格局
function pnidclick(id) {
  window.history.pushState({}, 0, "H01.html?planargraph=" + id + "")
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM planargraph WHERE id = ?', [id],
      function (tx, res) {
        $("#pnid").html(res.rows.item(0)['name'])
        $("#editpname").val(res.rows.item(0)['name'])
        $("#delPname").html(res.rows.item(0)['name'])
        $("#printp").html(res.rows.item(0)['name'])
      });
  });
  $('#insertspace').attr('onclick', 'insertspace("' + id + '")');
  $('#editPlanargraph').attr('onclick', 'editplanargraph("' + id + '")');
  $('#delPlanargraph').attr('onclick', 'delPlanargraph("' + id + '")');

  //呈現格局
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM space WHERE planargraph_id = ? ORDER BY number DESC', [id],
      function (tx, res) {
        $(".moveable").html("")
        var len = res.rows.length;
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            if (!res.rows.item(i)['number']) {
              $(".moveable").append(`<li id="s` + i + `" style="background-color:` + res.rows.item(i)['space_color'] + `;" class="` + res.rows.item(i)['id'] + `">
                                              <i id="spacemore" onclick='spacemore("`+ res.rows.item(i)['id'] + `")' class='icon ion-md-more imore'></i>
                                              <a href="F01.html?space=`+ res.rows.item(i)['id'] + `"><span id="sname` + res.rows.item(i)['id'] + `" style="color: white;text-shadow: 0 0 0.2em rgba(32, 31, 31, 0.568);">` + res.rows.item(i)['name'] + `</span></a>
                                              </li>`)
            } else {
              $(".moveable").prepend(`<li id="s` + i + `" style="background-color:` + res.rows.item(i)['space_color'] + `;" class="` + res.rows.item(i)['id'] + `">
                                              <i id="spacemore" onclick='spacemore("`+ res.rows.item(i)['id'] + `")' class='icon ion-md-more imore'></i>
                                              <a href="F01.html?space=`+ res.rows.item(i)['id'] + `"><span id="sname` + res.rows.item(i)['id'] + `" style="color: white;text-shadow: 0 0 0.2em rgba(32, 31, 31, 0.568);">` + res.rows.item(i)['name'] + `</span></a>
                                              </li>`)
            }
          }

          // 拖曳
          let items = document.querySelectorAll('#items-list > li')
          items.forEach(item => {
            $(item).prop('draggable', true)
            item.addEventListener('dragstart', dragStart)
            item.addEventListener('drop', dropped)
            item.addEventListener('dragenter', cancelDefault)
            item.addEventListener('dragover', cancelDefault)
          })

          // 格局
          tx.executeSql("SELECT * FROM page", [],
            function (tx, res) {
              var len = res.rows.length;
              if (res.rows.length >= 1) {
                var home = res.rows.item(0)['home']
                if (home == 1) {
                  $('.lead').attr('onclick', 'lead4()');
                  $(".lead").css('display', 'block');
                  $(".arrow").css({ "left": "120px", "top": "160px" });
                  $(".caption").css({ "left": "50px", "top": "250px" });
                  $("#leadcaption").html("點擊可以<br>編輯、刪除、更改顏色<br>以及生成格局內儲物櫃QR Code<br>長按可以拖曳變換位置")
                  $(".know").css({ "left": "200px", "top": "360px" });
                  tx.executeSql("UPDATE page SET home = ? WHERE id = ?", [2, 1]);
                }
              }
            });
        }
      });
  });

}
//關閉修改格局(編輯 刪除 顏色)互動視窗
function closespace() {
  $("#editSpace").modal('hide');
}
//點選格局三個點點
function spacemore(spaceId) {
  $("#editSpace").modal('show');
  $("#furnituresqr").html('');

  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM space WHERE id = ?', [spaceId],
      function (tx, res) {
        $("#editsnameval").val(res.rows.item(0)['name'])
        $("#delsname").html(res.rows.item(0)['name'])
        $("#prints").html(res.rows.item(0)['name'])
        if (!res.rows.item(0)['space_color']) {
          $("#colorid").val("#047e7e")
        } else {
          $("#colorid").val(res.rows.item(0)['space_color'])
        }
      });
    tx.executeSql('SELECT * FROM furniture WHERE space_id = ?', [spaceId],
      function (tx, res) {
        var len = res.rows.length;
        if (res.rows.length >= 1) {
          var spaceId1 = spaceId.slice(-13)


          for (var i = 0; i < len; i++) {
            var furnitureId1 = res.rows.item(i)['id'].slice(-13)
            var printcontent = `
                      <div style="width: 100%;margin:2% 0 0 6%;">
                          <table border="1px" width="400px" style="border-collapse:collapse;">
                              <tr>
                                  <th colspan="2">`+ res.rows.item(i)['name'] + `</td>
                                  <td rowspan="2" id="f`+ res.rows.item(i)['id'] + `" style="width:33%;padding:10px;">
                                     </td>
                              </tr>
                              <tr>
                                  <td style="width: 33%;vertical-align:middle;text-align: center;"><img src="`+ res.rows.item(i)['image'] + `" height="100px" width="100px"></td>
                                  <td style="width: 33%;"></td>
                              </tr>
                          </table>
                      </div>
                      `
            $("#furnituresqr").append(printcontent);
            $('#f' + res.rows.item(i)['id'] + '').qrcode({
              render: 'table',
              width: 120,
              height: 120,
              text: 'homeset://F01.html?s=' + spaceId1 + '&f=' + furnitureId1 + ''
            });
          }
        }
      });
  });
  $('#editsname').attr('onclick', 'editsname("' + spaceId + '")');
  $('#delspace').attr('onclick', 'delspace("' + spaceId + '")');
  $('#editcolor').attr('onclick', 'editcolor("' + spaceId + '")');

}

//修改顏色
function editcolor(id) {
  var spacecolor = $("#colorid").val();
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM space WHERE id = ?', [id],
      function (tx, res) {
        var planargraphId = res.rows.item(0)['planargraph_id']
        tx.executeSql("UPDATE space SET space_color = ? WHERE id = ?", [spacecolor, id],
          function (tx, res) {
            location.href = "H01.html?planargraph=" + planargraphId + "";
          });
      });
  });
}

//修改格局
function editsname(id) {
  var name = $("#editsnameval").val();
  if (!name) {
    $('#snewarn').html('<i class="icon ion-md-information-circle"></i>');
    $('#snewarn').append("請輸入格局名稱");
    $('#sneform').addClass("was-validated");
    return
  }
  db.transaction(function (tx) {
    var query = "UPDATE space SET name = ? WHERE id = ?";
    tx.executeSql(query, [name, id], function (tx, res) {
      $("#editsmodal").modal('hide');
      $("#sname" + id + "").html(name);
    });
  });

}


//修改平面圖
function editplanargraph(id) {
  var name = $("#editpname").val();
  if (!name) {
    $('#pnewarn').html('<i class="icon ion-md-information-circle"></i>');
    $('#pnewarn').append("請輸入樓層名稱");
    $('#pneform').addClass("was-validated");
    return
  }
  db.transaction(function (tx) {
    var query = "UPDATE planargraph SET name = ? WHERE id = ?";
    tx.executeSql(query, [name, id], function (tx, res) {
      $("#exampleModalCenter4").modal('hide');
      location.href = "H01.html?planargraph=" + id + "";
    });
  });

}

// 刪除格局
function delspace(id) {
  var planargraphId
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM space WHERE id = ?', [id],
      function (tx, res) {
        planargraphId = res.rows.item(0)['planargraph_id']
        tx.executeSql("SELECT * FROM furniture WHERE space_id = ?", [id], function (tx, res) {
          var len = res.rows.length;
          if (res.rows.length >= 1) {
            for (var j = 0; j < len; j++) {
              var trans = function (j) {
                tx.executeSql("DELETE FROM thing WHERE furniture_id = ?", [res.rows.item(j)['id']]);
              }(j);
            }
            tx.executeSql("DELETE FROM furniture WHERE space_id = ?", [id], function (tx, res) {
              tx.executeSql("DELETE FROM space WHERE id = ?", [id], function (tx, res) {
                location.href = "H01.html?planargraph=" + planargraphId + "";
              });
            });
          } else {
            tx.executeSql("DELETE FROM space WHERE id = ?", [id], function (tx, res) {
              location.href = "H01.html?planargraph=" + planargraphId + "";
            });
          }
        });
      });
  });
}


// 刪除平面圖
function delPlanargraph(id) {
  db.transaction(function (tx) {
    tx.executeSql("SELECT * FROM space WHERE planargraph_id = ?", [id], function (tx, res) {
      var len = res.rows.length;
      if (res.rows.length >= 1) {
        for (var i = 0; i < len; i++) {
          var tran = function (i) {
            var spaceId = res.rows.item(i)['id']
            tx.executeSql("SELECT * FROM furniture WHERE space_id = ?", [spaceId], function (tx, res) {
              var len = res.rows.length;
              if (res.rows.length >= 1) {
                for (var j = 0; j < len; j++) {
                  var trans = function (j) {
                    tx.executeSql("DELETE FROM thing where furniture_id = ?", [res.rows.item(j)['id']]);
                  }(j);
                }
                tx.executeSql("DELETE FROM furniture where space_id = ?", [spaceId], function (tx, res) {
                  tx.executeSql("DELETE FROM space WHERE planargraph_id = ?", [id], function (tx, res) {
                    tx.executeSql("DELETE FROM planargraph WHERE id = ?", [id], function (tx, res) {
                      location.href = "H01.html"
                    });
                  });
                });
              } else {
                tx.executeSql("DELETE FROM space WHERE planargraph_id = ?", [id], function (tx, res) {
                  tx.executeSql("DELETE FROM planargraph WHERE id = ?", [id], function (tx, res) {
                    location.href = "H01.html"
                  });
                });
              }
            });

          }(i);
        }
      } else {
        tx.executeSql("DELETE FROM planargraph WHERE id = ?", [id], function (tx, res) {
          location.href = "H01.html"
        });
      }
    });
  });
}


// 新增平面圖(預設一樓))
//exampleModalCenter3 新增樓層的彈跳視窗
//insertpname 新增樓層的輸入框
//要抓到目前登入使用者的帳號
function insertplanargraph() {
  db.transaction(function (tx) {
    var timestamp = (new Date()).valueOf();
    // alert("timestamp"+timestamp);
    var email = user_email.replace(/@/g, "").split(".").join("");
    var planargraphId = email + timestamp;
    var name = $("#insertpname").val();
    if (!name) {
      $('#pniwarn').html('<i class="icon ion-md-information-circle"></i>');
      $('#pniwarn').append("請輸入樓層名稱");
      $('#pniform').addClass("was-validated");
      return
    }
    tx.executeSql('SELECT * FROM planargraph WHERE user_id = ?', [user_id],
      function (tx, res) {
        var len = res.rows.length;
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            $('#exampleModalCenter3').modal('hide')
            if (name == res.rows.item(i)['name']) {

              $("#existedp").html(name)
              $('#addpwarn').modal('show')
              return false;
            }

          }

        }
        tx.executeSql('INSERT INTO planargraph (id, name, user_id) VALUES (?,?,?)', [planargraphId, name, user_id],
          function (tx, res) {
            $('#exampleModalCenter3').modal('hide')
            $("#insertpname").val("");
            location.href = "H01.html?planargraph=" + planargraphId + "";
          }, function (error) {
            alert('Something went Wrong');
          });
      }, function (error) {
        alert('Something went Wrong');
        alert(JSON.stringify(error));
      });


  });
}
// 是否繼續新增樓層互動視窗
function addpwarnNo() {
  $('#addpwarn').modal('hide')
  $('#exampleModalCenter3').modal('show')
}
// 是否繼續新增樓層互動視窗
function addpwarnYes() {
  $('#addpwarn').modal('hide')
  db.transaction(function (tx) {
    var timestamp = (new Date()).valueOf();
    var email = user_email.replace(/@/g, "").split(".").join("");
    var planargraphId = email + timestamp;
    var name = $("#insertpname").val();
    tx.executeSql('INSERT INTO planargraph (id, name, user_id) VALUES (?,?,?)', [planargraphId, name, user_id],
      function (tx, res) {
        $('#exampleModalCenter3').modal('hide')
        $("#insertpname").val("");
        location.href = "H01.html?planargraph=" + planargraphId + "";
      }, function (error) {
        alert('Something went Wrong');
      });
  });

}


// 新增格局
function insertspace(planargraphId) {
  db.transaction(function (tx) {
    var timestamp = (new Date()).valueOf();
    // alert("timestamp"+timestamp);
    var email = user_email.replace(/@/g, "").split(".").join("")
    var spaceId = email + timestamp;
    var name = $("#insertsname").val();
    if (!name) {
      $('#sniwarn').html('<i class="icon ion-md-information-circle"></i>');
      $('#sniwarn').append("請輸入格局名稱");
      $('#sniform').addClass("was-validated");
      return
    }
    tx.executeSql('INSERT INTO space (id, name, planargraph_id) VALUES (?,?,?)', [spaceId, name, planargraphId],
      function (tx, res) {
        $('#exampleModalCenter2').modal('hide')
        $("#insertsname").val("");
        location.href = "H01.html?planargraph=" + planargraphId + "";
      }, function (error) {
        alert('Something went Wrong');
      });
  });
}

//物品類別設定
function resetcategory() {
  $("html").removeClass("mm-wrapper_opening")
  $("#resetcategorymodal").modal("show")
  $("#opencategory").html("")


  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM category WHERE user_id=?', [user_id],
      function (tx, res) {
        var len = res.rows.length;
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            $("#opencategory").append(`<button onclick="editcategory('` + res.rows.item(i)['id'] + `','` + res.rows.item(i)['name'] + `')" type="button"
                  class="btn btn-outline-warning categorybutton">`+ res.rows.item(i)['name'] + `</button>`)
          }
        }

      });
  });

}
//新增物品類別
function insertcategory() {
  var categoryselect = []
  var categoryselect2 = ['包包', '鞋子', '衣服', '文具', '工具', '玩具', '杯子', '飾品', '化妝品', '眼鏡', '新增類別']
  var addcategoryValue = document.getElementById("insertcname").value;
  if (!addcategoryValue) {
    $('#cniwarn').html('<i class="icon ion-md-information-circle"></i>');
    $('#cniwarn').append("請輸入類別");
    return
  }

  db.transaction(function (tx) {
    var timestamp = (new Date()).valueOf();
    // alert("timestamp"+timestamp);
    var email = user_email.replace(/@/g, "").split(".").join("");
    var categoryId = email + timestamp;


    tx.executeSql('SELECT * FROM category WHERE user_id=?', [user_id],
      function (tx, res) {
        var len = res.rows.length;
        categoryselect = []
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            categoryselect.push(res.rows.item(i)['name'])
          }
        }
        var categoryselect3 = categoryselect.concat(categoryselect2)
        for (var i = 0; i < categoryselect3.length; i++) {
          if (addcategoryValue == categoryselect3[i]) {
            $('#cniwarn').html('<i class="icon ion-md-information-circle"></i>');
            $('#cniwarn').append("已有此類別");
            return false
          }
        }

        tx.executeSql('INSERT INTO category (id, name, user_id) VALUES (?,?,?)', [categoryId, addcategoryValue, user_id],
          function (tx, res) {
            tx.executeSql('SELECT * FROM category WHERE user_id=?', [user_id],
              function (tx, res) {
                $("#opencategory").html("")
                $("#insertcname").val("")
                var len = res.rows.length;
                if (res.rows.length >= 1) {
                  for (var i = 0; i < len; i++) {
                    $("#opencategory").append(`<button onclick="editcategory('` + res.rows.item(i)['id'] + `','` + res.rows.item(i)['name'] + `')" type="button"
                  class="btn btn-outline-warning categorybutton">`+ res.rows.item(i)['name'] + `</button>`)
                  }
                }
              });

          });
      });
  });
}
//編輯物品類別
function editcategory(id, name) {
  $("#editcategorymodal").modal("show")
  $("#editcname").val(name)
  $('#editcnameconfirm').attr('onclick', 'editcnameconfirm("' + id + '","' + name + '")');
  $('#delcname').attr('onclick', 'delcname("' + id + '")');

}
//編輯物品類別確認
function editcnameconfirm(id, catrgoryname) {
  var name = $("#editcname").val()
  var categoryselect = []
  var categoryselect2 = ['包包', '鞋子', '衣服', '文具', '工具', '玩具', '杯子', '飾品', '化妝品', '眼鏡', '新增類別']

  if (!name) {
    $('#cnewarn').html('<i class="icon ion-md-information-circle"></i>');
    $('#cnewarn').append("請輸入類別");
    return
  }
  if (name == catrgoryname) {
    $("#editcategorymodal").modal("hide")
    $('#cnewarn').html('');
    return false
  }
  db.transaction(function (tx) {

    tx.executeSql('SELECT * FROM category WHERE user_id=?', [user_id],
      function (tx, res) {
        var len = res.rows.length;
        categoryselect = []
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            categoryselect.push(res.rows.item(i)['name'])
          }
        }
        var categoryselect3 = categoryselect.concat(categoryselect2)
        for (var i = 0; i < categoryselect3.length; i++) {
          if (name == categoryselect3[i]) {
            $('#cnewarn').html('<i class="icon ion-md-information-circle"></i>');
            $('#cnewarn').append("已有此類別");
            return false
          }
        }

        tx.executeSql("UPDATE category SET name = ? WHERE id = ?", [name, id],
          function (tx, res) {
            tx.executeSql('SELECT * FROM category WHERE user_id=?', [user_id],
              function (tx, res) {
                $("#opencategory").html("")
                var len = res.rows.length;
                if (res.rows.length >= 1) {
                  for (var i = 0; i < len; i++) {
                    $("#opencategory").append(`<button onclick="editcategory('` + res.rows.item(i)['id'] + `','` + res.rows.item(i)['name'] + `')" type="button"
                  class="btn btn-outline-warning categorybutton">`+ res.rows.item(i)['name'] + `</button>`)
                  }
                  $('#cnewarn').html('');
                  $("#editcategorymodal").modal("hide")
                }
              });
          });


      });
  });
}

//刪除物品類別
function delcname(id) {
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM category where id = ?", [id], function (tx, res) {
      tx.executeSql('SELECT * FROM category WHERE user_id=?', [user_id],
        function (tx, res) {
          $("#opencategory").html("")
          var len = res.rows.length;
          if (res.rows.length >= 1) {
            for (var i = 0; i < len; i++) {
              $("#opencategory").append(`<button onclick="editcategory('` + res.rows.item(i)['id'] + `','` + res.rows.item(i)['name'] + `')" type="button"
                  class="btn btn-outline-warning categorybutton">`+ res.rows.item(i)['name'] + `</button>`)
            }
          }
          $("#editcategorymodal").modal("hide")
        });
    });
  });
}


//物品所屬人設定
function resetowner() {
  $("html").removeClass("mm-wrapper_opening")
  $("#resetownermodal").modal("show")
  $("#openowner").html("")


  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM owner WHERE user_id=?', [user_id],
      function (tx, res) {
        var len = res.rows.length;
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            $("#openowner").append(`<button onclick="editowner('` + res.rows.item(i)['id'] + `','` + res.rows.item(i)['name'] + `')" type="button"
                  class="btn btn-outline-warning categorybutton">`+ res.rows.item(i)['name'] + `</button>`)
          }
        }

      });
  });

}
//新增物品所屬人
function insertowner() {
  var ownerselect = []
  var ownerselect2 = ['自己', '爸爸', '媽媽', '哥哥', '弟弟', '姊姊', '妹妹', '爺爺', '奶奶', '朋友', '同事', '新增所屬人']
  var addownerValue = document.getElementById("insertoname").value;
  if (!addownerValue) {
    $('#oniwarn').html('<i class="icon ion-md-information-circle"></i>');
    $('#oniwarn').append("請輸入所屬人");
    return
  }

  db.transaction(function (tx) {
    var timestamp = (new Date()).valueOf();
    // alert("timestamp"+timestamp);
    var email = user_email.replace(/@/g, "").split(".").join("");
    var ownerId = email + timestamp;


    tx.executeSql('SELECT * FROM owner WHERE user_id=?', [user_id],
      function (tx, res) {
        var len = res.rows.length;
        ownerselect = []
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            ownerselect.push(res.rows.item(i)['name'])
          }
        }
        var ownerselect3 = ownerselect.concat(ownerselect2)
        for (var i = 0; i < ownerselect3.length; i++) {
          if (addownerValue == ownerselect3[i]) {
            $('#oniwarn').html('<i class="icon ion-md-information-circle"></i>');
            $('#oniwarn').append("已有此所屬人");
            return false
          }
        }

        tx.executeSql('INSERT INTO owner (id, name, user_id) VALUES (?,?,?)', [ownerId, addownerValue, user_id],
          function (tx, res) {
            tx.executeSql('SELECT * FROM owner WHERE user_id=?', [user_id],
              function (tx, res) {
                $("#openowner").html("")
                $("#insertoname").val("")
                var len = res.rows.length;
                if (res.rows.length >= 1) {
                  for (var i = 0; i < len; i++) {
                    $("#openowner").append(`<button onclick="editowner('` + res.rows.item(i)['id'] + `','` + res.rows.item(i)['name'] + `')" type="button"
                  class="btn btn-outline-warning categorybutton">`+ res.rows.item(i)['name'] + `</button>`)
                  }
                }
              });

          });
      });
  });
}
//編輯物品所屬人
function editowner(id, name) {
  $("#editownermodal").modal("show")
  $("#editoname").val(name)
  $('#editonameconfirm').attr('onclick', 'editonameconfirm("' + id + '","' + name + '")');
  $('#deloname').attr('onclick', 'deloname("' + id + '")');

}
//編輯物品所屬人確認
function editonameconfirm(id, ownername) {
  var name = $("#editoname").val()
  var ownerselect = []
  var ownerselect2 = ['自己', '爸爸', '媽媽', '哥哥', '弟弟', '姊姊', '妹妹', '爺爺', '奶奶', '朋友', '同事', '新增所屬人']

  if (!name) {
    $('#onewarn').html('<i class="icon ion-md-information-circle"></i>');
    $('#onewarn').append("請輸入所屬人");
    return
  }
  if (name == ownername) {
    $("#editownermodal").modal("hide")
    $('#onewarn').html('');
    return false
  }
  db.transaction(function (tx) {

    tx.executeSql('SELECT * FROM owner WHERE user_id=?', [user_id],
      function (tx, res) {
        var len = res.rows.length;
        ownerselect = []
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            ownerselect.push(res.rows.item(i)['name'])
          }
        }
        var ownerselect3 = ownerselect.concat(ownerselect2)
        for (var i = 0; i < ownerselect3.length; i++) {
          if (name == ownerselect3[i]) {
            $('#onewarn').html('<i class="icon ion-md-information-circle"></i>');
            $('#onewarn').append("已有此所屬人");
            return false
          }
        }

        tx.executeSql("UPDATE owner SET name = ? WHERE id = ?", [name, id],
          function (tx, res) {
            tx.executeSql('SELECT * FROM owner WHERE user_id=?', [user_id],
              function (tx, res) {
                $("#openowner").html("")
                var len = res.rows.length;
                if (res.rows.length >= 1) {
                  for (var i = 0; i < len; i++) {
                    $("#openowner").append(`<button onclick="editowner('` + res.rows.item(i)['id'] + `','` + res.rows.item(i)['name'] + `')" type="button"
                  class="btn btn-outline-warning categorybutton">`+ res.rows.item(i)['name'] + `</button>`)
                  }
                  $('#onewarn').html('');
                  $("#editownermodal").modal("hide")
                }
              });
          });


      });
  });
}

//刪除物品所屬人
function deloname(id) {
  db.transaction(function (tx) {
    tx.executeSql("DELETE FROM owner where id = ?", [id], function (tx, res) {
      tx.executeSql('SELECT * FROM owner WHERE user_id=?', [user_id],
        function (tx, res) {
          $("#openowner").html("")
          var len = res.rows.length;
          if (res.rows.length >= 1) {
            for (var i = 0; i < len; i++) {
              $("#openowner").append(`<button onclick="editowner('` + res.rows.item(i)['id'] + `','` + res.rows.item(i)['name'] + `')" type="button"
                  class="btn btn-outline-warning categorybutton">`+ res.rows.item(i)['name'] + `</button>`)
            }
          }
          $("#editownermodal").modal("hide")
        });
    });
  });
}


// 重設密碼
function reset() {
  // $('#menu1').click();
  $("html").removeClass("mm-wrapper_opening")
  $("#resetpassword").modal("show")
  $.ajax({
    type: "POST",
    url: "http://140.131.114.157/users/password_reset",
    data: {
      "email": user_email
    },
    error: function (err) {
      alert(err)
    },
    success: function (res) {
      $("#resettext").html(`<p style="font-size:18px;"><b>變更密碼確認信已送出</b></p>
                       <p>為了確保會員切身的權益，我們已經寄發確認信到 <span style="font-size:18px;"> `+ user_email + `</span>。</p>
                       <p>請在24小時內至該信箱收取確認信，並重新設定密碼。</p>`)
      $("#resetpassword").modal("show")
    }
  })
}

function logout() {
  db.transaction(function (tx) {
    tx.executeSql('DROP TABLE IF EXISTS user', [], function (tx, res) {
      location.href = 'index.html'
    });
  });
}

//QRcode掃描器
function createscan() {

  var callback = function (err, contents) {
    if (err) {
      alert.error(err._message);
    }
    window.open(contents, '_system')

  };

  QRScanner.scan(callback);
  QRScanner.show(function (status) {
    $(".moveable").css('display', 'none');
    $("#saddbutton").css('display', 'none');
    $("#showscan").css('display', 'block');

  });

}

// 備份
function uploadthing(furniture_id) {

  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM thing WHERE furniture_id = ?', [furniture_id],
      function (tx, res) {
        var len = res.rows.length

        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            $("#backup").html(` <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" ></span>
          <span style="font-size: 12px;">備份中...</span>
        `);
            var tid = res.rows.item(i)['id'];

            var tname = res.rows.item(i)['name'];
            if (!tname) {
              tname = ""
            }
            var tdescription = res.rows.item(i)['description'];
            if (!tname) {
              tdescription = ""
            }
            var timage = res.rows.item(i)['image'];
            var tcategory = res.rows.item(i)['category'];
            if (!tcategory) {
              tcategory = ""
            }
            var towner = res.rows.item(i)['owner'];
            if (!towner) {
              towner = ""
            }
            var tnumber = res.rows.item(i)['number'];
            if (!tnumber) {
              tnumber = ""
            }
            var tlayer = res.rows.item(i)['layer'];

            var tout = res.rows.item(i)['out'];
            if (!tout) {
              tout = ""
            }
            var tremind = res.rows.item(i)['remind'];
            if (!tremind) {
              tremind = ""
            }
            var ttime = res.rows.item(i)['time'];

            if (!ttime) {
              ttime = ""
            }
            var tcontent = res.rows.item(i)['content'];
            if (!tcontent) {
              tcontent = ""
            }

            var judge = timage.split(":")[0]
            // alert(judge)
            if (judge == "http") {
              $.ajax({
                type: "POST",
                headers: {
                  "Authorization": "Token " + user_token + ""
                },
                async: false,
                url: "http://140.131.114.157/things",
                data: {
                  "id": tid,
                  "name": tname,
                  "description": tdescription,
                  "category": tcategory,
                  "owner": towner,
                  "number": tnumber,
                  "layer": tlayer,
                  "out": tout,
                  "remind": tremind,
                  "time": ttime,
                  "content": tcontent,
                  "furniture_id": furniture_id,
                  "url": timage
                },
                error: function (err) {
                  alert(JSON.stringify(err));
                },
                success: function (res) {
                  // alert(JSON.stringify(res));
                  var Today = new Date();
                  $("#backup").html("上次備份 : " + Today.getFullYear() + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日 ");

                }
              })

            } else {
              let options = new FileUploadOptions();
              options.fileKey = "image";
              let point = timage.lastIndexOf(".");
              let type = timage.substr(point);
              let headers = { "Authorization": "Token " + user_token + "" };
              options.headers = headers;
              //上传附带参数
              var params = {};
              params.type = type;
              params.id = tid;
              params.name = tname;
              params.description = tdescription;
              params.category = tcategory;
              params.owner = towner;
              params.number = tnumber;
              params.layer = tlayer;
              params.out = tout;
              params.remind = tremind;
              params.time = ttime;
              params.content = tcontent;
              params.furniture_id = furniture_id;

              //设置参数，后台获取
              options.params = params;
              options.httpMethod = "POST";
              let ft = new FileTransfer();
              ft.upload(timage, encodeURI("http://140.131.114.157/things"), onSuccess, onError, options);
              function onSuccess(r) {
                // alert("upload onSuccess " + JSON.stringify(r));
                var Today = new Date();
                $("#backup").html("上次備份 : " + Today.getFullYear() + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日 ");
              }

              function onError(error) {
                alert("upload error target " + JSON.stringify(error));
              }
            }
          }
        } else {
          var Today = new Date();
          $("#backup").html("上次備份 : " + Today.getFullYear() + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日 ");
        }
      });
  });
}


function uploadfurniture(space_id) {
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM furniture WHERE space_id = ?', [space_id],
      function (tx, res) {
        var len = res.rows.length
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            $("#backup").html(` <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" ></span>
          <span style="font-size: 12px;">備份中...</span>
        `);
            var fid = res.rows.item(i)['id'];
            var fname = res.rows.item(i)['name'];
            var flayer = res.rows.item(i)['layer'];
            var fimage = res.rows.item(i)['image'];
            var judge = fimage.split(":")[0]
            // alert(judge)
            if (judge == "http") {
              $.ajax({
                type: "POST",
                headers: {
                  "Authorization": "Token " + user_token + ""
                },
                async: false,
                url: "http://140.131.114.157/furnitures",
                data: {
                  "id": fid,
                  "name": fname,
                  "layer": flayer,
                  "space_id": space_id,
                  "url": fimage
                },
                error: function (err) {
                  alert(JSON.stringify(err));
                },
                success: function (res) {
                  // alert(JSON.stringify(res));
                  var Today = new Date();
                  $("#backup").html("上次備份 : " + Today.getFullYear() + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日 ");
                  // alert(fid)
                  uploadthing(fid)
                }
              })
            } else {
              let options = new FileUploadOptions();
              options.fileKey = "image";
              let point = fimage.lastIndexOf(".");
              let type = fimage.substr(point);
              let headers = { "Authorization": "Token " + user_token + "" };
              options.headers = headers;
              //上传附带参数
              var params = {};
              params.type = type;
              params.id = fid;
              params.name = fname;
              params.layer = flayer;
              params.space_id = space_id;
              //设置参数，后台获取
              options.params = params;
              options.httpMethod = "POST";
              let ft = new FileTransfer();
              ft.upload(fimage, encodeURI("http://140.131.114.157/furnitures"), onSuccess, onError, options);
              function onSuccess(r) {
                // alert("upload onSuccess " + JSON.stringify(r));
                var obj = JSON.parse(r.response)
                uploadthing(obj.id);
                var Today = new Date();
                $("#backup").html("上次備份 : " + Today.getFullYear() + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日 ");
              }

              function onError(error) {
                alert("upload error target " + JSON.stringify(error));
              }
            }
          }
        } else {
          var Today = new Date();
          $("#backup").html("上次備份 : " + Today.getFullYear() + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日 ");
        }
      });
  });
}

function uploadspace(planargraph_id) {
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM space WHERE planargraph_id = ?', [planargraph_id],
      function (tx, res) {
        var len = res.rows.length
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            $("#backup").html(` <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" ></span>
          <span style="font-size: 12px;">備份中...</span>
        `);
            var sid = res.rows.item(i)['id'];
            var sname = res.rows.item(i)['name'];
            var scolor = res.rows.item(i)['space_color'];
            var snumber = res.rows.item(i)['number'];
            if (!snumber) {
              snumber = ""
            }
            $.ajax({
              type: "POST",
              headers: {
                "Authorization": "Token " + user_token + ""
              },
              async: false,
              url: "http://140.131.114.157/spaces",
              data: {
                "id": sid,
                "name": sname,
                "space_color": scolor,
                "number": snumber,
                "planargraph_id": planargraph_id
              },
              error: function (err) {
                alert(JSON.stringify(err));
              },
              success: function (res) {
                // alert(JSON.stringify(res));
                var Today = new Date();
                $("#backup").html("上次備份 : " + Today.getFullYear() + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日 ");
                uploadfurniture(sid)
              }
            })
          }
        } else {
          var Today = new Date();
          $("#backup").html("上次備份 : " + Today.getFullYear() + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日 ");
        }
      });
  });
}

function uploadowner() {
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM owner WHERE user_id=?', [user_id],
      function (tx, res) {
        var len = res.rows.length;
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            var oid = res.rows.item(i)['id'];
            var oname = res.rows.item(i)['name'];
            $.ajax({
              type: "POST",
              headers: {
                "Authorization": "Token " + user_token + ""
              },
              async: false,
              url: "http://140.131.114.157/owners",
              data: {
                "id": oid,
                "name": oname,
                "user_id": user_id
              },
              error: function (err) {
                alert(JSON.stringify(err));
              }
            })

          }
        }

      });
  });
}

function uploadcategory() {
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM category WHERE user_id=?', [user_id],
      function (tx, res) {
        var len = res.rows.length;
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            var cid = res.rows.item(i)['id'];
            var cname = res.rows.item(i)['name'];
            $.ajax({
              type: "POST",
              headers: {
                "Authorization": "Token " + user_token + ""
              },
              async: false,
              url: "http://140.131.114.157/categorys",
              data: {
                "id": cid,
                "name": cname,
                "user_id": user_id
              },
              error: function (err) {
                alert(JSON.stringify(err));
              }
            })

          }
        }

      });
  });
}

function backup() {
  $("#backup").html(` <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" ></span>
          <span style="font-size: 12px;">備份中...</span>
        `);
  $.ajax({
    type: "DELETE",
    headers: {
      "Authorization": "Token " + user_token + ""
    },
    async: false,
    url: "http://140.131.114.157/planargraphs/my",
    error: function (err) {
      alert(JSON.stringify(err));
    },
    success: function (res) {
      // alert(JSON.stringify(res));
    }
  });
  $.ajax({
    type: "DELETE",
    headers: {
      "Authorization": "Token " + user_token + ""
    },
    async: false,
    url: "http://140.131.114.157/owners/my",
    error: function (err) {
      alert(JSON.stringify(err));
    },
    success: function (res) {
      // alert(JSON.stringify(res));
    }
  });
  $.ajax({
    type: "DELETE",
    headers: {
      "Authorization": "Token " + user_token + ""
    },
    async: false,
    url: "http://140.131.114.157/categorys/my",
    error: function (err) {
      alert(JSON.stringify(err));
    },
    success: function (res) {
      // alert(JSON.stringify(res));
    }
  });
  uploadowner();
  uploadcategory();
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM planargraph WHERE user_id = ?', [user_id],
      function (tx, res) {
        var len = res.rows.length
        if (res.rows.length >= 1) {
          for (var i = 0; i < len; i++) {
            var pid = res.rows.item(i)['id'];
            var pname = res.rows.item(i)['name'];
            $.ajax({
              type: "POST",
              headers: {
                "Authorization": "Token " + user_token + ""
              },
              async: false,
              url: "http://140.131.114.157/planargraphs",
              data: {
                "id": pid,
                "name": pname,
                "user_id": user_id
              },
              error: function (err) {
                alert(JSON.stringify(err));
              },
              success: function (res) {
                // alert(JSON.stringify(res));
                var Today = new Date();

                $("#backup").html("上次備份 : " + Today.getFullYear() + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日 ");
                uploadspace(pid)
                db.transaction(function (tx) {
                  var Today = new Date();
                  var now = "上次備份 : " + Today.getFullYear() + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日 ";
                  tx.executeSql("UPDATE user SET backup = ? WHERE id = ?", [now, user_id]);
                });
              }
            })
          }
        } else {
          var Today = new Date();
          $("#backup").html("上次備份 : " + Today.getFullYear() + " 年 " + (Today.getMonth() + 1) + " 月 " + Today.getDate() + " 日 ");
        }
      });
  });
}


//還原

function downloadthing(furniture_id) {
  db.transaction(function (tx) {
    $.ajax({
      type: "GET",
      headers: {
        "Authorization": "Token " + user_token + ""
      },
      async: false,
      url: "http://140.131.114.157/things/own/" + furniture_id + "",
      error: function (err) {
        alert(JSON.stringify(err));
      },
      success: function (res) {
        // alert(JSON.stringify(res));
        // alert(res.length);
        // alert(res[0].id);
        var len = res.length
        if (len >= 1) {
          for (var i = 0; i < len; i++) {

            if (!res[i].url) {
              // alert("image")
              if (res[i].layer == "null" || res[i].layer == "") {
                tx.executeSql('INSERT INTO thing (id, image, furniture_id) VALUES (?,?,?)', [res[i].id, res[i].image, res[i].furniture_id]);
              } else {
                tx.executeSql('INSERT INTO thing (id, name, description, image, category, owner, furniture_id, number, layer, out, remind, time, content) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [res[i].id, res[i].name, res[i].description, res[i].image, res[i].category, res[i].owner, res[i].furniture_id, res[i].number, res[i].layer, res[i].out, res[i].remind, res[i].time, res[i].content]);
              }
            } else {
              if (res[i].layer == "null" || res[i].layer == "") {
                tx.executeSql('INSERT INTO thing (id, image, furniture_id) VALUES (?,?,?)', [res[i].id, res[i].url, res[i].furniture_id]);
              } else {
                tx.executeSql('INSERT INTO thing (id, name, description, image, category, owner, furniture_id, number, layer, out, remind, time, content) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [res[i].id, res[i].name, res[i].description, res[i].url, res[i].category, res[i].owner, res[i].furniture_id, res[i].number, res[i].layer, res[i].out, res[i].remind, res[i].time, res[i].content]);
              }
            }
          }
        }
      }
    });
  });
}

function downloadfurniture(space_id) {
  db.transaction(function (tx) {
    $.ajax({
      type: "GET",
      headers: {
        "Authorization": "Token " + user_token + ""
      },
      async: false,
      url: "http://140.131.114.157/furnitures/own/" + space_id + "",
      error: function (err) {
        alert(JSON.stringify(err));
      },
      success: function (res) {
        // alert(JSON.stringify(res));
        // alert(res.length);
        // alert(res[0].id);
        var len = res.length
        if (len >= 1) {
          for (var i = 0; i < len; i++) {
            downloadthing(res[i].id);
            if (!res[i].url) {
              tx.executeSql('INSERT INTO furniture (id, name, image, layer, space_id) VALUES (?,?,?,?,?)', [res[i].id, res[i].name, res[i].image, res[i].layer, res[i].space_id]);
            } else {
              tx.executeSql('INSERT INTO furniture (id, name, image, layer, space_id) VALUES (?,?,?,?,?)', [res[i].id, res[i].name, res[i].url, res[i].layer, res[i].space_id]);
            }
          }
        }
      }
    });
  });
}


function downloadspace(planargraph_id) {
  db.transaction(function (tx) {
    $.ajax({
      type: "GET",
      headers: {
        "Authorization": "Token " + user_token + ""
      },
      async: false,
      url: "http://140.131.114.157/spaces/own/" + planargraph_id + "",
      error: function (err) {
        alert(JSON.stringify(err));
      },
      success: function (res) {
        // alert(JSON.stringify(res));
        // alert(res.length);
        // alert(res[0].id);
        var len = res.length
        if (len >= 1) {
          for (var i = 0; i < len; i++) {
            downloadfurniture(res[i].id);
            tx.executeSql('INSERT INTO space (id, name, space_color, number, planargraph_id) VALUES (?,?,?,?,?)', [res[i].id, res[i].name, res[i].space_color, res[i].number, res[i].planargraph_id]);
          }
        }
      }
    });
  });
}


function recovery() {
  $(".loading").css('display', 'block');
  $("html").removeClass("mm-wrapper_opening")
  setTimeout(recoveryend, 5000);
  db.transaction(function (tx) {
    tx.executeSql('DROP TABLE IF EXISTS planargraph');
    tx.executeSql('DROP TABLE IF EXISTS space');
    tx.executeSql('DROP TABLE IF EXISTS furniture');
    tx.executeSql('DROP TABLE IF EXISTS thing');
    tx.executeSql('DROP TABLE IF EXISTS owner');
    tx.executeSql('DROP TABLE IF EXISTS category');
    tx.executeSql('CREATE TABLE IF NOT EXISTS planargraph (id text primary key, name text, user_id integer)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS space (id text primary key, name text, number integer, space_color text, planargraph_id text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS thing (id text primary key, name text, description text, image text, category text, owner text, furniture_id text, number integer, layer text, out integer, remind integer, time date, content text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS furniture (id text primary key, name text, image text, layer text, space_id text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS category (id text primary key, name text, user_id integer)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS owner (id text primary key, name text, user_id integer)');

    $.ajax({
      type: "GET",
      headers: {
        "Authorization": "Token " + user_token + ""
      },
      async: false,
      url: "http://140.131.114.157/owners/own",
      error: function (err) {
        alert(JSON.stringify(err));
      },
      success: function (res) {
        // alert(JSON.stringify(res));
        var len = res.length
        if (len >= 1) {
          for (var i = 0; i < len; i++) {
            tx.executeSql('INSERT INTO owner (id, name, user_id) VALUES (?,?,?)', [res[i].id, res[i].name, res[i].user_id]);
          }
        }
      }
    })

    $.ajax({
      type: "GET",
      headers: {
        "Authorization": "Token " + user_token + ""
      },
      async: false,
      url: "http://140.131.114.157/categorys/own",
      error: function (err) {
        alert(JSON.stringify(err));
      },
      success: function (res) {
        // alert(JSON.stringify(res));
        var len = res.length
        if (len >= 1) {
          for (var i = 0; i < len; i++) {
            tx.executeSql('INSERT INTO category (id, name, user_id) VALUES (?,?,?)', [res[i].id, res[i].name, res[i].user_id]);
          }
        }
      }
    })




    $.ajax({
      type: "GET",
      headers: {
        "Authorization": "Token " + user_token + ""
      },
      async: false,
      url: "http://140.131.114.157/planargraphs/own",
      error: function (err) {
        alert(JSON.stringify(err));
      },
      success: function (res) {
        // alert(JSON.stringify(res));
        var len = res.length
        if (len >= 1) {
          for (var i = 0; i < len; i++) {
            downloadspace(res[i].id);
            tx.executeSql('INSERT INTO planargraph (id, name, user_id) VALUES (?,?,?)', [res[i].id, res[i].name, res[i].user_id]);

          }
        }
      }
    })


  });
}

function recoveryend() {
  $(".loading").css('display', 'none');
  $("#recoverymodal").modal('show');

}

//拖曳功能相關function
function dragStart(e) {
  var index = $(e.target).index()
  e.dataTransfer.setData('text/plain', index)
}
function dropped(e) {
  cancelDefault(e)

  // get new and old index
  let oldIndex = e.dataTransfer.getData('text/plain')
  let target = $(e.target)
  let newIndex = target.index()
  if (newIndex != oldIndex) {
    // remove dropped items at old place
    let dropped = $(this).parent().children().eq(oldIndex).remove()

    // insert the dropped items at new place
    if (newIndex < oldIndex) {
      target.before(dropped)
    } else {
      target.after(dropped)
    }
    //-9 是因為在space 之前已經用了10個li
    var lilist = $("li").slice(-1);
    var len = $("li").index(lilist) - 9;
    for (var i = 0; i < len; i++) {
      var listItem = $("#s" + i + "");
      var number = listItem.index("li") - 9
      var id = $("#s" + i + "").prop("class")
      var tran = function (i, number, id) {
        db.transaction(function (tx) {
          tx.executeSql("UPDATE space SET number = ? WHERE id = ?", [number, id]);
        });
      }(i, number, id);
    }
  }
}

function cancelDefault(e) {
  e.preventDefault()
  e.stopPropagation()
  return false
}