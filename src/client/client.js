$(function(){

    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

    var username = getUrlParameter("username");

    $.ajax({
        type: "POST",
        url: "/tomcat/postLogin",
        data: username,
        dataType: "json",
        error: function(xhr, status, error) {
          alert("ERROR: " + JSON.parse(xhr.responseText).message);
        },
        success: function(data, status){
            $.ajax({
                type: "GET",
                url: "/tomcat/getNewMessages/" + username,
                error: function(xhr, status, error) {
                  alert("ERROR: " + JSON.parse(xhr.responseText).message);
                },
                success: function(data, status){
                    for(i = 0; i < data.length; i++){
                        $("#chatWindow").val($("#chatWindow").val() +
                            "\n" + data[i].username + ": " + data[i].message);
                    }
                }
            });
        }
    });

    $("#submit").click(function() {
        $.ajax({
            type: "POST",
            url: "/tomcat/postMessage",
            data: JSON.stringify({
                username: username,
                message: $("#input").val()
            }),
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
            },
            dataType: "json",
            error: function(xhr, status, error) {
                alert("ERROR: " + JSON.parse(xhr.responseText).message);
            },
            success: function(data, status){
                $.ajax({
                    type: "GET",
                    url: "/tomcat/getNewMessages/" + username,
                    error: function(xhr, status, error) {
                      alert("ERROR: " + JSON.parse(xhr.responseText).message);
                    },
                    success: function(data, status){
                        for(i = 0; i < data.length; i++){
                            $("#chatWindow").val($("#chatWindow").val() +
                                "\n" + data[i].username + ": " + data[i].message);
                        }
                    }
                });
            }
        });
    });

    $("#logout").click(function(){
        if(confirm("Are you sure you would like to log out?")){
            $.ajax({
                type: "POST",
                url: "/tomcat/postLogout",
                data: username,
                dataType: "json",
                error: function(xhr, status, error) {
                  alert("ERROR: " + JSON.parse(xhr.responseText).message);
                },
                success: function(data, status){
                    window.location.replace("/");
                }
            });
        }
    });
});

