(function() {
  var NAVIGATION;

  NAVIGATION = {
    corporateMenu: $("#drop-target-nav .corporate-navigation"),
    locationMenu: $("#drop-target-nav .navigation"),
    path: location.pathname.match(/([^\/]*)\/*$/)[1],
    setActiveMenu: function(menu) {
      menu.find("a[href$=\"/" + this.path + "\"]").addClass("active");
    },
    setMenuHeight: function(menu) {
      menu.css({
        maxHeight: $(window).height() - $("header[role=banner] .collapsable-btn").outerHeight(true) + "px"
      });
    },
    setupMenu: function(menu) {
      this.setActiveMenu(menu);
      this.setMenuHeight(menu);
      if (menu.find(".has-subnav").length > 0) {
        this.setupSubNav(menu);
      }
    },
    setupSubNav: function(menu) {
      menu.find(".has-subnav > a").on("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        NAVIGATION.closeSubNav(NAVIGATION.corporateMenu.find(".subnav").not($(this).next()));
        NAVIGATION.closeSubNav(NAVIGATION.locationMenu.find(".subnav").not($(this).next()));
        NAVIGATION.toggleSubNav($(this).next());
      });
    },
    closeSubNav: function(subnav) {
      subnav.removeClass("show-subnav");
      subnav.parent().removeClass("subnav-open");
    },
    toggleSubNav: function(subnav) {
      subnav.toggleClass("show-subnav");
      subnav.parent().toggleClass("subnav-open");
    },
    resetSubNav: function() {
      NAVIGATION.closeSubNav(this.corporateMenu.find(".subnav"));
      NAVIGATION.closeSubNav(this.locationMenu.find(".subnav"));
    }
  };

  $(function() {
    if (NAVIGATION.corporateMenu.length > 0) {
      NAVIGATION.setupMenu(NAVIGATION.corporateMenu);
    }
    if (NAVIGATION.locationMenu.length > 0) {
      NAVIGATION.setupMenu(NAVIGATION.locationMenu);
    }
    if ($(".has-subnav").length > 0) {
      $("body").on("click", function(e) {
        NAVIGATION.resetSubNav();
      });
    }
    $(window).smartresize(function() {
      if (NAVIGATION.corporateMenu.length > 0) {
        NAVIGATION.setMenuHeight(NAVIGATION.corporateMenu);
      }
      if (NAVIGATION.locationMenu.length > 0) {
        NAVIGATION.setMenuHeight(NAVIGATION.locationMenu);
      }
    });
  });

  return;

}).call(this);
