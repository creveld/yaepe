package eamu.ceed.yaepe;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class CardConvModule extends ReactContextBaseJavaModule {
    private final A converter = new A();

    CardConvModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "CardConv";
    }

    @ReactMethod
    void convertSID(String sid, Promise promise) {
        if (sid == null || sid.length() != 16) {
            promise.reject("SID_FORMAT_ERROR", "SID must be a 16-character hex string.");
            return;
        }

        try {
            promise.resolve(converter.toKonamiID(sid));
        } catch (Exception e) {
            promise.reject("CONVERSION_ERROR", e);
        }
    }
}
