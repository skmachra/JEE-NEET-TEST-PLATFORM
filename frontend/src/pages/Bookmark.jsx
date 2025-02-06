import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMessage } from "../components/Message";

const BookmarkPage = () => {
  const showMessage = useMessage(); // Use the message hook to display messages
  const [bookmarks, setBookmarks] = useState([]); // All bookmarks
  const [filteredBookmarks, setFilteredBookmarks] = useState([]); // Bookmarks after filtering by tag
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(""); // State for selected tag
  const [tags, setTags] = useState([]); // To store unique tags

  // Fetch bookmarks on component mount
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await axios.get("/api/v1/users/bookmarks", {
          withCredentials: true,
        });

        const bookmarksData = response.data.bookmarks;
        setBookmarks(bookmarksData); // Save all bookmarks
        setFilteredBookmarks(bookmarksData); // Initially display all bookmarks

        // Extract unique tags from the bookmarks
        const uniqueTags = [...new Set(bookmarksData.map((bookmark) => bookmark.tag))];
        setTags(uniqueTags); // Set the unique tags in the state
        setLoading(false);
      } catch (error) {
        showMessage(error.response?.data?.message || "Failed to fetch bookmarks", "error");
      }
    };
    fetchBookmarks();
  }, []);

  // Handle removing a bookmark
  const removeBookmark = async (questionId) => {
    try {
      await axios.post(
        "/api/users/bookmarks/remove",
        { questionId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the UI by filtering out the removed bookmark
      setBookmarks((prevBookmarks) =>
        prevBookmarks.filter((bookmark) => bookmark?.question._id !== questionId)
      );
      setFilteredBookmarks((prevBookmarks) =>
        prevBookmarks.filter((bookmark) => bookmark?.question._id !== questionId)
      );
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to remove bookmark", "error");
    }
  };

  // Filter bookmarks based on the selected tag
  const filterByTag = (tag) => {
    setSelectedTag(tag);
    if (tag === "") {
      setFilteredBookmarks(bookmarks); // Show all if "All" is selected
    } else {
      setFilteredBookmarks(bookmarks.filter((bookmark) => bookmark.tag === tag));
    }
  };

  if (loading) {
    return <div>Loading bookmarks...</div>;
  }

  if (filteredBookmarks.length === 0) {
    return <div>No bookmarks found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Your Bookmarks</h1>

      {/* Dropdown for tag filtering */}
      <div className="mb-4">
        <label htmlFor="tagFilter" className="block text-lg font-semibold mb-2">
          Filter by Tag
        </label>
        <select
          id="tagFilter"
          value={selectedTag}
          onChange={(e) => filterByTag(e.target.value)} // Filter on change
          className="border border-gray-300 p-2 rounded-lg w-full"
        >
          <option value="">All</option> {/* Show all by default */}
          {tags.map((tag, index) => (
            <option key={index} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filteredBookmarks.map((bookmark) => (
          <div
            key={bookmark._id}
            className="p-4 border border-gray-300 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="text-lg font-semibold">{bookmark?.question?.question}</p>
              <p className="text-sm text-gray-600">{bookmark?.question?.subject}</p>
              <p className="text-sm text-gray-500">{bookmark?.tag}</p>

              {/* Display the answer based on question type */}
              <div className="mt-2">
                {bookmark?.question?.type === "Numerical" ? (
                  <p className="text-sm text-gray-700">
                    Correct Answer: {bookmark?.question.correctValue}
                  </p>
                ) : bookmark?.question?.type === "Single Correct" || bookmark?.question?.type === "Multiple Correct" ? (
                  <div>
                    {bookmark?.question.options
                      .filter(option => {
                        return option.isCorrect; // Filter out options that are marked as correct
                      })
                      .map((option, index) => (
                        <p key={index} className="text-sm text-gray-700">
                          Correct Option: {option.option}
                        </p>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">Answer not available</p>
                )}
              </div>

            </div>

            <button
              onClick={() => removeBookmark(bookmark?.question._id)}
              className="ml-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>

  );
};

export default BookmarkPage;
