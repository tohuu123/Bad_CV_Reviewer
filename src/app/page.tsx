"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const listOfJobs = ['Software Engineer?', 'Front-end Developer?', 'Back-end Developer?', 'Full-stack Developer?'];
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentJobIndex((prev) => (prev + 1) % listOfJobs.length);
        setIsAnimating(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [listOfJobs.length]);

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-6 animate-fade-in">

        {/* Title */}
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 text-transparent bg-clip-text">
          Bad CV Reviewer
        </h1>

        {/* Subtitle */}
        <div className="text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          <p>
            Bạn đang là sinh viên sắp đi thực tập và đang theo đuổi
          </p>
           <span 
              className={`text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 text-transparent bg-clip-text transition-all duration-500 ${
                isAnimating ? 'opacity-100' : 'opacity-0'
              }`}
            > 
              {listOfJobs[currentJobIndex]}
            </span>
        </div>
        {/* Action Button */}
        <a
          href="/upload"
          className="inline-block px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-primary-600 to-accent-600 hover:opacity-90 transition shadow-lg"
        >
          Upload CV ngay 
        </a>

      </div>
    </main>
  )
}
