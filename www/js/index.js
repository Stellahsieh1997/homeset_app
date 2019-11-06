setTimeout(start, 2500);
function openCity(evt, cityName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("city");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace("upcon1", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += "upcon1";
}

document.addEventListener("deviceready", onDeviceReady, false);
var db;
function onDeviceReady() {
    db = window.sqlitePlugin.openDatabase({
        name: 'my.db',
        location: 'default',
    });

    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS planargraph');
        tx.executeSql('DROP TABLE IF EXISTS space');
        tx.executeSql('DROP TABLE IF EXISTS furniture');
        tx.executeSql('DROP TABLE IF EXISTS thing');
        tx.executeSql('DROP TABLE IF EXISTS category');
        tx.executeSql('DROP TABLE IF EXISTS owner');
        tx.executeSql('DROP TABLE IF EXISTS user');
        tx.executeSql('DROP TABLE IF EXISTS page');
        tx.executeSql('CREATE TABLE IF NOT EXISTS user (id integer primary key, email text, token text, nickname text, backup text)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS page (id integer primary key, home integer, furniture_page integer, search_page integer, post_page integer)');

    });
}

function start() {
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM user", [],
            function (tx, res) {
                var len = res.rows.length;
                if (res.rows.length >= 1) {
                    location.href = 'H01.html'
                } else {
                    $(".first").css('display', 'none');
                }
            }, function (error) {
                alert(JSON.stringify(error))
            });
    });

}

function adduser(id, email, token, nickname) {

    db.transaction(function (tx) {
        tx.executeSql("INSERT INTO user (id, email, token, nickname) VALUES (?,?,?,?)", [id, email, token, nickname],
            function (tx, res) {
                tx.executeSql("SELECT * FROM page", [],
                    function (tx, res) {
                        var len = res.rows.length;
                        if (res.rows.length == 0) {
                            tx.executeSql("INSERT INTO page (id) VALUES (?)", [1],
                                function (tx, res) {
                                    location.href = 'H01.html'
                                });
                        } else {
                            location.href = 'H01.html'
                        }
                    });
            }, function (error) {
                alert(JSON.stringify(error))
                // location.href = 'H01.html'
            });
    });

}

function register() {
    $("#loading").html(` <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
          `);
    let emailvalue = $("#registeremail").val();
    if (!emailvalue) {
        $('#emailwarn0').html('<i class="icon ion-md-information-circle"></i>');
        $('#emailwarn0').append("請填寫您要註冊的電子郵件");
        $("#loading").html("確定")
        return
    }
    if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailvalue))) {
        $('#emailwarn0').html('<i class="icon ion-md-information-circle"></i>');
        $('#emailwarn0').append("請在電子郵件地址中包含( @ 和 . )");
        $("#loading").html("確定")
        return
    }

    let nicknamevalue = $("#registernickname").val();
    if (!nicknamevalue) {
        $('#nicknamewarn').html('<i class="icon ion-md-information-circle"></i>');
        $('#nicknamewarn').append("請填寫您的暱稱");
        $("#loading").html("確定")
        return
    }

    $.ajax({
        type: "POST",
        url: "http://140.131.114.157/users",
        data: {
            "username": emailvalue,
            "email": emailvalue,
            "nickname": nicknamevalue,
            "is_active": true
        },
        error: function (err) {
            if (err.status == 400) {
                $('#emailwarn0').html('<i class="icon ion-md-information-circle"></i>');
                $('#emailwarn0').append("此電子郵件已經註冊過");
                $("#loading").html("確定")
            }
        },
        success: function (res) {
            $('#emailwarn0').html("")
            $("#registervd").modal('show');
            $("#emailkeep").text(emailvalue);
            $("#loading").html("確定")
            // alert(JSON.stringify(res))

        }
    })
}

function login() {
    $("#loading2").html(` <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
          `);
    let emailvalue = $("#loginEmail").val();
    let passwordvalue = $("#loginPassword").val();
    if (!emailvalue) {
        $('#emailwarn1').html('<i class="icon ion-md-information-circle"></i>');
        $('#emailwarn1').append("請填寫您註冊的電子郵件");
        $("#loading2").html("確定")
        return
    }
    if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailvalue))) {
        $('#emailwarn1').html('<i class="icon ion-md-information-circle"></i>');
        $('#emailwarn1').append("電子郵件地址中包含( @ 和 . )");
        $("#loading2").html("確定")
        return
    }
    $.ajax({
        type: "POST",
        url: "http://140.131.114.157/users/login",
        data: {
            "username": emailvalue,
            "password": passwordvalue
        },
        error: function (err) {
            $('#emailwarn1').html('<i class="icon ion-md-information-circle"></i>');
            $('#emailwarn1').append("帳號或密碼有誤");
            $("#loading2").html("確定")
            $("#loginEmail").val("")
            $("#loginPassword").val("")

            // alert(JSON.stringify(err))
        },
        success: function (res) {
            // alert(JSON.stringify(res))
            // alert(res.token)
            $("#loading2").html("確定")
            adduser(res.user.id, res.user.email, res.token, res.user.nickname)
        }
    })
}

// 主畫面的忘記密碼文字連結
function reset() {
    $("#forgetpassword").modal('show')
}
// 忘記密碼互動視窗的送出
function resetText() {
    $("#loading3").html(` <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
          `);
    let emailvalue = $("#resetEmail").val();
    if (!emailvalue) {
        $('#emailwarn2').html('<i class="icon ion-md-information-circle"></i>');
        $('#emailwarn2').append("請填寫您註冊的電子郵件");
        $("#loading3").html("確定")
        return
    }
    if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailvalue))) {
        $('#emailwarn2').html('<i class="icon ion-md-information-circle"></i>');
        $('#emailwarn2').append("會員帳號格式錯誤");
        $("#loading3").html("確定")
        return
    }


    $.ajax({
        type: "POST",
        url: "http://140.131.114.157/users/password_reset",
        data: {
            "email": emailvalue
        },
        error: function (err) {
            $('#emailwarn2').html('<i class="icon ion-md-information-circle"></i>');
            $('#emailwarn2').append("此電子郵件不存在");
            $("#loading3").html("確定")
        },
        success: function (res) {
            $("#resetText").html(`<p style="font-size:18px;"><b>變更密碼確認信已送出</b></p>
                         <p>為了確保會員切身的權益，我們已經寄發確認信到 <span style="font-size:18px;"> `+ emailvalue + `</span>。</p>
                         <p>請在24小時內至該信箱收取確認信，並重新設定密碼。</p>`)
            $("#loading3").html("確定")
        }
    })


}

// 重新發送開通郵件互動視窗
function resendEmail() {
    $("#loading4").html(` <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
          `);
    var emailvalue = $("#emailkeep").text();
    $.ajax({
        type: "POST",
        url: "http://140.131.114.157/users/password_resend",
        data: {
            "email": emailvalue
        },
        error: function (err) {
            $("#loading4").html("重新發送開通郵件")
        },
        success: function (res) {
            $("#loading4").html("重新發送開通郵件")
        }
    })


}