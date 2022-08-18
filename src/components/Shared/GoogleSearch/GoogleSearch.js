
import React, { useEffect, useRef } from "react";

const GoogleSearch = ({
  onSelect = () => {}, 
  placeholder = "Search location"
}) => {
  const placeInputRef = useRef(null);

  // initialize the google place autocomplete
  const initPlaceAPI = () => {
    if(window.google && window.google.maps){
      let autocomplete = new window.google.maps.places.Autocomplete(placeInputRef.current);
      new window.google.maps.event.addListener(autocomplete, "place_changed", function () {
        let place = autocomplete.getPlace();
        onSelect({
          info: place,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      });
    }
  };

  // init search component 
  useEffect(() => {
    initPlaceAPI();
  }, []);

  return <input type="text" className="form-control" ref={placeInputRef} placeholder={placeholder} />
};

export default GoogleSearch;