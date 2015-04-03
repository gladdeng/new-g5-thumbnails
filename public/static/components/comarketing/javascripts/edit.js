$('input:checkbox').click(function(){
  if (!$(this).is(':checked')){
    if (!confirm('Are you sure?')){
      $(this).prop('checked', true);
    }
  };
});

