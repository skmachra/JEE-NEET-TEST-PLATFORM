import React, { useState } from "react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Placeholder for actual API call
        console.log("Reset link requested for:", email);
        setMessage("If the email exists, a password reset link will be sent.");
        setEmail("");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
                    Forgot Password
                </h2>
                <p className="text-sm text-gray-600 text-center mb-4">
                    Enter your email address below, and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Request Reset Link
                    </button>
                </form>

                {/* Message */}
                {message && (
                    <p className="mt-4 text-sm text-center text-green-600">{message}</p>
                )}

                {/* Links */}
                <div className="mt-4 text-sm text-center text-gray-600">
                    <p>
                        Remembered your password?{" "}
                        <a href="/login" className="text-blue-600 hover:underline">
                            Login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
