type CarparkInfo = {
  lot_type: string;
  lots_available: number;
};

type CarparkData = {
  carpark_number: string;
  carpark_info: CarparkInfo[];
};

export default async function Page() {
  const now = new Date();
  now.setHours(now.getHours() + 8); // Add 8 hours to convert UTC to SGT
  const date_time = now.toISOString().slice(0, 19);
  console.log(date_time);
  const data = await fetch(`https://api.data.gov.sg/v1/transport/carpark-availability/?date_time=${date_time}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
  if (!data.ok) {
    throw new Error('Failed to fetch data')
  };
  const posts = await data.json()
  const carparkData = posts.items[0]?.carpark_data || [];
  return (
    <ul>
      {carparkData.map((carpark: CarparkData) => (
      <li key={`${carpark.carpark_number}-${carpark.carpark_info[0].lot_type}`}>
        Carpark Number: {carpark.carpark_number}-{carpark.carpark_info[0].lot_type}, lots_available: {carpark.carpark_info[0].lots_available}
      </li>
      ))}
    </ul>
  )
}