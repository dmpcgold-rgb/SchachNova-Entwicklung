package at.schachnova.app

import android.app.Activity
import android.os.Bundle
import android.webkit.WebView

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val view = WebView(this)
        view.settings.javaScriptEnabled = true
        setContentView(view)
        view.loadUrl("file:///android_asset/index.html")
    }
}
