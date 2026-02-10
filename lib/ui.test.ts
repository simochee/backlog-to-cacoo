import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { injectCopyButton, showToast } from "./ui";

describe("injectCopyButton", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("creates a button element in the document", () => {
    // TODO: 実際の Backlog DOM にはボタンの挿入先要素が必要。ここでは body 直下に挿入されることをテスト。
    injectCopyButton(() => {});
    const button = document.querySelector("[data-testid='cacoo-copy-button']");
    expect(button).not.toBeNull();
  });

  it("button has correct label text", () => {
    injectCopyButton(() => {});
    const button = document.querySelector("[data-testid='cacoo-copy-button']");
    expect(button?.textContent).toBe("Copy to Cacoo");
  });

  it("calls the onClick handler when button is clicked", () => {
    const handler = vi.fn();
    injectCopyButton(handler);
    const button = document.querySelector(
      "[data-testid='cacoo-copy-button']",
    ) as HTMLButtonElement;
    button.click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it("does not inject duplicate buttons", () => {
    injectCopyButton(() => {});
    injectCopyButton(() => {});
    const buttons = document.querySelectorAll(
      "[data-testid='cacoo-copy-button']",
    );
    expect(buttons).toHaveLength(1);
  });
});

describe("showToast", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("inserts a toast element into the document", () => {
    showToast("Copied!");
    const toast = document.querySelector("[data-testid='cacoo-toast']");
    expect(toast).not.toBeNull();
    expect(toast?.textContent).toBe("Copied!");
  });

  it("removes the toast after the specified duration", () => {
    showToast("Copied!", 2000);
    expect(
      document.querySelector("[data-testid='cacoo-toast']"),
    ).not.toBeNull();

    vi.advanceTimersByTime(2000);

    expect(document.querySelector("[data-testid='cacoo-toast']")).toBeNull();
  });

  it("defaults to 2000ms duration", () => {
    showToast("Copied!");

    vi.advanceTimersByTime(1999);
    expect(
      document.querySelector("[data-testid='cacoo-toast']"),
    ).not.toBeNull();

    vi.advanceTimersByTime(1);
    expect(document.querySelector("[data-testid='cacoo-toast']")).toBeNull();
  });
});
