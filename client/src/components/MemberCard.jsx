import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Download, CreditCard } from 'lucide-react';
import leaderDefaultImg from '../assets/leader.png';
import tamilAnnaiImg from '../assets/tamilannai.jpeg';
import leaderSignImg from '../assets/sign-cutout.png';

const API =
  (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

const MemberCard = ({ member, leaderPhoto }) => {
  const cardRef = useRef(null);
  const resolvedLeaderPhoto = leaderPhoto || leaderDefaultImg;

  const toAbsoluteUrl = (value) => {
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    // Frontend static assets should stay on frontend origin.
    if (value.startsWith('/assets/')) return value;
    // API-stored files should resolve against backend origin.
    if (value.startsWith('/files/') || value.startsWith('/uploads/')) return `${API}${value}`;
    return value;
  };

  const handleDownloadPDF = () => {
    if (!cardRef.current) return;

    const element = cardRef.current;
    const opt = {
      margin: 5,
      filename: `${member.name}-party-card.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: [203, 127] }, // Standard card size 8x5 inches
    };

    html2pdf().set(opt).from(element).save();
  };

  // Generate member ID (can be customized)
  const memberId = `TVK-${member._id?.slice(-6).toUpperCase() || 'XXXX'}`;
  const joinDate = new Date(member.createdAt).toLocaleDateString('ta-IN');
  const displayBoothNumber = member.boothNumber || '-';
  const displayAssembly = member.assemblyConstituency || '-';
  const displayDistrict = member.district || (member.address ? String(member.address).split(',')[0] : '-');
  const displayState = member.stateName || 'தமிழ்நாடு';

  return (
    <div className="space-y-4">
      {/* Card Preview */}
      <div
        ref={cardRef}
        className="rounded-xl shadow-2xl w-full overflow-hidden border border-slate-300 bg-white"
        style={{
          aspectRatio: '1.72',
        }}
      >
        <div className="h-full flex flex-col">
          <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 px-4 py-2 text-yellow-300">
            <div className="grid grid-cols-[56px_1fr_56px] items-center gap-2.5">
              <img
                src={toAbsoluteUrl(resolvedLeaderPhoto)}
                alt="கட்சி தலைவர்"
                className="w-[56px] h-[56px] rounded-lg object-cover border-2 border-yellow-300 shadow-md"
              />
              <h2 className="font-tamil min-w-0 text-[clamp(20px,2.7vw,28px)] leading-[1.05] font-black tracking-[0] text-center whitespace-nowrap drop-shadow-[0_1px_0_rgba(0,0,0,0.18)]">
                தமிழ்நாடு விடுதலைப்புலி கட்சி
              </h2>
              <img
                src={tamilAnnaiImg}
                alt="தமிழ்அன்னை"
                className="w-[56px] h-[56px] rounded-lg object-cover border-2 border-yellow-300 justify-self-end shadow-md"
              />
            </div>
          </div>

          <div className="flex-1 px-6 py-4 bg-[linear-gradient(180deg,_#fff_0%,_#fff7f7_100%)] relative">
            <div className="text-base font-black text-red-700 mb-3 font-tamil text-center">உறுப்பினர் அட்டை</div>
            <div className="max-w-[780px] mx-auto grid grid-cols-[190px_1fr] gap-10 h-full items-center">
              <div className="h-full flex flex-col items-center justify-center py-1">
                {member.professionalPhoto ? (
                  <img
                    src={toAbsoluteUrl(member.professionalPhoto)}
                    alt={member.name}
                    className="w-36 h-48 rounded-md object-cover object-center border-2 border-slate-300 shadow-sm"
                  />
                ) : (
                  <div className="w-36 h-48 rounded-md bg-slate-100 flex items-center justify-center border-2 border-slate-300">
                    <CreditCard size={28} className="text-slate-400" />
                  </div>
                )}
                <p className="mt-2 text-lg font-black text-slate-800 text-center font-tamil leading-tight">{member.name || '-'}</p>
              </div>

              <div className="flex flex-col justify-center pt-1">
                <div className="grid grid-cols-[130px_12px_minmax(170px,260px)] gap-y-2.5 text-slate-800">
                  <div className="font-semibold">பெயர்</div>
                  <div>:</div>
                  <div className="font-semibold">{member.name || '-'}</div>

                  <div className="font-semibold">உறுப்பினர் எண்</div>
                  <div>:</div>
                  <div className="font-bold text-red-700">{memberId}</div>

                  <div className="font-semibold">பூத் எண்</div>
                  <div>:</div>
                  <div>{displayBoothNumber}</div>

                  <div className="font-semibold">சட்டமன்றம்</div>
                  <div>:</div>
                  <div>{displayAssembly}</div>

                  <div className="font-semibold">மாவட்டம்</div>
                  <div>:</div>
                  <div>{displayDistrict}</div>

                  <div className="font-semibold">மாநிலம்</div>
                  <div>:</div>
                  <div>{displayState}</div>

                  <div className="font-semibold">சேர்ந்த தேதி</div>
                  <div>:</div>
                  <div>{joinDate}</div>
                </div>

              </div>
            </div>

            <div className="absolute right-4 bottom-2 w-52 flex flex-col items-center text-center">
              <img
                src={leaderSignImg}
                alt="கட்சி தலைவர் கையொப்பம்"
                className="w-48 h-12 object-contain"
              />
              <p className="mt-0.5 text-[12px] font-tamil font-black text-slate-900">கட்சி தலைவர் கையொப்பம்</p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownloadPDF}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
      >
        <Download size={18} />
        அட்டையை PDF ஆக பதிவிறக்கு
      </button>

    </div>
  );
};

export default MemberCard;
