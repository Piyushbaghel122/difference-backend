import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

const DEFAULT_POSITION: [number, number] = [13.0827, 80.2707];

type MapCenterProps = {
  position: [number, number];
};

const MapCenter = ({ position }: MapCenterProps) => {
  const map = useMap();

  useEffect(() => {
    map.setView(position);
  }, [map, position]);

  return null;
};

const UserLocationMap = () => {
  const [position, setPosition] =
    useState<[number, number]>(DEFAULT_POSITION);
  const [locationError, setLocationError] = useState(() =>
    navigator.geolocation
      ? ""
      : "Geolocation is not supported by this browser.",
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (location) => {
        setPosition([
          location.coords.latitude,
          location.coords.longitude,
        ]);
        setLocationError("");
      },
      (error) => {
        setLocationError(error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10_000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <>
      {locationError && (
        <div className="location-error">{locationError}</div>
      )}
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>Tamil Nadu</Popup>
        </Marker>
        <MapCenter position={position} />
      </MapContainer>
    </>
  );
};

export default UserLocationMap;
