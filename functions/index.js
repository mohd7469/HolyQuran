
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
  Suggestions,
  dialogflow,
  BasicCard,
  MediaObject,
  Image
  } = require('actions-on-google');

/* Instantiate Dialogflow client */
const app = dialogflow();

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
          i am gonna let you notify soon when this will be done
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

let urduNames = [
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
  conv.add(new Suggestions('listen', 'read'));

});

app.intent('read', (conv) => {

  conv.ask(new SimpleResponse({
    speech: getInProcessSSML(),
    text: 'This section is under development.'
  }));
  conv.add(new Suggestions('listen'));

});

app.intent('listen', (conv, {surah}) => {

  /* for checking supported screen device capability */
  if (!conv.surface.capabilities.has('actions.capability.MEDIA_RESPONSE_AUDIO')) {
    conv.close(`hey, looks like your device doesn't support audio compatibility, you should open it on your mobile phone or other supported device`);
    return;
  }

  /* Shuffle quran surah names everytime whenever this intent call */
  shuffleNames(englishNames, urduNames);

  let data = {};

  return db.collection('quran').get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      return data;
    })
    .then(() => {
      conv.ask(getOpeningRandomMessage(surah));
      let playAudio = new MediaObject({
        name: `Surah ${data[surah]['alt']}`,
        url: data[surah]['audio'],
        description: data[surah]['subtitle'] ? data[surah]['subtitle'] : null,
        icon: new Image({
          url: 'https://pbs.twimg.com/profile_images/677515986828939264/N_vffeWw_400x400.png',
          alt: data[surah]['alt']
        })
      });

      conv.add(playAudio);
      conv.add(displaySuggestions());
      return;
    })
    .catch((err) => {
      console.log('Error getting documents ', err);
      conv.close(`i am sorry for this ${err}`);
    });

});

app.intent('playback completed', (conv) => {
  const mediaStatus = conv.arguments.get('MEDIA_STATUS');
  let response = 'Hope you enjoyed it.';
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

  conv.ask(getRandomMsg(['Okay!', 'Ok', 'Okay', 'Ok!', 'Alright!']));

  if(!conv.user.storage.lang) conv.user.storage.lang = 'en';

  if(conv.user.storage.lang === 'en') {
    names = urduNames;
    conv.user.storage.lang = 'urdu';
  } else {
    names = englishNames;
    conv.user.storage.lang = 'en';
  }

  console.info('storage lang ', conv.user.storage);

  conv.add(displaySuggestions());

});

app.intent('load more', (conv) => {

  conv.ask(getRandomMsg(['Here it is.', 'Okay!', 'There you go.', 'Alright!']));

  /* Shuffle quran surah names everytime whenever this intent call */
  shuffleNames(englishNames, urduNames);

  conv.add(displaySuggestions());

});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
