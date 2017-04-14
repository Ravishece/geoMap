
window.customMapObject = {};
window.customMapObject.markers = [];
/*window.customMapObject.selectedFilterFacets = {
    'product':[],
    'country':[],
    'state':[],
    'city':[],
    'harvest':[]
};*/
window.customMapObject.initSelectedFilterFacets = function(){
  window.customMapObject.selectedFilterFacets = {
      'product':[],
      'country':[],
      'state':[],
      'city':[],
      'harvest':[]
  };
};
window.customMapObject.initSelectedFilterFacets();

window.initMap = function() {
  window.customMapObject.map = new google.maps.Map(document.getElementById('map'), {
    zoom:2,
    center: {lat: 23.6, lng: 10.2}
  });
  
  $.getJSON('data/IndianCities.json',function(response){
    var places = [];
    window.customMapObject.places = response;
  });
  
}

function filterArrayOfObjectsWithKeys(arr,key,value){
    return arr.filter(function(n){return n[key] === value});
}

function setMarkers(map, places) {
  
  for (var i = 0; i < window.customMapObject.markers.length; i++) {
    window.customMapObject.markers[i].setMap(null);
  }
  

  // Marker sizes are expressed as a Size of X,Y where the origin of the image
  // (0,0) is located in the top left of the image.

  // Origins, anchor positions and coordinates of the marker increase in the X
  // direction to the right and in the Y direction down.
  var image = {
    url: 'images/tomato.png',
    // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(20, 32),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(0, 32)
  };
  
  
  // Shapes define the clickable region of the icon. The type defines an HTML
  // <area> element 'poly' which traces out a polygon as a series of X,Y points.
  // The final coordinate closes the poly by connecting to the first coordinate.
  var shape = {
    coords: [1, 1, 1, 20, 18, 20, 18, 1],
    type: 'poly'
  };
  
  for (var i = 0; i < places.length; i++) {
    var place= places[i];
    image.url = 'images/' + place['product'] + '.png';
    var marker = new google.maps.Marker({
      position: {lat: parseFloat(place.lat), lng: parseFloat(place.lon)},
      map: map,
      icon: image,
      shape: shape,
      title: place.name
      //zIndex: places[3]
    });
    window.customMapObject.markers.push(marker);
  }
}

$('.dropdown-wrapper select').on('change',function(e){
  var val = e.target.value;
  var dropdownId = $(e.target).attr('id');
  
  window.customMapObject.selectedFilterFacets[$(e.target).attr('data-searchCriteria')].push(val);
  //window.customMapObject.selectedFilterFacets.push(val);
  $(e.target).parent('.dropdown-wrapper').addClass('hide');
  var searchCriteria = $(e.target).attr('data-searchCriteria');
  addFacetFilter(searchCriteria,val,dropdownId);
  
  if(dropdownId === 'locationCountryDropdown' && val !== 'all'){
    $('#locationStateDropdown').parents('.dropdown-wrapper').removeClass('hide');
  }
  
  var response1 = window.customMapObject.places;
  if(val !== 'all'){
    response1 = filterArrayOfObjectsWithKeys(window.customMapObject.places,'product',val);  
  }
  setMarkers(window.customMapObject.map, response1);
  
});

$('.filter-section').on('change','#locationStateDropdown',function(){
     $('#locationCityDropdown').parents('.dropdown-wrapper').removeClass('hide');
});


$('.filter-section').on('click','.clear-facet',function(e){
    $(e.target).parents('li').remove();    
    var dropdownId = $(e.target).siblings('a').attr('id').split('-')[2];
    var key = $(e.target).siblings('a').attr('data-key');
    $('#'+dropdownId ).parents('.dropdown-wrapper').removeClass('hide');
    $('#'+dropdownId )[0].selectedIndex = 0;
    var arrIndex =window.customMapObject.selectedFilterFacets[$(e.target).siblings('a').attr('data-searchCriteria')].indexOf(key);
    window.customMapObject.selectedFilterFacets[$(e.target).siblings('a').attr('data-searchCriteria')].splice(arrIndex,1);
    //visualizeFacetedFilters();
    
    if(dropdownId === 'locationCountryDropdown'){
      $('#locationStateDropdown').parents('.dropdown-wrapper').addClass('hide');
      $('#locationCityDropdown').parents('.dropdown-wrapper').addClass('hide');
      $('#locationStateDropdown')[0].selectedIndex = 0;
      $('#locationCityDropdown')[0].selectedIndex = 0;
      $('#facet-filter-locationStateDropdown').parent('li').remove();
      $('#facet-filter-locationCityDropdown').parent('li').remove();
      
       window.customMapObject.selectedFilterFacets.state = [];
       window.customMapObject.selectedFilterFacets.city = [];
       
    }
    
    if(dropdownId === 'locationStateDropdown'){
      $('#locationCityDropdown').parents('.dropdown-wrapper').addClass('hide');
      $('#facet-filter-locationCityDropdown').parent('li').remove();
      $('#locationCityDropdown')[0].selectedIndex = 0;
       window.customMapObject.selectedFilterFacets.city = [];
    }
    
});

$('.reset-filter').on('click',function(){
    $('.filter-section ul').empty();
    $('.dropdown-wrapper select').each(function(){
        $(this)[0].selectedIndex = 0;
        $(this).parents('.dropdown-wrapper').removeClass('hide');
    });
    window.customMapObject.initSelectedFilterFacets();
});

function addFacetFilter(searchCriteria, key, dropdownId){
    //visualizeFacetedFilters();
    var htmlStr = '<li><a href="#" data-searchCriteria="' + searchCriteria + '" data-key="' + key + '" id="facet-filter-'+  dropdownId +'">'+ key +'</a><span class="clear-facet">x</span></li>';
    $('.filtered-facets ul').append(htmlStr);
}

function visualizeFacetedFilters(){
    if(window.customMapObject.selectedFilterFacets.length === 0){
        $('.filtered-facets').addClass('hide');
    }else{
        $('.filtered-facets').removeClass('hide');
    }
}


//});