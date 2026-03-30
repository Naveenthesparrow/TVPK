import React from 'react';
import footerImg from '../assets/footer.jpeg';

export default function Footer() {
  return (
    <footer className="w-full bg-primary">
      <div className="w-full h-[180px] md:h-[220px] bg-primary">
        <img
          src={footerImg}
          alt="Footer"
          className="block w-full h-full object-contain object-center"
        />
      </div>
    </footer>
  );
}
