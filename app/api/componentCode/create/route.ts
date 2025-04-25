import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/mongo"
import { validateSession, getUserId } from "@/lib/auth/middleware"
import type { ComponentCodeApi } from "../type"
import { run } from "@/app/api/ai-core/workflow"
import { getAIClient } from "@/app/api/ai-core/utils/aiClient"
import { AIProvider } from "@/lib/config/ai-providers"
import { findCodegenById } from "@/lib/db/codegen/selectors"

export async function POST(request: Request) {
  try {
    // 1. Validate session
    const authError = await validateSession()
    if (authError) {
      return authError
    }

    // 获取用户信息
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      )
    }

    // 2. Connect to database
    await connectToDatabase()

    // 3. Get request body
    const body = (await request.json()) as ComponentCodeApi.createRequest
    const { codegenId, prompt, model, provider } = body

    if (!codegenId || !prompt || !model || !provider) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      )
    }

    // 获取codegen数据，包括rules
    const codegenData = await findCodegenById(codegenId)

    // 使用getAIClient获取AI模型
    const aiModel = getAIClient(provider as AIProvider, model)

    // 4. Create a readable stream for the response
    const encoder = new TextEncoder()
    let responseStream = new TransformStream()
    const writer = responseStream.writable.getWriter()

    // 创建一个流对象，用于workflow中的消息传递
    const stream = {
      write: async (message: string) => {
        await writer.write(encoder.encode(message))
      },
      close: async () => {
        await writer.close()
      },
    }

    // 5. Start the async process - 使用workflow
    setTimeout(async () => {
      try {
        // 调用workflow run函数
        const result = await run({
          stream,
          query: {
            userId,
            codegenId,
            prompt,
            aiModel: aiModel as any, // 使用类型断言解决版本兼容问题
            rules: codegenData.rules || [], // 使用从数据库获取的rules
          },
        })

        if (result && result.success) {
          // 如果workflow成功执行，结果会自动通过stream写入
          // 这里不需要额外操作，workflow中的storeComponent步骤会处理
        }
        // 如果出错，由workflow内部错误处理机制处理并写入stream
      } catch (error) {
        console.error("Error in workflow execution:", error)
        await writer.write(
          encoder.encode(
            JSON.stringify({
              success: false,
              error: "Failed to execute component creation workflow",
            }),
          ),
        )
        await writer.close()
      }
    }, 0)

    // 6. Return the stream
    return new NextResponse(responseStream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error in POST component code:", error)
    return NextResponse.json(
      { error: "Failed to create component code" },
      { status: 500 },
    )
  }
}
