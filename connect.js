import mongoose from "mongoose";

export const ConnectToDb = (URL) =>{
    return mongoose.connect(URL)
}