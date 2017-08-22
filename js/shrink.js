//NAVBAR FADING EFFECTS

$(window).scroll(function(e){

    if($(document).scrollTop() > 15 ){ 
        $('nav').removeClass('shrinkBack');
        $('nav').addClass('shrink');
        $('#floatingBtn').css('display','block');    

    } 

    else {
        $('nav').addClass('shrinkBack');
        $('nav').removeClass('shrink');
        $('#floatingBtn').css('display','none'); 

    }

    e.preventDefault();
    e.stopPropagation();
})