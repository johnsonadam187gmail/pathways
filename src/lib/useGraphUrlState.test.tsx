/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { GraphProvider } from "@/components/canvas/GraphContext";
import { useGraphUrlState } from "./useGraphUrlState";
import type { ReactNode } from "react";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useRouter: jest.fn(() => ({ replace: mockReplace })),
  usePathname: jest.fn(() => "/"),
}));

function renderWithProvider() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GraphProvider>{children}</GraphProvider>
  );
  return renderHook(() => useGraphUrlState(), { wrapper });
}

describe("useGraphUrlState", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it("does not throw on mount", () => {
    const { result } = renderWithProvider();
    expect(result.current).toBeUndefined();
  });
});
