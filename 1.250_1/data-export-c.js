

$('body').on('click', '#result-table tr', (e)=> {
    e.preventDefault();
    $('#result-table tr').removeClass('active');
    $(e.currentTarget).addClass('active');
})