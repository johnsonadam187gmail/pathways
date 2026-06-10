/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";

describe("KeyboardShortcutsModal", () => {
  it("does not render when open is false", () => {
    render(<KeyboardShortcutsModal open={false} onClose={jest.fn()} />);
    expect(
      screen.queryByTestId("keyboard-shortcuts-modal"),
    ).not.toBeInTheDocument();
  });

  it("renders the modal when open is true", () => {
    render(<KeyboardShortcutsModal open={true} onClose={jest.fn()} />);
    expect(screen.getByTestId("keyboard-shortcuts-modal")).toBeInTheDocument();
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
  });

  it("lists all expected shortcuts", () => {
    render(<KeyboardShortcutsModal open={true} onClose={jest.fn()} />);
    expect(screen.getByText("Enter / F2")).toBeInTheDocument();
    expect(screen.getByText("Tab")).toBeInTheDocument();
    expect(screen.getByText("N")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Arrows")).toBeInTheDocument();
    expect(screen.getByText("Ctrl/Cmd + D")).toBeInTheDocument();
    expect(screen.getByText("Ctrl/Cmd + A")).toBeInTheDocument();
  });

  it("renders shortcut labels", () => {
    render(<KeyboardShortcutsModal open={true} onClose={jest.fn()} />);
    expect(screen.getByText("Edit selected node")).toBeInTheDocument();
    expect(
      screen.getByText("New branch from selected position"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("New pathway at canvas center"),
    ).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(<KeyboardShortcutsModal open={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close shortcuts"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
