import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useMessage } from "../components/Message";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Register = () => {
    const showMessage = useMessage();
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await axios.post(
                "/api/v1/users/google-auth",
                { credential: credentialResponse.credential },
                { withCredentials: true }
            );
            
            showMessage("success", "Registration successful!");
            window.location.href = "/";
        } catch (err) {
            showMessage("error", err.response?.data?.message || "Google registration failed");
        }
    };

    const handleGoogleError = () => {
        showMessage("error", "Google registration failed");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/v1/users/register", formData);
            showMessage("success", "Registration successful. Please login to continue.");
            window.location.href = "/login";
        } catch (error) {
            showMessage("error", error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <GoogleOAuthProvider clientId="298618191060-ameg1trjr89u1ec7qg91tnsqqa3bl6l1.apps.googleusercontent.com">
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Register</h2>
                    
                    {/* Google Sign-Up Button */}
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            text="signup_with"
                            shape="rectangular"
                            size="large"
                            width="100%"
                        />
                    </div>
                    

                    {/* Divider */}
                    <div className="flex items-center mb-6">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-gray-500 text-sm">OR</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Existing Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* ... (keep existing form fields the same) ... */}
                         {/* Full Name */}
                    <div>
                        <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullname"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your full name"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                    </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Register with Email
                        </button>
                    </form>

                    {/* Already have an account */}
                    <p className="mt-4 text-sm text-center text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Register;