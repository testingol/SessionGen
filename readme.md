# paste-example
pairing code deno
  
- ✅ Stores session IDs on Pastebin 
- ✅ Uses **Pastedeno** for Pastebin API interactions

---

## Installation & Setup

### 1. Clone the Repository
```sh
git clone https://github.com/naxordeve/paste-example.git
cd paste-example
```

## 2. Install Dependencies
Ensure you have Node.js and Deno installed
```sh
npm install
```

## 3. Configure Pastebin API
Create a config.ts file and add your Pastebin API key:
```sh
export const paste_dev_api_key = "your_api_key_here";
export api_user_username = "";
export api_user_password = "";
export const get_prefa = "Aqua~";  // Prefix for session IDs
```

## 4.Run the Server
Start the pairing server:
```
deno run --allow-net --allow-read mod.ts

```

## Using Node
```sh
node index.ts
```

## Pair Num
```sh
curl "http://localhost:3000/pair?code=MARETE
```

# Using Deno
Then, access it in config.ts:
```sh
export const paste_dev_api_key = Deno.env.get("paste_dev_api_key");

URS REGARDS Pablo Naxor👾
