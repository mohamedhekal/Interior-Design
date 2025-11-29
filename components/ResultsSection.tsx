import React from 'react';
import { DesignResponse } from '../types';
import { Layout, Lightbulb, Palette, Sofa, ArrowRight } from 'lucide-react';

interface Props {
  design: DesignResponse;
  imageUrl: string | null;
  isLoadingImage: boolean;
}

const ResultsSection: React.FC<Props> = ({ design, imageUrl, isLoadingImage }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Visual Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="relative h-64 md:h-96 w-full bg-gray-200 flex items-center justify-center">
          {isLoadingImage ? (
            <div className="text-center p-6">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium animate-pulse">جاري تخيل المساحة بالذكاء الاصطناعي...</p>
            </div>
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Generated Interior Design" 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="text-gray-400">لا توجد صورة متاحة</div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
            <h1 className="text-3xl font-bold text-white mb-2">{design.conceptName}</h1>
            <p className="text-gray-200 text-sm md:text-base line-clamp-2">{design.designPhilosophy}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Layout Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-md border-r-4 border-accent">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            تقسيم المساحة
          </h3>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed border-b pb-4">
            {design.spatialArrangement}
          </p>
          <div className="space-y-4">
            {design.areaBreakdown.map((item, idx) => (
              <div key={idx} className="bg-surface p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-primary">{item.zone}</span>
                    <span className="text-xs bg-white px-2 py-1 rounded shadow-sm text-gray-500">{item.area}</span>
                </div>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Details Column */}
        <div className="space-y-6">
            {/* Decor & Materials */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    الألوان والخامات
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {design.materials.map((mat, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg border border-gray-200">
                            {mat}
                        </span>
                    ))}
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                    <p className="text-sm text-yellow-800">{design.lighting}</p>
                </div>
            </div>

            {/* Furniture */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
                 <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Sofa className="w-5 h-5 text-primary" />
                    توزيع الأثاث المقترح
                </h3>
                <ul className="space-y-2">
                    {design.furnitureRecommendations.map((furn, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <ArrowRight className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                            {furn}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;