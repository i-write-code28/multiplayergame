import asyncHandler from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { apiResponse } from '../utils/apiResponse.js';
import { sendEmail } from '../utils/sendEmail.js';
import { nanoid } from 'nanoid';
const generateAccessTokenAndRefreshToken =async(user) => {
    const accessToken=await user.generateAccessToken();
    const refreshToken=await user.generateRefreshToken();
    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken};
    }

const registerUser=asyncHandler(async(req,res)=>{
 const{username,email,password}=req.body;
if([username,email,password].some((field)=>field?.trim()===""))
{
    throw new apiError(400,"All fields are required")
}
else if(password===email||password===username){
    throw new apiError(400,"Password should not be same as username or email")
}
else{
    const existingUser=await User.findOne({$or:[{email},{username}]});
    console.log(existingUser)
    if(existingUser){
        if(existingUser.username===username && existingUser.isVerified==true){
            throw new apiError(409,"User Username already taken")
        }
        throw new apiError(409,"User email already exists")
    }
    else{
        const verificationToken=nanoid(10);
        const user=await User.create({
            username,
            email,
            password,
            verificationToken
        });
        console.log(user)
        const createdUser=await User.findById(user._id).select(
            "-password -refreshToken"
        );
        if(!createdUser){
            throw new apiError(500,"User not created something went wrong while registering the user")
        }
        await sendEmail(createdUser.email, "verify", {
            username: createdUser.username,
            token: createdUser.verificationToken
        });
        
       return res.status(201).json(new apiResponse(200,createdUser,"User registered successfully"))
    }
}
})
const loginUser=asyncHandler(async(req,res)=>{
    const{email,password}=req.body;
    if([email,password].some((field)=>field?.trim()===""))
    {
        throw new apiError(400,"All fields are required")
    }
    else{
        const user=await User.findOne({email});
        if(!user){
            throw new apiError(404,"User not found")
        }
        const isPasswordCorrect=await user.isPasswordCorrect(password);
        if(!isPasswordCorrect){
            throw new apiError(401,"Invalid credentials");
        }
        const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user);
       
        const logginedUser=await User.findById(user._id).select("-password -refreshToken");
        if(!logginedUser){
            throw new apiError(500,"Failed to login the user")
        }
        const options={
            httpOnly:true,
            secure:true
        }
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new apiResponse(200,{user:logginedUser,accessToken,refreshToken},"User logged in successfully"))
    }
    });
const logoutUser = asyncHandler(async(req, res) => {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1 
                }
            },
            {
                new: true
            }
        )
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User logged Out"))
    })
const generateNewTokens = asyncHandler(async(req, res) => {
        const oldRefreshToken = req.cookies.refreshToken|| req.body.refreshToken;
        if (!oldRefreshToken) {
            throw new apiError(401, "Unauthorized request")
        }
        const user = await User.findOne({ refreshToken });
        if (!user) {
            throw new apiError(401, "Unauthorized request")
        }
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user);
        const options = {
            httpOnly: true,
            secure: true
        }
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return res
        .status(200)        
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(200, { accessToken, refreshToken }, "Tokens generated successfully"))
        })
const verifyUser= asyncHandler(async(req,res)=>{
    const token=req.body.verificationToken;
    if(!token){
        throw new apiError(400,"Verification token is required")
    }
    const user=await User.findOne({verificationToken:token});    
    if(!user){
        throw new apiError(404,"User not found")
    }
    user.isVerified=true;
    user.verificationToken=undefined;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new apiResponse(200,user,"User verified successfully"))
})
export {
    registerUser,
    loginUser,
    logoutUser,
    generateNewTokens,
    verifyUser
}