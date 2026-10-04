const features = [
    "castmenuhashchange",
    "clientsettings",
    "displaylanguage",
    "downloadmanagement",
    "exit",
    "externallinks",
    "filedownload",
    "fileinput",
    "htmlaudioautoplay",
    "htmlvideoautoplay",
    "multiserver",
    "physicalvolumecontrol",
    "remotecontrol",
    "subtitleappearancesettings",
    "subtitleburnsettings"
];

const plugins = [
    'NavigationPlugin',
    'ExoPlayerPlugin',
    'ExternalPlayerPlugin',
    'MediaSegmentsPlugin'
];

// Add plugin loaders
for (const plugin of plugins) {
    window[plugin] = async () => {
        const pluginDefinition = await import(`/native/${plugin}.js`);
        return pluginDefinition[plugin];
    };
}

const { deviceId, deviceName, appName, appVersion, isTv } =JSON.parse(window.NativeInterface.getDeviceInformation());
const codecCaps = JSON.parse(window.NativeInterface.getCodecCapabilities());

window.NativeShell = {
    enableFullscreen() {
        window.NativeInterface.enableFullscreen();
    },

    disableFullscreen() {
        window.NativeInterface.disableFullscreen();
    },

    openUrl(url, target) {
        window.NativeInterface.openUrl(url);
    },

    updateMediaSession(mediaInfo) {
        window.NativeInterface.updateMediaSession(JSON.stringify(mediaInfo));
    },

    hideMediaSession() {
        window.NativeInterface.hideMediaSession();
    },

    updateVolumeLevel(value) {
        window.NativeInterface.updateVolumeLevel(value);
    },

    downloadFile(downloadInfo) {
        window.NativeInterface.downloadFiles(JSON.stringify([downloadInfo]));
    },

    downloadFiles(downloadInfo) {
        window.NativeInterface.downloadFiles(JSON.stringify(downloadInfo));
    },

    openDownloadManager() {
        window.NativeInterface.openDownloadManager();
    },

    openClientSettings() {
        window.NativeInterface.openClientSettings();
    },

    selectServer() {
        window.NativeInterface.openServerSelection();
    },

    getPlugins() {
        return plugins;
    },

    // TV only, called instead of exiting: move focus to the page's nav bar, exit if already there (or there is none)
    focusNavOrExit() {
        const navSelector = 'nav, [role="navigation"]';
        const target = !document.activeElement?.closest(navSelector) && [...document.querySelectorAll(navSelector)]
            .flatMap((nav) => [...nav.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])')])
            .find((el) => el.checkVisibility());
        if (target) {
            target.focus();
        } else {
            window.NativeInterface.exitAppNow();
        }
    },

    async execCast(action, args, callback) {
        this.castCallbacks = this.castCallbacks || {};
        this.castCallbacks[action] = callback;
        window.NativeInterface.execCast(action, JSON.stringify(args));
    },

    async castCallback(action, keep, err, result) {
        const callbacks = this.castCallbacks || {};
        const callback = callbacks[action];
        callback && callback(err || null, result);
        if (!keep) {
            delete callbacks[action];
        }
    }
};

// TV: up from the topmost content (e.g. a hero "Play" button) scrolls to the top and keeps focus,
// instead of letting the web app jump into a side nav. Web apps may handle keys before this listener,
// so it undoes their focus move within the same key press (before anything is painted).
if (isTv) {
    const NAV = 'nav, [role="navigation"]';
    const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let focusBeforeKey = null;
    window.addEventListener('keyup', () => { focusBeforeKey = document.activeElement; }, true);
    window.addEventListener('keydown', (e) => {
        const active = focusBeforeKey;
        if (e.key !== 'ArrowUp' || !active || !active.isConnected || active === document.body || active.closest(NAV)) return;
        const top = active.getBoundingClientRect().top;
        // Columns of side navs (taller than wide), which may hold more buttons outside the <nav> element
        const sideColumns = [...document.querySelectorAll(NAV)].map((nav) => nav.getBoundingClientRect())
            .filter((r) => r.height > r.width);
        const contentAbove = [...document.querySelectorAll(FOCUSABLE)].some((el) => {
            const r = el.getBoundingClientRect();
            return el !== active && r.bottom <= top + 1
                && !sideColumns.some((col) => r.left >= col.left - 1 && r.right <= col.right + 1)
                && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
        });
        if (contentAbove) return;
        if (document.activeElement !== active) active.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        e.preventDefault();
        e.stopImmediatePropagation();
    }, true);

    // Scrolling the page never moves fixed elements (e.g. a side nav), but some web apps still smooth-scroll the page
    // to "reveal" one when it gets focus, drifting the content behind it. Ignore those scrolls.
    const isInFixed = (el) => {
        for (let p = el; p && p !== document.documentElement; p = p.parentElement) {
            if (getComputedStyle(p).position === 'fixed') return true;
        }
        return false;
    };
    const scrollTo = window.scrollTo.bind(window);
    window.scrollTo = (...args) => {
        if (args[0]?.behavior === 'smooth' && isInFixed(document.activeElement)) return;
        scrollTo(...args);
    };
}

function getDeviceProfile(profileBuilder, item) {
    return profileBuilder();
}

window.NativeShell.AppHost = {
    init() {},
    getDefaultLayout() {
        return isTv ? "tv" : "mobile";
    },
    supports(command) {
        command = command.toLowerCase();
        if (command === "chromecast") {
            return window.NativeInterface.hasChromecast();
        }
        return features.includes(command);
    },
    getDeviceProfile,
    deviceName() {
        return deviceName;
    },
    deviceId() {
        return deviceId;
    },
    appName() {
        return appName;
    },
    appVersion() {
        return appVersion;
    },
    exit() {
        window.NativeInterface.exitApp();
    }
};
