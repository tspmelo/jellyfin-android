<h1 align="center">AIOStreams for Android</h1>
<h3 align="center">An unofficial fork of <a href="https://github.com/jellyfin/jellyfin-android">Jellyfin for Android</a>, focused on <a href="https://github.com/Viren070/AIOStreams">AIOStreams</a></h3>

---

> [!IMPORTANT]
> This is an **unofficial** fork. It isn't made, endorsed or supported by the Jellyfin Project or by AIOStreams.
> Please report problems with this app here, not to either project.
> For the official app, see [jellyfin/jellyfin-android](https://github.com/jellyfin/jellyfin-android).

This app connects to Jellyfin servers like the official app does, with changes for AIOStreams servers, which serve streams the server hasn't scanned, and for Android TV.

## What's different

- **Android TV**: installs and launches on TVs, with the connect screen, settings and web app usable with a remote.
- **Audio and subtitle tracks from the file**: when the server doesn't report a stream's tracks, the player lists the ones inside the file, as the AIOStreams desktop app does.
- **Automatic subtitles**: the player picks subtitles from your subtitle language and mode, and no longer switches them off when the server doesn't pick one.
- **AIOStreams name and icon**.

## Install

Download an APK from [Releases](https://github.com/tspmelo/jellyfin-android/releases):

- `libre`: no Google services. Use this on most TVs.
- `proprietary`: adds Chromecast support.

It installs as `org.jellyfin.mobile`, the same package as the official app, so it can't be installed alongside it. Uninstall the official app first.

## Setup

1. Connect to your AIOStreams server.
2. In the app's settings, set the video player to the integrated player. Otherwise videos play in the web page, which can't see the tracks inside the file.
3. Optional: in the AIOStreams web app's settings, set your subtitle language and mode (for example English, Always) so subtitles turn on by themselves.

## Build

Requires the Android SDK.

```sh
git clone https://github.com/tspmelo/jellyfin-android.git
cd jellyfin-android
./gradlew assembleDebug    # or installDebug to deploy to a connected device
```

Release builds need a signing key, passed as Gradle properties (or the matching environment variables):

```sh
./gradlew assembleRelease -Pjellyfin.version=v2.7.3-aiostreams.1 \
  -Pkeystore.file=... -Pkeystore.password=... -Psigning.key.alias=... -Psigning.key.password=...
```

## Credits and license

Based on [Jellyfin for Android](https://github.com/jellyfin/jellyfin-android) by the [Jellyfin Project](https://jellyfin.org) and its contributors. Track handling follows the [AIOStreams](https://github.com/Viren070/AIOStreams) desktop app. Licensed under the [GPL 2.0](LICENSE.md), like the original.
