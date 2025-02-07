import { asynchandler } from "../utils/asynchndler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import axios from "axios";

const generateAccessAndRefereshToken = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating token");
  }
};
const registerUser = asynchandler(async (req, res) => {
  const { fullname, email, password } = req.body;

  if (
    [fullname, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, `All field are required`);
  }

  const existingUser = await User.findOne({ $or: [{ email }] });
  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const user = await User.create({
    fullname,
    email,
    password
  });

  const crtd = await User.findById(user._id).select("-password -refreshToken");
  if (!crtd) {
    throw new ApiError(500, "Failed to create user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, crtd, "User registered successfully"));
});


const googleAuth = asynchandler(async (req, res) => {
  const { credential } = req.body;

  try {
    // Verify Google token
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${credential}`
    );

    const { email, name, picture } = response.data;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        fullname: name,
        email,
        avatar: picture,
        provider: 'google',
        isVerified: true
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
      user._id
    );
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      domain: process.env.NODE_ENV === "production" ? ".vercel.app" : undefined, // undefined for localhost
    };
    // Set cookies
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged in successfully"
        )
      );

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid Google token'
    });
  }
});

const loginUser = asynchandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({
    $or: [{ email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPvalid = await user.isPasswordCorrect(password);
  if (!isPvalid) {
    throw new ApiError(401, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    // domain: process.env.NODE_ENV === "production" ? ".vercel.app" : undefined, // undefined for localhost
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1,
    }
  }, {
    new: true
  },);
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    domain: process.env.NODE_ENV === "production" ? ".vercel.app" : undefined, // undefined for localhost
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asynchandler(async (req, res) => {
  const incomingRToken = req.cookie?.refreshToken || req.body.refreshToken;
  if (!incomingRToken) {
    throw new ApiError(401, "Refresh token is required");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (user.refreshToken !== incomingRToken) {
      throw new ApiError(401, "Refresh token has expired");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      domain: process.env.NODE_ENV === "production" ? ".vercel.app" : undefined, // undefined for localhost
    };
    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
      user._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "User refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

const changeCurrentPassword = asynchandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = User.findById(req.user?._id);
  const isPcorrect = user.isPasswordCorrect(oldPassword);
  if (!isPcorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetail = asynchandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError(400, "Fullname and Email are required");
  }
  const user = await User.findByIdAndDelete(
    req.user?._id,
    {
      $set: {
        fullname,
        email: email.toLowerCase(),
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const getforgotPasswordlink = asynchandler(async (req, res) => {
  const { email, username } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
    user._id
  );
  return res.status(200).json(new ApiResponse(200, refreshToken, "Success"));
});

const forgotPassword = asynchandler(async (req, res) => {
  const { refreshToken } = req.params;
  const { password } = req.body;
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }
  try {
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    user.password = password;
    await user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password reset successfully"));
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

const addBookmark = asynchandler(async (req, res) => {
  try {
    const userId = req.user._id; // Assuming `req.user` contains the authenticated user's info
    const { questionId, tag } = req.body;

    if (!questionId) {
      return res.status(400).json({ message: "Question ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.bookmarks.includes(questionId)) {
      return res.status(400).json({ message: "Question already bookmarked" });
    }

    user.bookmarks.push({ question: questionId, tag: tag.trim().toLowerCase() });
    await user.save();
    res.status(200).json({ message: "Bookmark added successfully", bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const removeBookmark = asynchandler(async (req, res) => {
  try {
    const userId = req.user._id; // Assuming `req.user` contains the authenticated user's info
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({ message: "Question ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.bookmarks = user.bookmarks.filter((bookmark) => bookmark.question.toString() !== questionId);
    await user.save();
    res.status(200).json({ message: "Bookmark removed successfully", bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const getBookmark = asynchandler(async (req, res) => {
  try {
    const userId = req.user._id; // Assuming `req.user` contains the authenticated user's info
    const user = await User.findById(userId)
      .populate({
        path: 'bookmarks', // Populating the bookmarks field
        populate: {
          path: 'question', // Populating the referenced question

        },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return populated bookmarks
    res.status(200).json({ bookmarks: user.bookmarks });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetail,
  getforgotPasswordlink,
  forgotPassword,
  addBookmark,
  removeBookmark,
  getBookmark,
  googleAuth
};
