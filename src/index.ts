import { 
  default as makeWASocket, 
  delay, 
  useMultiFileAuthState, 
  DisconnectReason, 
  makeCacheableSignalKeyStore,
  Browsers,
  WASocket,
  ConnectionState
} from "@whiskeysockets/baileys";
import pino from "pino";
import { PasteClient, PrivacyLevel, ExpirationTime } from "https://deno.land/x/pastebin@1.0.1/mod.ts";
import fs from "fs";
import { Boom } from "@hapi/boom";
import express from "express";
import { paste_dev_api_key, auth, api_user_username, api_user_password, get_prefa } from "./config";
const pastebin = new PasteClient(paste_dev_api_key, api_user_username, api_user_password);                             
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const v = AUTH;
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
function Clean(): void {
  try {
    if (fs.existsSync("../session")) {
      fs.readdirSync("../session").forEach(file => fs.unlinkSync(`../session/${file}`));
    }} catch (error) {
    console.error(error);
  }}

async function startPair(): Promise<void> {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("../session");
    let conn: WASocket = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' }))
      },
      printQRInTerminal: false,
      logger: pino({ level: "fatal" }).child({ level: "fatal" }),
      browser: Browsers.macOS("Desktop"),
    });

    session.ev.process(async (events) => {
      if (events["connection.update"]) {
        const update = events["connection.update"] as Partial<ConnectionState>;
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
          await delay(10000);
          if (fs.existsSync(v)) {
            const db = fs.readFileSync(v, "utf8");
            let _cxl = await pastebin.createPaste({text: db,title: "session_id",format: null,
            privacy: PrivacyLevel.PRIVATE,
            expiration: ExpirationTime.NEVER,
           });
            const get_id = `${get_prefa}${_cxl.trim().replace("https://pastebin.com/", "")}`;
            await conn.sendMessage(conn.user!.id, {text: `*Note:* Dont share this _id with anyone\n *_Session ID_*: ${get_id}`,});
            process.exit(0);
          }}

        if (connection === "close") {
          const _why = new Boom(lastDisconnect?.error)?.output?.statusCode;
          const reason = DisconnectReason[_why] || "well_😂";
          console.log(`[]:${reason}`);
         if (_why !== DisconnectReason.loggedOut) {
            console.log("Retrying...");
            await delay(3000); 
            startPair();
          } else {
            Clean();
            process.exit(0);
          }}}
    });

    conn.ev.on("creds.update", saveCreds);
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "../public/index.html"));
    });
    app.get("/pair", async (req, res) => {
      let phone = req.query.code as string;
      if (!phone) {
      return res.status(418).json({ message: "_Provide your phone number_📱" });
      }try {
        await delay(1500);
        phone = phone.replace(/[^0-9]/g, ""); 
        if (!conn.authState.creds.registered) {
          const code = await conn.requestPairingCode(phone);
          if (!res.headersSent) {
            res.json({ code: code?.match(/.{1,4}/g)?.join("-") });
          }} else {
          res.status(400).json({ message: "Already registered." });
        }} catch (error) {
        console.error(error);
        res.status(500).json({ error: "err getin pair_code" });
      }
    });

    app.listen(3000, () => console.log("Server running on port 3000"));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
startPair();
                       
