import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const History = () => {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        (async () =>{
            try {
                 const response = await axios.get(import.meta.env.VITE_API_URL + "/api/v1/users/history",{
                     withCredentials: true,
                 })
                 setHistory(response.data.testHistory);
            } catch (error) {
                console.log(error);
                
            }
        })();
    }, []);
    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Test History</h1>
          {history.length === 0 ? (
            <p className="text-gray-600">No test history found.</p>
          ) : (
            <div className="space-y-4">
              {history?.map((test, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold">{test?.test?.title}</p>
                      <p className="text-gray-600">Score: {test.score}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/test/history/${test?.test?._id}`)}  
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      See Full Analysis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
};

export default History;