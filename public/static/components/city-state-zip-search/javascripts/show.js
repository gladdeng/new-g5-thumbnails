(function() {
  var PseudoMediaQuery, SearchButtonListener, SearchResultsList, SearchResultsMap, ViewAllLink, ZipSearchAjaxRequest, ZipSearchConfigs;

  $(function() {
    var zipSearchConfigs;
    zipSearchConfigs = new ZipSearchConfigs;
    new PseudoMediaQuery(zipSearchConfigs);
    new SearchButtonListener(zipSearchConfigs);
    return new ZipSearchAjaxRequest(zipSearchConfigs);
  });

  ZipSearchAjaxRequest = (function() {
    function ZipSearchAjaxRequest(zipSearchConfigs) {
      var _this = this;
      if (zipSearchConfigs.searchURL()) {
        $.ajax({
          url: zipSearchConfigs.searchURL(),
          dataType: 'json',
          success: function(data) {
            new SearchResultsList(zipSearchConfigs, data);
            new SearchResultsMap(zipSearchConfigs, data);
            return new ViewAllLink(zipSearchConfigs, data);
          }
        });
      }
    }

    return ZipSearchAjaxRequest;

  })();

  SearchResultsMap = (function() {
    function SearchResultsMap(zipSearchConfigs, data) {
      var mapOptions,
        _this = this;
      this.zipSearchConfigs = zipSearchConfigs;
      this.data = data;
      if (!$('#map-canvas').length) {
        $('.city-state-zip-search').append("<div class='zip-search-map' id='map-canvas'></div>");
      }
      this.mapCanvas = $('.zip-search-map')[0];
      this.bounds = new google.maps.LatLngBounds();
      this.markers = [];
      this.infowindows = [];
      this.currentInfoWindow = null;
      mapOptions = {};
      this.map = new google.maps.Map(this.mapCanvas, mapOptions);
      google.maps.event.addListener(this.map, 'zoom_changed', function() {
        if (_this.map.getZoom() > 17) {
          return _this.map.setZoom(17);
        }
      });
      this.setMarkers(this.data.locations);
      this.map.fitBounds(this.bounds);
    }

    SearchResultsMap.prototype.setMarkers = function(locations) {
      var coordinates, index, infowindow, infowindows, lat, location, long, marker, markers, that, _i, _len, _results;
      markers = [];
      infowindows = [];
      _results = [];
      for (index = _i = 0, _len = locations.length; _i < _len; index = ++_i) {
        location = locations[index];
        lat = location.latitude;
        long = location.longitude;
        coordinates = new google.maps.LatLng(lat, long);
        marker = new google.maps.Marker({
          position: coordinates,
          map: this.map,
          index: index
        });
        markers.push(marker);
        this.bounds.extend(marker.position);
        infowindow = new google.maps.InfoWindow({
          content: this.infoWindowContent(location)
        });
        infowindows.push(infowindow);
        that = this;
        _results.push(google.maps.event.addListener(markers[index], 'click', function() {
          if (that.currentInfoWindow != null) {
            that.currentInfoWindow.close();
          }
          that.currentInfoWindow = infowindows[this.index];
          return infowindows[this.index].open(this.map, markers[this.index]);
        }));
      }
      return _results;
    };

    SearchResultsMap.prototype.infoWindowContent = function(location) {
      return " <div class='location-search-info-window'>        <a href='" + location.domain + "'>          <h2>" + location.name + "</h2>        </a>        <p>          " + location.street_address_1 + "<br />          " + location.city + ", " + location.state + " " + location.postal_code + "        </p>       </div ";
    };

    return SearchResultsMap;

  })();

  SearchResultsList = (function() {
    function SearchResultsList(zipSearchConfigs, data) {
      this.zipSearchConfigs = zipSearchConfigs;
      this.data = data;
      this.populateResults();
      this.getPhoneNumbers();
    }

    SearchResultsList.prototype.populateResults = function() {
      var index, location, markupHash, summaryMessage, _i, _len, _ref;
      markupHash = [];
      if (this.zipSearchConfigs.search === "all") {
        summaryMessage = "Please see our full list of locations below:";
      } else if (this.data.success) {
        summaryMessage = "We have " + this.data.locations.length + " locations near " + (this.zipSearchConfigs.searchArea()) + ":";
      } else {
        summaryMessage = "Sorry, we don't have any locations in that area. Please try a different search, or see our full list of locations below:";
      }
      markupHash.push("<p class='zip-search-summary'>" + summaryMessage + "</p>");
      _ref = this.data.locations;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        location = _ref[index];
        markupHash.push("<div class='zip-search-location'>");
        markupHash.push("<img src='" + location.thumbnail + "' />                        <div class='location-address'>                          <a href='" + location.domain + "'><span class='branded-name'>" + location.name + "<span></a>                          <span class='street'>" + location.street_address_1 + "</span>                          <span class='city'>" + location.city + ", " + location.state + " " + location.postal_code + "</span>                          <span class='phone' value='" + location.urn + "'></span>                        </div>                        <a class='zip-search-location-link' href='" + location.domain + "'>Visit Location</a> ");
        markupHash.push("</div>");
      }
      return $('.city-state-zip-search .zip-search-results').html(markupHash.join(''));
    };

    SearchResultsList.prototype.getPhoneNumbers = function() {
      var ajaxURL,
        _this = this;
      ajaxURL = "" + this.zipSearchConfigs.configs.phoneServiceURL + "/locations.json";
      return $.ajax({
        url: ajaxURL,
        dataType: 'json',
        success: function(data) {
          return _this.populatePhoneNumbers(data);
        }
      });
    };

    SearchResultsList.prototype.populatePhoneNumbers = function(data) {
      var index, location, phoneElement, _i, _len, _results;
      _results = [];
      for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
        location = data[index];
        phoneElement = $(".phone[value='" + location.urn + "']");
        if (phoneElement.length && location.default_number !== "") {
          _results.push(phoneElement.html(location.default_number));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return SearchResultsList;

  })();

  ZipSearchConfigs = (function() {
    function ZipSearchConfigs() {
      this.configs = JSON.parse($('#zip-search-config').html());
      this.search = this.getParameter('search');
      this.serviceURL = this.configs.serviceURL === "" ? "//g5-hub.herokuapp.com" : this.configs.serviceURL;
    }

    ZipSearchConfigs.prototype.getParameter = function(name) {
      var regex, results, value;
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
      results = regex.exec(location.search);
      return value = results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    ZipSearchConfigs.prototype.searchURL = function() {
      var radius, searchURL;
      radius = this.getParameter("radius");
      if (this.search === "") {
        searchURL = null;
      } else {
        searchURL = "" + this.serviceURL + "/clients/" + this.configs.clientURN + "/location_search.json?";
        searchURL += "search=" + this.search;
        if (radius !== "") {
          searchURL += "&radius=" + radius;
        }
      }
      return searchURL;
    };

    ZipSearchConfigs.prototype.searchArea = function() {
      if (this.search) {
        return this.search.toUpperCase();
      } else {
        return "";
      }
    };

    return ZipSearchConfigs;

  })();

  SearchButtonListener = (function() {
    function SearchButtonListener(zipSearchConfigs) {
      var searchButton,
        _this = this;
      searchButton = $('.city-state-zip-search .zip-search-button');
      if (zipSearchConfigs.configs.searchResultsPage === "") {
        searchButton.click(function(event) {
          event.preventDefault();
          return _this.renderResultsInline(zipSearchConfigs);
        });
      } else {
        searchButton.click(function(event) {
          event.preventDefault();
          return _this.bumpToSearchPage(zipSearchConfigs);
        });
      }
    }

    SearchButtonListener.prototype.userInput = function() {
      var search;
      search = $('.zip-search-form input[name=search]').val();
      if (search === "") {
        return "blank";
      } else {
        return search;
      }
    };

    SearchButtonListener.prototype.renderResultsInline = function(zipSearchConfigs) {
      zipSearchConfigs.search = this.userInput();
      return new ZipSearchAjaxRequest(zipSearchConfigs);
    };

    SearchButtonListener.prototype.bumpToSearchPage = function(zipSearchConfigs) {
      var radius, search, searchURL;
      radius = zipSearchConfigs.getParameter("radius");
      search = this.userInput() === "" ? "blank" : this.userInput();
      searchURL = zipSearchConfigs.configs.searchResultsPage;
      searchURL += "?search=" + search;
      return window.location = searchURL;
    };

    return SearchButtonListener;

  })();

  ViewAllLink = (function() {
    function ViewAllLink(zipSearchConfigs, data) {
      var linkMarkup;
      if (data.success) {
        linkMarkup = "<a href='#' class='view-all-link'>View All Locations</a>";
        $('.zip-search-results').append(linkMarkup);
        this.createButtonListener(zipSearchConfigs);
      }
    }

    ViewAllLink.prototype.createButtonListener = function(zipSearchConfigs) {
      var _this = this;
      return $('.view-all-link').click(function(event) {
        event.preventDefault();
        zipSearchConfigs.search = "all";
        return new ZipSearchAjaxRequest(zipSearchConfigs);
      });
    };

    return ViewAllLink;

  })();

  PseudoMediaQuery = (function() {
    function PseudoMediaQuery(zipSearchConfigs) {
      var width,
        _this = this;
      this.zipSearchConfigs = zipSearchConfigs;
      width = this.getWidth();
      this.setClass(width);
      $(window).resize(function() {
        width = _this.getWidth();
        return _this.setClass(width);
      });
    }

    PseudoMediaQuery.prototype.setClass = function(width) {
      var widget;
      widget = $('.city-state-zip-search');
      if (width > 750) {
        widget.removeClass("narrow");
        return widget.addClass("wide");
      } else {
        widget.removeClass("wide");
        return widget.addClass("narrow");
      }
    };

    PseudoMediaQuery.prototype.getWidth = function() {
      return $('.city-state-zip-search').width();
    };

    return PseudoMediaQuery;

  })();

}).call(this);
