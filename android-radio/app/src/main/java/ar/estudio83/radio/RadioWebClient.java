package ar.estudio83.radio;

import android.content.Context;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.IOException;

public class RadioWebClient extends WebViewClient {
    private final Context ctx;

    public RadioWebClient(Context ctx) { this.ctx = ctx.getApplicationContext(); }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
        if (!MainActivity.HOST.equals(r.getUrl().getHost())) return null;
        String path = r.getUrl().getPath();
        if (path == null || path.equals("/")) path = "/index.html";
        try {
            String mime = path.endsWith(".html") ? "text/html" : "application/octet-stream";
            return new WebResourceResponse(mime, "utf-8", ctx.getAssets().open(path.substring(1)));
        } catch (IOException e) {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", null, null);
        }
    }
}
