import React, { useState, useEffect } from 'react';
import { Row, Col, Container, Table, Card, Pagination, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import './Dashboard.css';
import Navigation from './Navigation';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-data');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter(item =>
    item.NIC.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.birthday.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.age.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page on a new search
  };

  // Download report from the server
  const handleDownload = (format) => {
    const url = `http://localhost:5000/download-report/${format}`;
    window.location.href = url;
  };

  return (
    <>
      <Navigation />
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={10}>
            <Card className="dashboard-card shadow-sm ">
              <Card.Body>
                <h3 className="text-center mb-4 dashboard-title">Extracted Data</h3>
                <h5 className="text-center mb-4">Total Users: {filteredData.length}</h5>
                <Form.Control
                  type="text"
                  placeholder="Search by NIC, Birthday, Gender, or Age"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="mb-4"
                />
                <Table striped bordered hover className="dashboard-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>NIC</th>
                      <th>Birthday</th>
                      <th>Gender</th>
                      <th>Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.id}</td>
                        <td>{item.NIC}</td>
                        <td>{item.birthday.split('T')[0]}</td>
                        <td>{item.gender}</td>
                        <td>{item.age}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-center mt-4">
                <Button
                  className="highlight-button highlight-button-outline-primary me-2"
                  onClick={() => handleDownload('pdf')}
                >
                  Download PDF
                </Button>
                <Button
                  className="highlight-button highlight-button-outline-success me-2"
                  onClick={() => handleDownload('csv')}
                >
                  Download CSV
                </Button>
                <Button
                  className="highlight-button highlight-button-outline-info"
                  onClick={() => handleDownload('excel')}
                >
                  Download Excel
                </Button>

                </div>
                <Pagination className="justify-content-center mt-4">
                  {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;
