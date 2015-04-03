  NAVIGATION =
    corporateMenu: $("#drop-target-nav .corporate-navigation")
    locationMenu: $("#drop-target-nav .navigation")
    path: location.pathname.match(/([^\/]*)\/*$/)[1]
    setActiveMenu: (menu) ->
      menu.find("a[href$=\"/" + @path + "\"]").addClass "active"
      return

    setMenuHeight: (menu) ->
      menu.css maxHeight: $(window).height() - $("header[role=banner] .collapsable-btn").outerHeight(true) + "px"
      return

    setupMenu: (menu) ->
      @setActiveMenu menu
      @setMenuHeight menu
      @setupSubNav menu  if menu.find(".has-subnav").length > 0
      return

    setupSubNav: (menu) ->
      menu.find(".has-subnav > a").on "click", (e) ->
        e.preventDefault()
        e.stopPropagation()
        NAVIGATION.closeSubNav NAVIGATION.corporateMenu.find(".subnav").not($(this).next())
        NAVIGATION.closeSubNav NAVIGATION.locationMenu.find(".subnav").not($(this).next())
        NAVIGATION.toggleSubNav $(this).next()
        return

      return

    closeSubNav: (subnav) ->
      subnav.removeClass "show-subnav"
      subnav.parent().removeClass "subnav-open"
      return

    toggleSubNav: (subnav) ->
      subnav.toggleClass "show-subnav"
      subnav.parent().toggleClass "subnav-open"
      return

    resetSubNav: ->
      NAVIGATION.closeSubNav @corporateMenu.find(".subnav")
      NAVIGATION.closeSubNav @locationMenu.find(".subnav")
      return

  $ ->
    NAVIGATION.setupMenu NAVIGATION.corporateMenu  if NAVIGATION.corporateMenu.length > 0
    NAVIGATION.setupMenu NAVIGATION.locationMenu  if NAVIGATION.locationMenu.length > 0
    if $(".has-subnav").length > 0
      $("body").on "click", (e) ->
        NAVIGATION.resetSubNav()
        return

    $(window).smartresize ->
      NAVIGATION.setMenuHeight NAVIGATION.corporateMenu  if NAVIGATION.corporateMenu.length > 0
      NAVIGATION.setMenuHeight NAVIGATION.locationMenu  if NAVIGATION.locationMenu.length > 0
      return

    return

  return
