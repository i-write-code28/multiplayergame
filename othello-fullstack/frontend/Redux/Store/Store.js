import {configureStore} from '@reduxjs/toolkit';
import  gameManagerReducer  from '../Reducers/gameManagerSlice';
export const store=configureStore({
    reducer:{
        gameManager: gameManagerReducer
    }
});