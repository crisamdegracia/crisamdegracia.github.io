(function(){

    var icon        = $('.icon'),
        iconOffset  = icon.offset().top/2,
        fontColor   = $('.generalFont'),
        resourcesContent = $('#resourcesContent');

    var pEl         = $('.slideEffect');
    var offsetEl    = pEl.offset().top/2 + 200;
    var elContent   = $('.aboutContent');
    var fa          = $('.fa');
    //    console.log(offsetEl)
    //    console.log(divEl.position().top/2)


    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        console.log('im in mobile bitch!');
        elContent.removeClass('aboutContent');
        elContent.addClass('mobileAboutContent');
        fa.css(
            'fontSize','2em',
        )
        icon.css(
            'fontSize','5em'
        )
        fontColor.css(
            'color','#ddd'
        )
        resourcesContent.css(
            'background','rgba(255,255,255,0.2)'
        )
    } else {
        $(document).scroll(function(){

            if($(document).scrollTop() > iconOffset){
                resourcesContent.css(
                'background','rgba(255,255,255, 0.2)'
                )
                icon.removeClass('icon');
                icon.addClass('iconEffect');
//                resourcesContent.addClass('slide-in');
            }       

            if($(document).scrollTop() > offsetEl){
                fontColor.css(
                    'color','#ddd'
                )
                resourcesContent.css(
                'background','rgba(255,255,255, 0.2)'
                )
                fa.removeClass('profile-social-icon');
                fa.addClass('show-profile-social-icon');
                elContent.addClass('slide-in');
            }

        })

    }

})();