import React, { useState, useRef, useEffect } from 'react';
import { FloorItem } from '../types';
import { 
  Armchair, Briefcase, ChefHat, DoorOpen, Bath, ArrowDownToLine, 
  Undo2, Move, RotateCw, Maximize2, Columns, Lock, Unlock, Trees
} from 'lucide-react';

interface Props {
  items: FloorItem[];
  setItems: React.Dispatch<React.SetStateAction<FloorItem[]>>;
}

const INITIAL_ITEMS: FloorItem[] = [
  { id: 'stairs', type: 'stairs', label: 'سلم دوران', x: 80, y: 80, w: 15, h: 15, rotation: 0, connectivity: 'open', zone: 'indoor', color: 'bg-gray-800', icon: 'stairs' },
  { id: 'door', type: 'door', label: 'باب جرار', x: 35, y: 25, w: 30, h: 2, rotation: 0, connectivity: 'open', zone: 'indoor', color: 'bg-blue-500', icon: 'door' },
  { id: 'kitchen', type: 'kitchen', label: 'مطبخ بار', x: 60, y: 40, w: 25, h: 15, rotation: 0, connectivity: 'open', zone: 'indoor', color: 'bg-orange-200', icon: 'kitchen' },
  { id: 'sofa', type: 'sofa', label: 'انتريه', x: 10, y: 40, w: 25, h: 20, rotation: 0, connectivity: 'open', zone: 'indoor', color: 'bg-emerald-200', icon: 'sofa' },
  { id: 'desk', type: 'desk', label: 'مكتب L', x: 10, y: 10, w: 20, h: 15, rotation: 0, connectivity: 'partition', zone: 'indoor', color: 'bg-purple-200', icon: 'desk' },
  { id: 'bath', type: 'bath', label: 'حمام ضيوف', x: 75, y: 5, w: 20, h: 20, rotation: 0, connectivity: 'enclosed', zone: 'indoor', color: 'bg-cyan-100', icon: 'bath' },
  { id: 'outdoor', type: 'outdoor_seating', label: 'جلسة خارجية', x: 20, y: -15, w: 20, h: 15, rotation: 0, connectivity: 'open', zone: 'outdoor', color: 'bg-green-100', icon: 'outdoor' },
];

const FloorPlanEditor: React.FC<Props> = ({ items, setItems }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (items.length === 0) {
      setItems(INITIAL_ITEMS);
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent, id: string, currentX: number, currentY: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(id);
    const container = containerRef.current;
    if (!container) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const rect = container.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    const xPct = (clientX / rect.width) * 100;
    const yPct = (clientY / rect.height) * 100;

    setDragOffset({
      x: xPct - currentX,
      y: yPct - currentY
    });
    setActiveDragId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragId || !containerRef.current) return;
    e.preventDefault();

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    let newX = ((clientX / rect.width) * 100) - dragOffset.x;
    let newY = ((clientY / rect.height) * 100) - dragOffset.y;

    // Determine zone based on Y position (approximate visual line)
    // Let's say Y < 25 is "Outdoor" visual area in the editor context if we consider top part outdoor
    const newZone = newY < 25 ? 'outdoor' : 'indoor';

    setItems(prev => prev.map(item => 
      item.id === activeDragId ? { ...item, x: newX, y: newY, zone: newZone } : item
    ));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setActiveDragId(null);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const updateItem = (id: string, updates: Partial<FloorItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const selectedItem = items.find(i => i.id === selectedId);

  const getIcon = (type: string) => {
    switch (type) {
      case 'stairs': return <ArrowDownToLine className="w-5 h-5 text-white" />;
      case 'door': return <DoorOpen className="w-5 h-5 text-white" />;
      case 'kitchen': return <ChefHat className="w-5 h-5 text-orange-700" />;
      case 'sofa': return <Armchair className="w-5 h-5 text-emerald-700" />;
      case 'desk': return <Briefcase className="w-5 h-5 text-purple-700" />;
      case 'bath': return <Bath className="w-5 h-5 text-cyan-700" />;
      case 'outdoor_seating': return <Trees className="w-5 h-5 text-green-700" />;
      default: return <Move className="w-4 h-4" />;
    }
  };

  const getConnectivityLabel = (type: string) => {
    switch(type) {
      case 'open': return 'مفتوح (Open Plan)';
      case 'partition': return 'شبه منفصل (Partition)';
      case 'enclosed': return 'مغلق (Gated/Wall)';
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden select-none flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Move className="w-5 h-5 text-primary" />
          مخطط التوزيع
        </h2>
        <button 
          onClick={() => setItems(INITIAL_ITEMS)}
          className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-red-500 transition shadow-sm"
        >
          <Undo2 className="w-3 h-3 inline ml-1" /> إعادة ضبط
        </button>
      </div>

      {/* Editor Canvas */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden group">
        
        {/* Zones Visualization */}
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          {/* Outdoor Zone */}
          <div className="h-[25%] bg-green-50/50 border-b-2 border-dashed border-green-200 w-full flex items-center justify-center">
             <span className="text-green-600/30 font-black text-4xl tracking-widest uppercase">Outdoor</span>
          </div>
          {/* Indoor Zone */}
          <div className="h-[75%] bg-white w-full relative">
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-100 rounded-full text-[10px] text-gray-400 border border-gray-200">
               المساحة الداخلية (46م)
            </div>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="absolute inset-0 cursor-crosshair"
          onPointerMove={handlePointerMove}
        >
          {items.map((item) => {
             const isSelected = selectedId === item.id;
             // Connectivity Visuals
             const borderStyle = item.connectivity === 'enclosed' ? 'border-4 border-double border-gray-900' : 
                               item.connectivity === 'partition' ? 'border-l-4 border-gray-400' : '';
             
             return (
              <div
                key={item.id}
                onPointerDown={(e) => handlePointerDown(e, item.id, item.x, item.y)}
                onPointerUp={handlePointerUp}
                className={`absolute flex flex-col items-center justify-center shadow-sm rounded-sm transition-all
                  ${item.color} 
                  ${isSelected ? 'ring-2 ring-primary z-50 shadow-2xl scale-[1.02]' : 'z-10 hover:brightness-95'}
                  ${borderStyle}
                `}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${item.w}%`,
                  height: `${item.h}%`,
                  transform: `rotate(${item.rotation}deg)`,
                  touchAction: 'none'
                }}
              >
                <div style={{ transform: `rotate(-${item.rotation}deg)` }} className="flex flex-col items-center">
                   {getIcon(item.type)}
                   {/* Hide text if too small */}
                   {item.w > 8 && item.h > 8 && (
                      <span className="mt-1 text-[9px] font-bold whitespace-nowrap overflow-hidden text-ellipsis px-1 text-center max-w-full opacity-80">
                        {item.label}
                      </span>
                   )}
                </div>
                
                {/* Connectivity Badge */}
                {item.connectivity === 'enclosed' && (
                  <div className="absolute -top-2 -right-2 bg-gray-900 text-white p-[2px] rounded-full">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
                {item.connectivity === 'partition' && (
                  <div className="absolute -top-2 -right-2 bg-gray-400 text-white p-[2px] rounded-full">
                    <Columns className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Panel (Bottom) */}
      <div className="bg-white border-t border-gray-200 p-4 transition-all">
        {selectedItem ? (
          <div className="animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-primary flex items-center gap-2">
                 <span className={`w-3 h-3 rounded-full ${selectedItem.color}`}></span>
                 {selectedItem.label}
                 <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                   {selectedItem.zone === 'outdoor' ? 'خارجي' : 'داخلي'}
                 </span>
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {/* Dimensions */}
               <div className="space-y-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
                    <span><Maximize2 className="w-3 h-3 inline mr-1"/>الأبعاد</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400 w-6">عرض</span>
                    <input 
                      type="range" min="5" max="80" 
                      value={selectedItem.w} 
                      onChange={(e) => updateItem(selectedItem.id, { w: Number(e.target.value) })}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400 w-6">طول</span>
                    <input 
                      type="range" min="5" max="80" 
                      value={selectedItem.h} 
                      onChange={(e) => updateItem(selectedItem.id, { h: Number(e.target.value) })}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
               </div>

               {/* Properties */}
               <div className="space-y-3 p-3 bg-gray-50 rounded-xl flex flex-col justify-center">
                  {/* Rotation */}
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                       <RotateCw className="w-3 h-3"/> الاتجاه
                     </span>
                     <button 
                       onClick={() => updateItem(selectedItem.id, { rotation: (selectedItem.rotation + 90) % 360 })}
                       className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition"
                     >
                       {selectedItem.rotation}°
                     </button>
                  </div>

                  {/* Connectivity */}
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                       {selectedItem.connectivity === 'enclosed' ? <Lock className="w-3 h-3"/> : selectedItem.connectivity === 'partition' ? <Columns className="w-3 h-3"/> : <Unlock className="w-3 h-3"/>}
                       الخصوصية
                     </span>
                     <select 
                        value={selectedItem.connectivity}
                        onChange={(e) => updateItem(selectedItem.id, { connectivity: e.target.value as any })}
                        className="text-xs bg-white border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-primary"
                     >
                        <option value="open">مفتوح</option>
                        <option value="partition">بارتشن</option>
                        <option value="enclosed">مغلق (غرفة)</option>
                     </select>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
            <p>اضغط على أي عنصر للتحكم في خصائصه (الحجم، الدوران، الخصوصية)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorPlanEditor;