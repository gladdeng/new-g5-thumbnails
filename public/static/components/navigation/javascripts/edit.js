$('input.display-navigation').click(function(){
  if (!$(this).is(':checked')){
    if (!confirm('Are you sure?')){
      $(this).prop('checked', true);
    }
  };
});

