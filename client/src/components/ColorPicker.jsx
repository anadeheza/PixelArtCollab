const PALETTE = [
    '#000000', '#ffffff', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
    '#ec4899', '#6b7280', '#92400e', '#0e7490',
]

export default function ColorPicker({color, onChange}) {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Colors</span>
            <div className="flex items-center gap-2">
                <label className="relative cursor-pointer">
                    <div 
                        className="w-8 h-8 rounded border-2 border-zinc-600 shadow-inner"
                        style={{backgroundColor : color}}
                    />
                    <input 
                        type="color" 
                        value={color} 
                        onChange={e => onChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"    
                    />
                </label>

                <div className="flex flex-wrap gap-1 max-w-[160px]">
                    {PALETTE.map(c => (
                        <button
                            key={c}
                            onClick={() => onChange(c)}
                            className={`w-5 h-5 rounded-sm border transition-transform hover:scale-110 ${
                                color === c ? 'border-white scale-110 ring-1 ring-white' : 'border-zinc-600'
                            }`}
                            style={{backgroundColor : c}}
                            title={c}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}