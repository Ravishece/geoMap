
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
      'type':[],
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
  
  var url = 'http://10.117.147.32:8080/marketplaceapp/v1/api/products?';
  //var url = 'data/IndianCities.4.json?';

  $.getJSON(url,function(response){
    updateFilterSection(response);
    $('.loading').addClass('hide');
  });

}

function filterArrayOfObjectsWithKeys(arr,key,value){
    return arr.filter(function(n){return n[key] === value});
}

function removeDuplicateObjectsFromArray(arr,key){
    
    var tempArr = [];
    var countryArr = [];
    for(var i = 0; i<arr.length;i++){
      if(countryArr.indexOf(arr[i][key]) == -1){
        countryArr.push(arr[i][key]);
        tempArr.push(arr[i]);
      }
    }
    return tempArr;
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
    image.url = 'images/' + place['type'] + '.png';
    var marker = new google.maps.Marker({
      position: {lat: parseFloat(place.latitue), lng: parseFloat(place.longitude)},
      map: map,
      //icon: image,
      //shape: shape,
      title: place.country
      //zIndex: places[3]
    });
    window.customMapObject.markers.push(marker);
  }
  
  if(window.customMapObject.currentSelectedDropdown && window.customMapObject.currentSelectedDropdown.name){
    var zoomLevel =2;
    var lat = parseFloat(window.customMapObject.currentSelectedDropdown.lat);
    var lng = parseFloat(window.customMapObject.currentSelectedDropdown.lng);
    
    if(window.customMapObject.currentSelectedDropdown.name === 'countryDropdown'){
      zoomLevel = 4;
    }else if(window.customMapObject.currentSelectedDropdown.name === 'stateDropdown'){
      zoomLevel = 6;
    }else if(window.customMapObject.currentSelectedDropdown.name === 'cityDropdown'){
      zoomLevel = 8;
    }
    window.customMapObject.map.setZoom(zoomLevel);
    window.customMapObject.map.setCenter({"lat":lat,"lng":lng});
  }else{
    window.customMapObject.map.setZoom(2);
    window.customMapObject.map.setCenter({"lat":23.6,"lng":10.2});
  }
}

$('.search-btn').on('click',function(){
  $('.modal-body').empty();
  var str ='';
  var arr =  window.customMapObject.filteredPlaces;
  for(var i=0;i<arr.length;i++){
    str += '<div class="media">'+
                '<a class="pull-left" href="#">'+
                  '<img class="media-object" src="images/Farmer-icon.png"></a>'+
                '<div class="media-body">'+
                  '<h4 class="media-heading">'+arr[i].vendor.name +'<span>'+
                  '<input type="number" class="rating" name="'+ arr[i].id +'" data-clearable="remove" value="'+ Math.floor(arr[i].vendor.rating) +'" data-readonly />'+
                  '</h4>'+
                  '<span>'+arr[i].vendor.email+'</span><br />'+
                  '<span>Address line 1</span>,<br />'+
                  '<span>'+arr[i].city+'</span>, <span>'+arr[i].state+'</span>, <span>'+arr[i].country+'</span><br />'+
                  '<span class="label">Product type</span><span>: '+arr[i].type+'</span><br />'+
                  '<span class="label">Quantity</span><span>: '+arr[i].quantity+'</span><br />'+
                  '<span class="label">Harvest Period</span><span>: '+ formatDate(arr[i].harvestDate)+'</span></div>'+
              '</div>'
  }; 
  $('.modal-body').append(str);
  $('input.rating').rating();

});

$('.dropdown-wrapper select').on('change',function(e){
  $('.search-btn').removeAttr('disabled');

  var val = e.target.value;
  var dropdownId = $(e.target).attr('id');
  
  window.customMapObject.selectedFilterFacets[$(e.target).attr('data-searchCriteria')].push(val);
  //window.customMapObject.selectedFilterFacets.push(val);
  $(e.target).parent('.dropdown-wrapper').addClass('hide');
  var searchCriteria = $(e.target).attr('data-searchCriteria');
  addFacetFilter(searchCriteria,val,dropdownId);
  
  if(dropdownId === 'countryDropdown' && val !== 'all'){
    $('#stateDropdown').parents('.dropdown-wrapper').removeClass('disabled');
    $('#stateDropdown').removeAttr('disabled');
  }
  
  if(dropdownId.indexOf('country') !== -1 || dropdownId.indexOf('state') !== -1 || dropdownId.indexOf('city') !== -1){
    window.customMapObject.currentSelectedDropdown = {
      name: dropdownId,
      lat: $(e.target).find('option[value="'+ val +'"]').attr('data-lat'),
      lng: $(e.target).find('option[value="'+ val +'"]').attr('data-lng')
    }
  }else{
   // window.customMapObject.currentSelectedDropdown = {};
  }
  // var response1 = window.customMapObject.places;
  // if(val !== 'all'){
  //   response1 = filterArrayOfObjectsWithKeys(window.customMapObject.places,'type',val);  
  // }
  // setMarkers(window.customMapObject.map, response1);
  
  filterPlacesOnMap();
  
});

$('.filter-section').on('change','#stateDropdown',function(){
     $('#cityDropdown').parents('.dropdown-wrapper').removeClass('disabled');
     $('#cityDropdown').removeAttr('disabled');
});


$('.filter-section').on('click','.clear-facet',function(e){
    window.customMapObject.currentSelectedDropdown = {};
    $(e.target).parents('li').remove();    
    var dropdownId = $(e.target).siblings('a').attr('id').split('-')[2];
    var key = $(e.target).siblings('a').attr('data-key');
    $('#'+dropdownId ).parents('.dropdown-wrapper').removeClass('hide');
    $('#'+dropdownId )[0].selectedIndex = 0;
    var arrIndex =window.customMapObject.selectedFilterFacets[$(e.target).siblings('a').attr('data-searchCriteria')].indexOf(key);
    window.customMapObject.selectedFilterFacets[$(e.target).siblings('a').attr('data-searchCriteria')].splice(arrIndex,1);
    //visualizeFacetedFilters();
    
    if($('.filter-section ul li').length === 0){
      $('.search-btn').attr('disabled','disabled');
    }else{
      $('.search-btn').removeAttr('disabled');
    }

    if(dropdownId === 'countryDropdown'){
      $('#stateDropdown').parents('.dropdown-wrapper').addClass('disabled');
      $('#cityDropdown').parents('.dropdown-wrapper').addClass('disabled');
      $('#stateDropdown').attr('disabled','disabled');
      $('#cityDropdown').attr('disabled','disabled');
       
      $('#stateDropdown')[0].selectedIndex = 0;
      $('#cityDropdown')[0].selectedIndex = 0;
      $('#facet-filter-stateDropdown').parent('li').remove();
      $('#facet-filter-cityDropdown').parent('li').remove();
      
       window.customMapObject.selectedFilterFacets.state = [];
       window.customMapObject.selectedFilterFacets.city = [];
       
    }
    
    if(dropdownId === 'stateDropdown'){
      $('#cityDropdown').parents('.dropdown-wrapper').addClass('disabled');
      $('#cityDropdown').attr('disabled','disabled');
      $('#facet-filter-cityDropdown').parent('li').remove();
      $('#cityDropdown')[0].selectedIndex = 0;
       window.customMapObject.selectedFilterFacets.city = [];
    }
    
    filterPlacesOnMap();
    
});

$('.reset-filter').on('click',function(){
    $('.search-btn').removeAttr('disabled');
    
    window.customMapObject.currentSelectedDropdown = {};
    $('.filter-section ul').empty();
    $('.dropdown-wrapper select').each(function(){
        $(this)[0].selectedIndex = 0;
        $(this).parents('.dropdown-wrapper').removeClass('hide');
    });
    window.customMapObject.initSelectedFilterFacets();

    //reset the state and city fields
    $('#stateDropdown').parents('.dropdown-wrapper').addClass('disabled');
    $('#cityDropdown').parents('.dropdown-wrapper').addClass('disabled');
    $('#stateDropdown').attr('disabled','disabled');
    $('#cityDropdown').attr('disabled','disabled');

    filterPlacesOnMap();

    // for (var i = 0; i < window.customMapObject.markers.length; i++) {
    //   window.customMapObject.markers[i].setMap(null);
    // }
    
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

function filterPlacesOnMap(){
  $('.loading').removeClass('hide');
  
  var qryStr = '';
  
  var selectedFilters = window.customMapObject.selectedFilterFacets;
  for(item in selectedFilters){
    if(selectedFilters[item].length > 0){
      qryStr += item + '='+selectedFilters[item][0] + '&';
    }
  }

  if($('#harvestDropdown').val() != ''){
    qryStr += 'month' + $('#harvestDropdown').val()+ '&';
  }

  if(qryStr.length > 0){
    qryStr = qryStr.substring(qryStr.length-1,-1);
  }
  
  var url = 'http://10.117.147.32:8080/marketplaceapp/v1/api/products?';
  //var url = 'data/IndianCities.4.json?';
  
  $.getJSON(url +qryStr,function(response){
    var places = [];
    window.customMapObject.filteredPlaces = response;
    for(fil in window.customMapObject.selectedFilterFacets){
      if(window.customMapObject.selectedFilterFacets[fil].length > 0){
        window.customMapObject.filteredPlaces = filterArrayOfObjectsWithKeys(window.customMapObject.filteredPlaces,fil,window.customMapObject.selectedFilterFacets[fil][0]);
      }
    }
    if(window.customMapObject.selectedFilterFacets.country.length === 0){
      window.customMapObject.filteredPlaces = removeDuplicateObjectsFromArray(window.customMapObject.filteredPlaces,'country'); 
    }
    
    if($('.filtered-facets ul li').length === 0){
      window.customMapObject.filteredPlaces = [];
    }
    
    updateFilterSection(response);
    setMarkers(window.customMapObject.map, window.customMapObject.filteredPlaces);
    
    $('.loading').addClass('hide');
    
  });
}



function updateFilterSection(arr){
  window.customMapObject.filterObjectParams = {};
  $('.filter-section select').each(function(){
    var searchCriteria = $(this).attr('data-searchCriteria');
    var dropdownId = $(this).attr('id');
    populateFilterParamsObject(dropdownId,arr,searchCriteria);
  });
  
}

function populateFilterParamsObject(dropdownId,arr,searchCriteria ){
  
  window.customMapObject.filterObjectParams[dropdownId] = [];

  if(dropdownId === 'harvestDropdown'){
    return;
  }

  if(dropdownId.indexOf('country') !== -1 || dropdownId.indexOf('state') !== -1 || dropdownId.indexOf('city') !== -1){
    window.customMapObject.filterObjectParams[dropdownId+'Obj'] = [];
    for(var i=0;i<arr.length;i++){
      if(window.customMapObject.filterObjectParams[dropdownId].indexOf(arr[i][searchCriteria]) == -1){
        window.customMapObject.filterObjectParams[dropdownId].push(arr[i][searchCriteria]);
        var tempObj = {
          name: arr[i][searchCriteria],
          lat: arr[i]['latitue'],
          lng: arr[i]['longitude']
        }
        window.customMapObject.filterObjectParams[dropdownId+'Obj'].push(tempObj);
      }
    }
    updateDropdowns(dropdownId,window.customMapObject.filterObjectParams[dropdownId+'Obj'],true);
  }else{
    for(var i=0;i<arr.length;i++){
      if(window.customMapObject.filterObjectParams[dropdownId].indexOf(arr[i][searchCriteria]) == -1){
        window.customMapObject.filterObjectParams[dropdownId].push(arr[i][searchCriteria]);
      }
    }  
    updateDropdowns(dropdownId,window.customMapObject.filterObjectParams[dropdownId],false);
  }
  
  
}

function updateDropdowns(id,arr,loc){
  var firstOptionVal = '<option value="">--select--</option>';
  var optionVals = '';
  $('#'+id).empty();
  
  if(loc){
    for(var i=0;i<arr.length;i++){
      optionVals += '<option  data-lat="' + arr[i]["lat"] + '" data-lng="' + arr[i]["lng"] + '" value="' + arr[i]["name"] + '">' + arr[i]["name"] + '</option>';
    }
  }else{
    for(var i=0;i<arr.length;i++){
      optionVals += '<option value="' + arr[i] + '">' + arr[i] + '</option>';
    }  
  }
  
  
  $('#'+id).append(firstOptionVal + optionVals);
}

function formatDate(dt){
  var dt = new Date(dt);
  var monthArr = ['January','February', 'March', 'April','May', 'June', 'August', 'September', 'October', 'November', 'December'];
  return dt.getDate() + ', ' + monthArr[dt.getMonth()-1] + ' ' + dt.getFullYear();
}
//});