package eamu.ceed.yaepe;

import android.nfc.cardemulation.HostNfcFService;
import android.os.Bundle;

public class YaepeService extends HostNfcFService {
    /**
     * Handles the response packet for an NFC reader command.
     *
     * Still a stub: the emulation is answered by the framework itself, so there is
     * no card authentication/response logic to run here yet.
     *
     * A command from the reader is proof that the card has been picked up, which is
     * the point where the "card was read" notification is posted.
     */
    @Override
    public byte[] processNfcFPacket(byte[] commandPacket, Bundle extras){
        TagNotifier.notifyTagged(this);
        return null;
    }

    /**
     * Called when the connection to the reader is lost.
     *
     * Second notification point, covering readers that poll the card and then stop
     * without a command being handled. TagNotifier filters out the duplicates.
     */
    @Override
    public void onDeactivated(int reason)
    {
        TagNotifier.notifyTagged(this);
    }
}
