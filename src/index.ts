
import { 
  default as makeWASocket, 
  delay, 
  useMultiFileAuthState, 
  DisconnectReason, 
  Browsers,
  WASocket,
  ConnectionState
} from "@whiskeysockets/baileys";
import pino from "pino";
import PastebinAPI from "pastebin-js";
import fs from "fs";
import { Boom } from "@hapi/boom";
import { PASTEBIN_API_KEY, AUTH, USE_PAIRING_CODE } from "./config";
const pastebin = new PastebinAPI(PASTEBIN_API_KEY);
const authFile = AUTH;
const usePairingCode = USE_PAIRING_CODE;




function clearState(): void {
  try {
    if (fs.existsSync('../session')) {
      const files = fs.readdirSync('../session');
      for (const file of files) {
        fs.unlinkSync(`../session/${file}`);
      }
      console.log('_cleared_');
    }
  } catch (error) {
    console.error(error);
  }
}


async function start(): Promise<void> {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("../session");
    let sock: WASocket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
      browser: Browsers.macOS("Desktop"),
    });

    if (!sock.authState.creds.registered) {
        await delay(1500);
       const phone = phone.replace(/[^0-9]/g, '');
       const code = sock.requestPairingCode(phone);
        if (!res.headersSent) {
            res.send({ code: code?.match(/.{1,4}/g)?.join('-') });
        }
    }
    sock.ev.process(async (events) => {
      if (events["connection.update"]) {
        const update = events["connection.update"] as Partial<ConnectionState>;
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
          await delay(10000);
          if (fs.existsSync(authFile)) {
            const fileData = fs.readFileSync(authFile, 'utf8');
            let link = await pastebin.createPaste({
              text: fileData,
              title: "session_id",
              format: null,
              privacy: 1,
            });
            const sessionID = link.replace("https://pastebin.com/", "");
            await sock.sendMessage(sock.user!.id, {
              text: `_session_id:_ ${sessionID}`
            });
            process.exit(0);
          } else {
            console.error("Auth file not found!");
          }
        }

        /** Handle disconnection cases */
        if (connection === "close") {
          let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
          switch (reason) {
            case DisconnectReason.connectionClosed:
              console.log('[Connection closed, reconnecting....!]');
              start();
              break;
            case DisconnectReason.connectionLost:
              console.log('[Connection lost, reconnecting....!]');
              start();
              break;
            case DisconnectReason.loggedOut:
              console.log('[Logged out, clearing state....]');
              clearState();
              process.exit(0);
              break;
            case DisconnectReason.restartRequired:
              console.log('[Restart required, restarting....]');
              start();
              break;
            case DisconnectReason.timedOut:
              console.log('[Timed out, reconnecting....]');
              start();
              break;
            case DisconnectReason.badSession:
              console.log('[Bad session, clearing state and restarting....]');
              clearState();
              start();
              break;
            case DisconnectReason.connectionReplaced:
              console.log('[Connection replaced, restarting....]');
              start();
              break;
            default:
              console.error('[Unknown disconnect reason, restarting....]');
              start();
              break;
          }
        }
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
start();
