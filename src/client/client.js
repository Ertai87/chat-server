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
    alert(username);

    $.ajax({
        type: "POST",
        url: "/tomcat/postLogin",
        data: username,
        dataType: "json",
        error: function(xhr, status, error) {
          alert("ERROR: " + JSON.parse(xhr.responseText).message);
        }
    });

    $("#submit").click(function() {
        alert("User: " + username + "\nMessage: " + $("#input").val());
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
            success: function(data, status){
                $.ajax({
                    type: "GET",
                    url: "/tomcat/getNewMessages/" + username,
                    error: function(xhr, status, error) {
                      alert("ERROR: " + JSON.parse(xhr.responseText).message);
                    }
                });
            },
            error: function(xhr, status, error) {
                alert("ERROR: " + JSON.parse(xhr.responseText).message);
            }
        });
    });
});

