window.addEventListener('load', onLoad, false);

function onLoad(picturePath) {
    var canvas = $("#canvas").get(0);
    var context = canvas.getContext("2d");  
    //context.drawImage(picturePath,0, 0, 282, 282);
    context.strokeStyle = "black";
    context.lineWidth = 5;

    var startX = 0;
    var startY = 0;
    var offsetLeft = $("canvas").offset().left;
    var offsetTop = $("canvas").offset().top;

    var drawFlag = false;

    $('#canvas').mousedown(function(e) {
        drawFlag = true;
        startX = e.pageX - offsetLeft;
        startY = e.pageY - offsetTop;
        return false;
    });
    
    $('#canvas').on("mousemove", function(e){
        
        if (!drawFlag) return;

        var pageX = e.pageX;
        var pageY = e.pageY;
        var endX = pageX - offsetLeft;
        var endY = pageY - offsetTop;

        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
        context.closePath();

        startX = endX;
        startY = endY;
    })
    
    $('#canvas').on('mouseup', function() {
        drawFlag = false;
    });
 
    $('#canvas').on('mouseleave', function() {
        drawFlag = false;
    });
}

function canvas_small(){
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3
}

function canvas_big(){
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7
}

function canvas_eraser(){
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 15
}

// canvasをリセット
function clearCanvas(){
    var canvas = $("#canvas").get(0);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveBase() {
    var imageType = "image/png";
    var canvas = document.getElementById("canvas");
    var base64 = canvas.toDataURL(imageType);

    $.ajax({
        //画像処理サーバーに返す場合
        url: '/project',   
        type: 'POST',
        headers: {
            "Content-type": "application/json",
        },
        data: JSON.stringify({ "image": base64, "explanation": $("#explanation").val(), type: $("#type").val() }),
        dataType: "json",
        success: function(response) {
            location.href = response.url;
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

// canvas上のイメージを保存
function saveCanvas(path) {
    var imageType = "image/png";
    var canvas = document.getElementById("canvas");
    var base64 = canvas.toDataURL(imageType);
    var selectPart = $('#select-part').val();

    $.ajax({
        //画像処理サーバーに返す場合
        url: path,   
        type: 'POST',
        headers: {
            "Content-type": "application/json",
        },
        data: JSON.stringify({ "name": selectPart,"image": base64 }),
        dataType: "json",
        success: function(response) {
            location.href = response.url;
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}
