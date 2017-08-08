(function(){

    var icon        = $('.icon'),
        iconOffset  = icon.offset().top/2;
    
    var pEl         = $('.slideEffect');
    var offsetEl    = pEl.offset().top/2 + 100;
    var elContent   = $('.aboutContent');
    var fa          = $('.fa');
    //    console.log(offsetEl)
    //    console.log(divEl.position().top/2)


    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        elContent.css(
            'padding',
            '100px 10px 10px 10px',
        )
    } else {

        $(document).scroll(function(){

            if($(document).scrollTop() > iconOffset){
                icon.removeClass('icon');
                icon.addClass('iconEffect');
            }       

            if($(document).scrollTop() > offsetEl){
                fa.removeClass('profile-social-icon');
                fa.addClass('show-profile-social-icon');
                elContent.addClass('slide-in');
            }

        })

    }
 
})();