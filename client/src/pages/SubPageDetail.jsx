import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Building2, Network, UserSquare2, ShieldCheck, ArrowRight, Landmark, Scale, Leaf, Target, Handshake, ClipboardList, Database, AudioLines, Edit3 } from 'lucide-react';
import { isAdmin } from '../utils/adminHelpers';
import heroImg from '../assets/hero.jpeg';
import tamilannaiImg from '../assets/tamilannai.jpeg';
import partyFlagImg from '../assets/party-flag.png';
import leaderImg from '../assets/leader.png';
import flagImg from '../assets/flag.jpeg';
import logoImg from '../assets/logo.png';
import kImg from '../assets/k.jpeg';
import k4Img from '../assets/k4.png';

const slugToKey = {
  'party-structure': 'party_structure',
  'party-policies': 'party_policies',
  'party-tiger-forces': 'party_tiger_forces',
  'party-events': 'party_events',
  'state-rights': 'state_rights',
  'governance-policies': 'governance_policies',
};

const pageVisuals = {
  'party-structure': {
    hero: kImg,
    gallery: [partyFlagImg, heroImg, logoImg],
    badgeTa: 'அமைப்பு',
    badgeEn: 'Structure',
  },
  'party-policies': {
    hero: tamilannaiImg,
    gallery: [flagImg, partyFlagImg, k4Img],
    badgeTa: 'கொள்கை',
    badgeEn: 'Policy',
  },
  'party-tiger-forces': {
    hero: heroImg,
    gallery: [k4Img, tamilannaiImg, flagImg],
    badgeTa: 'களப்பணி',
    badgeEn: 'Field Wing',
  },
  'party-events': {
    hero: flagImg,
    gallery: [heroImg, partyFlagImg, kImg],
    badgeTa: 'நிகழ்வுகள்',
    badgeEn: 'Events',
  },
  'state-rights': {
    hero: leaderImg,
    gallery: [partyFlagImg, flagImg, heroImg],
    badgeTa: 'உரிமைகள்',
    badgeEn: 'Rights',
  },
  'governance-policies': {
    hero: k4Img,
    gallery: [logoImg, heroImg, partyFlagImg],
    badgeTa: 'ஆட்சி',
    badgeEn: 'Governance',
  },
};

function isNumbered(line) {
  return /^\d+\./.test(line.trim());
}

function isBullet(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('.');
}

function cleanBullet(line) {
  return line.replace(/^\s*[•.-]\s*/, '').trim();
}

function slugifyHeading(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0B80-\u0BFF\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const partyStructureLevels = [
  {
    key: 'state_leadership',
    icon: Building2,
    taTitle: 'மாநில தலைமை நிலை கட்டமைப்பாளர்கள்',
    enTitle: 'State Leadership Architects',
    taDesc: 'கட்சியின் மொத்த திசையை வடிவமைக்கும் தலைமை நிலை',
    enDesc: 'Top-level leadership that shapes the party direction',
  },
  {
    key: 'state_people',
    icon: Network,
    taTitle: 'மாநில நிலை மக்கள் கட்டமைப்பாளர்கள்',
    enTitle: 'State People Architects',
    taDesc: 'மக்கள் தேவையை கொள்கை மற்றும் செயல் திட்டமாக மாற்றும் நிலை',
    enDesc: 'Converts public needs into policy and action plans',
  },
  {
    key: 'district',
    icon: Users,
    taTitle: 'மாவட்ட நிலை மக்கள் தொகுப்பாளர்கள்',
    enTitle: 'District People Consolidators',
    taDesc: 'தொகுதி தகவல்களை ஒருங்கிணைத்து மாவட்டத் திட்டமாக மாற்றும் நிலை',
    enDesc: 'Consolidates constituency inputs at district level',
  },
  {
    key: 'constituency',
    icon: UserSquare2,
    taTitle: 'தொகுதிநிலை மக்கள் தொடர்பாளர்கள்',
    enTitle: 'Constituency Public Connectors',
    taDesc: 'மக்களுடன் நேரடி களத் தொடர்பு மற்றும் தரவு சேகரிப்பு',
    enDesc: 'Direct field engagement and public data collection',
  },
  {
    key: 'branch',
    icon: ShieldCheck,
    taTitle: 'கிளைநிலை மக்கள் தொடர்பாளர்கள்',
    enTitle: 'Branch Public Connectors',
    taDesc: 'ஊர்/பகுதி அடிப்படையில் அடித்தள இயக்கத்தை கட்டமைக்கும் களப்பணி',
    enDesc: 'Grassroots organizing at local branch level',
  },
];

const primaryPolicies = [
  {
    key: 'arya_dravidian_abolition',
    icon: Scale,
    taTitle: 'ஆரிய-திராவிட ஒழிப்பு',
    enTitle: 'Abolition of Aryan-Dravidian Division',
    taDesc: 'இன அடையாளங்களை முரண்பாட்டாக பயன்படுத்தும் அரசியல் முறைகளை எதிர்த்து, ஒரே தமிழ் மக்கள் அடையாளத்தை வலுப்படுத்துதல்.',
    enDesc: 'Reject divisive identity politics and strengthen a unified Tamil people identity.',
    taDetails: [
      'பிரிவினை சார்ந்த வரலாற்றுப் புரளிகளை ஆய்வு அடிப்படையில் மறுபரிசீலனை செய்து மக்களிடம் சரியான புரிதலை கொண்டு செல்வது.',
      'மொழி, நிலம், பண்பாடு ஆகியவற்றை இணைக்கும் ஒருங்கிணைந்த சமூக உரையாடல் மையங்களை உருவாக்குவது.',
      'பொதுவுடைமை உணர்வை வளர்க்க கல்வி மற்றும் இளைஞர் பயிற்சி முயற்சிகளை முன்னெடுத்து தலைமுறை ஒற்றுமையை கட்டியெழுப்புவது.',
    ],
    enDetails: [
      'Reframe divisive historical narratives through evidence-based public discourse.',
      'Build community dialogue platforms connecting language, land, and shared culture.',
      'Drive youth-focused civic education to create intergenerational unity.',
    ],
  },
  {
    key: 'social_balance',
    icon: Landmark,
    taTitle: 'வரலாற்றில் ஒடுக்கப்பட்ட தமிழ் குடிகளுக்கு சமூக சமநிலை',
    enTitle: 'Social Equity for Historically Oppressed Tamil Communities',
    taDesc: 'வரலாற்று அநீதி சந்தித்த குடிகளுக்கு சம வாய்ப்பு, உரிமை அணுகல் மற்றும் மரியாதைமிக்க வாழ்வாதாரத்தை உறுதி செய்தல்.',
    enDesc: 'Ensure dignity, access, and equitable opportunities for historically marginalized Tamil communities.',
    taDetails: [
      'கல்வி, திறன் மேம்பாடு மற்றும் வேலை வாய்ப்பில் முன்னுரிமை வாய்ந்த சமூக நீதி திட்டங்களை உருவாக்குவது.',
      'நிலம், வீடு, அடிப்படை சேவைகள் போன்ற உரிமை அணுகல்களில் தடைகளை நீக்க தனிப்பட்ட நிர்வாக கண்காணிப்பு அமைப்பு உருவாக்குவது.',
      'சமூக அவமதிப்பு மற்றும் ஒடுக்குமுறைக்கு எதிரான சட்ட உதவி மற்றும் விரைவு தீர்வு அமைப்புகளை ஏற்படுத்துவது.',
    ],
    enDetails: [
      'Create targeted justice programs for education, skill development, and employment access.',
      'Track and remove barriers to housing, land, and basic welfare entitlements.',
      'Establish legal support and rapid grievance systems against discrimination.',
    ],
  },
  {
    key: 'national_liberation',
    icon: Target,
    taTitle: 'தமிழ்த்தேசிய இனத்தின் விடுதலை',
    enTitle: 'Liberation of Tamil National Identity',
    taDesc: 'தமிழர் அரசியல் உரிமை, தன்னாட்சி குரல் மற்றும் கலாச்சார சுயமரியாதையை வலுப்படுத்தும் விடுதலைக் கொள்கை.',
    enDesc: 'Advance political rights, self-representation, and cultural dignity of Tamil national identity.',
    taDetails: [
      'தமிழர் வாழ்வுரிமை, மொழியுரிமை, நில உரிமை தொடர்பான கொள்கை ஆய்வுகளை ஒருங்கிணைத்து சட்டமன்ற நிலைக்கு கொண்டு செல்வது.',
      'இந்திய ஒன்றிய அமைப்பில் மாநில உரிமை மற்றும் பிராந்திய தன்னாட்சியை வலியுறுத்தும் அரசியல் திட்டங்களை முன்னெடுப்பது.',
      'தமிழர் பன்னாட்டு உறவுகள், அறிவியல், கலை, கல்வி தளங்களில் தன்னம்பிக்கை அடையாளத்தை வளர்க்க உலகத் தமிழ் இணைப்பை மேம்படுத்துவது.',
    ],
    enDetails: [
      'Translate Tamil rights research into legislative and policy action on language, land, and livelihood.',
      'Strengthen state rights and regional autonomy within federal frameworks.',
      'Build global Tamil collaboration in culture, education, innovation, and civic leadership.',
    ],
  },
  {
    key: 'unity_life',
    icon: Leaf,
    taTitle: 'அனைத்து தமிழர்களும் தமிழ் குடிகளாக ஒன்றிணைந்த வாழ்வு',
    enTitle: 'Unified Life as One Tamil Community',
    taDesc: 'பிரிவு மற்றும் பாகுபாட்டை மீறி அனைத்து தமிழர்களும் ஒரே குடி உணர்வில் இணைந்து சமூக வளர்ச்சியை உருவாக்குதல்.',
    enDesc: 'Build a shared Tamil civic life beyond internal divisions and social fragmentation.',
    taDetails: [
      'ஊர், மாவட்டம், தலைமுறை கடந்து தமிழர் ஒன்றிணைவு மையங்கள் மற்றும் குடும்ப-சமூக கூட்டமைப்புகளை உருவாக்குவது.',
      'கலாச்சார விழாக்கள், பொது நினைவு நாள்கள், மக்கள் உரையாடல் நிகழ்ச்சிகள் மூலம் ஒற்றுமை மனப்பாங்கை வலுப்படுத்துவது.',
      'அனைவரும் பங்கெடுக்கும் உள்ளூர் நிர்வாக மற்றும் மக்கள் பங்களிப்பு வடிவமைப்புகளை ஊக்குவித்து செயல்படுத்துவது.',
    ],
    enDetails: [
      'Create cross-region and cross-generation Tamil community platforms.',
      'Use public festivals, remembrance events, and civic dialogue to deepen social cohesion.',
      'Promote participatory local governance where every community has representation.',
    ],
  },
];

const tigerForceDuties = [
  {
    key: 'direct_contact',
    icon: Handshake,
    taTitle: 'மக்களுடன் நேரடி கள தொடர்பு',
    enTitle: 'Direct Field Contact With People',
    taDesc: 'குடும்பம், தெரு, ஊர், பகுதி அளவில் மக்களை நேரடியாக சந்தித்து பிரச்சினைகள், எதிர்பார்ப்புகள் மற்றும் அவசரத் தேவைகளை மெய்நிகரில்லாமல் பதிவு செய்வது.',
    enDesc: 'Engage people directly at street, village, and neighborhood level to capture real needs and concerns.',
    taPoints: [
      'வாராந்திர களச் சந்திப்புகள் மூலம் நிலையான மக்கள் தொடர்பு வலையமைப்பு.',
      'பெண்கள், இளைஞர்கள், தொழிலாளர்கள், விவசாயிகள் போன்ற பிரிவு அடிப்படையிலான கேட்பு முகாம்கள்.',
      'உடனடி உதவி தேவைப்படும் பிரச்சினைகளுக்கு விரைவு செயல் பரிமாற்றம்.',
    ],
    enPoints: [
      'Weekly field visits to sustain consistent local engagement.',
      'Focused listening circles for women, youth, workers, and farmers.',
      'Fast escalation mechanism for urgent citizen issues.',
    ],
  },
  {
    key: 'demand_registry',
    icon: ClipboardList,
    taTitle: 'சமூக, பொருளாதார, அரசியல் கோரிக்கைகள் பதிவு',
    enTitle: 'Register Social, Economic, and Political Demands',
    taDesc: 'மக்கள் கோரிக்கைகளை ஒரே மாதிரி தரவுத்தள வடிவில் வகைப்படுத்தி, பிராந்திய முன்னுரிமை அடிப்படையில் ஒழுங்குபடுத்தி மேல்நிலைக்கு அனுப்புவது.',
    enDesc: 'Document and classify social, economic, and political demands into a structured priority register.',
    taPoints: [
      'கோரிக்கைகள் வகைப்படுத்தல்: குடிநீர், வேலை, கல்வி, சுகாதாரம், உரிமை பிரச்சினைகள்.',
      'மாவட்ட/தொகுதி அடிப்படையிலான முன்னுரிமை மதிப்பீடு.',
      'மீண்டும் வரும் பிரச்சினைகளை கொள்கைச் சுட்டெண் ஆக மாற்றி தலைமையகத்திற்கு அனுப்புதல்.',
    ],
    enPoints: [
      'Categorize demands across welfare, livelihood, education, health, and rights.',
      'Apply constituency and district-level priority scoring.',
      'Convert recurring issues into policy signals for central leadership.',
    ],
  },
  {
    key: 'data_compilation',
    icon: Database,
    taTitle: 'தரவுகளை எழுத்து/ஒலி/தரவு வடிவில் தொகுத்தல்',
    enTitle: 'Compile Inputs as Text, Audio, and Data Records',
    taDesc: 'களத்தில் சேகரிக்கப்பட்ட தகவல்களை ஆவணம், ஒலி குறிப்புகள், தொகுக்கப்பட்ட தரவுத் தாள்கள் ஆகிய வடிவங்களில் பாதுகாப்பாக சேமித்து பகுப்பாய்வு செய்வது.',
    enDesc: 'Transform field inputs into documented text, audio notes, and structured datasets for policy analysis.',
    taPoints: [
      'எழுத்து அறிக்கைகள், ஒலி குறிப்புகள், பட்டியல் தரவுகள் என மூன்று-அடுக்கு ஆவணமுறை.',
      'மாதாந்திர தரவு சுருக்கம் மூலம் போக்கு (trend) மற்றும் தாக்கம் மதிப்பீடு.',
      'உண்மைத் தரவு அடிப்படையில் முடிவெடுக்கும் நிர்வாக செயல்முறை.',
    ],
    enPoints: [
      'Three-layer documentation: reports, audio logs, and structured sheets.',
      'Monthly trend analysis to evaluate impact and urgency.',
      'Evidence-led governance decisions based on verified field data.',
    ],
  },
];

const partyEventRules = [
  {
    key: 'joint_event_committee',
    icon: Users,
    taTitle: '5 தமிழ்க்குடி குழு + மாநில பொறுப்பாளர்கள் இணைந்த ஒழுங்கு',
    enTitle: 'Joint Control by 5 Tamil Community Group and State Coordinators',
    taRule: '5 தமிழ்க்குடிகளை கொண்டு உருவாக்கப்பட்ட குழு மற்றும் மாநில பொறுப்பாளர்கள் இணைந்து மட்டுமே தேர்தல் பிரச்சாரம், பொதுக்கூட்டம், ஆர்ப்பாட்ட ஏற்பாடுகளை செய்ய வேண்டும்.',
    enRule: 'Campaigns, public meetings, and demonstrations must be organized only through joint coordination between the 5-community committee and state functionaries.',
    taDetails: [
      'ஒற்றை பிரிவு முடிவல்ல, கூட்டு தீர்மான முறை மூலம் நிகழ்வுகளின் நோக்கம் மற்றும் செய்தி ஒருமைப்படுத்தப்பட வேண்டும்.',
      'தேர்தல் பிரச்சாரம், பொதுக்கூட்டம், ஆர்ப்பாட்டம் ஆகியவை பகுதி, மக்கள் அளவு, பாதுகாப்பு தேவைகள் அடிப்படையில் முன்திட்டமிடப்பட வேண்டும்.',
      'ஒவ்வொரு நிகழ்வுக்கும் பொறுப்பு பகிர்வு: மக்கள் இயக்கம், மேடை ஒழுங்கு, தகவல் பரிமாற்றம், பாதுகாப்பு மற்றும் அறிக்கை தயாரிப்பு.',
    ],
    enDetails: [
      'Event decisions must be collective, not unilateral, to keep messaging and intent consistent.',
      'Campaigns, rallies, and protests should be pre-planned based on location, turnout, and safety needs.',
      'Every event must assign role ownership for mobilization, stage management, communication, safety, and reporting.',
    ],
  },
  {
    key: 'leader_pre_approval',
    icon: ShieldCheck,
    taTitle: 'கட்சி தலைவரின் முன் அனுமதி கட்டாயம்',
    enTitle: 'Mandatory Prior Approval from Party Leader',
    taRule: 'கட்சி நிகழ்வுகளுக்கு கட்சி தலைவரிடம் முன் அனுமதி பெறப்பட வேண்டும்.',
    enRule: 'Prior approval from the party leader is mandatory for all party events.',
    taDetails: [
      'நிகழ்வின் தேதி, இடம், நோக்கம், பேச்சாளர்கள், எதிர்பார்க்கப்படும் மக்கள் தொகை போன்ற அடிப்படை விவரங்கள் முன்வைக்கப்பட வேண்டும்.',
      'முன் அனுமதி மூலம் கட்சியின் மையக் கொள்கை, அரசியல் செய்தி மற்றும் ஒழுங்கு நிலை ஒரே கோட்டில் இருக்கும்.',
      'அனுமதி கிடைத்த பின் மட்டுமே அதிகாரப்பூர்வ அறிவிப்பு, பிரச்சாரப் பொருட்கள் மற்றும் செயல்பாட்டு வெளியீடுகள் தொடங்கப்பட வேண்டும்.',
    ],
    enDetails: [
      'Approval requests must include date, venue, objective, speakers, and expected public participation.',
      'Pre-approval ensures policy alignment, message discipline, and organizational consistency.',
      'Public announcements and campaign execution should begin only after formal clearance.',
    ],
  },
];

const stateRightsPrinciples = [
  {
    key: 'rights_protection',
    icon: Landmark,
    taTitle: 'அரசியல், மொழி, கலாச்சார, சமூக உரிமைகள் பாதுகாப்பு',
    enTitle: 'Protection of Political, Linguistic, Cultural, and Social Rights',
    taStatement: 'தமிழகத்தின் அரசியல், மொழி, கலாச்சார மற்றும் சமூக உரிமைகள் பாதுகாக்கப்பட வேண்டும்.',
    enStatement: 'Tamil Nadu\'s political, linguistic, cultural, and social rights must be protected.',
    taDetails: [
      'மத்திய-மாநில அதிகார சமநிலையைக் காக்கும் சட்ட மற்றும் நிர்வாக நடவடிக்கைகள் வலுப்படுத்தப்பட வேண்டும்.',
      'தமிழ் மொழி நிர்வாகம், கல்வி, தொழில்நுட்ப தளங்களில் முன்னுரிமையாகப் பயன்பட கட்டமைப்பு உருவாக்கப்பட வேண்டும்.',
      'மக்கள் மரபு, பண்பாட்டு நினைவகம், வரலாற்று அடையாளம் ஆகியவற்றை பாதுகாக்கும் நிலையான கலாச்சார திட்டங்கள் அமல்படுத்தப்பட வேண்டும்.',
      'சமூக நீதியுடன் இணைந்த உரிமை அணுகல்: கல்வி, வேலை, நலத்திட்டங்கள் அனைத்தும் ஒடுக்கப்பட்டோர் வரை செல்லும் வகையில் கண்காணிப்பு அமைப்பு இயங்க வேண்டும்.',
    ],
    enDetails: [
      'Strengthen legal and administrative safeguards for federal balance and state powers.',
      'Ensure Tamil has priority space in governance, education, and technology ecosystems.',
      'Implement long-term cultural preservation programs for heritage, memory, and identity.',
      'Guarantee rights access in education, employment, and welfare through social justice tracking.',
    ],
  },
  {
    key: 'autonomy_progress',
    icon: Target,
    taTitle: 'மாநில சுயாட்சியும் தமிழர் சமூக முன்னேற்றமும்',
    enTitle: 'State Autonomy and Tamil Social Advancement',
    taStatement: 'மாநில சுயாட்சியும், தமிழர் சமூக முன்னேற்றமும் கட்சியின் அடிப்படை நோக்கமாகும்.',
    enStatement: 'State autonomy and Tamil social progress are foundational objectives of the party.',
    taDetails: [
      'மாநிலம் தன் வளங்கள், திட்டங்கள், வருவாய் முன்னுரிமைகளை தீர்மானிக்கும் உரிமை நடைமுறைப்படுத்தப்பட வேண்டும்.',
      'மாவட்டத்திலிருந்து மாநிலம் வரை மக்கள் பங்கேற்பு அடிப்படையிலான திட்டமிடல் மூலம் சமூக முன்னேற்றம் கணக்கிடப்பட வேண்டும்.',
      'இளைஞர், பெண்கள், தொழிலாளர், விவசாயி ஆகிய பிரிவுகளுக்கான முன்னேற்ற குறியீடுகள் உருவாக்கி வருடாந்திரமாக மதிப்பிட வேண்டும்.',
      'சுயாட்சி என்பது அரசியல் கோரிக்கையுடன் மட்டுப்படாமல், பொருளாதார தன்னிறைவு மற்றும் அறிவியல்-கல்வி முன்னேற்றத்துடன் இணைக்கப்பட வேண்டும்.',
    ],
    enDetails: [
      'Operationalize state authority over resources, planning, and fiscal priorities.',
      'Measure progress through participatory planning from district to state levels.',
      'Track annual advancement indicators for youth, women, workers, and farmers.',
      'Link autonomy with economic resilience and knowledge-driven development.',
    ],
  },
];

const governancePolicyFramework = [
  {
    key: 'responsibility_by_merit',
    icon: Target,
    taTitle: 'பொறுப்புகள் பதவியால் அல்ல, பணிச்செயல் மற்றும் கள அனுபவத்தால்',
    enTitle: 'Responsibility by Work and Field Experience, Not Position',
    taStatement: 'பொறுப்புகள் பதவியால் அல்ல, பணிச்செயல் மற்றும் கள அனுபவத்தால் வழங்கப்படும்.',
    enStatement: 'Responsibilities are assigned by performance and field experience, not by title.',
    taDetails: [
      'பொறுப்பு ஒதுக்கீட்டில் களப்பணி வரலாறு, மக்கள் நம்பிக்கை, செயல்திறன் ஆகியவை முன்னுரிமையாக மதிப்பிடப்படும்.',
      'பதவி நிலையான உரிமை அல்ல; மக்கள் பணியில் நிரூபித்த திறன் அடிப்படையில் மாற்றமும் உயர்வும் அமையும்.',
      'ஒவ்வொரு நிர்வாக நிலைக்கும் காலவரையறை மதிப்பீட்டு முறை கொண்டு accountability கட்டாயப்படுத்தப்படும்.',
    ],
    enDetails: [
      'Role allocation prioritizes field record, public trust, and execution quality.',
      'Positions are not permanent entitlements; progression depends on proven public work.',
      'Periodic performance reviews enforce accountability at every governance level.',
    ],
  },
  {
    key: 'discipline_language_public_duty',
    icon: ShieldCheck,
    taTitle: 'அரசியல் ஒழுக்கம், மொழி மரியாதை, பொதுமக்கள் பொறுப்பு கட்டாயம்',
    enTitle: 'Political Ethics, Language Respect, and Public Duty are Mandatory',
    taStatement: 'அரசியல் ஒழுக்கம், மொழி மரியாதை, பொதுமக்கள் பொறுப்பு ஆகியவை கட்டாயம்.',
    enStatement: 'Political discipline, language dignity, and public responsibility are non-negotiable.',
    taDetails: [
      'கட்சியின் பொதுக் குரல் மரியாதையான அரசியல் நடத்தை மற்றும் சமூக ஒற்றுமையைப் பாதுகாக்கும் வழியில் இருக்க வேண்டும்.',
      'தமிழ் மொழி மரியாதை நிர்வாகத் தொடர்புகள், பொதுக்கூட்ட பேச்சு, ஆவண எழுத்து ஆகிய எல்லா தளங்களிலும் பின்பற்றப்பட வேண்டும்.',
      'பொது சேவைப் பொறுப்பு: குறைதீர் பதில் நேரம், வெளிப்படையான தகவல் பகிர்வு, தரமான மக்கள் தொடர்பு நடைமுறைப்படுத்தப்படும்.',
    ],
    enDetails: [
      'Public communication must reflect ethical political conduct and social cohesion.',
      'Respect for Tamil language must be upheld across speeches, administration, and documentation.',
      'Public duty standards include response timelines, transparency, and quality grievance handling.',
    ],
  },
  {
    key: 'data_to_decision_flow',
    icon: Network,
    taTitle: 'மக்கள் தரவிலிருந்து மாநில முடிவிற்கு ஒருங்கிணைந்த ஓட்டம்',
    enTitle: 'Integrated Flow from Public Data to State Decision',
    taStatement: 'மக்களிடமிருந்து தரவு -> மாவட்ட ஒருங்கிணைப்பு -> மாநில முடிவு என்ற ஓட்டம் பின்பற்றப்படும்.',
    enStatement: 'Governance follows the flow: public data -> district consolidation -> state decision.',
    taDetails: [
      'களத்தில் பெறப்படும் தகவல்கள் ஒரே வடிவில் பதிவு செய்யப்பட்டு சரிபார்க்கப்பட்ட தரவாக மாற்றப்படும்.',
      'மாவட்ட ஒருங்கிணைப்பு கட்டத்தில் தேவைகள் முன்னுரிமைப்படுத்தப்பட்டு செயல் பரிந்துரைகள் உருவாக்கப்படும்.',
      'மாநில முடிவு நிலைத்தில் தரவு ஆதாரப்பட்ட கொள்கை முடிவுகள், காலக்கெடு மற்றும் கண்காணிப்பு அளவுகோல்களுடன் வெளியிடப்படும்.',
    ],
    enDetails: [
      'Field inputs are standardized and validated before policy processing.',
      'District coordination prioritizes needs and formulates action recommendations.',
      'State-level decisions are evidence-led, time-bound, and tracked with measurable indicators.',
    ],
  },
];

export default function SubPageDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const pageKey = slugToKey[slug || ''];
  const visual = pageVisuals[slug || ''] || pageVisuals['party-structure'];
  const [isAdminUser, setIsAdminUser] = useState(isAdmin());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLang, setEditLang] = useState('en');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    details: '',
    month: '',
    day: '',
  });

  // Listen for auth changes
  useEffect(() => {
    const checkAdmin = () => setIsAdminUser(isAdmin());
    checkAdmin();
    window.addEventListener('tvpk-auth-change', checkAdmin);
    window.addEventListener('storage', checkAdmin);
    return () => {
      window.removeEventListener('tvpk-auth-change', checkAdmin);
      window.removeEventListener('storage', checkAdmin);
    };
  }, []);

  const handleEdit = () => {
    setEditLang('en');
    
    // Load existing data based on page type
    let initialData = {
      title: title || '',
      description: '',
      content: '',
      details: '',
      month: '',
      day: '',
    };

    // Set data based on page type
    if (pageKey === 'party_structure') {
      initialData = {
        title: 'Organizational Spine',
        description: 'Party structure with hierarchical levels from state leadership to branch connectors',
        content: 'Contains 5 organizational levels for effective governance',
        details: 'State Leadership → State People → District → Constituency → Branch',
        month: '',
        day: '',
      };
    } else if (pageKey === 'party_policies') {
      initialData = {
        title: 'Policy Reading Deck',
        description: 'Four foundational party doctrines presented for easy reading and clear implementation',
        content: 'Aryan-Dravidian Abolition, Social Equity, National Liberation, Unity Life',
        details: 'Each policy includes action steps and strategic directions',
        month: '',
        day: '',
      };
    } else if (pageKey === 'party_tiger_forces') {
      initialData = {
        title: 'Party Field Tigers',
        description: 'Branch-level public coordinators serving as field tigers',
        content: 'Direct field contact, demand registry, data compilation',
        details: 'Engaging people at street, village, and neighborhood level',
        month: '',
        day: '',
      };
    } else if (pageKey === 'party_events') {
      initialData = {
        title: 'Party Event Governance',
        description: 'Campaigns, public meetings, and demonstrations governance',
        content: 'Joint control by 5 Tamil Community Group and State Coordinators',
        details: 'Mandatory prior approval from party leader required',
        month: '',
        day: '',
      };
    } else if (pageKey === 'state_rights') {
      initialData = {
        title: 'State Rights Charter',
        description: 'Tamil Nadu political, linguistic, cultural, and social rights protection',
        content: 'Rights Protection, State Autonomy and Tamil Social Advancement',
        details: 'Foundational doctrine aligning rights, autonomy, and progress',
        month: '',
        day: '',
      };
    } else if (pageKey === 'governance_policies') {
      initialData = {
        title: 'People-Centric Governance',
        description: 'Governance is not title-centric; it is a responsibility model led by people-powered evidence',
        content: 'Responsibility by Work, Political Ethics, Data to Decision Flow',
        details: 'Three core governance policies for effective leadership',
        month: '',
        day: '',
      };
    }

    setFormData(initialData);
    setShowEditModal(true);
  };

  const handleDelete = (itemKey) => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    alert('Item deleted successfully');
    setShowDeleteConfirm(false);
  };

  const handleSaveEdit = () => {
    alert(`Changes saved for ${pageKey}`);
    setShowEditModal(false);
  };

  const renderEditModal = () => {
    if (!showEditModal) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black">
              {editLang === 'ta' ? 'உள்ளடக்கம் திருத்து' : 'Edit Content'}
            </h3>
            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold">
              {editLang === 'ta' ? 'மூடு' : 'Close'}
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setEditLang('en')}
              className={`px-4 py-2 font-bold rounded-lg ${
                editLang === 'en'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              ENGLISH
            </button>
            <button
              onClick={() => setEditLang('ta')}
              className={`px-4 py-2 font-bold rounded-lg ${
                editLang === 'ta'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Page Name */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                {editLang === 'ta' ? 'பக்கம்' : 'Page'}
              </label>
              <input
                type="text"
                value={pageKey}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-slate-600"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                {editLang === 'ta' ? 'தலைப்பு' : 'Title'}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder={editLang === 'ta' ? 'தலைப்பு உள்ளிடவும்' : 'Enter title'}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                {editLang === 'ta' ? 'விளக்கம்' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg h-20 resize-none focus:outline-none focus:border-blue-500"
                placeholder={editLang === 'ta' ? 'விளக்கம் உள்ளிடவும்' : 'Enter description'}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                {editLang === 'ta' ? 'உள்ளடக்கம்' : 'Content'}
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg h-20 resize-none focus:outline-none focus:border-blue-500"
                placeholder={editLang === 'ta' ? 'உள்ளடக்கம் உள்ளிடவும்' : 'Enter content'}
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                {editLang === 'ta' ? 'விரிவான குறிப்பு' : 'Details'}
              </label>
              <textarea
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg h-20 resize-none focus:outline-none focus:border-blue-500"
                placeholder={editLang === 'ta' ? 'விரிவான குறிப்பு உள்ளிடவும்' : 'Enter details'}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveEdit}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold"
            >
              {editLang === 'ta' ? 'சேமி' : 'Save'}
            </button>
            <button
              onClick={() => {
                setFormData({
                  title: '',
                  description: '',
                  content: '',
                  details: '',
                  month: '',
                  day: '',
                });
              }}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 font-semibold"
            >
              {editLang === 'ta' ? 'அழி' : 'Clear'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!pageKey) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-slate-900">Page Not Found</h1>
        <p className="text-slate-600 mt-3">This section is not available.</p>
        <Link to="/" className="inline-flex mt-6 px-4 py-2 rounded border bg-white hover:bg-slate-50">
          Back to Home
        </Link>
      </div>
    );
  }

  const title = t(`subpages.${pageKey}.title`, { lng: currentLang });
  const content = t(`subpages.${pageKey}.content`, { lng: currentLang });
  const blocks = String(content)
    .split('\n\n')
    .map((s) => s.trim())
    .filter(Boolean);

  if (pageKey === 'party_structure') {
    return (
      <div className="min-h-screen bg-[#eaf0fb] py-8 md:py-12">
        {renderEditModal()}

        {/* Admin Status Display */}
        {isAdminUser && (
          <div className="fixed top-4 right-4 z-40 px-3 py-2 rounded-lg bg-green-100 text-green-800 text-xs font-semibold border border-green-300">
            ✓ {currentLang === 'ta' ? 'நிர்வாக பயனர்' : 'Admin User'}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <section className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white h-[300px] md:h-[420px] grid place-items-center">
            <p className={`text-slate-400 font-black tracking-wide ${currentLang === 'ta' ? 'font-tamil text-xl' : 'font-header text-lg'}`}>
              {currentLang === 'ta' ? 'படம் இல்லை' : 'No Image'}
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className={`text-2xl md:text-3xl font-black text-slate-900 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                {currentLang === 'ta' ? 'Organizational Spine' : 'Organizational Spine'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {isAdminUser && (
                  <>
                    <button onClick={handleEdit} className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-black hover:shadow-md transition-all" title={currentLang === 'ta' ? 'திருத்து' : 'Edit'}>
                      <Edit3 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-slate-300 via-slate-200 to-transparent -translate-x-1/2" />
              <div className="space-y-4 md:space-y-5">
                {partyStructureLevels.map((level, idx) => {
                  const Icon = level.icon;
                  const isLeft = idx % 2 === 0;
                  return (
                    <div key={level.key} className="relative md:grid md:grid-cols-2 md:gap-10 items-center">
                      <div className={`${isLeft ? 'md:pr-8' : 'md:col-start-2 md:pl-8'}`}>
                        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 md:p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                              <Icon size={19} className="text-primary" />
                            </div>
                            <div>
                              <div className="text-xs font-black tracking-wide text-primary/80">{currentLang === 'ta' ? `நிலை ${idx + 1}` : `LEVEL ${idx + 1}`}</div>
                              <h3 className={`mt-1 text-lg font-black text-slate-900 leading-snug ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                                {currentLang === 'ta' ? level.taTitle : level.enTitle}
                              </h3>
                              <p className={`mt-2 text-slate-600 leading-7 ${currentLang === 'ta' ? 'font-tamil text-[15px]' : 'font-header text-sm'}`}>
                                {currentLang === 'ta' ? level.taDesc : level.enDesc}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 rounded-full bg-primary border-4 border-white shadow" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (pageKey === 'party_policies') {
    return (
      <div className="min-h-screen bg-[#f2f5fb] py-8 md:py-12">
        {renderEditModal()}

        {/* Admin Status Display */}
        {isAdminUser && (
          <div className="fixed top-4 right-4 z-40 px-3 py-2 rounded-lg bg-green-100 text-green-800 text-xs font-semibold border border-green-300">
            ✓ {currentLang === 'ta' ? 'நிர்வாக பயனர்' : 'Admin User'}
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <section className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <div className="w-full h-96 bg-slate-100 border-b border-slate-200 rounded-t-3xl flex items-center justify-center">
              <p className="text-slate-400 text-lg font-semibold">{currentLang === 'ta' ? 'படம் சேர்க்கவும்' : 'Add Image Here'}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 md:px-10 py-6 border-b border-slate-200 bg-slate-50">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className={`text-2xl md:text-3xl font-black text-slate-900 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                  {currentLang === 'ta' ? 'கொள்கை விளக்க ஆவணம்' : 'Policy Reading Deck'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {isAdminUser && (
                    <>
                      <button onClick={handleEdit} className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-black hover:shadow-md transition-all" title={currentLang === 'ta' ? 'திருத்து' : 'Edit'}>
                        <Edit3 size={18} />
                      </button>
                    </>
                  )}
                  <Link to="/" className="inline-flex px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-sm font-semibold text-slate-700">
                    {currentLang === 'ta' ? 'முகப்பிற்கு திரும்ப' : 'Back to Home'}
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-5 bg-[#f8fafd]">
              {primaryPolicies.map((policy, idx) => {
                const Icon = policy.icon;
                const details = currentLang === 'ta' ? policy.taDetails : policy.enDetails;
                return (
                  <article key={policy.key} className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>

                      <div className="min-w-0 w-full">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 min-w-7 px-2 items-center justify-center rounded-md bg-primary text-white text-xs font-black">
                            {idx + 1}
                          </span>
                          <p className={`text-xs uppercase tracking-[0.14em] text-slate-500 font-black ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                            {currentLang === 'ta' ? 'முதன்மை கொள்கை' : 'Primary Doctrine'}
                          </p>
                        </div>

                        <h3 className={`mt-2 text-2xl md:text-3xl font-black text-slate-900 leading-tight ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                          {currentLang === 'ta' ? policy.taTitle : policy.enTitle}
                        </h3>

                        <p className={`mt-3 text-slate-700 leading-8 ${currentLang === 'ta' ? 'font-tamil text-xl' : 'font-header text-base'}`}>
                          {currentLang === 'ta' ? policy.taDesc : policy.enDesc}
                        </p>

                        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                          <p className={`text-xs uppercase tracking-[0.14em] text-slate-500 font-black mb-3 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                            {currentLang === 'ta' ? 'செயற்பாட்டு படிகள்' : 'Action Steps'}
                          </p>
                          <div className="space-y-2.5">
                            {details.map((point, dIdx) => (
                              <div key={`${policy.key}-detail-${dIdx}`} className="flex items-start gap-2.5">
                                <span className="mt-0.5 inline-flex h-6 min-w-6 px-1 items-center justify-center rounded-full bg-white border border-slate-300 text-xs font-black text-slate-700">
                                  {dIdx + 1}
                                </span>
                                <p className={`text-slate-700 leading-8 ${currentLang === 'ta' ? 'font-tamil text-lg' : 'font-header text-base'}`}>{point}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (pageKey === 'party_tiger_forces') {
    return (
      <div className="min-h-screen bg-[#f2f6fb] py-8 md:py-12">
        {renderEditModal()}

        {/* Admin Status Display */}
        {isAdminUser && (
          <div className="fixed top-4 right-4 z-40 px-3 py-2 rounded-lg bg-green-100 text-green-800 text-xs font-semibold border border-green-300">
            ✓ {currentLang === 'ta' ? 'நிர்வாக பயனர்' : 'Admin User'}
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <section className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="w-full h-96 bg-slate-100 rounded-t-3xl flex items-center justify-center border-b border-slate-200">
              <p className="text-slate-400 text-lg font-semibold">{currentLang === 'ta' ? 'படம் சேர்க்கவும்' : 'Add Image Here'}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className={`text-2xl font-black text-slate-900 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                {currentLang === 'ta' ? 'முக்கிய கடமைகள்' : 'Core Duties'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {isAdminUser && (
                  <>
                    <button onClick={handleEdit} className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-black hover:shadow-md transition-all" title={currentLang === 'ta' ? 'திருத்து' : 'Edit'}>
                      <Edit3 size={18} />
                    </button>
                  </>
                )}
                <Link to="/" className="inline-flex px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700">
                  {currentLang === 'ta' ? 'முகப்பிற்கு திரும்ப' : 'Back to Home'}
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {tigerForceDuties.map((duty, idx) => {
                const Icon = duty.icon;
                const points = currentLang === 'ta' ? duty.taPoints : duty.enPoints;
                return (
                  <article key={duty.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div className="min-w-0 w-full">
                        <div className="text-xs font-black text-primary/80 mb-1">{currentLang === 'ta' ? `கடமை ${idx + 1}` : `DUTY ${idx + 1}`}</div>
                        <h3 className={`text-lg md:text-xl font-black text-slate-900 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                          {currentLang === 'ta' ? duty.taTitle : duty.enTitle}
                        </h3>
                        <p className={`mt-2 text-slate-700 leading-7 ${currentLang === 'ta' ? 'font-tamil text-base' : 'font-header text-sm'}`}>
                          {currentLang === 'ta' ? duty.taDesc : duty.enDesc}
                        </p>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                          <p className={`text-xs uppercase tracking-wide text-slate-500 font-black mb-2 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                            {currentLang === 'ta' ? 'விரிவான செயல்பாடுகள்' : 'Operational Expansion'}
                          </p>
                          <ul className={`list-disc pl-5 space-y-2 text-slate-700 leading-7 ${currentLang === 'ta' ? 'font-tamil text-base' : 'font-header text-sm'}`}>
                            {points.map((point, pIdx) => (
                              <li key={`${duty.key}-point-${pIdx}`}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    );
  }

  if (pageKey === 'party_events') {
    return (
      <div className="min-h-screen bg-[#f3f6fb] py-8 md:py-12">
        {renderEditModal()}

        {/* Admin Status Display */}
        {isAdminUser && (
          <div className="fixed top-4 right-4 z-40 px-3 py-2 rounded-lg bg-green-100 text-green-800 text-xs font-semibold border border-green-300">
            ✓ {currentLang === 'ta' ? 'நிர்வாக பயனர்' : 'Admin User'}
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <section className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="w-full h-96 bg-slate-100 rounded-t-3xl flex items-center justify-center border-b border-slate-200">
              <p className="text-slate-400 text-lg font-semibold">{currentLang === 'ta' ? 'படம் சேர்க்கவும்' : 'Add Image Here'}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className={`text-2xl font-black text-slate-900 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                {currentLang === 'ta' ? 'கட்சி நிகழ்வுகளுக்கான முக்கிய ஒழுங்குகள்' : 'Primary Event Rules'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {isAdminUser && (
                  <>
                    <button onClick={handleEdit} className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-black hover:shadow-md transition-all" title={currentLang === 'ta' ? 'திருத்து' : 'Edit'}>
                      <Edit3 size={18} />
                    </button>
                  </>
                )}
                <Link to="/" className="inline-flex px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700">
                  {currentLang === 'ta' ? 'முகப்பிற்கு திரும்ப' : 'Back to Home'}
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {partyEventRules.map((rule, idx) => {
                const Icon = rule.icon;
                const details = currentLang === 'ta' ? rule.taDetails : rule.enDetails;
                return (
                  <article key={rule.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div className="min-w-0 w-full">
                        <div className="text-xs font-black text-primary/80 mb-1">{currentLang === 'ta' ? `ஒழுங்கு ${idx + 1}` : `RULE ${idx + 1}`}</div>
                        <h3 className={`text-lg md:text-xl font-black text-slate-900 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                          {currentLang === 'ta' ? rule.taTitle : rule.enTitle}
                        </h3>
                        <p className={`mt-2 text-slate-700 leading-7 ${currentLang === 'ta' ? 'font-tamil text-base' : 'font-header text-sm'}`}>
                          {currentLang === 'ta' ? rule.taRule : rule.enRule}
                        </p>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                          <p className={`text-xs uppercase tracking-wide text-slate-500 font-black mb-2 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                            {currentLang === 'ta' ? 'விரிவான செயல்முறை விளக்கம்' : 'Operational Elaboration'}
                          </p>
                          <ul className={`list-disc pl-5 space-y-2 text-slate-700 leading-7 ${currentLang === 'ta' ? 'font-tamil text-base' : 'font-header text-sm'}`}>
                            {details.map((point, dIdx) => (
                              <li key={`${rule.key}-detail-${dIdx}`}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (pageKey === 'state_rights') {
    return (
      <div className="min-h-screen bg-[#eef4fb] py-8 md:py-12">
        {renderEditModal()}

        {/* Admin Status Display */}
        {isAdminUser && (
          <div className="fixed top-4 right-4 z-40 px-3 py-2 rounded-lg bg-green-100 text-green-800 text-xs font-semibold border border-green-300">
            ✓ {currentLang === 'ta' ? 'நிர்வாக பயனர்' : 'Admin User'}
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <section className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="w-full h-96 bg-slate-100 rounded-t-3xl flex items-center justify-center border-b border-slate-200">
              <p className="text-slate-400 text-lg font-semibold">{currentLang === 'ta' ? 'படம் சேர்க்கவும்' : 'Add Image Here'}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className={`text-2xl font-black text-slate-900 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                {currentLang === 'ta' ? 'முதன்மை நிலைப்பாடுகள்' : 'Core Standpoints'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {isAdminUser && (
                  <>
                    <button onClick={handleEdit} className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-black hover:shadow-md transition-all" title={currentLang === 'ta' ? 'திருத்து' : 'Edit'}>
                      <Edit3 size={18} />
                    </button>
                  </>
                )}
                <Link to="/" className="inline-flex px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700">
                  {currentLang === 'ta' ? 'முகப்பிற்கு திரும்ப' : 'Back to Home'}
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {stateRightsPrinciples.map((item, idx) => {
                const Icon = item.icon;
                const details = currentLang === 'ta' ? item.taDetails : item.enDetails;
                return (
                  <article key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div className="min-w-0 w-full">
                        <div className="text-xs font-black text-primary/80 mb-1">{currentLang === 'ta' ? `நிலைப்பாடு ${idx + 1}` : `STANDPOINT ${idx + 1}`}</div>
                        <h3 className={`text-lg md:text-xl font-black text-slate-900 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                          {currentLang === 'ta' ? item.taTitle : item.enTitle}
                        </h3>
                        <p className={`mt-2 text-slate-700 leading-7 ${currentLang === 'ta' ? 'font-tamil text-base' : 'font-header text-sm'}`}>
                          {currentLang === 'ta' ? item.taStatement : item.enStatement}
                        </p>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                          <p className={`text-xs uppercase tracking-wide text-slate-500 font-black mb-2 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                            {currentLang === 'ta' ? 'விரிவான செயல்திட்ட வழிகள்' : 'Expanded Strategic Directions'}
                          </p>
                          <ul className={`list-disc pl-5 space-y-2 text-slate-700 leading-7 ${currentLang === 'ta' ? 'font-tamil text-base' : 'font-header text-sm'}`}>
                            {details.map((point, dIdx) => (
                              <li key={`${item.key}-detail-${dIdx}`}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (pageKey === 'governance_policies') {
    return (
      <div className="min-h-screen bg-[#eef5f4] py-8 md:py-12">
        {renderEditModal()}

        {/* Admin Status Display */}
        {isAdminUser && (
          <div className="fixed top-4 right-4 z-40 px-3 py-2 rounded-lg bg-green-100 text-green-800 text-xs font-semibold border border-green-300">
            ✓ {currentLang === 'ta' ? 'நிர்வாக பயனர்' : 'Admin User'}
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <section className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="w-full h-96 bg-slate-100 rounded-t-3xl flex items-center justify-center border-b border-slate-200">
              <p className="text-slate-400 text-lg font-semibold">{currentLang === 'ta' ? 'படம் சேர்க்கவும்' : 'Add Image Here'}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className={`text-2xl font-black text-slate-900 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                {currentLang === 'ta' ? 'ஆட்சி கொள்கைகளின் மூலக் கட்டமைப்பு' : 'Core Governance Framework'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {isAdminUser && (
                  <>
                    <button onClick={handleEdit} className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-black hover:shadow-md transition-all" title={currentLang === 'ta' ? 'திருத்து' : 'Edit'}>
                      <Edit3 size={18} />
                    </button>
                  </>
                )}
                <Link to="/" className="inline-flex px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700">
                  {currentLang === 'ta' ? 'முகப்பிற்கு திரும்ப' : 'Back to Home'}
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {governancePolicyFramework.map((item, idx) => {
                const Icon = item.icon;
                const details = currentLang === 'ta' ? item.taDetails : item.enDetails;
                return (
                  <article key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div className="min-w-0 w-full">
                        <div className="text-xs font-black text-primary/80 mb-1">{currentLang === 'ta' ? `கொள்கை ${idx + 1}` : `POLICY ${idx + 1}`}</div>
                        <h3 className={`text-lg md:text-xl font-black text-slate-900 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                          {currentLang === 'ta' ? item.taTitle : item.enTitle}
                        </h3>
                        <p className={`mt-2 text-slate-700 leading-7 ${currentLang === 'ta' ? 'font-tamil text-base' : 'font-header text-sm'}`}>
                          {currentLang === 'ta' ? item.taStatement : item.enStatement}
                        </p>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                          <p className={`text-xs uppercase tracking-wide text-slate-500 font-black mb-2 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                            {currentLang === 'ta' ? 'விரிவான செயல்முறை வழிகாட்டி' : 'Expanded Operational Guidance'}
                          </p>
                          <ul className={`list-disc pl-5 space-y-2 text-slate-700 leading-7 ${currentLang === 'ta' ? 'font-tamil text-base' : 'font-header text-sm'}`}>
                            {details.map((point, dIdx) => (
                              <li key={`${item.key}-detail-${dIdx}`}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    );
  }

  const headingBlocks = blocks
    .filter((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      return lines.length <= 2 && (lines[0].endsWith(':') || lines[0].endsWith('?'));
    })
    .map((block) => {
      const first = block.split('\n')[0].trim();
      return { title: first, id: slugifyHeading(first) };
    });

  return (
    <div className="min-h-screen bg-[#f4f6fb] py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <section className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="relative">
            <img src={visual.hero} alt={title} className="w-full h-56 md:h-72 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4">
              <span className="inline-flex px-3 py-1 rounded-full text-[11px] md:text-xs font-black bg-secondary text-[#5c0d0d]">
                {currentLang === 'ta' ? visual.badgeTa : visual.badgeEn}
              </span>
              <h1 className={`mt-3 text-white text-2xl md:text-4xl font-black leading-tight ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                {title}
              </h1>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          {visual.gallery.map((img, idx) => (
            <div key={`gallery-${idx}`} className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <img src={img} alt={`${title} ${idx + 1}`} className="w-full h-24 md:h-32 object-cover" />
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 md:px-8 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
            <div className="text-sm text-slate-600 font-semibold">
              {currentLang === 'ta' ? 'கொள்கை விவரங்கள்' : 'Policy Details'}
            </div>
            <Link to="/" className="inline-flex px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700">
              {currentLang === 'ta' ? 'முகப்பிற்கு திரும்ப' : 'Back to Home'}
            </Link>
          </div>

          {headingBlocks.length > 0 && (
            <div className="px-5 md:px-8 pt-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className={`text-xs uppercase tracking-wider mb-2 text-slate-500 font-black ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                  {currentLang === 'ta' ? 'உள்ளடக்க பட்டியல்' : 'Quick Sections'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {headingBlocks.map((item) => (
                    <a key={item.id} href={`#${item.id}`} className="px-3 py-1.5 rounded-full text-xs md:text-sm border border-slate-300 bg-white hover:bg-slate-100 text-slate-700">
                      {item.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="px-5 md:px-8 py-6 space-y-4 md:space-y-5">
            {blocks.map((block, idx) => {
              const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
              const numbered = lines.every(isNumbered);
              const bulleted = lines.every((line) => isBullet(line) || isNumbered(line));
              const headingLike = lines.length <= 2 && (lines[0].endsWith(':') || lines[0].endsWith('?'));

              if (headingLike) {
                const headingText = lines.join(' ');
                return (
                  <div key={`${idx}-${block.slice(0, 10)}`} id={slugifyHeading(lines[0])} className="pt-2 md:pt-3">
                    <h2 className={`text-xl md:text-2xl font-black text-slate-900 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                      {headingText}
                    </h2>
                    <div className="h-1 w-16 bg-primary/40 rounded mt-2"></div>
                  </div>
                );
              }

              if (numbered) {
                return (
                  <div key={`${idx}-${block.slice(0, 10)}`} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:p-5">
                    <ol className={`list-decimal pl-5 space-y-2 text-slate-700 leading-8 ${currentLang === 'ta' ? 'font-tamil text-lg' : 'font-header text-base'}`}>
                      {lines.map((line, i) => (
                        <li key={`${idx}-n-${i}`}>{line.replace(/^\d+\.\s*/, '').trim()}</li>
                      ))}
                    </ol>
                  </div>
                );
              }

              if (bulleted) {
                return (
                  <div key={`${idx}-${block.slice(0, 10)}`} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:p-5">
                    <ul className={`list-disc pl-5 space-y-2 text-slate-700 leading-8 ${currentLang === 'ta' ? 'font-tamil text-lg' : 'font-header text-base'}`}>
                      {lines.map((line, i) => (
                        <li key={`${idx}-b-${i}`}>{isNumbered(line) ? line.replace(/^\d+\.\s*/, '').trim() : cleanBullet(line)}</li>
                      ))}
                    </ul>
                  </div>
                );
              }

              return (
                <div key={`${idx}-${block.slice(0, 10)}`} className="rounded-2xl border border-slate-200 p-4 md:p-5 bg-white">
                  <p className={`text-slate-700 leading-8 whitespace-pre-line ${currentLang === 'ta' ? 'font-tamil text-lg' : 'font-header text-base'}`}>
                    {lines.join('\n')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
