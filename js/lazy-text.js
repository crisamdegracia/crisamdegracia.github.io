//When the scroll top riches the skill set and tools div or 60 height
// the name of the skill set will show up

$(function () {

    $(window).scroll(function (e) {
        var text         = $(".lazy-text-custom"),
            scrollTop       = $(document).scrollTop();


        if(   scrollTop > 60 ){
            text.css('display' , 'block');  
        }
        return;
        console.log('ok');

    });

});

