import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Report from "./components/Reports";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import 'bootstrap/dist/css/bootstrap.min.css';
import Dashboard from "./components/Dashboard";
import { useState } from "react";
import UploadFile from "./components/UploadFiles";
import Dash from "./components/Dash";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
// import Navigation from "./components/Navigation";

function App() {
  const [data, setData] = useState([]);

  const handleDataLoaded = (loadData) => {
    setData(loadData);
  }
  return (
    <div>
      <BrowserRouter>
      {/* <Navigation/> */}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/Dash" element={<Dash />} />
          <Route path="/dashboard" element={<Dashboard data={data} />} />
          <Route path="/report" element={<Report />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/upload" element={<UploadFile onDataLoaded={handleDataLoaded}/>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />}></Route>
          <Route path="/reset-password/:token" element={<ResetPassword />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
