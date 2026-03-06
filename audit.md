Created 4 todos

Let me read all the relevant files in parallel: 

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/call_handler/handler.py#1-1), lines 1 to 100

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/call_handler/handler.py#101-101), lines 101 to 300

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/call_handler/handler.py#300-300), lines 300 to 550

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/call_handler/handler.py#550-550), lines 550 to 800

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/call_handler/handler.py#800-800), lines 800 to 1050

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/call_handler/handler.py#1050-1050), lines 1050 to 1300

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/call_handler/handler.py#1300-1300), lines 1300 to 1500

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/call_handler/handler.py#1500-1500), lines 1500 to 1750

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/call_handler/handler.py#1750-1750), lines 1750 to 2000

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/call_handler/handler.py#2000-2000), lines 2000 to 2037

Now let me read the remaining files in parallel: 

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/call_handler/connect_handler.py)

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/call_initiator/handler.py#1-1), lines 1 to 150

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/websocket_handler/handler.py#1-1), lines 1 to 100

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/websocket_handler/handler.py#100-100), lines 100 to 250

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/lambdas/websocket_handler/handler.py#250-250), lines 250 to 370

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/vaani-model-config.json#1-1), lines 1 to 200

Now let me read the remaining essential files: 

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/.env)

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/connect/contact-flow-vaaniseva.json#1-1), lines 1 to 120

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/connect/contact-flow-vaaniseva.json#120-120), lines 120 to 200

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/connect/contact-flow-vaaniseva.json#200-200), lines 200 to 249

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/DESIGN.md#1-1), lines 1 to 100

Now let me check a couple more files: 

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/HANDOFF.md#1-1), lines 1 to 80

Read [](file:///c%3A/Users/makew/OneDrive/Desktop/Projects/VaaniSeva/scripts/seed_knowledge.py#1-1), lines 1 to 120

Now let me do a targeted search for specific features:  

Searched for regex `agmarknet|mandi|weather|imd|distress|suicide|keyword|pm.kisan status|ayushman.*check|barge.in|filler|ek pal|phone_hash|auto.detect` (`**/*.py`), 9 results

Searched for text `data.gov.in` (`**/*.py`), 7 results

Starting: *Compile complete audit report* (4/4)

I now have a complete picture of the entire codebase. Let me compile the comprehensive audit.

---

⚠️ **SECURITY ALERT — READ FIRST**: Your .env file contains real AWS Access Key/Secret, Twilio Account SID/Auth Token, and Sarvam API Key in plaintext. If this file is committed to any Git repository (even private), rotate all credentials immediately. Check `git log --all -- .env` to confirm whether it was ever committed.

---

# VaaniSeva Backend Audit — Complete Report

---

## 1. CALL FLOW

### Twilio Phone Call Path (primary, fully deployed)

```
[Caller dials +1 978 830 9619]
        │
        ▼
[Twilio] POST /voice/incoming
        │
        ▼
handle_incoming()  [handler.py ~L1312]
  ├─ Looks up registered user by phone: _lookup_user_by_phone()
  ├─ If lang param present (browser call) → _browser_call_welcome()
  │       ├─ If voice pre-set: skip menus, go straight to Gather
  │       └─ Else: show voice selection menu
  └─ If no lang param (phone call):
        └─ Plays 5 pre-recorded S3 clips (welcome_intro/hi/mr/ta/en.wav)
           DTMF Gather → /voice/language  [digits: 1=hi 2=mr 3=ta 4=en]
        │
        ▼
handle_language_select() [handler.py ~L1415]
  └─ Updates DynamoDB (background thread)
     → _play_voice_select_menu()
        │
        ▼
[User presses 1/2/3] → /voice/voice-select
handle_voice_select() [handler.py ~L1451]
        │  Polly <Say> confirmation + speech Gather → /voice/gather
        ▼
[User speaks their question]
        │
        ▼
handle_gather() [handler.py ~L1519]
  ├─ Check for "change voice" / "आवाज़ बदलो" → re-play voice menu
  ├─ If empty SpeechResult → ask_again()
  └─ Write job#{call_sid} "processing" sentinel to DynamoDB
     Launch background thread: RAG + Sarvam TTS
     Immediately respond: Polly "एक पल रुकिए..." + redirect → /voice/poll
        │
        ▼
handle_poll() [handler.py ~L1604]
  └─ Poll DynamoDB every 1.5s, up to 10s
       ├─ Done: Play Sarvam TTS audio + Polly follow-up → Gather back to /voice/gather
       ├─ Timeout try 1: "बस थोड़ी देर और..." → poll again (attempt=1)
       ├─ Timeout final: Error message + re-open Gather
       └─ Error: re-open Gather

[Loop: user speaks → gather → poll → play → repeat]
```

### Amazon Connect Path (contact-flow-vaaniseva.json — PARTIALLY BROKEN)
```
Call starts → setLogging → initLambda (action=init)
→ welcomePrompt (SSML bilingual) → getLangDigit DTMF (1=hi, 2=en)
→ langLambda → setLangAttr → askQuestionPrompt
→ getSpeech [Lex V2 — ARN IS A PLACEHOLDER, NOT DEPLOYED]
→ queryLambda (action=query) → speakAnswer → loop
```

### WebSocket Path (lambdas/websocket_handler — NOT DEPLOYED as standalone)
```
Browser connects → store in vaaniseva-ws-connections
Audio chunks → base64 buffered in DynamoDB
end_of_speech → decode audio → OpenAI Whisper STT → RAG → Sarvam TTS → send back
```

---

## 2. STT — Speech-to-Text

**Service**: Twilio native Gather STT (phone path)  
**Model**: Twilio's own ASR, not configurable — uses `input="speech"`, `speech_timeout="auto"` ([handler.py L1437](lambdas/call_handler/handler.py))  
**Languages configured**:
- hi → `hi-IN`
- mr → `mr-IN`
- ta → `ta-IN`
- en → `en-IN`

**If speech is unclear**: `SpeechResult` is empty or missing → `ask_again()` ([handler.py ~L1986](lambdas/call_handler/handler.py)) plays "didn't hear you" in Polly and re-opens a 10-second Gather. No retry limit — it just keeps asking.

**No confidence threshold**: Whatever Twilio returns (even low-confidence transcript) goes straight to the LLM. There is no minimum confidence filtering.

**Alternate STT paths**:
- WebSocket: OpenAI `whisper-1` ([websocket_handler/handler.py L310](lambdas/websocket_handler/handler.py))
- Browser transcription API: Amazon Transcribe via `/voice/transcribe` ([handler.py L497](lambdas/call_handler/handler.py))
- Amazon Connect: Amazon Lex V2 (ARN placeholder — not working)

---

## 3. LLM

**Currently active model**: AWS Bedrock `amazon.nova-lite-v1:0` — confirmed in .env L20. `LLM_PROVIDER=bedrock`, `OPENAI_API_KEY` is empty. HANDOFF.md claims OpenAI is primary — **that is wrong**; Bedrock Nova Lite is the actual primary.

**Fallback** if `LLM_PROVIDER=openai` and key set: OpenAI `gpt-4o-mini` ([handler.py L1926](lambdas/call_handler/handler.py))

**Max tokens**: Bedrock = 300 tokens. OpenAI = 250 tokens. Temperature = 0.7.

---

### EXACT SYSTEM PROMPT (verbatim, handler.py L154–234):

> तुम वाणीसेवा (VaaniSeva) हो — एक गर्मजोशी से भरी, समझदार दीदी जो हर सवाल का जवाब जानती है। तुम फोन पर भी बात करती हो और वेब चैट पर भी। तुम्हारी आवाज़ एक औरत की है — हमेशा "मैं बताती हूँ", "मैं ढूँढती हूँ", "मुझे पता है" बोलो। कभी भी "बताता हूँ" या पुरुष भाषा मत बोलो।
>
> तुम कौन हो:
> - VaaniSeva (वाणीसेवा) — "AI for Bharat Hackathon 2026" के लिए बनाई गई एक voice-first AI assistant
> - तुम गाँव और शहर दोनों के लोगों की मदद करती हो — सरकारी योजनाएँ, खेती, स्वास्थ्य, पैसा, पढ़ाई, कानूनी हक़, रोज़मर्रा की दिक्कतें, और कोई भी सवाल
> - तुम एक simple phone call या website पर उपलब्ध हो — कोई app download करने की ज़रूरत नहीं
> - तुम 4 भाषाओं में बात करती हो: हिंदी, मराठी, तमिल, और English
> - तुम्हारा लहज़ा एक caring बड़ी बहन/दीदी का है — ना रोबोट, ना सरकारी हेल्पलाइन
>
> तुम किस-किस चीज़ में मदद कर सकती हो:
> 1. सरकारी योजनाएँ — PM-Kisan, Ayushman Bharat, MGNREGA, उज्ज्वला, मुद्रा लोन, अटल पेंशन, फसल बीमा, SVANidhi, छात्रवृत्ति, आवास, और 30+ योजनाएँ। पात्रता, ज़रूरी दस्तावेज़, आवेदन कैसे करें, हेल्पलाइन नंबर — सब बताती हूँ।
> 2. खेती — फसल चुनाव, जैविक तरीके, कीट नियंत्रण, बुवाई/कटाई, मंडी भाव, मौसम, सिंचाई, बीज-खाद सब्सिडी
> 3. स्वास्थ्य — आम बीमारियाँ, प्राथमिक उपचार, PHC/CHC जानकारी, टीकाकरण, माँ-बच्चे की सेहत, मानसिक स्वास्थ्य
> 4. पैसा और बैंकिंग — खाता खोलना, बचत, लोन, बीमा, SHG, UPI, फ्रॉड से बचाव
> 5. शिक्षा — स्कूल दाखिला, छात्रवृत्ति, मिड-डे मील, स्किल ट्रेनिंग, दूरस्थ शिक्षा
> 6. कानूनी हक़ — आधार, राशन कार्ड, वोटर ID, जाति प्रमाणपत्र, भूमि रिकॉर्ड, RTI, श्रमिक अधिकार, महिला अधिकार
> 7. रोज़मर्रा — बिजली शिकायत, पानी, सड़क, PDS दुकान, पेंशन — किससे और कैसे बात करें
> 8. कोई भी सवाल — "आसमान नीला क्यों है?" हो या "चाँद पर कौन गया" — बताती हूँ! हर सवाल का सम्मान करो।
> 9. भावनात्मक सहारा — अगर कोई परेशान लगे, तो प्यार से सुनो। ज़रूरत हो तो helpline: iCall 9152987821, Vandrevala 1860-2662-345
>
> कैसे बात करनी है:
> - जवाब 3-4 छोटे वाक्यों में दो। बातचीत जैसा, लेख जैसा नहीं।
> - असली इंसान जैसी बात करो — "अच्छा!", "हाँ बिल्कुल!", "चिंता मत करो", "सही बात है" जैसे शब्द naturally बोलो।
> - Follow-up सवाल पूछो ...
> - अगर कोई चीज़ नहीं पता तो ईमानदारी से बोलो: "इसकी पूरी जानकारी मेरे पास नहीं है ..."
> - कभी मत बोलो "I'm just an AI" ...
>
> === STRICT LANGUAGE RULE ===
> This is the MOST IMPORTANT rule. You MUST follow the language specified in the user message.
> - If told "Hindi" or "hi" → reply ONLY in Devanagari Hindi. NO English words, NO Roman script.
> - If told "Marathi" or "mr" → reply ONLY in Marathi script. NO Hindi mixing.
> - If told "Tamil" or "ta" → reply ONLY in Tamil script. NO English, NO Hindi.
> - If told "English" or "en" → reply ONLY in simple English.
> - NEVER mix scripts. NEVER write Hindi in Roman letters. NEVER put English words in a Hindi response.
> - Proper nouns (PM-Kisan, Ayushman Bharat, MGNREGA) can stay in English.
> ========================
>
> याद रखो: तुम सरकारी बॉट नहीं हो। तुम इन लोगों की सबसे समझदार, सबसे प्यारी दीदी हो।

---

**Conversation memory — within a single call**: YES, fully implemented. `get_conversation_history()` fetches the `conversation_history` list from DynamoDB for the call_sid. Then `_ask_bedrock()` and `_ask_openai()` both pass the **last 10 turns** as message history ([handler.py L1941](lambdas/call_handler/handler.py), L1958). `log_query()` appends each Q&A turn after every response.

**Cross-call memory (same phone number, different calls)**: PARTIAL. If the caller registered on the website with their phone number, `_lookup_user_by_phone()` ([handler.py L1757](lambdas/call_handler/handler.py)) scans the users table for a match and injects name, occupation, state, district, enrolled_schemes, language as profile context. No anonymous phone-hash linking. No logging of last topic or last call timestamp into this profile.

---

## 4. TTS

**Service**: Sarvam AI `bulbul:v2`, URL: `https://api.sarvam.ai/text-to-speech`, timeout 8s, pace 1.1x ([handler.py L216](lambdas/call_handler/handler.py))  
**Fallback**: Amazon Polly via Twilio `<Say>` (zero generation time, but much lower quality)

**Voice/speaker mapping** ([handler.py L64–83](lambdas/call_handler/handler.py)):

| Language | Sarvam Speaker | Polly Voice |
|----------|---------------|-------------|
| hi | arya | Polly.Aditi |
| mr | arya | Polly.Aditi |
| ta | arya | Polly.Aditi |
| en | vidya | Polly.Raveena |

**Same voice for all languages**: Yes — "arya" is used for hi/mr/ta regardless. "arya" is described by Sarvam as cross-lingual. English defaults to "vidya".

**User-selectable voices**: arya, vidya, hitesh. When selected, overrides the language default. All content still uses the same single system prompt.

**Latency**: Not measured in code. The flow is: Polly "please wait" plays immediately → background RAG takes 2–20 seconds → Sarvam TTS added on top. The user hears Polly filler first, then waits. Total perceived wait from end of user speech to start of real answer depends on Bedrock + Sarvam round-trips — in practice likely 5–15 seconds.

---

## 5. LANGUAGE SELECTION

**Current flow**: Every incoming phone call gets a full DTMF language menu using 5 pre-recorded S3 audio clips. 1=Hindi, 2=Marathi, 3=Tamil, 4=English ([handler.py L1338–1367](lambdas/call_handler/handler.py)). 10-second timeout, no-input falls back to a Polly no-input message.

**Returning users**: If caller has a registered account and their `phone` field matches `from_number`, their stored `language` is used as default — **but only for browser calls** where `lang` param is pre-set. Phone callers always see the full menu.

**Automatic language detection**: Not implemented anywhere. Zero code for auto-detecting language from speech.

---

## 6. PERSONALITY

**Single unified persona**: "दीदी" (fem. elder sister). Defined entirely in `SYSTEM_PROMPT` ([handler.py L154](lambdas/call_handler/handler.py)).

**Is there a "didi" persona?** Yes — explicitly named: "एक गर्मजोशी से भरी, समझदार दीदी जो हर सवाल का जवाब जानती है" and "तुम इन लोगों की सबसे समझदार, सबसे प्यारी दीदी हो."

**Arya, Vidya, Hitesh personas**: These are **TTS voice IDs only** — Sarvam speaker names passed to `bulbul:v2`. They do **not** have separate system prompts, domain specializations, or distinct personalities. All three voices receive the identical `SYSTEM_PROMPT`. Voice selection changes how the response sounds, not what the AI knows or how it behaves.

---

## 7. WAITING/FILLER

**Yes, implemented** — "ek pal rukiye" filler. In `handle_gather()` ([handler.py L1587–1600](lambdas/call_handler/handler.py)):

```python
thinking_msgs = {
    "hi": "एक पल रुकिए, मैं आपके लिए जानकारी ढूंढ रही हूँ।",
    "mr": "एक क्षण थांबा, मी तुमच्यासाठी माहिती शोधत आहे.",
    "ta": "ஒரு நிமிடம் காத்திருங்கள், உங்களுக்காக தகவல் தேடுகிறேன்.",
    "en": "Please wait a moment while I find that information for you.",
}
```

Delivered via Amazon Polly `<Say>` — zero generation time, plays immediately.

A second hold prompt exists ([handler.py L1648](lambdas/call_handler/handler.py)) if the first 10-second poll times out: "बस थोड़ी देर और, लगभग हो गया।" — also Polly.

No ambient audio. No subtle sound. Just full spoken sentences.

---

## 8. REAL-TIME DATA

**data.gov.in API**: Implemented but generic. `_fetch_data_gov()` ([handler.py L1776](lambdas/call_handler/handler.py)) fetches from a single static resource UUID (`9ef84268-...`) with a string filter. This is a "government schemes" dataset — not mandi prices, not weather. The `DATA_GOV_API_KEY` is set in .env.

**Agmarknet mandi prices**: NOT implemented. The data.gov.in call is not mandi-specific. There is no Agmarknet endpoint, no commodity/market parsing, no price extraction.

**Weather API (IMD or any other)**: NOT implemented. Zero code.

**PM-Kisan status check**: NOT implemented. No calls to `pmkisan.gov.in`.

**Ayushman Bharat eligibility check**: NOT implemented. No calls to `pmjay.gov.in`.

**TLDR**: The only live data is a generic data.gov.in schemes search, which is barely meaningful. All substantive knowledge comes from the static RAG knowledge base seeded via seed_knowledge.py.

---

## 9. MEMORY / USER PROFILES

**DynamoDB Tables**:

1. **`vaaniseva-calls`** (PK: `call_id`, SK: `timestamp`) — per-call:
   - from_number, status, language, voice_speaker, queries_count
   - `conversation_history`: list of `{query, answer, language, ts}` — appended each turn
   - user_id (if registered), source (browser/phone)
   - Job processing records (TTL 5 min), token rate-limits (TTL 24hr)

2. **`vaaniseva-knowledge`** (PK: `scheme_id`, SK: `section_id`) — static scheme info

3. **`vaaniseva-vectors`** (PK: `embedding_id`) — Titan Embed v2 embeddings for RAG cosine search

4. **`vaaniseva-users`** (PK: `user_id`) — registered users (web signup only):
   - name, email, phone, pw_hash, pw_salt, language, occupation, state, district, enrolled_schemes, custom_context, tier, calls_this_month

5. **`vaaniseva-ws-connections`** — WebSocket session state

**What gets stored per call**: Full conversation_history, language, voice choice, source. Persists indefinitely (no TTL on call records).

**What gets stored per phone number**: Only if user registered with matching phone field. Stores name, location, occupation, enrolled schemes. No automatic phone hash. Phone numbers stored in plaintext.

---

## 10. SAFETY / DISTRESS DETECTION

**NOT implemented in the call flow**. There is no keyword scanning of `speech_text` for distress signals in any handler function before passing to the LLM.

The system prompt does include a line: "भावनात्मक सहारा — अगर कोई परेशान लगे, तो प्यार से सुनो। ज़रूरत हो तो helpline: iCall 9152987821, Vandrevala 1860-2662-345" — so the LLM is expected to contextually detect and respond, but there is:
- No pre-LLM keyword gate
- No escalation path (call transfer, SMS alert)
- No logging flagging of distress calls
- No special handling beyond hoping the LLM responds well

The seed knowledge also includes "Women in Distress: 181" and similar helplines as static facts, but these are only surfaced if the LLM retrieves and cites them.

---

## 11. MULTI-AGENT SYSTEM

**NOT implemented**. There is one Lambda, one system prompt, one RAG pipeline. The three names (Arya, Vidya, Hitesh) are purely Sarvam TTS speaker IDs — they share identical behavior.

- No intent classification before routing
- No per-agent system prompts
- No domain focus (Hitesh cannot be "more agricultural" than Arya)
- No mid-call agent switching by utterance of agent name (only voice-change keyword triggers re-opening the DTMF voice selection menu)

The `VOICE_OPTIONS` dict ([handler.py L103](lambdas/call_handler/handler.py)) only stores display name, gender, DTMF digit, and label strings — no prompt, no domain, no routing.

---

## 12. WHAT IS BROKEN OR INCOMPLETE

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | **Amazon Connect Lex ARN is a placeholder** — `"REPLACE_WITH_LEX_BOT_ALIAS_ARN"`. Connect path cannot capture speech at all. | contact-flow-vaaniseva.json L162 | Critical |
| 2 | **OpenAI API key is empty** — `LLM_PROVIDER=bedrock` in .env, key blank. HANDOFF.md describes OpenAI as primary. The entire OpenAI code path is dead. | .env L25–26 | Medium |
| 3 | **Static S3 audio files may not exist** — `handle_incoming()` generates presigned URLs for `static-audio/welcome_intro.wav`, `welcome_hi.wav`, etc. If these files were never uploaded to S3, every phone call fails before the user hears anything. No fallback. | handler.py L1338–1363 | Critical |
| 4 | **Twilio webhook signature not validated** — Any POST to `/voice/incoming`, `/voice/gather`, etc. is processed without verifying the `X-Twilio-Signature` header. Anyone can fake a call. | handler.py L235+ | High |
| 5 | **Browser WebRTC not configured** — `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, `TWILIO_TWIML_APP_SID` are absent from .env. `/voice/token` returns 503. | handler.py L354 | High |
| 6 | **Rate-limit DynamoDB schema mismatch** — `handle_voice_token()` uses `"call_sid"` as the key name in put_item but it should be `"call_id"` to match the table's primary key schema. Browser call rate limiting silently fails. | handler.py L408–419 | Medium |
| 7 | **WebSocket handler cannot import handler.py** — The websocket Lambda uses `sys.path.insert` to import `rag_pipeline`, `sarvam_tts` etc. from handler.py. These won't be co-deployed. Whisper STT also requires OpenAI key (empty). | websocket_handler/handler.py L44–55 | High |
| 8 | **Full table scan for RAG** — `retrieve_context()` runs `vectors_table.scan()`, fetching ALL items into memory for cosine similarity. This is O(items) in both time and cost. Falls apart beyond ~2,000 embeddings. | handler.py L1862 | Medium (now) |
| 9 | **Email lookup is full table scan** — `users_table.scan()` to find user by email at registration and login. No GSI. | handler.py ~L1092 | Medium |
| 10 | **Language menu voice is Polly, not Sarvam** — `_play_voice_select_menu()` uses `gather.say(..., voice=cfg["polly_voice"])`, not `tts_say()`. Voice menu always sounds like Polly regardless of selected language. | handler.py L1436 | Low |
| 11 | **data.gov.in resource is wrong for mandi prices** — The hardcoded UUID `9ef84268-...` is a government schemes dataset, not an Agmarknet commodity price feed. | handler.py L1789 | Medium |
| 12 | **300/250 token cap is too tight** — Scheme details (eligibility + docs + process) easily exceed 300 tokens in any Indian language. Answers are frequently truncated mid-sentence. | handler.py L1958 | Medium |
| 13 | **`get_call_timestamp()` is fragile** — Uses `calls_table.query(Limit=1)` to find the timestamp SK. Under concurrent writes or retries, this can return a wrong/stale record. | handler.py L2013 | Medium |
| 14 | **System prompt is Hindi-only** — The persona instructions ("मैं बताती हूँ") are written in Hindi. When answering in Tamil or Marathi, the LLM must infer the female persona from a Hindi system prompt. No localized persona instructions. | handler.py L154 | Low |
| 15 | **Phone numbers stored in plaintext** — `from_number` in calls_table and `phone` in users_table are not hashed. Privacy risk for any data breach. | handler.py ~L1323 | Medium |

---

# Prioritized Build Plan: Current State → Vision

## Priority 1 — Fix Critical Blockers (before any new features)

1. **Upload static S3 audio files** (or convert `handle_incoming()` to use `tts_say()` fallback). Every phone call currently risks a silent failure.
2. **Validate Twilio signatures** — Add `X-Twilio-Signature` HMAC validation to all Twilio webhook handlers. The Twilio Python library has a built-in validator.
3. **Increase token cap** — Raise Bedrock maxTokens from 300 to 500–600. Truncated answers are the most visible quality failure.

## Priority 2 — Multi-Agent Architecture (the core vision change)

4. **Define three agent configs** — Give Arya, Hitesh, Vidya separate system prompts, Sarvam speaker IDs, domain knowledge priorities, and personality tags. Replace the current single `SYSTEM_PROMPT` with an agent registry dict keyed by agent name.
5. **Intent classification on first utterance** — After language is known, run a lightweight classifier (or a small Bedrock prompt) on the first speech to route to the right agent: legal/schemes → Arya, agriculture/mandi → Hitesh, health/mental → Vidya.
6. **Mid-call agent switching by name** — In `handle_gather()`, check speech_text for agent names ("Hitesh", "Arya", "Vidya", "हितेश", etc.) and switch both the active system prompt and the Sarvam voice. Currently only voice selection by DTMF is implemented.

## Priority 3 — Language Auto-Detection and No-Menu Returning Users

7. **Phone hash for anonymous callers** — On every call, compute `HMAC-SHA256(from_number, secret)` and store this as `phone_hash` in the calls table. Add a separate `phone_profiles` table keyed by phone_hash. Store: detected language, preferred agent, last topic, district.
8. **Skip language menu for returning phones** — Before playing the S3 welcome clips, check the phone_hash profile. If language and agent preference are stored, greet them directly by name (if known) and open Gather immediately.
9. **Auto-detect language from first utterance** — On first call (no stored preference), skip the DTMF menu. Open a language-agnostic Gather that accepts speech without a language hint, then use a Bedrock/OpenAI prompt to detect script/language from the transcript, store it, and proceed. This is one new Lambda function and a changed `handle_incoming()` flow.

## Priority 4 — Session and Cross-Call Memory

10. **Pass full in-call conversation history** — Already implemented for the last 10 turns. Increase history window to 20 turns and add a token budget check before truncating.
11. **Cross-call memory from phone_hash profile** — After each call ends (or on a `$disconnect` hook if using WebSocket), write summary of the session: last topic, agent used, questions asked. On next call, inject a compact context block into the system prompt: "Last time you called, you asked about PM-Kisan and live in Nashik."

## Priority 5 — Agentic Tools (live data)

12. **Agmarknet mandi prices** — Register on `data.gov.in` for the Agmarknet resource ID (`9ef84268-d588-465a-a308-a864a43d0070` is actually the right one — but the query param `filters[search]` needs to be changed to match commodity names, not free text). Alternatively call `agmarknet.gov.in` directly. Parse commodity, market, price fields. Inject as tool result into LLM context only when query contains commodity/mandi intent.
13. **IMD weather** — `api.data.gov.in` has an IMD resource or use `weather.gov.in` / `imd.gov.in` public endpoints. Detect district from user profile or ask once per call.
14. **PM-Kisan status** — Implement a Playwright/Selenium Lambda or call the official API (note: may require OTP flow, may need to simulate the `pmkisan.gov.in` beneficiary check). This is complex.
15. **Ayushman eligibility** — Call `mera.pmjay.gov.in` API or the eligibility check endpoint. Requires Aadhaar/ration card input from the caller mid-call.

## Priority 6 — Filler / Barge-In / Response Style

16. **Replace filler messages with short silence** — Change `thinking_msgs` to trigger a 1-second `<Pause>` instead of a spoken sentence, then redirect to poll. For responses under 2 seconds, the user will hear nothing. For longer waits, consider a subtle chime audio file instead of words.
17. **Barge-in support** — Twilio's `<Gather>` with `input="speech"` does technically stop listening to TTS when the user interrupts (Twilio's VAD handles this), but the `partialResultCallback` and `actionOnEmptyResult` need tuning. True barge-in requires streaming audio, which the current poll-based architecture doesn't support. This requires switching to Twilio Media Streams (`<Stream>`) for real-time audio.
18. **Response style prompt improvements** — Add explicit instructions to the per-agent system prompts: never use numbered lists, always end with an open question, keep answers under 4 sentences for simple queries, never say "as per the scheme" or "as per government guidelines."

## Priority 7 — Security and Quality

19. **Hash phone numbers** — Replace plaintext `from_number` storage with `phone_hash`.
20. **Add email GSI to users table** — Create a DynamoDB GSI on the `email` attribute to replace the full table scan on login/register.
21. **Replace in-memory cosine search with DynamoDB-backed approximate search** — Or move to OpenSearch Serverless for scalable vector lookup once the knowledge base grows beyond ~500 entries.
22. **Add keyword-based distress gate** — Before passing `speech_text` to RAG, check for distress keywords in all 4 languages. If matched, bypass RAG and return a hardcoded crisis response with helpline numbers. Log the call as flagged.

---

**Bottom line on current state**: The Twilio phone call path works end-to-end for the basic use case (language menu → voice select → question → answer → loop) if the S3 static audio files exist. The LLM is Bedrock Nova Lite with a well-crafted single-persona system prompt. Conversation history within a call is properly implemented. Everything described in the vision — multi-agent routing, auto-language detection, mandi prices, weather, PM-Kisan status, phone hash memory, barge-in — is **not yet implemented** and requires significant new code. 

Completed: *Compile complete audit report* (4/4)

---
