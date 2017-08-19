$(document).ready(function(){


    var overlay = $('#overlay'),
        main    = $('#main');
    $(window).on('load',function(){
        overlay.css('display','none');
        main.css(
            'display','block'
        )
        console.log('loads complete.')
    })
})


//(function(){
//
//    //    #aboutMeText .readMoreBtn,
//    //    #about,
//    //    #project,
//    //    #resources,
//    //    #homeMain ,
//    //    #main
//    //the loader
//    var overlay       = document.getElementById('overlay'),
//        body          = document.getElementById('main'),
//        homeMain      = document.getElementById('homeMain'),
//        resources     = document.getElementById('resources'),
//        about         = document.getElementById('about'),
//        readMoreBtn   = document.getElementsByTagName('#aboutMeText .readMoreBtn')
//
//    window.addEventListener('load', function(){
//        overlay.style.display = 'none'; 
//
//        body.style.visibility = 'visible'
//        body.style.height = '100%'
////        resources.style.visibility = 'visible'
////        about.style.visibility = 'visible'
////        readMoreBtn.style.visibility = 'visible'
//
//    })
//
//})();


