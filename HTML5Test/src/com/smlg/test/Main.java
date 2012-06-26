package com.smlg.test;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;

public class Main extends Activity {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
       
        WebView myWebView=(WebView) findViewById(R.id.myWebView);
        myWebView.getSettings().setJavaScriptEnabled(true);
        
        myWebView.loadUrl("file:///android_asset/www/index.html");

        
    }
}