import { NextResponse } from "next/server"
import { getComponentCodeById } from "@/lib/db/componentCode/selectors"
import { connectToDatabase } from "@/lib/db/mongo"
import { validateSession } from "@/lib/auth/middleware"

export async function GET(request: Request) {
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

    // 4. Execute query operation
    const result = await getComponentCodeById({
      id,
      codegenId,
    })

    // 5. Return result
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in GET component code detail:", error)
    return NextResponse.json(
      { error: "Failed to fetch component code details" },
      { status: 500 },
    )
  }
}
