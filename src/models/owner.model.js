import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  companyName: {
    type: String
  },
  gstNumber: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  verified: {
    type: Boolean,
    default: false
  }
});


export default mongoose.model("Owner", ownerSchema);