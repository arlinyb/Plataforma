
var DatatablesAdvancedColumnRendering = {
    
    init: function() {
        var table= $("#m_table_home_sources").DataTable({
            responsive: !0,
            paging:  false,
            ordering: false,
            searching: false,
            info:false,
            destroy: true,
         
        })

    
    },

    clear:function(){
            
        $('#m_table_home_sources').DataTable().clear().destroy();
    }
};
