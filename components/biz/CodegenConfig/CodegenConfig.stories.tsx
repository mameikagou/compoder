import type { Meta, StoryObj } from "@storybook/react"
import { CodegenConfig } from "./index"
import { CodegenConfigProps } from "./interface"

const meta: Meta<typeof CodegenConfig> = {
  title: "Biz/CodegenConfig",
  component: CodegenConfig,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof CodegenConfig>

export const Default: Story = {
  args: {
    initialData: {
      title: "React 组件生成器",
      description: "用于生成符合团队规范的 React 组件",
      techStack: "React",
      rendererUrl: "https://example.com/renderer",
      guidePrompts: [
        "请生成一个符合我司规范的 React 组件",
        "组件需要支持 TypeScript",
      ],
      rules: {
        publicComponentLibs: {
          dataSet: ["antd", "shadcn-ui"],
        },
        styleGuide: {
          prompt: "使用 Tailwind CSS 进行样式设计，确保组件风格统一",
        },
        privateComponents: [
          {
            libName: "业务组件库",
            components: [
              {
                name: "DataTable",
                description: "数据表格组件，用于展示和操作表格数据",
                apiDoc:
                  "interface DataTableProps { data: any[]; columns: Column[]; onRowClick?: (row: any) => void; }",
              },
            ],
          },
        ],
        fileStructure: {
          prompt:
            "组件应包含 index.ts、Component.tsx、interface.ts 和 Component.test.tsx 文件",
        },
        notes: {
          prompt: "确保组件具有良好的可访问性和性能优化",
        },
      },
    },
    onDataChange: (data: CodegenConfigProps["initialData"]) =>
      console.log("Data changed:", data),
    onSubmit: (data: CodegenConfigProps["initialData"]) =>
      console.log("Form submitted:", data),
  },
}

export const Empty: Story = {
  args: {},
}
