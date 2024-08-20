import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dash.css'; // Import custom CSS for additional styling
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Navigation from './Navigation';
import axios from 'axios';
import { Spinner, Alert } from 'react-bootstrap';

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dash = () => {
  const [totalRecords, setTotalRecords] = useState(0);
  const [maleUsers, setMaleUsers] = useState(0);
  const [femaleUsers, setFemaleUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/summary')
      .then(response => {
        setTotalRecords(response.data.totalRecords);
        setMaleUsers(response.data.maleUsers);
        setFemaleUsers(response.data.femaleUsers);
        setLoading(false);
      })
      .catch(error => {
        setError('Error fetching summary data');
        setLoading(false);
      });
  }, []);

  // Data for Bar Chart
  const barChartData = {
    labels: ['Male Users', 'Female Users'],
    datasets: [
      {
        label: 'User Count',
        backgroundColor: ['#1f77b4', '#ff7f0e'],
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        data: [maleUsers, femaleUsers],
      },
    ],
  };

  // Data for Pie Chart
  const pieChartData = {
    labels: ['Male Users', 'Female Users'],
    datasets: [
      {
        data: [maleUsers, femaleUsers],
        backgroundColor: ['#1f77b4', '#ff7f0e'],
        hoverBackgroundColor: ['#4b90d5', '#ff9f42'],
      },
    ],
  };

  return (
    <>
      <Navigation />
      <div className="container mt-4">
        <h2 className="text-center text-primary mb-4">Dashboard Summary</h2>

        {loading && (
          <div className="text-center mb-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading data...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <div className="row">
            <div className="col-md-4 col-sm-6 mb-4">
              <div className="card bg-primary text-white text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Total Records</h5>
                  <p className="card-text display-4">{totalRecords}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-6 mb-4">
              <div className="card bg-info text-white text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Male Users</h5>
                  <p className="card-text display-4">{maleUsers}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-6 mb-4">
              <div className="card bg-warning text-white text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Female Users</h5>
                  <p className="card-text display-4">{femaleUsers}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">User Distribution (Bar Chart)</h5>
                  <div className="chart-container">
                    <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">User Distribution (Pie Chart)</h5>
                  <div className="chart-container">
                    <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dash;
