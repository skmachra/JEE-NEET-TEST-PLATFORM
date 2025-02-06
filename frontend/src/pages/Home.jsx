import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/Auth";

const HomePage = () => {
    const { isLoggedIn } = useAuth()
    if (isLoggedIn) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                {/* Main Content for Logged-In Users */}
                <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <h2 className="text-4xl font-extrabold text-blue-600 mb-6">
                        Welcome Back!
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-3xl">
                        Ready to continue your preparation? Pick up where you left off or start a new test now.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/dashboard"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-md"
                        >
                            Go to Dashboard
                        </Link>
                        <Link
                            to="/test"
                            className="px-6 py-3 bg-gray-200 text-blue-600 rounded-lg hover:bg-gray-300 shadow-md"
                        >
                            Start a New Test
                        </Link>
                    </div>

                </main>
            </div>
        );
    }

    // Content for Not Logged-In Users
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-between">

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center text-center px-6 mt-10">
                <h2 className="text-4xl font-extrabold text-blue-600 mb-6">
                    Ace Your JEE/NEET Exams!
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-3xl">
                    Prepare smarter with a realistic test interface, detailed performance analysis, and powerful tools to track your progress.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/login"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 shadow-md"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="px-6 py-3 bg-gray-200 text-blue-600 rounded-lg hover:bg-gray-300 shadow-md"
                        >
                            Register now
                        </Link>
                    </div>
            </main>

            <section className="w-full bg-white py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <h3 className="text-2xl font-bold text-center text-blue-600 mb-8">
                        Why Choose Us?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-gray-50 rounded-lg shadow">
                            <h4 className="text-xl font-semibold text-gray-800 mb-4">
                                Realistic Test Interface
                            </h4>
                            <p className="text-gray-600">
                                Experience a test environment that mimics the real JEE/NEET exams for better preparation.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-lg shadow">
                            <h4 className="text-xl font-semibold text-gray-800 mb-4">
                                Detailed Performance Analysis
                            </h4>
                            <p className="text-gray-600">
                                Get in-depth insights into your strengths and weaknesses to focus on improvement.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-lg shadow">
                            <h4 className="text-xl font-semibold text-gray-800 mb-4">
                                Track Your Progress
                            </h4>
                            <p className="text-gray-600">
                                Keep a history of your tests, bookmarks, and performance trends.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;
