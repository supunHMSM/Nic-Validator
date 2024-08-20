import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export default function RegisterPage() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSubmit = (ev) => {
    ev.preventDefault();
    axios
      .post("http://localhost:5000/auth/register", values)
      .then((res) => {
        if (res.data.status === "Success") {
          navigate("/login");
        } else {
          alert(res.data.Error || "Registration failed. Please try again.");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-black flex items-center justify-center">
      <div className="bg-white rounded-lg p-10 max-w-md w-full shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8">
          Create Account
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Name
            </label>
            <input
              type="text"
              placeholder="Supun Madhuwantha"
              value={values.name}
              onChange={(ev) => setValues({ ...values, name: ev.target.value })}
              className="w-full p-3 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
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
              placeholder="password"
              value={values.password}
              onChange={(ev) =>
                setValues({ ...values, password: ev.target.value })
              }
              className="w-full p-3 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-800 text-white py-3 rounded-md font-semibold hover:bg-blue-900 transition duration-300"
          >
            Register
          </button>
          <div className="text-center py-2 text-gray-600">
            Already a member?{" "}
            <Link
              className="underline text-blue-800 hover:text-blue-900 font-semibold"
              to={"/login"}
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
