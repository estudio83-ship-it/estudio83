package ar.estudio83.radio;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.webkit.JavascriptInterface;

public class RadioBridge {
    private final Context ctx;

    public RadioBridge(Context ctx) { this.ctx = ctx.getApplicationContext(); }

    @JavascriptInterface
    public void playing(boolean on, String station, String band) {
        Intent i = new Intent(ctx, RadioService.class);
        if (on) {
            i.putExtra("station", station);
            i.putExtra("band", band);
            if (Build.VERSION.SDK_INT >= 26) ctx.startForegroundService(i); else ctx.startService(i);
        } else {
            ctx.stopService(i);
        }
    }
}
