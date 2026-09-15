# GlassOS

A browser based virtual Operating System based on clean glassmorphism UI, simple focussed apps, no bloatware and easy to use.

## Features

- **Window Management:** Windows can be dragged, resized, minimized, maximized, and focused.
- **State Persistence:** Persistent windows position, customization
- **Taskbar:** Built with `@dnd-kit/sortable` for dynamic drag-and-drop rearranging of dock icons.
- **Hardware APIs:** Hooks into browser APIs to display real-time battery status, charging indicators, network speed estimates, and memory usage.
- **Hackatime Widget** A real hackatime widget where users can connect their account and see real stats.

## Built-in Apps

- **Browser:** Multi-tab functional web browser.
- **Weather:** A functional weather app
- **Notepad:** Standard text editor with persistent local storage.
- **Tasks:** A basic checklist tracker.
- **Settings:** Controls desktop wallpapers and system preferences.
- **VS Code:** A mock code editor interface with active file state tracking.
- **Calculator** A real calculator app with scientific operations
- **Calendar** A real calendar with persistent events storage

## Stack

- Next.js
- Tailwind CSS v4
- @dnd-kit (Core & Sortable)
- React Icons / Iconify

## Updates in v2

- Added full screen Prompt
- Added game library
- Added calculator app
- Added calendar app
- Added hackatime widget

## Updates in v3

- Made VSCode interface almost real
- Mock terminal inside VSCode
- Added a startup animation

## Terminal Commands

```bash
run [file] Execute file JS/TS code
node Execute specified JS file
ls, pwd, cd [dir] Navigate directory structure
cat, touch, rm File inspection and edits
cp, mv Copy or rename files
echo [> file] Print text or write to file
grep, find, wc Search and inspect content
head, tail View line subsets
date, env, history System tools
clear, reset Manage terminal state
```
