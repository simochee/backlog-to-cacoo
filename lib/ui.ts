import styles from "./ui.module.css";

const BUTTON_SELECTOR = "[data-testid='cacoo-copy-button']";
const ANCHOR_SELECTOR = "#copyKey-help";

/**
 * DOM に指定セレクタの要素が出現するたびにコールバックを実行する。
 * SPA のページ遷移にも対応する。
 */
function observeMutation(
  selector: string,
  callback: (el: Element) => void,
): void {
  const check = () => {
    const el = document.querySelector(selector);
    if (el) callback(el);
  };

  check();

  new MutationObserver(check).observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Backlog 課題ページの課題キーコピーボタン (#copyKey-help) の横に
 * 「Copy to Cacoo」ボタンを挿入する。
 * MutationObserver で #copyKey-help の出現を監視し、SPA のページ遷移にも対応する。
 */
export function injectCopyButton(onClick: () => void): void {
  observeMutation(ANCHOR_SELECTOR, (anchor) => {
    if (document.querySelector(BUTTON_SELECTOR)) return;

    const wrapper = document.createElement("span");
    wrapper.className = "copy-key-btn ticket__key-copy";
    wrapper.style.translate = "36px";

    const button = document.createElement("button");
    button.setAttribute("data-testid", "cacoo-copy-button");
    button.className = [
      "icon-button",
      "icon-button--default",
      "simptip-position-right",
      "simptip-movable",
      "simptip-smooth",
    ].join(" ");
    button.setAttribute("data-tooltip", "Copy to Cacoo");
    button.addEventListener("click", onClick);

    const iconSpan = document.createElement("span");
    iconSpan.className = "copy-trigger";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("role", "image");
    svg.setAttribute("class", "icon -medium");

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      "/images/svg/sprite.symbol.svg#icon_link",
    );

    svg.appendChild(use);
    iconSpan.appendChild(svg);
    button.appendChild(iconSpan);
    wrapper.appendChild(button);

    anchor.insertAdjacentElement("afterend", wrapper);
  });
}

interface BacklogGlobal {
  Backlog?: {
    StatusBar?: {
      init(): void;
      showTextAndHide(text: string): void;
    };
  };
}

/**
 * 通知を表示する。
 * Backlog の StatusBar が利用できる場合はそちらを使用し、
 * 利用できない場合はカスタムトーストにフォールバックする。
 */
export function showToast(message: string, duration = 2000): void {
  const backlog = (window as unknown as BacklogGlobal).Backlog;
  if (backlog?.StatusBar) {
    backlog.StatusBar.init();
    backlog.StatusBar.showTextAndHide(message);
    return;
  }

  const toast = document.createElement("div");
  toast.setAttribute("data-testid", "cacoo-toast");
  toast.className = styles.toast ?? "";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}
