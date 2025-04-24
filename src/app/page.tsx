"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import proj4 from "proj4";

const Map = dynamic(
  () => import("@/components/Map").then((component) => component.Map),
  { ssr: false }
);

type CarparkInfo = {
  lot_type: string;
  lots_available: number;
};

type CarparkData = {
  carpark_number: string;
  carpark_info: CarparkInfo[];
};

type CarParkRecord = {
  _id: number;
  car_park_no: string;
  address: string;
  x_coord: string;
  y_coord: string;
  car_park_type: string;
  type_of_parking_system: string;
  short_term_parking: string;
  free_parking: string;
  night_parking: string;
  car_park_decks: string;
  gantry_height: string;
  car_park_basement: string;
};

export default function Page() {
  const [carparkData, setCarparkData] = useState<CarparkData[]>([]);
  const [locations, setLocations] = useState<
    { id: string; lat: number; lng: number; carparkData: CarparkData }[]
  >([]);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);

  async function fetchCarparkData(datetime: string) {
    const response = await fetch(
      `https://api.data.gov.sg/v1/transport/carpark-availability/?date_time=${datetime}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const posts = await response.json();
    const data = posts.items[0]?.carpark_data || [];
    return data;
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else { 
      return null;
    }
  }
  
  function success(position: GeolocationPosition) {
    const currentLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    }
    setLocation(currentLocation);
    return currentLocation;
  }

  useEffect(() => {
      getLocation();
    }, []);
  
  function error() {
    alert("Sorry, no position available.");
  }

  async function fetchAllCarparkInfo() {
    let allRecords: CarParkRecord[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;
  
    while (hasMore) {
      const response = await fetch(
        `https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09&offset=${offset}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const posts = await response.json();
      const data = posts.result.records;
  
      allRecords = [...allRecords, ...data];
      hasMore = data.length === limit;
      offset += limit;
    }
  
    return allRecords;
  }

  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 8); // Add 8 hours to convert UTC to SGT
    const date_time = now.toISOString().slice(0, 19);
    fetchCarparkData(date_time).then((data: CarparkData[]) => {
      setCarparkData(data);
    });
  });

  const memoizedCarparkData = useMemo(() => carparkData, [carparkData]);

  useEffect(() => {
    fetchAllCarparkInfo().then((data: CarParkRecord[]) => {
      const updatedLocations = data.map((carpark: CarParkRecord) => {
        const fromProjection =
          "+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1.0 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs";
        const toProjection = "+proj=longlat +datum=WGS84 +no_defs";
        const coordinates = proj4(fromProjection, toProjection, [
          parseFloat(carpark.x_coord),
          parseFloat(carpark.y_coord),
        ]);
        const matchedCarparkData = memoizedCarparkData.find(
          (car: CarparkData) => car.carpark_number === carpark.car_park_no
        );

        return {
          id: carpark.car_park_no,
          lat: coordinates[1],
          lng: coordinates[0],
          carparkData: matchedCarparkData || { carpark_number: "", carpark_info: [] },
        };
      });

      setLocations(updatedLocations); 
    });
  }, [memoizedCarparkData]);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <Map center={location ?? { lat: 1.3521, lng: 103.8198 }} locations={locations} currentLocation={location || undefined} />
      </div>

    </>
  );
}


