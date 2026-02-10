import type { IssueData } from "./extract-issue-data";

const COLOR_RED = "#E65050";
const COLOR_BLUE = "#4B91FA";
const COLOR_GREEN = "#69C955";

export function resolveColor(type: string, priority: string): string {
  if (type === "バグ" || priority === "高") {
    return COLOR_RED;
  }
  if (priority === "低") {
    return COLOR_GREEN;
  }
  return COLOR_BLUE;
}

export function buildCacooJson(issue: IssueData): string {
  const description = issue.assignee
    ? `${issue.summary}\n(担当: ${issue.assignee})`
    : issue.summary;

  const color = resolveColor(issue.type, issue.priority);

  const payload = {
    shapes: [
      {
        uid: crypto.randomUUID(),
        type: 12,
        keepAspectRatio: true,
        locked: false,
        bounds: {
          top: 3000,
          bottom: 3137,
          left: 1100,
          right: 1360,
        },
        cardType: 0,
        cacoo: {
          title: {
            text: issue.key,
            leading: 6,
            styles: [
              {
                index: 0,
                font: "Open Sans",
                size: 14,
                color: "333333",
                bold: true,
              },
            ],
            links: [],
            height: 20,
          },
          description: {
            text: description,
            leading: 6,
            styles: [
              {
                index: 0,
                font: "Open Sans",
                size: 12,
                color: "333333",
              },
            ],
            links: [],
            height: 18,
          },
          expanded: true,
          primaryColor: color,
          secondaryColor: "#DCEBFF",
          dueDate: issue.dueDate ?? "",
          link: {
            enabled: true,
            type: 1,
            sheet: "",
            url: issue.url,
            function: null,
          },
          externalAccountId: "",
        },
      },
    ],
    sheetId: "generated",
    target: "shapes",
  };

  return JSON.stringify(payload);
}
