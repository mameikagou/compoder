import { NextResponse } from "next/server"
import { listComponentCodes } from "@/lib/db/componentCode/selectors"
import { connectToDatabase } from "@/lib/db/mongo"
import { validateSession } from "@/lib/auth/middleware"
import type { ComponentCodeApi } from "../type"

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
    const codegenId = searchParams.get("codegenId")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const searchKeyword = searchParams.get("searchKeyword") || undefined
    const filterField =
      (searchParams.get(
        "filterField",
      ) as ComponentCodeApi.listRequest["filterField"]) || "all"

    if (!codegenId) {
      return NextResponse.json(
        { error: "Missing required parameter: codegenId" },
        { status: 400 },
      )
    }

    // 4. Execute query operation
    const result = await listComponentCodes({
      codegenId,
      page,
      pageSize,
      searchKeyword,
      filterField,
    })

    // 5. Return result
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in GET component codes:", error)
    return NextResponse.json(
      { error: "Failed to fetch component codes" },
      { status: 500 },
    )
  }
}
