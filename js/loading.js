//home,
//#homeMain,
//#project,
//#about,
//#resources
(function(){


    var overlay       = document.getElementById('overlay'),
        homeMain      = document.getElementById('homeMain'),
        project       = document.getElementById('project'),
        about         = document.getElementById('about'),
        resources     = document.getElementById('resources'),
        home          = document.getElementById('home'),
        particlesJS   = document.getElementById('particles-js');

    window.addEventListener('load', function(e){
        overlay.style.display = 'none'; 
        homeMain.style.display = 'block'; 
        home.style.display = 'block'; 
        project.style.display = 'block'; 
        about.style.display = 'block'; 
        resources.style.display = 'block'; 
        particlesJS.style.visibility = 'visible'; 
        e.stopPropagation();
        e.preventDefault();
    })

})();


