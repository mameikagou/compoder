import { NextResponse } from "next/server"
import { updateComponentCode } from "@/lib/db/componentCode/mutations"
import { connectToDatabase } from "@/lib/db/mongo"
import { validateSession } from "@/lib/auth/middleware"

export async function POST(request: Request) {
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
    const { componentCodeId, prompt, code } = body

    if (!componentCodeId || !prompt || !code) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      )
    }

    // 4. Execute update operation
    const updatedComponentCode = await updateComponentCode({
      id: componentCodeId,
      prompt,
      code,
    })

    // 5. Return result
    return NextResponse.json({
      success: true,
      data: updatedComponentCode,
    })
  } catch (error) {
    console.error("Error in POST add version:", error)
    return NextResponse.json(
      { error: "Failed to add component code version" },
      { status: 500 },
    )
  }
}
