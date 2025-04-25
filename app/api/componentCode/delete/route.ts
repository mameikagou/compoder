import { NextResponse } from "next/server"
import { deleteComponentCode } from "@/lib/db/componentCode/mutations"
import { connectToDatabase } from "@/lib/db/mongo"
import { validateSession } from "@/lib/auth/middleware"

export async function DELETE(request: Request) {
  try {
    // 1. Validate session
    const authError = await validateSession()
    if (authError) {
      return authError
    }

    // 2. Connect to database
    await connectToDatabase()

    // 3. Get query parameters from URL
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const codegenId = searchParams.get("codegenId")

    if (!id || !codegenId) {
      return NextResponse.json(
        { error: "Missing required parameters: id or codegenId" },
        { status: 400 },
      )
    }

    // 4. Execute delete operation
    await deleteComponentCode({
      id,
      codegenId,
    })

    // 5. Return empty response for successful deletion
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error in DELETE component code:", error)
    return NextResponse.json(
      { error: "Failed to delete component code" },
      { status: 500 },
    )
  }
}
