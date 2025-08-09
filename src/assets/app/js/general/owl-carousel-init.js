var owl  = null;

var CarrouselRendering = {



    init_graphfilter: function() {
        
        owl = $("#owl-carousel-terms");
        owl.owlCarousel({
            rtl:false,
            dots:false,
            loop:false,
            autoWidth:true,
            margin:10,
            nav:false,
            responsive:{
                0:{
                    items:1
                },
                400:{
                    items:5
                },
                600:{
                    items:5
                },
                1000:{
                    items:7
                },
                1600:{
                    items:10
                }
            }
        })

    },
    reInit_graphfilter: function() {
       $('#owl-carousel-terms').trigger('destroy.owl.carousel');
    },



    mobile_graphfilter: function() {
  
        owl.data('owl.carousel').options.dots = false;
        owl.data('owl.carousel').options.nav = true;

        owl.owlCarousel('refresh');

    },
    desktop_graphfilter: function() {
        
        owl.data('owl.carousel').options.dots = true;
        owl.data('owl.carousel').options.nav = false;

        owl.owlCarousel('refresh');

        
    }





};
