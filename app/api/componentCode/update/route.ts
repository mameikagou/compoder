import { NextResponse } from "next/server"
import { updateComponentCodeMetadata } from "@/lib/db/componentCode/mutations"
import { connectToDatabase } from "@/lib/db/mongo"
import { validateSession } from "@/lib/auth/middleware"

export async function PUT(request: Request) {
  try {
    // 1. Validate session
    const authError = await validateSession()
    if (authError) {
      return authError
    }

    // 2. Connect to database
    await connectToDatabase()

    // 3. Get request body
    const body = await request.json()
    const { id, codegenId, name, description } = body

    if (!id || !codegenId) {
      return NextResponse.json(
        { error: "Missing required parameters: id or codegenId" },
        { status: 400 },
      )
    }

    // 4. Execute update operation
    const updatedComponentCode = await updateComponentCodeMetadata({
      id,
      codegenId,
      name,
      description,
    })

    // 5. Return result
    return NextResponse.json({
      success: true,
      data: updatedComponentCode,
    })
  } catch (error) {
    console.error("Error in PUT component code:", error)
    return NextResponse.json(
      { error: "Failed to update component code" },
      { status: 500 },
    )
  }
}
