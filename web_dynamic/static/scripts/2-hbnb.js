#!/usr/bin/node

$(document).ready(function () {
  const amenityIds = {};
  $('input[type="checkbox"]').change(function () {
    if (this.checked) {
      amenityIds[$(this).data('id')] = $(this).data('name');
    } else {
      delete amenityIds[$(this).data('id')];
    }
    const amenities = Object.values(amenityIds);
    if (amenities.length === 0) {
      $('.amenities h4').html('&nbsp;');
    } else {
      $('.amenities h4').text(amenities.join(', '));
    }
  });

  // Request to check the status
  $.get('http://0.0.0.0:5001/api/v1/status/', function (data, textStatus) {
    if (textStatus === 'success' && data.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  });
});
