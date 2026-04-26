/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home as HomeIcon, PillBottle, Wheat, Info, Settings as SettingsIcon, Plus, ChevronRight, CheckCircle2, Clock, Thermometer, AlertCircle, Trash2, RotateCcw, MemoryStick } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STARTER_PLAN, BREAD_RECIPES, type RecipeType, type Observation, type AppSettings, type BreadStep } from './constants';

// --- Types ---
type View = 'home' | 'starter' | 'bread' | 'guide' | 'settings';
type GuidePage = 'archive' | 'maintenance' | 'using-starter' | 'discard-crackers';

interface StarterData {
  setup: boolean;
  startDate: string | null;
  feedingTime: string;
  temp: 'cool' | 'mild' | 'warm';
  logs: Record<number, { done: boolean; observations: Observation[] }>;
}

interface BreadData {
  active: boolean;
  recipeType: RecipeType | null;
  startDateTime: string | null;
  currentStepIndex: number;
  completedSteps: number[];
  timers: Record<number, number>; // remaining seconds for each step
  stretchFoldRounds: boolean[];
  stretchFoldStartedAt: string | null;
  stretchFoldRoundStartedAts: (string | null)[];
}

const DEFAULT_STARTER_DATA: StarterData = {
  setup: false,
  startDate: null,
  feedingTime: '09:00',
  temp: 'mild',
  logs: {},
};

const DEFAULT_BREAD_DATA: BreadData = {
  active: false,
  recipeType: null,
  startDateTime: null,
  currentStepIndex: -1,
  completedSteps: [],
  timers: {},
  stretchFoldRounds: [false, false, false, false],
  stretchFoldStartedAt: null,
  stretchFoldRoundStartedAts: [null, null, null, null],
};

// --- Components ---

const BlueprintFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative border border-blueprint-primary p-6 ${className}`}>
    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border border-blueprint-primary bg-blueprint-bg rounded-full" />
    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border border-blueprint-primary bg-blueprint-bg rounded-full" />
    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border border-blueprint-primary bg-blueprint-bg rounded-full" />
    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border border-blueprint-primary bg-blueprint-bg rounded-full" />
    {children}
  </div>
);

const Card: React.FC<{ title: string; children: React.ReactNode; footer?: React.ReactNode; tag?: React.ReactNode; id?: string }> = ({ title, children, footer, tag, id }) => (
  <div id={id} className="mb-8 font-mono">
    <div className="flex justify-between items-end mb-2 border-b border-blueprint-primary pb-1">
      <h3 className="text-sm font-bold text-blueprint-primary uppercase tracking-widest">{title}</h3>
      {tag}
    </div>
    <div className="text-blueprint-text text-xs leading-relaxed space-y-3 pt-2">
      {children}
    </div>
    {footer && <div className="mt-4 pt-4 border-t border-blueprint-line border-dashed">{footer}</div>}
  </div>
);

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[10px] font-mono font-bold uppercase tracking-[1px] text-blueprint-accent">
    // {children}
  </span>
);

const DataRow: React.FC<{ label: string; value: string; className?: string; large?: boolean }> = ({ label, value, className = '', large = false }) => (
  <div className={`py-4 border-b border-blueprint-line border-dashed last:border-0 ${className} font-mono`}>
    <div className="text-[10px] uppercase tracking-[2px] text-blueprint-primary mb-2">{label}</div>
    <div className={`${large ? 'text-5xl font-bold text-blueprint-accent' : 'text-lg font-bold text-blueprint-text'}`}>
      {value}
    </div>
  </div>
);

const Button: React.FC<{ 
  onClick?: () => void; 
  children: React.ReactNode; 
  variant?: 'primary' | 'accent' | 'outline' | 'ghost';
  className?: string;
  id?: string;
  disabled?: boolean;
}> = ({ onClick, children, variant = 'primary', className = '', id, disabled }) => {
  const variants = {
    primary: 'bg-blueprint-primary text-blueprint-bg',
    accent: 'bg-blueprint-accent text-blueprint-bg',
    outline: 'border border-blueprint-primary text-blueprint-primary hover:bg-blueprint-primary hover:text-blueprint-bg',
    ghost: 'border border-blueprint-line text-blueprint-muted border-dashed'
  };
  return (
    <button 
      id={id}
      disabled={disabled}
      onClick={onClick}
      className={`w-full py-4 px-6 font-mono font-bold text-[11px] uppercase tracking-[2px] transition-all duration-200 active:scale-[0.98] disabled:opacity-30 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const BottomNav: React.FC<{ activeView: View; setView: (v: View) => void }> = ({ activeView, setView }) => {
  const items: { view: View; icon: React.ElementType; label: string }[] = [
    { view: 'home', icon: HomeIcon, label: 'Home' },
    { view: 'starter', icon: PillBottle, label: 'Starter' },
    { view: 'bread', icon: Wheat, label: 'Bread' },
    { view: 'guide', icon: Info, label: 'Guide' },
    { view: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[80px] bg-blueprint-bg border-t-2 border-blueprint-primary flex justify-around items-center px-4 pb-4 z-50">
      {items.map((item) => (
        <button
          key={item.view}
          onClick={() => setView(item.view)}
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeView === item.view ? 'text-blueprint-accent' : 'text-blueprint-primary opacity-40'}`}
        >
          <div className={`p-2 rounded-full ${activeView === item.view ? 'border border-blueprint-accent' : ''}`}>
            <item.icon size={18} strokeWidth={2} />
          </div>
          <span className="text-[9px] font-mono font-bold tracking-tighter">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

// --- Application ---

export default function App() {
  const isDev = import.meta.env.DEV;
  const [view, setView] = useState<View>('home');
  const [guidePage, setGuidePage] = useState<GuidePage>('archive');
  const [timeNow, setTimeNow] = useState(Date.now());
  const [targetLoafWeight, setTargetLoafWeight] = useState('');
  const [previewStarterDay, setPreviewStarterDay] = useState<number | null>(null);
  const [settings, setSettings] = useLocalStorage<AppSettings>('sc_settings', {
    defaultFeedingTime: '09:00',
    unit: 'grams',
    tempUnit: '°F',
    remindersEnabled: true,
  });

  const [starterData, setStarterData] = useLocalStorage<StarterData>('sc_starter', DEFAULT_STARTER_DATA);

  const [breadData, setBreadData] = useLocalStorage<BreadData>('sc_bread', DEFAULT_BREAD_DATA);
  const normalizedBreadData: BreadData = {
    ...DEFAULT_BREAD_DATA,
    ...breadData,
    stretchFoldRounds: breadData.stretchFoldRounds ?? DEFAULT_BREAD_DATA.stretchFoldRounds,
    stretchFoldStartedAt: breadData.stretchFoldStartedAt ?? DEFAULT_BREAD_DATA.stretchFoldStartedAt,
    stretchFoldRoundStartedAts: breadData.stretchFoldRoundStartedAts ?? DEFAULT_BREAD_DATA.stretchFoldRoundStartedAts,
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!normalizedBreadData.recipeType) {
      setTargetLoafWeight('');
      return;
    }

    const nextRecipe = BREAD_RECIPES[normalizedBreadData.recipeType];
    setTargetLoafWeight(nextRecipe.baseLoafWeight ? String(nextRecipe.baseLoafWeight) : '');
  }, [normalizedBreadData.recipeType]);

  // Calculate current starter day
  const getCurrentStarterDay = () => {
    if (!starterData.startDate) return 1;
    const start = new Date(starterData.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(diffDays, 1), 14);
  };

  const currentStarterDay = getCurrentStarterDay();
  const getElapsedMinutes = (startedAt: string | null) => {
    if (!startedAt) return 0;
    return Math.max(0, Math.floor((timeNow - new Date(startedAt).getTime()) / 60000));
  };
  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date
      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      .replace(' AM', 'am')
      .replace(' PM', 'pm');
  };
  const restartStarterSetup = () => {
    if (window.confirm('Restart starter setup and clear the current starter log?')) {
      setStarterData(DEFAULT_STARTER_DATA);
    }
  };
  const restartBreadSetup = () => {
    setBreadData(DEFAULT_BREAD_DATA);
  };
  const openMaintenanceGuide = () => {
    setGuidePage('maintenance');
    setView('guide');
  };

  const StarterDayPreviewPanel = () => {
    return (
      <aside className="border border-blueprint-primary border-dashed p-4 space-y-4">
        <div className="text-center">
          <div className="text-[10px] font-bold text-blueprint-primary uppercase tracking-[2px]">Preview Starter Days</div>
          <div className="text-[10px] text-blueprint-muted uppercase tracking-[1px]">Read-only preview</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 14 }, (_, index) => index + 1).map((day) => (
            <button
              key={day}
              onClick={() => setPreviewStarterDay(day)}
              className={`py-2 border text-[10px] font-bold transition-all ${
                (previewStarterDay ?? currentStarterDay) === day
                  ? 'bg-blueprint-primary text-blueprint-bg border-blueprint-primary'
                  : 'border-blueprint-primary text-blueprint-primary hover:bg-blueprint-primary hover:text-blueprint-bg'
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>
        {previewStarterDay !== null && (
          <Button variant="ghost" onClick={() => setPreviewStarterDay(null)}>
            Exit Preview
          </Button>
        )}
      </aside>
    );
  };

  // --- Views ---

  const HomeView = () => {
    const currentDayPlan = starterData.setup ? STARTER_PLAN[currentStarterDay - 1] : null;
    const breadRecipe = normalizedBreadData.recipeType ? BREAD_RECIPES[normalizedBreadData.recipeType] : null;
    const currentBreadStep = (normalizedBreadData.active && breadRecipe && normalizedBreadData.currentStepIndex >= 0) ? breadRecipe.steps[normalizedBreadData.currentStepIndex] : null;
    const completedStretchFoldRounds = normalizedBreadData.stretchFoldRounds.filter(Boolean).length;
    const latestCompletedStretchFoldRound = normalizedBreadData.stretchFoldRounds.reduce((latest, done, index) => (
      done ? index : latest
    ), -1);
    const latestStretchFoldElapsedMinutes = latestCompletedStretchFoldRound >= 0
      ? getElapsedMinutes(normalizedBreadData.stretchFoldRoundStartedAts[latestCompletedStretchFoldRound])
      : 0;
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const subtitleMessages = [
      'Life is batter with sourdough.',
      'Waiting is part of the recipe.',
      'Stay sour.',
      'Dough it.',
    ];
    const subtitleMessage = subtitleMessages[(currentStarterDay - 1) % subtitleMessages.length];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-mono">
        <header className="pt-4 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-0 right-0 border-t border-blueprint-line border-dashed -z-10" />
          <div className="mb-4 bg-blueprint-bg px-4 text-blueprint-primary">
            <MemoryStick size={28} strokeWidth={2} />
          </div>
          <h1 className="text-xl font-bold text-blueprint-accent tracking-tighter uppercase mb-2 bg-blueprint-bg px-4 leading-tight">MY SOURDOUGH LOG</h1>
          <p className="text-[10px] text-blueprint-muted uppercase tracking-[1px] bg-blueprint-bg px-6 py-2">{subtitleMessage}</p>
        </header>

        <div className="space-y-4">
          <button 
            onClick={() => setView('starter')}
            className="w-full p-6 border-2 border-blueprint-primary bg-transparent group hover:bg-blueprint-primary/5 transition-all text-blueprint-primary relative overflow-hidden flex items-center justify-center"
          >
            <h3 className="text-lg font-bold uppercase tracking-tight italic flex items-center justify-center gap-2 text-center">
              <PillBottle size={18} strokeWidth={2} />
              <span>new Starter Tracker</span>
            </h3>
          </button>

          <button 
            onClick={() => setView('bread')}
            className="w-full p-6 border-2 border-blueprint-primary bg-transparent group hover:bg-blueprint-primary/5 transition-all text-blueprint-primary relative overflow-hidden flex items-center justify-center"
          >
            <h3 className="text-lg font-bold uppercase tracking-tight italic flex items-center justify-center gap-2 text-center">
              <Wheat size={18} strokeWidth={2} />
              <span>new Bread Timeline</span>
            </h3>
          </button>
        </div>

        <section className="pt-6 relative">
          <div className="flex justify-between items-center border-b-2 border-blueprint-primary pb-2 mb-6">
            <h2 className="text-[10px] font-bold text-blueprint-primary uppercase tracking-[2px]">Today at a glance</h2>
            <span className="text-[10px] text-blueprint-muted font-mono">{currentDate}</span>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {starterData.setup ? (
                <div className="border-l-2 border-blueprint-accent pl-5 py-1">
                  <div className="text-[9px] font-bold text-blueprint-primary opacity-60 uppercase tracking-[2px] mb-1">Starter // Current Step</div>
                  <div className="text-xl font-bold text-blueprint-accent italic tracking-tighter">Day {currentStarterDay}</div>
                  <div className="text-[10px] text-blueprint-text mt-1 uppercase tracking-tighter">Feed at {formatDisplayTime(starterData.feedingTime)}</div>
                </div>
              ) : (
                <div className="border-l-2 border-blueprint-line pl-5 py-1 opacity-50">
                  <div className="text-[9px] font-bold text-blueprint-primary uppercase tracking-[2px]">Starter // Inactive</div>
                  <div className="text-xs font-bold mt-1 uppercase tracking-tighter">No active starter project</div>
                </div>
              )}

              {normalizedBreadData.active && currentBreadStep ? (
                <div className="border-l-2 border-blueprint-accent pl-5 py-1">
                  <div className="text-[9px] font-bold text-blueprint-primary opacity-60 uppercase tracking-[2px] mb-1">Bread // Ongoing Phase</div>
                  <div className="text-xl font-bold text-blueprint-accent italic tracking-tighter">{currentBreadStep.name}</div>
                  {currentBreadStep.name === 'Bulk Proof / Stretch and Fold' && latestCompletedStretchFoldRound >= 0 ? (
                    <div className="text-[10px] text-blueprint-text mt-1 uppercase tracking-tighter">
                      {completedStretchFoldRounds}/4 rounds done // round {latestCompletedStretchFoldRound + 1}: {latestStretchFoldElapsedMinutes} min
                    </div>
                  ) : (
                    <div className="text-[10px] text-blueprint-text mt-1 uppercase tracking-tighter">Status: Active Recipe</div>
                  )}
                </div>
              ) : (
                <div className="border-l-2 border-blueprint-line pl-5 py-1 opacity-50">
                  <div className="text-[9px] font-bold text-blueprint-primary uppercase tracking-[2px]">Bread // Idle</div>
                  <div className="text-xs font-bold mt-1 uppercase tracking-tighter">No active bread timeline</div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  };

  const StarterView = () => {
    if (!starterData.setup && previewStarterDay === null) {
      return (
        <div className="space-y-8 font-mono animate-in fade-in duration-300">
          <header className="pt-4 text-center">
            <h1 className="text-2xl font-bold text-blueprint-accent tracking-tight uppercase">Starter Setup</h1>
          </header>
          
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="border-l-2 border-blueprint-primary pl-4 py-2">
                <label className="block text-[9px] font-bold text-blueprint-primary uppercase tracking-[1px] mb-2">Start Date</label>
                <input 
                  type="date" 
                  value={starterData.startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStarterData({ ...starterData, startDate: e.target.value })}
                  className="w-full bg-transparent border-b border-blueprint-line py-2 text-sm font-bold text-blueprint-text focus:outline-none focus:border-blueprint-primary" 
                />
              </div>
              <div className="border-l-2 border-blueprint-primary pl-4 py-2">
                <label className="block text-[9px] font-bold text-blueprint-primary uppercase tracking-[1px] mb-2">Daily Feed Time</label>
                <input 
                  type="time" 
                  value={starterData.feedingTime}
                  onChange={(e) => setStarterData({ ...starterData, feedingTime: e.target.value })}
                  className="w-full bg-transparent border-b border-blueprint-line py-2 text-sm font-bold text-blueprint-text focus:outline-none focus:border-blueprint-primary" 
                />
              </div>
            </div>

            <Button variant="accent" onClick={() => setStarterData({ ...starterData, setup: true, startDate: starterData.startDate || new Date().toISOString().split('T')[0] })}>
              Let's Go
            </Button>

            <StarterDayPreviewPanel />
          </div>
        </div>
      );
    }

    const displayedStarterDay = previewStarterDay ?? currentStarterDay;
    const isPreviewMode = previewStarterDay !== null;
    const currentDayPlan = STARTER_PLAN[displayedStarterDay - 1];
    const dayLog = starterData.logs[displayedStarterDay] || { done: false, observations: [] };

    return (
      <div className="space-y-8 pb-32 font-mono">
        <header className="flex flex-col items-center pt-4 border-b-2 border-blueprint-primary pb-4">
          <div className="text-6xl font-bold text-blueprint-accent italic tracking-tighter">D.{displayedStarterDay}</div>
          {isPreviewMode && <div className="mt-2 text-[10px] text-blueprint-primary uppercase tracking-[2px]">Preview Mode</div>}
        </header>

        <section>
          <div className="flex justify-center items-center mb-6">
            <h2 className="text-[10px] font-bold text-blueprint-primary uppercase tracking-[2px]">Action Items</h2>
          </div>

          <div className="space-y-3 mb-8">
            {currentDayPlan.task.map((t, i) => (
              <div key={i} className="flex items-center gap-4 py-4 px-4 border border-blueprint-line relative overflow-hidden group">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-blueprint-primary opacity-20" />
                <div className={`w-4 h-4 border border-blueprint-primary flex items-center justify-center shrink-0 ${dayLog.done ? 'bg-blueprint-primary' : ''}`}>
                  {dayLog.done && <div className="w-1.5 h-1.5 bg-blueprint-bg" />}
                </div>
                <span className="text-[14px] font-bold text-blueprint-text leading-tight uppercase">{t}</span>
              </div>
            ))}
          </div>

          {displayedStarterDay >= 10 && (
            <div className="mb-8 border border-blueprint-primary border-dashed bg-blueprint-primary/5 p-4 space-y-2">
              <h3 className="text-[10px] font-bold text-blueprint-primary uppercase tracking-[2px] text-center">What To Expect</h3>
              <p className="text-[14px] text-blueprint-text leading-relaxed">{currentDayPlan.lookFor}</p>
              <p className="text-[12px] text-blueprint-primary leading-relaxed">{currentDayPlan.isNormal}</p>
            </div>
          )}

          <Button
            variant={dayLog.done ? 'ghost' : 'accent'}
            disabled={isPreviewMode}
            onClick={() => setStarterData({ ...starterData, logs: { ...starterData.logs, [displayedStarterDay]: { ...dayLog, done: !dayLog.done } } })}
          >
            {dayLog.done ? 'UNDO' : 'DONE'}
          </Button>

          {displayedStarterDay >= 11 && (
            <div className="mt-4">
              <Button variant="outline" onClick={openMaintenanceGuide} disabled={isPreviewMode}>
                GO TO MAINTENANCE
              </Button>
            </div>
          )}
        </section>

        <Button variant="outline" onClick={restartStarterSetup} className="flex items-center justify-center gap-2" disabled={isPreviewMode}>
          <RotateCcw size={16} strokeWidth={2} />
          <span>RESTART STARTER SETUP</span>
        </Button>

        <StarterDayPreviewPanel />
      </div>
    );
  };

  const BreadView = () => {
    if (!normalizedBreadData.active) {
      const recipeOptions: { key: RecipeType; label: string }[] = [
        { key: 'baking-arts', label: 'Baking Arts & Coffee' },
        { key: 'cocoa-sourdough', label: 'Cocoa Sourdough Loaf' },
      ];

      return (
        <div className="space-y-8 font-mono">
          <header className="pt-4 text-center">
            <h1 className="text-2xl font-bold text-blueprint-accent tracking-tight uppercase">Recipes</h1>
          </header>

          <div className="space-y-3">
            {recipeOptions.map((recipe) => (
              <button
                key={recipe.key}
                onClick={() => setBreadData({ ...normalizedBreadData, recipeType: recipe.key })}
                className={`w-full py-8 px-6 text-left transition-all border-2 ${normalizedBreadData.recipeType === recipe.key ? 'bg-blueprint-primary text-blueprint-bg border-blueprint-primary shadow-[4px_4px_0px_#C24C28]' : 'bg-transparent text-blueprint-primary border-blueprint-line'}`}
              >
                <span className="text-lg font-bold tracking-tighter italic">{recipe.label}</span>
              </button>
            ))}

            <div className="pt-6">
              <Button disabled={!normalizedBreadData.recipeType} variant="accent" onClick={() => {
                setBreadData({
                  ...normalizedBreadData,
                  active: true,
                  currentStepIndex: -1,
                  completedSteps: [],
                  stretchFoldRounds: [false, false, false, false],
                  stretchFoldStartedAt: null,
                  stretchFoldRoundStartedAts: [null, null, null, null],
                });
              }}>
                Let's Go
              </Button>
            </div>
          </div>
        </div>
      );
    }

    const recipe = BREAD_RECIPES[normalizedBreadData.recipeType!];
    const recipeSteps = recipe.steps;
    const currentStep = normalizedBreadData.currentStepIndex >= 0 ? recipeSteps[normalizedBreadData.currentStepIndex] : null;
    const loafWeightValue = targetLoafWeight === '' ? recipe.baseLoafWeight ?? 0 : Number(targetLoafWeight);
    const loafScale = recipe.baseLoafWeight && loafWeightValue > 0 ? loafWeightValue / recipe.baseLoafWeight : 1;

    const handleNextStep = () => {
      if (normalizedBreadData.currentStepIndex < 0) {
        setBreadData({ ...normalizedBreadData, currentStepIndex: 0 });
      } else if (normalizedBreadData.currentStepIndex < recipeSteps.length - 1) {
        const nextIndex = normalizedBreadData.currentStepIndex + 1;
        setBreadData({ ...normalizedBreadData, currentStepIndex: nextIndex });
      } else {
        setBreadData({ ...normalizedBreadData, active: false });
      }
    };
    const handlePreviousStep = () => {
      if (normalizedBreadData.currentStepIndex > 0) {
        setBreadData({ ...normalizedBreadData, currentStepIndex: normalizedBreadData.currentStepIndex - 1 });
      }
    };
    const handleStretchFoldRoundToggle = (roundIndex: number) => {
      const nextRounds = [...normalizedBreadData.stretchFoldRounds];
      const nextRoundStartedAts = [...normalizedBreadData.stretchFoldRoundStartedAts];
      nextRounds[roundIndex] = !nextRounds[roundIndex];

      const hadAnyChecked = normalizedBreadData.stretchFoldRounds.some(Boolean);
      const hasAnyChecked = nextRounds.some(Boolean);
      if (nextRounds[roundIndex]) {
        nextRoundStartedAts[roundIndex] = new Date().toISOString();
      } else {
        nextRoundStartedAts[roundIndex] = null;
      }

      setBreadData({
        ...normalizedBreadData,
        stretchFoldRounds: nextRounds,
        stretchFoldRoundStartedAts: nextRoundStartedAts,
        stretchFoldStartedAt: !hadAnyChecked && hasAnyChecked
          ? new Date().toISOString()
          : hasAnyChecked
            ? normalizedBreadData.stretchFoldStartedAt
            : null,
      });
    };
    const formatInstructionBullets = (instruction: string) =>
      instruction
        .split(/(?<=[.!?])\s+/)
        .map((part) => part.trim())
        .filter(Boolean);
    const formatScaledAmount = (ingredient: typeof recipe.ingredients[number]) => {
      if (recipe.baseLoafWeight && recipe.baseTotalFlourGrams && ingredient.bakerPercent !== undefined && loafWeightValue > 0) {
        const scaledTotalFlour = recipe.baseTotalFlourGrams * loafScale;
        const scaled = scaledTotalFlour * (ingredient.bakerPercent / 100);
        const rounded = scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
        return `${rounded}g`;
      }

      if (!recipe.baseLoafWeight || ingredient.grams === undefined || loafWeightValue <= 0) {
        return ingredient.amount;
      }

      const scaled = ingredient.grams * loafScale;
      const rounded = scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
      return `${rounded}g`;
    };
    const latestCompletedStretchFoldRound = normalizedBreadData.stretchFoldRounds.reduce((latest, done, index) => (
      done ? index : latest
    ), -1);

    if (normalizedBreadData.currentStepIndex < 0) {
      return (
        <div className="space-y-8 pb-32 font-mono">
          <header className="pt-4 text-center border-b-2 border-blueprint-primary pb-4">
            <label className="text-[10px] text-blueprint-primary uppercase tracking-[2px] font-bold opacity-60">Ingredients</label>
            <h1 className="text-2xl font-bold text-blueprint-accent tracking-tight uppercase">{recipe.title}</h1>
          </header>

          <BlueprintFrame>
            {recipe.baseLoafWeight ? (
              <div className="pb-4 border-b border-blueprint-line border-dashed space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={targetLoafWeight}
                    onChange={(e) => setTargetLoafWeight(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-24 bg-transparent border-b border-blueprint-primary py-1 text-[18px] font-bold text-blueprint-primary focus:outline-none"
                  />
                  <button
                    onClick={() => setTargetLoafWeight(String(recipe.baseLoafWeight))}
                    className="text-blueprint-primary"
                    aria-label="Reset loaf weight"
                  >
                    <RotateCcw size={16} strokeWidth={2} />
                  </button>
                </div>
                <p className="text-[14px] font-bold text-blueprint-primary leading-relaxed uppercase">
                  G loaf{recipe.hydrationText ? `, ${recipe.hydrationText}` : ''}
                </p>
              </div>
            ) : (
              <p className="pb-4 text-[14px] font-bold text-blueprint-primary leading-relaxed uppercase border-b border-blueprint-line border-dashed">
                {recipe.yieldText}
              </p>
            )}
            <div className="space-y-4">
              {recipe.ingredients.map((ingredient) => (
                <div key={`${ingredient.amount}-${ingredient.item}`} className="border-b border-blueprint-line border-dashed pb-3 last:border-0 last:pb-0">
                  <div className="text-lg font-bold text-blueprint-text">{formatScaledAmount(ingredient)} {ingredient.item}</div>
                  {ingredient.note && <div className="text-[10px] text-blueprint-primary uppercase tracking-[1px] mt-1">{ingredient.note}</div>}
                </div>
              ))}
            </div>
          </BlueprintFrame>

          <Button onClick={handleNextStep} variant="accent">
            START RECIPE
          </Button>

          <button
            onClick={restartBreadSetup}
            className="w-full text-center text-sm font-mono font-bold text-blueprint-primary underline underline-offset-4"
          >
            BACK TO RECIPES
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8 pb-32 font-mono">
        <header className="pt-4 text-center border-b-2 border-blueprint-primary pb-4">
          <label className="text-[10px] text-blueprint-primary uppercase tracking-[2px] font-bold opacity-60">{recipe.title}</label>
          <h1 className="text-2xl font-bold text-blueprint-accent tracking-tight uppercase">{currentStep?.name}</h1>
        </header>

        <section className="space-y-8">
          <BlueprintFrame>
            <div className="space-y-4 text-blueprint-text">
              {formatInstructionBullets(currentStep?.instruction || '').map((item, index) => (
                <div key={`${currentStep?.name}-${index}`} className="flex items-start gap-3 border-b border-blueprint-line border-dashed pb-3 last:border-0 last:pb-0">
                  <span className="pt-1 text-sm leading-none text-blueprint-text">•</span>
                  <p className="text-[14px] font-bold text-blueprint-text leading-tight">{item}</p>
                </div>
              ))}
            </div>
          </BlueprintFrame>

          {currentStep?.name === 'Bulk Proof / Stretch and Fold' && (
            <BlueprintFrame>
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-blueprint-primary uppercase tracking-[2px] text-center">Stretch and Fold Rounds</h3>
                <div className="space-y-3">
                  {normalizedBreadData.stretchFoldRounds.map((done, index) => (
                    <button
                      key={index}
                      onClick={() => handleStretchFoldRoundToggle(index)}
                      className="w-full flex items-center gap-4 py-4 px-4 border border-blueprint-line text-left"
                    >
                      <div className={`w-5 h-5 border border-blueprint-primary flex items-center justify-center shrink-0 ${done ? 'bg-blueprint-primary' : ''}`}>
                        {done && <div className="w-2 h-2 bg-blueprint-bg" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-bold text-blueprint-text leading-tight uppercase">Round {index + 1}</div>
                        {index === latestCompletedStretchFoldRound && normalizedBreadData.stretchFoldRoundStartedAts[index] && (
                          <div className="mt-1 text-[12px] text-blueprint-primary leading-relaxed">
                            {getElapsedMinutes(normalizedBreadData.stretchFoldRoundStartedAts[index])} minutes since this round was marked complete.
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {normalizedBreadData.stretchFoldStartedAt && (
                  <p className="text-[12px] text-blueprint-primary leading-relaxed">
                    Timer starts separately for each round as you mark it complete.
                  </p>
                )}
              </div>
            </BlueprintFrame>
          )}
        </section>

        <Button onClick={handleNextStep} variant="accent">
          {normalizedBreadData.currentStepIndex < recipeSteps.length - 1 ? 'NEXT STEP' : 'FINISH RECIPE'}
        </Button>

        <Button variant="outline" onClick={handlePreviousStep} disabled={normalizedBreadData.currentStepIndex === 0}>
          PREVIOUS STEP
        </Button>

        <button
          onClick={restartBreadSetup}
          className="w-full text-center text-sm font-mono font-bold text-blueprint-primary underline underline-offset-4"
        >
          BACK TO RECIPES
        </button>
      </div>
    );
  };

  const GuideView = () => {
    if (guidePage === 'maintenance') {
      return (
        <div className="space-y-8 pb-32 font-mono">
          <header className="pt-4 text-center border-b-2 border-blueprint-primary pb-4">
            <label className="text-[10px] text-blueprint-primary uppercase tracking-[3px] font-bold opacity-60">Technical Details</label>
            <h1 className="text-2xl font-bold text-blueprint-accent tracking-tight uppercase">Maintenance of Starter</h1>
          </header>

          <BlueprintFrame className="space-y-6">
            <p className="text-xs leading-relaxed text-blueprint-text">
              At least once every 2 weeks, discard all but 50g of starter and add 50g water plus 50g flour.
              Let it double at room temperature for about 6-18 hours, then use it or place it in the fridge for up to 2 weeks before feeding again.
            </p>

            <div className="space-y-3 border-y border-blueprint-line border-dashed py-4">
              {[
                '50g starter (discard the rest)',
                '50g water (room temperature)',
                '50g all-purpose or bread flour',
              ].map((item) => (
                <div key={item} className="text-sm font-bold text-blueprint-text">
                  {item}
                </div>
              ))}
            </div>

            <p className="text-xs leading-relaxed text-blueprint-text">
              Why 50g? Keeping a 50g : 50g : 50g feeding ratio helps reduce discard waste.
              You can maintain your starter at another size too, as long as the flour and water stay equal by weight.
            </p>
          </BlueprintFrame>

          <Button variant="outline" onClick={() => setGuidePage('archive')}>
            BACK
          </Button>
        </div>
      );
    }

    if (guidePage === 'using-starter') {
      return (
        <div className="space-y-8 pb-32 font-mono">
          <header className="pt-4 text-center border-b-2 border-blueprint-primary pb-4">
            <label className="text-[10px] text-blueprint-primary uppercase tracking-[3px] font-bold opacity-60">Technical Details</label>
            <h1 className="text-2xl font-bold text-blueprint-accent tracking-tight uppercase">Using Your 100% Hydration Starter</h1>
          </header>

          <BlueprintFrame className="space-y-6">
            <p className="text-xs leading-relaxed text-blueprint-text">
              When you are making bread, you may need more starter than your regular 50g : 50g : 50g maintenance feeding makes.
              In that case, feed your starter a larger but equal amount of water and flour, like 100g water plus 100g flour.
            </p>

            <p className="text-xs leading-relaxed text-blueprint-text">
              Your starter should be fully active before baking. That means it looks lively, has lots of bubbles, and has doubled in size.
              Feed it about 6-18 hours before you plan to use it, with warmer weather usually needing less time and cooler weather needing more.
            </p>

            <p className="text-xs leading-relaxed text-blueprint-text">
              If you use starter that is too young or too old after feeding, your dough may not rise well.
            </p>

            <p className="text-xs leading-relaxed text-blueprint-text">
              Forgot to feed it but still want to bake? You can use starter straight from the fridge and begin at the mix and autolyse step,
              then add 1 teaspoon of instant yeast to help the dough proof.
            </p>
          </BlueprintFrame>

          <Button variant="outline" onClick={() => setGuidePage('archive')}>
            BACK
          </Button>
        </div>
      );
    }

    if (guidePage === 'discard-crackers') {
      return (
        <div className="space-y-8 pb-32 font-mono">
          <header className="pt-4 text-center border-b-2 border-blueprint-primary pb-4">
            <label className="text-[10px] text-blueprint-primary uppercase tracking-[3px] font-bold opacity-60">Technical Details</label>
            <h1 className="text-2xl font-bold text-blueprint-accent tracking-tight uppercase">Sourdough Discard Crackers</h1>
          </header>

          <BlueprintFrame className="space-y-6">
            <div className="space-y-3 border-b border-blueprint-line border-dashed pb-4">
              {[
                '100g starter (can be cold from fridge)',
                '25g melted butter',
                '1/8 tsp table salt',
                'Seasonings to taste, optional',
              ].map((item) => (
                <div key={item} className="text-sm font-bold text-blueprint-text">
                  {item}
                </div>
              ))}
            </div>

            <div className="space-y-3 text-blueprint-text">
              {[
                'Mix all ingredients well.',
                'Spread the mixture thinly on a silicone mat over a half sheet tray using an offset spatula.',
                'Bake at 300 F for 15 minutes.',
                'Remove from the oven and score into cracker-sized squares with a pastry cutter.',
                'Return to the oven and bake another 25-30 minutes until the crackers are crisp, especially in the center.',
              ].map((step) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="pt-1 text-sm leading-none text-blueprint-text">•</span>
                  <p className="text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </BlueprintFrame>

          <Button variant="outline" onClick={() => setGuidePage('archive')}>
            BACK
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8 pb-32 font-mono">
        <header className="pt-4 text-center border-b-2 border-blueprint-primary pb-4">
          <h1 className="text-2xl font-bold text-blueprint-accent tracking-tight uppercase">Technical Details</h1>
        </header>

        <div className="space-y-0">
          {[
            { title: 'Maintenance of Starter', onClick: () => setGuidePage('maintenance') },
            { title: 'Using Your 100% Hydration Starter', onClick: () => setGuidePage('using-starter') },
            { title: 'Sourdough Discard Crackers', onClick: () => setGuidePage('discard-crackers') }
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              className="w-full flex justify-between items-center py-6 border-b border-blueprint-line border-dashed group px-2 hover:bg-blueprint-primary/5 transition-all"
            >
              <span className="text-sm font-bold tracking-tighter group-hover:translate-x-2 transition-transform uppercase italic">{item.title}</span>
              <ChevronRight size={16} strokeWidth={2} className="text-blueprint-primary opacity-60 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    return (
      <div className="space-y-8 font-mono">
        <header className="pt-4 text-center border-b-2 border-blueprint-primary pb-4">
          <label className="text-[10px] text-blueprint-primary uppercase tracking-[3px] font-bold opacity-60">System Control</label>
          <h1 className="text-2xl font-bold text-blueprint-accent tracking-tight uppercase">Configuration</h1>
        </header>

        <div className="space-y-10">
          <section>
            <div className="flex justify-between items-center border-b border-blueprint-primary pb-2 mb-6">
              <h2 className="text-[10px] font-bold text-blueprint-primary uppercase tracking-[2px]">System Metrics</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant={settings.unit === 'grams' ? 'primary' : 'outline'} onClick={() => setSettings({ ...settings, unit: 'grams' })}>GRAMS</Button>
              <Button variant={settings.unit === 'oz' ? 'primary' : 'outline'} onClick={() => setSettings({ ...settings, unit: 'oz' })}>OUNCES</Button>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center border-b border-blueprint-primary pb-2 mb-6">
              <h2 className="text-[10px] font-bold text-blueprint-primary uppercase tracking-[2px]">Temperature Unit</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant={settings.tempUnit === '°C' ? 'primary' : 'outline'} onClick={() => setSettings({ ...settings, tempUnit: '°C' })}>CELSIUS</Button>
              <Button variant={settings.tempUnit === '°F' ? 'primary' : 'outline'} onClick={() => setSettings({ ...settings, tempUnit: '°F' })}>FAHRENHEIT</Button>
            </div>
          </section>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-blueprint-bg flex flex-col relative overflow-hidden">
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0067A5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      <main className="flex-1 px-8 pt-12 pb-32 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {view === 'home' && HomeView()}
            {view === 'starter' && StarterView()}
            {view === 'bread' && BreadView()}
            {view === 'guide' && GuideView()}
            {view === 'settings' && SettingsView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeView={view} setView={setView} />
    </div>
  );
}
