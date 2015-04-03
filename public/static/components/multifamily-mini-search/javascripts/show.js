(function() {
  var AlternateSearchSubmittal, citySelectUpdater, corpSearchMarkupBuilder, optionsBuilder, radioButtonBuilder, radioButtonListener, searchSubmittal;

  $(function() {
    var altSearchVals, miniSearchConfigs,
      _this = this;
    miniSearchConfigs = JSON.parse($('#mf-mini-search-config').html());
    $.ajax({
      url: "" + miniSearchConfigs.serviceURL + "/api/v0/client_locations?client_id=" + miniSearchConfigs.clientID,
      dataType: 'json',
      success: function(data) {
        new corpSearchMarkupBuilder(data, miniSearchConfigs);
        return $('.mf-search-go-button.default-submit-button').on('click', function() {
          return new searchSubmittal(data, miniSearchConfigs);
        });
      }
    });
    altSearchVals = [miniSearchConfigs.defaultSearchOption, miniSearchConfigs.alternateSearchOption, miniSearchConfigs.externalSearchURL, miniSearchConfigs.alternateCoreClientID];
    if (altSearchVals.indexOf('') === -1) {
      new radioButtonBuilder(miniSearchConfigs);
      return $.ajax({
        url: "" + miniSearchConfigs.serviceURL + "/api/v0/client_locations?client_id=" + miniSearchConfigs.alternateCoreClientID,
        dataType: 'json',
        success: function(altData) {
          var altCitySelect, altStateSelect;
          altStateSelect = $('.multifamily-mini-search select.mf-search-states.alternate-select');
          altCitySelect = $('.multifamily-mini-search select.mf-search-cities.alternate-select');
          new optionsBuilder(altData.states, altStateSelect);
          altStateSelect.change(function() {
            return new citySelectUpdater(altData, altStateSelect, altCitySelect);
          });
          return $('.mf-search-go-button.alternate-submit-button').on('click', function() {
            return new AlternateSearchSubmittal(altData, miniSearchConfigs);
          });
        }
      });
    }
  });

  radioButtonBuilder = (function() {
    function radioButtonBuilder(configs) {
      var radioButtons;
      radioButtons = "<div class='search-type-radio-buttons'>                      <input type='radio' name='corp-search-type' id='default-search' value='default-search' checked>                      <label for='default-search'>" + configs.defaultSearchOption + "</label>                      <input type='radio' name='corp-search-type' id='alternate-search' value='alternate-search'>                      <label for='alternate-search'>" + configs.alternateSearchOption + "</label>                    </div>";
      $(radioButtons).insertAfter($('.multifamily-mini-search h2'));
      new radioButtonListener(configs);
    }

    return radioButtonBuilder;

  })();

  radioButtonListener = (function() {
    var changeButtonText;

    function radioButtonListener(configs) {
      if (configs.alternateSearchButtonText !== "") {
        this.setupListener(configs);
      }
    }

    radioButtonListener.prototype.setupListener = function(configs) {
      var buttons;
      buttons = $(".search-type-radio-buttons input[type='radio']");
      return buttons.change(function() {
        return changeButtonText(configs);
      });
    };

    changeButtonText = function(configs) {
      var buttonValue, newButtonText;
      buttonValue = $(".search-type-radio-buttons input[type='radio']:checked").val();
      if (buttonValue === 'default-search') {
        newButtonText = 'Search';
        $(".alternate-select, .alternate-submit-button").hide();
        return $(".default-select, .default-submit-button").show();
      } else if (buttonValue === 'alternate-search') {
        newButtonText = configs.alternateSearchButtonText;
        $(".default-select, .default-submit-button").hide();
        return $(".alternate-select, .alternate-submit-button").show();
      }
    };

    return radioButtonListener;

  })();

  corpSearchMarkupBuilder = (function() {
    function corpSearchMarkupBuilder(data, configs) {
      var citySelect, stateSelect;
      stateSelect = $('.multifamily-mini-search select.mf-search-states.default-select');
      citySelect = $('.multifamily-mini-search select.mf-search-cities.default-select');
      new optionsBuilder(data.states, stateSelect);
      stateSelect.change(function() {
        return new citySelectUpdater(data, stateSelect, citySelect);
      });
    }

    return corpSearchMarkupBuilder;

  })();

  citySelectUpdater = (function() {
    function citySelectUpdater(data, stateSelect, citySelect) {
      var relevantCities, selectedState;
      citySelect.html("<option value=''>City</option>");
      selectedState = stateSelect.val();
      relevantCities = data.cities.filter(function(city) {
        return city.state_id === parseInt(selectedState, 10);
      });
      new optionsBuilder(relevantCities, citySelect);
    }

    return citySelectUpdater;

  })();

  optionsBuilder = (function() {
    function optionsBuilder(options, element) {
      var index, markupHash, option, _i, _len;
      markupHash = [];
      for (index = _i = 0, _len = options.length; _i < _len; index = ++_i) {
        option = options[index];
        markupHash.push("<option value='" + option.id + "'>" + option.name + "</option>");
      }
      element.append(markupHash.join(''));
    }

    return optionsBuilder;

  })();

  searchSubmittal = (function() {
    function searchSubmittal(data, miniSearchConfigs) {
      var cityObject, cityParam, queryString, selectedCity, selectedState, stateObject, stateParam;
      selectedState = $('.multifamily-mini-search select.mf-search-states.default-select').val();
      selectedCity = $('.multifamily-mini-search select.mf-search-cities.default-select').val();
      stateObject = data.states.filter(function(state) {
        return state.id === parseInt(selectedState, 10);
      });
      stateParam = typeof stateObject[0] !== "undefined" ? "&state=" + stateObject[0].name : "";
      cityObject = data.cities.filter(function(city) {
        return city.id === parseInt(selectedCity, 10);
      });
      cityParam = typeof cityObject[0] !== "undefined" ? "&city=" + cityObject[0].name : "";
      queryString = "?page=1" + stateParam + cityParam;
      window.location = "//" + window.location.host + miniSearchConfigs.corpSearchPage + queryString;
    }

    return searchSubmittal;

  })();

  AlternateSearchSubmittal = (function() {
    function AlternateSearchSubmittal(data, miniSearchConfigs) {
      var cityObject, cityParam, queryString, selectedCity, selectedState, stateObject, stateParam;
      selectedState = $('.multifamily-mini-search select.mf-search-states.alternate-select').val();
      selectedCity = $('.multifamily-mini-search select.mf-search-cities.alternate-select').val();
      stateObject = data.states.filter(function(state) {
        return state.id === parseInt(selectedState, 10);
      });
      stateParam = typeof stateObject[0] !== "undefined" ? "&state=" + stateObject[0].name : "";
      cityObject = data.cities.filter(function(city) {
        return city.id === parseInt(selectedCity, 10);
      });
      cityParam = typeof cityObject[0] !== "undefined" ? "&city=" + cityObject[0].name : "";
      queryString = "?page=1" + stateParam + cityParam;
      window.location = "//" + window.location.host + miniSearchConfigs.externalSearchURL + queryString;
    }

    return AlternateSearchSubmittal;

  })();

}).call(this);
