import { beforeEach, describe, expect, it, vi } from "vitest";
import { copyToClipboard } from "./copy-to-clipboard";

// Jsdom does not provide ClipboardEvent, so we polyfill it for instanceof checks
if (typeof globalThis.ClipboardEvent === "undefined") {
  class ClipboardEventPolyfill extends Event {
    readonly clipboardData: DataTransfer | null;
    constructor(
      type: string,
      init?: EventInit & { clipboardData?: DataTransfer | null },
    ) {
      super(type, init);
      this.clipboardData = init?.clipboardData ?? null;
    }
  }
  globalThis.ClipboardEvent =
    ClipboardEventPolyfill as unknown as typeof ClipboardEvent;
}

function createCopyEvent(setDataMock: ReturnType<typeof vi.fn>) {
  const event = new ClipboardEvent("copy", { cancelable: true });
  Object.defineProperty(event, "clipboardData", {
    value: { setData: setDataMock },
  });
  return event;
}

describe("copyToClipboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Jsdom does not provide document.execCommand
    document.execCommand = vi.fn().mockReturnValue(true);
  });

  it("calls document.execCommand('copy')", () => {
    copyToClipboard('{"test": true}', "PROJ-123 Fix bug");
    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });

  it("sets cacoo/shape data on clipboardData", () => {
    const setDataMock = vi.fn();

    vi.mocked(document.execCommand).mockImplementation((command) => {
      if (command === "copy") {
        document.dispatchEvent(createCopyEvent(setDataMock));
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

    vi.mocked(document.execCommand).mockImplementation((command) => {
      if (command === "copy") {
        document.dispatchEvent(createCopyEvent(setDataMock));
      }
      return true;
    });

    copyToClipboard('{"cacoo": "data"}', "PROJ-123 Fix bug");

    expect(setDataMock).toHaveBeenCalledWith("text/plain", "PROJ-123 Fix bug");
  });

  it("removes the copy event listener after execution", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");

    copyToClipboard('{"test": true}', "text");

    expect(addSpy).toHaveBeenCalledWith("copy", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("copy", expect.any(Function));
  });

  it("prevents default on the copy event", () => {
    const setDataMock = vi.fn();

    vi.mocked(document.execCommand).mockImplementation((command) => {
      if (command === "copy") {
        const event = createCopyEvent(setDataMock);
        const preventDefaultSpy = vi.spyOn(event, "preventDefault");
        document.dispatchEvent(event);
        expect(preventDefaultSpy).toHaveBeenCalled();
      }
      return true;
    });

    copyToClipboard('{"test": true}', "text");
  });
});
