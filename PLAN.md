# PLAN.md

## Project Goal

Develop a Chrome/Edge Browser Extension that allows users to copy a Backlog issue as a "Cacoo Card" (special JSON format) to the clipboard. The user can then paste it directly into Cacoo to visualize the task.

## Repository Name

backlog-to-cacoo-extension

## Tech Stack

- Manifest V3
- Vanilla JavaScript (No heavy frameworks required)
- HTML/CSS for simple UI injection

## Core Features

1. **DOM Scraping**: Extract issue details from the current Backlog issue page (`/view/KEY-123`).
2. **Data Formatting**: Construct a JSON object specifically structured for Cacoo (MIME type: `cacoo/shape`).
3. **Clipboard Injection**: Intercept the copy event to write the custom `cacoo/shape` format (since standard Clipboard API blocks non-standard MIME types).

## Data Mapping

The extension must extract the following fields from the Backlog DOM:

| Backlog Field       | Variable   | Destination in Cacoo JSON | Note                           |
| ------------------- | ---------- | ------------------------- | ------------------------------ |
| Issue Key           | `key`      | `cacoo.title.text`        | e.g., "PROJ-123"               |
| Summary             | `summary`  | `cacoo.description.text`  | e.g., "Fix login bug"          |
| Assignee            | `assignee` | `cacoo.description.text`  | Append as `\n(担当: Name)`     |
| Due Date            | `dueDate`  | `cacoo.dueDate`           | Format: `YYYY/MM/DD` (or null) |
| Issue Type/Priority | `type`     | `cacoo.primaryColor`      | _Optional logic below_         |
| URL                 | `url`      | `cacoo.link.url`          | Current page URL               |

### Color Logic (Optional Idea)

- High Priority / Bug: Red (`#E65050`)
- Normal: Blue (`#4B91FA`)
- Low: Green (`#69C955`)
- Default: `#4B91FA`

## Verified JSON Schema (Crucial)

Use this exact structure. The `cacoo/shape` MIME type requires this specific JSON string.

```json
{
  "target": "shapes",
  "sheetId": "generated",
  "shapes": [
    {
      "uid": "GENERATE_UNIQUE_ID_HERE",
      "type": 12,
      "keepAspectRatio": true,
      "locked": false,
      "bounds": {
        "top": 3000,
        "bottom": 3137,
        "left": 1100,
        "right": 1360
      },
      "cardType": 0,
      "cacoo": {
        "title": {
          "text": "${key}",
          "leading": 6,
          "styles": [
            {
              "index": 0,
              "font": "Open Sans",
              "size": 14,
              "color": "333333",
              "bold": true
            }
          ],
          "links": [],
          "height": 20
        },
        "description": {
          "text": "${summary}\n(担当: ${assignee})",
          "leading": 6,
          "styles": [
            { "index": 0, "font": "Open Sans", "size": 12, "color": "333333" }
          ],
          "links": [],
          "height": 18
        },
        "expanded": true,
        "primaryColor": "${color}",
        "secondaryColor": "#DCEBFF",
        "dueDate": "${dueDate}",
        "link": {
          "enabled": true,
          "type": 1,
          "sheet": "",
          "url": "${url}",
          "function": null
        },
        "externalAccountId": ""
      }
    }
  ]
}
```

## Implementation Phases

### Phase 1: Manifest & Setup

- Create `manifest.json` (V3).
- Permissions: `activeTab`, `scripting` (or host permissions for `*.backlog.jp`, `*.backlog.com`).
- Setup content script injection target matches: `*://*.backlog.jp/view/*`, `*://*.backlog.com/view/*`.

### Phase 2: DOM Scraper (Content Script)

- Identify DOM selectors for Backlog's new UI (React-based) or Classic UI.
- Key: usually `.ticket__key` or header elements.
- Title: `.ticket__summary` or similar.
- Assignee: User icons/names in the sidebar.
- Due Date: Date fields in the sidebar.

- Implement a function `extractIssueData()` returning the mapped object.

### Phase 3: The "Copy" Logic (The Tricky Part)

Since `navigator.clipboard.write()` often blocks custom MIME types like `cacoo/shape`, use the `copy` event injection method:

1. Inject a "Copy to Cacoo" button into the Backlog page (e.g., near the title).
2. On button click:

- Run `extractIssueData()`.
- Generate the JSON string.
- Add a one-time `document.addEventListener('copy', handler)`.
- Inside the handler:
- `e.preventDefault()`
- `e.clipboardData.setData('cacoo/shape', jsonString)`
- `e.clipboardData.setData('text/plain', readableString)`

- Execute `document.execCommand('copy')` to trigger the event.
- Remove the event listener.
- Show a "Copied!" toast notification.

### Phase 4: Refinement

- Handle cases where fields (like Due Date or Assignee) are empty.
- Ensure the Unique ID (`uid`) in JSON is randomly generated each time to avoid conflict.

## Next Step for AI

Start by creating the `manifest.json` and a basic `content_script.js` that simply logs "Backlog Extension Loaded" to the console.
