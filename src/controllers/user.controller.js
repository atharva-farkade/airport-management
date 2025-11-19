import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandlers.js';
import {User} from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';



const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError("Token generation failed", 500);
  }
};



//  register user
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role, gender, number } = req.body;
  
// quick validation 
  if ([username, email, password].some((field) => !field?.trim())) {
    throw new ApiError("All required fields must be provided", 400);
  }

    // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existingUser) throw new ApiError("User already exists", 409);

  // Create user
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    role,
    gender,
    number,
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

//  login user
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError("Email/Username and Password are required", 400);
  }

  const user = await User.findOne({
    $or: [
      { email: username.toLowerCase() },
      { username: username.toLowerCase() },
    ],
  });

  if (!user) throw new ApiError("Invalid credentials", 401);

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError("Invalid credentials", 401);

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Login successful")
    );
});

// logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshToken: undefined },
  });

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

// refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError("Unauthorized request", 401);

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded?._id);

    if (!user) throw new ApiError("Invalid refresh token", 401);
    if (incomingRefreshToken !== user.refreshToken)
      throw new ApiError("Refresh token expired or invalid", 401);

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = { httpOnly: true, secure: true };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw new ApiError("Invalid refresh token", 401);
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };