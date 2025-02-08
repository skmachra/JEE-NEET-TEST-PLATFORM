import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TestPage = () => {
    const [tests, setTests] = useState(null);
    const [test, setTest] = useState({})
    const [showPopup, setShowPopup] = useState(false);
    const [isRead, setIsRead] = useState(false); // Track checkbox state
    const [upcomingTests, setUpcomingTests] = useState(null);
    const navigate = useNavigate()

    // Mock test data


    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_API_URL+'/api/v1/tests');
                setTests(response.data);
            } catch (error) {
                console.log(error);
            }
        })();
        (async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_API_URL+'/api/v1/tests/upcoming');
                setUpcomingTests(response.data);
            } catch (error) {
                console.log(error);
            }
        })()
    }, []);

    return (<>
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-6">Available Tests</h1>
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
                        <button
                            type="button"
                            onClick={() => {
                                // window.location.href = `/test/${test?._id}`;
                                setShowPopup(true);
                                setTest(test);
                            }}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150">
                            Start Test
                        </button>
                    </div>
                ))}
            </div>
            <h1 className="text-3xl font-bold text-center my-6">Upcoming Tests</h1>
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
                            <strong>Duration:</strong> {test?.duration}
                        </p>
                        <p className="text-gray-700">
                            <strong>Marks:</strong> {test?.totalMarks}
                        </p>
                        <p className="text-gray-700">
                            <strong>Category:</strong> {test?.testType}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                window.location.href = `/test/${test?._id}`;
                            }}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150">
                            Start Test
                        </button>
                    </div>
                ))}
            </div>
        </div>
        {showPopup && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setShowPopup(false)}
            ></div>
        )}

        {/* Popup */}
        {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl overflow-auto max-h-[80vh]">
                    {/* Popup Header */}
                    <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg">
                        <h2 className="text-lg font-semibold">Test Instructions</h2>
                    </div>

                    {/* Popup Content */}
                    <div className="p-6 text-sm text-gray-700 space-y-4">
                        <p>
                            <strong>Please read the instructions carefully:</strong>
                        </p>
                        <p>
                            Total duration of {test?.title} is {test?.duration} min. The countdown
                            timer in the top right corner of the screen will display the
                            remaining time available for you to complete the examination.
                            When the timer reaches zero, the examination will end by
                            itself. You will not be required to end or submit your
                            examination.
                        </p>
                        <p>
                            <strong>Symbols:</strong>
                        </p>
                        <ul className="">
                            <li className="flex items-center"><div className="p-1 m-2 border h-[40px] w-[40px] bg-[#E3E3E3] rounded"></div>You have not visited the question yet.</li>
                            <li className="flex items-center"><div className="p-1 m-2 border h-[40px] w-[40px] bg-[#E24401] text-white costom-clip"> </div>You have not answered the question.</li>
                            <li className="flex items-center"><div className="p-1 m-2 border h-[40px] w-[40px] bg-[#2EB800] costom-clip text-white"> </div>You have answered the question.</li>
                            <li className="flex items-center"><div className="p-1 m-2 border h-[40px] w-[40px] bg-[#5B2CA5] rounded-full text-white"> </div>
                                You have NOT answered the question, but have marked the
                                question for review.
                            </li>
                            <li className="flex items-center"><div className="p-1 m-2 border h-[40px] w-[40px] bg-[#5B2CA5] rounded-full relative text-white"> <div className="absolute w-[14px] h-[14px] right-[3px] top-[21px] rounded-full bg-[#18FF00] ">&nbsp;''</div></div>
                                The question(s) "Answered and Marked for Review" will be
                                considered for evaluation.
                            </li>
                        </ul>
                        <p>
                            Navigating and answering questions can be done using the
                            question palette on the right side of the screen or the buttons
                            below the questions.
                        </p>
                        {/* Checkbox */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="readInstructions"
                                checked={isRead}
                                onChange={(e) => setIsRead(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor="readInstructions" className="text-gray-700">
                                I have read and understood the instructions. All computer
                                hardware allotted to me are in proper working condition. I
                                declare that I am not in possession of any prohibited items.
                            </label>
                        </div>
                    </div>

                    {/* Popup Footer */}
                    <div className="flex justify-end p-4 space-x-4 border-t border-gray-200">
                        <button
                            onClick={() => {
                                setShowPopup(false);
                                setIsRead(false);
                                setTest(null);
                            }}
                            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                setShowPopup(false);
                                setIsRead(false);
                                setTest(null);
                                navigate(`/test/${test?._id}`)
                            }}
                            className={`px-4 py-2 rounded-lg ${isRead
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                }`}
                            disabled={!isRead}
                        >
                            Start Test
                        </button>
                    </div>
                </div>
            </div>
        )}

    </>
    );
};

export default TestPage;
