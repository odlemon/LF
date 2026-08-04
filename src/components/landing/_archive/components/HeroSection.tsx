"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HeroNavbar } from "./HeroNavbar";
import { HiArrowRight, HiPlay, HiCheckCircle, HiTrendingUp } from "react-icons/hi";

export function HeroSection() {
  const [tilt, setTilt] = useState({ x: 6, y: -16 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const angleY = ((x - xc) / xc) * 28;
    const angleX = ((yc - y) / yc) * 18;
    setTilt({ x: angleX, y: angleY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 6, y: -16 });
  };

  const partners = [
    { name: "Thomson Reuters", text: "TR", color: "text-orange-600 bg-orange-50 border-orange-200" },
    { name: "NetDocuments", text: "ND", color: "text-blue-600 bg-blue-50 border-blue-200" },
    { name: "QuickBooks", text: "QB", color: "text-green-600 bg-green-50 border-green-200" },
    { name: "Salesforce", text: "SF", color: "text-sky-500 bg-sky-50 border-sky-200" },
    { name: "iManage", text: "iM", color: "text-teal-600 bg-teal-50 border-teal-200" },
    { name: "Clio", text: "CL", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ];

  return (
    <div id="home" className="min-h-screen bg-white relative overflow-hidden">
      <HeroNavbar />

      <div className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32">
        <div className="w-full px-4 sm:px-6 lg:px-12 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:mt-16 lg:items-start lg:gap-16">
            
            <div className="w-full lg:w-1/2 xl:w-3/5 lg:pt-10 flex flex-col gap-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight tracking-tight lg:tracking-normal">
                <span className="text-gray-900 block">Pricing Intelligence</span>
                <span className="text-primary block mt-1">Built for Law Firms</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl xl:max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Lysp consolidates billing, rate, and matter data to deliver consistent pricing models that improve realization and revenue predictability.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/auth"
                  className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-[0_18px_40px_-15px_rgba(16,185,129,0.5)] transition-all duration-200 text-center flex items-center justify-center gap-2"
                >
                  Request a Demo
                  <HiArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/client-login"
                  className="border border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-lg text-sm font-semibold transition-all text-center flex items-center justify-center gap-2"
                >
                  Run a Live Trial
                  <HiPlay className="w-4 h-4" />
                </Link>
              </div>

              <div className="pt-8 mt-6 border-t border-gray-100 flex flex-col gap-4 text-center lg:text-left">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Works well with your existing tech stack
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <div className="flex -space-x-3 overflow-hidden">
                    {partners.map((partner) => (
                      <div
                        key={partner.name}
                        title={partner.name}
                        className={`h-12 w-12 rounded-full border-2 border-white flex items-center justify-center font-bold text-sm shadow-md transition-all duration-200 hover:scale-125 hover:z-10 ${partner.color}`}
                      >
                        {partner.text}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 max-w-sm">
                    We integrate and sync data automatically which keeps matters updated everywhere.
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[55%] xl:w-[52%] flex justify-center">
              <div
                style={{
                  perspective: isMobile ? "none" : "1600px",
                }}
                className="w-full max-w-lg lg:max-w-none"
              >
                <div
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onMouseEnter={() => setIsHovered(true)}
                  style={{
                    transform: isMobile
                      ? "none"
                      : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.04 : 1})`,
                    transition: isHovered ? "none" : "transform 0.5s ease-out",
                    transformStyle: "preserve-3d",
                  }}
                  className="rounded-[24px] sm:rounded-[28px] border border-gray-100 bg-white p-2.5 sm:p-3 shadow-[0_28px_55px_rgba(15,23,42,0.15)] select-none cursor-pointer"
                >
                  <div className="bg-gray-50 rounded-[20px] sm:rounded-[24px] overflow-hidden border border-gray-200/50 flex flex-col h-[320px] sm:h-[380px] w-full">
                    <div className="h-10 bg-white border-b border-gray-200/60 px-4 flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-400" />
                        <span className="w-3 h-3 rounded-full bg-yellow-400" />
                        <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">lysp.io/workspace</span>
                      <div className="w-12" />
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                      <div className="w-40 bg-white border-r border-gray-100 p-3 hidden sm:flex flex-col gap-4">
                        <div className="w-16 h-4 bg-gray-100 rounded-md" />
                        <div className="flex flex-col gap-2">
                          <div className="h-7 bg-primary/10 rounded-lg flex items-center px-2.5 gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <div className="w-12 h-2.5 bg-primary/30 rounded" />
                          </div>
                          <div className="h-7 rounded-lg flex items-center px-2.5 gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-300" />
                            <div className="w-16 h-2.5 bg-gray-200 rounded" />
                          </div>
                          <div className="h-7 rounded-lg flex items-center px-2.5 gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-300" />
                            <div className="w-10 h-2.5 bg-gray-200 rounded" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto rates-scrollable">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Matter Pricing</span>
                            <h3 className="text-sm font-bold text-gray-800 mt-0.5">Harrison & Clarke LLP</h3>
                          </div>
                          <div className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-100">
                            <HiTrendingUp className="w-3 h-3" />
                            +9.4% Uplift
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white border border-gray-200/60 rounded-xl p-3.5 flex flex-col justify-between h-24">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Realization Rate</span>
                            <span className="text-2xl font-extrabold text-gray-900">92.4%</span>
                          </div>
                          <div className="bg-white border border-gray-200/60 rounded-xl p-3.5 flex flex-col justify-between h-24">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Estimated Value</span>
                            <span className="text-2xl font-extrabold text-gray-900">$450,000</span>
                          </div>
                        </div>

                        <div className="bg-white border border-gray-200/60 rounded-xl p-3.5 flex flex-col gap-2">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Recommended Playbook</span>
                          <div className="flex items-center gap-2">
                            <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-semibold text-gray-700">Fixed Fee Structure Approved</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
