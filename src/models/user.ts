import mongoose, { Schema } from "mongoose";

export interface IUserSchmema extends Document {
  username: string;
  password: string;
}

export interface IUserChatSchema extends Document {
  username: String;
  character: String;
  messages: [{ role: String; content: String }];
}

const UserSchema = new Schema<IUserSchmema>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 5,
    maxlength: 20,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
});

const UserChatSchema = new Schema({
  username: { type: String, required: true },
  character: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String },
    },
  ],
});

export const User = mongoose.model<IUserSchmema>("User", UserSchema);
export const UserChat = mongoose.model<IUserChatSchema>(
  "UserChat",
  UserChatSchema
);
