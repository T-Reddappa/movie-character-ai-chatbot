import mongoose, { Schema } from "mongoose";

export interface IDialogue extends Document {
  character: string;
  dialogues: string[];
}

const DialogueSchema = new Schema<IDialogue>({
  character: { type: String, required: true },
  dialogues: [{ type: String, required: true }],
});

export const Dialogue = mongoose.model<IDialogue>("Dialogue", DialogueSchema);
