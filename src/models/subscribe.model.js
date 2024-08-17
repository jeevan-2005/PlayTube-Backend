import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // the one who subscribe
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // the one who is subscribed by the subscriber
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);