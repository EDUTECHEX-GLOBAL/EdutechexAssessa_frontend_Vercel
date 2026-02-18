import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

const LoginForm = ({ onSwitch, onForgot }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string().required("Required"),
  });

    const handleSubmit = async (values, { setSubmitting }) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };

      console.log("📡 Sending school admin login request...");

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/school-admin/login`,
        values,
        config
      );

      console.log("✅ School Admin Login Response:", {
        token: data.token ? "Yes" : "No",
        _id: data._id,
        schoolName: data.schoolName,
        role: data.role,
        status: data.status,
        isAdminApproved: data.isAdminApproved
      });

      // Decode the token to see what's inside
      if (data.token) {
        try {
          const tokenParts = data.token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log("🔓 Decoded Token Payload:", payload);
          }
        } catch (decodeError) {
          console.error("❌ Could not decode token:", decodeError);
        }
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("schoolAdminInfo", JSON.stringify(data));
      setSuccess("School Admin logged in successfully!");

      navigate("/school-admin-dashboard");
    } catch (err) {
      console.error("❌ Login Error:", err.response?.data || err.message);
      const msg = err?.response?.data?.message;
      setError(msg || "Invalid school admin credentials");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        School Admin Login
      </h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="w-full max-w-md">
            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                School Admin Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 ml-1 text-gray-500" />
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter school admin email"
                  className="w-full p-3 pl-10 border border-teal-600 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <ErrorMessage
                name="email"
                component="p"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Password ✅ label added back */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                School Admin Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 ml-1 text-gray-500" />
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter school admin password"
                  className="w-full p-3 pl-10 pr-10 border border-teal-600 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-400"
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <ErrorMessage
                name="password"
                component="p"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-between items-center mb-6">
              <button
                type="button"
                className="text-teal-500 text-sm hover:underline"
                onClick={onForgot}
              >
                Forgot School Admin Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-teal-500 text-white p-3 rounded-lg font-bold hover:bg-teal-600 transition"
              disabled={isSubmitting || loading}
            >
              {loading ? "Logging in..." : "Login to School Dashboard"}
            </button>

            {/* Signup Switch */}
            <p className="text-sm text-gray-600 mt-4 text-center">
              New School?{" "}
              <button
                type="button"
                className="text-purple-500 font-bold hover:underline"
                onClick={onSwitch}
              >
                Register Your School
              </button>
            </p>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default LoginForm;
