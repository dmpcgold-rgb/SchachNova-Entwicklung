package at.schachnova.app

import android.app.Activity
import android.os.Bundle
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.content.Context
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

class MainActivity : Activity() {
    inner class Haptics {
        @JavascriptInterface
        fun vibrate(pattern: String) {
            val durations = pattern.split(",").mapNotNull { it.toLongOrNull()?.coerceIn(1, 500) }.take(8)
            if (durations.isEmpty()) return
            runOnUiThread {
                val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    if (durations.size == 1) vibrator.vibrate(VibrationEffect.createOneShot(durations[0], VibrationEffect.DEFAULT_AMPLITUDE))
                    else vibrator.vibrate(VibrationEffect.createWaveform(longArrayOf(0) + durations.toLongArray(), -1))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(durations[0])
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
        val view = WebView(this)
        view.settings.javaScriptEnabled = true
        view.settings.domStorageEnabled = true
        view.addJavascriptInterface(Haptics(), "AndroidHaptics")
        view.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                return request?.url?.let { loader.shouldInterceptRequest(it) }
            }
        }
        setContentView(view)
        view.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }
}
