const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'new-batch', label: 'New Batch', icon: PlusIcon },
    { id: 'history', label: 'History', icon: HistoryIcon },
];

function DashboardIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
    );
}

function HistoryIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
        </svg>
    );
}

function LiveIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
        </svg>
    );
}

export default function Sidebar({ activeView, onNavigate, hasActiveBatch }) {
    // Determine which items to show (include active batch if available)
    const allItems = hasActiveBatch
        ? [...navItems, { id: 'active-batch', label: 'Active', icon: LiveIcon, isBatch: true }]
        : navItems;

    return (
        <>
            {/* ─── Desktop Sidebar (lg+) ─── */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface-100/80 backdrop-blur-xl border-r border-white/5 flex-col z-50">
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/25">
                            🥜
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white tracking-tight">Peanut Chikki</h1>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Digital Twin</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            id={`nav-${id}`}
                            onClick={() => onNavigate(id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
              ${activeView === id
                                    ? 'bg-brand-500/15 text-brand-400 shadow-lg shadow-brand-500/10'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                }`}
                        >
                            <Icon />
                            {label}
                            {activeView === id && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                            )}
                        </button>
                    ))}

                    {/* Active batch shortcut */}
                    {hasActiveBatch && (
                        <button
                            id="nav-active-batch"
                            onClick={() => onNavigate('new-batch')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer mt-2 border border-emerald-500/20 ${activeView === 'new-batch'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                        >
                            <LiveIcon />
                            Active Batch
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </button>
                    )}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 text-center">v2.0 · Digital Twin</p>
                </div>
            </aside>

            {/* ─── Mobile/Tablet Bottom Nav (< lg) ─── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-100/95 backdrop-blur-xl border-t border-white/5 z-50 safe-bottom">
                <div className="flex items-center justify-around px-2 py-1">
                    {allItems.map(({ id, label, icon: Icon, isBatch }) => {
                        const navId = isBatch ? 'new-batch' : id;
                        const isActive = isBatch ? activeView === 'new-batch' : activeView === id;
                        return (
                            <button
                                key={id}
                                onClick={() => onNavigate(navId)}
                                className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all cursor-pointer min-w-0 ${isActive
                                    ? isBatch
                                        ? 'text-emerald-400'
                                        : 'text-brand-400'
                                    : 'text-gray-500'
                                    }`}
                            >
                                <div className="relative">
                                    <Icon />
                                    {isBatch && (
                                        <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    )}
                                </div>
                                <span className="text-[10px] font-semibold">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
