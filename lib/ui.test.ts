import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { injectCopyButton, showToast } from "./ui";

const BUTTON_SELECTOR = "[data-testid='cacoo-copy-button']";

describe("injectCopyButton", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("injects a button after #copyKey-help when element already exists", () => {
    document.body.innerHTML = '<span id="copyKey-help"></span>';
    injectCopyButton(() => {});

    const button = document.querySelector(BUTTON_SELECTOR);
    expect(button).not.toBeNull();

    const anchor = document.querySelector("#copyKey-help");
    const wrapper = anchor?.nextElementSibling;
    expect(wrapper?.querySelector(BUTTON_SELECTOR)).not.toBeNull();
  });

  it("uses Backlog native icon-button classes", () => {
    document.body.innerHTML = '<span id="copyKey-help"></span>';
    injectCopyButton(() => {});

    const button = document.querySelector(BUTTON_SELECTOR) as HTMLButtonElement;
    expect(button.classList.contains("icon-button")).toBe(true);
    expect(button.classList.contains("icon-button--default")).toBe(true);
  });

  it("wraps the button in a span with copy-key-btn class", () => {
    document.body.innerHTML = '<span id="copyKey-help"></span>';
    injectCopyButton(() => {});

    const anchor = document.querySelector("#copyKey-help");
    const wrapper = anchor?.nextElementSibling as HTMLElement;
    expect(wrapper?.classList.contains("copy-key-btn")).toBe(true);
    expect(wrapper?.classList.contains("ticket__key-copy")).toBe(true);
  });

  it("sets data-tooltip to 'Copy to Cacoo'", () => {
    document.body.innerHTML = '<span id="copyKey-help"></span>';
    injectCopyButton(() => {});

    const button = document.querySelector(BUTTON_SELECTOR) as HTMLButtonElement;
    expect(button.getAttribute("data-tooltip")).toBe("Copy to Cacoo");
  });

  it("calls the onClick handler when button is clicked", () => {
    document.body.innerHTML = '<span id="copyKey-help"></span>';
    const handler = vi.fn();
    injectCopyButton(handler);

    const button = document.querySelector(BUTTON_SELECTOR) as HTMLButtonElement;
    button.click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it("does not inject duplicate buttons", () => {
    document.body.innerHTML = '<span id="copyKey-help"></span>';
    injectCopyButton(() => {});
    injectCopyButton(() => {});

    const buttons = document.querySelectorAll(BUTTON_SELECTOR);
    expect(buttons).toHaveLength(1);
  });

  it("does not inject when #copyKey-help is absent", () => {
    document.body.innerHTML = "<div></div>";
    injectCopyButton(() => {});

    const button = document.querySelector(BUTTON_SELECTOR);
    expect(button).toBeNull();
  });

  it("injects button when #copyKey-help appears later via MutationObserver", async () => {
    injectCopyButton(() => {});
    expect(document.querySelector(BUTTON_SELECTOR)).toBeNull();

    const anchor = document.createElement("span");
    anchor.id = "copyKey-help";
    document.body.appendChild(anchor);

    // Wait for MutationObserver callback
    await new Promise((resolve) => setTimeout(resolve, 0));

    const button = document.querySelector(BUTTON_SELECTOR);
    expect(button).not.toBeNull();
  });

  it("contains an SVG icon inside the button", () => {
    document.body.innerHTML = '<span id="copyKey-help"></span>';
    injectCopyButton(() => {});

    const button = document.querySelector(BUTTON_SELECTOR) as HTMLButtonElement;
    const svg = button.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("icon -medium");
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

  it("uses Backlog.StatusBar when available", () => {
    const showTextAndHide = vi.fn();
    const init = vi.fn();
    (window as any).Backlog = { StatusBar: { init, showTextAndHide } };

    showToast("Copied!");

    expect(init).toHaveBeenCalledOnce();
    expect(showTextAndHide).toHaveBeenCalledWith("Copied!");

    // Should not create a toast element
    expect(document.querySelector("[data-testid='cacoo-toast']")).toBeNull();

    delete (window as any).Backlog;
  });

  it("falls back to custom toast when Backlog.StatusBar is unavailable", () => {
    showToast("Copied!");
    const toast = document.querySelector("[data-testid='cacoo-toast']");
    expect(toast).not.toBeNull();
    expect(toast?.textContent).toBe("Copied!");
  });

  it("removes the fallback toast after the specified duration", () => {
    showToast("Copied!", 2000);
    expect(
      document.querySelector("[data-testid='cacoo-toast']"),
    ).not.toBeNull();

    vi.advanceTimersByTime(2000);

    expect(document.querySelector("[data-testid='cacoo-toast']")).toBeNull();
  });

  it("defaults to 2000ms duration for fallback toast", () => {
    showToast("Copied!");

    vi.advanceTimersByTime(1999);
    expect(
      document.querySelector("[data-testid='cacoo-toast']"),
    ).not.toBeNull();

    vi.advanceTimersByTime(1);
    expect(document.querySelector("[data-testid='cacoo-toast']")).toBeNull();
  });
});
