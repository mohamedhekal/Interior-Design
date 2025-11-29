import React, { useState } from 'react';
import InputSection from './components/InputSection';
import ResultsSection from './components/ResultsSection';
import FloorPlanEditor from './components/FloorPlanEditor';
import { RoomSpecs, DesignResponse, FloorItem } from './types';
import { generateDesignPlan, generateDesignVisualization } from './services/geminiService';
import { Ruler, Info, MousePointer2, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [specs, setSpecs] = useState<RoomSpecs>({
    totalArea: 46,
    features: ['مطبخ بار', 'انتريه', 'حمام ضيوف', 'مكتب عمل L'],
    style: 'Modern Contemporary',
    constraints: 'السلم دوران جاي من تحت على اليمين في بداية المساحة. باب جرار ألوميتال بيبص على باقي الروف الخارجي (أرضية نجيله صناعي).',
  });

  const [floorItems, setFloorItems] = useState<FloorItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [designResult, setDesignResult] = useState<DesignResponse | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setDesignResult(null);
    setGeneratedImageUrl(null);

    try {
      // Pass floorItems if in manual mode
      const activeItems = mode === 'manual' ? floorItems : undefined;

      // 1. Generate Text Plan
      const plan = await generateDesignPlan(specs, activeItems);
      setDesignResult(plan);

      // 2. Generate Image
      try {
        const image = await generateDesignVisualization(specs, plan.conceptName, activeItems);
        setGeneratedImageUrl(image);
      } catch (imgError) {
        console.error("Image generation failed", imgError);
      }

    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إنشاء التصميم. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Ruler className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">مصمم الروف الذكي</h1>
          </div>
          <button className="text-gray-400 hover:text-primary transition">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setMode('auto')}
              className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'auto' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Sparkles className="w-4 h-4" /> المصمم الآلي
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'manual' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <MousePointer2 className="w-4 h-4" /> المصمم اليدوي
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar: Controls */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
             
             {/* Show Input Section only in Auto Mode, or minimal inputs in Manual */}
             <div className={mode === 'manual' ? 'opacity-80' : ''}>
                <InputSection 
                   specs={specs} 
                   setSpecs={setSpecs} 
                   onGenerate={handleGenerate} 
                   isGenerating={isLoading} 
                />
             </div>

             {mode === 'manual' && (
                <FloorPlanEditor items={floorItems} setItems={setFloorItems} />
             )}
             
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800">
               <p className="font-bold mb-1">نصيحة:</p>
               {mode === 'auto' 
                 ? "في مساحة 46 متر، السلم الدوران يوفر مساحة ممتازة، ويمكن استغلال أسفله للتخزين."
                 : "استخدم المصمم اليدوي لتحديد أماكن الفرش بدقة، وسيقوم الذكاء الاصطناعي بتحويل مخططك لصورة واقعية!"}
             </div>
          </div>

          {/* Right Content: Visualization & Details */}
          <div className="lg:col-span-7 xl:col-span-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            {!designResult && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-surface/50">
                <Ruler className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg">
                  {mode === 'manual' ? "قم بترتيب الأثاث ثم اضغط على زر التصميم" : "اضغط على 'صمم مساحتي الآن' لرؤية التصميم المقترح"}
                </p>
              </div>
            )}

            {(isLoading || designResult) && (
              <ResultsSection 
                design={designResult || emptyDesignPlaceholder} 
                imageUrl={generatedImageUrl} 
                isLoadingImage={isLoading && !generatedImageUrl} 
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const emptyDesignPlaceholder: DesignResponse = {
  conceptName: "جاري التحليل...",
  designPhilosophy: "...",
  spatialArrangement: "...",
  areaBreakdown: [],
  materials: [],
  lighting: "",
  furnitureRecommendations: []
};

export default App;