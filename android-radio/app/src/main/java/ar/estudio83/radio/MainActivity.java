package ar.estudio83.radio;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends Activity {
    static final String HOST = "radio.local";
    private WebView web;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        if (Build.VERSION.SDK_INT >= 33) requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
        web = new WebView(this);
        web.setBackgroundColor(0xff111111);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        web.addJavascriptInterface(new RadioBridge(this), "Android");
        web.setWebViewClient(new RadioWebClient(this));
        setContentView(web);
        if (b != null) web.restoreState(b); else web.loadUrl("https://" + HOST + "/index.html");
    }

    @Override protected void onSaveInstanceState(Bundle o) { super.onSaveInstanceState(o); web.saveState(o); }

    @Override public void onBackPressed() { moveTaskToBack(true); }

    @Override
    protected void onDestroy() {
        stopService(new Intent(this, RadioService.class));
        web.destroy();
        super.onDestroy();
    }
}
