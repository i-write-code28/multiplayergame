import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema({
    username: {
         type: String, 
         required: true, 
         unique: true ,
         trim: true,
         lowercase:true,
         index:true,
         minlength:3,
        },
    email: { 
        type: String,
         required: true,
          unique: true,
            trim: true,
            lowercase:true,
        },
        avatar:{
            type:String,

        },
    password: {
         type: String,
          required: true 
        },
    rating: { 
        type: Number,
        default: 1000 
        },
    level: { 
        type: Number, 
        default: 1 
    },
    gamesPlayed: {
         type: Number,
          default: 0 
        },
    gamesWon: { 
        type: Number, 
        default: 0 
    },
    gamesLost: {
         type: Number, 
         default: 0 
        },
    gamesDrawn: {
         type: Number,
          default: 0 
        },
    gameHistory: [
        {
             type: Schema.Types.ObjectId, 
             ref: 'Game' 
        }
    ], 
    refreshToken:{
        type:String
    },
    verificationToken:{
        type:String,
        default:null,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true

});
userSchema.pre("save", async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,20)
    next()
})
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken =  function(){
return jwt.sign(
    {
        _id:this._id,
        email:this.email,
        username:this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)

}
userSchema.methods.generateRefreshToken =function(){
  return  jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User=mongoose.model('User',userSchema);