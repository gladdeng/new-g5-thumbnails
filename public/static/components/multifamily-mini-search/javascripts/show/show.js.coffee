$ ->

  miniSearchConfigs = JSON.parse($('#mf-mini-search-config').html())

  $.ajax
    url: "#{miniSearchConfigs.serviceURL}/api/v0/client_locations?client_id=#{miniSearchConfigs.clientID}"
    dataType: 'json'
    success: (data) =>
      new corpSearchMarkupBuilder(data, miniSearchConfigs) 
      $('.mf-search-go-button.default-submit-button').on('click', -> new searchSubmittal(data, miniSearchConfigs))

  altSearchVals = [ miniSearchConfigs.defaultSearchOption,
                    miniSearchConfigs.alternateSearchOption,
                    miniSearchConfigs.externalSearchURL,
                    miniSearchConfigs.alternateCoreClientID ]

  if altSearchVals.indexOf('') == -1
    new radioButtonBuilder(miniSearchConfigs)
    $.ajax
      url: "#{miniSearchConfigs.serviceURL}/api/v0/client_locations?client_id=#{miniSearchConfigs.alternateCoreClientID}"
      dataType: 'json'
      success: (altData) =>
        altStateSelect = $('.multifamily-mini-search select.mf-search-states.alternate-select')
        altCitySelect  = $('.multifamily-mini-search select.mf-search-cities.alternate-select')
        new optionsBuilder(altData.states, altStateSelect)
        altStateSelect.change -> new citySelectUpdater(altData, altStateSelect, altCitySelect)
        $('.mf-search-go-button.alternate-submit-button').on('click', -> new AlternateSearchSubmittal(altData, miniSearchConfigs))


class radioButtonBuilder
  constructor: (configs) ->
    radioButtons = "<div class='search-type-radio-buttons'>
                      <input type='radio' name='corp-search-type' id='default-search' value='default-search' checked>
                      <label for='default-search'>#{configs.defaultSearchOption}</label>
                      <input type='radio' name='corp-search-type' id='alternate-search' value='alternate-search'>
                      <label for='alternate-search'>#{configs.alternateSearchOption}</label>
                    </div>"

    $(radioButtons).insertAfter($('.multifamily-mini-search h2'))
    new radioButtonListener(configs)

class radioButtonListener
  constructor: (configs) ->
    @setupListener(configs) if configs.alternateSearchButtonText != ""

  setupListener: (configs) ->
    buttons = $(".search-type-radio-buttons input[type='radio']")
    buttons.change( -> changeButtonText(configs) )

  changeButtonText = (configs) ->
    buttonValue = $(".search-type-radio-buttons input[type='radio']:checked").val()

    if buttonValue == 'default-search'
      newButtonText = 'Search'
      $(".alternate-select, .alternate-submit-button").hide()
      $(".default-select, .default-submit-button").show()
    else if buttonValue == 'alternate-search'
      newButtonText = configs.alternateSearchButtonText
      $(".default-select, .default-submit-button").hide()
      $(".alternate-select, .alternate-submit-button").show()
    

# Define city/state selects and set up listener for when state changes
class corpSearchMarkupBuilder
  constructor: (data, configs) ->
    stateSelect = $('.multifamily-mini-search select.mf-search-states.default-select')
    citySelect = $('.multifamily-mini-search select.mf-search-cities.default-select')
    new optionsBuilder(data.states, stateSelect)

    stateSelect.change -> new citySelectUpdater(data, stateSelect, citySelect)

# Listening for a state change to repopulate the city dropdown
class citySelectUpdater 
  constructor: (data, stateSelect, citySelect) ->
    # reset the values in the city select
    citySelect.html("<option value=''>City</option>")
    # get the currently selected state
    selectedState = stateSelect.val()
    # build an array of currently relevant cities
    relevantCities = data.cities.filter((city) -> city.state_id == parseInt(selectedState,10))
    # update the select options 
    new optionsBuilder(relevantCities, citySelect)

# Pass a select element and a list of options to fill it in with 
class optionsBuilder
  constructor: (options, element) ->
    markupHash = []
    for option, index in options
      markupHash.push("<option value='#{option.id}'>#{option.name}</option>")

    element.append(markupHash.join(''))

class searchSubmittal
  constructor: (data, miniSearchConfigs) ->
    selectedState = $('.multifamily-mini-search select.mf-search-states.default-select').val()
    selectedCity = $('.multifamily-mini-search select.mf-search-cities.default-select').val()

    stateObject = data.states.filter((state) -> state.id == parseInt(selectedState,10))
    stateParam = if typeof(stateObject[0]) != "undefined" then "&state=#{stateObject[0].name}" else ""

    cityObject = data.cities.filter((city) -> city.id == parseInt(selectedCity,10))
    cityParam = if typeof(cityObject[0]) != "undefined" then "&city=#{cityObject[0].name}" else ""

    queryString = "?page=1#{stateParam}#{cityParam}"
    
    window.location = "//#{window.location.host}#{miniSearchConfigs.corpSearchPage}#{queryString}"

class AlternateSearchSubmittal
  constructor: (data, miniSearchConfigs) ->
    selectedState = $('.multifamily-mini-search select.mf-search-states.alternate-select').val()
    selectedCity = $('.multifamily-mini-search select.mf-search-cities.alternate-select').val()

    stateObject = data.states.filter((state) -> state.id == parseInt(selectedState,10))
    stateParam = if typeof(stateObject[0]) != "undefined" then "&state=#{stateObject[0].name}" else ""

    cityObject = data.cities.filter((city) -> city.id == parseInt(selectedCity,10))
    cityParam = if typeof(cityObject[0]) != "undefined" then "&city=#{cityObject[0].name}" else ""

    queryString = "?page=1#{stateParam}#{cityParam}"

    window.location = "//#{window.location.host}#{miniSearchConfigs.externalSearchURL}#{queryString}"

    # resultsPageUrl = "#{miniSearchConfigs.externalSearchURL}#{queryString}"
    # newWindow = window.open(resultsPageUrl, '_blank');
    # newWindow.focus();
    