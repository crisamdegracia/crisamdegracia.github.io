/* MOBILE AND NON-MOBILE SET-UP */
/**/
/**/
/**/
/**/
/**/


$(document).ready(function (e) {
  var icon = $('.icon'),
    iconOffset = icon.offset().top / 2 - 100,

    //About Container 
    offsetEl = $('#aboutMeText').offset().top / 2 + 100,
    elContent = $('.aboutContent'),
    fa = $('.fa');


  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    iconOffset = icon.offset().top / 2;

    $('#resourcesContent').hide();

    icon.hide();

    $('#aboutMeText').hide();

    $('.fa.profile-social-icon').hide();

    $(document).scroll(function (e) {

      if ($(document).scrollTop() > iconOffset) {

        icon.show();

        $('#resourcesContent').show();

        $('.fa.profile-social-icon').show();

        $('#aboutMeText').show();

        icon.addClass('iconEffect');

        //                e.stopPropagation();
        //                e.preventDefault();
      }

    })
    //        console.log('im in mobile bitch!');
    elContent.removeClass('aboutContent');
    elContent.addClass('mobileAboutContent');


  } else {
    /*hide icon like Heroku Javascript etc*/
    /*Hide About me Text*/
    /*Hide Social  Profile icons Like Github,Twitter, Linkedin*/
    $('#resourcesContent i').hide();
    $('#resourcesContent img').hide();

    icon.hide();

    $('#aboutMeText').hide();

    $('.fa.profile-social-icon').hide();

    $(document).scroll(function (e) {

      /*if the scrolling go further in the icon resources*/
      if ($(document).scrollTop() > iconOffset) {

        icon.show();

        $('#resourcesContent i').show();
        $('#resourcesContent img').show();

        $('.fa.profile-social-icon').show();


        $('#aboutMeText').show();

        icon.addClass('iconEffect');
        //                e.stopPropagation();
        //                e.preventDefault();

      }

      /*if scrolling go further down in About then add Animation*/
      if ($(document).scrollTop() > offsetEl) {

        elContent.addClass('slide-in');
        //                e.stopPropagation();
        //                e.preventDefault();
      }

    })

  }

});
