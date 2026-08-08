import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Users, Scale, Target, ShieldCheck, Landmark, ClipboardList, 
  ArrowRight, Sparkles, BookOpen, Layers
} from 'lucide-react';

export default function EventsSection() {
  const { i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const [activeTab, setActiveTab] = useState('all');

  const topics = [
    {
      id: 'party-structure',
      category: 'party',
      categoryTa: 'கட்சி',
      categoryEn: 'Party',
      icon: Users,
      badgeTa: 'அமைப்பு',
      badgeEn: 'Structure',
      titleTa: 'கட்சி வடிவமைப்பு',
      titleEn: 'Party Structure',
      descTa: 'கட்சியின் 5-அடுக்கு நிர்வாக கட்டமைப்பு, கிளை பொது இணைப்பாளர்கள் முதல் மாநில மக்கள் சிற்பிகள் வரையிலான பணிப்பாய்வு மற்றும் அரசியல் ஒழுங்கு விதிகள்.',
      descEn: 'The 5-tier organizational framework, field-to-state workflow from branch connectors to people\'s architects, and leadership discipline rules.',
      highlightsTa: ['5-அடுக்கு நிர்வாக பணிப்பாய்வு', 'கள அனுபவம் சார்ந்த பொறுப்பு'],
      highlightsEn: ['5-Tier Organizational Hierarchy', 'Merit & Field-Based Roles'],
      to: '/sub/party-structure',
    },
    {
      id: 'party-policies',
      category: 'party',
      categoryTa: 'கட்சி',
      categoryEn: 'Party',
      icon: Scale,
      badgeTa: 'கொள்கை',
      badgeEn: 'Policy',
      titleTa: 'கட்சி கொள்கைகள்',
      titleEn: 'Party Policies',
      descTa: 'ஆரிய-திராவிட பிரிவினை ஒழிப்பு, ஒடுக்கப்பட்ட தமிழ்குடிகளுக்கு சமூக சமநிலை, தமிழ்த்தேசிய இன விடுதலை மற்றும் அனைத்து தமிழர்களும் ஒன்றிணைந்த வாழ்வு.',
      descEn: 'Abolition of Aryan-Dravidian divide, social equality for historically oppressed communities, liberation of Tamil identity, and unified living.',
      highlightsTa: ['ஆரிய-திராவிட பிரிவினை ஒழிப்பு', 'தமிழ்த்தேசிய இன விடுதலை'],
      highlightsEn: ['Elimination of Divisive Politics', 'Tamil Social Equity & Liberation'],
      to: '/sub/party-policies',
    },
    {
      id: 'party-tiger-forces',
      category: 'party',
      categoryTa: 'கட்சி',
      categoryEn: 'Party',
      icon: Target,
      badgeTa: 'களப்படை',
      badgeEn: 'Field Force',
      titleTa: 'கட்சியின் புலிப்படைகள்',
      titleEn: 'Party Tiger Forces',
      descTa: 'மக்களுடன் நேரடி கள தொடர்பு, சமூக-பொருளாதார கோரிக்கைகள் பதிவு செய்தல் மற்றும் எழுத்து/ஒலி வடிவில் தரவுகளைத் தொகுக்கும் களப்புலிகளின் செயல்பாடுகள்.',
      descEn: 'Direct field contact with citizens, structured registry of social and economic demands, and compiling grassroots evidence.',
      highlightsTa: ['நேரடி மக்கள் கள தொடர்பு', 'கோரிக்கைகள் & தரவுகள் பதிவு'],
      highlightsEn: ['Direct Grassroots Contact', 'Structured Demand Registry'],
      to: '/sub/party-tiger-forces',
    },
    {
      id: 'about-party',
      category: 'party',
      categoryTa: 'கட்சி',
      categoryEn: 'Party',
      icon: ShieldCheck,
      badgeTa: 'அறிமுகம்',
      badgeEn: 'About',
      titleTa: 'கட்சியை பற்றி',
      titleEn: 'About Party',
      descTa: 'தமிழ்நாடு விடுதலைப்புலிகள் கட்சியின் வரலாறு, கொள்கைத் தலைமை, தாய் தமிழ் வழிநடத்தல் மற்றும் தமிழ் தேச மறுமலர்ச்சி தொலைநோக்கு.',
      descEn: 'Introduction to the vision, leadership lineage under Mother Tamil, foundational ethics, and long-term Tamil national restoration.',
      highlightsTa: ['தாய் தமிழ் வழிநடத்தல்', 'dynastic அரசியல் தடுத்தல்'],
      highlightsEn: ['Mother Tamil Leadership Lineage', 'Anti-Dynastic Governance'],
      to: '/sub/about-party',
    },
    {
      id: 'state-rights',
      category: 'governance',
      categoryTa: 'ஆட்சி',
      categoryEn: 'Governance',
      icon: Landmark,
      badgeTa: 'உரிமைகள்',
      badgeEn: 'Rights',
      titleTa: 'மாநில உரிமைகள்',
      titleEn: 'State Rights',
      descTa: 'தமிழகத்தின் அரசியல், மொழி, கலாச்சார மற்றும் சமூக உரிமைகள் பாதுகாப்பு, மாநில சுயாட்சி மற்றும் தமிழர் சமூக முன்னேற்றம்.',
      descEn: 'Protection of Tamil Nadu\'s political, linguistic, cultural, and social rights, state autonomy, and holistic community advancement.',
      highlightsTa: ['மாநில சுயாட்சி மீட்பு', 'மொழி மற்றும் பண்பாட்டு பாதுகாப்பு'],
      highlightsEn: ['Protection of State Autonomy', 'Linguistic & Cultural Rights'],
      to: '/sub/state-rights',
    },
    {
      id: 'governance-policies',
      category: 'governance',
      categoryTa: 'ஆட்சி',
      categoryEn: 'Governance',
      icon: ClipboardList,
      badgeTa: 'ஆட்சி',
      badgeEn: 'Governance',
      titleTa: 'ஆட்சி கொள்கைகள்',
      titleEn: 'Governance Policies',
      descTa: 'பதவியால் அல்லாமல் கள அனுபவத்தால் பொறுப்பு ஒதுக்கீடு, அரசியல் ஒழுக்கம், மொழி மரியாதை மற்றும் மக்கள் தரவிலிருந்து மாநில முடிவிற்கு ஒருங்கிணைந்த ஆட்சி.',
      descEn: 'Responsibility allocated by work and field experience, language dignity, and evidence-driven data to decision governance flow.',
      highlightsTa: ['மக்கள் தரவு வழி ஆட்சி', 'மொழி மரியாதை & அரசியல் ஒழுக்கம்'],
      highlightsEn: ['Evidence-Led Decision Flow', 'Language Dignity & Duty'],
      to: '/sub/governance-policies',
    },
  ];

  const filteredTopics = activeTab === 'all' 
    ? topics 
    : topics.filter(t => t.category === activeTab);

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100/80 text-red-800 text-xs font-black uppercase tracking-wider mb-4 border border-red-200 shadow-2xs">
            <Sparkles size={14} className="text-red-600" />
            <span>{currentLang === 'ta' ? 'கொள்கைகள் & வடிவமைப்பு' : 'Core Policies & Structure'}</span>
          </div>

          <h2 className={`text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4 ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
            {currentLang === 'ta' ? 'கட்சி மற்றும் ஆட்சி கொள்கைகள்' : 'Party & Governance Policies'}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            {currentLang === 'ta' 
              ? 'எங்கள் கட்சியின் முதன்மைக் கொள்கைகள், கட்டமைப்பு, மாநில உரிமைகள் மற்றும் மக்கள் நல ஆட்சி வழிமுறைகளை விரிவாக அறிந்து கொள்ளுங்கள்.' 
              : 'Explore our foundational doctrines, organizational hierarchy, state rights, and evidence-led governance framework.'}
          </p>

          {/* Filter Tabs */}
          <div className="flex items-center justify-center gap-2 mt-8 p-1.5 bg-slate-100/80 rounded-2xl max-w-xs mx-auto border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-red-700 shadow-md shadow-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {currentLang === 'ta' ? 'அனைத்தும்' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('party')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                activeTab === 'party'
                  ? 'bg-white text-red-700 shadow-md shadow-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {currentLang === 'ta' ? 'கட்சி' : 'Party'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('governance')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                activeTab === 'governance'
                  ? 'bg-white text-red-700 shadow-md shadow-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {currentLang === 'ta' ? 'ஆட்சி' : 'Governance'}
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTopics.map((topic, index) => {
            const Icon = topic.icon;
            const badgeText = currentLang === 'ta' ? topic.badgeTa : topic.badgeEn;
            const categoryText = currentLang === 'ta' ? topic.categoryTa : topic.categoryEn;
            const title = currentLang === 'ta' ? topic.titleTa : topic.titleEn;
            const desc = currentLang === 'ta' ? topic.descTa : topic.descEn;
            const highlights = currentLang === 'ta' ? topic.highlightsTa : topic.highlightsEn;

            return (
              <div 
                key={topic.id}
                className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-red-500/30 transform hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Icon and Badges */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-red-100/60 border border-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-xs">
                      <Icon size={22} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">
                        {categoryText}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-100">
                        {badgeText}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl sm:text-2xl font-black text-slate-900 mb-3 group-hover:text-red-600 transition-colors ${currentLang === 'ta' ? 'font-tamil' : 'font-header'}`}>
                    {title}
                  </h3>

                  {/* Description Preview */}
                  <p className="text-sm text-slate-600 font-medium leading-relaxed mb-5 line-clamp-3">
                    {desc}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                    {highlights.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        <span className="truncate">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-2">
                  <Link 
                    to={topic.to}
                    className="inline-flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-slate-50 group-hover:bg-red-600 text-slate-700 group-hover:text-white font-extrabold text-sm transition-all duration-200 cursor-pointer shadow-2xs"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen size={16} />
                      {currentLang === 'ta' ? 'மேலும் வாசிக்க' : 'Read More'}
                    </span>
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
