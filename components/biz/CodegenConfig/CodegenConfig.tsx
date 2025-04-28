"use client"

import React, { useState, useEffect } from "react"
import { PlusCircle, X, Save } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import { CodegenConfigProps } from "./interface"

type FormData = NonNullable<CodegenConfigProps["initialData"]>

const CodegenConfig: React.FC<CodegenConfigProps> = ({
  initialData,
  onDataChange,
  onSubmit,
}) => {
  // Initialize form with default values
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    techStack: initialData?.techStack || "",
    rendererUrl: initialData?.rendererUrl || "",
    guidePrompts: initialData?.guidePrompts || [""],
    rules: {
      publicComponentLibs: {
        dataSet: initialData?.rules?.publicComponentLibs?.dataSet || [],
      },
      styleGuide: {
        prompt: initialData?.rules?.styleGuide?.prompt || "",
      },
      privateComponents: initialData?.rules?.privateComponents || [],
      fileStructure: {
        prompt: initialData?.rules?.fileStructure?.prompt || "",
      },
      notes: {
        prompt: initialData?.rules?.notes?.prompt || "",
      },
    },
  })
  const [activeTab, setActiveTab] = useState("basic")
  const [showComponentDialog, setShowComponentDialog] = useState(false)
  const [editingComponentLib, setEditingComponentLib] = useState<{
    index: number
    libName: string
    components: Array<{ name: string; description: string; apiDoc: string }>
  } | null>(null)

  // Call onDataChange when form changes
  useEffect(() => {
    onDataChange?.(formData)
  }, [formData, onDataChange])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  // Handle text input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle nested input changes
  const handleNestedInputChange = (path: string[], value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      let current: any = newData

      // Navigate to the second-to-last key in the path
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {}
        }
        current = current[path[i]]
      }

      // Set the value at the last key
      current[path[path.length - 1]] = value
      return newData
    })
  }

  // Handle adding a new guide prompt
  const handleAddGuidePrompt = () => {
    setFormData(prev => ({
      ...prev,
      guidePrompts: [...(prev.guidePrompts || []), ""],
    }))
  }

  // Handle removing a guide prompt
  const handleRemoveGuidePrompt = (index: number) => {
    setFormData(prev => ({
      ...prev,
      guidePrompts: (prev.guidePrompts || []).filter((_, i) => i !== index),
    }))
  }

  // Handle updating a guide prompt
  const handleUpdateGuidePrompt = (index: number, value: string) => {
    setFormData(prev => {
      const newPrompts = [...(prev.guidePrompts || [])]
      newPrompts[index] = value
      return {
        ...prev,
        guidePrompts: newPrompts,
      }
    })
  }

  // Handle adding a new component library to privateComponents
  const handleAddComponentLib = () => {
    setEditingComponentLib({
      index: -1, // -1 indicates new
      libName: "",
      components: [],
    })
    setShowComponentDialog(true)
  }

  // Handle editing an existing component library
  const handleEditComponentLib = (index: number) => {
    const privateComponents = formData.rules?.privateComponents || []
    const componentLib = privateComponents[index]

    setEditingComponentLib({
      index,
      libName: componentLib.libName,
      components: componentLib.components || [],
    })
    setShowComponentDialog(true)
  }

  // Handle saving component library changes
  const handleSaveComponentLib = () => {
    if (!editingComponentLib) return

    setFormData(prev => {
      const privateComponents = [...(prev.rules?.privateComponents || [])]
      const newComponentLib = {
        libName: editingComponentLib.libName,
        components: editingComponentLib.components,
      }

      if (editingComponentLib.index === -1) {
        // Add new component library
        privateComponents.push(newComponentLib)
      } else {
        // Update existing component library
        privateComponents[editingComponentLib.index] = newComponentLib
      }

      return {
        ...prev,
        rules: {
          ...(prev.rules || {}),
          privateComponents,
        },
      }
    })

    setShowComponentDialog(false)
    setEditingComponentLib(null)
  }

  // Handle adding a new component to the component library
  const handleAddComponent = () => {
    if (!editingComponentLib) return

    setEditingComponentLib({
      ...editingComponentLib,
      components: [
        ...editingComponentLib.components,
        { name: "", description: "", apiDoc: "" },
      ],
    })
  }

  // Handle removing a component from the component library
  const handleRemoveComponent = (index: number) => {
    if (!editingComponentLib) return

    setEditingComponentLib({
      ...editingComponentLib,
      components: editingComponentLib.components.filter((_, i) => i !== index),
    })
  }

  // Handle updating a component in the component library
  const handleUpdateComponent = (
    index: number,
    field: string,
    value: string,
  ) => {
    if (!editingComponentLib) return

    const updatedComponents = [...editingComponentLib.components]
    updatedComponents[index] = {
      ...updatedComponents[index],
      [field]: value,
    }

    setEditingComponentLib({
      ...editingComponentLib,
      components: updatedComponents,
    })
  }

  // Handle removing a component library
  const handleRemoveComponentLib = (index: number) => {
    setFormData(prev => {
      const privateComponents = [...(prev.rules?.privateComponents || [])]
      return {
        ...prev,
        rules: {
          ...(prev.rules || {}),
          privateComponents: privateComponents.filter((_, i) => i !== index),
        },
      }
    })
  }

  // Handle adding a new component library name
  const handleAddComponentLibName = () => {
    setFormData(prev => {
      const dataSet = [...(prev.rules?.publicComponentLibs?.dataSet || [])]
      return {
        ...prev,
        rules: {
          ...(prev.rules || {}),
          publicComponentLibs: {
            ...(prev.rules?.publicComponentLibs || {}),
            dataSet: [...dataSet, ""],
          },
        },
      }
    })
  }

  // Handle removing a component library name
  const handleRemoveComponentLibName = (index: number) => {
    setFormData(prev => {
      const dataSet = [...(prev.rules?.publicComponentLibs?.dataSet || [])]
      return {
        ...prev,
        rules: {
          ...(prev.rules || {}),
          publicComponentLibs: {
            ...(prev.rules?.publicComponentLibs || {}),
            dataSet: dataSet.filter((_, i) => i !== index),
          },
        },
      }
    })
  }

  // Handle updating a component library name
  const handleUpdateComponentLibName = (index: number, value: string) => {
    setFormData(prev => {
      const dataSet = [...(prev.rules?.publicComponentLibs?.dataSet || [])]
      dataSet[index] = value
      return {
        ...prev,
        rules: {
          ...(prev.rules || {}),
          publicComponentLibs: {
            ...(prev.rules?.publicComponentLibs || {}),
            dataSet,
          },
        },
      }
    })
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Codegen 可视化配置</CardTitle>
          <CardDescription>创建高质量的代码生成器配置</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                <TabsTrigger value="basic">基础信息</TabsTrigger>
                <TabsTrigger value="tech">技术栈与渲染器</TabsTrigger>
                <TabsTrigger value="prompts">引导 Prompts</TabsTrigger>
                <TabsTrigger value="rules">规则配置</TabsTrigger>
                <TabsTrigger value="preview">预览</TabsTrigger>
              </TabsList>

              {/* 基础信息配置 */}
              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    标题
                  </label>
                  <Input
                    id="title"
                    placeholder="输入 Codegen 配置标题"
                    value={formData.title}
                    onChange={e => handleInputChange("title", e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    生成器的标题，用于在列表中展示
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    描述
                  </label>
                  <Textarea
                    id="description"
                    placeholder="输入 Codegen 配置描述"
                    value={formData.description}
                    onChange={e =>
                      handleInputChange("description", e.target.value)
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    详细描述这个生成器的用途和特点
                  </p>
                </div>
              </TabsContent>

              {/* 技术栈与渲染器配置 */}
              <TabsContent value="tech" className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="techStack" className="text-sm font-medium">
                    技术栈
                  </label>
                  <Select
                    value={formData.techStack}
                    onValueChange={value =>
                      handleInputChange("techStack", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择技术栈" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="React">React</SelectItem>
                      <SelectItem value="Vue">Vue</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    选择要使用的前端技术栈
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="rendererUrl" className="text-sm font-medium">
                    渲染器 URL
                  </label>
                  <Input
                    id="rendererUrl"
                    placeholder="输入渲染器URL"
                    value={formData.rendererUrl}
                    onChange={e =>
                      handleInputChange("rendererUrl", e.target.value)
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    生成器渲染器的URL地址
                  </p>
                </div>
              </TabsContent>

              {/* 引导 Prompts 配置 */}
              <TabsContent value="prompts" className="py-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">引导 Prompts</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddGuidePrompt}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      添加 Prompt
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {(formData.guidePrompts || []).map((prompt, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex-1 space-y-1">
                          <Textarea
                            placeholder={`引导 Prompt ${index + 1}`}
                            value={prompt}
                            onChange={e =>
                              handleUpdateGuidePrompt(index, e.target.value)
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveGuidePrompt(index)}
                          className="self-center"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* 规则配置 */}
              <TabsContent value="rules" className="py-4">
                <Accordion type="multiple" className="w-full">
                  {/* 公共组件库规则 */}
                  <AccordionItem value="public-component-libs">
                    <AccordionTrigger>公共组件库规则</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddComponentLibName}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            添加组件库
                          </Button>
                        </div>

                        {(
                          formData.rules?.publicComponentLibs?.dataSet || []
                        ).map((lib, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={lib}
                              onChange={e =>
                                handleUpdateComponentLibName(
                                  index,
                                  e.target.value,
                                )
                              }
                              placeholder="组件库名称"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveComponentLibName(index)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 样式规范规则 */}
                  <AccordionItem value="style-guide">
                    <AccordionTrigger>样式规范规则</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="输入样式规范提示词"
                          className="min-h-[150px]"
                          value={formData.rules?.styleGuide?.prompt || ""}
                          onChange={e =>
                            handleNestedInputChange(
                              ["rules", "styleGuide", "prompt"],
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 私有组件规则 */}
                  <AccordionItem value="private-components">
                    <AccordionTrigger>私有组件规则</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddComponentLib}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            添加组件库
                          </Button>
                        </div>

                        {(formData.rules?.privateComponents || []).map(
                          (lib, index) => (
                            <Card key={index} className="relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => handleRemoveComponentLib(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <CardHeader>
                                <CardTitle className="text-base">
                                  {lib.libName || "未命名组件库"}
                                </CardTitle>
                                <CardDescription>
                                  {lib.components?.length || 0} 个组件
                                </CardDescription>
                              </CardHeader>
                              <CardFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditComponentLib(index)}
                                >
                                  编辑组件库
                                </Button>
                              </CardFooter>
                            </Card>
                          ),
                        )}
                      </div>

                      {/* 组件库编辑对话框 */}
                      <Dialog
                        open={showComponentDialog}
                        onOpenChange={setShowComponentDialog}
                      >
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {editingComponentLib?.index === -1
                                ? "添加组件库"
                                : "编辑组件库"}
                            </DialogTitle>
                            <DialogDescription>
                              配置组件库信息和组件列表
                            </DialogDescription>
                          </DialogHeader>

                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  组件库名称
                                </label>
                                <Input
                                  value={editingComponentLib?.libName || ""}
                                  onChange={e =>
                                    setEditingComponentLib(prev =>
                                      prev
                                        ? {
                                            ...prev,
                                            libName: e.target.value,
                                          }
                                        : null,
                                    )
                                  }
                                  placeholder="输入组件库名称"
                                />
                              </div>

                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-sm font-medium">
                                    组件列表
                                  </h4>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddComponent}
                                  >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    添加组件
                                  </Button>
                                </div>

                                {editingComponentLib?.components.map(
                                  (component, index) => (
                                    <Card key={index} className="p-4 relative">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-2"
                                        onClick={() =>
                                          handleRemoveComponent(index)
                                        }
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                      <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium">
                                            组件名称
                                          </label>
                                          <Input
                                            value={component.name}
                                            onChange={e =>
                                              handleUpdateComponent(
                                                index,
                                                "name",
                                                e.target.value,
                                              )
                                            }
                                            placeholder="输入组件名称"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium">
                                            组件描述
                                          </label>
                                          <Textarea
                                            value={component.description}
                                            onChange={e =>
                                              handleUpdateComponent(
                                                index,
                                                "description",
                                                e.target.value,
                                              )
                                            }
                                            placeholder="输入组件描述"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium">
                                            API 文档
                                          </label>
                                          <Textarea
                                            value={component.apiDoc}
                                            onChange={e =>
                                              handleUpdateComponent(
                                                index,
                                                "apiDoc",
                                                e.target.value,
                                              )
                                            }
                                            placeholder="输入组件 API 文档"
                                            className="min-h-[100px]"
                                          />
                                        </div>
                                      </div>
                                    </Card>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              type="button"
                              onClick={() => setShowComponentDialog(false)}
                              variant="outline"
                            >
                              取消
                            </Button>
                            <Button
                              type="button"
                              onClick={handleSaveComponentLib}
                            >
                              保存
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 文件结构规则 */}
                  <AccordionItem value="file-structure">
                    <AccordionTrigger>文件结构规则</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="输入文件结构提示词"
                          className="min-h-[150px]"
                          value={formData.rules?.fileStructure?.prompt || ""}
                          onChange={e =>
                            handleNestedInputChange(
                              ["rules", "fileStructure", "prompt"],
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 注意事项规则 */}
                  <AccordionItem value="notes">
                    <AccordionTrigger>注意事项规则</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="输入注意事项提示词"
                          className="min-h-[150px]"
                          value={formData.rules?.notes?.prompt || ""}
                          onChange={e =>
                            handleNestedInputChange(
                              ["rules", "notes", "prompt"],
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              {/* 预览 */}
              <TabsContent value="preview" className="py-4">
                <div className="border rounded-md p-4 bg-muted/50">
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                保存配置
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CodegenConfig
