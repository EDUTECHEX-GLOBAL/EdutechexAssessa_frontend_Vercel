import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

const SignupForm = ({ onSwitch }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // ✅ Validation updated for School Admin
  const validationSchema = Yup.object({
    schoolName: Yup.string().required("School name is required"),
    city: Yup.string().required("City is required"),
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
  try {
    const { confirmPassword, ...formData } = values; // remove confirmPassword

    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/school-admin/register`,
      {
        ...formData,
        role: "schoolAdmin", // ✅ fixed role
      }
    );

    console.log("School Admin Signup Successful:", data);
    
    // Optional: Store schoolId if needed for future use
    if (data.schoolAdmin && data.schoolAdmin.schoolId) {
      console.log("Generated School ID:", data.schoolAdmin.schoolId);
      // You can store this in context or localStorage if needed
      // localStorage.setItem('pendingSchoolId', data.schoolAdmin.schoolId);
    }
    
    alert(
      "School registered successfully! Please wait for Super Admin approval."
    );
    onSwitch(); // Switch to login
  } catch (error) {
    console.error("Signup error:", error);
    setErrorMessage(
      error.response?.data?.message || "Signup failed. Try again."
    );
  }
  setSubmitting(false);
};
  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        Register Your School –{" "}
        <span className="text-purple-600">School Admin</span>
      </h2>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <Formik
        initialValues={{
          schoolName: "",
          city: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="w-full max-w-md">

            {/* ✅ School Name */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                School Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Field
                  type="text"
                  name="schoolName"
                  placeholder="Enter school name"
                  className="w-full p-3 pl-10 border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <ErrorMessage
                name="schoolName"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* ✅ City */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                City
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Field
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  className="w-full p-3 pl-10 border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <ErrorMessage
                name="city"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* ✅ Admin Email */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Admin Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter admin email"
                  className="w-full p-3 pl-10 border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* ✅ Password */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  className="w-full p-3 pl-10 pr-10 border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* ✅ Confirm Password */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Field
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="w-full p-3 pl-10 pr-10 border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* ✅ Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-500 text-white p-3 rounded-lg font-bold hover:bg-purple-600 transition"
            >
              {isSubmitting ? "Registering..." : "Register School"}
            </button>

            <p className="text-sm text-gray-600 mt-4 text-center">
              Already have a School Admin account?{" "}
              <button
                className="text-teal-500 font-bold hover:underline"
                onClick={onSwitch}
              >
                Login
              </button>
            </p>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default SignupForm;
