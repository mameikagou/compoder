interface CodegenConfigProps {
  /**
   * Initial config data
   */
  initialData?: {
    title?: string
    description?: string
    techStack?: string
    rendererUrl?: string
    guidePrompts?: string[]
    rules?: {
      publicComponentLibs?: {
        dataSet: string[]
      }
      styleGuide?: {
        prompt: string
      }
      privateComponents?: Array<{
        libName: string
        components: Array<{
          name: string
          description: string
          apiDoc: string
        }>
      }>
      fileStructure?: {
        prompt: string
      }
      notes?: {
        prompt: string
      }
    }
  }
  /**
   * Callback when config data changes
   */
  onDataChange?: (data: CodegenConfigProps["initialData"]) => void
  /**
   * Callback when form is submitted
   */
  onSubmit?: (data: CodegenConfigProps["initialData"]) => void
}

export type { CodegenConfigProps }
