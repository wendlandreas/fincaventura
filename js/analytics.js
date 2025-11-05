function clickTrack(label, value) {
  gtag('event', 'click', {
    'event_category': 'engagement',
    'event_label': label,
    'value': value
  });
}

function clickTrackAffiliate(label, url, source) {
  gtag('event', 'affiliate_click', {
    'event_category': 'engagement',
    'event_label': label,
    'click_url': url,
    'click_source': source
  });
}