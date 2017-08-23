//NAVBAR FADING EFFECTS

$(function(){
    
$(window).scroll(function(e){

//    var footer  = $('footer'),
//    offset  = footer.offset().top/2 + 100;
 
    if($(document).scrollTop() > 15 ){ 
        $('nav').removeClass('shrinkBack');
        $('nav').addClass('shrink');

    } 

    else {
        $('nav').addClass('shrinkBack');
        $('nav').removeClass('shrink');

    }

    e.preventDefault();
    e.stopPropagation();
})
//        $('#floatingBtn').css('display','block');    
//        $('#floatingBtn').css('display','none'); 
})