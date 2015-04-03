(function() {
  var getGridSize, getLargestImage, initializeFlexSlider, resetFlexslider, resetMiniFlexslider, setImageHeight, setMiniNavHeight, setupFlexslider;

  getGridSize = function() {
    var windowWidth;
    windowWidth = window.innerWidth;
    if (windowWidth < 641) {
      return 1;
    } else if (windowWidth >= 641 && windowWidth < 910) {
      return 2;
    } else {
      return 3;
    }
  };

  initializeFlexSlider = function(galleryOptions, gallery) {
    var navHeight, showThumbs;
    showThumbs = (galleryOptions['show_thumbnails'] === "yes" ? "thumbnails" : true);
    if (galleryOptions['carousel'] === 'yes') {
      gallery.find('.gallery-carousel').flexslider({
        animation: 'slide',
        animationLoop: true,
        itemWidth: 350,
        itemMargin: 15,
        minItems: getGridSize(),
        maxItems: getGridSize()
      });
    } else {
      gallery.find('.gallery-slideshow').flexslider({
        animation: 'fade',
        useCSS: true,
        touch: true,
        directionNav: true,
        controlNav: showThumbs
      });
    }
    if (galleryOptions['mini_gallery'] === 'no') {
      navHeight = gallery.find('.flex-control-nav').outerHeight(true);
      gallery.find('.flex-control-nav').css('bottom', -navHeight);
      return gallery.find('.flexslider').css('margin-bottom', -navHeight);
    }
  };

  getLargestImage = function(gallery) {
    var imageHeight, imageWidth, images, size, slides;
    slides = gallery.find('.slides li');
    images = gallery.find('.slides img');
    slides.addClass('loading');
    images.css('max-height', 'none');
    imageHeight = 0;
    imageWidth = 0;
    size = [];
    images.each(function() {
      var curHeight;
      curHeight = null;
      curHeight = $(this).height();
      if (curHeight > imageHeight) {
        imageHeight = curHeight;
        return imageWidth = $(this).width();
      }
    });
    slides.removeClass('loading');
    size['height'] = imageHeight;
    size['width'] = imageWidth;
    return size;
  };

  setImageHeight = function(imageHeight, gallery, carousel) {
    var fixedHeight, galleryType, navHeight, padding, windowHeight;
    galleryType = (carousel === "yes" ? "carousel" : "slideshow");
    windowHeight = $(window).height();
    navHeight = gallery.find('.flex-control-nav').outerHeight(true);
    fixedHeight = null;
    padding = 10;
    if (windowHeight <= imageHeight + navHeight) {
      fixedHeight = windowHeight - navHeight - padding;
      if (fixedHeight < 320) {
        fixedHeight = imageHeight - padding;
      }
    } else {
      fixedHeight = imageHeight - padding;
    }
    if (galleryType !== 'carousel') {
      gallery.find('.slides img').css('max-height', fixedHeight);
      gallery.find('.slides li').css('height', fixedHeight);
    }
    gallery.find('.flex-control-nav').css('bottom', -navHeight);
    return gallery.find('.flexslider').css('margin-bottom', navHeight);
  };

  setMiniNavHeight = function(imageHeight, gallery) {
    return gallery.find('.flex-direction-nav a').height(imageHeight);
  };

  setupFlexslider = function(galleryOptions, gallery) {
    var imageHeight, size;
    size = getLargestImage(gallery);
    imageHeight = size['height'];
    initializeFlexSlider(galleryOptions, gallery);
    if (galleryOptions['mini_gallery'] === 'yes') {
      return setMiniNavHeight(imageHeight, gallery);
    } else {
      return setImageHeight(imageHeight, gallery, galleryOptions['carousel']);
    }
  };

  resetFlexslider = function(galleryOptions, gallery) {
    var gridSize, imageHeight, size;
    size = getLargestImage(gallery);
    imageHeight = size['height'];
    setImageHeight(imageHeight, gallery);
    if (galleryOptions['carousel'] === 'yes') {
      gridSize = getGridSize();
      flexslider.vars.minItems = gridSize;
      return flexslider.vars.maxItems = gridSize;
    }
  };

  resetMiniFlexslider = function(gallery) {
    var imageHeight, size;
    size = getLargestImage(gallery);
    imageHeight = size['height'];
    return setMiniNavHeight(imageHeight, gallery);
  };

  $(function() {
    var galleries;
    galleries = $('.gallery');
    return galleries.each(function() {
      var gallery, galleryOptions;
      gallery = $(this);
      galleryOptions = JSON.parse(gallery.find('.config:first').html());
      setupFlexslider(galleryOptions, gallery);
      if (galleryOptions['mini_gallery'] === 'yes') {
        return $(window).smartresize(function() {
          return resetMiniFlexslider(gallery);
        });
      } else {
        return $(window).smartresize(function() {
          return resetFlexslider(galleryOptions, gallery);
        });
      }
    });
  });

}).call(this);
