import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/Auth";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState(""); // For error handling
    const [loading, setLoading] = useState(false); // For loading state
    const navigate = useNavigate(); // For navigation after successful login
    const {isLoggedIn, setIsLoggedIn, setUser} = useAuth()

    // Check if user is already logged in on page load
    useEffect(() => {        
        // Check if there's an access token or a user stored
        if (isLoggedIn){
            navigate("/"); // Redirect to dashboard if logged in
        }
    }, [navigate, isLoggedIn]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Reset error state
        setLoading(true); // Set loading to true

        try {
            // Make POST request to the backend login API
            const response = await axios.post(
                import.meta.env.VITE_API_URL+"/api/v1/users/login", // Replace with your actual backend URL
                formData,
                { withCredentials: true } // Ensures cookies are sent
            );

            // Assuming the backend returns tokens and user data
            setUser(response.data.data.user); // Store user data in the AuthContext
            setIsLoggedIn(true)

            // Redirect to the dashboard or another page
            navigate("/");

        } catch (err) {
            // If an error occurs, handle it here
            setError(err.response ? err.response.data.message : "Something went wrong");
        } finally {
            setLoading(false); // Reset loading state
        }
    };
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await axios.post(
                "https://jee-neet-test-platform-backend.vercel.app/api/v1/users/google-auth",
                { credential: credentialResponse.credential },
                { withCredentials: true }
            );
            
            setUser(response.data.data.user);
            setIsLoggedIn(true);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Google login failed");
        }
    };

    const handleGoogleError = () => {
        setError("Google login failed");
    };
    const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    return (
        <GoogleOAuthProvider clientId={googleId}>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login</h2>
            <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            text="continue_with"
                            shape="rectangular"
                            size="large"
                            width="100%"
                        />
                    </div>

                <div className="flex items-center mb-6">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-gray-500 text-sm">OR</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                {/* Display error message */}
                {error && <div className="bg-red-200 text-red-700 p-3 mb-4 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={loading} // Disable button during loading
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Links */}
                <div className="mt-4 text-sm text-center text-gray-600">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register" className="text-blue-600 hover:underline">
                            Register
                        </Link>
                    </p>
                    <p>
                        <Link to="/forgot-password" className="text-blue-600 hover:underline">
                            Forgot Password?
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </GoogleOAuthProvider>
    );
};

export default Login;
