import Link from "next/link";
import { schoolInfo } from "@/lib/school-info";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="w-full px-6 py-8 md:px-16 md:py-10">
        
        {/* items-stretch keeps the columns equal height on desktop */}
        <div className="flex flex-col md:flex-row md:justify-between items-stretch gap-8 md:gap-12">
          
          {/* Column 1: Brand & Copyright */}
          <div className="flex flex-col justify-between text-center md:text-left flex-1">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Hidayatul Islam College
              </h2>
              <p className="text-sm text-gray-400 max-w-sm mx-auto md:mx-0 leading-relaxed">
                Knowledge is Light. An independent, coeducational primary school in Kensington, Cape Town.
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-4 md:mt-0">
              © 2026 Hidayatul Islam College.<br />All rights reserved.
            </p>
          </div>

          {/* Column 2: Unified Contact & Connect */}
          <div className="flex flex-col justify-between text-center md:text-right flex-1 items-center md:items-end">
            {/* Removed md:mb-0 so the gap matches the left column */}
            <h3 className="text-xl font-bold text-white mb-2">
              Contact & Connect
            </h3>
            <div className="text-sm text-gray-400 leading-relaxed space-y-1 md:mt-0">
              <p>
                {schoolInfo.address.line1}<br />
                {schoolInfo.address.line2}
              </p>
              <p>
                <a href={`tel:${schoolInfo.phones[0].replace(/\s/g, '')}`} className="hover:text-white transition">
                  {schoolInfo.phones[0]}
                </a>
              </p>
              <p className="pt-2">
                <a 
                  href={schoolInfo.socials.facebook} 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-gold transition underline underline-offset-4 decoration-gray-600"
                >
                  Follow us on Facebook
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}