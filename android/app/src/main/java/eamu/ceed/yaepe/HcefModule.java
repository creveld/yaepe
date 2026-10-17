package eamu.ceed.yaepe;

import android.app.Activity;
import android.content.ComponentName;
import android.content.pm.PackageManager;
import android.nfc.NfcAdapter;
import android.nfc.cardemulation.NfcFCardEmulation;
import android.util.Log;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class HcefModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private static final String TAG = "HcefModule";
    private static final String SERVICE_CLASS = "eamu.ceed.yaepe.YaepeService";
    private static final String SYSTEM_CODE = "4000";
    private static final Pattern NFCID2_PATTERN = Pattern.compile("^[0-9A-Fa-f]{16}$");

    private final ReactApplicationContext reactContext;
    private final boolean isHceFSupport;
    private boolean isHceFEnabled = false;
    private boolean nowUsing = false;
    private NfcAdapter nfcAdapter;
    private NfcFCardEmulation nfcFCardEmulation;
    private ComponentName componentName;

    HcefModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        this.reactContext.addLifecycleEventListener(this);

        PackageManager manager = context.getPackageManager();
        if (!manager.hasSystemFeature(PackageManager.FEATURE_NFC_HOST_CARD_EMULATION_NFCF)) {
            this.isHceFSupport = false;
            return;
        }
        this.isHceFSupport = true;

        nfcAdapter = NfcAdapter.getDefaultAdapter(context);
        if (nfcAdapter != null && nfcAdapter.isEnabled()) {
            nfcFCardEmulation = NfcFCardEmulation.getInstance(nfcAdapter);
            componentName = new ComponentName(context.getPackageName(), SERVICE_CLASS);
            if (nfcFCardEmulation != null) {
                isHceFEnabled =
                        nfcFCardEmulation.registerSystemCodeForService(componentName, SYSTEM_CODE);
            }
        }
    }

    @Override
    public String getName() {
        return "Hcef";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("support", isHceFSupport);
        constants.put("enabled", isHceFEnabled);
        return constants;
    }

    @ReactMethod
    void enableService(String sid, String notificationTitle, String notificationMessage, Promise promise) {
        if (nfcFCardEmulation == null || componentName == null) {
            promise.reject("NULL_ERROR", "nfcFCardEmulation or componentName is null");
            return;
        }

        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is not available");
            return;
        }

        if (sid == null || !NFCID2_PATTERN.matcher(sid).matches()) {
            promise.reject("SID_FORMAT_ERROR", "NFCID2 must be a 16-character hex string.");
            return;
        }

        try {
            if (!nfcFCardEmulation.setNfcid2ForService(componentName, sid)) {
                promise.reject("SET_NFCID2_FAIL", "setNfcid2ForService returned false");
                return;
            }

            if (!nfcFCardEmulation.enableService(activity, componentName)) {
                promise.reject("ENABLE_FAIL", "enableService returned false");
                return;
            }

            nowUsing = true;
            TagNotifier.arm(notificationTitle, notificationMessage);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "enableService failed", e);
            promise.reject("ENABLE_ERROR", e);
        }
    }

    @ReactMethod
    void disableService(Promise promise) {
        if (nfcFCardEmulation == null || componentName == null) {
            promise.reject("NULL_ERROR", "nfcFCardEmulation or componentName is null");
            return;
        }

        Activity activity = getCurrentActivity();
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is not available");
            return;
        }

        // Disabling the service deactivates the target, which must not be
        // reported as "the card was tagged".
        TagNotifier.suspend();

        try {
            if (!nfcFCardEmulation.disableService(activity)) {
                promise.reject("DISABLE_FAIL", "disableService returned false");
                return;
            }

            nowUsing = false;
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "disableService failed", e);
            promise.reject("DISABLE_ERROR", e);
        }
    }

    @Override
    public void onHostResume() {
        Activity activity = getCurrentActivity();
        if (nfcFCardEmulation != null && componentName != null && nowUsing && activity != null) {
            nfcFCardEmulation.enableService(activity, componentName);
            TagNotifier.resume();
        }
    }

    @Override
    public void onHostPause() {
        Activity activity = getCurrentActivity();
        if (nfcFCardEmulation != null && componentName != null && nowUsing && activity != null) {
            TagNotifier.suspend();
            nfcFCardEmulation.disableService(activity);
        }
    }

    @Override
    public void onHostDestroy() {
    }

    @Override
    public void invalidate() {
        reactContext.removeLifecycleEventListener(this);
        super.invalidate();
    }
}
