export interface IssueData {
  key: string;
  summary: string;
  assignee: string;
  dueDate: string | null;
  type: string;
  priority: string;
  url: string;
}

/**
 * Backlog の課題ページから情報を取得する。
 *
 * TODO: セレクタは Backlog の現行 UI (React ベース) を想定しているが、
 *       実際の DOM 構造は変更される可能性がある。
 *       Classic UI には対応していない。
 */
export function extractIssueData(): IssueData {
  // TODO: `.ticket__key-number` は推測セレクタ。実際の Backlog DOM で要検証。
  const key =
    document.querySelector(".ticket__key-number")?.textContent?.trim() ?? "";

  // TODO: `.ticket__summary` は推測セレクタ。実際の Backlog DOM で要検証。
  const summary =
    document.querySelector(".ticket__summary")?.textContent?.trim() ?? "";

  const assignee = getPropertyValue("担当者", ".user-icon-set__name");
  const dueDate = getPropertyValue("期限日") || null;
  const type = getPropertyValue("種別");
  const priority = getPropertyValue("優先度");
  const url = window.location.href;

  return { key, summary, assignee, dueDate, type, priority, url };
}

/**
 * `.ticket__properties` テーブルからラベルに対応する値を取得する。
 *
 * TODO: `.ticket__properties` テーブル構造は推測。実際の DOM で要検証。
 */
function getPropertyValue(label: string, childSelector?: string): string {
  const rows = document.querySelectorAll(".ticket__properties tr");
  for (const row of rows) {
    const th = row.querySelector("th");
    if (th?.textContent?.trim() === label) {
      const td = row.querySelector("td");
      if (!td) return "";
      if (childSelector) {
        return td.querySelector(childSelector)?.textContent?.trim() ?? "";
      }
      return td.textContent?.trim() ?? "";
    }
  }
  return "";
}
