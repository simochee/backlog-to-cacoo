import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildCacooJson, resolveColor } from "./build-cacoo-json";
import type { IssueData } from "./extract-issue-data";

const baseIssue: IssueData = {
  assignee: "Taro Yamada",
  dueDate: "2026/03/15",
  key: "PROJ-123",
  priority: "高",
  summary: "Fix login bug",
  type: "バグ",
  url: "https://example.backlog.jp/view/PROJ-123",
};

describe("buildCacooJson", () => {
  beforeEach(() => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "550e8400-e29b-41d4-a716-446655440000" as `${string}-${string}-${string}-${string}-${string}`,
    );
  });

  it("returns a valid JSON string", () => {
    const json = buildCacooJson(baseIssue);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("sets target to 'shapes'", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    expect(parsed.target).toBe("shapes");
  });

  it("sets title text to issue key", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    expect(parsed.shapes[0].cacoo.title.text).toBe("PROJ-123");
  });

  it("sets description with summary and assignee", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    expect(parsed.shapes[0].cacoo.description.text).toBe(
      "Fix login bug\n(担当: Taro Yamada)",
    );
  });

  it("sets description without assignee when empty", () => {
    const issue = { ...baseIssue, assignee: "" };
    const parsed = JSON.parse(buildCacooJson(issue));
    expect(parsed.shapes[0].cacoo.description.text).toBe("Fix login bug");
  });

  it("sets due date", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    expect(parsed.shapes[0].cacoo.dueDate).toBe("2026/03/15");
  });

  it("sets dueDate to empty string when null", () => {
    const issue = { ...baseIssue, dueDate: null };
    const parsed = JSON.parse(buildCacooJson(issue));
    expect(parsed.shapes[0].cacoo.dueDate).toBe("");
  });

  it("sets link URL", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    expect(parsed.shapes[0].cacoo.link.url).toBe(
      "https://example.backlog.jp/view/PROJ-123",
    );
  });

  it("generates a unique uid", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    expect(parsed.shapes[0].uid).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("sets type to 12 (card type)", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    expect(parsed.shapes[0].type).toBe(12);
  });

  it("includes title styles", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    const { styles } = parsed.shapes[0].cacoo.title;
    expect(styles).toHaveLength(1);
    expect(styles[0].bold).toBe(true);
    expect(styles[0].size).toBe(14);
  });
});

describe("resolveColor", () => {
  it("returns red for bug type", () => {
    expect(resolveColor("バグ", "")).toBe("#E65050");
  });

  it("returns red for high priority", () => {
    expect(resolveColor("", "高")).toBe("#E65050");
  });

  it("returns green for low priority", () => {
    expect(resolveColor("", "低")).toBe("#69C955");
  });

  it("returns default blue for normal cases", () => {
    expect(resolveColor("タスク", "中")).toBe("#4B91FA");
  });

  it("returns default blue when both are empty", () => {
    expect(resolveColor("", "")).toBe("#4B91FA");
  });
});
