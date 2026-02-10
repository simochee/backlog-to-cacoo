import { injectCopyButton, showToast } from "@/lib/ui";
import { buildCacooJson } from "@/lib/build-cacoo-json";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { extractIssueData } from "@/lib/extract-issue-data";

export default defineContentScript({
  main() {
    injectCopyButton(handleCopy);
  },
  matches: ["*://*.backlog.jp/view/*", "*://*.backlog.com/view/*"],
});

function handleCopy(): void {
  const issue = extractIssueData();
  const cacooJson = buildCacooJson(issue);
  const plainText = `${issue.key} ${issue.summary}`;

  copyToClipboard(cacooJson, plainText);
  showToast("Copied!");
}
