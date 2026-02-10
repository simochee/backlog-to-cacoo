import { extractIssueData } from "@/lib/extract-issue-data";
import { buildCacooJson } from "@/lib/build-cacoo-json";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { injectCopyButton, showToast } from "@/lib/ui";

export default defineContentScript({
  matches: ["*://*.backlog.jp/view/*", "*://*.backlog.com/view/*"],
  main() {
    injectCopyButton(handleCopy);
  },
});

function handleCopy(): void {
  const issue = extractIssueData();
  const cacooJson = buildCacooJson(issue);
  const plainText = `${issue.key} ${issue.summary}`;

  copyToClipboard(cacooJson, plainText);
  showToast("Cacoo カードをクリップボードにコピーしました");
}
