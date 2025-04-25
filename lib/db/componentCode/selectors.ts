import { ComponentCodeModel } from "./schema"
import { FilterQuery } from "mongoose"
import { ComponentCode } from "./types"
import { getCodeRendererUrl } from "../codegen/selectors"

/**
 * List component codes with pagination and search options
 */
export async function listComponentCodes({
  codegenId,
  page,
  pageSize,
  searchKeyword,
  filterField = "all",
}: {
  codegenId: string
  page: number
  pageSize: number
  searchKeyword?: string
  filterField?: "all" | "name" | "description"
}) {
  try {
    const skip = (page - 1) * pageSize

    // Build query conditions
    let searchQuery: FilterQuery<ComponentCode> = {
      codegenId,
    }

    if (searchKeyword) {
      if (filterField === "name") {
        searchQuery.name = { $regex: searchKeyword, $options: "i" }
      } else if (filterField === "description") {
        searchQuery.description = { $regex: searchKeyword, $options: "i" }
      } else {
        // 'all' - search in both name and description
        searchQuery.$or = [
          { name: { $regex: searchKeyword, $options: "i" } },
          { description: { $regex: searchKeyword, $options: "i" } },
        ]
      }
    }

    // Execute query
    const [data, total] = await Promise.all([
      ComponentCodeModel.find(searchQuery)
        .select("_id name description versions")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      ComponentCodeModel.countDocuments(searchQuery),
    ])

    // Format data for response
    const formattedData = data.map((item: any) => ({
      _id: item._id,
      name: item.name,
      description: item.description,
      latestVersionCode:
        item.versions && item.versions.length > 0
          ? item.versions[item.versions.length - 1].code
          : "",
    }))

    return {
      data: formattedData,
      total,
    }
  } catch (error) {
    console.error("Error in listComponentCodes:", error)
    throw error
  }
}

/**
 * Get component code details by ID
 */
export async function getComponentCodeById({
  id,
  codegenId,
}: {
  id: string
  codegenId: string
}) {
  try {
    const componentCode = (await ComponentCodeModel.findOne({
      _id: id,
      codegenId,
    }).lean()) as any

    if (!componentCode) {
      throw new Error("Component code not found")
    }

    // Get code renderer URL from codegen
    const codeRendererUrl = await getCodeRendererUrl(codegenId)

    return {
      data: {
        _id: componentCode._id,
        name: componentCode.name,
        description: componentCode.description,
        versions: componentCode.versions,
        codeRendererUrl: codeRendererUrl || `/api/render/${componentCode._id}`,
      },
    }
  } catch (error) {
    console.error("Error in getComponentCodeById:", error)
    throw error
  }
}
