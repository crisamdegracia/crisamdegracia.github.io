$(document).ready(function(e){
    var readMoreText     = $('#readMoreText');


        readMoreText.hide();
    $('#readMoreBtn').click(function(e){
        $(readMoreText).show();
        $(this).siblings(readMoreText).show();
        $(this).hide();
        $(this).parent().find('.readLessBtn').show();
        e.stopPropagation();
        e.preventDefault();
    })


    $('#readLessBtn').click(function(e){
        readMoreText.hide();
        $(this).hide();
        $('#readMoreBtn').show();
        e.stopPropagation();
        e.preventDefault();

    })
})