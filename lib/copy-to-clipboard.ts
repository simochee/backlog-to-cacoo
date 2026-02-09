/**
 * copy イベントを利用してカスタム MIME タイプでクリップボードにデータを書き込む。
 * navigator.clipboard.write() は cacoo/shape のような非標準 MIME タイプをブロックするため、
 * document.execCommand('copy') + copy イベントハンドラの方式を使用する。
 */
export function copyToClipboard(
  cacooJson: string,
  plainText: string,
): void {
  const handler = (e: Event) => {
    e.preventDefault();
    const clipboardData = (e as ClipboardEvent).clipboardData;
    clipboardData?.setData("cacoo/shape", cacooJson);
    clipboardData?.setData("text/plain", plainText);
  };

  document.addEventListener("copy", handler);
  document.execCommand("copy");
  document.removeEventListener("copy", handler);
}
