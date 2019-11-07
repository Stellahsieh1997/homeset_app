/*取消新增類別、所屬人*/
function clearcategoryvalue() {
    document.getElementById("category").innerHTML = '<img src="static/right-arrow.png" style="height:20px">';
}

function clearownervalue() {
    document.getElementById("owner").innerHTML = '<img src="static/right-arrow.png" style="height:20px">';
}
//提醒小幫手
function datechecked() {
    var reminderinput = document.getElementById("reminder");
    var remindertext = document.getElementById("remindertext");
    var onoffcheckbox = document.getElementById("myonoffswitch2");
    if (onoffcheckbox.checked == true) {
        reminderinput.style.display = "";
        remindertext.style.display = "";
        reminderinput.value = "時間設定";

    }
    else {
        reminderinput.value = "";
        remindertext.value = "";
        reminderinput.style.display = "none";
        remindertext.style.display = "none";


    }
}
$("#exampleFormControlInput1").change(function () {
    $("#tndwarn").html("");
});

function clearnumber() {
    $("#number").html(1);
}
function addnumber() {
    var addnumbervalue = $("#addnumber").val()
    if (!addnumbervalue) {
        $("#numberwarn").css('display', 'block');
        $('#numberwarn').html('<i class="icon ion-md-information-circle"></i>');
        $('#numberwarn').append("請輸入數量");
        return
    }
    if (parseFloat(addnumbervalue).toString() == "NaN") {
        $("#numberwarn").css('display', 'block');
        $('#numberwarn').html('<i class="icon ion-md-information-circle"></i>');
        $('#numberwarn').append("請輸入數字");
        return
    }
    $('#numberwarn').html("");
    $("#number").html(addnumbervalue);
    $("#numbermodal").modal("hide");
}

var user_email;
var user_token;
var user_id;

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
        tx.executeSql('CREATE TABLE IF NOT EXISTS user (id integer primary key, email text, token text, nickname text, backup text)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS planargraph (id text primary key, name text, user_id integer)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS space (id text primary key, name text, number integer, space_color text, planargraph_id text)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS thing (id text primary key, name text, description text, image text, category text, owner text, furniture_id text, number integer, layer text, out integer, remind integer, time date, content text)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS furniture (id text primary key, name text, image text, layer text, space_id text)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS category (id text primary key, name text, user_id integer)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS owner (id text primary key, name text, user_id integer)');
    });

    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM user', [],
            function (tx, res) {
                var len = res.rows.length;
                if (res.rows.length >= 1) {
                    user_email = res.rows.item(0)['email'];
                    user_token = res.rows.item(0)['token'];
                    user_id = res.rows.item(0)['id'];

                    //類別滾輪
                    var categoryselect = []
                    var categoryselect2 = ['包包', '鞋子', '衣服', '文具', '工具', '玩具', '杯子', '飾品', '化妝品', '眼鏡', '新增類別']
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
                                trigger: '#category',
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
                                    $('#categorywarn').text("");

                                } //初始化定位        

                            });

                        }, function (error) {
                            alert('Something went Wrong');
                        });


                    //所屬人滾輪
                    var ownerselect = []
                    var ownerselect2 = ['自己', '爸爸', '媽媽', '哥哥', '弟弟', '姊姊', '妹妹', '爺爺', '奶奶', '朋友', '同事', '新增所屬人']

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
                                trigger: '#owner',
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
                                    $('#ownerwarn').text("");
                                }
                            });
                        }, function (error) {
                            alert('Something went Wrong');
                        });

                    //可選擇位置滾輪資料庫
                    var storage = []
                    var fstorage = []
                    tx.executeSql('SELECT * FROM planargraph WHERE user_id = ?', [res.rows.item(0)['id']], function (tx, res) {
                        if (res.rows.length >= 1) {
                            var len = res.rows.length;
                            for (var y = 0; y < len; y++) {
                                var planargraphname = res.rows.item(y)['name']
                                var tran = function (y, planargraphname) {
                                    tx.executeSql('SELECT * FROM space WHERE planargraph_id = ?', [res.rows.item(y)['id']],
                                        function (tx, res) {
                                            var len = res.rows.length;
                                            // alert(len)
                                            if (res.rows.length >= 1) {
                                                for (var i = 0; i < len; i++) {
                                                    var spaceId = res.rows.item(i)['id'];
                                                    var spacename = planargraphname + " " + res.rows.item(i)['name'];
                                                    var tr = function (spaceId, spacename) {
                                                        tx.executeSql('SELECT * FROM furniture WHERE space_id = ?', [spaceId], function (tx, res) {
                                                            var len = res.rows.length;
                                                            // alert(len);
                                                            if (res.rows.length >= 1) {
                                                                for (var j = 0; j < len; j++) {
                                                                    fstorage.push({ id: res.rows.item(j)['id'], value: res.rows.item(j)['name'] });
                                                                }
                                                                storage.push({ id: spaceId, value: spacename, childs: fstorage });

                                                                // alert(JSON.stringify(storage));
                                                                fstorage = []
                                                                placeselect.updateWheels(storage);
                                                            }
                                                        });
                                                    }(spaceId, spacename)
                                                }
                                            }
                                        }, function (error) {
                                            alert('Something went Wrong');
                                        });
                                }(y, planargraphname)
                            }
                        }
                    });

                }
            }, function (error) {
                alert('Something went Wrong');
            });
    });




    let urlParams = new URLSearchParams(window.location.search);
    var thingId = urlParams.get('thing');
    // alert(thingId);

    //呈現物品資訊
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM thing WHERE id = ?', [thingId],
            function (tx, res) {
                if (res.rows.length >= 1) {
                    $("#myImage").attr("src", res.rows.item(0)['image']);
                    // document.getElementById('myImage').src = res.rows.item(0)['image'];
                    $("#exampleFormControlInput1").val(res.rows.item(0)['name']);
                    $("#exampleFormControlTextarea1").val(res.rows.item(0)['description']);
                    if (!res.rows.item(0)['category']) {
                        $("#category").html(`<img src = "static/right-arrow.png" style = "height:20px">`)
                    } else { $("#category").text(res.rows.item(0)['category']); }

                    if (!res.rows.item(0)['owner']) {
                        $("#owner").html(`<img src = "static/right-arrow.png" style = "height:20px">`)
                    } else { $("#owner").text(res.rows.item(0)['owner']); }

                    tx.executeSql('SELECT * FROM furniture WHERE id = ?', [res.rows.item(0)['furniture_id']],
                        function (tx, res) {
                            var furniturename = res.rows.item(0)['name'];
                            tx.executeSql('SELECT * FROM space WHERE id = ?', [res.rows.item(0)['space_id']],
                                function (tx, res) {
                                    var spacename = res.rows.item(0)['name'];
                                    tx.executeSql('SELECT * FROM planargraph WHERE id = ?', [res.rows.item(0)['planargraph_id']],
                                        function (tx, res) {
                                            var planargraphname = res.rows.item(0)['name'];
                                            $("#place").text(planargraphname + " " + spacename + " " + furniturename);
                                        });
                                });
                        });

                    if (!res.rows.item(0)['number']) {
                        $("#number").html(`1`)
                    } else { $("#number").text(res.rows.item(0)['number']); }

                    if (!res.rows.item(0)['layer']) {
                        $("#layer").html(`1`)
                    } else { $("#layer").text(res.rows.item(0)['layer']); }

                    if (res.rows.item(0)['out'] == 1) {
                        var out = true;
                        var onoffcheckbox = document.getElementById("myonoffswitch");
                        onoffcheckbox.checked = out;
                    }

                    if (res.rows.item(0)['remind'] == 1) {
                        var remind = true;
                        var onoffcheckbox2 = document.getElementById("myonoffswitch2");
                        onoffcheckbox2.checked = remind;
                        datechecked();
                        $("#reminder").val(res.rows.item(0)['time']);
                        $("#remindertext").val(res.rows.item(0)['content']);
                    }


                }
            }, function (error) {
                alert('Something went Wrong');
            });
    });

    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM thing WHERE id = ?', [thingId], function (tx, res) {
            var date1 = res.rows.item(0)['time']

            var timer = new Date(date1);

            var curdate = new Date();

            if (timer < curdate) {
                let urlParams = new URLSearchParams(window.location.search);
                var thingId = urlParams.get('thing');

                db.transaction(function (tx) {
                    var query = "UPDATE thing SET remind=? WHERE id = ?";
                    tx.executeSql(query, [0, thingId]);
                    // alert("ok");
                    var onoffcheckbox2 = document.getElementById("myonoffswitch2");
                    onoffcheckbox2.checked = false;
                    datechecked()
                });
            }
        });
    });

    // 執行夾層判斷
    layertest();

}


function layertest() {
    // 夾層
    let urlParams = new URLSearchParams(window.location.search);
    var thingId = urlParams.get('thing');
    var layers = []
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM thing WHERE id = ?', [thingId],
            function (tx, res) {
                tx.executeSql('SELECT * FROM furniture WHERE id = ?', [res.rows.item(0)['furniture_id']],
                    function (tx, res) {
                        var len = res.rows.length;
                        if (res.rows.length >= 1) {
                            if (res.rows.item(0)['layer'] != "無夾層") {
                                if ($("#layer").text() == "無夾層") (
                                    $("#layer").html(`1`)
                                )
                                $('#layertest').removeClass('hide');
                                $('#layertest').addClass('d-flex');
                                for (var i = 1; i <= res.rows.item(0)['layer']; i++) {
                                    layers.push(i)
                                }
                                layerselect.updateWheel(0, layers);
                                layerselect.locatePosition(0, 0);
                            } else {
                                $('#layertest').removeClass('d-flex');
                                $('#layertest').addClass('hide');
                            }
                        }

                    }, function (error) {
                        alert('Something went Wrong');
                    });
            });
    });
}


//更新資料庫 儲存按鈕
function savevalue() {

    var img = $("#myImage").attr("src");
    var name = $("#exampleFormControlInput1").val();
    if (!name) {
        $('#tndwarn').html('<i class="icon ion-md-information-circle"></i>');
        $('#tndwarn').append("請輸入物品名稱");
        $('#tnform').addClass("was-validated");
        document.getElementById('exampleFormControlInput1').focus()
        return
    }
    var description = $("#exampleFormControlTextarea1").val();
    var categoryValue = $("#category").text();
    if (!categoryValue) {
        $('#categorywarn').html('<i class="icon ion-md-information-circle"></i>');
        $('#categorywarn').append("尚未選取");
        return
    }
    var ownerValue = $("#owner").text();
    if (!ownerValue) {
        $('#ownerwarn').html('<i class="icon ion-md-information-circle"></i>');
        $('#ownerwarn').append("尚未選取");
        return
    }
    // var placeValue = document.getElementById("place").innerHTML;
    var numberValue = $("#number").text();
    var layertest = $('#layertest').hasClass('hide');
    if (layertest === true) {
        var layerValue = "無夾層"
    } else {
        var layerValue = $("#layer").text();
    }
    // var layerValue = $("#layer").text();
    // if (!layerValue) {
    //     $('#layerwarn').html('<i class="icon ion-md-information-circle"></i>');
    //     $('#layerwarn').append("尚未選取");
    //     return
    // }
    var onoffcheckbox = document.getElementById("myonoffswitch");
    var out
    if (onoffcheckbox.checked == true) {
        out = 1

    } else {
        out = 0
    }

    var onoffcheckbox2 = document.getElementById("myonoffswitch2");
    var remind
    var reminder
    var remindertextValue
    if (onoffcheckbox2.checked == true) {
        remind = 1
        reminder = $("#reminder").val();
        remindertextValue = $("#remindertext").val();
    } else {
        remind = 0
        reminder = null
        remindertextValue = null
    }

    let urlParams = new URLSearchParams(window.location.search);
    var thingId = urlParams.get('thing');
    var noteid = thingId.slice(-13)

    //建立提醒通知
    let props = cordova.plugins.notification.local.getDefaults();
    var date1 = $("#reminder").val()
    let timer = new Date(date1);
    let noteOptions = {
        id: noteid,
        title: $("#exampleFormControlInput1").val() + "的物品提醒",
        text: $("#remindertext").val(),
        at: timer,
        vibrate: true,
        thingId: thingId,
        icon: 'http://140.131.114.157/media/logo.jpg'
    };
    cordova.plugins.notification.local.schedule(noteOptions);



    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM thing WHERE id = ?', [thingId],
            function (tx, res) {
                tx.executeSql('SELECT * FROM furniture WHERE id = ?', [res.rows.item(0)['furniture_id']],
                    function (tx, res) {
                        var query = "UPDATE thing SET name = ?,description = ?,image = ?,category = ?,owner = ?,number = ?,layer = ?,out = ?,remind = ?,time = ?,content = ? WHERE id = ?";
                        tx.executeSql(query, [name, description, img, categoryValue, ownerValue, numberValue, layerValue, out, remind, reminder, remindertextValue, thingId],
                            function (tx, res) {
                                history.back();
                            });

                    });
            }, function (error) {
                alert('Something went Wrong');
            });
    });

}

//刪除物品
function tddv() {
    let urlParams = new URLSearchParams(window.location.search);
    var thingId = urlParams.get('thing');
    db.transaction(function (tx) {

        tx.executeSql('SELECT * FROM thing WHERE id = ?', [thingId],
            function (tx, res) {
                tx.executeSql('SELECT * FROM furniture WHERE id = ?', [res.rows.item(0)['furniture_id']],
                    function (tx, res) {
                        var space_id = res.rows.item(0)['space_id'];
                        var furniture_id = res.rows.item(0)['id'];
                        tx.executeSql("DELETE FROM thing where id = ?", [thingId],
                            function (tx, res) {
                                location.href = "F01.html?space=" + space_id + "&furniture=" + furniture_id + "";
                            });

                    });
            }, function (error) {
                alert('Something went Wrong');
            });
    });

}

//回上一頁
function reload() {
    let urlParams = new URLSearchParams(window.location.search);
    var thingId = urlParams.get('thing');
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM thing WHERE id = ?', [thingId],
            function (tx, res) {
                tx.executeSql('SELECT * FROM furniture WHERE id = ?', [res.rows.item(0)['furniture_id']],
                    function (tx, res) {
                        location.href = "F01.html?space=" + res.rows.item(0)['space_id'] + "&furniture=" + res.rows.item(0)['id'] + "";
                    });
            }, function (error) {
                alert('Something went Wrong');
            });
    });
}

//拍照
function takephoto() {
    let opts = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        mediaType: Camera.MediaType.PICTURE,
        encodingType: Camera.EncodingType.JPEG,
        cameraDirection: Camera.Direction.BACK
    };
    navigator.camera.getPicture(function cameraSuccess(imgURI) {
        document.getElementById('myImage').src = imgURI;
        $('#exampleModal4').modal('hide')
    }, function cameraError(error) {
        alert("Unable to obtain picture: " + error, "app");
    }, opts);
}

function imgget() {
    var permissions = cordova.plugins.permissions;
    permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE, function (s) {
        window.imagePicker.getPictures(
            function (results) {
                var imgURI = results[0]
                if (!imgURI) {
                } else {
                    document.getElementById('myImage').src = imgURI;
                }
                $('#exampleModal4').modal('hide')
            }, function (error) {
                console.log('Error: ' + error);
            }, {
            maximumImagesCount: 1,
            quality: 50
        }
        );
    }, function (error) {
        console.log('Error: ' + error);
    });
}

//新增類別
function addcategory() {
    var categoryselect = []
    var categoryselect2 = ['包包', '鞋子', '衣服', '文具', '工具', '玩具', '杯子', '飾品', '化妝品', '眼鏡', '新增類別']
    var addcategoryValue = document.getElementById("addcategory").value;
    if (!addcategoryValue) {
        $("#categorynwarn").css('display', 'block');
        $('#categorynwarn').html('<i class="icon ion-md-information-circle"></i>');
        $('#categorynwarn').append("請輸入類別");
        return
    }
    document.getElementById("category").innerHTML = addcategoryValue;

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
                        $("#categorynwarn").css('display', 'block');
                        $('#categorynwarn').html('<i class="icon ion-md-information-circle"></i>');
                        $('#categorynwarn').append("已有此類別");
                        return false
                    }
                }

                tx.executeSql('INSERT INTO category (id, name, user_id) VALUES (?,?,?)', [categoryId, addcategoryValue, user_id],
                    function (tx, res) {
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
                                // alert(typeof categoryselect3)
                                categorypicker.updateWheel(0, categoryselect3);
                                categorypicker.locatePosition(0, 0);
                                $('#addcategory').val("");
                                $('#categorynwarn').html('');
                                $('#categorymodal').modal('hide')
                            });

                    });
            });
    });
}

//新增所屬人
function addowner() {
    var ownerselect = []
    var ownerselect2 = ['自己', '爸爸', '媽媽', '哥哥', '弟弟', '姊姊', '妹妹', '爺爺', '奶奶', '朋友', '同事', '新增所屬人']
    var addownerValue = document.getElementById("addowner").value;
    if (!addownerValue) {
        $("#ownernwarn").css('display', 'block');
        $('#ownernwarn').html('<i class="icon ion-md-information-circle"></i>');
        $('#ownernwarn').append("請輸入所屬人");
        return
    }
    document.getElementById("owner").innerHTML = addownerValue;

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
                var ownerselect3 = ownerselect.concat(ownerselect2);
                for (var i = 0; i < ownerselect3.length; i++) {
                    if (addownerValue == ownerselect3[i]) {
                        $("#ownernwarn").css('display', 'block');
                        $('#ownernwarn').html('<i class="icon ion-md-information-circle"></i>');
                        $('#ownernwarn').append("已有此所屬人");
                        return false
                    }
                }
                tx.executeSql('INSERT INTO owner (id, name, user_id) VALUES (?,?,?)', [ownerId, addownerValue, user_id],
                    function (tx, res) {
                        tx.executeSql('SELECT * FROM owner WHERE user_id=?', [user_id],
                            function (tx, res) {
                                var len = res.rows.length;
                                ownerselect = []
                                if (res.rows.length >= 1) {
                                    for (var i = 0; i < len; i++) {
                                        ownerselect.push(res.rows.item(i)['name'])
                                    }
                                }
                                var ownerselect3 = ownerselect.concat(ownerselect2);
                                ownerpicker.updateWheel(0, ownerselect3);
                                ownerpicker.locatePosition(0, 0);
                                $('#addowner').val("");
                                $('#ownernwarn').html('');
                                $('#ownermodal').modal('hide')
                            });
                    });
            });
    });
}

$('input[name="reminder"]').daterangepicker({

    "singleDatePicker": true,
    "showDropdowns": true,
    "timePicker": true,
    "timePicker24Hour": true,
    // "autoUpdateInput": false,
    "startDate": "1990/01/01 00:00",
    "minDate": moment(),
    "cancelButtonClasses": "btn btn-secondary",
    // ranges: {
    //     "今天": [moment()],
    //     "明天": [moment().subtract(-1, "days")],
    //     "後天": [moment().subtract(-2, "days")],
    //     "下個月": [moment().subtract(-1, "month").startOf("month")]
    // },
    "locale": {
        "direction": "ltr",
        "format": "YYYY/MM/DD/ HH:mm",
        "separator": " - ",
        "applyLabel": "確定",
        "cancelLabel": "取消",
        "fromLabel": "From",
        "toLabel": "To",
        "customRangeLabel": "",
        "daysOfWeek": [
            "日",
            "一",
            "二",
            "三",
            "四",
            "五",
            "六"
        ],
        "monthNames": [
            "1月",
            "2月",
            "3月",
            "4月",
            "5月",
            "6月",
            "7月",
            "8月",
            "9月",
            "10月",
            "11月",
            "12月"
        ],
        "firstDay": 1
    },
    // "alwaysShowCalendars": true,
    "startDate": moment().subtract(-1, "days"),
    // "endDate": "2019/07/13",
    "drops": "up"
}, function (start, end, label) {
    // console.log("New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')");
});
$('input[name="reminder"]').on('apply.daterangepicker', function (ev, picker) {
    $(this).val(picker.startDate.format('YYYY/MM/DD/ HH:mm'));
});

$('input[name="reminder"]').on('cancel.daterangepicker', function (ev, picker) {
    // $(this).val('');
});


//數量滾輪
var mobileSelect2 = new MobileSelect({
    trigger: '#number',
    title: '數量',
    cancelBtnColor: '#f0f0f0',
    ensureBtnColor: '#f0f0f0',
    titleBgColor: '#254F6E',
    titleColor: '#f0f0f0',
    ensureBtnText: '確認',
    wheels: [
        {
            data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
                , '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '輸入數量']
        }
    ],
    position: [2] //初始化定位
});

//夾層滾輪
var layerselect = new MobileSelect({
    trigger: '#layer',
    title: '夾層',
    cancelBtnColor: '#f0f0f0',
    ensureBtnColor: '#f0f0f0',
    titleBgColor: '#254F6E',
    titleColor: '#f0f0f0',
    ensureBtnText: '確認',
    wheels: [
        { data: ['1'] }
    ],
    position: [0] //初始化定位
});

//位置滾輪


var placeselect = new MobileSelect({
    trigger: '#place',
    title: '存放位置',
    cancelBtnColor: '#f0f0f0',
    ensureBtnColor: '#f0f0f0',
    titleBgColor: '#254F6E',
    titleColor: '#f0f0f0',
    ensureBtnText: '確認',
    wheels: [
        {
            data: [
                {
                    id: '1',
                    value: '',
                    childs: [
                        { id: 'A1', value: '' },
                    ]
                }
            ]
        }
    ],
    position: [0, 0],
    callback: function (indexArr, data) {
        let urlParams = new URLSearchParams(window.location.search);
        var thingId = urlParams.get('thing');
        db.transaction(function (tx) {
            var query = "UPDATE thing SET furniture_id = ? WHERE id = ?";
            tx.executeSql(query, [data[1]["id"], thingId]);
        });
        layertest();
        $("#layer").text("1");
        // alert(data[0]["id"] + data[1]["id"]); //返回選中的json數據
    }
});