package org.jellyfin.mobile.utils

import androidx.media3.common.C
import androidx.media3.common.TrackGroup
import androidx.media3.common.TrackSelectionOverride
import androidx.media3.exoplayer.trackselection.DefaultTrackSelector
import org.jellyfin.sdk.model.api.SubtitlePlaybackMode

/**
 * Select the [trackGroup] of the specified [type] and ensure the type is enabled.
 *
 * @param type One of the TRACK_TYPE_* constants defined in [C].
 * @param trackGroup the [TrackGroup] to select.
 */
fun DefaultTrackSelector.selectTrackByTypeAndGroup(type: Int, trackGroup: TrackGroup): Boolean {
    val parameters = with(buildUponParameters()) {
        clearOverridesOfType(type)
        addOverride(TrackSelectionOverride(trackGroup, 0))
        setTrackTypeDisabled(type, false)
    }
    setParameters(parameters)
    return true
}

/**
 * Clear selection overrides for all renderers of the specified [type] and disable them.
 *
 * @param type One of the TRACK_TYPE_* constants defined in [C].
 */
fun DefaultTrackSelector.clearSelectionAndDisableRendererByType(type: Int): Boolean {
    val parameters = with(buildUponParameters()) {
        clearOverridesOfType(type)
        setTrackTypeDisabled(type, true)
    }
    setParameters(parameters)
    return true
}

/**
 * Let the player pick subtitles from the file's own tracks as the user's subtitle [mode] and [language] ask,
 * like the AIOStreams desktop app does with mpv.
 */
fun DefaultTrackSelector.Parameters.Builder.setSubtitleMode(
    mode: SubtitlePlaybackMode?,
    language: String?,
): DefaultTrackSelector.Parameters.Builder = apply {
    val preferredLanguage = language?.takeIf(String::isNotEmpty)
    when (mode) {
        SubtitlePlaybackMode.NONE -> setTrackTypeDisabled(C.TRACK_TYPE_TEXT, true)
        SubtitlePlaybackMode.ONLY_FORCED -> setIgnoredTextSelectionFlags(C.SELECTION_FLAG_DEFAULT)
        // Also take subtitles without a language tag, common in fansub releases
        SubtitlePlaybackMode.ALWAYS -> {
            setPreferredTextLanguage(preferredLanguage)
            setSelectUndeterminedTextLanguage(true)
        }
        // ponytail: SMART acts like DEFAULT, skip subtitles over audio in the same language if needed
        else -> setPreferredTextLanguage(preferredLanguage)
    }
}
