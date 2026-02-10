import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildCacooJson, resolveColor } from "./build-cacoo-json";
import type { IssueData } from "./extract-issue-data";

const baseIssue: IssueData = {
  key: "PROJ-123",
  summary: "Fix login bug",
  assignee: "Taro Yamada",
  dueDate: "2026/03/15",
  type: "バグ",
  priority: "高",
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

  it("sets title text to key + summary", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    expect(parsed.shapes[0].cacoo.title.text).toBe("PROJ-123 Fix login bug");
  });

  it("sets title styles with linked key and normal summary", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    const styles = parsed.shapes[0].cacoo.title.styles;
    expect(styles).toHaveLength(2);

    // Key part: blue, bold, underline
    expect(styles[0]).toMatchObject({
      index: 0,
      color: "2488fd",
      bold: true,
      underline: true,
    });

    // Summary part: dark, bold (starts after key)
    expect(styles[1]).toMatchObject({
      index: "PROJ-123".length,
      color: "333333",
      bold: true,
    });
    expect(styles[1].underline).toBeUndefined();
  });

  it("sets title link covering the issue key", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    const links = parsed.shapes[0].cacoo.title.links;
    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({
      type: 1,
      to: "https://example.backlog.jp/view/PROJ-123",
      startIndex: 0,
      endIndex: "PROJ-123".length - 1,
    });
  });

  it("sets description with assignee only", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    expect(parsed.shapes[0].cacoo.description.text).toBe(
      "担当: Taro Yamada",
    );
  });

  it("sets description to empty when assignee is empty", () => {
    const issue = { ...baseIssue, assignee: "" };
    const parsed = JSON.parse(buildCacooJson(issue));
    expect(parsed.shapes[0].cacoo.description.text).toBe("");
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

  it("does not include card-level link", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    expect(parsed.shapes[0].cacoo.link).toBeUndefined();
  });

  it("generates a unique uid", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    expect(parsed.shapes[0].uid).toBe(
      "550e8400-e29b-41d4-a716-446655440000",
    );
  });

  it("sets type to 12 (card type)", () => {
    const parsed = JSON.parse(buildCacooJson(baseIssue));
    expect(parsed.shapes[0].type).toBe(12);
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
