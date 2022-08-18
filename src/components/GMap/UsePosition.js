import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

export const UsePosition = () => {
    const {setValueBy,location} = useContext(AppContext);
    const [position, setPosition] = useState({lat: 0, lng: 0});
    const [error, setError] = useState(null);

    const onChange = ({ coords }) => {
        setPosition({
            latitude: coords.latitude,
            longitude: coords.longitude,
            lat: coords.latitude,
            lng: coords.longitude
        });
    };

    const onError = (error) => {
        setError(error.message);
        setPosition({
            lat: location?.position?.lat,
            lng: location?.position?.lng || location?.position?.lon
        });
    };

    useEffect(() => {
        const geo = navigator.geolocation;
        if (!geo) {
            setError('Geolocation is not supported');
            setPosition({
                lat: location?.position?.lat,
                lng: location?.position?.lng || location?.position?.lon
            });
            return;
        }
        let watcher = geo.watchPosition(onChange, onError, {
                enableHighAccuracy: true
            });
        return () => geo.clearWatch(watcher);
    }, []);

    return { ...position, error };
}