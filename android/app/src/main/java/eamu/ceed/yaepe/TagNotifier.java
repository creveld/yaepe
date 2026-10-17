package eamu.ceed.yaepe;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

/**
 * Posts a system notification when the card that is currently being emulated
 * has been read by an NFC reader.
 *
 * The notification text is provided by JS when the card is activated, so the
 * notification follows the language selected inside the app.
 */
final class TagNotifier {
    private static final String TAG = "TagNotifier";
    private static final String CHANNEL_ID = "yaepe-card-tag";
    private static final int NOTIFICATION_ID = 1001;

    /** Two callbacks can report the same tag; only notify once per window. */
    private static final long MIN_INTERVAL_MS = 1500L;
    /** A deactivation right after enabling the service is not a real tag. */
    private static final long ARM_GRACE_MS = 700L;

    private static String title;
    private static String message;
    private static boolean armed;
    private static long armedAt;
    private static long lastNotifiedAt;

    private TagNotifier() {}

    /** Called when a card starts being emulated. */
    static synchronized void arm(String notificationTitle, String body) {
        title = notificationTitle;
        message = body;
        armed = title != null && message != null;
        armedAt = System.currentTimeMillis();
    }

    /** Stops notifying; used while the service is off (paused or disabled). */
    static synchronized void suspend() {
        armed = false;
    }

    /** Re-arms the previous text, e.g. after the app returns to the front. */
    static synchronized void resume() {
        if (title != null && message != null) {
            armed = true;
            armedAt = System.currentTimeMillis();
        }
    }

    /**
     * Reports that the emulated card has been read. Safe to call from both the
     * APDU handler and the deactivation callback: duplicates are ignored.
     */
    static synchronized void notifyTagged(Context context) {
        if (!armed) {
            return;
        }

        long now = System.currentTimeMillis();
        if (now - armedAt < ARM_GRACE_MS) {
            return;
        }
        if (now - lastNotifiedAt < MIN_INTERVAL_MS) {
            return;
        }
        lastNotifiedAt = now;

        try {
            NotificationManager manager =
                    (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager == null) {
                return;
            }

            ensureChannel(manager);

            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            PendingIntent contentIntent = PendingIntent.getActivity(
                    context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                    ? new Notification.Builder(context, CHANNEL_ID)
                    : new Notification.Builder(context);

            manager.notify(
                    NOTIFICATION_ID,
                    builder.setSmallIcon(R.drawable.ic_notification)
                            .setContentTitle(title)
                            .setContentText(message)
                            .setStyle(new Notification.BigTextStyle().bigText(message))
                            .setContentIntent(contentIntent)
                            .setAutoCancel(true)
                            .build());
        } catch (Exception e) {
            Log.e(TAG, "Failed to post the tag notification", e);
        }
    }

    private static void ensureChannel(NotificationManager manager) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        if (manager.getNotificationChannel(CHANNEL_ID) != null) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Card tag",
                NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("Notifies when the emulated card is read by a reader.");
        manager.createNotificationChannel(channel);
    }
}
