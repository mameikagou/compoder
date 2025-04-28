"use client"

import { AppHeader } from "@/components/biz/AppHeader/AppHeader"
import ChatInput from "@/components/biz/ChatInput/ChatInput"
import CodegenGuide from "@/components/biz/CodegenGuide/CodegenGuide"
import ComponentCodeFilterContainer from "@/components/biz/ComponentCodeFilterContainer/ComponentCodeFilterContainer"
import { ComponentCodeList } from "@/components/biz/ComponentCodeList/ComponentCodeList"
import TldrawEdit from "@/components/biz/TldrawEdit/TldrawEdit"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  useGetCodegenDetail,
  useComponentCodeList,
} from "../server-store/selectors"
import { useCreateComponentCode } from "../server-store/mutations"
import { FilterField } from "@/components/biz/ComponentCodeFilterContainer/interface"
import { Prompt } from "@/lib/db/componentCode/types"
import { useToast } from "@/hooks/use-toast"

export default function CodegenPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const codegenId = params.codegenId as string

  // 状态管理
  const [image, setImage] = useState<string[]>([])
  const [searchKeyword, setSearchKeyword] = useState("")
  const [filterField, setFilterField] = useState<FilterField>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(5)
  const [inputValue, setInputValue] = useState("")

  // 获取Codegen详情
  const { data: codegenDetail, isLoading: isCodegenLoading } =
    useGetCodegenDetail(codegenId)

  // 获取组件列表
  const { data: componentCodeData, isLoading: isComponentsLoading } =
    useComponentCodeList({
      codegenId,
      page: currentPage,
      pageSize,
      searchKeyword,
      filterField,
    })

  // 创建组件的Mutation
  const createComponentMutation = useCreateComponentCode()

  // 处理页面变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // 处理搜索关键词变化
  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword)
    setCurrentPage(1) // 重置为第一页
  }

  // 处理过滤字段变化
  const handleFilterFieldChange = (field: FilterField) => {
    setFilterField(field)
    setCurrentPage(1) // 重置为第一页
  }

  // 处理组件创建
  const handleCreateComponent = () => {
    if (!inputValue.trim() && image.length === 0) {
      toast({
        title: "无法创建组件",
        description: "请输入描述或上传图片",
        variant: "destructive",
      })
      return
    }

    // 构建提示数组
    const prompts: Prompt[] = []

    if (inputValue.trim()) {
      prompts.push({
        type: "text",
        text: inputValue,
      })
    }

    if (image.length > 0) {
      image.forEach(img => {
        prompts.push({
          type: "image",
          image: img,
        })
      })
    }

    // 调用创建组件的API
    createComponentMutation.mutate(
      {
        codegenId,
        prompt: prompts,
        model: "anthropic/claude-3.5-sonnet", // 可以从配置中获取默认模型
        provider: "openai", // 可以从配置中获取默认提供商
      },
      {
        onSuccess: () => {
          // 清空输入
          setInputValue("")
          setImage([])
          toast({
            title: "组件创建中",
            description: "您的组件正在创建中，请稍候...",
          })
        },
        onError: error => {
          toast({
            title: "创建组件失败",
            description: error.message || "请稍后重试",
            variant: "destructive",
          })
        },
      },
    )
  }

  // 处理组件点击
  const handleComponentClick = (id: string) => {
    router.push(`/main/codegen/${codegenId}/${id}`)
  }

  return (
    <div>
      <AppHeader
        breadcrumbs={[
          { label: "Codegen", href: "/main/codegen" },
          { label: codegenDetail?.title || "CodegenDetail" },
        ]}
      />
      <ScrollArea className="h-[calc(100vh-100px)]">
        {codegenDetail?.guides && (
          <CodegenGuide
            name={codegenDetail.title}
            prompts={codegenDetail.guides.map(guideText => ({
              title: guideText,
              onClick: () => setInputValue(guideText),
            }))}
          />
        )}
        <div className="w-full max-w-3xl mx-auto mt-4">
          <ChatInput
            loading={createComponentMutation.isPending}
            actions={[
              <TldrawEdit
                key="tldraw-edit"
                onSubmit={(dataUrl: string) => {
                  setImage([...image, dataUrl])
                }}
              />,
            ]}
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleCreateComponent}
            onImageRemove={() => setImage([])}
            images={image}
          />
        </div>
        <ComponentCodeFilterContainer
          className="mt-4 max-w-[1920px]"
          pageSize={pageSize}
          total={componentCodeData?.total || 0}
          currentPage={currentPage}
          searchKeyword={searchKeyword}
          filterField={filterField}
          onPageChange={handlePageChange}
          onSearchChange={handleSearchChange}
          onFilterFieldChange={handleFilterFieldChange}
        >
          <ComponentCodeList
            items={componentCodeData?.items || []}
            onItemClick={handleComponentClick}
            codeRendererServer={codegenDetail?.codeRendererUrl || ""}
          />
        </ComponentCodeFilterContainer>
      </ScrollArea>
    </div>
  )
}
