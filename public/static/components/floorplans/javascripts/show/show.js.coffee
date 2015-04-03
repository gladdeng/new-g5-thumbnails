class pricingAndAvailability
  constructor: (pricingOptions) ->

    # Set up pricing service and location URNs
    heroku_app_name_max_length = 30
    cpas_urn = pricingOptions["clientUrn"].replace(/-c-/, "-cpas-")
    cpas_urn = cpas_urn.substring(0, heroku_app_name_max_length)
    location_urn = pricingOptions["locationUrn"]

    # If pricing URN and location URN exists, get the data
    if cpas_urn && location_urn
      @getPricing(cpas_urn, location_urn)

  getPricing: (cpas_urn, location_urn) ->
    pricingURL = "https://" + cpas_urn + ".herokuapp.com/locations/" + location_urn + '/widget'
    floorplanContainer = $('.floorplans')
    loader = '<div id="loading-floorplans"><div class="loader">Loading&hellip;</div>Loading Pricing &amp; Availibility Information&hellip;</div>'

    $.ajax
      type: "GET"
      url: pricingURL

    .done (data)->
      appendFloorplans(data, floorplanContainer, loader)
      setupFilters()

appendFloorplans = (data, floorplanContainer, loader) ->
  # Hide container and add loading div
  floorplanContainer.hide()
  $("[role=main]").append loader

  # Add data from pricing service to the page
  $data = $(data)
  floorplanList = $data.find(".e-content")
  floorplanContainer.append(floorplanList).fadeIn()

  # Remove loading div
  $("#loading-floorplans").fadeOut().remove()

  # When floorplan images are loaded, Fix the height of the widget
  images = floorplanContainer.find('img')
  loadCounter = 0
  $.each images, (i, item)->
    $(item).load ->
      loadCounter++
      if loadCounter == images.length
        setPricingHeight(floorplanContainer)

setPricingHeight = (floorplanContainer) ->
  # Sets height of floorplan container so browser doesn't jump when filtering
  floorplansHeight = floorplanContainer.outerHeight()
  floorplanContainer.css('height', floorplansHeight)

resetPricingHeight = (floorplanContainer) ->
  floorplanContainer.css('height', 'auto')
  setPricingHeight(floorplanContainer)

setupFilters = ->
  floorplans = $(".floorplan")

  # Disables filters that are not needed
  $('.filters input[type=radio]').each ->
    klass = $(this).attr 'id'
    unless floorplans.hasClass(klass) or klass.match(/^\w+-all/)
      $(this).prop("disabled", true).next().addClass 'disabled'

  # Filtering script
  $(".filters input").on "change", (e) ->

    # Set up filter and item variables
    bedFilter = $("#beds-filter input:checked").val()
    bathFilter = $("#baths-filter input:checked").val()
    bedSelector = ""
    bathSelector = ""

    # If All is selected, show everything
    if bedFilter is "beds-all" and bathFilter is "baths-all"
      floorplans.fadeIn()
    else
      bedSelector = "." + bedFilter  if bedFilter isnt "beds-all"
      bathSelector = "." + bathFilter  if bathFilter isnt "baths-all"
      floorplans.fadeOut()
      $(bedSelector + bathSelector).fadeIn "fast"

$ ->
  pricingOptions = JSON.parse($('.floorplans .config:first').html())
  new pricingAndAvailability(pricingOptions)

  $(".floorplans .floorplan-btn").fancybox()

  floorplanContainer = $('.floorplans')

  $(window).smartresize ->
    resetPricingHeight(floorplanContainer)
