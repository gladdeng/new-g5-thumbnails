(function() {
  var appendFloorplans, pricingAndAvailability, resetPricingHeight, setPricingHeight, setupFilters;

  pricingAndAvailability = (function() {
    function pricingAndAvailability(pricingOptions) {
      var cpas_urn, heroku_app_name_max_length, location_urn;
      heroku_app_name_max_length = 30;
      cpas_urn = pricingOptions["clientUrn"].replace(/-c-/, "-cpas-");
      cpas_urn = cpas_urn.substring(0, heroku_app_name_max_length);
      location_urn = pricingOptions["locationUrn"];
      if (cpas_urn && location_urn) {
        this.getPricing(cpas_urn, location_urn);
      }
    }

    pricingAndAvailability.prototype.getPricing = function(cpas_urn, location_urn) {
      var floorplanContainer, loader, pricingURL;
      pricingURL = "https://" + cpas_urn + ".herokuapp.com/locations/" + location_urn + '/widget';
      floorplanContainer = $('.floorplans');
      loader = '<div id="loading-floorplans"><div class="loader">Loading&hellip;</div>Loading Pricing &amp; Availibility Information&hellip;</div>';
      return $.ajax({
        type: "GET",
        url: pricingURL
      }).done(function(data) {
        appendFloorplans(data, floorplanContainer, loader);
        return setupFilters();
      });
    };

    return pricingAndAvailability;

  })();

  appendFloorplans = function(data, floorplanContainer, loader) {
    var $data, floorplanList, images, loadCounter;
    floorplanContainer.hide();
    $("[role=main]").append(loader);
    $data = $(data);
    floorplanList = $data.find(".e-content");
    floorplanContainer.append(floorplanList).fadeIn();
    $("#loading-floorplans").fadeOut().remove();
    images = floorplanContainer.find('img');
    loadCounter = 0;
    return $.each(images, function(i, item) {
      return $(item).load(function() {
        loadCounter++;
        if (loadCounter === images.length) {
          return setPricingHeight(floorplanContainer);
        }
      });
    });
  };

  setPricingHeight = function(floorplanContainer) {
    var floorplansHeight;
    floorplansHeight = floorplanContainer.outerHeight();
    return floorplanContainer.css('height', floorplansHeight);
  };

  resetPricingHeight = function(floorplanContainer) {
    floorplanContainer.css('height', 'auto');
    return setPricingHeight(floorplanContainer);
  };

  setupFilters = function() {
    var floorplans;
    floorplans = $(".floorplan");
    $('.filters input[type=radio]').each(function() {
      var klass;
      klass = $(this).attr('id');
      if (!(floorplans.hasClass(klass) || klass.match(/^\w+-all/))) {
        return $(this).prop("disabled", true).next().addClass('disabled');
      }
    });
    return $(".filters input").on("change", function(e) {
      var bathFilter, bathSelector, bedFilter, bedSelector;
      bedFilter = $("#beds-filter input:checked").val();
      bathFilter = $("#baths-filter input:checked").val();
      bedSelector = "";
      bathSelector = "";
      if (bedFilter === "beds-all" && bathFilter === "baths-all") {
        return floorplans.fadeIn();
      } else {
        if (bedFilter !== "beds-all") {
          bedSelector = "." + bedFilter;
        }
        if (bathFilter !== "baths-all") {
          bathSelector = "." + bathFilter;
        }
        floorplans.fadeOut();
        return $(bedSelector + bathSelector).fadeIn("fast");
      }
    });
  };

  $(function() {
    var floorplanContainer, pricingOptions;
    pricingOptions = JSON.parse($('.floorplans .config:first').html());
    new pricingAndAvailability(pricingOptions);
    $(".floorplans .floorplan-btn").fancybox();
    floorplanContainer = $('.floorplans');
    return $(window).smartresize(function() {
      return resetPricingHeight(floorplanContainer);
    });
  });

}).call(this);
