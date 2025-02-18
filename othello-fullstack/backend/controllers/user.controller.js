import asyncHandler from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { apiResponse } from '../utils/apiResponse.js';
import { sendEmail } from '../helpers/sendEmail.js';
import { nanoid } from 'nanoid';
import { VERIFICATIONTOKENEXPIRYTIME } from '../constants.js';
import bcrypt from 'bcrypt';
import { registerUserRedirectUri } from '../helpers/oAuth.helper.js';
import { AuthorizationCode } from 'simple-oauth2';
import { GoogleClient } from '../oauth.secrets.js';
import { deleteOnCloudinary, uploadOnCloudinary } from '../services/cloudinary.service.js';
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
        const verificationTokenExpiryDate=Date.now()+VERIFICATIONTOKENEXPIRYTIME*1000;
        const user=await User.create({
            username,
            email,
            password,
            verificationToken,
            verificationTokenExpiryDate
        });
       
        const createdUser=await User.findById(user._id).select(
            "-password -refreshToken "
        );
        if(!createdUser){
            throw new apiError(500,"User not created something went wrong while registering the user")
        }
        await sendEmail(createdUser.email, "verify", {
            username: createdUser.username,
            token: createdUser.verificationToken
        });
        const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user);
        const options={
            httpOnly:true,
            secure:true
        }
       return res.status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",refreshToken,options)
       .json(new apiResponse(200,createdUser,"User registered successfully"))
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
        const user = await User.findOne({ refreshToken:oldRefreshToken });
        if (!user) {
            throw new apiError(401, "Unauthorized request user not found")
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
    const user=await User.findOne({verificationToken:token}).select(
        "-password -refreshToken"
    );    
    if(!user){
        throw new apiError(404,"User not found")
    }
    if(user.verificationTokenExpiryDate<Date.now()){
        throw new apiError(400,"Verification token expired")
    }
    else{
    user.isVerified=true;
    user.verificationToken=undefined;
    user.verificationTokenExpiryDate=undefined;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new apiResponse(200,{},"User verified successfully"))
    }
})
const forgotPassword=asyncHandler(async(req,res)=>{
    const user=await User.findById(
        req.user._id
    ).select("-password -refreshToken -verificationToken -verificationTokenExpiryDate");
    if(!user){
        throw new apiError(404,"User not found")
    }
    const verificationToken=nanoid(10);
    user.verificationToken=verificationToken;
    user.verificationTokenExpiryDate=Date.now()+VERIFICATIONTOKENEXPIRYTIME*1000;
    await user.save({validateBeforeSave:false});
    await sendEmail(user.email, "forgotPassword", {
        username: user.username,
        token: user.verificationToken
    });
    return res.status(200).json(new apiResponse(200,{}, "Password reset link sent to your email"))
})
const changePassword=asyncHandler(async(req,res)=>{
    const {verificationToken,newPassword,oldPassword}=req.body;
    if(!verificationToken){
        throw new apiError(400,"Verification token is required")
    }
    const user=await User.findOne({verificationToken:verificationToken});
    if(!user){
        throw new apiError(404,"User not found")
    }
    if(user.verificationTokenExpiryDate<Date.now()){
        throw new apiError(400,"Verification token expired")
    }
    if(!bcrypt.compareSync(oldPassword,user.password)){
        throw new apiError(400,"Old password is incorrect")
    }
    user.password=newPassword;
    user.verificationToken=undefined;
    user.verificationTokenExpiryDate=undefined;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new apiResponse(200,user,"Password changed successfully"))
})
const resendVerificationToken=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id).select("-password -refreshToken ");
    if(!user){
        throw new apiError(404,"User not found")
    }
    if(verificationToken==undefined){
        throw new apiError(400,"cannot find verification token to resend")
    }
    if(user.isVerified){
        throw new apiError(400,"User is already verified")
    }
    const verificationToken=nanoid(10);
    user.verificationToken=verificationToken;
    user.verificationTokenExpiryDate=Date.now()+VERIFICATIONTOKENEXPIRYTIME*1000;
    await user.save({validateBeforeSave:false});
    await sendEmail(user.email, "verify", {
        username: user.username,
        token: user.verificationToken
    });
    return res.status(200).json(new apiResponse(200,{}, "Verification token sent to your email"))
})
const changeEmail=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id).select("-password -refreshToken ");
    if(!user){
        throw new apiError(404,"User not found")
    }
    const verificationToken=nanoid(10);
    user.verificationToken=verificationToken;
    user.verificationTokenExpiryDate=Date.now()+VERIFICATIONTOKENEXPIRYTIME*1000;
    await user.save({validateBeforeSave:false});
    await sendEmail(user.email, "emailChangeVerification", {
        username: user.username,
        token: user.verificationToken
    });
    return res.status(200).json(new apiResponse(200,{}, "Email change link sent to your email"))
})
const updateEmail=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id).select("-password -refreshToken ");
    if(!user){
        throw new apiError(404,"User not found")
    }
    if(user.verificationTokenExpiryDate<Date.now()){
        throw new apiError(400,"Verification token expired")
    }
    else{
        const oldEmail=user.email;
    user.email=req.body.email;
    user.verificationToken=undefined;
    user.verificationTokenExpiryDate=undefined;
    await user.save({validateBeforeSave:false});
    await sendEmail(oldEmail, "emailChange", {
        username: user.username,
        email:user.email
    });
    return res.status(200).json(new apiResponse(200,user,"Email updated successfully"))
    }
})
const forgotUserName=asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken -verificationToken -verificationTokenExpiryDate");
    if (!user) {
        throw new apiError(404, "User not found")
    }
    if(user.email===req.body.email){
        return res.status(200).json(new apiResponse(200,user.username, "username found successfully"))
    }
    else{
        throw new apiError(404,"Email not found")
    }
})
const forgotEmail=asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken -verificationToken -verificationTokenExpiryDate");
    if (!user) {
        throw new apiError(404, "User not found")
    }
    if(user.username===req.body.username){
        return res.status(200).json(new apiResponse(200,user.email, "email found successfully"))
    }
    else{
        throw new apiError(404,"Username not found")
    }
})
const changeUserName=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id).select("-password -refreshToken ");
    if(!user){
        throw new apiError(404,"User not found")
    }
    const userWithSameUsername=await User.findOne({username:req.body.username});
    if(userWithSameUsername){
        throw new apiError(400,"Username already exists")
    }
    else{
        user.username=req.body.username;
        await user.save({validateBeforeSave:false});
        return res.status(200).json(new apiResponse(200,user,"Username updated successfully"))
    }
})
const updateAvatar=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id).select("-password -refreshToken ");
    if(!user){
        throw new apiError(404,"User not found")
    }
    const oldAvatarUrl=user.avatar;
    const avatarLocalFilePath=req.file?.path;
    if(!avatarLocalFilePath){
        throw new apiError(400,"Avatar is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalFilePath)
    if(!avatar.url){
        throw new apiError(500,"Failed to upload avatar to cloudinary")
    }
    user.avatar=avatar.url;
    await user.save({validateBeforeSave:false});
    await deleteOnCloudinary(oldAvatarUrl);
    return res.status(200).json(new apiResponse(200,user,"Avatar updated successfully"))
})
//o-auth controllers
const registerOauthUser=asyncHandler(async(req,res)=>{
    const redirectUri=registerUserRedirectUri(req.query.provider)
    if(redirectUri==undefined){
        throw new apiError(400,"Invalid provider")
    }
res.redirect(redirectUri)
})
const handleOauthCallback = async (req, res) => {
    const { code } = req.query;
  
    if (code) {
        try {
            const tokenParams = {
                code: code,
                redirect_uri: "http://localhost:3000/api/v1/users/auth/oauth/callback",
            };
            console.log("Received code:", code);
  
            // Ensure the 'client' is properly initialized
            const client = new AuthorizationCode(GoogleClient);
  
            // Attempt to retrieve the access token
            const accessToken = await client.getToken(tokenParams);
  
            // Log the access token for debugging
            console.log("Access token:", accessToken.token);
  
            if (accessToken.token) {
                // Send back the token or do something with it, like saving it to a session
                res.json(accessToken.token);
  
                // Optionally, redirect the user after successful authentication
                res.redirect("http://localhost:3000/");
            } else {
                throw new Error('Token not returned from Google API');
            }
        } catch (error) {
            console.error("Error during token retrieval:", error); // Log full error for debugging
            res.status(500).json({ message: 'Authentication failed', error: error.message });
        }
    } else {
        console.log("No authorization code provided");
        res.status(400).json('Authorization code not provided');
    }
  }//TODO:fix this error 
export {
    registerUser,
    registerOauthUser,
    loginUser,
    logoutUser,
    generateNewTokens,
    verifyUser,
    forgotPassword,
    changePassword,
    resendVerificationToken,
    changeEmail,
    updateEmail,
    forgotUserName,
    forgotEmail,
    changeUserName,
    updateAvatar,
    handleOauthCallback
}