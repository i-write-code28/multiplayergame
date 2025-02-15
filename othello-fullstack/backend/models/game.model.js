import mongoose ,{Schema}from 'mongoose';
const moveSchema=new Schema({
    player:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    move:{
        type:String,
        required:true
    },

});
const gameSchema = new Schema({
    players: [
        {
             type: Schema.Types.ObjectId,
              ref: 'User',
            required: true 
        }
    ],
    winner: {
         type: Schema.Types.ObjectId,
          ref: 'User', 
          default: null 
        }, 
    gameType: {
         type: String,
          enum: ['timed', 'untimed'],
           required: true
         },
    pointsExchanged: { 
        type: Number, 
        default: 0 
    },
    moves: [moveSchema],
    boardState: {
         type: String, 
         required: true 
        },
    status: {
         type: String, 
         enum: ['ongoing', 'completed', 'abandoned'], 
         default: 'ongoing'
         },
         views: {
             type: Number,
             default: 0
         }
},{
    timestamps: true
});

export const Game = mongoose.model('Game', gameSchema);

