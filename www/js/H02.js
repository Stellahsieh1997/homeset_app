//資料庫
document.addEventListener("deviceready", onDeviceReady, false);
var db;
var categorypicker
var ownerpicker
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
    tx.executeSql('CREATE TABLE IF NOT EXISTS thing (id text primary key, name text, description text, image text, category text, owner text, furniture_id text, number integer, layer text, out integer, remind integer, time date, content text)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS category (id text primary key, name text, user_id integer)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS owner (id text primary key, name text, user_id integer)');
  });


  //呈現提醒
  db.transaction(function (tx) {
    $(".list-group-flush").html("")
    tx.executeSql('SELECT * FROM thing ', [], function (tx, res) {
      if (res.rows.length >= 1) {
        for (var j = 0; j < res.rows.length; j++) {
          if (res.rows.item(j)['remind'] == 1) {
            $(".list-group-flush").append(`<li class="list-group-item">
                                                  <a href="T01_edit.html?thing=`+ res.rows.item(j)['id'] + `"><div class="rect"><img src="` + res.rows.item(j)['image'] + `" ><p>` + res.rows.item(j)['name'] + `</p><p>提醒日:` + res.rows.item(j)['time'] + `</p><p>提醒內容:` + res.rows.item(j)['content'] + `</p></div></a></li>`)

          }
        }

      }
    });
  });
}