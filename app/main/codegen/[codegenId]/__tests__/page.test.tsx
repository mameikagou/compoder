import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import CodegenPage from "../page"
import {
  useGetCodegenDetail,
  useComponentCodeList,
} from "../../server-store/selectors"
import { useCreateComponentCode } from "../../server-store/mutations"

// Mock necessary hooks and modules
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}))

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}))

jest.mock("../../server-store/selectors", () => ({
  useGetCodegenDetail: jest.fn(),
  useComponentCodeList: jest.fn(),
}))

jest.mock("../../server-store/mutations", () => ({
  useCreateComponentCode: jest.fn(),
}))

describe("CodegenPage", () => {
  // Set up mocks before each test
  beforeEach(() => {
    // Mock useParams
    ;(useParams as jest.Mock).mockReturnValue({
      codegenId: "test-codegen-id",
    })

    // Mock useRouter
    const mockPush = jest
      .fn()(useRouter as jest.Mock)
      .mockReturnValue({
        push: mockPush,
      })(
        // Mock useToast
        useToast as jest.Mock,
      )
      .mockReturnValue({
        toast: jest.fn(),
      })(
        // Mock useGetCodegenDetail
        useGetCodegenDetail as jest.Mock,
      )
      .mockReturnValue({
        data: {
          _id: "test-codegen-id",
          title: "Test Codegen",
          description: "Test description",
          guides: ["Create a button", "Create a form"],
          codeRendererUrl: "https://test-renderer.com",
        },
        isLoading: false,
      })(
        // Mock useComponentCodeList
        useComponentCodeList as jest.Mock,
      )
      .mockReturnValue({
        data: {
          items: [
            {
              id: "component-1",
              title: "Test Component",
              description: "Test component description",
              code: { "test.tsx": "Test code" },
              entryFile: "test.tsx",
            },
          ],
          total: 1,
        },
        isLoading: false,
      })

    // Mock useCreateComponentCode
    const mockMutate = jest
      .fn()(useCreateComponentCode as jest.Mock)
      .mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      })
  })

  it("renders the codegen page with correct data", () => {
    render(<CodegenPage />)

    // Check if the title is displayed
    expect(screen.getByText("Test Codegen")).toBeInTheDocument()

    // Check if guides are rendered
    expect(screen.getByText("Create a button")).toBeInTheDocument()
    expect(screen.getByText("Create a form")).toBeInTheDocument()

    // Check if component is rendered
    expect(screen.getByText("Test Component")).toBeInTheDocument()
    expect(screen.getByText("Test component description")).toBeInTheDocument()
  })

  it("handles component creation with text input", async () => {
    const { mutate } = useCreateComponentCode() as { mutate: jest.Mock }

    render(<CodegenPage />)

    // Enter text in the input
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "Create a new component" } })

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /send/i })
    fireEvent.click(submitButton)

    // Check if mutate was called with correct parameters
    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          codegenId: "test-codegen-id",
          prompt: [{ type: "text", text: "Create a new component" }],
          model: expect.any(String),
          provider: expect.any(String),
        },
        expect.any(Object),
      )
    })
  })

  it("handles component item click", () => {
    const { push } = useRouter() as { push: jest.Mock }

    render(<CodegenPage />)

    // Find and click on the component item
    const componentItem = screen.getByText("Test Component")
    fireEvent.click(componentItem)

    // Check if router.push was called with the correct path
    expect(push).toHaveBeenCalledWith(
      "/main/codegen/test-codegen-id/component-1",
    )
  })
})
