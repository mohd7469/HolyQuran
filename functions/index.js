
'use strict';

/* Initialize firebase admin */
const admin = require('firebase-admin');

/* Import the firebase-functions package for deployment */
const functions = require('firebase-functions');

/* Initialize firebase functions */
admin.initializeApp(functions.config().firebase);

/* Initialize firebase database */
var db = admin.firestore();

/* Import Dialogflow module from the Actions on Google client library */
const {
  SimpleResponse,
  MediaObject,
  Suggestions,
  dialogflow,
  BasicCard,
  Button,
  Image
  } = require('actions-on-google');

/* Instantiate Dialogflow client */
const app = dialogflow();

/*
 retrieve all Quran Surah names and Parah names at the very beginning when this app
 initialized because it takes sometimes so, reason of doing this whenever
 user ask for Surah it should be ready on that time and could be send back
 directly to user without waiting him/her, more imp thing this is 1 time effort
 */

initializeQuranSurahNames();
initializeQuranParahNames();

let surahNames = {};
let parahNames = {};

function initializeQuranSurahNames() {
  console.info(`--------------- initializing 114 Surah... ---------------`);
  db.collection('quran').get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          surahNames[doc.id] = doc.data();
        });
        console.info(`--------------- ${Object.keys(surahNames).length} Surah initialized successfully ---------------`);
        return null;
      })
      .catch((err) => {
        console.log('Error getting documents ', err);
      });
}

function initializeQuranParahNames() {
  console.info(`--------------- initializing 30 Parah.... ---------------`);
  db.collection('parah').get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          parahNames[doc.id] = doc.data();
        });
        console.info(`--------------- ${Object.keys(parahNames).length} Parah initialized successfully ----------------`);
        return null;
      })
      .catch((err) => {
        console.log('Error getting documents ', err);
      });
  let query = db.collection('parah');
  let observer = query.onSnapshot(querySnapshot => {
    console.log(`Receiving updates..`);
    querySnapshot.forEach((doc) => {
      parahNames[doc.id] = doc.data();
    });
  }, err => {
    console.log(`Encountered error: ${err}`);
  });
}

function getInProcessSSML() {
  let today = new Date();
  let date = today.getDate() + '-' + today.getMonth();
  return `
        <speak>
          <break time="500ms"/>
					<emphasis level="moderate">this section is under development</emphasis>
          <break time="700ms"/>
          today is
          <say-as interpret-as="date" format="dm">${date}</say-as>
          and i'm trying my best to make it complete
          <break time="500ms"/>
					so
          <break time="500ms"/>
          i am gonna let you notify when this will be done
          <break time="700ms"/>
          until you should listen to it
          <break time="500ms"/>
          hope you might like it
        </speak>
    `;
}

function getWelcomeSSML() {
  let msg = [
    `Hello! Welcome to the Holy Quran, Miracle of Allah and Final Testament to Humankind. Enhance your recitation & spiritual experience with the real feel of Quran anytime anywhere. How can i help ?`,
    `Hello! Welcome to the Holy Quran, the Last and Final Word of God (Allah) Almighty and a message to all mankind. So its truly says when the Quran is recited, then listen to it and pay attention that you may receive mercy. How can i help ?`
  ];
  return msg[Math.floor(Math.random() * msg.length)];
}

let arabicNames = [
  'الفاتحہ', 'البقرۃ', 'آل عمران', ' ٓالنسا', 'المائدۃ', 'الانعام', 'الاعراف',
  'الانفال', 'التوبۃ', 'یونس', 'ھود', 'یوسف', 'الرعد', 'ابراھیم', 'الحجر',
  'النحل', 'الاسرا', 'الکھف', 'مریم', 'طٰہٰ', 'الانبیآ', 'الحج', 'المومنون', 'النور',
  'الفرقان', 'الشعرآ', 'النمل', 'القصص', 'العنکبوت', 'الروم', 'لقمان', 'السجدۃ',
  'الاحزاب', 'سبا', 'فاطر', 'یٰس', 'الصافات', 'ص', 'الزمر', 'غافر', 'فصلت',
  'الشوری', 'الزخرف', 'الدخان', 'الجاثیۃ', 'الاحقاف', 'محمد', 'الفتح', 'الحجرات',
  'ق', 'الذاریات', 'الطور', 'النجم', 'القمر', 'الرحٰمن', 'الواقعہ', 'الحدید',
  'المجادلہ', 'الحشر', 'الممتحنۃ', 'الصف', 'الجمعۃ', 'المنافقون', 'التغابن',
  'الطلاق', 'التحریم', 'الملک', 'القلم', 'الحاقۃ', 'المعارج', 'نوح', 'الجن',
  'المزمل', 'المدثر', 'القیامۃ', 'الانسان', 'المرثلات', 'النبا', 'النازعات',
  'عبس', 'التکویر', 'الانفطار', 'المطففین', 'الانشقاق', 'البروج', 'الطارق',
  'الاعلی', 'الغاشیۃ', 'الفجر', 'البلد', 'الشمس', 'اللیل', 'الضحی', 'الشرح',
  'التین', 'العلق', 'القدر', 'البینۃ', 'الزلزلۃ', 'العادیات', 'القارعۃ',
  'التکاثر', 'العصر', 'الھمزۃ', 'الفیل', 'قریش', 'الماعون', 'الکوثر',
  'الکافرون', 'النصر', 'المسد', 'الاخلاص', 'الفلق', 'الناس'
];
let englishNames = [
  'fatiha', 'baqarah', 'imran', 'nisa', 'maeda', 'inaam', 'araaf',
  'anfaal', 'taubah', 'yunus', 'hud', 'yusuf', 'raad', 'ibrahim', 'hijr',
  'nahl', 'isra', 'kahf', 'maryam', 'taha', 'anbiya', 'hajj', 'mumenoon', 'noor',
  'furqan', 'shuara', 'naml', 'qasas', 'ankaboot', 'room', 'luqman', 'sajdah',
  'ahzab', 'saba', 'fatir', 'yaseen', 'saaffat', 'suad', 'zumar', 'ghafir', 'fussilat',
  'shura', 'zukhruf', 'dukhan', 'jasiya', 'ahqaf', 'muhammad', 'fath', 'hujraat',
  'qaf', 'zariyat', 'tur', 'najm', 'qamar', 'rehman', 'waqiah', 'hadeed',
  'mujadila', 'hashr', 'mumtahina', 'saff', 'jumma', 'munafiqoon', 'taghabun',
  'talaq', 'tahrim', 'mulk', 'qalam', 'haaqqa', 'maarij', 'nooh', 'jinn',
  'muzamil', 'mudasir', 'qiyama', 'insan', 'mursalat', 'naba', 'naziat',
  'abasa', 'takwir', 'infitar', 'mutaffifin', 'inshiqaq', 'burooj', 'tariq',
  'alaa', 'ghashiya', 'fajr', 'balad', 'shams', 'lail', 'zuha', 'nashrah',
  'tin', 'alaq', 'qadr', 'bayyina', 'zalzala', 'adiyaat', 'qaria',
  'takasur', 'asr', 'humaza', 'feel', 'quraish', 'maun', 'kausar',
  'kafiroon', 'nasr', 'masad', 'ikhlas', 'falaq', 'naas'
];

let names = englishNames;

function shuffleNames(type1, type2) {
  let index = type1.length;
  let rnd, tmp1, tmp2;
  while (index) {
    rnd = Math.floor(Math.random() * index);
    index -= 1;
    tmp1 = type1[index]; tmp2 = type2[index];
    type1[index] = type1[rnd]; type2[index] = type2[rnd];
    type1[rnd] = tmp1; type2[rnd] = tmp2;
  }
}

function getOpeningRandomMessage(surah) {
  let msg = [
    `Ok, opening surah ${surah}`,
    `Ok, here it is`,
    `Okay, opening surah ${surah}`,
    `Here is surah ${surah}`,
    `Okay, there it is`,
    `Opening surah ${surah}`,
    `Sure, opening surah ${surah}`,
    `Ok, there we go`
  ];
  /* Shuffle ang get random message */
  return msg[Math.floor(Math.random() * msg.length)];
}

function displaySuggestions() {
  /* copy first 7 random names for suggestions */
  let suggestion = names.slice(0, 6);
  suggestion.push('⋯');
  suggestion.push('↺');
  return new Suggestions(suggestion);
}

function getRandomMsg(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(o) {
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

app.intent('Default Welcome Intent', (conv) => {

  /* set default lang for user */
  conv.user.storage.lang = 'en';

  conv.ask(new SimpleResponse({
    speech: getWelcomeSSML(),
    text: `Welcome to the Holy Quran`
  }));

  let welcomeView = new BasicCard({
    text: "The Islamic sacred book written down in Arabic, which Muslims to be a revelation from God **(Allah)** as dictated to **Muhammad ﷺ**. **Quran** consists of 114 units of varying lengths, known as ***Surah***. These touch upon all aspects of human existence, including matters of doctrine, social organization, and legislation.",
    subtitle: 'The recitation',
    title: 'Al-Qurʾan القرآن',
    image: new Image({
      url: 'https://onehdwallpaper.com/wp-content/uploads/2014/11/Quran-HD-Wallpapers-Free-Download-For-Desktop.jpg',
      alt: 'The Holy Quran'
    })
  });

  conv.add(welcomeView);
  // conv.add(new Suggestions('listen', 'read'));
  conv.add(new Suggestions('listen', 'help'));

});

app.intent('read', (conv) => {

  //conv.ask(new SimpleResponse({
  //  speech: getInProcessSSML(),
  //  text: 'This section is under development.'
  //}));
  //conv.add(new Suggestions('listen'));

  (function(){

    let parahs = Object.keys(parahNames);
    shuffle(parahs);
    let suggestion = parahs.slice(0, 8);

    conv.ask(new SimpleResponse({
      speech: getRandomMsg([
        `Okay! what would you like to read`,
        `Okay no problem! can you please tell me the name`,
        `Alright! please tell me the name` ,
        `Please tell me what are you thinking`
      ]),
      text: 'Which one ?'
    }));
    conv.add(new Suggestions(suggestion));

  })();

});

app.intent('start reciting', (conv, {parah}) => {

  conv.ask(getRandomMsg(['Here it is.', 'Okay, Here it is.', 'Alright, there you go.']));

  let displaySurah = new BasicCard({
    text: parahNames[parah].description,
    subtitle: parahNames[parah].alt,
    title: parahNames[parah].ref,
    image: new Image({
      url: parahNames[parah].cover,
      alt: parahNames[parah].alt
    }),
    buttons: parahNames[parah].view ? new Button({
      title: 'Continue reading..',
      url: parahNames[parah].view
    }) : null
  });

  conv.add(displaySurah);
  conv.add(getRandomMsg([
    `anything else !`,
    `anything else ?`,
    `anything else ??`
  ]));

});

app.intent('listen', (conv, {surah}) => {

  /* for checking supported screen device capability */
  if (!conv.surface.capabilities.has('actions.capability.MEDIA_RESPONSE_AUDIO')) {
    conv.close(`hey, looks like your device doesn't support audio compatibility, you should open it on your mobile phone or other supported device`);
    return;
  }

  /* Shuffle quran surah names everytime for suggestion whenever this intent call */
  shuffleNames(englishNames, arabicNames);

  conv.ask(getOpeningRandomMessage(surah));

  let playAudio = new MediaObject({
    name: `Surah ${surahNames[surah]['alt']}`,
    url: surahNames[surah]['audio'],
    description: surahNames[surah]['subtitle'] ? surahNames[surah]['subtitle'] : null,
    icon: new Image({
      url: 'https://pbs.twimg.com/profile_images/677515986828939264/N_vffeWw_400x400.png',
      alt: surahNames[surah]['alt']
    })
  });

  conv.add(playAudio);
  conv.add(displaySuggestions());

});

app.intent('playback completed', (conv) => {

  const mediaStatus = conv.arguments.get('MEDIA_STATUS');
  let response = getRandomMsg([
    `I hope you've had a great day so far`,
    'Hope you had a wonderful day.',
    'I hope you had a wonderful day.'
  ]);
  if (mediaStatus && mediaStatus.status === 'FINISHED') {
    response = getRandomMsg([
      'You might also like to listen these.',
      'You might also like these.',
      'You should also listen to these.',
      `You'll also love to listen these.`,
      `You'd also love to hear these.`
    ]);
  }

  conv.ask(response);
  conv.add(displaySuggestions());

});

app.intent('translate', (conv) => {

  /* if the request contains the word " translate ", change the response */
  if(conv.body.queryResult.queryText.toLowerCase().indexOf('translate') !== -1) {
    conv.ask(getRandomMsg(['Okay, no problem!', 'No problem', 'Ok, no problem']));
  } else {
    conv.ask(getRandomMsg(['Okay!', 'Ok', 'Okay', 'Ok!', 'Alright!']));
  }

  if(!conv.user.storage.lang) conv.user.storage.lang = 'en';

  if(conv.user.storage.lang === 'en') {
    names = arabicNames;
    conv.user.storage.lang = 'arabic';
  } else {
    names = englishNames;
    conv.user.storage.lang = 'en';
  }

  conv.add(displaySuggestions());

});

app.intent('load more', (conv) => {

  conv.ask(getRandomMsg(['Here it is.', 'Okay!', 'There you go.', 'Alright!']));

  /* Shuffle quran surah names everytime whenever this intent call */
  shuffleNames(englishNames, arabicNames);

  conv.add(displaySuggestions());
  conv.add(getRandomMsg([
    `which one !`,
    `which one ?`,
    `which one ??`
  ]));
  
});

app.intent('display surah', (conv, {nameType}) => {

  (function(){

    /* Shuffle quran surah names everytime whenever this intent call */
    shuffleNames(englishNames, arabicNames);

    let displayArabicNames = [
      'الفاتحہ', 'البقرۃ', 'آل عمران', ' ٓالنسا', 'المائدۃ', 'الانعام', 'الاعراف',
      'الانفال', 'التوبۃ', 'یونس', 'ھود', 'یوسف', 'الرعد', 'ابراھیم', 'الحجر',
      'النحل', 'الاسرا', 'الکھف', 'مریم', 'طٰہٰ', 'الانبیآ', 'الحج', 'المومنون', 'النور',
      'الفرقان', 'الشعرآ', 'النمل', 'القصص', 'العنکبوت', 'الروم', 'لقمان', 'السجدۃ',
      'الاحزاب', 'سبا', 'فاطر', 'یٰس', 'الصافات', 'ص', 'الزمر', 'غافر', 'فصلت',
      'الشوری', 'الزخرف', 'الدخان', 'الجاثیۃ', 'الاحقاف', 'محمد', 'الفتح', 'الحجرات',
      'ق', 'الذاریات', 'الطور', 'النجم', 'القمر', 'الرحٰمن', 'الواقعہ', 'الحدید',
      'المجادلہ', 'الحشر', 'الممتحنۃ', 'الصف', 'الجمعۃ', 'المنافقون', 'التغابن',
      'الطلاق', 'التحریم', 'الملک', 'القلم', 'الحاقۃ', 'المعارج', 'نوح', 'الجن',
      'المزمل', 'المدثر', 'القیامۃ', 'الانسان', 'المرثلات', 'النبا', 'النازعات',
      'عبس', 'التکویر', 'الانفطار', 'المطففین', 'الانشقاق', 'البروج', 'الطارق',
      'الاعلی', 'الغاشیۃ', 'الفجر', 'البلد', 'الشمس', 'اللیل', 'الضحی', 'الشرح',
      'التین', 'العلق', 'القدر', 'البینۃ', 'الزلزلۃ', 'العادیات', 'القارعۃ',
      'التکاثر', 'العصر', 'الھمزۃ', 'الفیل', 'قریش', 'الماعون', 'الکوثر',
      'الکافرون', 'النصر', 'المسد', 'الاخلاص', 'الفلق', 'الناس'
    ];
    let displayEnglishNames = [
      'fatiha', 'baqarah', 'imran', 'nisa', 'maeda', 'inaam', 'araaf',
      'anfaal', 'taubah', 'yunus', 'hud', 'yusuf', 'raad', 'ibrahim', 'hijr',
      'nahl', 'isra', 'kahf', 'maryam', 'taha', 'anbiya', 'hajj', 'mumenoon', 'noor',
      'furqan', 'shuara', 'naml', 'qasas', 'ankaboot', 'room', 'luqman', 'sajdah',
      'ahzab', 'saba', 'fatir', 'yaseen', 'saaffat', 'suad', 'zumar', 'ghafir', 'fussilat',
      'shura', 'zukhruf', 'dukhan', 'jasiya', 'ahqaf', 'muhammad', 'fath', 'hujraat',
      'qaf', 'zariyat', 'tur', 'najm', 'qamar', 'rehman', 'waqiah', 'hadeed',
      'mujadila', 'hashr', 'mumtahina', 'saff', 'jumma', 'munafiqoon', 'taghabun',
      'talaq', 'tahrim', 'mulk', 'qalam', 'haaqqa', 'maarij', 'nooh', 'jinn',
      'muzamil', 'mudasir', 'qiyama', 'insan', 'mursalat', 'naba', 'naziat',
      'abasa', 'takwir', 'infitar', 'mutaffifin', 'inshiqaq', 'burooj', 'tariq',
      'alaa', 'ghashiya', 'fajr', 'balad', 'shams', 'lail', 'zuha', 'nashrah',
      'tin', 'alaq', 'qadr', 'bayyina', 'zalzala', 'adiyaat', 'qaria',
      'takasur', 'asr', 'humaza', 'feel', 'quraish', 'maun', 'kausar',
      'kafiroon', 'nasr', 'masad', 'ikhlas', 'falaq', 'naas'
    ];

    let displayNamesView;
    let suggestion;

    if(nameType) {
      conv.ask(getRandomMsg([
        `Okay, no problem showing ${nameType} surah names.`,
        `Ok, showing ${nameType} names.`,
        `Alright, showing surah names in ${nameType}.`
      ]));
      if(nameType === 'arabic') {
        displayNamesView = new BasicCard({
          text: displayArabicNames.toString().replace(/,/g , ', '),
          title: `____________________________________`,
          subtitle: '114 Surah Arabic names of Holy Quran.'
        });
        /* copy first 7 random arabic names for suggestions */
        suggestion = arabicNames.slice(0, 6);
      } else {
        displayNamesView = new BasicCard({
          text: displayEnglishNames.toString().replace(/,/g , ', '),
          title: `_______________________________`,
          subtitle: '114 Surah names of Holy Quran.'
        });
        /* copy first 7 random english names for suggestions */
        suggestion = englishNames.slice(0, 6);
      }
    } else {
      conv.ask(getRandomMsg([
        `Okay, no problem showing all surah names.`,
        `Ok, showing all names.`,
        `Alright, showing surah names.`
      ]));
      displayNamesView = new BasicCard({
        text: displayEnglishNames.toString().replace(/,/g , ', '),
        title: `_______________________________`,
        subtitle: '114 Surah names of Holy Quran.'
      });
      /* copy first 7 random arabic names for suggestions */
      suggestion = englishNames.slice(0, 6);
    }

    conv.add(displayNamesView);

    suggestion.push('⋯');
    suggestion.push('↺');

    conv.add(new Suggestions(suggestion));
    conv.add(getRandomMsg([
      `which one !`,
      `which one ?`,
      `which one ??`
    ]));

  })();

});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
