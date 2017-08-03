$(window).scroll(function(){

    if($(document).scrollTop() > 15 ){ 
        $('nav').removeClass('shrinkBack')
        $('nav').addClass('shrink').slideDown();
    } 
    else {
        $('nav').addClass('shrinkBack');
        $('nav').removeClass('shrink');

    }


})