import { describe, it, expect, beforeEach } from "vitest";
import { extractIssueData } from "./extract-issue-data";

describe("extractIssueData", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("extracts issue key from the page", () => {
    document.body.innerHTML = `
      <span data-testid="issueKey">PROJ-123</span>
    `;
    const data = extractIssueData();
    expect(data.key).toBe("PROJ-123");
  });

  it("extracts summary from the page", () => {
    document.body.innerHTML = `
      <span data-testid="issueKey">PROJ-1</span>
      <span data-testid="issueSummary"><div class="markdown-body">Fix login bug</div></span>
    `;
    const data = extractIssueData();
    expect(data.summary).toBe("Fix login bug");
  });

  it("extracts assignee from the page", () => {
    document.body.innerHTML = `
      <span data-testid="issueKey">PROJ-1</span>
      <span data-testid="issueSummary">Fix login bug</span>
      <span data-testid="issueAssignee">Taro Yamada</span>
    `;
    const data = extractIssueData();
    expect(data.assignee).toBe("Taro Yamada");
  });

  it("extracts due date from the page", () => {
    document.body.innerHTML = `
      <span data-testid="issueKey">PROJ-1</span>
      <span data-testid="issueSummary">task</span>
      <span data-testid="dueDate"><span>期限日</span>2026/03/15</span>
    `;
    const data = extractIssueData();
    expect(data.dueDate).toBe("2026/03/15");
  });

  it("returns null when due date is a dash", () => {
    document.body.innerHTML = `
      <span data-testid="issueKey">PROJ-1</span>
      <span data-testid="issueSummary">task</span>
      <span data-testid="dueDate"><span>期限日</span>-</span>
    `;
    const data = extractIssueData();
    expect(data.dueDate).toBeNull();
  });

  it("returns null for missing due date element", () => {
    document.body.innerHTML = `
      <span data-testid="issueKey">PROJ-1</span>
      <span data-testid="issueSummary">task</span>
    `;
    const data = extractIssueData();
    expect(data.dueDate).toBeNull();
  });

  it("returns empty string for missing assignee", () => {
    document.body.innerHTML = `
      <span data-testid="issueKey">PROJ-1</span>
      <span data-testid="issueSummary">task</span>
    `;
    const data = extractIssueData();
    expect(data.assignee).toBe("");
  });

  it("extracts current page URL", () => {
    document.body.innerHTML = `
      <span data-testid="issueKey">PROJ-1</span>
      <span data-testid="issueSummary">task</span>
    `;
    const data = extractIssueData();
    expect(data.url).toBe(window.location.href);
  });

  it("extracts issue type from the page", () => {
    document.body.innerHTML = `
      <span data-testid="issueKey">PROJ-1</span>
      <span data-testid="issueSummary">task</span>
      <span data-testid="issueType">バグ</span>
    `;
    const data = extractIssueData();
    expect(data.type).toBe("バグ");
  });

  it("extracts priority from the page", () => {
    document.body.innerHTML = `
      <span data-testid="issueKey">PROJ-1</span>
      <span data-testid="issueSummary">task</span>
      <a data-testid="issuePriority">高</a>
    `;
    const data = extractIssueData();
    expect(data.priority).toBe("高");
  });

  it("returns empty string for missing type and priority", () => {
    document.body.innerHTML = `
      <span data-testid="issueKey">PROJ-1</span>
      <span data-testid="issueSummary">task</span>
    `;
    const data = extractIssueData();
    expect(data.type).toBe("");
    expect(data.priority).toBe("");
  });
});
