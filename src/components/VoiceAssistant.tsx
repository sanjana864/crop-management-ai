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
const languages = [
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
    rice_general: "நெல்லுக்கு 1200-1500 மி.மீ. தண்ணீர் தேவை. சிறந்த விளைச்சலுக்கு SRI முறையைப் பயன்படுத்துங்கள். ஹெக்டேருக்கு 120 கிலோ நைட்ரஜன், 60 கிலோ பாஸ்பரஸ், 40 கிலோ பொட்டாசியம் பயன்படுத்துங்கள்.",
    wheat_plant: "கோதுமை விதைக்கும் காலம் நவம்பர்-டிசம்பர். ஹெக்டேருக்கு 100-125 கிலோ விதைகளைப் பயன்படுத்துங்கள். சிறந்த வளர்ச்சிக்கு 20-22.5 செ.மீ. வரிசை இடைவெளியை பராமரிக்கவும்.",
    wheat_harvest: "தானியங்கள் கடினமாகவும் தங்க நிறமாகவும் இருக்கும்போது கோதுமை தயாராகிறது. 12-14% ஈரப்பதத்தில் அறுவடை செய்யுங்கள்.",
    wheat_general: "கோதுமைக்கு 4-6 பாசனங்கள் தேவை. முதல் பாசனம் கிரீடம் வேர் நிலையில் (21 நாட்கள்), இரண்டாவது பட்டையிடும் நிலையில்.",
    sugarcane_plant: "கரும்பை பிப்ரவரி-மார்ச் அல்லது செப்டம்பர்-அக்டோபரில் நடவும். நோயில்லாத கரும்பிலிருந்து 3 கண் செட்டுகளைப் பயன்படுத்துங்கள்.",
    sugarcane_harvest: "கரும்பு 10-12 மாதங்களில் முதிர்ச்சியடைகிறது. பிரிக்ஸ் அளவீடு 18-20% ஆக இருக்கும்போது அறுவடை செய்யுங்கள்.",
    sugarcane_general: "கரும்புக்கு ஒவ்வொரு 7-10 நாட்களுக்கும் தொடர்ந்து பாசனம் தேவை. 90 மற்றும் 120 நாட்களில் மண் அணைத்தல் அவசியம்.",
    cotton_plant: "பருத்தி மே-ஜூன் மாதங்களில் மழைக்காலத் தொடக்கத்தில் விதைக்கப்படுகிறது. ஹெக்டேருக்கு 2-2.5 கிலோ விதைகளைப் பயன்படுத்துங்கள்.",
    cotton_pest: "காய்ப்புழு கட்டுப்பாட்டிற்கு, பெரோமோன் பொறிகள் மற்றும் வேப்ப அடிப்படையிலான தெளிப்புகளைப் பயன்படுத்துங்கள்.",
    cotton_general: "பருத்திக்கு 700-1200 மி.மீ. தண்ணீர் தேவை. காய்கள் முழுமையாக திறக்கும்போது பருத்தியை எடுங்கள்.",
    tomato_plant: "25-30 நாள் வயதுள்ள தக்காளி நாற்றுகளை நடவும். செடிகளை 60x45 செ.மீ. இடைவெளியில் வைக்கவும்.",
    tomato_disease: "பிந்தைய அழுகலுக்கு, தாமிர அடிப்படையிலான பூஞ்சைக் கொல்லிகளைப் பயன்படுத்துங்கள். பாதிக்கப்பட்ட இலைகளை உடனடியாக அகற்றவும்.",
    tomato_general: "தக்காளிக்கு 600-800 மி.மீ. தண்ணீர் தேவை. பழங்கள் சிவப்பாக மாறும்போது அறுவடை செய்யுங்கள்.",
    maize_plant: "மக்காச்சோளத்தை காரிஃப்புக்கு ஜூன்-ஜூலையிலும், ரபிக்கு ஜனவரி-பிப்ரவரியிலும் விதைக்கவும். ஹெக்டேருக்கு 20-25 கிலோ விதைகளைப் பயன்படுத்துங்கள்.",
    maize_harvest: "உறைகள் பழுப்பு நிறமாகவும், கர்னல்கள் கடினமாகவும் மாறும்போது மக்காச்சோளம் தயாராகிறது.",
    maize_general: "மக்காச்சோளத்திற்கு 500-600 மி.மீ. தண்ணீர் தேவை. நைட்ரஜனை 3 தவணைகளில் பயன்படுத்துங்கள்.",
    irrigation: "சிறந்த பாசனத்திற்கு, ஆவியாகுதலை குறைக்க அதிகாலை அல்லது மாலையில் பயிர்களுக்கு தண்ணீர் ஊற்றவும். 30-40% தண்ணீரை சேமிக்க சொட்டு நீர் பாசனத்தைப் பயன்படுத்துங்கள்.",
    pest: "ஒருங்கிணைந்த பூச்சி மேலாண்மைக்கு: கண்காணிப்புக்கு பெரோமோன் பொறிகள், இயற்கை வேட்டையாடிகளை விடுதல், வாராந்திர வேப்ப எண்ணெய் தெளிப்பு பயன்படுத்துங்கள்.",
    disease: "நோய் கட்டுப்பாட்டிற்கு: பாதிக்கப்பட்ட செடிகளை உடனடியாக அகற்றவும், தாமிர அடிப்படையிலான பூஞ்சைக் கொல்லிகளைப் பயன்படுத்துங்கள், சரியான வடிகால் உறுதி செய்யவும்.",
    fertilizer: "மண் பரிசோதனையின் அடிப்படையில் உரங்களைப் பயன்படுத்துங்கள். பெரும்பாலான பயிர்களுக்கு பொதுவான NPK விகிதம் 4:2:1. ஹெக்டேருக்கு 2-3 டன் தொழு உரம் பயன்படுத்துங்கள்.",
    weather: "தினமும் வானிலை முன்னறிவிப்புகளை கண்காணிக்கவும். மழைக்கு முன் உர பயன்பாட்டை தாமதப்படுத்துங்கள். பருவமழைக்கு முன் வடிகால் கால்வாய்களை தயார் செய்யுங்கள்.",
    seed: "அங்கீகரிக்கப்பட்ட விற்பனையாளர்களிடமிருந்து சான்றளிக்கப்பட்ட விதைகளைப் பயன்படுத்துங்கள். விதைப்பதற்கு முன் விதைகளை திராம் அல்லது கார்பெண்டாசிம் கொண்டு சிகிச்சையளிக்கவும்.",
    soil: "pH மற்றும் ஊட்டச்சத்துக்களுக்கு ஒவ்வொரு 2-3 ஆண்டுகளுக்கும் மண்ணை பரிசோதிக்கவும். pH 6.0க்கு கீழே இருந்தால் சுண்ணாம்பு சேர்க்கவும்.",
    market: "தினசரி மண்டி விலைகளுக்கு AGMARKNET போர்ட்டலைப் பாருங்கள். விவசாயிகள் உற்பத்தியாளர் நிறுவனங்கள் மூலம் நேரடி விற்பனையைக் கருத்தில் கொள்ளுங்கள்.",
    scheme: "எளிதான கடன்களுக்கு கிசான் கிரெடிட் கார்டுக்கு விண்ணப்பிக்கவும். நேரடி வருமான ஆதரவுக்கு PM-KISAN திட்டத்தைப் பாருங்கள்.",
    hello: "வணக்கம்! நான் உங்கள் விவசாய உதவியாளர். பயிர் சாகுபடி, பாசனம், பூச்சி கட்டுப்பாடு, உரங்கள், வானிலை வழிகாட்டுதல், சந்தை விலைகள் அல்லது அரசு திட்டங்கள் பற்றி கேளுங்கள். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    thanks: "நன்றி! விவசாயம் பற்றி மேலும் கேள்விகள் கேட்க தயங்காதீர்கள். சிறந்த பயிர்களை வளர்க்க உங்களுக்கு உதவ நான் இங்கே இருக்கிறேன்.",
    default: "குறிப்பிட்ட பயிர்கள் (நெல், கோதுமை, பருத்தி, கரும்பு, தக்காளி, மக்காச்சோளம்), பாசனம், பூச்சி கட்டுப்பாடு, உரங்கள், மண் ஆரோக்கியம், வானிலை, சந்தை விலைகள் மற்றும் அரசு திட்டங்கள் பற்றிய விவசாய கேள்விகளுக்கு நான் உதவ முடியும். ஒரு குறிப்பிட்ட கேள்வியைக் கேளுங்கள்!"
  },
  "hi-IN": {
    rice_plant: "धान की रोपाई के लिए सबसे अच्छा समय मानसून (जून-जुलाई) है। रोपाई से 25-30 दिन पहले नर्सरी बेड तैयार करें। धान के खेतों में 2-3 इंच पानी बनाए रखें।",
    rice_harvest: "जब दाने सुनहरे पीले हो जाएं और नमी 20-25% हो तो धान कटाई के लिए तैयार है। फूल आने के 30-35 दिन बाद कटाई करें।",
    rice_general: "धान को 1200-1500 मिमी पानी चाहिए। बेहतर उपज के लिए SRI विधि का उपयोग करें। प्रति हेक्टेयर 120 किलो नाइट्रोजन, 60 किलो फॉस्फोरस, 40 किलो पोटाश डालें।",
    wheat_plant: "गेहूं की बुवाई का समय नवंबर-दिसंबर है। प्रति हेक्टेयर 100-125 किलो बीज का प्रयोग करें। बेहतर विकास के लिए 20-22.5 सेमी पंक्ति अंतर रखें।",
    wheat_harvest: "जब दाने कड़े और सुनहरे हों तो गेहूं तैयार है। 12-14% नमी पर कटाई करें।",
    wheat_general: "गेहूं को 4-6 सिंचाई चाहिए। पहली सिंचाई जड़ अवस्था में (21 दिन), दूसरी कल्ले निकलते समय।",
    irrigation: "सर्वोत्तम सिंचाई के लिए, वाष्पीकरण कम करने के लिए सुबह जल्दी या शाम को पानी दें। 30-40% पानी बचाने के लिए ड्रिप सिंचाई का उपयोग करें।",
    pest: "एकीकृत कीट प्रबंधन के लिए: निगरानी के लिए फेरोमोन ट्रैप, प्राकृतिक शिकारियों को छोड़ें, साप्ताहिक नीम तेल स्प्रे करें।",
    disease: "रोग नियंत्रण के लिए: संक्रमित पौधों को तुरंत हटाएं, तांबा आधारित फफूंदनाशक लगाएं, उचित जल निकासी सुनिश्चित करें।",
    fertilizer: "मिट्टी परीक्षण के आधार पर उर्वरक डालें। अधिकांश फसलों के लिए सामान्य NPK अनुपात 4:2:1 है। प्रति हेक्टेयर 2-3 टन जैविक खाद का उपयोग करें।",
    weather: "रोजाना मौसम पूर्वानुमान देखें। बारिश से पहले उर्वरक देना टालें। मानसून से पहले नालियां तैयार करें।",
    seed: "अधिकृत डीलरों से प्रमाणित बीज का उपयोग करें। बुवाई से पहले बीजों को थीरम या कार्बेंडाजिम से उपचारित करें।",
    soil: "pH और पोषक तत्वों के लिए हर 2-3 साल में मिट्टी की जांच करें। pH 6.0 से कम हो तो चूना डालें।",
    market: "दैनिक मंडी भाव के लिए AGMARKNET पोर्टल देखें। किसान उत्पादक संगठनों के माध्यम से सीधी बिक्री पर विचार करें।",
    scheme: "आसान ऋण के लिए किसान क्रेडिट कार्ड के लिए आवेदन करें। प्रत्यक्ष आय सहायता के लिए PM-KISAN योजना देखें।",
    hello: "नमस्ते! मैं आपका कृषि सहायक हूं। फसल खेती, सिंचाई, कीट नियंत्रण, उर्वरक, मौसम मार्गदर्शन, बाजार भाव या सरकारी योजनाओं के बारे में पूछें। आज मैं आपकी कैसे मदद कर सकता हूं?",
    thanks: "धन्यवाद! खेती के बारे में और सवाल पूछने में संकोच न करें। मैं आपकी बेहतर फसल उगाने में मदद के लिए यहां हूं।",
    default: "मैं विशिष्ट फसलों (धान, गेहूं, कपास, गन्ना, टमाटर, मक्का), सिंचाई, कीट नियंत्रण, उर्वरक, मिट्टी स्वास्थ्य, मौसम, बाजार भाव और सरकारी योजनाओं के बारे में मदद कर सकता हूं। कृपया एक विशिष्ट प्रश्न पूछें!"
  },
  "te-IN": {
    rice_plant: "వరి నాటడానికి ఉత్తమ సమయం వర్షాకాలం (జూన్-జూలై). నాటడానికి 25-30 రోజుల ముందు నర్సరీ మడులు సిద్ధం చేయండి. వరి పొలాల్లో 2-3 అంగుళాల నీరు నిలుపుకోండి.",
    rice_harvest: "గింజలు బంగారు పసుపు రంగులోకి మారినప్పుడు మరియు తేమ 20-25% ఉన్నప్పుడు వరి కోతకు సిద్ధంగా ఉంటుంది. పుష్పించిన 30-35 రోజుల తర్వాత కోయండి.",
    rice_general: "వరికి 1200-1500 మిమీ నీరు అవసరం. మెరుగైన దిగుబడి కోసం SRI పద్ధతిని ఉపయోగించండి. హెక్టారుకు 120 కిలోల నత్రజని, 60 కిలోల భాస్వరం, 40 కిలోల పొటాషియం వేయండి.",
    irrigation: "సరైన నీటిపారుదల కోసం, బాష్పీభవనాన్ని తగ్గించడానికి ఉదయం లేదా సాయంత్రం నీరు పెట్టండి. 30-40% నీటిని ఆదా చేయడానికి బిందు సేద్యాన్ని ఉపయోగించండి.",
    pest: "సమగ్ర చీడపీడల నిర్వహణ కోసం: పర్యవేక్షణకు ఫెరోమోన్ ట్రాప్‌లు, సహజ ఆహారాలను విడుదల చేయండి, వారానికో వేప నూనె స్ప్రే చేయండి.",
    disease: "వ్యాధి నియంత్రణ కోసం: సోకిన మొక్కలను వెంటనే తొలగించండి, రాగి ఆధారిత శిలీంద్ర నాశినులను వాడండి, సరైన నీటి పారుదల ఉండేలా చూడండి.",
    fertilizer: "మట్టి పరీక్ష ఆధారంగా ఎరువులు వేయండి. చాలా పంటలకు సాధారణ NPK నిష్పత్తి 4:2:1. హెక్టారుకు 2-3 టన్నుల సేంద్రీయ ఎరువు వాడండి.",
    hello: "హలో! నేను మీ వ్యవసాయ సహాయకుడిని. పంట సాగు, నీటిపారుదల, చీడపీడల నియంత్రణ, ఎరువులు, వాతావరణ మార్గదర్శకత్వం, మార్కెట్ ధరలు లేదా ప్రభుత్వ పథకాల గురించి అడగండి.",
    thanks: "ధన్యవాదాలు! వ్యవసాయం గురించి మరిన్ని ప్రశ్నలు అడగడానికి సంకోచించకండి. మెరుగైన పంటలు పండించడంలో మీకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను.",
    default: "నిర్దిష్ట పంటలు (వరి, గోధుమ, పత్తి, చెరకు, టమాటా, మొక్కజొన్న), నీటిపారుదల, చీడపీడల నియంత్రణ, ఎరువులు, నేల ఆరోగ్యం, వాతావరణం, మార్కెట్ ధరలు మరియు ప్రభుత్వ పథకాల గురించి వ్యవసాయ ప్రశ్నలకు నేను సహాయం చేయగలను!"
  }
};

// Get language key from code
const getLangKey = (langCode: string): string => {
  if (langCode.startsWith("ta")) return "ta-IN";
  if (langCode.startsWith("hi")) return "hi-IN";
  if (langCode.startsWith("te")) return "te-IN";
  return "en-US";
};

// Get farming response based on query and language
const getFarmingResponse = (query: string, lang: string): string => {
  const lowerQuery = query.toLowerCase();
  const langKey = getLangKey(lang);
  const langResponses = responses[langKey] || responses["en-US"];
  
  // Crop-specific responses with multilingual keywords
  const riceKeywords = ["rice", "paddy", "நெல்", "அரிசி", "धान", "चावल", "వరి", "బియ్యం"];
  const wheatKeywords = ["wheat", "கோதுமை", "गेहूं", "గోధుమ"];
  const sugarcaneKeywords = ["sugarcane", "கரும்பு", "गन्ना", "చెరకు"];
  const cottonKeywords = ["cotton", "பருத்தி", "कपास", "పత్తి"];
  const tomatoKeywords = ["tomato", "தக்காளி", "टमाटर", "టమాటా"];
  const maizeKeywords = ["maize", "corn", "மக்காச்சோளம்", "मक्का", "మొక్కజొన్న"];
  const plantKeywords = ["plant", "sow", "நடவு", "விதை", "बोना", "रोपाई", "నాటు", "విత్తు"];
  const harvestKeywords = ["harvest", "அறுவடை", "कटाई", "కోత"];
  const waterKeywords = ["water", "irrigation", "தண்ணீர்", "பாசனம்", "पानी", "सिंचाई", "నీరు", "నీటిపారుదల"];
  const pestKeywords = ["pest", "insect", "பூச்சி", "कीट", "చీడ", "పురుగు"];
  const diseaseKeywords = ["disease", "fungus", "நோய்", "रोग", "వ్యాధి"];
  const fertilizerKeywords = ["fertilizer", "nutrient", "manure", "உரம்", "उर्वरक", "खाद", "ఎరువు"];
  const weatherKeywords = ["weather", "rain", "வானிலை", "மழை", "मौसम", "बारिश", "వాతావరణం", "వర్షం"];
  const seedKeywords = ["seed", "விதை", "बीज", "విత్తనం"];
  const soilKeywords = ["soil", "land", "மண்", "मिट्टी", "मट्टी"];
  const marketKeywords = ["price", "market", "sell", "விலை", "சந்தை", "कीमत", "बाजार", "ధర", "మార్కెట్"];
  const schemeKeywords = ["loan", "subsidy", "scheme", "கடன்", "திட்டம்", "ऋण", "योजना", "రుణం", "పథకం"];
  const helloKeywords = ["hello", "hi", "hey", "வணக்கம்", "नमस्ते", "హలో"];
  const thanksKeywords = ["thank", "நன்றி", "धन्यवाद", "ధన్యవాదాలు"];

  const matchesAny = (keywords: string[]) => keywords.some(k => lowerQuery.includes(k));
  
  // Check crop-specific queries
  if (matchesAny(riceKeywords)) {
    if (matchesAny(plantKeywords)) return langResponses.rice_plant || responses["en-US"].rice_plant;
    if (matchesAny(harvestKeywords)) return langResponses.rice_harvest || responses["en-US"].rice_harvest;
    return langResponses.rice_general || responses["en-US"].rice_general;
  }
  
  if (matchesAny(wheatKeywords)) {
    if (matchesAny(plantKeywords)) return langResponses.wheat_plant || responses["en-US"].wheat_plant;
    if (matchesAny(harvestKeywords)) return langResponses.wheat_harvest || responses["en-US"].wheat_harvest;
    return langResponses.wheat_general || responses["en-US"].wheat_general;
  }
  
  if (matchesAny(sugarcaneKeywords)) {
    if (matchesAny(plantKeywords)) return langResponses.sugarcane_plant || responses["en-US"].sugarcane_plant;
    if (matchesAny(harvestKeywords)) return langResponses.sugarcane_harvest || responses["en-US"].sugarcane_harvest;
    return langResponses.sugarcane_general || responses["en-US"].sugarcane_general;
  }
  
  if (matchesAny(cottonKeywords)) {
    if (matchesAny(plantKeywords)) return langResponses.cotton_plant || responses["en-US"].cotton_plant;
    if (matchesAny(pestKeywords)) return langResponses.cotton_pest || responses["en-US"].cotton_pest;
    return langResponses.cotton_general || responses["en-US"].cotton_general;
  }
  
  if (matchesAny(tomatoKeywords)) {
    if (matchesAny(plantKeywords)) return langResponses.tomato_plant || responses["en-US"].tomato_plant;
    if (matchesAny(diseaseKeywords)) return langResponses.tomato_disease || responses["en-US"].tomato_disease;
    return langResponses.tomato_general || responses["en-US"].tomato_general;
  }
  
  if (matchesAny(maizeKeywords)) {
    if (matchesAny(plantKeywords)) return langResponses.maize_plant || responses["en-US"].maize_plant;
    if (matchesAny(harvestKeywords)) return langResponses.maize_harvest || responses["en-US"].maize_harvest;
    return langResponses.maize_general || responses["en-US"].maize_general;
  }
  
  // General topic responses
  if (matchesAny(waterKeywords)) return langResponses.irrigation || responses["en-US"].irrigation;
  if (matchesAny(pestKeywords)) return langResponses.pest || responses["en-US"].pest;
  if (matchesAny(diseaseKeywords)) return langResponses.disease || responses["en-US"].disease;
  if (matchesAny(fertilizerKeywords)) return langResponses.fertilizer || responses["en-US"].fertilizer;
  if (matchesAny(weatherKeywords)) return langResponses.weather || responses["en-US"].weather;
  if (matchesAny(seedKeywords)) return langResponses.seed || responses["en-US"].seed;
  if (matchesAny(soilKeywords)) return langResponses.soil || responses["en-US"].soil;
  if (matchesAny(marketKeywords)) return langResponses.market || responses["en-US"].market;
  if (matchesAny(schemeKeywords)) return langResponses.scheme || responses["en-US"].scheme;
  if (matchesAny(helloKeywords)) return langResponses.hello || responses["en-US"].hello;
  if (matchesAny(thanksKeywords)) return langResponses.thanks || responses["en-US"].thanks;
  
  return langResponses.default || responses["en-US"].default;
};

export const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    // Check for browser support
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
          
          // Generate response
          setTimeout(() => {
            const farmResponse = getFarmingResponse(transcriptResult, selectedLanguage);
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
  }, [selectedLanguage]);

  const toggleListening = () => {
    setError("");
    
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }
    
    if (!isListening) {
      setTranscript("");
      setResponse("");
      recognitionRef.current.lang = selectedLanguage;
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start recognition:", err);
        setError("Failed to start microphone. Please check permissions.");
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
      utterance.lang = selectedLanguage;
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="feature-card">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Mic className="w-6 h-6 text-primary" />
        Voice Assistant
      </h3>
      
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Select Your Language
        </label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
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
            ? "Processing..." 
            : isListening 
            ? "Listening... Speak now" 
            : "Tap to ask a question"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Ask about harvesting, irrigation, pests, fertilizers, or weather
        </p>
      </div>
      
      {transcript && (
        <div className="mt-4 p-4 bg-muted rounded-xl">
          <p className="text-sm text-muted-foreground mb-1">You said:</p>
          <p className="font-medium">{transcript}</p>
        </div>
      )}
      
      {response && (
        <div className="mt-4 p-4 bg-growth-light border-2 border-growth rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-growth">Assistant Response:</p>
            <Button variant="ghost" size="sm" onClick={speakResponse}>
              <Volume2 className="w-4 h-4 mr-1" /> Listen
            </Button>
          </div>
          <p className="text-foreground">{response}</p>
        </div>
      )}
    </div>
  );
};
