import mongoose, { Schema, model, models } from "mongoose"
import {
  ComponentCode,
  Prompt,
  PromptImage,
  PromptText,
  Version,
} from "./types"

// Define schema for discriminated union of Prompt types
const PromptSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["text", "image"],
      required: true,
    },
    text: {
      type: String,
      required: function (this: PromptText) {
        return this.type === "text"
      },
    },
    image: {
      type: String,
      required: function (this: PromptImage) {
        return this.type === "image"
      },
    },
  },
  { _id: false },
)

// Define schema for Version
const VersionSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
    },
    prompt: {
      type: [PromptSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: true },
)

// Define main ComponentCode schema
const ComponentCodeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    codegenId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Codegen",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    versions: {
      type: [VersionSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: true },
)

// Export the model, checking if it already exists to prevent recompilation errors
export const ComponentCodeModel =
  models.ComponentCode ||
  model<ComponentCode>("ComponentCode", ComponentCodeSchema)
