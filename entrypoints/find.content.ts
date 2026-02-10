import { extractIssueDataFromRow } from "@/lib/extract-issue-data";
import { buildCacooJson } from "@/lib/build-cacoo-json";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { injectListCopyButtons, showToast } from "@/lib/ui";

export default defineContentScript({
  matches: ["*://*.backlog.jp/*", "*://*.backlog.com/*"],
  main() {
    injectListCopyButtons(handleCopy);
  },
});

function handleCopy(row: HTMLTableRowElement): void {
  const issue = extractIssueDataFromRow(row);
  const cacooJson = buildCacooJson(issue);
  const plainText = `${issue.key} ${issue.summary}`;

  copyToClipboard(cacooJson, plainText);
  showToast("Cacoo カードをクリップボードにコピーしました");
}
