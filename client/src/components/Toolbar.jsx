const TOOLS= [
    { id: 'draw',  label: 'Brush',   icon: '🖌' },
    { id: 'erase', label: 'Eraser', icon: '✘' },
    { id: 'fill',  label: 'Fill',    icon: '⬙﹅' },
]

export default function Toolbar({ tool, setTool, onClear}) {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Tools</span>
            <div className="flex items-center gap-2">
                {TOOLS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTool(t.id)}
                        title={t.label}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            tool === t.id
                            ? 'bg-emerald-500 text-black font-bold'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}

                <div className="w-px h-8 bg-zinc-700 mx-1"/>

                <button
                    onClick={onClear}
                    title="Clear Canvas"
                    className="px-3 py-1.5 rounded-lg text-sm bg-zinc-800 text-red-400 hover:bg-red-950 transition-all"
                >
                    🗑 Clear
                </button>
            </div>
        </div>
    )
}