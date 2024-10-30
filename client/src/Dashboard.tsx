import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface VisitorData {
  adults: number;
  children: number;
  babies: number;
  arrivalDate: string;
  country: string;
}

const Dashboard: React.FC = () => {
  const [dailyData, setDailyData] = useState<{ x: Date; y: number }[]>([]);
  const [countryData, setCountryData] = useState<{ x: string; y: number }[]>([]);
  const [adultVisitors, setAdultVisitors] = useState<{ x: Date; y: number }[]>([]);
  const [childrenVisitors, setChildrenVisitors] = useState<{ x: Date; y: number }[]>([]);
  const [totalVisitors, setTotalVisitors] = useState<{ x: Date; y: number }[]>([]); 
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [allVisitorData, setAllVisitorData] = useState<VisitorData[]>([]); 

  useEffect(() => {
    axios.post('http://localhost:3001/api/data')
      .then(response => {
        const visitorData: VisitorData[] = response.data;
        setAllVisitorData(visitorData); 

       
        processVisitorData(visitorData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const processVisitorData = (visitorData: VisitorData[]) => {
   
    const dailyAggregated: { [key: string]: number } = {};
    const adultAggregated: { [key: string]: number } = {};
    const childrenAggregated: { [key: string]: number } = {};
    const totalAggregated: { [key: string]: number } = {};

    visitorData.forEach(entry => {
      const totalVisitorsCount = entry.adults + entry.children + entry.babies;
      const dateKey = new Date(entry.arrivalDate).toDateString(); 

      dailyAggregated[dateKey] = (dailyAggregated[dateKey] || 0) + totalVisitorsCount;
      adultAggregated[dateKey] = (adultAggregated[dateKey] || 0) + entry.adults;
      childrenAggregated[dateKey] = (childrenAggregated[dateKey] || 0) + entry.children;
      totalAggregated[dateKey] = (totalAggregated[dateKey] || 0) + totalVisitorsCount;
    });

    const dailyChartData = Object.entries(dailyAggregated).map(([date, totalVisitors]) => ({
      x: new Date(date),
      y: totalVisitors,
    }));

    const adultChartData = Object.entries(adultAggregated).map(([date, totalAdults]) => ({
      x: new Date(date),
      y: totalAdults,
    }));

    const childrenChartData = Object.entries(childrenAggregated).map(([date, totalChildren]) => ({
      x: new Date(date),
      y: totalChildren,
    }));

    const totalChartData = Object.entries(totalAggregated).map(([date, total]) => ({
      x: new Date(date),
      y: total,
    }));

    // Set initial data
    setDailyData(dailyChartData);
    setAdultVisitors(adultChartData);
    setChildrenVisitors(childrenChartData);
    setTotalVisitors(totalChartData);

    // Process country data
    processCountryData(visitorData);
  };

  const processCountryData = (visitorData: VisitorData[]) => {
    const countryAggregated: { [key: string]: number } = {};
    visitorData.forEach(entry => {
      const totalVisitorsCount = entry.adults + entry.children + entry.babies;
      const countryKey = entry.country;

      if (countryAggregated[countryKey]) {
        countryAggregated[countryKey] += totalVisitorsCount;
      } else {
        countryAggregated[countryKey] = totalVisitorsCount;
      }
    });

    const countryChartData = Object.entries(countryAggregated).map(([country, totalVisitors]) => ({
      x: country,
      y: totalVisitors,
    }));

    setCountryData(countryChartData);
  };

  
  const filterDataByDate = () => {
    const filteredDailyData = allVisitorData.filter(entry => {
      const date = new Date(entry.arrivalDate);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    processVisitorData(filteredDailyData); 
    processCountryData(filteredDailyData); 
  };

  const areaChartOptions: ApexOptions = {
    chart: {
      type: 'area',
      stacked: false,
      height: 350,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true,
      },
      toolbar: {
        autoSelected: 'zoom',
      },
    },
    colors: ['#26a0fc'],
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 3,
      colors: ['#26a0fc'],
      strokeColors: '#26a0fc',
    },
    title: {
      text: 'Number of Visitors per Day',
      align: 'left',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.4,
        gradientToColors: ['#26a0fc'],
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: ['#26a0fc'],
    },
    yaxis: {
      title: {
        text: 'Number of Visitors',
      },
      min: 0,
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'dd MMM yy',
      },
    },
    tooltip: {
      shared: false,
      y: {
        formatter: (val: number) => val.toFixed(0),
      },
    },
  };

  const columnChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
    },
    colors: ['#26a0fc'],
    dataLabels: {
      enabled: true,
    },
    title: {
      text: 'Number of Visitors per Country',
      align: 'left',
    },
    xaxis: {
      categories: countryData.map((data) => data.x),
    },
    yaxis: {
      title: {
        text: 'Number of Visitors',
      },
      min: 0,
    },
    tooltip: {
      shared: false,
      y: {
        formatter: (val: number) => val.toFixed(0),
      },
    },
  };

  const areaSeries = [
    {
      name: 'Visitors',
      data: dailyData,
    },
  ];

  const columnSeries = [
    {
      name: 'Visitors',
      data: countryData.map(data => data.y), 
    },
  ];

  const sparklineOptions: ApexOptions = {
    chart: {
      type: 'line',
      sparkline: {
        enabled: true,
      },
      height: 150,
    },
    colors: ['#26a0fc'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: 'topRight',
      },
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => val.toFixed(0),
      },
    },
  };

  return (
    <div>
      <div style={{ marginBottom:'30vh', marginLeft:'25%',}}>
        <label>
          Start Date:
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
        </label>
        <label style={{marginLeft:'20px'}}>
          End Date:
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
        </label>
        <button onClick={filterDataByDate} style={{marginLeft:'20px'}}> Apply Filter</button>
      </div>
     <div style={{marginLeft:'15%'}}>
     <div style={{ width: '70vw', border: '2px solid black', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
      <h3 style={{marginLeft: '50%'}}> Time series Chart </h3>
        <Chart options={areaChartOptions} series={areaSeries} type="area" height={350} />
      </div>
      <div style={{ width: '70vw', border: '2px solid black', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
      <h3 style={{marginLeft: '50%'}}> Sparkline chart </h3>
        <h3>Total Visitors</h3>
        <Chart options={sparklineOptions} series={[{ name: 'Total Visitors', data: totalVisitors.map(data => data.y) }]} type="line" height={150} />
        <h3>Total Adult Visitors</h3>
        <Chart options={sparklineOptions} series={[{ name: 'Adults', data: adultVisitors.map(data => data.y) }]} type="line" height={150} />
        <h3>Total Children Visitors</h3>
        <Chart options={sparklineOptions} series={[{ name: 'Children', data: childrenVisitors.map(data => data.y) }]} type="line" height={150} />
      </div>
      <div style={{ width: '70vw', border: '2px solid black', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
      <h3 style={{marginLeft: '50%'}}> column Series Chart </h3>
        <Chart options={columnChartOptions} series={columnSeries} type="bar" height={350} />
      </div>
     </div>
    </div>
  );
};

export default Dashboard;
