import { describe, it, expect, beforeEach } from "vitest";
import { extractIssueData } from "./extract-issue-data";

describe("extractIssueData", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("extracts issue key from the page", () => {
    document.body.innerHTML = `
      <span class="ticket__key-number">PROJ-123</span>
    `;
    const data = extractIssueData();
    expect(data.key).toBe("PROJ-123");
  });

  it("extracts summary from the page", () => {
    document.body.innerHTML = `
      <span class="ticket__key-number">PROJ-1</span>
      <span class="ticket__summary">Fix login bug</span>
    `;
    const data = extractIssueData();
    expect(data.summary).toBe("Fix login bug");
  });

  it("extracts assignee from the page", () => {
    document.body.innerHTML = `
      <span class="ticket__key-number">PROJ-1</span>
      <span class="ticket__summary">Fix login bug</span>
      <table class="ticket__properties">
        <tr>
          <th>担当者</th>
          <td>
            <span class="user-icon-set__name">Taro Yamada</span>
          </td>
        </tr>
      </table>
    `;
    const data = extractIssueData();
    expect(data.assignee).toBe("Taro Yamada");
  });

  it("extracts due date from the page", () => {
    document.body.innerHTML = `
      <span class="ticket__key-number">PROJ-1</span>
      <span class="ticket__summary">task</span>
      <table class="ticket__properties">
        <tr>
          <th>期限日</th>
          <td>2026/03/15</td>
        </tr>
      </table>
    `;
    const data = extractIssueData();
    expect(data.dueDate).toBe("2026/03/15");
  });

  it("returns null for missing due date", () => {
    document.body.innerHTML = `
      <span class="ticket__key-number">PROJ-1</span>
      <span class="ticket__summary">task</span>
    `;
    const data = extractIssueData();
    expect(data.dueDate).toBeNull();
  });

  it("returns empty string for missing assignee", () => {
    document.body.innerHTML = `
      <span class="ticket__key-number">PROJ-1</span>
      <span class="ticket__summary">task</span>
    `;
    const data = extractIssueData();
    expect(data.assignee).toBe("");
  });

  it("extracts current page URL", () => {
    document.body.innerHTML = `
      <span class="ticket__key-number">PROJ-1</span>
      <span class="ticket__summary">task</span>
    `;
    const data = extractIssueData();
    expect(data.url).toBe(window.location.href);
  });

  it("extracts issue type from the page", () => {
    document.body.innerHTML = `
      <span class="ticket__key-number">PROJ-1</span>
      <span class="ticket__summary">task</span>
      <table class="ticket__properties">
        <tr>
          <th>種別</th>
          <td>バグ</td>
        </tr>
      </table>
    `;
    const data = extractIssueData();
    expect(data.type).toBe("バグ");
  });

  it("extracts priority from the page", () => {
    document.body.innerHTML = `
      <span class="ticket__key-number">PROJ-1</span>
      <span class="ticket__summary">task</span>
      <table class="ticket__properties">
        <tr>
          <th>優先度</th>
          <td>高</td>
        </tr>
      </table>
    `;
    const data = extractIssueData();
    expect(data.priority).toBe("高");
  });

  it("returns empty string for missing type and priority", () => {
    document.body.innerHTML = `
      <span class="ticket__key-number">PROJ-1</span>
      <span class="ticket__summary">task</span>
    `;
    const data = extractIssueData();
    expect(data.type).toBe("");
    expect(data.priority).toBe("");
  });
});
