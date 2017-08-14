//$(document).ready(function(){
//
//    
//    var overlay = $('#overlay');
//    $(window).on('load',function(){
//        overlay.css('display','none');
//    })
//})


(function(){
    
    var overlay = document.getElementById('overlay');
    var body    = document.getElementsByTagName('html');
    body.style.display = 'none';
    window.addEventListener('load', function(){
        overlay.style.display = 'none';
        body.style.display = ''
    })
    
})();


