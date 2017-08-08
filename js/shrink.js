//NAVBAR FADING EFFECTS

$(window).scroll(function(){

    if($(document).scrollTop() > 15 ){ 
        $('nav').removeClass('shrinkBack');
        $('nav').addClass('shrink');
        
    } 
    else {
        $('nav').addClass('shrinkBack');
        $('nav').removeClass('shrink');

    }
})