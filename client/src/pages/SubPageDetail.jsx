import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Network, ShieldCheck, ArrowRight, Landmark, Scale, Target, Handshake, ClipboardList, Database, AudioLines, Edit3 } from 'lucide-react';
import { isAdmin } from '../utils/adminHelpers';
import heroImg from '../assets/hero.jpeg';
import tamilannaiImg from '../assets/tamilannai.jpeg';
import partyFlagImg from '../assets/party-flag.png';
import partyBannerImg from '../assets/party banner.png';
import flagImg from '../assets/flag.jpeg';
import logoImg from '../assets/logo.png';
import kImg from '../assets/k.jpeg';
import k4Img from '../assets/k4.png';

const slugToKey = {
  'party-structure': 'party_structure',
  'party-policies': 'party_policies',
  'party-tiger-forces': 'party_tiger_forces',
  'about-party': 'about_party',
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
  'about-party': {
    hero: flagImg,
    gallery: [heroImg, partyFlagImg, kImg],
    badgeTa: 'அறிமுகம்',
    badgeEn: 'About',
  },
  'state-rights': {
    hero: partyBannerImg,
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

function isDivider(line) {
  return /^[-]{3,}$/.test(line.trim());
}

function slugifyHeading(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0B80-\u0BFF\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const primaryPolicies = [
  {
    key: 'arya_dravidian_abolition',
    icon: Scale,
    taTitle: 'ஆரிய-திராவிட ஒழிப்பு',
    enTitle: 'Abolition of Aryan-Dravidian Division',
    taDesc: 'ஆரிய-திராவிட பிரிவினை அரசியலை ஒழித்து, தமிழ் சமூகத்தின் வரலாற்று ஒற்றுமையை நிலைநிறுத்துதல்.',
    enDesc: 'Eliminate Aryan-Dravidian division politics and re-establish historical Tamil social unity.',
    taDetails: [
      'தமிழர் அடையாளத்தை பிரிக்கும் சிந்தனை மற்றும் அரசியல் நடைமுறைகளுக்கு எதிராக செயல்படுதல்.',
      'தமிழ்மொழி, நிலம், பண்பாடு ஆகியவற்றை ஒன்றிணைக்கும் அரசியல் அணுகுமுறையை முன்னெடுத்தல்.',
      'பிரிவினை அரசியலுக்கு பதிலாக தமிழர் ஒற்றுமையை அடிப்படையாக கொண்ட சமூக உரையாடலை உருவாக்குதல்.',
    ],
    enDetails: [
      'Actively oppose ideologies and political methods that divide Tamil identity.',
      'Promote a united political framework rooted in Tamil language, land, and culture.',
      'Replace divisive politics with sustained public dialogue centered on Tamil unity.',
    ],
  },
  {
    key: 'social_balance_liberation',
    icon: Landmark,
    taTitle: 'ஒடுக்கப்பட்ட தமிழ்குடிகளுக்கு சமூக சமநிலை மற்றும் தமிழ்த்தேசிய இன விடுதலை',
    enTitle: 'Social Equality for Oppressed Tamil Communities and Liberation of Tamil National Identity',
    taDesc: 'வரலாற்றில் ஒடுக்கப்பட்ட தமிழ்குடிகளுக்கு சமூக சமநிலை ஏற்படுத்தி, தமிழ்த்தேசிய இனத்தின் விடுதலையை நோக்கமாகக் கொண்ட கொள்கை.',
    enDesc: 'Establish social equality for historically oppressed Tamil communities while advancing the liberation of Tamil national identity.',
    taDetails: [
      'வரலாற்றில் ஒடுக்கப்பட்ட தமிழ்குடிகளின் சமூக உரிமைகள், மரியாதை மற்றும் சம வாழ்வாதாரத்தை உறுதி செய்தல்.',
      'சாதி அடிப்படையிலான ஒடுக்குமுறையை நீக்கும் சமூக-அரசியல் நடவடிக்கைகளை முன்னெடுத்தல்.',
      'தமிழ்த்தேசிய அடையாளத்தை சமூக நீதி மற்றும் விடுதலை நோக்குடன் இணைத்து அரசியல் செயல்திட்டமாக மாற்றுதல்.',
    ],
    enDetails: [
      'Secure rights, dignity, and equal social participation for historically oppressed Tamil communities.',
      'Advance social and political measures to dismantle caste-based oppression.',
      'Convert Tamil national liberation into a justice-led political program rooted in equality.',
    ],
  },
  {
    key: 'unity_life',
    icon: Target,
    taTitle: 'அனைத்து தமிழர்களும் தமிழ் குடிகளாக ஒன்றிணைந்த வாழ்வு',
    enTitle: 'A Unified Life Where All Tamils Stand Together as Tamil Communities',
    taDesc: 'அனைத்து தமிழர்களும் தங்களின் குடி அடையாள மரியாதையுடன் ஒன்றிணைந்து சமத்துவமான தமிழர் சமூக வாழ்வை உருவாக்குதல்.',
    enDesc: 'Build an equal Tamil social life where all Tamils unite with dignity in their community identities.',
    taDetails: [
      'தமிழ்குடிகளுக்கு இடையிலான பிளவுகளை குறைத்து, உறவுமுறை அடிப்படையிலான மக்கள் ஒற்றுமை அமைப்புகளை உருவாக்குதல்.',
      'பண்பாடு, மொழி, உரிமை, சமூக நீதி ஆகிய அடிப்படைகளில் ஒருங்கிணைந்த வாழ்வை வளர்த்தல்.',
      'தமிழர் சமூகத்தில் சம மரியாதை, சம வாய்ப்பு மற்றும் கூட்டு அரசியல் பங்கேற்பை உறுதி செய்தல்.',
    ],
    enDetails: [
      'Reduce divisions across Tamil communities and create relationship-based social unity.',
      'Promote integrated civic life through shared commitments to language, culture, rights, and justice.',
      'Ensure equal dignity, equal opportunity, and collective political participation for all Tamils.',
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
        title: 'Party Structure',
        description: 'Foundational organizational principles and party constitutional flow',
        content: 'Tamil Nadu Viduthalaip Puli Katchi structure, policy leadership, and operating rules',
        details: 'Leadership, discipline, role eligibility, political flow, and core commitments',
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
    } else if (pageKey === 'about_party') {
      initialData = {
        title: 'About Party',
        description: 'Introduction to the party vision, structure, and people-centered direction',
        content: 'Core identity, people-first political approach, and guiding principles',
        details: 'High-level overview of ideology, organization, and public commitment',
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
  const rawContent = t(`subpages.${pageKey}.content`, { lng: currentLang });
  const content = rawContent;
  const blocks = String(content)
    .split('\n\n')
    .map((s) => s.trim())
    .filter(Boolean);

  if (pageKey === 'party_policies' && false) {
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

  if (pageKey === 'party_tiger_forces' && false) {
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
            <div className="w-full h-96 bg-slate-100 rounded-t-3xl border-b border-slate-200 overflow-hidden">
              <img
                src={partyBannerImg}
                alt={currentLang === 'ta' ? 'கட்சியின் பேனர்' : 'Party banner'}
                className="w-full h-full object-cover object-center"
              />
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

  if (pageKey === 'about_party' && false) {
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
            <div className="w-full h-96 bg-slate-100 rounded-t-3xl border-b border-slate-200 overflow-hidden">
              <img
                src={partyBannerImg}
                alt={currentLang === 'ta' ? 'கட்சியின் பேனர்' : 'Party banner'}
                className="w-full h-full object-cover object-center"
              />
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
            <div className="w-full h-96 bg-slate-100 rounded-t-3xl border-b border-slate-200 overflow-hidden">
              <img
                src={partyBannerImg}
                alt={currentLang === 'ta' ? 'கட்சியின் பேனர்' : 'Party banner'}
                className="w-full h-full object-cover object-center"
              />
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

  if (pageKey === 'governance_policies' && false) {
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_8%_10%,_#e2e8f0_0,_transparent_18%),radial-gradient(circle_at_92%_92%,_#dbeafe_0,_transparent_22%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <section className="rounded-2xl border border-slate-300 bg-white shadow-[0_22px_60px_-40px_rgba(15,23,42,0.55)] overflow-hidden">
          <div className="px-5 md:px-8 py-5 md:py-6 bg-white border-b border-slate-200">
            <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 mb-4" />
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className={`mt-1 text-2xl md:text-4xl text-slate-900 font-black leading-tight ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                    {title}
                  </h1>
                </div>
                <Link to="/" className="inline-flex px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-sm font-semibold text-slate-700 transition-colors">
                  {currentLang === 'ta' ? 'முகப்பிற்கு திரும்ப' : 'Back to Home'}
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200">
            <div className="p-4 md:p-6 lg:p-7 space-y-4 md:space-y-5 bg-[linear-gradient(180deg,_#f8fbff_0%,_#fdfefe_100%)]">
              {blocks.map((block, idx) => {
                const lines = block
                  .split('\n')
                  .map((line) => line.trim())
                  .filter((line) => line && !isDivider(line));
                if (lines.length === 0) return null;
                const numbered = lines.every(isNumbered);
                const bulleted = lines.every((line) => isBullet(line) || isNumbered(line));
                const headingWithBody = lines.length > 1 && (lines[0].endsWith('?') || lines[0].endsWith(':'));
                const headingLike = !headingWithBody && lines.length <= 2 && (lines[0].endsWith(':') || lines[0].endsWith('?'));
                const emphaticLine = lines.length === 1 && lines[0].toLowerCase() === 'no exceptions.';

                if (headingLike) {
                  const headingText = lines.join(' ');
                  return (
                    <div key={`${idx}-${block.slice(0, 10)}`} id={slugifyHeading(lines[0])} className="rounded-xl border border-slate-200 border-l-4 border-l-sky-500 bg-white px-4 py-4 md:px-5 md:py-5 shadow-sm">
                      <h2 className={`text-xl md:text-2xl font-black text-slate-900 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        {headingText}
                      </h2>
                    </div>
                  );
                }

                if (emphaticLine) {
                  return (
                    <div key={`${idx}-${block.slice(0, 10)}`} className="rounded-xl border border-slate-200 border-l-4 border-l-rose-500 bg-white px-4 py-4 md:px-5 md:py-5 shadow-sm">
                      <p className={`text-slate-900 font-black ${currentLang === 'ta' ? 'font-tamil text-xl' : 'font-header text-lg'}`}>
                        {lines[0]}
                      </p>
                    </div>
                  );
                }

                if (headingWithBody) {
                  const bodyLines = lines.slice(1);
                  const bodyNumbered = bodyLines.length > 0 && bodyLines.every(isNumbered);
                  const bodyBulleted = bodyLines.length > 0 && bodyLines.every((line) => isBullet(line) || isNumbered(line));

                  // Check if there are any bullets in the content (mixed with text)
                  const hasBullets = bodyLines.some((line) => isBullet(line));
                  const hasNumbers = bodyLines.some((line) => isNumbered(line));

                  return (
                    <div key={`${idx}-${block.slice(0, 10)}`} className="rounded-xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-4 md:p-5 shadow-sm" id={slugifyHeading(lines[0])}>
                      <h3 className={`text-lg md:text-xl font-black text-slate-900 mb-3 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                        {lines[0]}
                      </h3>

                      {bodyNumbered && (
                        <ol className={`space-y-3 text-slate-700 leading-8 ${currentLang === 'ta' ? 'font-tamil text-lg' : 'font-header text-base'}`}>
                          {bodyLines.map((line, i) => (
                            <li key={`${idx}-qn-${i}`} className="flex items-start gap-3">
                              <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-black">
                                {i + 1}
                              </span>
                              <span>{line.replace(/^\d+\.\s*/, '').trim()}</span>
                            </li>
                          ))}
                        </ol>
                      )}

                      {bodyBulleted && !bodyNumbered && (
                        <ul className={`space-y-3 text-slate-700 leading-8 ${currentLang === 'ta' ? 'font-tamil text-lg' : 'font-header text-base'}`}>
                          {bodyLines.map((line, i) => (
                            <li key={`${idx}-qb-${i}`} className="flex items-start gap-3">
                              <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />
                              <span>{isNumbered(line) ? line.replace(/^\d+\.\s*/, '').trim() : cleanBullet(line)}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {!bodyNumbered && !bodyBulleted && (hasBullets || hasNumbers) && (
                        <div className={`space-y-3 text-slate-700 leading-8 ${currentLang === 'ta' ? 'font-tamil text-lg' : 'font-header text-base'}`}>
                          {bodyLines.map((line, i) => 
                            isBullet(line) ? (
                              <div key={`${idx}-mb-${i}`} className="flex items-start gap-3">
                                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />
                                <span>{cleanBullet(line)}</span>
                              </div>
                            ) : isNumbered(line) ? (
                              <div key={`${idx}-mn-${i}`} className="flex items-start gap-3">
                                <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-black">
                                  {i + 1}
                                </span>
                                <span>{line.replace(/^\d+\.\s*/, '').trim()}</span>
                              </div>
                            ) : (
                              <p key={`${idx}-mt-${i}`}>{line}</p>
                            )
                          )}
                        </div>
                      )}

                      {!bodyNumbered && !bodyBulleted && !hasBullets && !hasNumbers && (
                        <p className={`text-slate-700 leading-8 whitespace-pre-line ${currentLang === 'ta' ? 'font-tamil text-lg' : 'font-header text-base'}`}>
                          {bodyLines.join('\n')}
                        </p>
                      )}
                    </div>
                  );
                }

                if (numbered) {
                  return (
                    <div key={`${idx}-${block.slice(0, 10)}`} className="rounded-xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-4 md:p-5 shadow-sm">
                      <ol className={`space-y-3 text-slate-700 leading-8 ${currentLang === 'ta' ? 'font-tamil text-lg' : 'font-header text-base'}`}>
                        {lines.map((line, i) => (
                          <li key={`${idx}-n-${i}`} className="flex items-start gap-3">
                            <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-black">
                              {i + 1}
                            </span>
                            <span>{line.replace(/^\d+\.\s*/, '').trim()}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                }

                if (bulleted) {
                  return (
                    <div key={`${idx}-${block.slice(0, 10)}`} className="rounded-xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-4 md:p-5 shadow-sm">
                      <ul className={`space-y-3 text-slate-700 leading-8 ${currentLang === 'ta' ? 'font-tamil text-lg' : 'font-header text-base'}`}>
                        {lines.map((line, i) => (
                          <li key={`${idx}-b-${i}`} className="flex items-start gap-3">
                            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" />
                            <span>{isNumbered(line) ? line.replace(/^\d+\.\s*/, '').trim() : cleanBullet(line)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }

                return (
                  <div key={`${idx}-${block.slice(0, 10)}`} className="rounded-xl border border-slate-200 border-l-4 border-l-slate-400 p-4 md:p-5 bg-white shadow-sm">
                    <p className={`text-slate-700 leading-8 whitespace-pre-line ${currentLang === 'ta' ? 'font-tamil text-lg' : 'font-header text-base'}`}>
                      {lines.join('\n')}
                    </p>
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
