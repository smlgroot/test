package com.smlg.test;

import org.apache.cordova.DroidGap;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;

public class Main extends DroidGap {
	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		/*
		 * super.onCreate(savedInstanceState);
		 * //requestWindowFeature(Window.FEATURE_NO_TITLE);
		 * 
		 * setContentView(R.layout.main);
		 * 
		 * WebView myWebView = (WebView) findViewById(R.id.webview);
		 * myWebView.getSettings().setJavaScriptEnabled(true);
		 * myWebView.setFocusableInTouchMode(false);
		 * myWebView.setPadding(0,0,0,0);
		 * myWebView.setScrollBarStyle(WebView.SCROLLBARS_OUTSIDE_OVERLAY);
		 * 
		 * myWebView.loadUrl("file:///android_asset/www/index.html");
		 * myWebView.addJavascriptInterface(new JavaScriptInterface(this),
		 * "Android");
		 */
			
		super.onCreate(savedInstanceState);
		//super.setStringProperty("loadingDialog", "Starting your app...");
		//super.setIntegerProperty("splashscreen", R.drawable.android);
		//super.loadUrl("file:///android_asset/www/index.html", 5000);
//		super.loadUrl("file:///android_asset/www/index.html");
		//super.loadUrl("file:///android_asset/www/mobile_website/app.html");
		super.loadUrl("file:///android_asset/www/testing/index.html");
	}
}