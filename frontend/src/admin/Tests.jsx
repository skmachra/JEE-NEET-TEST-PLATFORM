import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Tests = () => {
    const [tests, setTests] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [testToDelete, setTestToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const response = await axios.get('/api/v1/tests');
            setTests(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTest = async () => {
        try {
            await axios.delete(`/api/v1/admin/delete-test/${testToDelete}`, {
                withCredentials: true, // Ensures cookies are sent for authentication
            });
            setShowDeletePopup(false);
            setTestToDelete(null);
            fetchTests(); // Refresh the test list
        } catch (error) {
            console.error("Failed to delete test:", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-6">Manage Tests</h1>

            <div className="flex justify-between mb-4">
                <button
                    onClick={() => navigate('/admin/create-test')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150"
                >
                    Create New Test
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tests?.map((test) => (
                    <div
                        key={test?._id}
                        className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
                    >
                        <h2 className="text-xl font-semibold text-blue-600">
                            {test?.title}
                        </h2>
                        <p className="text-gray-700 mt-2">
                            <strong>Duration:</strong> {test?.duration} min
                        </p>
                        <p className="text-gray-700">
                            <strong>Marks:</strong> {test?.totalMarks}
                        </p>
                        <p className="text-gray-700">
                            <strong>Category:</strong> {test?.testType}
                        </p>
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => navigate(`/admin/update-test/${test?._id}`)}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-150"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => {
                                    setTestToDelete(test?._id);
                                    setShowDeletePopup(true);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Popup */}
            {showDeletePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Are you sure you want to delete this test?
                        </h2>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeletePopup(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTest}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tests;
