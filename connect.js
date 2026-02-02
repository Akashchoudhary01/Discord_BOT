import mongoose from "mongoose";

export const ConnectToDb = (LINK) =>{
    return mongoose.connect(LINK)
}