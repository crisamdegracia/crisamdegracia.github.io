$(function () {


    $(window).scroll(function (e) {
        var btn         = $("#floatingBtn"),
            position    = btn.offset().top,
            footer      = $('footer'),
            footerPosition  = footer.offset().top - 200,
            scrollTop       = $(document).scrollTop();

        if(   scrollTop > 15   &&   scrollTop < 3500 ){
            btn.css('display' , 'block');    
        } 

       else {
            btn.css('display' , 'none');

        }


//        console.log('---------------------')
        console.log(' Scroll Top :  ' + $(document).scrollTop())
//        console.log(' Document Height : ' + $(document).height())
//        console.log(' Button Position : ' + position)
//        console.log(' Footer Position  :  ' +footerPosition)
//        console.log('---------------------')

    });

});

