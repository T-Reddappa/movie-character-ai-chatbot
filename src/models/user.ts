import mongoose, { Schema } from "mongoose";

interface IUser extends Document {
  username: string;
  password: string;
  chats: mongoose.Types.ObjectId[];
}

interface ICharacter extends Document {
  name: string;
  description: string;
  image: string;
}

interface IMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}
interface IChat extends Document {
  user: mongoose.Types.ObjectId;
  character: mongoose.Types.ObjectId;
  messages: IMessage[];
}

const UserSchema = new Schema<IUser>({
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
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
});

const ChatSchema = new Schema<IChat>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    character: { type: mongoose.Schema.Types.ObjectId, required: true },
    messages: [
      {
        sender: { type: String, enum: ["user", "ai"], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CharacterSchema = new Schema<ICharacter>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
});

export const User = mongoose.model<IUser>("User", UserSchema);

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);

export const Character = mongoose.model<ICharacter>(
  "Character",
  CharacterSchema
);
