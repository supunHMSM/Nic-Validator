import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import React from "react";

export default function LoginPage() {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); // Add state for error messages

  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const handleSubmit = (ev) => {
    ev.preventDefault();
    axios
      .post("http://localhost:3000/auth/login", values)
      .then((res) => {
        if (res.data.status === "Success") {
          // Set the authentication status in local storage
          localStorage.setItem('isAuthenticated', 'true');

          // Optionally, you can trigger a storage event to notify other components
          window.dispatchEvent(new Event('storage'));

          navigate("/dash");
        } else {
          setError(res.data.Error); // Set error message
        }
      })
      .catch((err) => {
        console.log(err);
        setError("An error occurred. Please try again later."); // Set generic error message
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-black flex items-center justify-center">
      <div className="bg-white rounded-lg p-10 max-w-md w-full shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">
          Sign In
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 text-red-600 text-center">
              {error} {/* Display error message */}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={values.email}
              onChange={(ev) => setValues({ ...values, email: ev.target.value })}
              className="w-full p-3 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={values.password}
              onChange={(ev) =>
                setValues({ ...values, password: ev.target.value })
              }
              className="w-full p-3 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <button className="w-full bg-blue-800 text-white py-3 rounded-md font-semibold hover:bg-blue-900 transition duration-300">
            Sign In
          </button>
          <div className="text-center pt-4">
            <Link
              className="text-blue-600 hover:text-blue-700 underline"
              to={"/forgot-password"}
            >
              Forgot your password?
            </Link>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              className="text-blue-800 font-semibold hover:underline"
              to={"/register"}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
