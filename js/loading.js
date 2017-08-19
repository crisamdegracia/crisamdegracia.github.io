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
        home          = document.getElementById('home');

    window.addEventListener('load', function(){
        overlay.style.display = 'none'; 
        homeMain.style.display = 'block'; 
        home.style.display = 'block'; 
        project.style.display = 'block'; 
        about.style.display = 'block'; 
        resources.style.display = 'block'; 

    })

})();


