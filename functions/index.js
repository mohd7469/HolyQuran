
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
  Suggestions,BrowseCarouselItem, List,NewSurface,MediaObject,BrowseCarousel,
  dialogflow,
  BasicCard,
  Button,
  Image
  } = require('actions-on-google');

/* Instantiate Dialogflow client */
const app = dialogflow();

let names = [
  'fatiha', 'para 1', 'para 2', 'para 3', 'para 4',
  'para 5', 'para 6', 'para 7', 'para 8', 'para 9',
  'para 10', 'para 11', 'para 12', 'para 13', 'para 14',
  'kahf', 'para 15', 'para 16', 'para 17', 'para 18',
  'para 19', 'para 20', 'sajdah', 'para 21', 'para 22',
  'yaseen', 'para 23', 'para 24', 'dukhan', 'para 25',
  'para 26', 'fath', 'rehman', 'waqiah', 'para 27',
  'hashr', 'para 28', 'para 29', 'mulk', 'muzamil',
  'mudasir', 'para 30', 'ikhlas'
];

function getOpeningRandomMessage(surah) {
  let msg = [
    `ok, opening surah ${surah}`,
    `ok, here it is`,
    `okay, opening surah ${surah}`,
    `here is surah ${surah}`,
    `okay, there it is`,
    `opening surah ${surah}`,
    `sure, opening surah ${surah}`,
    `ok, there we go`
  ];
  switch (surah) {
    case 'last twenty': {
      return `okay, now opening ${surah} surah of Holy Quran`;
    }
    default: {
      /* Shuffle ang get random message */
      let text = msg[Math.floor(Math.random() * msg.length)];

      /* if request contain the word "para", then remove the text "surah" from msg */
      if(surah.indexOf('para') !== -1) {
        text = text.replace('surah', '');
      }

      return text;
    }
  }
}

app.intent('read surah', (conv, {surah}) => {

  /* for checking supported screen device capability */
  if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
    conv.ask(`Sorry, try this on a supported screen device your phone doesn't support rich responses`);
    return;
  }

  /* Shuffle quran surah names everytime whenever this intent call */
  names.sort(() => { return 0.5 - Math.random() });

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

      let displaySurah = new BasicCard({
        text: data[surah].text,
        subtitle: data[surah].alt,
        //title: 'Title: this is a title',
        image: new Image(data[surah]),
        buttons: data[surah].view ? new Button({
          title: 'Continue reading..',
          url: data[surah].view
        }) : null
      });

      /* now copy first five random names for suggestions which we have Shuffle */
      let suggestion = names.slice(0, 5);

      /* if request is already for last twenty than do not show in suggestion */
      if(surah !== 'last twenty') suggestion.push('last twenty surah');

      let displaySuggestions = new Suggestions(suggestion);

      conv.add(displaySurah);
      conv.add(displaySuggestions);
      return;
    })
    .catch((err) => {
      conv.close(`i am sorry for this ${err}`);
      console.log('Error getting documents ', err);
    });

});

app.intent('test', (conv) => {

  //const screenAvailable = conv.available.surfaces.capabilities.has('actions.capability.SCREEN_OUTPUT');
  //const context = 'Sure, I have some sample images for you.';
  //const notification = 'Sample Images';
  //const capabilities = ['actions.capability.SCREEN_OUTPUT'];
  //if (screenAvailable) {
  //  conv.ask(new NewSurface({
  //    context,
  //    notification,
  //    capabilities
  //  }));
  //} else {
  //  conv.close("Sorry, you need a screen to see pictures");
  //}

  //if (!conv.surface.capabilities.has('actions.capability.MEDIA_RESPONSE_AUDIO')) {
  //  conv.ask('Sorry, this device does not support audio playback.');
  //  return;
  //}
  //conv.ask('Playing Surah Rehman...');
  //
  //conv.ask(new MediaObject({
  //  name: 'Surah Rehman',
  //  url: 'https://media.blubrry.com/muslim_central_quran/audio1.qurancentral.com/fares-abbad/fares-abbad-055.mp3',
  //  description: 'This is Surah Rehman',
  //  icon: new Image({
  //    url: 'https://freeislamiccalligraphy.com/wp-content/uploads/2014/07/Al-Rahman.jpg',
  //    alt: 'Ar-Rehman'
  //  })
  //}));
  //conv.add(new Suggestions('Surah Mulk', 'Surah Yaseen', 'Surah Ikhlas', 'Surah Hashr', 'Surah Sajda', 'Surah Tauba'));

  conv.ask('browse items ...');
  conv.ask(new BrowseCarousel({
    items: [
      new BrowseCarouselItem({
        title: 'Mulk',
        url: 'https://firebasestorage.googleapis.com/v0/b/holy-quran-e99eb.appspot.com/o/popular%2Fmulk%2Fcover.png?alt=media&token=b23113a9-cc75-4f10-b020-2c40b978e80d',
        description: 'Description of Surah Mulk Image',
        image: new Image({
          url: 'https://images.pexels.com/photos/908283/pexels-photo-908283.jpeg?auto=compress&cs=tinysrgb&h=350',
          alt: 'Surah Mulk'
        }),
        footer: 'Surah Mulk footer'
      }),
      new BrowseCarouselItem({
        title: 'Title of item 2',
        url: 'https://www.google.com',
        description: 'Description of item 2',
        image: new Image({
          url: 'https://images.pexels.com/photos/908283/pexels-photo-908283.jpeg?auto=compress&cs=tinysrgb&h=350',
          alt: 'Image text 1'
        }),
        footer: 'Item 2 footer'
      })
    ]
  }));
});

const itemResponses = {
  'Carousel 1': 'You selected the first item',
  'Carousel 2': 'You selected the second item'
};

app.intent('custom intent', (conv, params, option) => {
  let response = 'You did not select any item';
  if (option && itemResponses.hasOwnProperty(option)) {
    response = itemResponses[option];
  }
  conv.ask(response);
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
