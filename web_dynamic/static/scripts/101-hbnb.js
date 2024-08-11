#!/usr/bin/node

$(document).ready(init);

const HOST = '0.0.0.0';
const amenityObj = {};
const stateObj = {};
const cityObj = {};
let obj = {};

function init () {
  $('.amenities .popover input').change(function () { obj = amenityObj; checkedObjects.call(this, 1); });
  $('.state_input').change(function () { obj = stateObj; checkedObjects.call(this, 2); });
  $('.city_input').change(function () { obj = cityObj; checkedObjects.call(this, 3); });
  apiStatus();
  searchPlaces();
}

function checkedObjects (nObject) {
  if ($(this).is(':checked')) {
    obj[$(this).attr('data-name')] = $(this).attr('data-id');
  } else if ($(this).is(':not(:checked)')) {
    delete obj[$(this).attr('data-name')];
  }
  const names = Object.keys(obj);
  if (nObject === 1) {
    $('.amenities h4').text(names.sort().join(', '));
  } else if (nObject === 2 || nObject === 3) {
    const allLocations = [...Object.keys(stateObj), ...Object.keys(cityObj)];
    $('.locations h4').text(allLocations.sort().join(', '));
  }
}

function apiStatus () {
  const API_URL = `http://${HOST}:5001/api/v1/status/`;
  $.get(API_URL, (data, textStatus) => {
    if (textStatus === 'success' && data.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  });
}

function searchPlaces () {
  const PLACES_URL = `http://${HOST}:5001/api/v1/places_search/`;
  $.ajax({
    url: PLACES_URL,
    type: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({
      amenities: Object.values(amenityObj),
      states: Object.values(stateObj),
      cities: Object.values(cityObj)
    }),
    success: function (response) {
      $('SECTION.places').empty();
      for (const r of response) {
        const article = [
          '<article>',
          '<div class="title_box">',
          `<h2>${r.name}</h2>`,
          `<div class="price_by_night">$${r.price_by_night}</div>`,
          '</div>',
          '<div class="information">',
          `<div class="max_guest">${r.max_guest} Guest(s)</div>`,
          `<div class="number_rooms">${r.number_rooms} Bedroom(s)</div>`,
          `<div class="number_bathrooms">${r.number_bathrooms} Bathroom(s)</div>`,
          '</div>',
          '<div class="description">',
          `${r.description}`,
          '</div>',
          '<div class="reviews"><h2>',
          `<span id="${r.id}n" class="treview">Reviews</span>`,
          `<span id="${r.id}" onclick="toggleReviews(this)">Show</span></h2>`,
          `<ul id="${r.id}r"></ul>`,
          '</div>',
          '</article>'
        ];
        $('SECTION.places').append(article.join(''));
      }
    },
    error: function (error) {
      console.log(error);
    }
  });
}

function toggleReviews (obj) {
  const reviewsList = $(`#${obj.id}r`);
  
  if (obj.textContent === 'Show') {
    obj.textContent = 'Hide';
    $.get(`http://${HOST}:5001/api/v1/places/${obj.id}/reviews`, (data, textStatus) => {
      if (textStatus === 'success') {
        $(`#${obj.id}n`).html(data.length + ' Reviews');
        reviewsList.empty(); // Clear the list before adding new items
        for (const review of data) {
          appendReview(review, reviewsList);
        }
      }
    });
  } else {
    obj.textContent = 'Show';
    $(`#${obj.id}n`).html('Reviews');
    reviewsList.empty();
  }
}

function appendReview (review, reviewsList) {
  const date = new Date(review.created_at);
  const formattedDate = `${dateOrdinal(date.getDate())} ${date.toLocaleString('en', { month: 'long' })} ${date.getFullYear()}`;

  $.get(`http://${HOST}:5001/api/v1/users/${review.user_id}`, (userData, textStatus) => {
    if (textStatus === 'success') {
      const reviewHtml = `
        <li>
          <h3>From ${userData.first_name} ${userData.last_name} on ${formattedDate}</h3>
          <p>${review.text}</p>
        </li>`;
      reviewsList.append(reviewHtml);
    }
  });
}

function dateOrdinal (day) {
  if (day === 31 || day === 21 || day === 1) return day + 'st';
  else if (day === 22 || day === 2) return day + 'nd';
  else if (day === 23 || day === 3) return day + 'rd';
  else return day + 'th';
}
