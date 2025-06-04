import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { clientPromise } from "@/lib/db/mongo"
import { Adapter } from "next-auth/adapters"
import { env } from "@/lib/env"

export const authOptions: NextAuthOptions = {
  debug: true,
  // 开发模式下使用 MongoDB adapter
  adapter: MongoDBAdapter(clientPromise) as any,
  providers: [
    // 开发模式下启用 GitHub 认证
    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
      httpOptions: {
        timeout: 30000,
      },
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      // 开发模式下返回模拟用户数据
      if (process.env.NODE_ENV === "development") {
        return {
          ...session,
          user: {
            id: "000000000000000000000000",  // 24位十六进制字符串
            name: "开发模式用户",
            email: "dev@example.com",
            image: "https://avatars.githubusercontent.com/u/1?v=4",
          },
        }
      }
      // 保留原有的回调逻辑
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
}
