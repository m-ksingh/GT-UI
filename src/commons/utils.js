import { store } from 'react-notifications-component';
export const DEFAULT_LATLNG = {
  lat: '38.89206',
  lng: '-77.01991'
}
export const MAP_API_KEY = '8MG2TTKDohzEmAuA70AtJOBy6GKhKWWz';
export const GOOGLE_MAP_API_KEY = 'AIzaSyBC7ZclL4mU-l_rP9xB6xYH1WnJiJAnuhM'; // 'AIzaSyDVcLhp1XxGYkQ7Nr-cymAiW4d3jdOCWEA' //"AIzaSyCe6tEikiNVAmxt9yFzzC5_MX4EU9sSv9A"
export const formatNumber = number => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
}

export const showNotification = (title, message, type) => {
  store.addNotification({
    title,
    message: message || 'Something went wrong, Please try after sometimes',
    type,
    insert: "top",
    container: "top-center",
    dismiss: {
      duration: 2000,
      onScreen: true
    }
  });
}

export const refreshTokenSetup = (res) => {
  // Timing to renew access token
  let refreshTiming = (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;

  const refreshToken = async () => {
    const newAuthRes = await res.reloadAuthResponse();
    refreshTiming = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;
    console.log('newAuthRes:', newAuthRes);
    // saveUserToken(newAuthRes.access_token);  <-- save new token
    localStorage.setItem('authToken', newAuthRes.id_token);

    // Setup the other timer after the first one
    setTimeout(refreshToken, refreshTiming);
  };

  // Setup first refresh timer
  setTimeout(refreshToken, refreshTiming);
};

export const goToTopOfWindow = () => {
  window.scrollTo(0, 0);
}

//regular expressions to extract IP and country values
const countryCodeExpression = /loc=([\w]{2})/;
const userIPExpression = /ip=([\w\.]+)/;

//automatic country determination.
export const initLocation = () => {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 3000;
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          let countryCode = countryCodeExpression.exec(this.responseText)
          let ip = userIPExpression.exec(this.responseText)
          if (countryCode === null || countryCode[1] === '' ||
            ip === null || ip[1] === '') {
            reject('IP/Country code detection failed');
          }
          let result = {
            "countryCode": countryCode[1],
            "IP": ip[1]
          };
          resolve(result)
        } else {
          reject(xhr.status)
        }
      }
    }
    xhr.ontimeout = function () {
      reject('timeout')
    }
    xhr.open('GET', 'https://www.cloudflare.com/cdn-cgi/trace', true);
    xhr.send();
  });
}

// calculate distance between two coords
export const calculateDistance = ({prevLat, prevLong, lat, long}) => {
  const prevLatInRad = toRad(prevLat);
  const prevLongInRad = toRad(prevLong);
  const latInRad = toRad(lat);
  const longInRad = toRad(long);

  return (
    // In kilometers
    6377.830272 *
    Math.acos(
      Math.sin(prevLatInRad) * Math.sin(latInRad) +
        Math.cos(prevLatInRad) * Math.cos(latInRad) * Math.cos(longInRad - prevLongInRad),
    )
  );
}

function toRad(angle) {
  return (angle * Math.PI) / 180;
}

export const getUniqueId = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}