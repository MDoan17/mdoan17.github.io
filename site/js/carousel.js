var isCycling = true;

$(document).ready(function() {
    $(".carousel-inner").click(function() {
        $("#headerCarousel").carousel((isCycling ? "pause" : "cycle"));
        isCycling = !isCycling;
    });
});
