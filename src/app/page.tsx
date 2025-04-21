
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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

export default function Page(){
  const [carparkData, setCarparkData] = useState<CarparkData[]>([]);


  const locations = [
    { id: "1", lat: 1.3521, lng: 103.8198 },
  ];

  async function fetchCarparkData(datetime: string) {
    const data =  await fetch(`https://api.data.gov.sg/v1/transport/carpark-availability/?date_time=${datetime}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!data.ok) {
      throw new Error('Failed to fetch data')
    };

    const posts = await data.json();
    const cdata = posts.items[0]?.carpark_data || [];
    return cdata;
  }

  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 8); // Add 8 hours to convert UTC to SGT
    const date_time = now.toISOString().slice(0, 19);
    fetchCarparkData(date_time).then((data: CarparkData[]) => {
      setCarparkData(data);
    })
  })

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
      <Map center={{ lat: 1.3521, lng: 103.8198 }} locations={locations} />
    </div>
    <ul>
    {carparkData.map((carpark: CarparkData) => (
    <li key={`${carpark.carpark_number}-${carpark.carpark_info[0].lot_type}`}>
      Carpark Number: {carpark.carpark_number}-{carpark.carpark_info[0].lot_type}, lots_available: {carpark.carpark_info[0].lots_available}
    </li>
    ))}
    </ul>
    </>
  );
};


