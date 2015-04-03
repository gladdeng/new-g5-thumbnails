(function() {
  window.googleMaps = {};
  widgetAreaConfig = JSON.parse($('.comarketing .config:first').html());

  window.getComarketingCoords = function() {
    setMap();
    window.googleMaps.latlngbounds = new google.maps.LatLngBounds();

    for (var i=0; i < widgetAreaConfig.addresses.length; i++){
      setMapMarker(widgetAreaConfig.addresses[i], i, widgetAreaConfig.addresses.length);
    }
  };

  setMapMarker = function(address, i, count){
    $.getJSON("https://maps.googleapis.com/maps/api/geocode/json", {
      address: address,
      sensor: "false"
    }).done(function(data) {
      coordinates = data.results[0].geometry.location;
      var latlng = new google.maps.LatLng(coordinates.lat, coordinates.lng)

      locationMarker = new google.maps.Marker({
        position: latlng,
        map: window.googleMaps.map,
        title: address
      });
      window.googleMaps.latlngbounds.extend(latlng);
      window.googleMaps.map.fitBounds(window.googleMaps.latlngbounds);
    });
  }

  setMap = function() {
    var map, mapOptions, marker, markerOptions;
    mapOptions = {
      scrollwheel: widgetAreaConfig.panZoom,
      draggable: widgetAreaConfig.panZoom,
      disableDefaultUI: !widgetAreaConfig.panZoom,
      disableDoubleClickZoom: !widgetAreaConfig.panZoom,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId[widgetAreaConfig.mapType]
    };
    window.googleMaps.map = new google.maps.Map($(".comarketing .canvas")[0], mapOptions);
  };
})();
