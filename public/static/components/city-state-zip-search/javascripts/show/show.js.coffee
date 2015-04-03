$ ->
  # Grab settings from index.html
  zipSearchConfigs = new ZipSearchConfigs
  # Classes for different container widths
  new PseudoMediaQuery(zipSearchConfigs)
  # Set up listener for Search Button
  new SearchButtonListener(zipSearchConfigs)
  # Get search results from g5-hub
  new ZipSearchAjaxRequest(zipSearchConfigs)
  
class ZipSearchAjaxRequest
  constructor: (zipSearchConfigs) ->
    if zipSearchConfigs.searchURL()
      $.ajax
        url: zipSearchConfigs.searchURL()
        dataType: 'json'
        success: (data) =>
          new SearchResultsList(zipSearchConfigs, data)
          new SearchResultsMap(zipSearchConfigs, data)
          new ViewAllLink(zipSearchConfigs, data)

class SearchResultsMap
  constructor: (@zipSearchConfigs, @data) ->
    unless $('#map-canvas').length
      $('.city-state-zip-search').append("<div class='zip-search-map' id='map-canvas'></div>")

    @mapCanvas = $('.zip-search-map')[0]
    @bounds = new google.maps.LatLngBounds()
    @markers = []
    @infowindows = []
    @currentInfoWindow = null
    
    mapOptions = {}

    @map = new google.maps.Map(@mapCanvas, mapOptions)

    google.maps.event.addListener(@map, 'zoom_changed', =>
      @map.setZoom(17) if @map.getZoom() > 17
    )

    @setMarkers(@data.locations)

    @map.fitBounds(@bounds)


  setMarkers: (locations) ->
    markers=[]
    infowindows=[]

    for location, index in locations
      lat = location.latitude
      long = location.longitude

      # Markers
      coordinates = new google.maps.LatLng(lat,long)
      marker = new google.maps.Marker({
        position: coordinates
        map: @map
        index: index
      })
      markers.push(marker)
      @bounds.extend(marker.position)

      # Info Windows
      infowindow = new google.maps.InfoWindow({ content: @infoWindowContent(location) })
      infowindows.push(infowindow)

      # Event listener needs access to both versions of this
      that = this
      google.maps.event.addListener(markers[index],'click', ->
        that.currentInfoWindow.close() if that.currentInfoWindow?
        that.currentInfoWindow = infowindows[this.index]
        infowindows[this.index].open(@map, markers[this.index])
      )

  infoWindowContent: (location) ->
    " <div class='location-search-info-window'>
        <a href='#{location.domain}'>
          <h2>#{location.name}</h2>
        </a>
        <p>
          #{location.street_address_1}<br />
          #{location.city}, #{location.state} #{location.postal_code}
        </p> 
      </div "

class SearchResultsList
  constructor: (@zipSearchConfigs, @data) ->
    @populateResults()
    @getPhoneNumbers()

  populateResults: () ->
    markupHash = []

    if @zipSearchConfigs.search == "all"
      summaryMessage =  "Please see our full list of locations below:"
    else if @data.success
      summaryMessage = "We have #{@data.locations.length} locations near #{ @zipSearchConfigs.searchArea() }:"
    else
      summaryMessage = "Sorry, we don't have any locations in that area. Please try a different search, or see our full list of locations below:"

    markupHash.push("<p class='zip-search-summary'>#{summaryMessage}</p>")

    for location, index in @data.locations
      markupHash.push("<div class='zip-search-location'>")
      markupHash.push( "<img src='#{location.thumbnail}' />
                        <div class='location-address'>
                          <a href='#{location.domain}'><span class='branded-name'>#{location.name}<span></a>
                          <span class='street'>#{location.street_address_1}</span>
                          <span class='city'>#{location.city}, #{location.state} #{location.postal_code}</span>
                          <span class='phone' value='#{location.urn}'></span>
                        </div>
                        <a class='zip-search-location-link' href='#{location.domain}'>Visit Location</a> ")
      markupHash.push("</div>")

    $('.city-state-zip-search .zip-search-results').html(markupHash.join(''))

  getPhoneNumbers: () ->
    ajaxURL = "#{@zipSearchConfigs.configs.phoneServiceURL}/locations.json"
    $.ajax
      url: ajaxURL
      dataType: 'json'
      success: (data) =>
        @populatePhoneNumbers(data)

  populatePhoneNumbers: (data) ->
    for location, index in data
      phoneElement = $(".phone[value='#{location.urn}']")

      if phoneElement.length && location.default_number != ""
        phoneElement.html(location.default_number)
  

class ZipSearchConfigs
  constructor: () ->
    @configs = JSON.parse($('#zip-search-config').html())
    @search = @getParameter('search')
    @serviceURL = if @configs.serviceURL == "" then "//g5-hub.herokuapp.com" else @configs.serviceURL

  getParameter: (name) ->
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
    regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
    results = regex.exec(location.search)
    value = if results == null then "" else decodeURIComponent(results[1].replace(/\+/g, " "))

  searchURL: () ->
    radius = @getParameter("radius")

    if @search == ""
      searchURL = null
    else
      searchURL = "#{@serviceURL}/clients/#{@configs.clientURN}/location_search.json?"
      searchURL += "search=#{@search}"
      searchURL += "&radius=#{radius}" if radius != ""
    
    searchURL

  searchArea: () ->
    if @search
      @search.toUpperCase()
    else
      ""

class SearchButtonListener
  constructor: (zipSearchConfigs) ->
    searchButton = $('.city-state-zip-search .zip-search-button')

    if zipSearchConfigs.configs.searchResultsPage == ""
      # No searchResultsPage means we stay here on submit
      searchButton.click( (event) =>
        event.preventDefault() 
        @renderResultsInline(zipSearchConfigs) )
    else
      # If searchResultsPage is populated, submit to that page
      searchButton.click( (event) =>
        event.preventDefault() 
        @bumpToSearchPage(zipSearchConfigs) )

  userInput: () ->
    search = $('.zip-search-form input[name=search]').val()
    if search == ""
      "blank"
    else
      search
      
  renderResultsInline: (zipSearchConfigs) ->
    zipSearchConfigs.search = @userInput()
    new ZipSearchAjaxRequest(zipSearchConfigs)

  bumpToSearchPage: (zipSearchConfigs) ->
    radius = zipSearchConfigs.getParameter("radius")
    search = if @userInput() == "" then "blank" else @userInput()
    searchURL = zipSearchConfigs.configs.searchResultsPage
    searchURL += "?search=#{search}"
    window.location = searchURL

class ViewAllLink
  constructor: (zipSearchConfigs, data) ->
    if data.success
      linkMarkup = "<a href='#' class='view-all-link'>View All Locations</a>"
      $('.zip-search-results').append(linkMarkup)

      @createButtonListener(zipSearchConfigs)

  createButtonListener: (zipSearchConfigs) ->
    $('.view-all-link').click( (event) =>
      event.preventDefault() 
      zipSearchConfigs.search = "all"
      new ZipSearchAjaxRequest(zipSearchConfigs) )

class PseudoMediaQuery
  constructor: (@zipSearchConfigs) ->
    width = @getWidth()
    @setClass(width)

    $( window ).resize () =>
      width = @getWidth()
      @setClass(width)
      
  setClass: (width) ->
    widget = $('.city-state-zip-search')

    if width > 750 
      widget.removeClass("narrow")
      widget.addClass("wide")
    else
      widget.removeClass("wide")
      widget.addClass("narrow")

  getWidth: () ->
    $('.city-state-zip-search').width()


