import { describe, it, expect, vi, beforeEach } from "vitest";
import { copyToClipboard } from "./copy-to-clipboard";

describe("copyToClipboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls document.execCommand('copy')", () => {
    const spy = vi.spyOn(document, "execCommand").mockReturnValue(true);
    copyToClipboard('{"test": true}', "PROJ-123 Fix bug");
    expect(spy).toHaveBeenCalledWith("copy");
  });

  it("sets cacoo/shape data on clipboardData", () => {
    const setDataMock = vi.fn();

    vi.spyOn(document, "execCommand").mockImplementation((command) => {
      if (command === "copy") {
        const event = new ClipboardEvent("copy", {
          clipboardData: new DataTransfer(),
        });
        Object.defineProperty(event, "clipboardData", {
          value: { setData: setDataMock },
        });
        document.dispatchEvent(event);
      }
      return true;
    });

    copyToClipboard('{"cacoo": "data"}', "readable text");

    expect(setDataMock).toHaveBeenCalledWith(
      "cacoo/shape",
      '{"cacoo": "data"}',
    );
  });

  it("sets text/plain data on clipboardData", () => {
    const setDataMock = vi.fn();

    vi.spyOn(document, "execCommand").mockImplementation((command) => {
      if (command === "copy") {
        const event = new ClipboardEvent("copy", {
          clipboardData: new DataTransfer(),
        });
        Object.defineProperty(event, "clipboardData", {
          value: { setData: setDataMock },
        });
        document.dispatchEvent(event);
      }
      return true;
    });

    copyToClipboard('{"cacoo": "data"}', "PROJ-123 Fix bug");

    expect(setDataMock).toHaveBeenCalledWith("text/plain", "PROJ-123 Fix bug");
  });

  it("removes the copy event listener after execution", () => {
    vi.spyOn(document, "execCommand").mockReturnValue(true);
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");

    copyToClipboard('{"test": true}', "text");

    expect(addSpy).toHaveBeenCalledWith("copy", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("copy", expect.any(Function));
  });

  it("prevents default on the copy event", () => {
    const preventDefaultMock = vi.fn();

    vi.spyOn(document, "execCommand").mockImplementation((command) => {
      if (command === "copy") {
        const event = new ClipboardEvent("copy", {
          clipboardData: new DataTransfer(),
        });
        Object.defineProperty(event, "clipboardData", {
          value: { setData: vi.fn() },
        });
        event.preventDefault = preventDefaultMock;
        document.dispatchEvent(event);
      }
      return true;
    });

    copyToClipboard('{"test": true}', "text");

    expect(preventDefaultMock).toHaveBeenCalled();
  });
});
