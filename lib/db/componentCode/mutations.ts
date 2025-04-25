import { ComponentCodeModel } from "./schema"
import { Prompt } from "./types"
import mongoose from "mongoose"

/**
 * Create a new component code
 */
export async function createComponentCode({
  userId,
  codegenId,
  name,
  description,
  prompt,
  code,
}: {
  userId: string
  codegenId: string
  name: string
  description: string
  prompt: Prompt[]
  code: string
}) {
  try {
    // Create the component code
    const newComponentCode = await ComponentCodeModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      codegenId: new mongoose.Types.ObjectId(codegenId),
      name,
      description,
      versions: [
        {
          prompt,
          code,
        },
      ],
    })

    return newComponentCode
  } catch (error) {
    console.error("Error in createComponentCode:", error)
    throw error
  }
}

/**
 * Update component code by adding a new version
 */
export async function updateComponentCode({
  id,
  prompt,
  code,
}: {
  id: string
  prompt: Prompt[]
  code: string
}) {
  try {
    const componentCode = await ComponentCodeModel.findById(id)

    if (!componentCode) {
      throw new Error("Component code not found")
    }

    // Add the new version
    componentCode.versions.push({
      prompt,
      code,
    })

    await componentCode.save()

    return componentCode
  } catch (error) {
    console.error("Error in updateComponentCode:", error)
    throw error
  }
}

/**
 * Update component code metadata
 */
export async function updateComponentCodeMetadata({
  id,
  codegenId,
  name,
  description,
}: {
  id: string
  codegenId: string
  name?: string
  description?: string
}) {
  try {
    const updateData: any = {}

    if (name) updateData.name = name
    if (description) updateData.description = description

    const updatedComponentCode = await ComponentCodeModel.findOneAndUpdate(
      { _id: id, codegenId },
      { $set: updateData },
      { new: true },
    )

    if (!updatedComponentCode) {
      throw new Error("Component code not found")
    }

    return updatedComponentCode
  } catch (error) {
    console.error("Error in updateComponentCodeMetadata:", error)
    throw error
  }
}

/**
 * Delete a component code
 */
export async function deleteComponentCode({
  id,
  codegenId,
}: {
  id: string
  codegenId: string
}) {
  try {
    const result = await ComponentCodeModel.findOneAndDelete({
      _id: id,
      codegenId,
    })

    if (!result) {
      throw new Error("Component code not found")
    }

    return true
  } catch (error) {
    console.error("Error in deleteComponentCode:", error)
    throw error
  }
}
