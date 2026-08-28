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
    isOpen: true,
    closedMessage: t(
      "This survey is currently closed and is not accepting new responses. Thank you for your interest.",
      "Utafiti huu kwa sasa umefungwa na hauna kupokea majibu mapya. Asante kwa kupendezwa kwako."
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
        "This survey is part of an independent research study on how Tanzanian adults encounter and evaluate AI-generated content online. Participation is completely voluntary and anonymous — we do not collect your name, phone number, or any other identifying details. You may stop at any time by closing the form; your responses will not be saved unless you reach the final submit button. The survey takes approximately 12 minutes. By continuing, you confirm you are 18+ and consent to take part.",
        "Utafiti huu ni sehemu ya utafiti huru kuhusu jinsi watu wazima wa Tanzania wanavyokutana na kutathmini maudhui yanayotengenezwa na AI mtandaoni. Ushiriki ni wa hiari kabisa na hautambuliwi — hatukusanyi jina lako, namba ya simu, au maelezo mengine yoyote yanayoweza kukutambua. Unaweza kusitisha wakati wowote kwa kufunga fomu hii; majibu yako hayatahifadhiwa isipokuwa ufike kwenye kitufe cha mwisho cha kuwasilisha. Utafiti huu unachukua takribani dakika 12. Kwa kuendelea, unathibitisha kuwa una umri wa miaka 18+ na unakubali kushiriki."
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
        ],
      },
      {
        id: "gender",
        type: "single_choice",
        question: t("Gender", "Jinsia"),
        options: [
          { id: "male", label: t("Male", "Mwanaume") },
          { id: "female", label: t("Female", "Mwanamke") },
          { id: "self_describe", label: t("Prefer to self-describe", "Napendelea kujielezea mwenyewe") },
          { id: "na", label: t("Prefer not to say", "Sipendi kusema") },
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
          { id: "na", label: t("Prefer not to say", "Sipendi kusema") },
        ],
      },
      {
        id: "residence_type",
        type: "single_choice",
        question: t("Urban or rural residence", "Unaishi mjini au vijijini"),
        options: [
          { id: "urban", label: t("Urban", "Mjini") },
          { id: "peri_urban", label: t("Peri-urban", "Kando ya mji") },
          { id: "rural", label: t("Rural", "Vijijini") },
          { id: "na", label: t("Prefer not to say", "Sipendi kusema") },
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
          { id: "na", label: t("Prefer not to say", "Sipendi kusema") },
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
          { id: "na", label: t("Prefer not to say", "Sipendi kusema") },
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
          { id: "other", label: t("Other", "Nyingine") },
        ],
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
        question: t("Which of the following have you personally used before? (select all that apply)", "Ni zipi kati ya hizi umeshawahi kutumia mwenyewe? (chagua zote zinazohusika)"),
        options: [
          { id: "chatgpt", label: t("ChatGPT", "ChatGPT") },
          { id: "gemini", label: t("Google Gemini", "Google Gemini") },
          { id: "image_generator", label: t("An AI image generator (e.g., for creating pictures)", "Kifaa cha AI cha kutengeneza picha") },
          { id: "voice_video_tool", label: t("An AI voice or video tool", "Kifaa cha AI cha sauti au video") },
          { id: "none", label: t("None of these", "Hakuna kati ya hizi") },
          { id: "not_sure", label: t("Not sure", "Sina uhakika") },
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
        { id: "not_at_all", label: t("Not at all", "Hata kidogo") },
        { id: "a_little", label: t("A little", "Kidogo") },
        { id: "somewhat", label: t("Somewhat", "Kiasi") },
        { id: "a_lot", label: t("A lot", "Sana") },
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
      text: [
        { id: "grammar", label: t("Unnatural phrasing or grammar", "Muundo wa sentensi au sarufi isiyo ya kawaida") },
        { id: "implausible", label: t("Content seemed implausible or exaggerated", "Maudhui yalionekana yasiyowezekana au ya kupindukia") },
        { id: "style_inconsistent", label: t("Style seemed inconsistent", "Mtindo ulionekana usio sawiya") },
        { id: "guess", label: t("Just a guess", "Ni kubahatisha tu") },
        { id: "other", label: t("Other", "Nyingine") },
      ],
      image: [
        { id: "visual_glitches", label: t("Visual glitches or distortions (hands, backgrounds, lighting)", "Kasoro za kuona (mikono, mandhari, mwanga)") },
        { id: "implausible", label: t("Content seemed implausible", "Maudhui yalionekana yasiyowezekana") },
        { id: "too_perfect", label: t('Looked "too perfect" or artificial', "Ilionekana \"kamili mno\" au bandia") },
        { id: "guess", label: t("Just a guess", "Ni kubahatisha tu") },
        { id: "other", label: t("Other", "Nyingine") },
      ],
      audio: [
        { id: "robotic_voice", label: t("Voice sounded robotic, flat, or unnatural", "Sauti ilisikika kama ya roboti, tambarare, au isiyo ya kawaida") },
        { id: "odd_pacing", label: t("Odd pacing or background noise", "Mwendo usio wa kawaida au kelele za nyuma") },
        { id: "implausible", label: t("Content seemed implausible", "Maudhui yalionekana yasiyowezekana") },
        { id: "guess", label: t("Just a guess", "Ni kubahatisha tu") },
        { id: "other", label: t("Other", "Nyingine") },
      ],
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
  // SECTION 5 — Exposure Patterns
  // ---------------------------------------------------------------
  section5: {
    title: t("Exposure", "Kukutana na Maudhui"),
    exposureMatrix: {
      id: "exposure_types",
      question: t(
        "Have you ever come across content online or by phone that you suspected — at the time or later — was AI-generated, for each of the following types?",
        "Je, umeshawahi kukutana na maudhui mtandaoni au kwa simu ambayo ulishuku — wakati huo au baadaye — kuwa yametengenezwa na AI, kwa kila aina ifuatayo?"
      ),
      rows: [
        { id: "political", label: t("Political or election-related content", "Maudhui ya kisiasa au yanayohusiana na uchaguzi") },
        { id: "financial_scam", label: t("Financial or scam-related content (e.g., fake investment offers, mobile money fraud)", "Maudhui ya kifedha au ulaghai (mfano, matoleo ya uongo ya uwekezaji, ulaghai wa pesa za simu)") },
        { id: "other", label: t("Other AI-generated content not covered above", "Maudhui mengine ya AI ambayo hayajatajwa hapo juu") },
      ],
      columns: [
        { id: "yes", label: t("Yes", "Ndiyo") },
        { id: "no", label: t("No", "Hapana") },
        { id: "not_sure", label: t("Not sure", "Sina uhakika") },
      ],
    },
    // Shown once, per-row follow-ups, only for rows the respondent marked "yes"
    followUpRecency: {
      id: "exposure_recency",
      question: t("When was the most recent time you encountered this?", "Ni lini mara ya mwisho ulikutana na hili?"),
      options: [
        { id: "last_month", label: t("Within the last month", "Ndani ya mwezi uliopita") },
        { id: "1_6_months", label: t("1–6 months ago", "Miezi 1–6 iliyopita") },
        { id: "6_12_months", label: t("6–12 months ago", "Miezi 6–12 iliyopita") },
        { id: "over_a_year", label: t("More than a year ago", "Zaidi ya mwaka mmoja uliopita") },
        { id: "election_period", label: t("Around the October 2025 election period", "Karibu na kipindi cha uchaguzi cha Oktoba 2025") },
        { id: "not_sure", label: t("Not sure", "Sina uhakika") },
      ],
    },
    followUpAwareness: {
      id: "exposure_awareness_timing",
      question: t("Did you realize it was AI-generated at the time, or only later?", "Je, uligundua ni AI wakati huo, au baadaye tu?"),
      options: [
        { id: "at_the_time", label: t("I realized at the time", "Niligundua wakati huo") },
        { id: "only_later", label: t("I only realized later", "Niligundua baadaye tu") },
        { id: "still_dont_know", label: t("I still don't know for sure, even now", "Bado sijui kwa uhakika, hata sasa") },
        { id: "not_sure", label: t("Not sure", "Sina uhakika") },
      ],
    },
    platformFrequency: {
      id: "platform_frequency",
      question: t(
        "How often do you come across content you suspect is fake or AI-generated on each of the following?",
        "Ni mara ngapi unakutana na maudhui unayoshuku ni ya uongo au ya AI kwenye kila mojawapo ya haya?"
      ),
      rows: [
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
      columns: [
        { id: "never", label: t("Never", "Kamwe") },
        { id: "rarely", label: t("Rarely", "Mara chache") },
        { id: "sometimes", label: t("Sometimes", "Wakati mwingine") },
        { id: "often", label: t("Often", "Mara nyingi") },
        { id: "very_often", label: t("Very often", "Mara nyingi sana") },
      ],
    },
  },

  // ---------------------------------------------------------------
  // SECTION 6 — Consequences
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
    emotionalResponse: {
      id: "emotional_response",
      type: "multi_choice",
      question: t("Has encountering this kind of content ever made you feel any of the following? (select all that apply)", "Je, kukutana na maudhui ya aina hii kumewahi kukufanya uhisi mojawapo ya yafuatayo? (chagua zote zinazohusika)"),
      options: [
        { id: "fear_anxiety", label: t("Fear or anxiety", "Hofu au wasiwasi") },
        { id: "confusion", label: t("Confusion about what's true", "Kuchanganyikiwa kuhusu ukweli ni upi") },
        { id: "anger", label: t("Anger or frustration", "Hasira au kukasirika") },
        { id: "sadness", label: t("Sadness", "Huzuni") },
        { id: "none", label: t("None of these", "Hakuna kati ya hizi") },
      ],
    },
    behaviorChange: {
      id: "behavior_change",
      type: "multi_choice",
      question: t("Has this ever led you to do any of the following? (select all that apply)", "Je, hili limewahi kukufanya ufanye mojawapo ya yafuatayo? (chagua zote zinazohusika)"),
      options: [
        { id: "stopped_app", label: t("Stopped using a particular app or platform", "Kuacha kutumia programu au jukwaa fulani") },
        { id: "double_check", label: t("Started double-checking information before believing or sharing it", "Kuanza kuhakiki taarifa kabla ya kuiamini au kuisambaza") },
        { id: "warned_others", label: t("Warned family or friends about something you thought was fake", "Kuwaonya familia au marafiki kuhusu kitu ulichodhani ni cha uongo") },
        { id: "financial_caution", label: t("Became more cautious about financial offers or money-related messages", "Kuwa makini zaidi na matoleo ya kifedha au ujumbe unaohusu pesa") },
        { id: "none", label: t("None of these", "Hakuna kati ya hizi") },
      ],
    },
    openNarrative: {
      id: "open_narrative",
      type: "long_text",
      question: t(
        "In your own words, please describe a specific time when AI-generated or fake content affected you, someone you know, or how you viewed something. This could be an emotional reaction, a decision you made, a financial loss, or anything else. If this hasn't happened to you, write \"N/A.\"",
        "Kwa maneno yako mwenyewe, tafadhali eleza wakati mahususi ambapo maudhui ya AI au ya uongo yalikuathiri wewe, mtu unayemfahamu, au jinsi ulivyoona jambo fulani. Hii inaweza kuwa hisia, uamuzi ulioufanya, hasara ya kifedha, au chochote kingine. Kama hili halijawahi kukutokea, andika \"N/A.\""
      ),
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
        "Is there anything else you'd like to share about AI-generated content or disinformation in Tanzania that we haven't asked about?",
        "Je, kuna kitu kingine ungependa kushiriki kuhusu maudhui ya AI au taarifa potofu Tanzania ambacho hatujakiuliza?"
      ),
      required: false,
    },
    thankYou: t(
      "Thank you for your time. Your responses have been recorded anonymously.",
      "Asante kwa muda wako. Majibu yako yamerekodiwa bila kutambulisha."
    ),
  },
};
