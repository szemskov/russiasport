/*
* PhoneGap is available under *either* the terms of the modified BSD license *or* the
* MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
*
* Copyright (c) 2005-2010, Nitobi Software Inc.
* Copyright (c) 2011, IBM Corporation
*/

package org.apache.cordova.video;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;

import org.json.JSONArray;
import org.json.JSONException;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.app.AlertDialog;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;

public class VideoPlayer extends CordovaPlugin {
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        PluginResult.Status status = PluginResult.Status.OK;
        String result = "";

        try {
            if (action.equals("playVideo")) {
                playVideo(args.getString(0));
            }
            else {
                status = PluginResult.Status.INVALID_ACTION;
            }
            callbackContext.sendPluginResult(new PluginResult(status, result));
        } catch (JSONException e) {
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
        } catch (IOException e) {
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.IO_EXCEPTION));
        }
        return true;
    }

    private void playVideo(String url) throws IOException {        
        // Create URI
        Uri uri = Uri.parse(url);

        Intent intent = null;
        // Check to see if someone is trying to play a YouTube page.

            // Display video player
        try{
        	intent = new Intent(Intent.ACTION_VIEW);
        	intent.setDataAndType(uri, "video/*");
        	this.cordova.getActivity().startActivity(intent);
        } catch(Exception e){
        	AlertDialog.Builder builder = new AlertDialog.Builder(this.cordova.getActivity());
        	builder.setTitle("Внимание")
        			.setMessage("Для просмотра контента необходимо установить RTSP player")
        			.setCancelable(true);
        	AlertDialog alert = builder.create();
        	alert.show();
        }
        
    }

    private void copy(String fileFrom, String fileTo) throws IOException {
        // get file to be copied from assets
        InputStream in = this.cordova.getActivity().getAssets().open(fileFrom);
        // get file where copied too, in internal storage.
        // must be MODE_WORLD_READABLE or Android can't play it
        FileOutputStream out = this.cordova.getActivity().openFileOutput(fileTo, Context.MODE_WORLD_READABLE);

        // Transfer bytes from in to out
        byte[] buf = new byte[1024];
        int len;
        while ((len = in.read(buf)) > 0)
            out.write(buf, 0, len);
        in.close();
        out.close();
    }
    
}