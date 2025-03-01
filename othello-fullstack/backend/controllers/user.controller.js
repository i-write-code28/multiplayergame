import asyncHandler from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { apiResponse } from '../utils/apiResponse.js';
import { sendEmail } from '../helpers/sendEmail.js';
import { nanoid } from 'nanoid';
import { APPURL, VERIFICATIONTOKENEXPIRYTIME } from '../constants.js';
import bcrypt from 'bcrypt';
import { registerUserRedirectUri } from '../helpers/oAuth.helper.js';
import { AuthorizationCode } from 'simple-oauth2';
import { GoogleClient, GithubClient, SpotifyClient } from '../oauth.secrets.js';
import { deleteOnCloudinary, uploadOnCloudinary } from '../services/cloudinary.service.js';
import { generateRegistrationOptions,verifyRegistrationResponse, generateAuthenticationOptions,verifyAuthenticationResponse } from "@simplewebauthn/server";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
if (!globalThis.crypto) {
    globalThis.crypto = crypto;
}
const cookieOptions={
    httpOnly:true,
    secure:true,
    sameSite:'strict'
}
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
       const avatar=await uploadOnCloudinary(`https://ui-avatars.com/api/?name=${username.replace(' ','+')}&background=random&rounded=true&format=png&size=128`)
      
        const user=await User.create({
            username,
            email,
            password,
            verificationToken,
            verificationTokenExpiryDate,
            avatar:avatar.url,
            
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
       return res.status(200)
       .cookie("accessToken",accessToken,cookieOptions)
       .cookie("refreshToken",refreshToken,cookieOptions)
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
       
        await user.save({validateBeforeSave:false});
       if(!user.TwoFAEnabled){
        const logginedUser=await User.findById(user._id).select("-password -refreshToken");
        if(!logginedUser){
            throw new apiError(500,"Failed to login the user")
        }
        
        return res.status(200)
        .cookie("accessToken",accessToken,cookieOptions)
        .cookie("refreshToken",refreshToken,cookieOptions)
        .json(new apiResponse(200,{user:logginedUser,accessToken,refreshToken},"User logged in successfully"))
    }
    else{
        const opts = await generateAuthenticationOptions({
            rpID: 'localhost',
        })
        user.TwoFAchallenge=opts.challenge;
        await user.save({validateBeforeSave:false});
        
        return res
        .cookie("user",user._id,cookieOptions) 
        .json(new apiResponse(200,{challenge:opts},"User logged in successfully but pending 2FA"))
    }
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
const updateAvatar=asyncHandler(async(req,res)=>{callback
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
const handleGoogleOauthCallback = async (req, res) => {
    const { code } = req.query;
  
    if (code) {
        try {
            const tokenParams = {
                code: code,
                redirect_uri: "http://localhost:3000/api/v1/users/auth/oauth/google/callback",
            };
            
  
            // Ensure the 'client' is properly initialized
            const client = new AuthorizationCode(GoogleClient);
  
            const accessToken = await client.getToken(tokenParams);
  
            if (accessToken.token) {
                const userData=await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken.token.access_token}`);
                const userFromGoogle=await userData.json();
                const existingUser=await User.findOne({email:userFromGoogle.email});
                if(existingUser){
                    if(!existingUser.oauth.providers.providerName==="google"||existingUser.oauth.providers.providerName===null){
                    existingUser.oauth.providers.providerName="google";
                    existingUser.oauth.providers.sub=userFromGoogle.sub;
                    await existingUser.save({validateBeforeSave:false});
                    }
                    const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(existingUser);
                  
                    res.cookie('accessToken',accessToken,cookieOptions)
                    .cookie('refreshToken',refreshToken,cookieOptions)
                    .json(new apiResponse(200,existingUser,"User logged in successfully"));
                    
                }
                else{
                    const user=await User.create({
                    username:userFromGoogle.name,
                    email:userFromGoogle.email,
                    avatar:userFromGoogle.picture,
                    isVerified:userFromGoogle.email_verified,
                    oauth:{
                        providers:{
                            providerName:"google",
                            sub:userFromGoogle.sub
                        }
                    },
                    password:123456,
                    verificationToken:null,
                    verificationTokenExpiryDate:null
                    });
                    const createdUser=await User.findByIdAndUpdate(user._id,{
                        $unset:{
                            password:1,
                        }
                    }).select('-password -refreshToken');
                    if(!createdUser){
                        throw new apiError(500,"User not created something went wrong while registering the user")
                    }
                    
                    const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user);
                   
                    return res.status(200)
                    .cookie("accessToken",accessToken,cookieOptions)
                    .cookie("refreshToken",refreshToken,cookieOptions)
                    .json(new apiResponse(200,createdUser,"User registered successfully"))
                }
            } else {
                throw new Error('Token not returned from Google API');
            }
        } catch (error) {
            console.error("Error during token retrieval:", error); 
            res.status(500).json({ message: 'Authentication failed', error: error.message });
        }
    } else {
        console.log("No authorization code provided");
        res.status(400).json('Authorization code not provided');
    }
  }
const handleGithubOauthCallback = async (req, res) => {
    const { code } = req.query;
  
    if (code) {
        try {
            const tokenParams = {
                code: code,
                redirect_uri: "http://localhost:3000/api/v1/users/auth/oauth/github/callback",
            }; 
            const client = new AuthorizationCode(GithubClient);
  
            const accessToken = await client.getToken(tokenParams);
            if (accessToken.token) {
                const userData = await fetch('https://api.github.com/user', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken.token.access_token}`
                    }
                });
                const userEmailData=await fetch('https://api.github.com/user/emails',{
                    method:'GET',
                    headers:{
                        'Authorization':`Bearer ${accessToken.token.access_token}`
                    }
                })
                const userFromGithub=await userData.json();
                const userFromGithubEmails=await userEmailData.json();
                console.log(userFromGithub);
                console.log(userFromGithubEmails);
                
                
                const existingUser=await User.findOne({email:userFromGithubEmails[0].email});
                if(existingUser){
                    if(!existingUser.oauth.providers.providerName==="github"||existingUser.oauth.providers.providerName===null){
                    existingUser.oauth.providers.providerName="github";
                    existingUser.oauth.providers.sub=userFromGithub.id;
                    await existingUser.save({validateBeforeSave:false});
                    }
                    const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(existingUser);
                   
                    res.cookie('accessToken',accessToken,cookieOptions)
                    .cookie('refreshToken',refreshToken,cookieOptions)    
                    .json(new apiResponse(200,existingUser,"User logged in successfully"));
                }
                else{
                    const user=await User.create({
                    username:userFromGithub.login,
                    email:userFromGithubEmails[0].email,
                    avatar:userFromGithub.avatar_url,
                    isVerified:userFromGithubEmails[0].verified,
                    oauth:{
                        providers:{
                            providerName:"github",
                            sub:userFromGithub.id
                        }
                    },
                    password:123456,
                    verificationToken:null,
                    verificationTokenExpiryDate:null
                    });
                    const createdUser=await User.findByIdAndUpdate(user._id,{
                        $unset:{
                            password:1,
                        }
                    }).select('-password -refreshToken');
                    if(!createdUser){
                        throw new apiError(500,"User not created something went wrong while registering the user")
                    }
                    
                    const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user);
                   
                    return res.status(200)
                    .cookie("accessToken",accessToken,cookieOptions)
                    .cookie("refreshToken",refreshToken,cookieOptions)
                    .json(new apiResponse(200,createdUser,"User registered successfully"))

                } 
            }else {
                throw new Error('Token not returned from Github API');
            }
        } catch (error) {
            console.error("Error during token retrieval:", error); // Log full error for debugging
            res.status(500).json({ message: 'Authentication failed', error: error.message });
        }
    } else {
        console.log("No authorization code provided");
        res.status(400).json('Authorization code not provided');
    }
  }
const handleSpotifyOauthCallback = async (req, res) => {
    const { code } = req.query;
  console.log(code)
    if (code) {
        try {
            const tokenParams = {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: "http://localhost:3000/api/v1/users/auth/oauth/spotify/callback",
            }; 
            const client = new AuthorizationCode(SpotifyClient);
  
            const accessToken = await client.getToken(tokenParams);
            console.log(accessToken)
            if (accessToken.token) {
                const userData = await fetch('https://api.spotify.com/v1/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken.token.access_token}`
                    }
                });
                
                const userFromSpotify=await userData.json();
                console.log(userFromSpotify);
                const existingUser=await User.findOne({email:userFromSpotify.email});
                if(existingUser){
                    if(!existingUser.oauth.providers.providerName==="spotify"||existingUser.oauth.providers.providerName===null){
                    existingUser.oauth.providers.providerName="github";
                    existingUser.oauth.providers.sub=userFromSpotify.id;
                    await existingUser.save({validateBeforeSave:false});
                    }
                    const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(existingUser);
                   
                    res.cookie('accessToken',accessToken,cookieOptions)
                    .cookie('refreshToken',refreshToken,cookieOptions)    
                    .json(new apiResponse(200,existingUser,"User logged in successfully"));
                }
                else{
                    let avatarUrl;
                    if(userFromSpotify.images[0]?.url){
                        avatarUrl=userFromSpotify.images[0].url;
                    }
                    else{
                         const avatar=await uploadOnCloudinary(`https://ui-avatars.com/api/?name=${userFromSpotify.display_name.replace(' ','+')}&background=random&rounded=true&format=png&size=128`)
                         avatarUrl=avatar.url;
                    }
                    const verificationToken=nanoid(10);
        const verificationTokenExpiryDate=Date.now()+VERIFICATIONTOKENEXPIRYTIME*1000;
                    const user=await User.create({
                    username:userFromSpotify.display_name,
                    email:userFromSpotify.email,
                    avatar:avatarUrl,
                    oauth:{
                        providers:{
                            providerName:"spotify",
                            sub:userFromSpotify.id
                        }
                    },
                    password:123456,
                    verificationToken,
                    verificationTokenExpiryDate
                    });
                    const createdUser=await User.findByIdAndUpdate(user._id,{
                        $unset:{
                            password:1,
                        }
                    }).select('-password -refreshToken');
                    if(!createdUser){
                        throw new apiError(500,"User not created something went wrong while registering the user")
                    }
                    await sendEmail(createdUser.email, "verify", {
                        username: createdUser.username,
                        token: createdUser.verificationToken
                    });
                    const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user);
                  
                    return res.status(200)
                    .cookie("accessToken",accessToken,cookieOptions)
                    .cookie("refreshToken",refreshToken,cookieOptions)
                    .json(new apiResponse(200,createdUser,"User registered successfully"))

                } 
            }else {
                throw new Error('Token not returned from Spotify API');
            }
        } catch (error) {
            console.error("Error during token retrieval:", error); // Log full error for debugging
            res.status(500).json({ message: 'Authentication failed', error: error.message });
        }
    } else {
        console.log("No authorization code provided");
        res.status(400).json('Authorization code not provided');
    }
  }
//web-authn controllers
const initialize2FA=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id).select("-password -refreshToken -verificationToken -verificationTokenExpiryDate");
    if(!user){
        throw new apiError(404,"User not found")
    }
    const challengePayload=await generateRegistrationOptions({
        rpID:"localhost",
        rpName:APPNAME,
        attestationType:"none",
        userName:user.username,
        timeout:60000,
        extensions:{
            credProps:true,
            uvi:true
        }
    })
    user.TwoFAchallenge=challengePayload.challenge;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new apiResponse(200,user,"2FA initialized successfully"))
})
const verify2FA=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id).select("-password -refreshToken -verificationToken -verificationTokenExpiryDate");
    if(!user){
        throw new apiError(404,"User not found")
    }
    const {verificationToken}=req.body;
    if(!verificationToken){
        throw new apiError(400,"Verification token is required")
    }
    if(user.TwoFAverified){
        throw new apiError(400,"User is already verified")
    }
    if(user.TwoFAchallenge===null){
        throw new apiError(400,"2FA not initialized")
    }
    const verificationResult = await verifyRegistrationResponse({
        expectedChallenge: challenge,
        expectedOrigin: APPURL,
        expectedRPID: 'localhost',
        response: verificationToken,
    })
    if (!verificationResult.verified) {
        throw new apiError(400,"Verification failed")
    }
    user.PassKey = verificationResult.registrationInfo
    user.TwoFAEnabled=true;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new apiResponse(200,user,"2FA verified successfully"))
})
const verify2FALogin=asyncHandler(async(req,res)=>{
    const userID=req.cookies.user;
    const user=await User.findById(userID).select("-password -refreshToken -verificationToken -verificationTokenExpiryDate");
    if(!user){
        throw new apiError(404,"User not found")
    }
    const {verificationToken}=req.body;
    if(!verificationToken){
        throw new apiError(400,"Verification token is required")
    }
    if(user.TwoFAchallenge===null){
        throw new apiError(400,"2FA challenge not found")
    }
    
    const result = await verifyAuthenticationResponse({
        expectedChallenge: challenge,
        expectedOrigin: 'http://localhost:3000',
        expectedRPID: 'localhost',
        response: cred,
        authenticator: user.passkey
    })
    if (!result.verified) {
        throw new apiError(400,"Verification failed")
    }
        user.TwoFAverified=true;
        await user.save({validateBeforeSave:false});
        const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user);
        
        return res
        .clearCookie("user")
        .cookie("accessToken",accessToken,cookieOptions)
        .cookie("refreshToken",refreshToken,cookieOptions)    
        .json(new apiResponse(200,user,"User logged in successfully"))
});//TODO:test 2fa
//csrf token controllers
// const getCsrfToken=asyncHandler(async(req,res)=>{
//    const csrfToken=bcrypt.hash(process.env.CSRFTOKEN,20);
//    const saltedCsrfToken=jwt.sign(
//         {
//             csrfToken
//         },
//         process.env.CSRFTOKEN_SECRET
//     )
//     return res.status(200).json(new apiResponse(200,saltedCsrfToken,"Csrf token generated successfully"))
// }) TODO:fix this later 

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
    handleGoogleOauthCallback,
    handleGithubOauthCallback,
    handleSpotifyOauthCallback,
    initialize2FA,
    verify2FA,
    verify2FALogin,
    // getCsrfToken
}