import React from 'react';
import flagImg from '../assets/flag.jpeg';
import footerImg from '../assets/footer.jpeg';

export default function Footer() {
  return (
    <footer className="w-full bg-primary overflow-hidden">
      <div className="w-full max-w-[1800px] mx-auto px-2 md:px-4 py-2 md:py-3">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="hidden md:flex flex-1 justify-start">
            <img
              src={flagImg}
              alt="Party flag"
              className="h-[160px] lg:h-[220px] w-auto object-contain select-none"
            />
          </div>

          <div className="flex-1 flex justify-center">
            <img
              src={footerImg}
              alt="Footer"
              className="h-[160px] lg:h-[220px] w-full object-contain object-center select-none"
            />
          </div>

          <div className="hidden md:flex flex-1 justify-end">
            <img
              src={flagImg}
              alt="Party flag"
              className="h-[160px] lg:h-[220px] w-auto object-contain select-none"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
