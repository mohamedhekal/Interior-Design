import React from 'react';
import { RoomSpecs } from '../types';
import { Compass, Pencil, Calculator, Box } from 'lucide-react';

interface Props {
  specs: RoomSpecs;
  setSpecs: React.Dispatch<React.SetStateAction<RoomSpecs>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

const InputSection: React.FC<Props> = ({ specs, setSpecs, onGenerate, isGenerating }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
        <Compass className="w-6 h-6" />
        بيانات المشروع
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
             <Calculator className="w-4 h-4 text-accent" /> المساحة الكلية (متر مربع)
          </label>
          <input
            type="number"
            value={specs.totalArea}
            onChange={(e) => setSpecs({ ...specs, totalArea: Number(e.target.value) })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Box className="w-4 h-4 text-accent" /> المناطق المطلوبة
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
             {['مطبخ بار', 'انتريه', 'حمام ضيوف', 'مكتب عمل L'].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-800 text-xs rounded-full border border-blue-100 font-medium">
                  {tag}
                </span>
             ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Pencil className="w-4 h-4 text-accent" /> تفاصيل الموقع (السلم، الباب، الإطلالة)
          </label>
          <textarea
            value={specs.constraints}
            onChange={(e) => setSpecs({ ...specs, constraints: e.target.value })}
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            placeholder="اوصف مكان السلم، نوع الباب، الإطلالة الخارجية..."
          />
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full py-4 mt-4 rounded-xl text-white font-bold text-lg shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
            isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isGenerating ? 'جاري التصميم...' : 'صمم مساحتي الآن ✨'}
        </button>
      </div>
    </div>
  );
};

export default InputSection;