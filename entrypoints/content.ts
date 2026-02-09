export default defineContentScript({
  matches: ["*://*.backlog.jp/view/*", "*://*.backlog.com/view/*"],
  main() {
    console.log("Backlog to Cacoo extension loaded");
  },
});
