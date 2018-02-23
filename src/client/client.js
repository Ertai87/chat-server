$(function(){
    $("#submit").click(function() {
        alert($("#input").val());
        $.ajax({
            type: "POST",
            url: "/tomcat/receiveMessage",
            data: JSON.stringify({
                username: "user1",
                message: $("#input").val()
            }),
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
            },
            dataType: "json",
            success: function(data, status){
                alert("Data: " + data + "\nStatus: " + status);
            },
            error: function (e) {
                 // error handler
                 console.log(e);
                 alert('fail' + status.code);
            }
        });
    });
    $("#receive").click(function() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "http://localhost:8080/sendMessageLog");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send()
        alert(xmlhttp.responseText);
    });
});

