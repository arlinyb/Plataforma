var DatatablesAdvancedColumnRendering = {
    init: function() {
        $("#m_table_1").DataTable({
            responsive: !0,
            //paging: !0,
            
            lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
            paging:         false,
            ordering: false,
            searching: false,
            info: false,   
          
        })
    }
};
