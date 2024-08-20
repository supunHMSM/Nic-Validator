import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Nav,  Button } from 'react-bootstrap';


function Navigation() {
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate('/login');
  };
  return (
    <Navbar style={{ backgroundColor: '#003366' }} variant="dark" expand="lg" className="p-3">

      <Navbar.Brand as={NavLink} to="/dash" className="font-weight-bold">
        NIC Validation
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav"> 
        <Nav className="ml-auto">
          <Nav.Link as={NavLink} to="/dash" activeClassName="active" className="mx-2">
            Dashboard
          </Nav.Link>
          <Nav.Link as={NavLink} to="/upload" activeClassName="active" className="mx-2">
            Upload Files
          </Nav.Link>
          <Nav.Link as={NavLink} to="/dashboard" activeClassName="active" className="mx-2">
            Users
          </Nav.Link>
          {/* <Nav.Link as={NavLink} to="/report" activeClassName="active" className="mx-2">
            Report
          </Nav.Link> */}
          <Button
            variant="danger"
            className="mx-2"
              onClick={handleLogout}
          >Logout</Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;
