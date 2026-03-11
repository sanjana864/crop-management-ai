import { useState } from "react";
import { Leaf, Droplets, Calendar, AlertTriangle, CheckCircle, Sparkles, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage, Language } from "@/contexts/LanguageContext";

interface CropFertilizer {
  name: Record<Language, string>;
  icon: string;
  npkRatio: string;
  frequency: Record<Language, string>;
  bestTime: Record<Language, string>;
  quantity: Record<Language, string>;
  tips: Record<Language, string[]>;
  warnings: Record<Language, string[]>;
}

const guideLabels: Record<Language, {
  title: string;
  subtitle: string;
  npkRatio: string;
  quantity: string;
  frequency: string;
  bestTime: string;
  tips: string;
  warnings: string;
  selectCrop: string;
  askAI: string;
  aiPlaceholder: string;
  getAdvice: string;
  aiRecommendation: string;
  poweredBy: string;
}> = {
  en: {
    title: "Fertilizer Guide",
    subtitle: "Select your crop to get detailed fertilizer recommendations",
    npkRatio: "NPK Ratio",
    quantity: "Quantity",
    frequency: "Frequency",
    bestTime: "Best Time",
    tips: "Tips for Best Results",
    warnings: "Warnings",
    selectCrop: "Complete fertilizer guide",
    askAI: "Ask AI for personalized advice",
    aiPlaceholder: "Ask any question about fertilizers...",
    getAdvice: "Get AI Advice",
    aiRecommendation: "AI Recommendation",
    poweredBy: "Powered by Gemini AI"
  },
  ta: {
    title: "உர வழிகாட்டி",
    subtitle: "விரிவான உர பரிந்துரைகளைப் பெற உங்கள் பயிரைத் தேர்ந்தெடுக்கவும்",
    npkRatio: "NPK விகிதம்",
    quantity: "அளவு",
    frequency: "எத்தனை முறை",
    bestTime: "சிறந்த நேரம்",
    tips: "சிறந்த முடிவுகளுக்கான குறிப்புகள்",
    warnings: "எச்சரிக்கைகள்",
    selectCrop: "முழுமையான உர வழிகாட்டி",
    askAI: "தனிப்பயனாக்கப்பட்ட ஆலோசனைக்கு AI-ஐ கேளுங்கள்",
    aiPlaceholder: "உரங்கள் பற்றி ஏதேனும் கேள்வி கேளுங்கள்...",
    getAdvice: "AI ஆலோசனை பெறுங்கள்",
    aiRecommendation: "AI பரிந்துரை",
    poweredBy: "Gemini AI மூலம் இயக்கப்படுகிறது"
  },
  hi: {
    title: "उर्वरक गाइड",
    subtitle: "विस्तृत उर्वरक अनुशंसाएं प्राप्त करने के लिए अपनी फसल चुनें",
    npkRatio: "NPK अनुपात",
    quantity: "मात्रा",
    frequency: "कितनी बार",
    bestTime: "सबसे अच्छा समय",
    tips: "सर्वोत्तम परिणामों के लिए सुझाव",
    warnings: "चेतावनियां",
    selectCrop: "संपूर्ण उर्वरक गाइड",
    askAI: "व्यक्तिगत सलाह के लिए AI से पूछें",
    aiPlaceholder: "उर्वरकों के बारे में कोई भी सवाल पूछें...",
    getAdvice: "AI सलाह प्राप्त करें",
    aiRecommendation: "AI अनुशंसा",
    poweredBy: "Gemini AI द्वारा संचालित"
  },
  te: {
    title: "ఎరువుల గైడ్",
    subtitle: "వివరమైన ఎరువుల సిఫార్సులు పొందడానికి మీ పంటను ఎంచుకోండి",
    npkRatio: "NPK నిష్పత్తి",
    quantity: "పరిమాణం",
    frequency: "ఎన్ని సార్లు",
    bestTime: "ఉత్తమ సమయం",
    tips: "మంచి ఫలితాల కోసం చిట్కాలు",
    warnings: "హెచ్చరికలు",
    selectCrop: "పూర్తి ఎరువుల గైడ్",
    askAI: "వ్యక్తిగత సలహా కోసం AI ని అడగండి",
    aiPlaceholder: "ఎరువుల గురించి ఏదైనా ప్రశ్న అడగండి...",
    getAdvice: "AI సలహా పొందండి",
    aiRecommendation: "AI సిఫార్సు",
    poweredBy: "Gemini AI ద్వారా నడుస్తుంది"
  }
};

const crops: CropFertilizer[] = [
  {
    name: { en: "Rice (Paddy)", ta: "நெல்", hi: "धान", te: "వరి" },
    icon: "🌾",
    npkRatio: "120:60:40 kg/ha",
    frequency: { en: "3 applications", ta: "3 முறை இடவும்", hi: "3 बार डालें", te: "3 సార్లు వేయాలి" },
    bestTime: { en: "Apply 1/2 nitrogen at transplanting, 1/4 at tillering, 1/4 at panicle initiation", ta: "நடவு செய்யும்போது 1/2 நைட்ரஜன், பிள்ளை பருவத்தில் 1/4, கதிர் தோன்றும்போது 1/4 இடவும்", hi: "रोपाई पर 1/2 नाइट्रोजन, कल्ले निकलने पर 1/4, बाली निकलने पर 1/4 डालें", te: "నాట్లు వేసేటప్పుడు 1/2 నత్రజని, పిల్ల మొలకల దశలో 1/4, కంకి వచ్చేటప్పుడు 1/4 వేయాలి" },
    quantity: { en: "50 kg Urea + 30 kg DAP per acre", ta: "ஒரு ஏக்கருக்கு 50 கிலோ யூரியா + 30 கிலோ DAP", hi: "प्रति एकड़ 50 किलो यूरिया + 30 किलो DAP", te: "ఎకరానికి 50 కిలోల యూరియా + 30 కిలోల DAP" },
    tips: { en: ["Apply fertilizer in standing water", "Best applied in morning or evening", "Use zinc sulfate if leaves turn yellow"], ta: ["நிற்கும் நீரில் உரமிடவும்", "காலை அல்லது மாலை இடுவது சிறந்தது", "இலைகள் மஞ்சளானால் ஜிங்க் சல்பேட் பயன்படுத்தவும்"], hi: ["खड़े पानी में उर्वरक डालें", "सुबह या शाम में डालना सबसे अच्छा है", "पत्ते पीले होने पर जिंक सल्फेट का उपयोग करें"], te: ["నిలబడిన నీటిలో ఎరువు వేయండి", "ఉదయం లేదా సాయంత్రం వేయడం మంచిది", "ఆకులు పసుపు రంగుకు మారితే జింక్ సల్ఫేట్ వాడండి"] },
    warnings: { en: ["Avoid fertilizer during heavy rain", "Don't apply all nitrogen at once"], ta: ["கனமழையின்போது உரமிடுவதை தவிர்க்கவும்", "எல்லா நைட்ரஜனையும் ஒரே நேரத்தில் இடாதீர்கள்"], hi: ["भारी बारिश में उर्वरक डालने से बचें", "सारी नाइट्रोजन एक बार में न डालें"], te: ["భారీ వర్షంలో ఎరువు వేయకండి", "మొత్తం నత్రజనిని ఒకేసారి వేయకండి"] }
  },
  {
    name: { en: "Wheat", ta: "கோதுமை", hi: "गेहूं", te: "గోధుమ" },
    icon: "🌿",
    npkRatio: "120:60:40 kg/ha",
    frequency: { en: "2-3 applications", ta: "2-3 முறை இடவும்", hi: "2-3 बार डालें", te: "2-3 సార్లు వేయాలి" },
    bestTime: { en: "Apply full P&K at sowing, split nitrogen", ta: "விதைக்கும்போது முழு P&K இடவும், நைட்ரஜனை பிரித்து இடவும்", hi: "बुवाई पर पूर्ण P&K डालें, नाइट्रोजन को विभाजित करें", te: "విత్తనం వేసేటప్పుడు పూర్తి P&K వేయండి, నత్రజనిని విభజించండి" },
    quantity: { en: "50 kg Urea + 25 kg DAP per acre", ta: "ஒரு ஏக்கருக்கு 50 கிலோ யூரியா + 25 கிலோ DAP", hi: "प्रति एकड़ 50 किलो यूरिया + 25 किलो DAP", te: "ఎకరానికి 50 కిలోల యూరియా + 25 కిలోల DAP" },
    tips: { en: ["First irrigation after fertilizer is must", "Apply urea when soil is moist", "Top dressing at crown root stage"], ta: ["உரமிட்ட பின் முதல் பாசனம் அவசியம்", "மண் ஈரமாக இருக்கும்போது யூரியா இடவும்", "கிரீடம் வேர் பருவத்தில் மேல் உரமிடவும்"], hi: ["उर्वरक के बाद पहली सिंचाई जरूरी है", "मिट्टी नम होने पर यूरिया डालें", "क्राउन रूट स्टेज पर टॉप ड्रेसिंग करें"], te: ["ఎరువు వేసిన తర్వాత మొదటి నీరు తప్పనిసరి", "మట్టి తేమగా ఉన్నప్పుడు యూరియా వేయండి", "క్రౌన్ రూట్ దశలో టాప్ డ్రెస్సింగ్ చేయండి"] },
    warnings: { en: ["Heavy nitrogen causes lodging", "Avoid fertilizer on wet foliage"], ta: ["அதிக நைட்ரஜன் சாய்வை ஏற்படுத்தும்", "ஈரமான இலைகளில் உரமிடுவதை தவிர்க்கவும்"], hi: ["अधिक नाइट्रोजन से फसल गिर सकती है", "गीली पत्तियों पर उर्वरक डालने से बचें"], te: ["ఎక్కువ నత్రజని పంట పడిపోవడానికి కారణమవుతుంది", "తడిసిన ఆకులపై ఎరువు వేయకండి"] }
  },
  {
    name: { en: "Cotton", ta: "பருத்தி", hi: "कपास", te: "పత్తి" },
    icon: "🌱",
    npkRatio: "120:60:60 kg/ha",
    frequency: { en: "4-5 applications", ta: "4-5 முறை இடவும்", hi: "4-5 बार डालें", te: "4-5 సార్లు వేయాలి" },
    bestTime: { en: "Split nitrogen through season", ta: "பருவம் முழுவதும் நைட்ரஜனை பிரித்து இடவும்", hi: "पूरे मौसम में नाइट्रोजन विभाजित करें", te: "సీజన్ అంతటా నత్రజనిని విభజించండి" },
    quantity: { en: "60 kg Urea + 30 kg MOP per acre", ta: "ஒரு ஏக்கருக்கு 60 கிலோ யூரியா + 30 கிலோ MOP", hi: "प्रति एकड़ 60 किलो यूरिया + 30 किलो MOP", te: "ఎకరానికి 60 కిలోల యూరియా + 30 కిలోల MOP" },
    tips: { en: ["Apply potash for better fiber quality", "Foliar spray of 2% urea during flowering", "Use micronutrients for higher yield"], ta: ["நல்ல நார் தரத்திற்கு பொட்டாஷ் இடவும்", "பூக்கும் போது 2% யூரியா இலை தெளிப்பு", "அதிக விளைச்சலுக்கு நுண்ணூட்டச்சத்துக்களை பயன்படுத்தவும்"], hi: ["बेहतर फाइबर गुणवत्ता के लिए पोटाश डालें", "फूल आने पर 2% यूरिया का पत्तियों पर छिड़काव करें", "अधिक उपज के लिए सूक्ष्म पोषक तत्वों का उपयोग करें"], te: ["మంచి ఫైబర్ నాణ్యత కోసం పొటాష్ వేయండి", "పువ్వులు వచ్చినప్పుడు 2% యూరియా ఆకులపై పిచికారీ చేయండి", "ఎక్కువ దిగుబడి కోసం సూక్ష్మపోషకాలను వాడండి"] },
    warnings: { en: ["Excess nitrogen delays maturity", "Stop nitrogen 30 days before picking"], ta: ["அதிக நைட்ரஜன் முதிர்ச்சியை தாமதப்படுத்தும்", "பறிப்புக்கு 30 நாட்களுக்கு முன் நைட்ரஜன் நிறுத்தவும்"], hi: ["अधिक नाइट्रोजन परिपक्वता में देरी करता है", "तुड़ाई से 30 दिन पहले नाइट्रोजन बंद करें"], te: ["ఎక్కువ నత్రజని పరిపక్వతను ఆలస్యం చేస్తుంది", "కోతకు 30 రోజుల ముందు నత్రజని ఆపండి"] }
  },
  {
    name: { en: "Tomato", ta: "தக்காளி", hi: "टमाटर", te: "టమాటో" },
    icon: "🍅",
    npkRatio: "100:50:50 kg/ha",
    frequency: { en: "5-6 applications", ta: "5-6 முறை இடவும்", hi: "5-6 बार डालें", te: "5-6 సార్లు వేయాలి" },
    bestTime: { en: "Apply through drip or fertigation", ta: "சொட்டு நீர் அல்லது ஃபெர்டிகேஷன் மூலம் இடவும்", hi: "ड्रिप या फर्टिगेशन के माध्यम से डालें", te: "డ్రిప్ లేదా ఫెర్టిగేషన్ ద్వారా వేయండి" },
    quantity: { en: "40 kg Urea + 20 kg MOP per acre", ta: "ஒரு ஏக்கருக்கு 40 கிலோ யூரியா + 20 கிலோ MOP", hi: "प्रति एकड़ 40 किलो यूरिया + 20 किलो MOP", te: "ఎకరానికి 40 కిలోల యూరియా + 20 కిలోల MOP" },
    tips: { en: ["High potash for better fruit quality", "Calcium spray prevents blossom end rot", "Weekly fertigation gives best results"], ta: ["நல்ல பழ தரத்திற்கு அதிக பொட்டாஷ்", "கால்சியம் தெளிப்பு பூ முனை அழுகலை தடுக்கும்", "வாராந்திர ஃபெர்டிகேஷன் சிறந்த முடிவுகளை தரும்"], hi: ["बेहतर फल गुणवत्ता के लिए अधिक पोटाश", "कैल्शियम स्प्रे फूल के अंत की सड़न रोकता है", "साप्ताहिक फर्टिगेशन सबसे अच्छे परिणाम देता है"], te: ["మంచి పండ్ల నాణ్యత కోసం ఎక్కువ పొటాష్", "కాల్షియం స్ప్రే పువ్వు చివర కుళ్ళుని నివారిస్తుంది", "వారపు ఫెర్టిగేషన్ మంచి ఫలితాలిస్తుంది"] },
    warnings: { en: ["Avoid high nitrogen after fruiting", "Monitor for calcium deficiency"], ta: ["பழம் பிடித்த பின் அதிக நைட்ரஜன் தவிர்க்கவும்", "கால்சியம் குறைபாட்டை கண்காணிக்கவும்"], hi: ["फल आने के बाद अधिक नाइट्रोजन से बचें", "कैल्शियम की कमी पर नजर रखें"], te: ["పండ్లు వచ్చిన తర్వాత ఎక్కువ నత్రజని వేయకండి", "కాల్షియం లోపాన్ని పర్యవేక్షించండి"] }
  },
  {
    name: { en: "Sugarcane", ta: "கரும்பு", hi: "गन्ना", te: "చెరకు" },
    icon: "🎋",
    npkRatio: "250:100:120 kg/ha",
    frequency: { en: "3-4 applications", ta: "3-4 முறை இடவும்", hi: "3-4 बार डालें", te: "3-4 సార్లు వేయాలి" },
    bestTime: { en: "Apply in splits: planting, 45 days, 90 days, 120 days", ta: "நடவு, 45 நாட்கள், 90 நாட்கள், 120 நாட்கள் என பிரித்து இடவும்", hi: "बुवाई, 45 दिन, 90 दिन, 120 दिन पर विभाजित करें", te: "నాటడం, 45 రోజులు, 90 రోజులు, 120 రోజులకు విభజించి వేయండి" },
    quantity: { en: "100 kg Urea + 50 kg DAP + 60 kg MOP per acre", ta: "ஒரு ஏக்கருக்கு 100 கிலோ யூரியா + 50 கிலோ DAP + 60 கிலோ MOP", hi: "प्रति एकड़ 100 किलो यूरिया + 50 किलो DAP + 60 किलो MOP", te: "ఎకరానికి 100 కిలోల యూరియా + 50 కిలోల DAP + 60 కిలోల MOP" },
    tips: { en: ["Earthing up essential after fertilizer", "Apply with irrigation", "Use press mud as organic supplement"], ta: ["உரமிட்ட பின் மண் அணைத்தல் அவசியம்", "பாசனத்துடன் இடவும்", "கரிம நிரப்பியாக பிரஸ் மட் பயன்படுத்தவும்"], hi: ["उर्वरक के बाद मिट्टी चढ़ाना जरूरी", "सिंचाई के साथ डालें", "प्रेस मड को जैविक पूरक के रूप में उपयोग करें"], te: ["ఎరువు తర్వాత మట్టి ఎగదోయడం తప్పనిసరి", "నీటిపారుదలతో వేయండి", "సేంద్రియ పూరకంగా ప్రెస్ మడ్ వాడండి"] },
    warnings: { en: ["Excess nitrogen reduces sugar content", "Don't apply fertilizer after 5 months"], ta: ["அதிக நைட்ரஜன் சர்க்கரை அளவை குறைக்கும்", "5 மாதங்களுக்கு பிறகு உரமிடாதீர்கள்"], hi: ["अधिक नाइट्रोजन चीनी की मात्रा कम करता है", "5 महीने बाद उर्वरक न डालें"], te: ["ఎక్కువ నత్రజని చక్కెర శాతాన్ని తగ్గిస్తుంది", "5 నెలల తర్వాత ఎరువు వేయకండి"] }
  },
  {
    name: { en: "Potato", ta: "உருளைக்கிழங்கு", hi: "आलू", te: "బంగాళాదుంప" },
    icon: "🥔",
    npkRatio: "180:80:100 kg/ha",
    frequency: { en: "2-3 applications", ta: "2-3 முறை இடவும்", hi: "2-3 बार डालें", te: "2-3 సార్లు వేయాలి" },
    bestTime: { en: "Apply 2/3 at planting, 1/3 at earthing up (30-35 days)", ta: "நடவின்போது 2/3, மண் அணைக்கும்போது 1/3 (30-35 நாட்கள்)", hi: "बुवाई पर 2/3, मिट्टी चढ़ाते समय 1/3 (30-35 दिन)", te: "నాటేటప్పుడు 2/3, మట్టి ఎగదోసేటప్పుడు 1/3 (30-35 రోజులు)" },
    quantity: { en: "75 kg Urea + 50 kg DAP + 50 kg MOP per acre", ta: "ஒரு ஏக்கருக்கு 75 கிலோ யூரியா + 50 கிலோ DAP + 50 கிலோ MOP", hi: "प्रति एकड़ 75 किलो यूरिया + 50 किलो DAP + 50 किलो MOP", te: "ఎకరానికి 75 కిలోల యూరియా + 50 కిలోల DAP + 50 కిలోల MOP" },
    tips: { en: ["High potash improves tuber quality", "Apply sulfur for better taste", "Use FYM 10 tons/acre before planting"], ta: ["அதிக பொட்டாஷ் கிழங்கு தரத்தை மேம்படுத்தும்", "நல்ல சுவைக்கு சல்பர் இடவும்", "நடவுக்கு முன் ஏக்கருக்கு 10 டன் தொழு உரம் பயன்படுத்தவும்"], hi: ["अधिक पोटाश कंद की गुणवत्ता सुधारता है", "बेहतर स्वाद के लिए सल्फर डालें", "बुवाई से पहले 10 टन/एकड़ FYM डालें"], te: ["ఎక్కువ పొటాష్ దుంప నాణ్యతను మెరుగుపరుస్తుంది", "మంచి రుచి కోసం సల్ఫర్ వేయండి", "నాటడానికి ముందు ఎకరానికి 10 టన్నుల పశువుల ఎరువు వాడండి"] },
    warnings: { en: ["Excess nitrogen causes hollow heart", "Avoid fresh manure - causes scab"], ta: ["அதிக நைட்ரஜன் வெற்று இதயத்தை ஏற்படுத்தும்", "புதிய உரம் தவிர்க்கவும் - சொறி ஏற்படும்"], hi: ["अधिक नाइट्रोजन हॉलो हार्ट का कारण बनता है", "ताजा खाद से बचें - पपड़ी लगती है"], te: ["ఎక్కువ నత్రజని హాలో హార్ట్‌కు కారణమవుతుంది", "తాజా ఎరువు వేయకండి - స్కాబ్ వస్తుంది"] }
  },
  {
    name: { en: "Maize", ta: "மக்காச்சோளம்", hi: "मक्का", te: "మొక్కజొన్న" },
    icon: "🌽",
    npkRatio: "120:60:40 kg/ha",
    frequency: { en: "3 applications", ta: "3 முறை இடவும்", hi: "3 बार डालें", te: "3 సార్లు వేయాలి" },
    bestTime: { en: "Apply 1/3 N at sowing, 1/3 at knee-high, 1/3 at tasseling", ta: "விதைக்கும்போது 1/3 N, முழங்கால் உயரத்தில் 1/3, பட்டு வரும்போது 1/3", hi: "बुवाई पर 1/3 N, घुटने की ऊंचाई पर 1/3, मुंडी निकलने पर 1/3", te: "విత్తనం వేసేటప్పుడు 1/3 N, మోకాలి ఎత్తులో 1/3, టాసెలింగ్‌లో 1/3" },
    quantity: { en: "50 kg Urea + 30 kg DAP per acre", ta: "ஒரு ஏக்கருக்கு 50 கிலோ யூரியா + 30 கிலோ DAP", hi: "प्रति एकड़ 50 किलो यूरिया + 30 किलो DAP", te: "ఎకరానికి 50 కిలోల యూరియా + 30 కిలోల DAP" },
    tips: { en: ["Apply zinc sulfate in zinc-deficient soils", "Earthing up with fertilizer improves results", "Use intercropping with legumes for nitrogen fixation"], ta: ["ஜிங்க் குறைபாடுள்ள மண்ணில் ஜிங்க் சல்பேட் இடவும்", "உரத்துடன் மண் அணைத்தல் முடிவுகளை மேம்படுத்தும்", "நைட்ரஜன் நிலைப்படுத்தலுக்கு பருப்பு வகைகளுடன் ஊடுபயிர் செய்யுங்கள்"], hi: ["जिंक की कमी वाली मिट्टी में जिंक सल्फेट डालें", "उर्वरक के साथ मिट्टी चढ़ाना परिणाम सुधारता है", "नाइट्रोजन स्थिरीकरण के लिए दलहन के साथ अंतरफसल करें"], te: ["జింక్ లోపం ఉన్న నేలల్లో జింక్ సల్ఫేట్ వేయండి", "ఎరువుతో మట్టి ఎగదోయడం ఫలితాలను మెరుగుపరుస్తుంది", "నత్రజని స్థిరీకరణ కోసం పప్పుధాన్యాలతో అంతర పంట వేయండి"] },
    warnings: { en: ["Nitrogen deficiency shows V-shaped yellowing", "Don't delay tasseling-stage fertilizer"], ta: ["நைட்ரஜன் குறைபாடு V-வடிவ மஞ்சளை காட்டும்", "பட்டு நிலை உரத்தை தாமதப்படுத்தாதீர்கள்"], hi: ["नाइट्रोजन की कमी V-आकार का पीलापन दिखाती है", "मुंडी निकलने पर उर्वरक में देरी न करें"], te: ["నత్రజని లోపం V-ఆకార పసుపు రంగును చూపిస్తుంది", "టాసెలింగ్ దశ ఎరువును ఆలస్యం చేయకండి"] }
  },
  {
    name: { en: "Groundnut", ta: "நிலக்கடலை", hi: "मूंगफली", te: "వేరుశెనగ" },
    icon: "🥜",
    npkRatio: "20:40:40 kg/ha",
    frequency: { en: "2 applications", ta: "2 முறை இடவும்", hi: "2 बार डालें", te: "2 సార్లు వేయాలి" },
    bestTime: { en: "Apply all at sowing, gypsum at flowering (45 days)", ta: "விதைக்கும்போது அனைத்தும் இடவும், பூக்கும்போது ஜிப்சம் (45 நாட்கள்)", hi: "बुवाई पर सब डालें, फूल आने पर जिप्सम (45 दिन)", te: "విత్తనం వేసేటప్పుడు అన్నీ వేయండి, పువ్వులు వచ్చినప్పుడు జిప్సం (45 రోజులు)" },
    quantity: { en: "10 kg Urea + 25 kg SSP + 200 kg Gypsum per acre", ta: "ஒரு ஏக்கருக்கு 10 கிலோ யூரியா + 25 கிலோ SSP + 200 கிலோ ஜிப்சம்", hi: "प्रति एकड़ 10 किलो यूरिया + 25 किलो SSP + 200 किलो जिप्सम", te: "ఎకరానికి 10 కిలోల యూరియా + 25 కిలోల SSP + 200 కిలోల జిప్సం" },
    tips: { en: ["Gypsum is essential for pod filling", "Use Rhizobium culture for nitrogen fixation", "Apply sulfur for better oil content"], ta: ["காய் நிரம்புவதற்கு ஜிப்சம் அவசியம்", "நைட்ரஜன் நிலைப்படுத்தலுக்கு ரைசோபியம் கலாச்சாரம் பயன்படுத்தவும்", "நல்ல எண்ணெய் உள்ளடக்கத்திற்கு சல்பர் இடவும்"], hi: ["फली भरने के लिए जिप्सम जरूरी है", "नाइट्रोजन स्थिरीकरण के लिए राइजोबियम कल्चर का उपयोग करें", "बेहतर तेल सामग्री के लिए सल्फर डालें"], te: ["కాయ నిండటానికి జిప్సం తప్పనిసరి", "నత్రజని స్థిరీకరణ కోసం రైజోబియం కల్చర్ వాడండి", "మంచి నూనె శాతం కోసం సల్ఫర్ వేయండి"] },
    warnings: { en: ["Excess nitrogen reduces pod yield", "Don't skip gypsum application"], ta: ["அதிக நைட்ரஜன் காய் விளைச்சலை குறைக்கும்", "ஜிப்சம் இடுவதை தவிர்க்காதீர்கள்"], hi: ["अधिक नाइट्रोजन फली उपज को कम करता है", "जिप्सम डालना न छोड़ें"], te: ["ఎక్కువ నత్రజని కాయల దిగుబడిని తగ్గిస్తుంది", "జిప్సం వేయడం వదిలేయకండి"] }
  }
];

export const FertilizerGuide = () => {
  const [selectedCrop, setSelectedCrop] = useState<CropFertilizer | null>(null);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  const gl = guideLabels[language];

  const getAIAdvice = async () => {
    if (!selectedCrop && !question.trim()) {
      toast.error("Please select a crop or ask a question");
      return;
    }

    setIsLoading(true);
    setAiResponse('');

    try {
      const { data, error } = await supabase.functions.invoke('fertilizer-ai', {
        body: {
          crop: selectedCrop?.name.en || 'General',
          language,
          question: question.trim() || undefined,
        }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error("Too many requests. Please wait a moment.");
        } else if (error.message?.includes('402')) {
          toast.error("AI service limit reached.");
        } else {
          throw error;
        }
        return;
      }

      setAiResponse(data.recommendation);
      
      await supabase.from('fertilizer_queries').insert({
        crop_name: selectedCrop?.name.en || 'General',
        soil_type: null,
        question: question.trim() || `Default advice for ${selectedCrop?.name.en}`,
        ai_response: data.recommendation,
        language
      });
    } catch (error) {
      console.error('Error getting AI advice:', error);
      toast.error("Failed to get AI recommendation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
          <Leaf className="w-7 h-7 text-primary" />
          {gl.title}
        </h3>
        <p className="text-muted-foreground">{gl.subtitle}</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {crops.map((crop) => (
          <button
            key={crop.name.en}
            onClick={() => setSelectedCrop(crop)}
            className={`p-4 rounded-xl text-center transition-all duration-300 ${
              selectedCrop?.name.en === crop.name.en
                ? 'bg-primary text-primary-foreground shadow-glow scale-105'
                : 'bg-card border border-border hover:border-primary hover:shadow-card'
            }`}
          >
            <span className="text-3xl block mb-2">{crop.icon}</span>
            <span className="font-medium text-sm">{crop.name[language]}</span>
          </button>
        ))}
      </div>

      <div className="feature-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h4 className="text-xl font-bold">{gl.askAI}</h4>
          <span className="text-xs text-muted-foreground ml-auto">{gl.poweredBy}</span>
        </div>
        
        <div className="space-y-4">
          <Textarea
            placeholder={gl.aiPlaceholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          
          <Button 
            onClick={getAIAdvice} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                {gl.getAdvice}
              </>
            )}
          </Button>

          {aiResponse && (
            <div className="p-4 bg-card rounded-xl border border-primary/30 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-bold text-primary">{gl.aiRecommendation}</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
            </div>
          )}
        </div>
      </div>
      
      {selectedCrop && (
        <div className="feature-card animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-5xl">{selectedCrop.icon}</span>
            <div>
              <h4 className="text-2xl font-bold">{selectedCrop.name[language]}</h4>
              <p className="text-muted-foreground">{gl.selectCrop}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-growth-light rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-growth" />
                <span className="font-bold">{gl.npkRatio}</span>
              </div>
              <p className="text-lg font-semibold">{selectedCrop.npkRatio}</p>
            </div>
            <div className="p-4 bg-sky-light rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-sky" />
                <span className="font-bold">{gl.quantity}</span>
              </div>
              <p className="text-lg font-semibold">{selectedCrop.quantity[language]}</p>
            </div>
            <div className="p-4 bg-earth-light rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-earth" />
                <span className="font-bold">{gl.frequency}</span>
              </div>
              <p className="text-lg font-semibold">{selectedCrop.frequency[language]}</p>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-bold">{gl.bestTime}</span>
              </div>
              <p className="font-medium">{selectedCrop.bestTime[language]}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-growth/10 rounded-xl border border-growth/30">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-growth" />
                <span className="font-bold text-growth">{gl.tips}</span>
              </div>
              <ul className="space-y-2">
                {selectedCrop.tips[language].map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-growth mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-secondary" />
                <span className="font-bold text-secondary">{gl.warnings}</span>
              </div>
              <ul className="space-y-2">
                {selectedCrop.warnings[language].map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
