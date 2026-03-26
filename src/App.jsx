'use client';

import React, { useState } from 'react';
import GlobalStyles from '@/components/GlobalStyles';
import Navbar from '@/components/dashboard/Navbar';
import HomePage from '@/components/HomePage';
import AboutPage from '@/components/AboutPage';
import IntroBar from '@/components/dashboard/IntroBar';
import CoachInsight from '@/components/dashboard/CoachInsight';
import GoalTracker from '@/components/dashboard/GoalTracker';
import CaseScoreCard from '@/components/dashboard/CaseScoreCard';
import HighestScoreCard from '@/components/dashboard/HighestScoreCard';
import LowestScoreCard from '@/components/dashboard/LowestScoreCard';
import ParameterBarChart from '@/components/dashboard/ParameterBarChart';
import TimeLineChart from '@/components/dashboard/TimeLineChart';
import CaseHistoryTable from '@/components/dashboard/CaseHistoryTable';
import FeedbackAnalyser from '@/components/dashboard/FeedbackAnalyser';
import Footer from '@/components/dashboard/Footer';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [filters, setFilters] = useState({
    types: [],
    levels: [],
    time: 'all',
    customStart: '',
    customEnd: '',
  });

  const hasActiveFilters = filters.types.length > 0 || filters.levels.length > 0 || filters.time !== 'all';
  const clearAllFilters = () => setFilters({ types: [], levels: [], time: 'all', customStart: '', customEnd: '' });
  const isGoalTrackerLocked = filters.types.length === 0 && filters.levels.length > 0;

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <GlobalStyles />
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {currentPage === 'home' ? (

        <HomePage onNavigate={handleNavigate} />

      ) : currentPage === 'about' ? (

        <AboutPage onNavigate={handleNavigate} />

      ) : (

        <div className="min-h-screen bg-[#fff8f0] font-sans selection:bg-[#3D5A35]/20 selection:text-[#3B2F2F] overflow-x-hidden relative">
          <main className="px-4 lg:px-6 max-w-[1440px] mx-auto pb-12">

            {/* ROW 1 */}
            <IntroBar
              filters={filters} setFilters={setFilters}
              hasActiveFilters={hasActiveFilters} clearAllFilters={clearAllFilters}
              suppressFloating={feedbackOpen}
            />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

              {/* LEFT COLUMN */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <ScrollReveal delay={0}>
                  <CoachInsight filters={filters} />
                </ScrollReveal>

                <ScrollReveal delay={100}>
                  <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4 h-full">
                      <CaseScoreCard filters={filters} />
                      <div className="grid grid-cols-2 gap-4 mt-auto">
                        <HighestScoreCard filters={filters} />
                        <LowestScoreCard filters={filters} />
                      </div>
                    </div>
                    <ParameterBarChart filters={filters} />
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={200} className="flex-1 flex flex-col">
                  <TimeLineChart filters={filters} />
                </ScrollReveal>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <ScrollReveal delay={50} className="shrink-0">
                  <GoalTracker isLocked={isGoalTrackerLocked} />
                </ScrollReveal>
                <ScrollReveal delay={150}>
                  <CaseHistoryTable filters={filters} />
                </ScrollReveal>
              </div>

            </div>
          </main>

          <ScrollReveal delay={300}>
            <Footer onNavigate={handleNavigate} currentPage="dashboard" />
          </ScrollReveal>

          <FeedbackAnalyser isOpen={feedbackOpen} setIsOpen={setFeedbackOpen} />
        </div>

      )}
    </>
  );
}
