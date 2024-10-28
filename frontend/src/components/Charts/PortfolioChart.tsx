import { Line } from 'react-chartjs-2';

const PortfolioChart = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false, color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#666' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#666' },
      },
    },
  };
  
  return (
    <div style={{ height: '300px', padding: '20px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

