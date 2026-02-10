import styles from "./ui.module.css";

const BUTTON_SELECTOR = "[data-testid='cacoo-copy-button']";

/**
 * Backlog 課題ページに「Copy to Cacoo」ボタンを挿入する。
 * 既にボタンが存在する場合は何もしない。
 *
 * TODO: 挿入先の要素 (課題タイトル付近) のセレクタは実際の Backlog DOM で要検証。
 *       現状は body 末尾に追加している。
 */
export function injectCopyButton(onClick: () => void): void {
  if (document.querySelector(BUTTON_SELECTOR)) {
    return;
  }

  const button = document.createElement("button");
  button.setAttribute("data-testid", "cacoo-copy-button");
  button.className = styles.copyButton ?? "";
  button.textContent = "Copy to Cacoo";
  button.addEventListener("click", onClick);

  // TODO: 実際の Backlog ページではタイトル横などより適切な場所に挿入する
  document.body.appendChild(button);
}

/**
 * トースト通知を表示し、指定時間後に自動で削除する。
 */
export function showToast(message: string, duration = 2000): void {
  const toast = document.createElement("div");
  toast.setAttribute("data-testid", "cacoo-toast");
  toast.className = styles.toast ?? "";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}
