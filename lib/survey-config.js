// lib/survey-config.js
//
// THE ONLY FILE THAT SHOULD NEED TO CHANGE for this app's content.
// Every question, label, option, and piece of copy lives here, in both
// English and Swahili. `api/get-config.js` just serves this object as
// JSON; `public/index.html` renders purely from it.
//
// NOTE ON TRANSLATIONS: the Swahili strings below are a first-pass
// draft translation, not a native-speaker-reviewed final version.
// Flag every "sw" string for review before launch, especially the
// consent text and the Section 4 reasoning-cue options, where precise
// wording matters most.

const t = (en, sw) => ({ en, sw });

module.exports = {
  meta: {
    title: t("Tanzania AI-Generated Disinformation Survey", "Utafiti wa Taarifa Potofu Zinazotengenezwa na AI Tanzania"),
    estimatedMinutes: 12,
    // THE SURVEY OPEN/CLOSED TOGGLE.
    // Set to false to stop accepting new responses; set back to true to
    // reopen. This single flag is enforced in three places, all reading
    // this same value — nothing else needs to change:
    //   1. public/index.html shows the closedMessage instead of the survey
    //   2. api/get-stimuli-set.js refuses to hand out new stimuli sets
    //   3. api/submit.js refuses to save new submissions (belt-and-braces:
    //      this is the one that actually matters, since it's the only
    //      thing that can't be bypassed by calling the API directly)
    isOpen: false,
    closedMessage: t(
      "Data collection for this study has now ended, so the survey is closed and no longer accepting new responses. Thank you for your interest.",
      "Ukusanyaji wa taarifa kwa utafiti huu umekamilika, hivyo utafiti umefungwa na haupokei tena majibu mapya. Asante kwa kuonesha nia yako."
    ),
  },

  // ---------------------------------------------------------------
  // SECTION 0 — Consent & Eligibility
  // ---------------------------------------------------------------
  section0: {
    ageCheck: {
      question: t("Are you 18 years of age or older?", "Je, una umri wa miaka 18 au zaidi?"),
      options: [
        { id: "yes", label: t("Yes", "Ndiyo") },
        { id: "no", label: t("No", "Hapana") },
      ],
      failId: "no",
      exitMessage: t(
        "Thank you, but this survey is only for adults aged 18 and above.",
        "Asante, lakini utafiti huu ni kwa ajili ya watu wazima wenye umri wa miaka 18 na zaidi tu."
      ),
    },
    consent: {
      text: t(
        "This survey is part of an independent research study on how Tanzanian adults encounter and evaluate AI-generated content online. Participation is completely voluntary and anonymous — we do not collect your name, phone number, or any other identifying details. You may stop at any time by closing the form; your responses will not be saved unless you reach the final submit button. The survey takes approximately 8 minutes. By continuing, you confirm you are an 18+ Tanzanian and consent to take part.",
        "Utafiti huu ni sehemu ya utafiti huru kuhusu jinsi watu wazima wa Tanzania wanavyokutana na kutathmini maudhui yanayotengenezwa na AI mtandaoni. Ushiriki ni wa hiari kabisa na hautambuliwi — hatukusanyi jina lako, namba ya simu, au maelezo mengine yoyote yanayoweza kukutambua. Unaweza kusitisha wakati wowote kwa kufunga fomu hii; majibu yako hayatahifadhiwa isipokuwa ufike kwenye kitufe cha mwisho cha kuwasilisha. Utafiti huu unachukua takribani dakika 8. Kwa kuendelea, unathibitisha kuwa wewe ni mtanzania mwenye umri wa miaka 18+ na unakubali kushiriki."
      ),
      options: [
        { id: "agree", label: t("I understand and agree to participate", "Nimeelewa na nakubali kushiriki") },
        { id: "decline", label: t("I do not wish to participate", "Sitaki kushiriki") },
      ],
      failId: "decline",
    },
    languageChoice: {
      question: t(
        "Please choose your preferred language",
        "Tafadhali chagua lugha unayopendelea"
      ),
      options: [
        { id: "en", label: "English" },
        { id: "sw", label: "Kiswahili" },
      ],
    },
  },

  // ---------------------------------------------------------------
  // SECTION 1 — Demographics
  // ---------------------------------------------------------------
  section1: {
    title: t("About You", "Kukuhusu"),
    questions: [
      {
        id: "age_group",
        type: "single_choice",
        question: t("Age group", "Kundi la umri"),
        options: [
          { id: "18_24", label: t("18–24", "18–24") },
          { id: "25_34", label: t("25–34", "25–34") },
          { id: "35_44", label: t("35–44", "35–44") },
          { id: "45_54", label: t("45–54", "45–54") },
          { id: "55_60", label: t("55–60", "55–60") },
          { id: "61_plus", label: t("61+", "61+") },
        ],
      },
      {
        id: "gender",
        type: "single_choice",
        question: t("Gender", "Jinsia"),
        options: [
          { id: "male", label: t("Male", "Mwanaume") },
          { id: "female", label: t("Female", "Mwanamke") },
        ],
      },
      {
        id: "region",
        type: "single_choice",
        question: t("Region/Zone of residence", "Mkoa/Ukanda unaoishi"),
        options: [
          { id: "dsm", label: t("Dar es Salaam", "Dar es Salaam") },
          { id: "coastal", label: t("Coastal (Pwani)", "Pwani") },
          { id: "northern", label: t("Northern (Kilimanjaro, Arusha, Tanga, Manyara)", "Kaskazini (Kilimanjaro, Arusha, Tanga, Manyara)") },
          { id: "lake", label: t("Lake Zone (Mwanza, Kagera, Mara, Shinyanga, Simiyu, Geita)", "Ukanda wa Ziwa (Mwanza, Kagera, Mara, Shinyanga, Simiyu, Geita)") },
          { id: "central", label: t("Central (Dodoma, Singida, Tabora)", "Kati (Dodoma, Singida, Tabora)") },
          { id: "southern_highlands", label: t("Southern Highlands (Mbeya, Njombe, Iringa, Rukwa, Katavi, Songwe)", "Nyanda za Juu Kusini (Mbeya, Njombe, Iringa, Rukwa, Katavi, Songwe)") },
          { id: "southern", label: t("Southern (Lindi, Mtwara, Ruvuma)", "Kusini (Lindi, Mtwara, Ruvuma)") },
          { id: "zanzibar", label: t("Zanzibar & Islands", "Zanzibar na Visiwa") },
        ],
      },
      {
        id: "residence_type",
        type: "single_choice",
        question: t("Urban or rural residence", "Unaishi mjini au vijijini"),
        options: [
          { id: "urban", label: t("Urban", "Mjini") },
          { id: "rural", label: t("Rural", "Vijijini") },
        ],
      },
      {
        id: "education",
        type: "single_choice",
        question: t("Highest level of education completed", "Kiwango cha juu cha elimu ulichokamilisha"),
        options: [
          { id: "none", label: t("No formal schooling", "Sikusoma shule rasmi") },
          { id: "primary", label: t("Primary school", "Shule ya msingi") },
          { id: "secondary_o", label: t("Secondary (O-level)", "Sekondari (O-level)") },
          { id: "secondary_a", label: t("Secondary (A-level)", "Sekondari (A-level)") },
          { id: "certificate_diploma", label: t("Certificate or Diploma", "Cheti au Stashahada") },
          { id: "bachelors", label: t("Bachelor's degree", "Shahada ya kwanza") },
          { id: "postgraduate", label: t("Postgraduate degree", "Shahada ya uzamili/uzamivu") },
        ],
      },
      {
        id: "occupation",
        type: "single_choice",
        question: t("Current occupation/employment status", "Kazi/Hali ya ajira kwa sasa"),
        options: [
          { id: "formal_private", label: t("Formal employment – private sector", "Ajira rasmi – sekta binafsi") },
          { id: "formal_public", label: t("Formal employment – government or public sector", "Ajira rasmi – serikali au sekta ya umma") },
          { id: "informal", label: t("Informal sector, self-employed, or small business", "Sekta isiyo rasmi, kujiajiri, au biashara ndogo") },
          { id: "student", label: t("Student", "Mwanafunzi") },
          { id: "unemployed", label: t("Unemployed / seeking work", "Sina ajira / natafuta kazi") },
          { id: "homemaker", label: t("Homemaker", "Kazi za nyumbani") },
          { id: "retired", label: t("Retired", "Mstaafu") },
        ],
      },
      {
        id: "device_access",
        type: "single_choice",
        question: t("Device and internet access", "Kifaa na upatikanaji wa mtandao"),
        options: [
          { id: "smartphone_daily", label: t("Smartphone with regular/daily internet access", "Simu janja yenye mtandao wa kila siku") },
          { id: "smartphone_limited", label: t("Smartphone with limited or occasional internet access", "Simu janja yenye mtandao mdogo au wa mara kwa mara") },
          { id: "basic_phone", label: t("Basic/feature phone (calls & SMS only)", "Simu ya kawaida (simu na SMS tu)") },
          { id: "shared_device", label: t("Shared or borrowed device access", "Kifaa cha pamoja au cha kukopa") },
        ],
      },
      {
        id: "device_type_other",
        type: "short_text",
        required: true,
        question: t(
          "Please write your specific device type (e.g., iPhone, Samsung Galaxy S26 Ultra, HP laptop, etc.)",
          "Tafadhali andika aina mahususi ya kifaa chako (mfano, iPhone, Samsung Galaxy S26 Ultra, HP laptop, n.k.)"
        ),
      },
    ],
  },

  // ---------------------------------------------------------------
  // SECTION 2 — Digital & AI Familiarity Baseline
  // ---------------------------------------------------------------
  section2: {
    title: t("Digital & AI Familiarity", "Ufahamu wa Kidijitali na AI"),
    questions: [
      {
        id: "ai_tools_used",
        type: "multi_choice",
        allowOtherText: true, // "other" option reveals a free-text field — see public/index.html renderMultiChoice
        question: t("Which of the following have you personally used before? (select all that apply)", "Ni zipi kati ya hizi umeshawahi kutumia mwenyewe? (chagua zote zinazohusika)"),
        options: [
          { id: "chatgpt", label: t("ChatGPT", "ChatGPT") },
          { id: "claude", label: t("Claude", "Claude") },
          { id: "copilot", label: t("Copilot", "Copilot") },
          { id: "gemini", label: t("Google Gemini", "Google Gemini") },
          { id: "image_generator", label: t("An AI image generator (e.g., for creating pictures)", "Kifaa cha AI cha kutengeneza picha") },
          { id: "voice_video_tool", label: t("An AI voice or video tool", "Kifaa cha AI cha sauti au video") },
          { id: "other", label: t("Other", "Nyingine") },
        ],
      },
      {
        id: "aware_ai_disinfo",
        type: "single_choice",
        question: t("Before today, had you heard that AI can be used to create fake news articles, images, audio, or videos that look/sound real?", "Kabla ya leo, ulishawahi kusikia kuwa AI inaweza kutumika kutengeneza habari za uongo, picha, sauti, au video zinazoonekana/kusikika halisi?"),
        options: [
          { id: "yes", label: t("Yes, I was aware of this", "Ndiyo, nilikuwa najua hili") },
          { id: "no", label: t("No, this is new to me", "Hapana, hii ni mpya kwangu") },
          { id: "not_sure", label: t("Not sure", "Sina uhakika") },
        ],
      },
      {
        id: "internet_frequency",
        type: "single_choice",
        question: t("How often do you personally use the internet or social media?", "Ni mara ngapi wewe binafsi hutumia mtandao au mitandao ya kijamii?"),
        options: [
          { id: "multiple_daily", label: t("Multiple times a day", "Mara nyingi kwa siku") },
          { id: "once_daily", label: t("About once a day", "Karibu mara moja kwa siku") },
          { id: "few_weekly", label: t("A few times a week", "Mara chache kwa wiki") },
          { id: "rarely", label: t("Rarely", "Mara chache sana") },
          { id: "never", label: t("Never", "Kamwe") },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------
  // SECTION 3 — Baseline Trust & News Sources
  // ---------------------------------------------------------------
  section3: {
    title: t("Trust & News Sources", "Imani na Vyanzo vya Habari"),
    trustMatrix: {
      id: "baseline_trust",
      question: t("Before taking this survey, how much did you trust each of the following as sources of accurate information?", "Kabla ya kufanya utafiti huu, ulikuwa unaamini kiasi gani vyanzo vifuatavyo kwa taarifa sahihi?"),
      rows: [
        { id: "news_media", label: t("News media (TV, radio, newspapers)", "Vyombo vya habari (TV, redio, magazeti)") },
        { id: "social_media", label: t("Social media platforms", "Mitandao ya kijamii") },
        { id: "government", label: t("Government announcements", "Matangazo ya serikali") },
      ],
      columns: [
        { id: "0", label: t("0 (Not at all)", "0 (Hata kidogo)") },
        { id: "1", label: t("1", "1") },
        { id: "2", label: t("2", "2") },
        { id: "3", label: t("3 (Neutral)", "3 (Wastani)") },
        { id: "4", label: t("4", "4") },
        { id: "5", label: t("5 (A lot)", "5 (Sana)") },
      ],
    },
    newsSource: {
      id: "news_source",
      type: "multi_choice",
      question: t("Where do you usually get your news and information about current events? (select all that apply)", "Kwa kawaida unapata wapi habari na taarifa za matukio ya sasa? (chagua zote zinazohusika)"),
      options: [
        { id: "television", label: t("Television", "Televisheni") },
        { id: "radio", label: t("Radio", "Redio") },
        { id: "newspapers", label: t("Newspapers (print or online)", "Magazeti (chapisho au mtandaoni)") },
        { id: "social_media", label: t("Social media", "Mitandao ya kijamii") },
        { id: "government_sources", label: t("Government sources or announcements", "Vyanzo au matangazo ya serikali") },
        { id: "friends_family", label: t("Friends and family", "Marafiki na familia") },
        { id: "other", label: t("Other", "Nyingine") },
      ],
    },
  },

  // ---------------------------------------------------------------
  // SECTION 4 — Content Detection Task
  // ---------------------------------------------------------------
  section4: {
    title: t("Spot the Content", "Tambua Maudhui"),
    instructions: t(
      "You will see a series of short items — some real, some created using AI. For each one, decide whether you think it is REAL or AI-GENERATED, then, if you'd like, tell us what made you think so.",
      "Utaona vipande kadhaa vifupi — vingine ni halisi, vingine vimetengenezwa kwa AI. Kwa kila kimoja, amua kama unadhani ni HALISI au IMETENGENEZWA NA AI, kisha, ukipenda, tuambie ni nini kilichokufanya ufikirie hivyo."
    ),
    judgmentQuestion: t("Is this REAL or AI-GENERATED?", "Je, hiki ni HALISI au KIMETENGENEZWA NA AI?"),
    judgmentOptions: [
      { id: "real", label: t("Real", "Halisi") },
      { id: "ai_generated", label: t("AI-generated", "Kimetengenezwa na AI") },
    ],
    reasonQuestion: t("What made you think that? (optional, select all that apply)", "Ni nini kilichokufanya ufikirie hivyo? (si lazima, chagua zote zinazohusika)"),
    reasonOptionsByModality: {
      text: {
        ai: [
          { id: "grammar", label: t("Unnatural phrasing or grammar", "Muundo wa sentensi au sarufi isiyo ya kawaida") },
          { id: "implausible", label: t("Content seemed implausible or exaggerated", "Maudhui yalionekana yasiyowezekana au ya kupindukia") },
          { id: "style_inconsistent", label: t("Style seemed inconsistent", "Mtindo ulionekana usio sawiya") },
          { id: "guess", label: t("Just a guess", "Ni kubahatisha tu") },
          { id: "other", label: t("Other", "Nyingine") },
        ],
        real: [
          { id: "natural_phrasing", label: t("Natural phrasing and grammar", "Muundo wa sentensi na sarufi ya kawaida") },
          { id: "plausible", label: t("Content seemed plausible and consistent with what I know", "Maudhui yalionekana yanawezekana na yanaendana na ninachojua") },
          { id: "style_consistent", label: t("Style seemed consistent throughout", "Mtindo ulionekana sawiya kote") },
          { id: "guess", label: t("Just a guess", "Ni kubahatisha tu") },
          { id: "other", label: t("Other", "Nyingine") },
        ],
      },
      image: {
        ai: [
          { id: "visual_glitches", label: t("Visual glitches or distortions (hands, backgrounds, lighting)", "Kasoro za kuona (mikono, mandhari, mwanga)") },
          { id: "implausible", label: t("Content seemed implausible", "Maudhui yalionekana yasiyowezekana") },
          { id: "too_perfect", label: t('Looked "too perfect" or artificial', "Ilionekana \"kamili mno\" au bandia") },
          { id: "guess", label: t("Just a guess", "Ni kubahatisha tu") },
          { id: "other", label: t("Other", "Nyingine") },
        ],
        real: [
          { id: "no_visual_glitches", label: t("No visual glitches or distortions noticed (hands, backgrounds, lighting looked normal)", "Hakuna kasoro za kuona zilizoonekana (mikono, mandhari, mwanga vilionekana vya kawaida)") },
          { id: "plausible", label: t("Content seemed plausible", "Maudhui yalionekana yanawezekana") },
          { id: "looked_authentic", label: t("Looked like a normal, unedited photo", "Ilionekana kama picha ya kawaida, isiyohaririwa") },
          { id: "guess", label: t("Just a guess", "Ni kubahatisha tu") },
          { id: "other", label: t("Other", "Nyingine") },
        ],
      },
      audio: {
        ai: [
          { id: "robotic_voice", label: t("Voice sounded robotic, flat, or unnatural", "Sauti ilisikika kama ya roboti, tambarare, au isiyo ya kawaida") },
          { id: "odd_pacing", label: t("Odd pacing or background noise", "Mwendo usio wa kawaida au kelele za nyuma") },
          { id: "implausible", label: t("Content seemed implausible", "Maudhui yalionekana yasiyowezekana") },
          { id: "guess", label: t("Just a guess", "Ni kubahatisha tu") },
          { id: "other", label: t("Other", "Nyingine") },
        ],
        real: [
          { id: "natural_voice", label: t("Voice sounded natural and human", "Sauti ilisikika ya kawaida na ya kibinadamu") },
          { id: "normal_pacing", label: t("Pacing and background sounds seemed normal", "Mwendo na sauti za nyuma vilionekana vya kawaida") },
          { id: "plausible", label: t("Content seemed plausible", "Maudhui yalionekana yanawezekana") },
          { id: "guess", label: t("Just a guess", "Ni kubahatisha tu") },
          { id: "other", label: t("Other", "Nyingine") },
        ],
      },
    },
    // Structural parameters consumed by lib/stimuli.js — change counts here,
    // not in the stimuli-loading logic itself.
    structure: {
      modalities: ["text", "image", "audio"],
      tiers: ["easy", "medium", "hard"],
      authenticities: ["real", "ai"],
      itemsPerModality: 3, // one per tier; authenticity of each is randomized
      textAndAudioAreLanguageSpecific: true, // image is not
    },
    attentionChecks: [
      {
        id: "attn_1",
        text: t(
          "This is a check question. Please select \"AI-generated\" for this item regardless of what you see.",
          "Hili ni swali la ukaguzi. Tafadhali chagua \"Kimetengenezwa na AI\" kwa kipengele hiki bila kujali unachokiona."
        ),
        expected: "ai_generated",
      },
      {
        id: "attn_2",
        text: t(
          "For this item only, please select \"Real.\"",
          "Kwa kipengele hiki tu, tafadhali chagua \"Halisi.\""
        ),
        expected: "real",
      },
    ],
  },

  // ---------------------------------------------------------------
  // SECTION 5 — Exposure & Unattributed Harm
  //
  // 5.1-5.6 all live on ONE screen (screenSection5Main in index.html),
  // with sub-questions conditionally revealed/hidden based on earlier
  // answers on that same screen — not separate steps in the STEPS
  // array, unlike every other multi-part section in this app. Only the
  // instructions block gets its own screen (screenSection5Intro).
  // ---------------------------------------------------------------
  section5: {
    title: t("Exposure & Unattributed Harm", "Kukutana na Maudhui na Madhara Yasiyobainishwa"),
    instructions: t(
      "The next questions ask about things you may have seen or experienced online, whether or not you're sure AI was involved.",
      "Maswali yanayofuata yanauliza kuhusu mambo unayoweza kuwa umeona au kupitia mtandaoni, iwe una uhakika AI ilihusika au la."
    ),
    // 5.1 — always shown
    recentFalseContent: {
      id: "recent_false_content",
      question: t(
        "In the past few months, have you seen, heard, or read anything online that later turned out to be false, misleading, or fake, regardless of whether you think AI was involved?",
        "Katika miezi michache iliyopita, je, umewahi kuona, kusikia, au kusoma kitu chochote mtandaoni ambacho baadaye kiligundulika kuwa cha uongo, cha kupotosha, au bandia, bila kujali kama unadhani AI ilihusika?"
      ),
      options: [
        { id: "yes", label: t("Yes", "Ndiyo") },
        { id: "no", label: t("No", "Hapana") },
        { id: "not_sure", label: t("Not sure", "Sina uhakika") },
      ],
    },
    // 5.2 — shown only if recentFalseContent === "yes"
    affectedYou: {
      id: "affected_you",
      question: t(
        "Did this affect you or someone you know in any way — for example, an emotional reaction, a decision you made, a financial loss, or something else?",
        "Je, hili lilikuathiri wewe au mtu unayemfahamu kwa namna yoyote — kwa mfano, hisia, uamuzi ulioufanya, hasara ya kifedha, au kitu kingine chochote?"
      ),
      options: [
        { id: "yes", label: t("Yes", "Ndiyo") },
        { id: "no", label: t("No", "Hapana") },
      ],
    },
    // 5.3 — shown only if affectedYou === "yes"; required
    affectedNarrative: {
      id: "affected_narrative",
      required: true,
      question: t(
        "In your own words, please describe what happened and how it affected you.",
        "Kwa maneno yako mwenyewe, tafadhali eleza nini kilitokea na jinsi kilivyokuathiri."
      ),
    },
    // 5.4 — shown only if affectedYou === "yes" (same condition as 5.3)
    aiInvolved: {
      id: "ai_involved",
      question: t(
        "Do you think AI was involved in creating this content?",
        "Je, unadhani AI ilihusika katika kutengeneza maudhui hayo?"
      ),
      options: [
        { id: "yes", label: t("Yes", "Ndiyo") },
        { id: "no", label: t("No", "Hapana") },
        { id: "not_sure", label: t("Not sure", "Sina uhakika") },
      ],
    },
    // 5.5 — always shown
    everSuspectedAI: {
      id: "ever_suspected_ai",
      question: t(
        "Separately from the above, have you ever come across content online that you specifically suspected was AI-generated, whether or not it affected you personally?",
        "Tofauti na hapo juu, je, umeshawahi kukutana na maudhui mtandaoni ambayo ulishuku mahususi kuwa yametengenezwa na AI, iwe yalikuathiri wewe binafsi au la?"
      ),
      options: [
        { id: "yes", label: t("Yes", "Ndiyo") },
        { id: "no", label: t("No", "Hapana") },
      ],
    },
    // 5.6 — shown only if everSuspectedAI === "yes"
    platformsEncountered: {
      id: "platforms_encountered",
      type: "multi_choice",
      question: t(
        "On which platforms did you encounter such suspicious content? (select all that apply)",
        "Ulikutana na maudhui hayo ya kutiliwa shaka kwenye majukwaa gani? (chagua zote zinazohusika)"
      ),
      options: [
        { id: "whatsapp", label: t("WhatsApp", "WhatsApp") },
        { id: "facebook", label: t("Facebook", "Facebook") },
        { id: "instagram", label: t("Instagram", "Instagram") },
        { id: "tiktok", label: t("TikTok", "TikTok") },
        { id: "x_twitter", label: t("X (Twitter)", "X (Twitter)") },
        { id: "youtube", label: t("YouTube", "YouTube") },
        { id: "sms", label: t("SMS or bulk text messages", "SMS au ujumbe wa jumla") },
        { id: "phone_calls", label: t("Phone calls", "Simu za sauti") },
        { id: "other_social", label: t("Other social media", "Mitandao mingine ya kijamii") },
      ],
    },
  },

  // ---------------------------------------------------------------
  // SECTION 6 — Consequences
  // Shown only if 5.2 (affectedYou) === "yes" OR 5.5 (everSuspectedAI)
  // === "yes" — evaluated once, at the Continue click on Section 5's
  // combined screen. 6.2 (the old open-narrative question) has been
  // removed entirely; Section 6 is now just the trust-change matrix.
  // ---------------------------------------------------------------
  section6: {
    title: t("Effects on You", "Athari Kwako"),
    trustChange: {
      id: "trust_change",
      question: t("Since encountering content like this, has your trust changed in any of the following?", "Tangu kukutana na maudhui kama haya, je, imani yako imebadilika kwa mojawapo ya yafuatayo?"),
      rows: [
        { id: "news_media", label: t("News media", "Vyombo vya habari") },
        { id: "social_media", label: t("Social media as a source of information", "Mitandao ya kijamii kama chanzo cha taarifa") },
        { id: "government", label: t("Government announcements", "Matangazo ya serikali") },
      ],
      columns: [
        { id: "decreased_a_lot", label: t("Decreased a lot", "Imepungua sana") },
        { id: "decreased_a_little", label: t("Decreased a little", "Imepungua kidogo") },
        { id: "no_change", label: t("No change", "Hakuna mabadiliko") },
        { id: "increased", label: t("Increased", "Imeongezeka") },
      ],
    },
  },

  // ---------------------------------------------------------------
  // SECTION 7 — Closing
  // ---------------------------------------------------------------
  section7: {
    title: t("Final Thoughts", "Mawazo ya Mwisho"),
    optionalComment: {
      id: "final_comment",
      type: "long_text",
      question: t(
        "Is there anything else you'd like to share about AI-generated content or disinformation in Tanzania that we haven't asked about? If you have nothing to add, write \"N/A.\"",
        "Je, kuna kitu kingine ungependa kushiriki kuhusu maudhui ya AI au taarifa potofu Tanzania ambacho hatujakiuliza? Kama huna la kuongeza, andika \"N/A.\""
      ),
      required: false,
    },
    thankYou: t(
      "Thank you for your time. Your responses have been recorded anonymously.",
      "Asante kwa muda wako. Majibu yako yamerekodiwa bila kutambulisha."
    ),
  },
};
