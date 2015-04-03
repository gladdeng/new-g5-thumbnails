$ ->
  path = location.pathname
  $('[role=banner] .locations-navigation a[href="' + path + '"]').addClass('active')
