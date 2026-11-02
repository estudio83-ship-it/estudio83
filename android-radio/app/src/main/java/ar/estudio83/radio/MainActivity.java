package ar.estudio83.radio;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.IOException;

public class MainActivity extends Activity {
    static final String HOST = "radio.local";
    private WebView web;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        if (Build.VERSION.SDK_INT >= 33) requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
        web = new WebView(this);
        web.setBackgroundColor(0xffecebe7);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        web.addJavascriptInterface(new Bridge(), "Android");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                if (!HOST.equals(r.getUrl().getHost())) return null;
                String path = r.getUrl().getPath();
                if (path == null || path.equals("/")) path = "/index.html";
                try {
                    String mime = path.endsWith(".html") ? "text/html" : "application/octet-stream";
                    return new WebResourceResponse(mime, "utf-8", getAssets().open(path.substring(1)));
                } catch (IOException e) {
                    return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", null, null);
                }
            }
        });
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

    class Bridge {
        @JavascriptInterface
        public void playing(boolean on, String station, String band) {
            Intent i = new Intent(MainActivity.this, RadioService.class);
            if (on) {
                i.putExtra("station", station);
                i.putExtra("band", band);
                if (Build.VERSION.SDK_INT >= 26) startForegroundService(i); else startService(i);
            } else {
                stopService(i);
            }
        }
    }
}
