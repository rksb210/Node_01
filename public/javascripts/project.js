$(document).ready(function(){
    $.getJSON("/movie/fetch_all_states",
    function(data){
        data.data.map((item)=>{
            $('#state').append($('<option>').text(item.statename).val(item.stateid))
        })
    })
    
    $('#state').change(function(){
        $.getJSON("/movie/fetch_all_cities",{stateid:$('#state').val()},
        function(data){
            $('#city').empty()
            $('#city').append($('<option>').text('-Select Cities-'))
            data.data.map((item)=>{
                $('#city').append($('<option>').text(item.cityname).val(item.cityid))
            })
        })
    })
})

