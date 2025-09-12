import mongoose from "mongoose"


async function connectToMongoDb(url) {
  try {
    mongoose
      .connect(url)
      .then(console.log("Connected to the MongoDB Successfully"));
  } catch (e) {
    console.log(e);
  }
}

export  {connectToMongoDb }