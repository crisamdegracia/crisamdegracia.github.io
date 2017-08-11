$(document).ready(function(){


        var progress_circle = $(".my-progress-bar").gmpc({
        // color
        color: "#000000",
            
        // height
        height: "300px",

        // width
        width: "300px",

        // line width
        line_width: 8,

        // stating value
        starting_position: 25,

        // max value
        percent: 100,

        // false = counterclockwise
        counter_clockwise: false,

        // show value
        percentage: true,

        // custom counter text
        text: ''

    }).gmpc('animate', 80, 3000)


})

