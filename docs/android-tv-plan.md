# Android TV support plan

Note: Jellyfin already ships an official TV client (`jellyfin-androidtv`). This plan makes *this* app usable on TV too.

## Phase 1 — installable + navigable ✅ done

1. Manifest: `LEANBACK_LAUNCHER` category on `MainActivity`, `android:banner`, `<uses-feature required="false">` for
   `touchscreen`, `leanback`, `wifi` (`ACCESS_WIFI_STATE` implies wifi, which would exclude Ethernet-only TVs).
2. Use jellyfin-web's `tv` layout (built-in focus management / d-pad nav): expose `isTv` from
   `NativeInterface.getDeviceInformation()`, return `"tv"` from `AppHost.getDefaultLayout()` in `nativeshell.js`.
3. `webView.requestFocus()` once the webapp is connected, so arrow keys reach the page.
4. Verify remote Back works through the existing `OnBackPressedCallback` in `MainActivity`.

## Phase 2 — native player on a remote (`PlayerFragment`) ✅ done

Notes from testing:
- The player fragment is *added* over the WebView, so the WebView keeps focus unless the player takes it after attach,
  re-takes it when the controller hides, and blocks focus on sibling views while open.
- PlayerView already shows controls on d-pad and focuses `exo_play_pause`; only Left/Right-while-hidden needed custom code
  (routed via `MainActivity.dispatchKeyEvent`).
- PiP is skipped on devices without `FEATURE_PICTURE_IN_PICTURE` (entering it would throw).

- `dispatchKeyEvent`: Center = show controls / play-pause, Left/Right = seek when controls hidden, Back hides controls first.
- Make `exo_player_control_view.xml` buttons focusable with visible focused states; explicit focus order.
- On TV: disable `PlayerGestureHelper`, lock screen, orientation/fullscreen toggle, PiP button.

## Phase 3 — native screens (in progress)

Done: battery-optimization snackbar hidden on TV, Chromecast disabled on TV, stronger focus highlight on player buttons.
Back on the home page (web app calls `exitApp`): first focuses the page's `<nav>`, exits only from there (`focusNavOrExit`).
WebView is laid out 1280 CSS px wide on TV (scaled to fit): TVs report 960dp, which frontends treat as a phone layout.
Up from the topmost content scrolls to the top and keeps focus (undoes the web app's jump into a side nav; see nativeshell.js).
Note: custom frontends (e.g. AIOStreams) handle the d-pad themselves and ignore the `tv` layout; quirks there (like its
fixed nav bar only being reachable from the end of the page) belong upstream, not in the app.


- ✅ Connect screen: Host field no longer traps d-pad up/down, buttons show a white focus border. Server list items untested
  (emulator discovers no servers). Nit: focusing the Host field opens the keyboard right away (Back closes it).
- Settings (ModernAndroidPreferences): verify focus highlight.
- On TV hide cast (`chrome.cast` injection, `castmenuhashchange`).
- Out of scope: download screens (`DownloadsScreen`).

## Phase 4 — later, if wanted

- Audio passthrough (AC3/EAC3/DTS) in `DeviceProfileBuilder`.
- Play Store TV quality checklist.

## Testing

Android TV emulator (API 34), d-pad only. Every screen must be reachable without touch.

Skipped: leanback / tv-material libraries — add only if native screens need a real TV UI.
