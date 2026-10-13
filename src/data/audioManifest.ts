/**
 * Central Multilingual Receptionist Audio Manifest for Renoos Hotel
 * Maps all 33 authentic audio recordings in public/audio/ across English, Marathi, and Hindi.
 */

export type Language = 'en' | 'mr' | 'hi'

export type AudioKey =
  | 'welcome'
  | 'exploreHotel'
  | 'chooseRoom'
  | 'startBooking'
  | 'bedroomTour'
  | 'bathroomTour'
  | 'selectDates'
  | 'guestCount'
  | 'bookingReview'
  | 'help'
  | 'thankYou'
  | `room_${string}`

export interface AudioItem {
  key: AudioKey
  language: Language
  filename: string
  src: string
  text: string
  englishMeaning: string
}

export interface RoomAudioItem extends AudioItem {
  roomNumber: string
}

export interface LanguageOption {
  code: Language
  label: string
  nativeLabel: string
  shortLabel: string
  subLabel: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    shortLabel: 'EN',
    subLabel: 'Receptionist Audio',
  },
  {
    code: 'mr',
    label: 'Marathi',
    nativeLabel: 'मराठी',
    shortLabel: 'मरा',
    subLabel: 'स्वागत व संभाषण',
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिंदी',
    shortLabel: 'हिं',
    subLabel: 'स्वागत व वार्तालाप',
  },
]

export const RECEPTIONIST_AUDIO_MANIFEST: Record<Language, Record<AudioKey, AudioItem>> = {
  en: {
    welcome: {
      key: 'welcome',
      language: 'en',
      filename: 'Hello! Welcome to Renoos Hotel. How can I help you today.mp3',
      src: encodeURI('/audio/English/Hello! Welcome to Renoos Hotel. How can I help you today.mp3'),
      text: 'Hello! Welcome to Renoos Hotel. How can I help you today?',
      englishMeaning: 'Hello! Welcome to Renoos Hotel. How can I help you today?',
    },
    exploreHotel: {
      key: 'exploreHotel',
      language: 'en',
      filename: 'Let me show you around our beautiful hotel. Shall we begin.mp3',
      src: encodeURI('/audio/English/Let me show you around our beautiful hotel. Shall we begin.mp3'),
      text: 'Let me show you around our beautiful hotel. Shall we begin?',
      englishMeaning: 'Let me show you around our beautiful hotel. Shall we begin?',
    },
    chooseRoom: {
      key: 'chooseRoom',
      language: 'en',
      filename: 'Which room would you like to explore Please select a room..mp3',
      src: encodeURI('/audio/English/Which room would you like to explore Please select a room..mp3'),
      text: 'Which room would you like to explore? Please select a room.',
      englishMeaning: 'Which room would you like to explore? Please select a room.',
    },
    startBooking: {
      key: 'startBooking',
      language: 'en',
      filename: "Would you like to book a room Let's start your reservation..mp3",
      src: encodeURI("/audio/English/Would you like to book a room Let's start your reservation..mp3"),
      text: "Would you like to book a room? Let's start your reservation.",
      englishMeaning: "Would you like to book a room? Let's start your reservation.",
    },
    bedroomTour: {
      key: 'bedroomTour',
      language: 'en',
      filename: 'This is the bedroom. Feel free to look around and explore..mp3',
      src: encodeURI('/audio/English/This is the bedroom. Feel free to look around and explore..mp3'),
      text: 'This is the bedroom. Feel free to look around and explore.',
      englishMeaning: 'This is the bedroom. Feel free to look around and explore.',
    },
    bathroomTour: {
      key: 'bathroomTour',
      language: 'en',
      filename: 'This is the bathroom. You can explore the space using the virtual tour..mp3',
      src: encodeURI('/audio/English/This is the bathroom. You can explore the space using the virtual tour..mp3'),
      text: 'This is the bathroom. You can explore the space using the virtual tour.',
      englishMeaning: 'This is the bathroom. You can explore the space using the virtual tour.',
    },
    selectDates: {
      key: 'selectDates',
      language: 'en',
      filename: 'Please choose your check-in and check-out dates..mp3',
      src: encodeURI('/audio/English/Please choose your check-in and check-out dates..mp3'),
      text: 'Please choose your check-in and check-out dates.',
      englishMeaning: 'Please choose your check-in and check-out dates.',
    },
    guestCount: {
      key: 'guestCount',
      language: 'en',
      filename: 'How many guests will be staying with you.mp3',
      src: encodeURI('/audio/English/How many guests will be staying with you.mp3'),
      text: 'How many guests will be staying with you?',
      englishMeaning: 'How many guests will be staying with you?',
    },
    bookingReview: {
      key: 'bookingReview',
      language: 'en',
      filename: 'Please review your booking details before confirming..mp3',
      src: encodeURI('/audio/English/Please review your booking details before confirming..mp3'),
      text: 'Please review your booking details before confirming.',
      englishMeaning: 'Please review your booking details before confirming.',
    },
    help: {
      key: 'help',
      language: 'en',
      filename: "Do you need any help I'm here to assist you..mp3",
      src: encodeURI("/audio/English/Do you need any help I'm here to assist you..mp3"),
      text: "Do you need any help? I'm here to assist you.",
      englishMeaning: "Do you need any help? I'm here to assist you.",
    },
    thankYou: {
      key: 'thankYou',
      language: 'en',
      filename: 'Thank you for choosing Renoos Hotel. We look forward to welcoming you!.mp3',
      src: encodeURI('/audio/English/Thank you for choosing Renoos Hotel. We look forward to welcoming you!.mp3'),
      text: 'Thank you for choosing Renoos Hotel. We look forward to welcoming you!',
      englishMeaning: 'Thank you for choosing Renoos Hotel. We look forward to welcoming you!',
    },
  },
  mr: {
    welcome: {
      key: 'welcome',
      language: 'mr',
      filename: 'नमस्कार! रीनूस हॉटेलमध्ये तुमचं स्वागत आहे. मी आज तुमची कशी मदत करू.mp3',
      src: encodeURI('/audio/Marathi/नमस्कार! रीनूस हॉटेलमध्ये तुमचं स्वागत आहे. मी आज तुमची कशी मदत करू.mp3'),
      text: 'नमस्कार! रीनूस हॉटेलमध्ये तुमचं स्वागत आहे. मी आज तुमची कशी मदत करू?',
      englishMeaning: 'Hello! Welcome to Renoos Hotel. How can I help you today?',
    },
    exploreHotel: {
      key: 'exploreHotel',
      language: 'mr',
      filename: 'चला, मी तुम्हाला आमचं सुंदर हॉटेल दाखवते. आपण सुरुवात करूया का.mp3',
      src: encodeURI('/audio/Marathi/चला, मी तुम्हाला आमचं सुंदर हॉटेल दाखवते. आपण सुरुवात करूया का.mp3'),
      text: 'चला, मी तुम्हाला आमचं सुंदर हॉटेल दाखवते. आपण सुरुवात करूया का?',
      englishMeaning: 'Let me show you around our beautiful hotel. Shall we begin?',
    },
    chooseRoom: {
      key: 'chooseRoom',
      language: 'mr',
      filename: 'तुम्हाला कोणती रूम पाहायची आहे कृपया रूम निवडा..mp3',
      src: encodeURI('/audio/Marathi/तुम्हाला कोणती रूम पाहायची आहे कृपया रूम निवडा..mp3'),
      text: 'तुम्हाला कोणती रूम पाहायची आहे? कृपया रूम निवडा.',
      englishMeaning: 'Which room would you like to explore? Please select a room.',
    },
    startBooking: {
      key: 'startBooking',
      language: 'mr',
      filename: 'तुम्हाला रूम बुक करायची आहे का चला, बुकिंग सुरू करूया..mp3',
      src: encodeURI('/audio/Marathi/तुम्हाला रूम बुक करायची आहे का चला, बुकिंग सुरू करूया..mp3'),
      text: 'तुम्हाला रूम बुक करायची आहे का? चला, बुकिंग सुरू करूया.',
      englishMeaning: "Would you like to book a room? Let's start your reservation.",
    },
    bedroomTour: {
      key: 'bedroomTour',
      language: 'mr',
      filename: 'ही बेडरूम आहे. तुम्ही आजूबाजूला पाहून रूम एक्सप्लोर करू शकता..mp3',
      src: encodeURI('/audio/Marathi/ही बेडरूम आहे. तुम्ही आजूबाजूला पाहून रूम एक्सप्लोर करू शकता..mp3'),
      text: 'ही बेडरूम आहे. तुम्ही आजूबाजूला पाहून रूम एक्सप्लोर करू शकता.',
      englishMeaning: 'This is the bedroom. Feel free to look around and explore.',
    },
    bathroomTour: {
      key: 'bathroomTour',
      language: 'mr',
      filename: 'हा बाथरूम आहे. तुम्ही व्हर्च्युअल टूरमधून तो पाहू शकता..mp3',
      src: encodeURI('/audio/Marathi/हा बाथरूम आहे. तुम्ही व्हर्च्युअल टूरमधून तो पाहू शकता..mp3'),
      text: 'हा बाथरूम आहे. तुम्ही व्हर्च्युअल टूरमधून तो पाहू शकता.',
      englishMeaning: 'This is the bathroom. You can explore the space using the virtual tour.',
    },
    selectDates: {
      key: 'selectDates',
      language: 'mr',
      filename: 'कृपया चेक-इन आणि चेक-आउटच्या तारखा निवडा..mp3',
      src: encodeURI('/audio/Marathi/कृपया चेक-इन आणि चेक-आउटच्या तारखा निवडा..mp3'),
      text: 'कृपया चेक-इन आणि चेक-आउटच्या तारखा निवडा.',
      englishMeaning: 'Please choose your check-in and check-out dates.',
    },
    guestCount: {
      key: 'guestCount',
      language: 'mr',
      filename: 'तुमच्यासोबत किती जण राहणार आहेत.mp3',
      src: encodeURI('/audio/Marathi/तुमच्यासोबत किती जण राहणार आहेत.mp3'),
      text: 'तुमच्यासोबत किती जण राहणार आहेत?',
      englishMeaning: 'How many guests will be staying with you?',
    },
    bookingReview: {
      key: 'bookingReview',
      language: 'mr',
      filename: 'बुकिंग कन्फर्म करण्यापूर्वी कृपया सर्व तपशील तपासा..mp3',
      src: encodeURI('/audio/Marathi/बुकिंग कन्फर्म करण्यापूर्वी कृपया सर्व तपशील तपासा..mp3'),
      text: 'बुकिंग कन्फर्म करण्यापूर्वी कृपया सर्व तपशील तपासा.',
      englishMeaning: 'Please review your booking details before confirming.',
    },
    help: {
      key: 'help',
      language: 'mr',
      filename: 'तुम्हाला काही मदत हवी आहे का मी तुमच्या मदतीसाठी इथे आहे..mp3',
      src: encodeURI('/audio/Marathi/तुम्हाला काही मदत हवी आहे का मी तुमच्या मदतीसाठी इथे आहे..mp3'),
      text: 'तुम्हाला काही मदत हवी आहे का? मी तुमच्या मदतीसाठी इथे आहे.',
      englishMeaning: "Do you need any help? I'm here to assist you.",
    },
    thankYou: {
      key: 'thankYou',
      language: 'mr',
      filename: 'रीनूस हॉटेल निवडल्याबद्दल धन्यवाद! तुमचं स्वागत करण्यासाठी आम्ही उत्सुक आहोत..mp3',
      src: encodeURI('/audio/Marathi/रीनूस हॉटेल निवडल्याबद्दल धन्यवाद! तुमचं स्वागत करण्यासाठी आम्ही उत्सुक आहोत..mp3'),
      text: 'रीनूस हॉटेल निवडल्याबद्दल धन्यवाद! तुमचं स्वागत करण्यासाठी आम्ही उत्सुक आहोत.',
      englishMeaning: 'Thank you for choosing Renoos Hotel. We look forward to welcoming you!',
    },
  },
  hi: {
    welcome: {
      key: 'welcome',
      language: 'hi',
      filename: 'नमस्ते! renoos  होटल में आपका स्वागत है। मैं आज आपकी क्या मदद कर सकती हूँ.mp3',
      src: encodeURI('/audio/Hindi/नमस्ते! renoos  होटल में आपका स्वागत है। मैं आज आपकी क्या मदद कर सकती हूँ.mp3'),
      text: 'नमस्ते! renoos होटल में आपका स्वागत है। मैं आज आपकी क्या मदद कर सकती हूँ?',
      englishMeaning: 'Hello! Welcome to Renoos Hotel. How can I help you today?',
    },
    exploreHotel: {
      key: 'exploreHotel',
      language: 'hi',
      filename: 'आइए, मैं आपको हमारा खूबसूरत होटल दिखाती हूँ। क्या हम शुरू करें.mp3',
      src: encodeURI('/audio/Hindi/आइए, मैं आपको हमारा खूबसूरत होटल दिखाती हूँ। क्या हम शुरू करें.mp3'),
      text: 'आइए, मैं आपको हमारा खूबसूरत होटल दिखाती हूँ। क्या हम शुरू करें?',
      englishMeaning: 'Let me show you around our beautiful hotel. Shall we begin?',
    },
    chooseRoom: {
      key: 'chooseRoom',
      language: 'hi',
      filename: 'आप कौन-सा कमरा देखना चाहेंगे कृपया कमरा चुनें।.mp3',
      src: encodeURI('/audio/Hindi/आप कौन-सा कमरा देखना चाहेंगे कृपया कमरा चुनें।.mp3'),
      text: 'आप कौन-सा कमरा देखना चाहेंगे? कृपया कमरा चुनें।',
      englishMeaning: 'Which room would you like to explore? Please select a room.',
    },
    startBooking: {
      key: 'startBooking',
      language: 'hi',
      filename: 'क्या आप कमरा बुक करना चाहेंगे आइए, बुकिंग शुरू करते हैं।.mp3',
      src: encodeURI('/audio/Hindi/क्या आप कमरा बुक करना चाहेंगे आइए, बुकिंग शुरू करते हैं।.mp3'),
      text: 'क्या आप कमरा बुक करना चाहेंगे? आइए, बुकिंग शुरू करते हैं।',
      englishMeaning: "Would you like to book a room? Let's start your reservation.",
    },
    bedroomTour: {
      key: 'bedroomTour',
      language: 'hi',
      filename: 'यह बेडरूम है। आप आसपास देखकर कमरे को एक्सप्लोर कर सकते हैं।.mp3',
      src: encodeURI('/audio/Hindi/यह बेडरूम है। आप आसपास देखकर कमरे को एक्सप्लोर कर सकते हैं।.mp3'),
      text: 'यह बेडरूम है। आप आसपास देखकर कमरे को एक्सप्लोर कर सकते हैं।',
      englishMeaning: 'This is the bedroom. Feel free to look around and explore.',
    },
    bathroomTour: {
      key: 'bathroomTour',
      language: 'hi',
      filename: 'यह बाथरूम है। आप वर्चुअल टूर के ज़रिए इसे देख सकते हैं।.mp3',
      src: encodeURI('/audio/Hindi/यह बाथरूम है। आप वर्चुअल टूर के ज़रिए इसे देख सकते हैं।.mp3'),
      text: 'यह बाथरूम है। आप वर्चुअल टूर के ज़रिए इसे देख सकते हैं।',
      englishMeaning: 'This is the bathroom. You can explore the space using the virtual tour.',
    },
    selectDates: {
      key: 'selectDates',
      language: 'hi',
      filename: 'कृपया चेक-इन और चेक-आउट की तारीखें चुनें।.mp3',
      src: encodeURI('/audio/Hindi/कृपया चेक-इन और चेक-आउट की तारीखें चुनें।.mp3'),
      text: 'कृपया चेक-इन और चेक-आउट की तारीखें चुनें।',
      englishMeaning: 'Please choose your check-in and check-out dates.',
    },
    guestCount: {
      key: 'guestCount',
      language: 'hi',
      filename: 'आपके साथ कितने मेहमान ठहरेंगे.mp3',
      src: encodeURI('/audio/Hindi/आपके साथ कितने मेहमान ठहरेंगे.mp3'),
      text: 'आपके साथ कितने मेहमान ठहरेंगे?',
      englishMeaning: 'How many guests will be staying with you?',
    },
    bookingReview: {
      key: 'bookingReview',
      language: 'hi',
      filename: 'बुकिंग कन्फर्म करने से पहले कृपया सभी जानकारी जाँच लें।.mp3',
      src: encodeURI('/audio/Hindi/बुकिंग कन्फर्म करने से पहले कृपया सभी जानकारी जाँच लें।.mp3'),
      text: 'बुकिंग कन्फर्म करने से पहले कृपया सभी जानकारी जाँच लें।',
      englishMeaning: 'Please review your booking details before confirming.',
    },
    help: {
      key: 'help',
      language: 'hi',
      filename: 'क्या आपको किसी मदद की ज़रूरत है मैं आपकी सहायता के लिए यहाँ हूँ।.mp3',
      src: encodeURI('/audio/Hindi/क्या आपको किसी मदद की ज़रूरत है मैं आपकी सहायता के लिए यहाँ हूँ।.mp3'),
      text: 'क्या आपको किसी मदद की ज़रूरत है? मैं आपकी सहायता के लिए यहाँ हूँ।',
      englishMeaning: "Do you need any help? I'm here to assist you.",
    },
    thankYou: {
      key: 'thankYou',
      language: 'hi',
      filename: 'रीनूस होटल चुनने के लिए धन्यवाद! हम आपका स्वागत करने के लिए उत्सुक हैं।.mp3',
      src: encodeURI('/audio/Hindi/रीनूस होटल चुनने के लिए धन्यवाद! हम आपका स्वागत करने के लिए उत्सुक हैं।.mp3'),
      text: 'रीनूस होटल चुनने के लिए धन्यवाद! हम आपका स्वागत करने के लिए उत्सुक हैं।',
      englishMeaning: 'Thank you for choosing Renoos Hotel. We look forward to welcoming you!',
    },
  },
}

/**
 * Helper to fetch AudioItem for a specific language and key with safe fallback.
 */
export function getAudioItem(lang: Language, key: AudioKey): AudioItem {
  const langManifest = RECEPTIONIST_AUDIO_MANIFEST[lang] || RECEPTIONIST_AUDIO_MANIFEST.en
  return langManifest[key] || RECEPTIONIST_AUDIO_MANIFEST.en[key]
}

/**
 * Helper to fetch audio source URL.
 */
export function getAudioSrc(lang: Language, key: AudioKey): string {
  return getAudioItem(lang, key).src
}

/**
 * Helper to fetch native script text.
 */
export function getAudioText(lang: Language, key: AudioKey): string {
  return getAudioItem(lang, key).text
}

/**
 * Room-Specific Announcements Manifest (Rooms 201–205)
 * Discovered under:
 * - public/audio/room no/english/
 * - public/audio/room no/hindi/
 * - public/audio/room no/marathi/
 */
export const ROOM_AUDIO_MANIFEST: Record<Language, Record<string, RoomAudioItem>> = {
  en: {
    '201': {
      key: 'room_201',
      roomNumber: '201',
      language: 'en',
      filename: 'You have selected Room No 201. Please explore your room!.mp3',
      src: encodeURI('/audio/room no/english/You have selected Room No 201. Please explore your room!.mp3'),
      text: 'You have selected Room No 201. Please explore your room!',
      englishMeaning: 'You have selected Room No 201. Please explore your room!',
    },
    '202': {
      key: 'room_202',
      roomNumber: '202',
      language: 'en',
      filename: 'You have selected Room No 202. Please explore your room!.mp3',
      src: encodeURI('/audio/room no/english/You have selected Room No 202. Please explore your room!.mp3'),
      text: 'You have selected Room No 202. Please explore your room!',
      englishMeaning: 'You have selected Room No 202. Please explore your room!',
    },
    '203': {
      key: 'room_203',
      roomNumber: '203',
      language: 'en',
      filename: 'You have selected Room No 203. Please explore your room!.mp3',
      src: encodeURI('/audio/room no/english/You have selected Room No 203. Please explore your room!.mp3'),
      text: 'You have selected Room No 203. Please explore your room!',
      englishMeaning: 'You have selected Room No 203. Please explore your room!',
    },
    '204': {
      key: 'room_204',
      roomNumber: '204',
      language: 'en',
      filename: 'You have selected Room No 204. Please explore your room!.mp3',
      src: encodeURI('/audio/room no/english/You have selected Room No 204. Please explore your room!.mp3'),
      text: 'You have selected Room No 204. Please explore your room!',
      englishMeaning: 'You have selected Room No 204. Please explore your room!',
    },
    '205': {
      key: 'room_205',
      roomNumber: '205',
      language: 'en',
      filename: 'You have selected Room No 205. Please explore your room!.mp3',
      src: encodeURI('/audio/room no/english/You have selected Room No 205. Please explore your room!.mp3'),
      text: 'You have selected Room No 205. Please explore your room!',
      englishMeaning: 'You have selected Room No 205. Please explore your room!',
    },
  },
  hi: {
    '201': {
      key: 'room_201',
      roomNumber: '201',
      language: 'hi',
      filename: 'आपने कमरा नंबर 201 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3',
      src: encodeURI('/audio/room no/hindi/आपने कमरा नंबर 201 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3'),
      text: 'आपने कमरा नंबर 201 चुना है। आइए, अब अपना कमरा देख लिजिए !',
      englishMeaning: 'You have selected Room No 201. Please explore your room!',
    },
    '202': {
      key: 'room_202',
      roomNumber: '202',
      language: 'hi',
      filename: 'आपने कमरा नंबर 202 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3',
      src: encodeURI('/audio/room no/hindi/आपने कमरा नंबर 202 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3'),
      text: 'आपने कमरा नंबर 202 चुना है। आइए, अब अपना कमरा देख लिजिए !',
      englishMeaning: 'You have selected Room No 202. Please explore your room!',
    },
    '203': {
      key: 'room_203',
      roomNumber: '203',
      language: 'hi',
      filename: 'आपने कमरा नंबर 203 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3',
      src: encodeURI('/audio/room no/hindi/आपने कमरा नंबर 203 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3'),
      text: 'आपने कमरा नंबर 203 चुना है। आइए, अब अपना कमरा देख लिजिए !',
      englishMeaning: 'You have selected Room No 203. Please explore your room!',
    },
    '204': {
      key: 'room_204',
      roomNumber: '204',
      language: 'hi',
      filename: 'आपने कमरा नंबर 204 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3',
      src: encodeURI('/audio/room no/hindi/आपने कमरा नंबर 204 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3'),
      text: 'आपने कमरा नंबर 204 चुना है। आइए, अब अपना कमरा देख लिजिए !',
      englishMeaning: 'You have selected Room No 204. Please explore your room!',
    },
    '205': {
      key: 'room_205',
      roomNumber: '205',
      language: 'hi',
      filename: 'आपने कमरा नंबर 205 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3',
      src: encodeURI('/audio/room no/hindi/आपने कमरा नंबर 205 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3'),
      text: 'आपने कमरा नंबर 205 चुना है। आइए, अब अपना कमरा देख लिजिए !',
      englishMeaning: 'You have selected Room No 205. Please explore your room!',
    },
  },
  mr: {
    '201': {
      key: 'room_201',
      roomNumber: '201',
      language: 'mr',
      filename: 'तुम्ही रूम no [201], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3',
      src: encodeURI('/audio/room no/marathi/तुम्ही रूम no [201], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3'),
      text: 'तुम्ही रूम no [201], निवडली आहे. तुम्ही रूम बघून घ्या !',
      englishMeaning: 'You have selected Room No 201. Please explore your room!',
    },
    '202': {
      key: 'room_202',
      roomNumber: '202',
      language: 'mr',
      filename: 'तुम्ही रूम no [202], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3',
      src: encodeURI('/audio/room no/marathi/तुम्ही रूम no [202], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3'),
      text: 'तुम्ही रूम no [202], निवडली आहे. तुम्ही रूम बघून घ्या !',
      englishMeaning: 'You have selected Room No 202. Please explore your room!',
    },
    '203': {
      key: 'room_203',
      roomNumber: '203',
      language: 'mr',
      filename: 'तुम्ही रूम no [203], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3',
      src: encodeURI('/audio/room no/marathi/तुम्ही रूम no [203], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3'),
      text: 'तुम्ही रूम no [203], निवडली आहे. तुम्ही रूम बघून घ्या !',
      englishMeaning: 'You have selected Room No 203. Please explore your room!',
    },
    '204': {
      key: 'room_204',
      roomNumber: '204',
      language: 'mr',
      filename: 'तुम्ही रूम no [204], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3',
      src: encodeURI('/audio/room no/marathi/तुम्ही रूम no [204], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3'),
      text: 'तुम्ही रूम no [204], निवडली आहे. तुम्ही रूम बघून घ्या !',
      englishMeaning: 'You have selected Room No 204. Please explore your room!',
    },
    '205': {
      key: 'room_205',
      roomNumber: '205',
      language: 'mr',
      filename: 'तुम्ही रूम no [205], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3',
      src: encodeURI('/audio/room no/marathi/तुम्ही रूम no [205], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3'),
      text: 'तुम्ही रूम no [205], निवडली आहे. तुम्ही रूम बघून घ्या !',
      englishMeaning: 'You have selected Room No 205. Please explore your room!',
    },
  },
}

/**
 * Helper to fetch RoomAudioItem for a room and language.
 */
export function getRoomAudioItem(lang: Language, roomNumber: string): RoomAudioItem | null {
  const cleanNumber = String(roomNumber).trim()
  const langManifest = ROOM_AUDIO_MANIFEST[lang] || ROOM_AUDIO_MANIFEST.en
  return langManifest[cleanNumber] || null
}

/**
 * Check if a room has a recording in the selected language.
 */
export function hasRoomAudio(lang: Language, roomNumber: string): boolean {
  return Boolean(getRoomAudioItem(lang, roomNumber))
}

/**
 * Helper to get room audio URL.
 */
export function getRoomAudioSrc(lang: Language, roomNumber: string): string | null {
  const item = getRoomAudioItem(lang, roomNumber)
  return item ? item.src : null
}

/**
 * Helper to get room audio text transcript.
 */
export function getRoomAudioText(lang: Language, roomNumber: string): string | null {
  const item = getRoomAudioItem(lang, roomNumber)
  return item ? item.text : null
}

/**
 * Inventory item definition for reporting and system validation.
 */
export interface AudioInventoryEntry {
  category: 'receptionist' | 'room'
  language: Language
  key: string
  roomNumber?: string
  filename: string
  publicUrl: string
  scriptText: string
  englishMeaning: string
  purpose: string
}

/**
 * Complete Audio Inventory covering all 48 authentic audio files.
 */
export const COMPLETE_AUDIO_INVENTORY: AudioInventoryEntry[] = [
  // Receptionist English (11)
  {
    category: 'receptionist',
    language: 'en',
    key: 'welcome',
    filename: 'Hello! Welcome to Renoos Hotel. How can I help you today.mp3',
    publicUrl: '/audio/English/Hello!%20Welcome%20to%20Renoos%20Hotel.%20How%20can%20I%20help%20you%20today.mp3',
    scriptText: 'Hello! Welcome to Renoos Hotel. How can I help you today?',
    englishMeaning: 'Hello! Welcome to Renoos Hotel. How can I help you today?',
    purpose: 'Lobby arrival and Welcome Menu greeting',
  },
  {
    category: 'receptionist',
    language: 'en',
    key: 'exploreHotel',
    filename: 'Let me show you around our beautiful hotel. Shall we begin.mp3',
    publicUrl: '/audio/English/Let%20me%20show%20you%20around%20our%20beautiful%20hotel.%20Shall%20we%20begin.mp3',
    scriptText: 'Let me show you around our beautiful hotel. Shall we begin?',
    englishMeaning: 'Let me show you around our beautiful hotel. Shall we begin?',
    purpose: 'Free exploration of resort and grand lobby',
  },
  {
    category: 'receptionist',
    language: 'en',
    key: 'chooseRoom',
    filename: 'Which room would you like to explore Please select a room..mp3',
    publicUrl: '/audio/English/Which%20room%20would%20you%20like%20to%20explore%20Please%20select%20a%20room..mp3',
    scriptText: 'Which room would you like to explore? Please select a room.',
    englishMeaning: 'Which room would you like to explore? Please select a room.',
    purpose: 'Suite selection prompt',
  },
  {
    category: 'receptionist',
    language: 'en',
    key: 'startBooking',
    filename: "Would you like to book a room Let's start your reservation..mp3",
    publicUrl: "/audio/English/Would%20you%20like%20to%20book%20a%20room%20Let's%20start%20your%20reservation..mp3",
    scriptText: "Would you like to book a room? Let's start your reservation.",
    englishMeaning: "Would you like to book a room? Let's start your reservation.",
    purpose: 'Initiating reservation booking flow',
  },
  {
    category: 'receptionist',
    language: 'en',
    key: 'bedroomTour',
    filename: 'This is the bedroom. Feel free to look around and explore..mp3',
    publicUrl: '/audio/English/This%20is%20the%20bedroom.%20Feel%20free%20to%20look%20around%20and%20explore..mp3',
    scriptText: 'This is the bedroom. Feel free to look around and explore.',
    englishMeaning: 'This is the bedroom. Feel free to look around and explore.',
    purpose: 'Suite bedroom tour narration',
  },
  {
    category: 'receptionist',
    language: 'en',
    key: 'bathroomTour',
    filename: 'This is the bathroom. You can explore the space using the virtual tour..mp3',
    publicUrl: '/audio/English/This%20is%20the%20bathroom.%20You%20can%20explore%20the%20space%20using%20the%20virtual%20tour..mp3',
    scriptText: 'This is the bathroom. You can explore the space using the virtual tour.',
    englishMeaning: 'This is the bathroom. You can explore the space using the virtual tour.',
    purpose: 'Suite bathroom / washroom tour narration',
  },
  {
    category: 'receptionist',
    language: 'en',
    key: 'selectDates',
    filename: 'Please choose your check-in and check-out dates..mp3',
    publicUrl: '/audio/English/Please%20choose%20your%20check-in%20and%20check-out%20dates..mp3',
    scriptText: 'Please choose your check-in and check-out dates.',
    englishMeaning: 'Please choose your check-in and check-out dates.',
    purpose: 'Reservation dates selection prompt',
  },
  {
    category: 'receptionist',
    language: 'en',
    key: 'guestCount',
    filename: 'How many guests will be staying with you.mp3',
    publicUrl: '/audio/English/How%20many%20guests%20will%20be%20staying%20with%20you.mp3',
    scriptText: 'How many guests will be staying with you?',
    englishMeaning: 'How many guests will be staying with you?',
    purpose: 'Adults and children count inquiry',
  },
  {
    category: 'receptionist',
    language: 'en',
    key: 'bookingReview',
    filename: 'Please review your booking details before confirming..mp3',
    publicUrl: '/audio/English/Please%20review%20your%20booking%20details%20before%20confirming..mp3',
    scriptText: 'Please review your booking details before confirming.',
    englishMeaning: 'Please review your booking details before confirming.',
    purpose: 'Modal booking review instruction',
  },
  {
    category: 'receptionist',
    language: 'en',
    key: 'help',
    filename: "Do you need any help I'm here to assist you..mp3",
    publicUrl: "/audio/English/Do%20you%20need%20any%20help%20I'm%20here%20to%20assist%20you..mp3",
    scriptText: "Do you need any help? I'm here to assist you.",
    englishMeaning: "Do you need any help? I'm here to assist you.",
    purpose: 'Concierge assistance inquiry',
  },
  {
    category: 'receptionist',
    language: 'en',
    key: 'thankYou',
    filename: 'Thank you for choosing Renoos Hotel. We look forward to welcoming you!.mp3',
    publicUrl: '/audio/English/Thank%20you%20for%20choosing%20Renoos%20Hotel.%20We%20look%20forward%20to%20welcoming%20you!.mp3',
    scriptText: 'Thank you for choosing Renoos Hotel. We look forward to welcoming you!',
    englishMeaning: 'Thank you for choosing Renoos Hotel. We look forward to welcoming you!',
    purpose: 'Reservation confirmation message',
  },

  // Receptionist Marathi (11)
  {
    category: 'receptionist',
    language: 'mr',
    key: 'welcome',
    filename: 'नमस्कार! रीनूस हॉटेलमध्ये तुमचं स्वागत आहे. मी आज तुमची कशी मदत करू.mp3',
    publicUrl: '/audio/Marathi/%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A4%BE%E0%A4%B0!%20%E0%A4%B0%E0%A5%80%E0%A4%A8%E0%A5%82%E0%A4%B8%20%E0%A4%B9%E0%A5%8 arrangements...',
    scriptText: 'नमस्कार! रीनूस हॉटेलमध्ये तुमचं स्वागत आहे. मी आज तुमची कशी मदत करू?',
    englishMeaning: 'Hello! Welcome to Renoos Hotel. How can I help you today?',
    purpose: 'Lobby arrival and Welcome Menu greeting (Marathi)',
  },
  {
    category: 'receptionist',
    language: 'mr',
    key: 'exploreHotel',
    filename: 'चला, मी तुम्हाला आमचं सुंदर हॉटेल दाखवते. आपण सुरुवात करूया का.mp3',
    publicUrl: encodeURI('/audio/Marathi/चला, मी तुम्हाला आमचं सुंदर हॉटेल दाखवते. आपण सुरुवात करूया का.mp3'),
    scriptText: 'चला, मी तुम्हाला आमचं सुंदर हॉटेल दाखवते. आपण सुरुवात करूया का?',
    englishMeaning: 'Let me show you around our beautiful hotel. Shall we begin?',
    purpose: 'Free exploration of resort (Marathi)',
  },
  {
    category: 'receptionist',
    language: 'mr',
    key: 'chooseRoom',
    filename: 'तुम्हाला कोणती रूम पाहायची आहे कृपया रूम निवडा..mp3',
    publicUrl: encodeURI('/audio/Marathi/तुम्हाला कोणती रूम पाहायची आहे कृपया रूम निवडा..mp3'),
    scriptText: 'तुम्हाला कोणती रूम पाहायची आहे? कृपया रूम निवडा.',
    englishMeaning: 'Which room would you like to explore? Please select a room.',
    purpose: 'Suite selection prompt (Marathi)',
  },
  {
    category: 'receptionist',
    language: 'mr',
    key: 'startBooking',
    filename: 'तुम्हाला रूम बुक करायची आहे का चला, बुकिंग सुरू करूया..mp3',
    publicUrl: encodeURI('/audio/Marathi/तुम्हाला रूम बुक करायची आहे का चला, बुकिंग सुरू करूया..mp3'),
    scriptText: 'तुम्हाला रूम बुक करायची आहे का? चला, बुकिंग सुरू करूया.',
    englishMeaning: "Would you like to book a room? Let's start your reservation.",
    purpose: 'Initiating reservation booking flow (Marathi)',
  },
  {
    category: 'receptionist',
    language: 'mr',
    key: 'bedroomTour',
    filename: 'ही बेडरूम आहे. तुम्ही आजूबाजूला पाहून रूम एक्सप्लोर करू शकता..mp3',
    publicUrl: encodeURI('/audio/Marathi/ही बेडरूम आहे. तुम्ही आजूबाजूला पाहून रूम एक्सप्लोर करू शकता..mp3'),
    scriptText: 'ही बेडरूम आहे. तुम्ही आजूबाजूला पाहून रूम एक्सप्लोर करू शकता.',
    englishMeaning: 'This is the bedroom. Feel free to look around and explore.',
    purpose: 'Suite bedroom tour narration (Marathi)',
  },
  {
    category: 'receptionist',
    language: 'mr',
    key: 'bathroomTour',
    filename: 'हा बाथरूम आहे. तुम्ही व्हर्च्युअल टूरमधून तो पाहू शकता..mp3',
    publicUrl: encodeURI('/audio/Marathi/हा बाथरूम आहे. तुम्ही व्हर्च्युअल टूरमधून तो पाहू शकता..mp3'),
    scriptText: 'हा बाथरूम आहे. तुम्ही व्हर्च्युअल टूरमधून तो पाहू शकता.',
    englishMeaning: 'This is the bathroom. You can explore the space using the virtual tour.',
    purpose: 'Suite bathroom / washroom tour narration (Marathi)',
  },
  {
    category: 'receptionist',
    language: 'mr',
    key: 'selectDates',
    filename: 'कृपया चेक-इन आणि चेक-आउटच्या तारखा निवडा..mp3',
    publicUrl: encodeURI('/audio/Marathi/कृपया चेक-इन आणि चेक-आउटच्या तारखा निवडा..mp3'),
    scriptText: 'कृपया चेक-इन आणि चेक-आउटच्या तारखा निवडा.',
    englishMeaning: 'Please choose your check-in and check-out dates.',
    purpose: 'Reservation dates selection prompt (Marathi)',
  },
  {
    category: 'receptionist',
    language: 'mr',
    key: 'guestCount',
    filename: 'तुमच्यासोबत किती जण राहणार आहेत.mp3',
    publicUrl: encodeURI('/audio/Marathi/तुमच्यासोबत किती जण राहणार आहेत.mp3'),
    scriptText: 'तुमच्यासोबत किती जण राहणार आहेत?',
    englishMeaning: 'How many guests will be staying with you?',
    purpose: 'Adults and children count inquiry (Marathi)',
  },
  {
    category: 'receptionist',
    language: 'mr',
    key: 'bookingReview',
    filename: 'बुकिंग कन्फर्म करण्यापूर्वी कृपया सर्व तपशील तपासा..mp3',
    publicUrl: encodeURI('/audio/Marathi/बुकिंग कन्फर्म करण्यापूर्वी कृपया सर्व तपशील तपासा..mp3'),
    scriptText: 'बुकिंग कन्फर्म करण्यापूर्वी कृपया सर्व तपशील तपासा.',
    englishMeaning: 'Please review your booking details before confirming.',
    purpose: 'Modal booking review instruction (Marathi)',
  },
  {
    category: 'receptionist',
    language: 'mr',
    key: 'help',
    filename: 'तुम्हाला काही मदत हवी आहे का मी तुमच्या मदतीसाठी इथे आहे..mp3',
    publicUrl: encodeURI('/audio/Marathi/तुम्हाला काही मदत हवी आहे का मी तुमच्या मदतीसाठी इथे आहे..mp3'),
    scriptText: 'तुम्हाला काही मदत हवी आहे का? मी तुमच्या मदतीसाठी इथे आहे.',
    englishMeaning: "Do you need any help? I'm here to assist you.",
    purpose: 'Concierge assistance inquiry (Marathi)',
  },
  {
    category: 'receptionist',
    language: 'mr',
    key: 'thankYou',
    filename: 'रीनूस हॉटेल निवडल्याबद्दल धन्यवाद! तुमचं स्वागत करण्यासाठी आम्ही उत्सुक आहोत..mp3',
    publicUrl: encodeURI('/audio/Marathi/रीनूस हॉटेल निवडल्याबद्दल धन्यवाद! तुमचं स्वागत करण्यासाठी आम्ही उत्सुक आहोत..mp3'),
    scriptText: 'रीनूस हॉटेल निवडल्याबद्दल धन्यवाद! तुमचं स्वागत करण्यासाठी आम्ही उत्सुक आहोत.',
    englishMeaning: 'Thank you for choosing Renoos Hotel. We look forward to welcoming you!',
    purpose: 'Reservation confirmation message (Marathi)',
  },

  // Receptionist Hindi (11)
  {
    category: 'receptionist',
    language: 'hi',
    key: 'welcome',
    filename: 'नमस्ते! renoos  होटल में आपका स्वागत है। मैं आज आपकी क्या मदद कर सकती हूँ.mp3',
    publicUrl: encodeURI('/audio/Hindi/नमस्ते! renoos  होटल में आपका स्वागत है। मैं आज आपकी क्या मदद कर सकती हूँ.mp3'),
    scriptText: 'नमस्ते! Renoos होटल में आपका स्वागत है। मैं आज आपकी क्या मदद कर सकती हूँ?',
    englishMeaning: 'Hello! Welcome to Renoos Hotel. How can I help you today?',
    purpose: 'Lobby arrival and Welcome Menu greeting (Hindi)',
  },
  {
    category: 'receptionist',
    language: 'hi',
    key: 'exploreHotel',
    filename: 'आइए, मैं आपको हमारा खूबसूरत होटल दिखाती हूँ। क्या हम शुरू करें.mp3',
    publicUrl: encodeURI('/audio/Hindi/आइए, मैं आपको हमारा खूबसूरत होटल दिखाती हूँ। क्या हम शुरू करें.mp3'),
    scriptText: 'आइए, मैं आपको हमारा खूबसूरत होटल दिखाती हूँ। क्या हम शुरू करें?',
    englishMeaning: 'Let me show you around our beautiful hotel. Shall we begin?',
    purpose: 'Free exploration of resort (Hindi)',
  },
  {
    category: 'receptionist',
    language: 'hi',
    key: 'chooseRoom',
    filename: 'आप कौन-सा कमरा देखना चाहेंगे कृपया कमरा चुनें।.mp3',
    publicUrl: encodeURI('/audio/Hindi/आप कौन-सा कमरा देखना चाहेंगे कृपया कमरा चुनें।.mp3'),
    scriptText: 'आप कौन-सा कमरा देखना चाहेंगे? कृपया कमरा चुनें।',
    englishMeaning: 'Which room would you like to explore? Please select a room.',
    purpose: 'Suite selection prompt (Hindi)',
  },
  {
    category: 'receptionist',
    language: 'hi',
    key: 'startBooking',
    filename: 'क्या आप कमरा बुक करना चाहेंगे आइए, बुकिंग शुरू करते हैं।.mp3',
    publicUrl: encodeURI('/audio/Hindi/क्या आप कमरा बुक करना चाहेंगे आइए, बुकिंग शुरू करते हैं।.mp3'),
    scriptText: 'क्या आप कमरा बुक करना चाहेंगे? आइए, बुकिंग शुरू करते हैं।',
    englishMeaning: "Would you like to book a room? Let's start your reservation.",
    purpose: 'Initiating reservation booking flow (Hindi)',
  },
  {
    category: 'receptionist',
    language: 'hi',
    key: 'bedroomTour',
    filename: 'यह बेडरूम है। आप आसपास देखकर कमरे को एक्सप्लोर कर सकते हैं।.mp3',
    publicUrl: encodeURI('/audio/Hindi/यह बेडरूम है। आप आसपास देखकर कमरे को एक्सप्लोर कर सकते हैं।.mp3'),
    scriptText: 'यह बेडरूम है। आप आसपास देखकर कमरे को एक्सप्लोर कर सकते हैं।',
    englishMeaning: 'This is the bedroom. Feel free to look around and explore.',
    purpose: 'Suite bedroom tour narration (Hindi)',
  },
  {
    category: 'receptionist',
    language: 'hi',
    key: 'bathroomTour',
    filename: 'यह बाथरूम है। आप वर्चुअल टूर के ज़रिए इसे देख सकते हैं।.mp3',
    publicUrl: encodeURI('/audio/Hindi/यह बाथरूम है। आप वर्चुअल टूर के ज़रिए इसे देख सकते हैं।.mp3'),
    scriptText: 'यह बाथरूम है। आप वर्चुअल टूर के ज़रिए इसे देख सकते हैं।',
    englishMeaning: 'This is the bathroom. You can explore the space using the virtual tour.',
    purpose: 'Suite bathroom / washroom tour narration (Hindi)',
  },
  {
    category: 'receptionist',
    language: 'hi',
    key: 'selectDates',
    filename: 'कृपया चेक-इन और चेक-आउट की तारीखें चुनें।.mp3',
    publicUrl: encodeURI('/audio/Hindi/कृपया चेक-इन और चेक-आउट की तारीखें चुनें।.mp3'),
    scriptText: 'कृपया चेक-इन और चेक-आउट की तारीखें चुनें।',
    englishMeaning: 'Please choose your check-in and check-out dates.',
    purpose: 'Reservation dates selection prompt (Hindi)',
  },
  {
    category: 'receptionist',
    language: 'hi',
    key: 'guestCount',
    filename: 'आपके साथ कितने मेहमान ठहरेंगे.mp3',
    publicUrl: encodeURI('/audio/Hindi/आपके साथ कितने मेहमान ठहरेंगे.mp3'),
    scriptText: 'आपके साथ कितने मेहमान ठहरेंगे?',
    englishMeaning: 'How many guests will be staying with you?',
    purpose: 'Adults and children count inquiry (Hindi)',
  },
  {
    category: 'receptionist',
    language: 'hi',
    key: 'bookingReview',
    filename: 'बुकिंग कन्फर्म करने से पहले कृपया सभी जानकारी जाँच लें।.mp3',
    publicUrl: encodeURI('/audio/Hindi/बुकिंग कन्फर्म करने से पहले कृपया सभी जानकारी जाँच लें।.mp3'),
    scriptText: 'बुकिंग कन्फर्म करने से पहले कृपया सभी जानकारी जाँच लें।',
    englishMeaning: 'Please review your booking details before confirming.',
    purpose: 'Modal booking review instruction (Hindi)',
  },
  {
    category: 'receptionist',
    language: 'hi',
    key: 'help',
    filename: 'क्या आपको किसी मदद की ज़रूरत है मैं आपकी सहायता के लिए यहाँ हूँ।.mp3',
    publicUrl: encodeURI('/audio/Hindi/क्या आपको किसी मदद की ज़रूरत है मैं आपकी सहायता के लिए यहाँ हूँ।.mp3'),
    scriptText: 'क्या आपको किसी मदद की ज़रूरत है? मैं आपकी सहायता के लिए यहाँ हूँ।',
    englishMeaning: "Do you need any help? I'm here to assist you.",
    purpose: 'Concierge assistance inquiry (Hindi)',
  },
  {
    category: 'receptionist',
    language: 'hi',
    key: 'thankYou',
    filename: 'रीनूस होटल चुनने के लिए धन्यवाद! हम आपका स्वागत करने के लिए उत्सुक हैं।.mp3',
    publicUrl: encodeURI('/audio/Hindi/रीनूस होटल चुनने के लिए धन्यवाद! हम आपका स्वागत करने के लिए उत्सुक हैं।.mp3'),
    scriptText: 'रीनूस होटल चुनने के लिए धन्यवाद! हम आपका स्वागत करने के लिए उत्सुक हैं।',
    englishMeaning: 'Thank you for choosing Renoos Hotel. We look forward to welcoming you!',
    purpose: 'Reservation confirmation message (Hindi)',
  },

  // Room Announcements: English (5)
  {
    category: 'room',
    language: 'en',
    key: 'room_201',
    roomNumber: '201',
    filename: 'You have selected Room No 201. Please explore your room!.mp3',
    publicUrl: encodeURI('/audio/room no/english/You have selected Room No 201. Please explore your room!.mp3'),
    scriptText: 'You have selected Room No 201. Please explore your room!',
    englishMeaning: 'You have selected Room No 201. Please explore your room!',
    purpose: 'Room 201 Deluxe Room selection announcement (English)',
  },
  {
    category: 'room',
    language: 'en',
    key: 'room_202',
    roomNumber: '202',
    filename: 'You have selected Room No 202. Please explore your room!.mp3',
    publicUrl: encodeURI('/audio/room no/english/You have selected Room No 202. Please explore your room!.mp3'),
    scriptText: 'You have selected Room No 202. Please explore your room!',
    englishMeaning: 'You have selected Room No 202. Please explore your room!',
    purpose: 'Room 202 Premium Room selection announcement (English)',
  },
  {
    category: 'room',
    language: 'en',
    key: 'room_203',
    roomNumber: '203',
    filename: 'You have selected Room No 203. Please explore your room!.mp3',
    publicUrl: encodeURI('/audio/room no/english/You have selected Room No 203. Please explore your room!.mp3'),
    scriptText: 'You have selected Room No 203. Please explore your room!',
    englishMeaning: 'You have selected Room No 203. Please explore your room!',
    purpose: 'Room 203 Executive Suite selection announcement (English)',
  },
  {
    category: 'room',
    language: 'en',
    key: 'room_204',
    roomNumber: '204',
    filename: 'You have selected Room No 204. Please explore your room!.mp3',
    publicUrl: encodeURI('/audio/room no/english/You have selected Room No 204. Please explore your room!.mp3'),
    scriptText: 'You have selected Room No 204. Please explore your room!',
    englishMeaning: 'You have selected Room No 204. Please explore your room!',
    purpose: 'Room 204 Horizon Suite selection announcement (English)',
  },
  {
    category: 'room',
    language: 'en',
    key: 'room_205',
    roomNumber: '205',
    filename: 'You have selected Room No 205. Please explore your room!.mp3',
    publicUrl: encodeURI('/audio/room no/english/You have selected Room No 205. Please explore your room!.mp3'),
    scriptText: 'You have selected Room No 205. Please explore your room!',
    englishMeaning: 'You have selected Room No 205. Please explore your room!',
    purpose: 'Room 205 Bohemian Suite selection announcement (English)',
  },

  // Room Announcements: Hindi (5)
  {
    category: 'room',
    language: 'hi',
    key: 'room_201',
    roomNumber: '201',
    filename: 'आपने कमरा नंबर 201 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3',
    publicUrl: encodeURI('/audio/room no/hindi/आपने कमरा नंबर 201 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3'),
    scriptText: 'आपने कमरा नंबर 201 चुना है। आइए, अब अपना कमरा देख लिजिए !',
    englishMeaning: 'You have selected Room No 201. Please explore your room!',
    purpose: 'Room 201 Deluxe Room selection announcement (Hindi)',
  },
  {
    category: 'room',
    language: 'hi',
    key: 'room_202',
    roomNumber: '202',
    filename: 'आपने कमरा नंबर 202 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3',
    publicUrl: encodeURI('/audio/room no/hindi/आपने कमरा नंबर 202 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3'),
    scriptText: 'आपने कमरा नंबर 202 चुना है। आइए, अब अपना कमरा देख लिजिए !',
    englishMeaning: 'You have selected Room No 202. Please explore your room!',
    purpose: 'Room 202 Premium Room selection announcement (Hindi)',
  },
  {
    category: 'room',
    language: 'hi',
    key: 'room_203',
    roomNumber: '203',
    filename: 'आपने कमरा नंबर 203 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3',
    publicUrl: encodeURI('/audio/room no/hindi/आपने कमरा नंबर 203 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3'),
    scriptText: 'आपने कमरा नंबर 203 चुना है। आइए, अब अपना कमरा देख लिजिए !',
    englishMeaning: 'You have selected Room No 203. Please explore your room!',
    purpose: 'Room 203 Executive Suite selection announcement (Hindi)',
  },
  {
    category: 'room',
    language: 'hi',
    key: 'room_204',
    roomNumber: '204',
    filename: 'आपने कमरा नंबर 204 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3',
    publicUrl: encodeURI('/audio/room no/hindi/आपने कमरा नंबर 204 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3'),
    scriptText: 'आपने कमरा नंबर 204 चुना है। आइए, अब अपना कमरा देख लिजिए !',
    englishMeaning: 'You have selected Room No 204. Please explore your room!',
    purpose: 'Room 204 Horizon Suite selection announcement (Hindi)',
  },
  {
    category: 'room',
    language: 'hi',
    key: 'room_205',
    roomNumber: '205',
    filename: 'आपने कमरा नंबर 205 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3',
    publicUrl: encodeURI('/audio/room no/hindi/आपने कमरा नंबर 205 चुना है। आइए, अब अपना कमरा देख लिजिए !.mp3'),
    scriptText: 'आपने कमरा नंबर 205 चुना है। आइए, अब अपना कमरा देख लिजिए !',
    englishMeaning: 'You have selected Room No 205. Please explore your room!',
    purpose: 'Room 205 Bohemian Suite selection announcement (Hindi)',
  },

  // Room Announcements: Marathi (5)
  {
    category: 'room',
    language: 'mr',
    key: 'room_201',
    roomNumber: '201',
    filename: 'तुम्ही रूम no [201], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3',
    publicUrl: encodeURI('/audio/room no/marathi/तुम्ही रूम no [201], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3'),
    scriptText: 'तुम्ही रूम no [201], निवडली आहे. तुम्ही रूम बघून घ्या !',
    englishMeaning: 'You have selected Room No 201. Please explore your room!',
    purpose: 'Room 201 Deluxe Room selection announcement (Marathi)',
  },
  {
    category: 'room',
    language: 'mr',
    key: 'room_202',
    roomNumber: '202',
    filename: 'तुम्ही रूम no [202], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3',
    publicUrl: encodeURI('/audio/room no/marathi/तुम्ही रूम no [202], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3'),
    scriptText: 'तुम्ही रूम no [202], निवडली आहे. तुम्ही रूम बघून घ्या !',
    englishMeaning: 'You have selected Room No 202. Please explore your room!',
    purpose: 'Room 202 Premium Room selection announcement (Marathi)',
  },
  {
    category: 'room',
    language: 'mr',
    key: 'room_203',
    roomNumber: '203',
    filename: 'तुम्ही रूम no [203], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3',
    publicUrl: encodeURI('/audio/room no/marathi/तुम्ही रूम no [203], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3'),
    scriptText: 'तुम्ही रूम no [203], निवडली आहे. तुम्ही रूम बघून घ्या !',
    englishMeaning: 'You have selected Room No 203. Please explore your room!',
    purpose: 'Room 203 Executive Suite selection announcement (Marathi)',
  },
  {
    category: 'room',
    language: 'mr',
    key: 'room_204',
    roomNumber: '204',
    filename: 'तुम्ही रूम no [204], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3',
    publicUrl: encodeURI('/audio/room no/marathi/तुम्ही रूम no [204], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3'),
    scriptText: 'तुम्ही रूम no [204], निवडली आहे. तुम्ही रूम बघून घ्या !',
    englishMeaning: 'You have selected Room No 204. Please explore your room!',
    purpose: 'Room 204 Horizon Suite selection announcement (Marathi)',
  },
  {
    category: 'room',
    language: 'mr',
    key: 'room_205',
    roomNumber: '205',
    filename: 'तुम्ही रूम no [205], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3',
    publicUrl: encodeURI('/audio/room no/marathi/तुम्ही रूम no [205], निवडली आहे. तुम्ही रूम बघून  घ्या  !.mp3'),
    scriptText: 'तुम्ही रूम no [205], निवडली आहे. तुम्ही रूम बघून घ्या !',
    englishMeaning: 'You have selected Room No 205. Please explore your room!',
    purpose: 'Room 205 Bohemian Suite selection announcement (Marathi)',
  },
]

