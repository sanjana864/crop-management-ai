import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

const speechLanguages = [
  { code: "en-US", name: "English", flag: "🇬🇧" },
  { code: "hi-IN", name: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "te-IN", name: "తెలుగు (Telugu)", flag: "🇮🇳" },
  { code: "ta-IN", name: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { code: "mr-IN", name: "मराठी (Marathi)", flag: "🇮🇳" },
  { code: "bn-IN", name: "বাংলা (Bengali)", flag: "🇮🇳" },
  { code: "gu-IN", name: "ગુજરાતી (Gujarati)", flag: "🇮🇳" },
  { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)", flag: "🇮🇳" },
  { code: "pa-IN", name: "ਪੰਜਾਬੀ (Punjabi)", flag: "🇮🇳" },
];

// Multilingual responses
const responses: Record<string, Record<string, string>> = {
  "en-US": {
    rice_plant: "Rice is best planted during monsoon season (June-July). Prepare nursery beds 25-30 days before transplanting. Maintain 2-3 inches of standing water in paddy fields.",
    rice_harvest: "Rice is ready for harvest when grains turn golden yellow and moisture content is 20-25%. Harvest 30-35 days after flowering. Dry grains to 14% moisture for storage.",
    rice_general: "Rice requires 1200-1500mm water. Use SRI method for better yield. Apply 120kg nitrogen, 60kg phosphorus, 40kg potassium per hectare.",
    wheat_plant: "Wheat sowing time is November-December. Use 100-125 kg seeds per hectare. Maintain row spacing of 20-22.5 cm for optimal growth.",
    wheat_harvest: "Wheat is ready when grains are hard and golden. Harvest at 12-14% moisture. Best time is early morning after dew dries.",
    wheat_general: "Wheat needs 4-6 irrigations. First at crown root stage (21 days), second at tillering, third at jointing, fourth at flowering.",
    sugarcane_plant: "Plant sugarcane in February-March or September-October. Use 3-budded setts from disease-free cane. Maintain 90-100 cm row spacing.",
    sugarcane_harvest: "Sugarcane matures in 10-12 months. Harvest when brix reading is 18-20%. Cut cane close to ground for better ratoon crop.",
    sugarcane_general: "Sugarcane needs regular irrigation every 7-10 days. Earthing up at 90 and 120 days is essential.",
    cotton_plant: "Cotton is sown in May-June with onset of monsoon. Use 2-2.5 kg seeds per hectare. Maintain plant spacing of 60x30 cm.",
    cotton_pest: "For bollworm control, use pheromone traps and neem-based sprays. Release Trichogramma wasps for biological control.",
    cotton_general: "Cotton needs 700-1200mm water. Pick cotton when bolls fully open. First picking 150-160 days after sowing.",
    tomato_plant: "Transplant tomato seedlings 25-30 days old. Space plants 60x45 cm apart. Stake plants when they reach 30 cm height.",
    tomato_disease: "For late blight, apply copper-based fungicides. Remove infected leaves immediately. Ensure proper spacing for air circulation.",
    tomato_general: "Tomatoes need 600-800mm water. Harvest when fruits turn red. Apply calcium to prevent blossom end rot.",
    maize_plant: "Sow maize in June-July for kharif or January-February for rabi. Use 20-25 kg seeds per hectare. Maintain 60x20 cm spacing.",
    maize_harvest: "Maize is ready when husks turn brown and kernels are hard. Harvest at 25% moisture for grain.",
    maize_general: "Maize needs 500-600mm water. Apply nitrogen in 3 splits - at sowing, knee-high stage, and tasseling.",
    irrigation: "For optimal irrigation, water crops early morning or late evening to minimize evaporation. Use drip irrigation to save 30-40% water.",
    pest: "For integrated pest management: Use pheromone traps for monitoring, release natural predators like ladybugs, apply neem oil spray weekly.",
    disease: "For disease control: Remove infected plants immediately, apply copper-based fungicides, ensure proper drainage, use disease-resistant varieties.",
    fertilizer: "Apply fertilizers based on soil test. General NPK ratio is 4:2:1 for most crops. Use organic manure 2-3 tons per hectare.",
    weather: "Monitor weather forecasts daily. Delay fertilizer application before rain. Prepare drainage channels before monsoon.",
    seed: "Use certified seeds from authorized dealers. Treat seeds with Thiram or Carbendazim before sowing. Check germination rate - should be above 85%.",
    soil: "Test soil every 2-3 years for pH and nutrients. Add lime if pH is below 6.0, add sulfur if above 7.5.",
    market: "Check AGMARKNET portal for daily mandi prices. Consider direct selling through Farmer Producer Organizations.",
    scheme: "Apply for Kisan Credit Card for easy loans. Check PM-KISAN scheme for direct income support.",
    hello: "Hello! I am your farming assistant. Ask me about crop cultivation, irrigation, pest control, fertilizers, weather guidance, market prices, or government schemes. How can I help you today?",
    thanks: "You are welcome! Feel free to ask more questions about farming. I am here to help you grow better crops.",
    default: "I can help you with farming queries about specific crops (rice, wheat, cotton, sugarcane, tomato, maize), irrigation, pest control, fertilizers, soil health, weather, market prices, and government schemes. Please ask a specific question!"
  },
  "ta-IN": {
    rice_plant: "நெல் பயிரிட சிறந்த காலம் மழைக்காலம் (ஜூன்-ஜூலை). நாற்றங்கால் படுக்கைகளை நடவு செய்வதற்கு 25-30 நாட்களுக்கு முன் தயார் செய்யுங்கள். நெல் வயல்களில் 2-3 அங்குல நீரை பராமரிக்கவும்.",
    rice_harvest: "தானியங்கள் தங்க மஞ்சள் நிறமாகவும், ஈரப்பதம் 20-25% ஆகவும் மாறும்போது நெல் அறுவடைக்கு தயாராகிறது. பூக்கும் காலத்திற்கு 30-35 நாட்களுக்குப் பிறகு அறுவடை செய்யுங்கள்.",
    rice_general: "நெல்லுக்கு 1200-1500 மி.மீ. தண்ணீர் தேவை. சிறந்த விளைச்சலுக்கு SRI முறையைப் பயன்படுத்துங்கள்.",
    wheat_plant: "கோதுமை விதைக்கும் காலம் நவம்பர்-டிசம்பர். ஹெக்டேருக்கு 100-125 கிலோ விதைகளைப் பயன்படுத்துங்கள்.",
    wheat_harvest: "தானியங்கள் கடினமாகவும் தங்க நிறமாகவும் இருக்கும்போது கோதுமை தயாராகிறது.",
    wheat_general: "கோதுமைக்கு 4-6 பாசனங்கள் தேவை.",
    sugarcane_plant: "கரும்பை பிப்ரவரி-மார்ச் அல்லது செப்டம்பர்-அக்டோபரில் நடவும்.",
    sugarcane_harvest: "கரும்பு 10-12 மாதங்களில் முதிர்ச்சியடைகிறது.",
    sugarcane_general: "கரும்புக்கு ஒவ்வொரு 7-10 நாட்களுக்கும் தொடர்ந்து பாசனம் தேவை.",
    cotton_plant: "பருத்தி மே-ஜூன் மாதங்களில் மழைக்காலத் தொடக்கத்தில் விதைக்கப்படுகிறது.",
    cotton_pest: "காய்ப்புழு கட்டுப்பாட்டிற்கு, பெரோமோன் பொறிகள் மற்றும் வேப்ப அடிப்படையிலான தெளிப்புகளைப் பயன்படுத்துங்கள்.",
    cotton_general: "பருத்திக்கு 700-1200 மி.மீ. தண்ணீர் தேவை.",
    tomato_plant: "25-30 நாள் வயதுள்ள தக்காளி நாற்றுகளை நடவும்.",
    tomato_disease: "பிந்தைய அழுகலுக்கு, தாமிர அடிப்படையிலான பூஞ்சைக் கொல்லிகளைப் பயன்படுத்துங்கள்.",
    tomato_general: "தக்காளிக்கு 600-800 மி.மீ. தண்ணீர் தேவை.",
    maize_plant: "மக்காச்சோளத்தை காரிஃப்புக்கு ஜூன்-ஜூலையிலும், ரபிக்கு ஜனவரி-பிப்ரவரியிலும் விதைக்கவும்.",
    maize_harvest: "உறைகள் பழுப்பு நிறமாகவும், கர்னல்கள் கடினமாகவும் மாறும்போது மக்காச்சோளம் தயாராகிறது.",
    maize_general: "மக்காச்சோளத்திற்கு 500-600 மி.மீ. தண்ணீர் தேவை.",
    irrigation: "சிறந்த பாசனத்திற்கு, ஆவியாகுதலை குறைக்க அதிகாலை அல்லது மாலையில் பயிர்களுக்கு தண்ணீர் ஊற்றவும்.",
    pest: "ஒருங்கிணைந்த பூச்சி மேலாண்மைக்கு: கண்காணிப்புக்கு பெரோமோன் பொறிகள் பயன்படுத்துங்கள்.",
    disease: "நோய் கட்டுப்பாட்டிற்கு: பாதிக்கப்பட்ட செடிகளை உடனடியாக அகற்றவும்.",
    fertilizer: "மண் பரிசோதனையின் அடிப்படையில் உரங்களைப் பயன்படுத்துங்கள்.",
    weather: "தினமும் வானிலை முன்னறிவிப்புகளை கண்காணிக்கவும்.",
    seed: "அங்கீகரிக்கப்பட்ட விற்பனையாளர்களிடமிருந்து சான்றளிக்கப்பட்ட விதைகளைப் பயன்படுத்துங்கள்.",
    soil: "pH மற்றும் ஊட்டச்சத்துக்களுக்கு ஒவ்வொரு 2-3 ஆண்டுகளுக்கும் மண்ணை பரிசோதிக்கவும்.",
    market: "தினசரி மண்டி விலைகளுக்கு AGMARKNET போர்ட்டலைப் பாருங்கள்.",
    scheme: "எளிதான கடன்களுக்கு கிசான் கிரெடிட் கார்டுக்கு விண்ணப்பிக்கவும்.",
    hello: "வணக்கம்! நான் உங்கள் விவசாய உதவியாளர். பயிர் சாகுபடி, பாசனம், பூச்சி கட்டுப்பாடு, உரங்கள், வானிலை வழிகாட்டுதல் பற்றி கேளுங்கள்.",
    thanks: "நன்றி! விவசாயம் பற்றி மேலும் கேள்விகள் கேட்க தயங்காதீர்கள்.",
    default: "குறிப்பிட்ட பயிர்கள், பாசனம், பூச்சி கட்டுப்பாடு, உரங்கள், மண் ஆரோக்கியம் பற்றிய விவசாய கேள்விகளுக்கு நான் உதவ முடியும்."
  },
  "hi-IN": {
    rice_plant: "धान की रोपाई के लिए सबसे अच्छा समय मानसून (जून-जुलाई) है। रोपाई से 25-30 दिन पहले नर्सरी बेड तैयार करें।",
    rice_harvest: "जब दाने सुनहरे पीले हो जाएं और नमी 20-25% हो तो धान कटाई के लिए तैयार है।",
    rice_general: "धान को 1200-1500 मिमी पानी चाहिए। बेहतर उपज के लिए SRI विधि का उपयोग करें।",
    wheat_plant: "गेहूं की बुवाई का समय नवंबर-दिसंबर है।",
    wheat_harvest: "जब दाने कड़े और सुनहरे हों तो गेहूं तैयार है।",
    wheat_general: "गेहूं को 4-6 सिंचाई चाहिए।",
    sugarcane_plant: "गन्ना फरवरी-मार्च या सितंबर-अक्टूबर में लगाएं।",
    sugarcane_harvest: "गन्ना 10-12 महीने में तैयार होता है।",
    sugarcane_general: "गन्ने को हर 7-10 दिन सिंचाई चाहिए।",
    cotton_plant: "कपास मई-जून में मानसून की शुरुआत में बोई जाती है।",
    cotton_pest: "बॉलवर्म नियंत्रण के लिए फेरोमोन ट्रैप और नीम स्प्रे का उपयोग करें।",
    cotton_general: "कपास को 700-1200 मिमी पानी चाहिए।",
    tomato_plant: "25-30 दिन पुरानी टमाटर की पौध रोपें।",
    tomato_disease: "लेट ब्लाइट के लिए कॉपर आधारित फंगीसाइड लगाएं।",
    tomato_general: "टमाटर को 600-800 मिमी पानी चाहिए।",
    maize_plant: "मक्का खरीफ के लिए जून-जुलाई में बोएं।",
    maize_harvest: "जब भुट्टे भूरे और दाने कड़े हों तो मक्का तैयार है।",
    maize_general: "मक्का को 500-600 मिमी पानी चाहिए।",
    irrigation: "इष्टतम सिंचाई के लिए सुबह या शाम को पानी दें।",
    pest: "एकीकृत कीट प्रबंधन के लिए फेरोमोन ट्रैप का उपयोग करें।",
    disease: "रोग नियंत्रण के लिए संक्रमित पौधों को तुरंत हटाएं।",
    fertilizer: "मिट्टी परीक्षण के आधार पर उर्वरक डालें।",
    weather: "दैनिक मौसम पूर्वानुमान देखें।",
    seed: "अधिकृत डीलरों से प्रमाणित बीज खरीदें।",
    soil: "हर 2-3 साल में मिट्टी का परीक्षण करें।",
    market: "दैनिक मंडी भावों के लिए AGMARKNET पोर्टल देखें।",
    scheme: "आसान ऋण के लिए किसान क्रेडिट कार्ड के लिए आवेदन करें।",
    hello: "नमस्ते! मैं आपका कृषि सहायक हूं। फसल खेती, सिंचाई, कीट नियंत्रण, उर्वरक, मौसम के बारे में पूछें।",
    thanks: "धन्यवाद! खेती के बारे में और प्रश्न पूछने में संकोच न करें।",
    default: "मैं विशिष्ट फसलों, सिंचाई, कीट नियंत्रण, उर्वरक, मिट्टी स्वास्थ्य के बारे में कृषि प्रश्नों में मदद कर सकता हूं।"
  },
  "te-IN": {
    rice_plant: "వరి నాటడానికి ఉత్తమ సమయం రుతుపవన సీజన్ (జూన్-జూలై).",
    rice_harvest: "గింజలు బంగారు పసుపు రంగుకు మారినప్పుడు వరి కోతకు సిద్ధంగా ఉంటుంది.",
    rice_general: "వరికి 1200-1500 మి.మీ నీరు అవసరం.",
    wheat_plant: "గోధుమ విత్తనం వేసే సమయం నవంబర్-డిసెంబర్.",
    wheat_harvest: "గింజలు గట్టిగా మరియు బంగారు రంగులో ఉన్నప్పుడు గోధుమ సిద్ధంగా ఉంటుంది.",
    wheat_general: "గోధుమకు 4-6 నీటిపారుదల అవసరం.",
    sugarcane_plant: "చెరకును ఫిబ్రవరి-మార్చి లేదా సెప్టెంబర్-అక్టోబర్‌లో నాటండి.",
    sugarcane_harvest: "చెరకు 10-12 నెలల్లో పరిపక్వం అవుతుంది.",
    sugarcane_general: "చెరకుకు ప్రతి 7-10 రోజులకు నీటిపారుదల అవసరం.",
    cotton_plant: "పత్తి మే-జూన్‌లో రుతుపవనాల ప్రారంభంలో విత్తబడుతుంది.",
    cotton_pest: "బోల్‌వార్మ్ నియంత్రణకు ఫెరోమోన్ ట్రాప్‌లు మరియు వేప ఆధారిత స్ప్రేలు వాడండి.",
    cotton_general: "పత్తికి 700-1200 మి.మీ నీరు అవసరం.",
    tomato_plant: "25-30 రోజుల వయసు టమాటో మొలకలను నాటండి.",
    tomato_disease: "లేట్ బ్లైట్‌కు రాగి ఆధారిత శిలీంద్ర నాశకాలు వాడండి.",
    tomato_general: "టమాటోకు 600-800 మి.మీ నీరు అవసరం.",
    maize_plant: "మొక్కజొన్నను ఖరీఫ్‌కు జూన్-జూలైలో విత్తండి.",
    maize_harvest: "పొట్టు గోధుమ రంగుకు మారినప్పుడు మొక్కజొన్న సిద్ధంగా ఉంటుంది.",
    maize_general: "మొక్కజొన్నకు 500-600 మి.మీ నీరు అవసరం.",
    irrigation: "ఉత్తమ నీటిపారుదల కోసం ఉదయం లేదా సాయంత్రం నీరు పెట్టండి.",
    pest: "సమగ్ర పురుగుల నిర్వహణకు ఫెరోమోన్ ట్రాప్‌లు వాడండి.",
    disease: "వ్యాధి నియంత్రణకు బాధిత మొక్కలను వెంటనే తొలగించండి.",
    fertilizer: "నేల పరీక్ష ఆధారంగా ఎరువులు వేయండి.",
    weather: "రోజువారీ వాతావరణ సూచనలను పర్యవేక్షించండి.",
    seed: "అధికారిక డీలర్ల నుండి ధృవీకరించబడిన విత్తనాలు వాడండి.",
    soil: "pH మరియు పోషకాల కోసం ప్రతి 2-3 సంవత్సరాలకు నేలను పరీక్షించండి.",
    market: "రోజువారీ మండి ధరల కోసం AGMARKNET పోర్టల్ చూడండి.",
    scheme: "సులభ రుణాల కోసం కిసాన్ క్రెడిట్ కార్డ్ కోసం దరఖాస్తు చేయండి.",
    hello: "నమస్కారం! నేను మీ వ్యవసాయ సహాయకుడిని. పంట సాగు, నీటిపారుదల, పురుగుల నియంత్రణ గురించి అడగండి.",
    thanks: "ధన్యవాదాలు! వ్యవసాయం గురించి మరిన్ని ప్రశ్నలు అడగడానికి సంకోచించకండి.",
    default: "నిర్దిష్ట పంటలు, నీటిపారుదల, పురుగుల నియంత్రణ, ఎరువులు గురించి వ్యవసాయ ప్రశ్నలలో నేను సహాయం చేయగలను."
  },
  "mr-IN": {
    hello: "नमस्कार! मी तुमचा शेती सहाय्यक आहे. पीक लागवड, सिंचन, कीड नियंत्रण याबद्दल विचारा.",
    default: "मी विशिष्ट पिके, सिंचन, कीड नियंत्रण, खते, माती आरोग्य याबद्दल शेती प्रश्नांमध्ये मदत करू शकतो."
  },
  "bn-IN": {
    hello: "নমস্কার! আমি আপনার কৃষি সহায়ক। ফসল চাষ, সেচ, কীটপতঙ্গ নিয়ন্ত্রণ সম্পর্কে জিজ্ঞাসা করুন।",
    default: "আমি নির্দিষ্ট ফসল, সেচ, কীটপতঙ্গ নিয়ন্ত্রণ, সার সম্পর্কে কৃষি প্রশ্নে সাহায্য করতে পারি।"
  },
  "gu-IN": {
    hello: "નમસ્તે! હું તમારો ખેતી સહાયક છું. પાક ઉછેર, સિંચાઈ, જંતુ નિયંત્રણ વિશે પૂછો.",
    default: "હું ચોક્કસ પાક, સિંચાઈ, જંતુ નિયંત્રણ, ખાતર વિશે ખેતી પ્રશ્નોમાં મદદ કરી શકું છું."
  },
  "kn-IN": {
    hello: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. ಬೆಳೆ ಕೃಷಿ, ನೀರಾವರಿ, ಕೀಟ ನಿಯಂತ್ರಣ ಬಗ್ಗೆ ಕೇಳಿ.",
    default: "ನಿರ್ದಿಷ್ಟ ಬೆಳೆಗಳು, ನೀರಾವರಿ, ಕೀಟ ನಿಯಂತ್ರಣ, ರಸಗೊಬ್ಬರಗಳ ಬಗ್ಗೆ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಲ್ಲಿ ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ."
  },
  "pa-IN": {
    hello: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਖੇਤੀ ਸਹਾਇਕ ਹਾਂ। ਫ਼ਸਲ ਕਾਸ਼ਤ, ਸਿੰਚਾਈ, ਕੀੜੇ ਕੰਟਰੋਲ ਬਾਰੇ ਪੁੱਛੋ।",
    default: "ਮੈਂ ਖਾਸ ਫ਼ਸਲਾਂ, ਸਿੰਚਾਈ, ਕੀੜੇ ਕੰਟਰੋਲ, ਖਾਦ ਬਾਰੇ ਖੇਤੀ ਸਵਾਲਾਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।"
  }
};

const getLangKey = (langCode: string): string => {
  return langCode;
};

const getFarmingResponse = (query: string, lang: string): string => {
  const lowerQuery = query.toLowerCase();
  const langKey = getLangKey(lang);
  const langResponses = responses[langKey] || responses["en-US"];

  const cropKeywords: Record<string, string> = {
    rice: "rice", paddy: "rice", நெல்: "rice", धान: "rice", चावल: "rice", వరి: "rice",
    wheat: "wheat", கோதுமை: "wheat", गेहूं: "wheat", గోధుమ: "wheat",
    sugarcane: "sugarcane", கரும்பு: "sugarcane", गन्ना: "sugarcane", చెరకు: "sugarcane",
    cotton: "cotton", பருத்தி: "cotton", कपास: "cotton", పత్తి: "cotton",
    tomato: "tomato", தக்காளி: "tomato", टमाटर: "tomato", టమాటో: "tomato",
    maize: "maize", corn: "maize", மக்காச்சோளம்: "maize", मक्का: "maize", మొక్కజొన్న: "maize",
  };

  let cropFound = "";
  for (const [keyword, crop] of Object.entries(cropKeywords)) {
    if (lowerQuery.includes(keyword)) {
      cropFound = crop;
      break;
    }
  }

  if (cropFound) {
    const actionKeywords = {
      plant: ["plant", "sow", "grow", "seed", "நடவு", "விதை", "बोना", "बुवाई", "నాటు", "విత్తనం"],
      harvest: ["harvest", "cut", "pick", "அறுவடை", "कटाई", "कोत", "కోత"],
      pest: ["pest", "insect", "bug", "worm", "பூச்சி", "कीट", "कीड़", "పురుగు"],
      disease: ["disease", "blight", "rot", "fungus", "நோய்", "रोग", "बीमारी", "వ్యాధి"],
    };

    for (const [action, keywords] of Object.entries(actionKeywords)) {
      if (keywords.some(k => lowerQuery.includes(k))) {
        const key = `${cropFound}_${action}`;
        if (langResponses[key]) return langResponses[key];
      }
    }
    return langResponses[`${cropFound}_general`] || langResponses.default;
  }

  const topicKeywords: Record<string, string[]> = {
    irrigation: ["irrigation", "water", "drip", "பாசனம்", "நீர்", "सिंचाई", "पानी", "నీటిపారుదల", "నీరు"],
    pest: ["pest", "insect", "bug", "பூச்சி", "कीट", "కీటకం", "పురుగు"],
    disease: ["disease", "blight", "rot", "நோய்", "रोग", "వ్యాధి"],
    fertilizer: ["fertilizer", "npk", "urea", "உரம்", "खाद", "उर्वरक", "ఎరువు"],
    weather: ["weather", "rain", "climate", "வானிலை", "மழை", "मौसम", "बारिश", "వాతావరణం"],
    seed: ["seed", "விதை", "बीज", "విత్తనం"],
    soil: ["soil", "மண்", "मिट्टी", "నేల"],
    market: ["market", "price", "mandi", "சந்தை", "விலை", "बाजार", "मंडी", "మార్కెట్"],
    scheme: ["scheme", "loan", "government", "திட்டம்", "योजना", "पद్ధతి"],
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(k => lowerQuery.includes(k))) {
      return langResponses[topic] || langResponses.default;
    }
  }

  const greetings = ["hello", "hi", "hey", "வணக்கம்", "नमस्ते", "నమస్కారం"];
  if (greetings.some(g => lowerQuery.includes(g))) {
    return langResponses.hello || langResponses.default;
  }

  const thanksWords = ["thank", "thanks", "நன்றி", "धन्यवाद", "ధన్యవాదాలు"];
  if (thanksWords.some(t => lowerQuery.includes(t))) {
    return langResponses.thanks || langResponses.default;
  }

  return langResponses.default;
};

export const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [selectedSpeechLang, setSelectedSpeechLang] = useState("en-US");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const { t, language } = useLanguage();

  // Sync speech language with global language
  useEffect(() => {
    const langMap: Record<string, string> = {
      en: "en-US",
      ta: "ta-IN",
      hi: "hi-IN",
      te: "te-IN",
    };
    setSelectedSpeechLang(langMap[language] || "en-US");
  }, [language]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        setTranscript(transcriptResult);
        
        if (event.results[current].isFinal) {
          setIsListening(false);
          setIsProcessing(true);
          
          setTimeout(() => {
            const farmResponse = getFarmingResponse(transcriptResult, selectedSpeechLang);
            setResponse(farmResponse);
            setIsProcessing(false);
          }, 500);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setError(`Error: ${event.error}. Please try again.`);
        setTimeout(() => setError(""), 3000);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedSpeechLang]);

  const toggleListening = () => {
    setError("");
    
    if (!recognitionRef.current) {
      setError(t('speechNotSupported'));
      return;
    }
    
    if (!isListening) {
      setTranscript("");
      setResponse("");
      recognitionRef.current.lang = selectedSpeechLang;
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start recognition:", err);
        setError(t('failedMic'));
      }
    } else {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakResponse = () => {
    if ('speechSynthesis' in window && response) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.lang = selectedSpeechLang;
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="feature-card">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Mic className="w-6 h-6 text-primary" />
        {t('voiceAssistant')}
      </h3>
      
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          {t('selectLanguage')}
        </label>
        <Select value={selectedSpeechLang} onValueChange={setSelectedSpeechLang}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('selectLanguage')} />
          </SelectTrigger>
          <SelectContent>
            {speechLanguages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}
      
      <div className="flex flex-col items-center py-6">
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening 
              ? 'bg-destructive text-destructive-foreground animate-pulse-glow shadow-glow scale-110' 
              : isProcessing
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:scale-105 shadow-card'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
        <p className="mt-4 text-lg font-medium">
          {isProcessing 
            ? t('processing')
            : isListening 
            ? t('listeningSpeak')
            : t('tapToAsk')}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('askAbout')}
        </p>
      </div>
      
      {transcript && (
        <div className="mt-4 p-4 bg-muted rounded-xl">
          <p className="text-sm text-muted-foreground mb-1">{t('youSaid')}</p>
          <p className="font-medium">{transcript}</p>
        </div>
      )}
      
      {response && (
        <div className="mt-4 p-4 bg-growth-light border-2 border-growth rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-growth">{t('assistantResponse')}</p>
            <Button variant="ghost" size="sm" onClick={speakResponse}>
              <Volume2 className="w-4 h-4 mr-1" /> {t('listen')}
            </Button>
          </div>
          <p className="text-foreground">{response}</p>
        </div>
      )}
    </div>
  );
};
