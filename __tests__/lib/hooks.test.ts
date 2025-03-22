import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getDisplayFromParam, getParamFromDisplay } from "@/lib/utils";
import { act, renderHook } from "@testing-library/react";
import { useUrlParams } from "@/hooks/use-url-params";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock("@/lib/utils", () => ({
  getDisplayFromParam: jest.fn(),
  getParamFromDisplay: jest.fn(),
}));

describe("useUrlParams", () => {
  const mockRouter = { push: jest.fn() };
  const mockPathname = "/groceries";

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue(mockPathname);
  });

  describe("getParam", () => {
    it("should return param value when it exists", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue("test-value"),
      });

      const { result } = renderHook(() => useUrlParams());
      expect(result.current.getParam("sort", "default")).toBe("test-value");
    });

    it("should return default value when param does not exist", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      const { result } = renderHook(() => useUrlParams());
      expect(result.current.getParam("test", "default")).toBe("default");
    });
  });

  describe("getDisplayValue", () => {
    it("should get correct display value from param", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn().mockImplementation((param: string) => {
          if (param === "view") return "list";
          return null;
        }),
      });
      (getDisplayFromParam as jest.Mock).mockImplementation((type, param) => {
        if (type === "view" && param === "list") return "List All Items";
        return "";
      });

      const { result } = renderHook(() => useUrlParams());
      expect(result.current.getDisplayValue("view", "view", "list")).toBe(
        "List All Items"
      );
      expect(getDisplayFromParam).toHaveBeenCalledWith("view", "list");
    });
  });

  describe("updateParam", () => {
    it("should update sort parameter with converted value", () => {
      const mockParams = new URLSearchParams();
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(),
        toString: jest.fn().mockImplementation(() => mockParams.toString()),
      });
      (getParamFromDisplay as jest.Mock).mockReturnValue("cheapest");

      const { result } = renderHook(() => useUrlParams());
      act(() => {
        result.current.updateParam("sort", "sort", "Lowest Price");
      });

      expect(getParamFromDisplay).toHaveBeenCalledWith("sort", "Lowest Price");
      expect(mockRouter.push).toHaveBeenCalledWith("/groceries?sort=cheapest", {
        scroll: false,
      });
    });

    it("should update search parameter with direct value", () => {
      const mockParams = new URLSearchParams();
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(),
        toString: jest.fn().mockImplementation(() => mockParams.toString()),
      });

      const { result } = renderHook(() => useUrlParams());
      act(() => {
        result.current.updateParam("search", "query", "apple");
      });

      expect(getParamFromDisplay).not.toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith("/groceries?query=apple", {
        scroll: false,
      });
    });

    it("should remove parameter when value is empty", () => {
      const mockParams = new URLSearchParams();
      mockParams.set("query", "apple");
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(),
        toString: jest.fn().mockImplementation(() => mockParams.toString()),
      });

      const { result } = renderHook(() => useUrlParams());
      act(() => {
        result.current.updateParam("search", "query", "");
      });

      expect(mockRouter.push).toHaveBeenCalledWith("/groceries", {
        scroll: false,
      });
    });

    it("should preserve existing parameters when updating", () => {
      const mockParams = new URLSearchParams();
      mockParams.set("query", "apple");
      mockParams.set("view", "list");
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(),
        toString: jest.fn().mockImplementation(() => mockParams.toString()),
      });
      (getParamFromDisplay as jest.Mock).mockReturnValue("cheapest");

      const { result } = renderHook(() => useUrlParams());
      act(() => {
        result.current.updateParam("sort", "sort", "Lowest Price");
      });

      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining("query=apple"),
        { scroll: false }
      );
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining("view=list"),
        { scroll: false }
      );
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining("sort=cheapest"),
        { scroll: false }
      );
    });
  });
});
