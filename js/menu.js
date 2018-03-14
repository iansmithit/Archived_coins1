function menu() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}


function createFooter() {
    var value = '';
    document.getElementById("footer").innerHTML = "";
    value += "<div class='footer' style='position:fixed;left:0px; bottom:0px; height:30px; width:100%;'>";
    value += "<div class='footer-inner' style='text-align:center'>";
    value += "<a href='#' target='_404.html' style='color:#ffffff'>IanSmith.IT</a>";
    value += "</div></div>";
    document.getElementById("footer").innerHTML = value;
}

