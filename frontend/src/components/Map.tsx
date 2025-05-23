import { memo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  ZoomControl,
  Popup,
} from "react-leaflet";
import { Icon, LatLngLiteral } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

type MapType = "roadmap" | "satellite" | "hybrid" | "terrain";

type CarparkInfo = {
  lot_type: string;
  lots_available: number;
};

type CarparkData = {
carpark_number: string;
carpark_info: CarparkInfo[];
};

type MapLocation = LatLngLiteral & { id: string, carparkData: CarparkData };

type MapProps = {
  center: LatLngLiteral;
  locations: MapLocation[];
  currentLocation?: LatLngLiteral;
};

const SelectedLocation = ({ center }: { center: LatLngLiteral }) => {
  const map = useMap();
  map.panTo(center, { animate: true });
  return null;
};

export const Map: React.FC<MapProps> = memo(({ center, locations, currentLocation }) => {
  const [mapType, setMapType] = useState<MapType>("roadmap");
  const [selectedLocation, setSelectedLocation] = useState<
    MapLocation | undefined
  >();

  const getUrl = () => {
    const mapTypeUrls: Record<MapType, string> = {
      roadmap: "http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}",
      satellite: "http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
      hybrid: "http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}",
      terrain: "http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
    };
    return mapTypeUrls[mapType];
  };

  const mapMarkIcon = new Icon({
    iconUrl: "map-marker.png",
    iconSize: [47, 55],
  });
  const mapMarkActiveIcon = new Icon({
    iconUrl: "active-map-marker.png",
    iconSize: [57, 65],
  });

  const renderMarks = () => {
    return locations.filter((location) => location.carparkData?.carpark_number).map((location) => (
      
      <div key={location.id}>
        <Marker
          icon={
            location.id === selectedLocation?.id
              ? mapMarkActiveIcon
              : mapMarkIcon
          }
          position={{ lat: location.lat, lng: location.lng }}
          eventHandlers={{
            click: () => {
              setSelectedLocation((prev) =>
                prev?.id === location.id ? undefined : location
              );
            },
          }}
        >
          <Popup>
            <div>
              <h3>Carpark Number: {location.carparkData.carpark_number}</h3>
              <ul>
                {location.carparkData.carpark_info.map((info, index) => (
                  <li key={index}>
                    Lot Type: {info.lot_type}, Lots Available: {info.lots_available}
                  </li>
                ))}
              </ul>
            </div>
          </Popup>
        </Marker>
      </div>
    ));
  };

  return (
    <>
      <div
        style={{
          width: "80%",
          height: "80vh",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={center}
          zoom={13}
          minZoom={15}
          zoomControl={false}
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer url={getUrl()} />
          {selectedLocation && <SelectedLocation center={selectedLocation} />}
          {renderMarks()}
          {currentLocation && (
            <Marker
              position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
            />
          )}
          <ZoomControl position="topright" />
        </MapContainer>
      </div>
      <div style={{ display: "flex", marginTop: "10px", gap: "20px" }}>
        <button onClick={() => setMapType("roadmap")}>roadmap</button>
        <button onClick={() => setMapType("satellite")}>satellite</button>
        <button onClick={() => setMapType("hybrid")}>hybrid</button>
        <button onClick={() => setMapType("terrain")}>terrain</button>
      </div>
    </>
  );
});

Map.displayName = 'Map';