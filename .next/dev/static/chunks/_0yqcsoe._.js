(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WibuScriptPlayground
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lexer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/parser.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$runtime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/runtime.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
// Kumpulan template kode WibuScript bawaan
const CODE_PRESETS = {
    default: `// Program Demonstrasi WibuScript
kore nama = "Aria"
kore level = 99
kore statusPahlawan = majiBener

kasihMite("Menginisialisasi sistem WibuScript...")
tungguBentar(400)

moshi (statusPahlawan == maji) {
  mite("Karakter utama: " + nama)
  mite("Tingkat kekuatan: " + level)
} chigau {
  mite("Peringatan: Karakter tidak sah!")
}

bikinJutsu kalkulasiDaya(lvl) {
  moshi (lvl >= 50) {
    balikinDesu lvl * 10
  }
  balikinDesu lvl * 2
}

kore totalDaya = kalkulasiDaya(level)
tungguBentar(300)
kasihMite("Total daya kalkulasi: " + totalDaya)
kasihMite("Eksekusi program selesai.")`,
    aliasDemo: `// Demonstrasi Sistem Alias (Versi Ekstensi vs Shorthand)
// Versi Ekstensi (Indo-Jepang)
koreWa pahlawanA = "Subaru"
koreWa statusA = majiBener

// Versi Shorthand (Romaji Murni)
kore pahlawanB = "Aria"
kore statusB = uso

kaloMoshi (statusA == maji) {
  kasihMite("[Ekstensi] Validasi berhasil untuk: " + pahlawanA)
}

moshi (statusB == uso) {
  mite("[Shorthand] Validasi status palsu terdeteksi: " + pahlawanB)
}`,
    asyncLoop: `// Demonstrasi Async Delay dengan tungguBentar
mite("Memulai hitung mundur peluncuran:")

kore counter = 3
ulangZutto (counter > 0) {
  mite("T-minus: " + counter)
  tungguBentar(500)
  counter = counter - 1
}

kasihMite("Meluncur! Sistem berjalan optimal.")`
};
function WibuScriptPlayground() {
    _s();
    const [code, setCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(CODE_PRESETS.default ?? "");
    const [outputLog, setOutputLog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isRunning, setIsRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [executionTime, setExecutionTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [statusMessage, setStatusMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("Siap");
    const [tokenCount, setTokenCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const terminalEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Auto-scroll terminal virtual saat ada output baru
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WibuScriptPlayground.useEffect": ()=>{
            terminalEndRef.current?.scrollIntoView({
                behavior: "smooth"
            });
        }
    }["WibuScriptPlayground.useEffect"], [
        outputLog
    ]);
    // Eksekusi kode WibuScript di sisi klien (Client-Side Rendering)
    const handleRunCode = async ()=>{
        if (isRunning) return;
        setIsRunning(true);
        setOutputLog([]);
        setStatusMessage("Menjalankan...");
        const startTime = performance.now();
        try {
            // 1. Tahap Lexer (Tokenisasi)
            const tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokenize"])(code);
            setTokenCount(tokens.length);
            // 2. Tahap Parser (Penyusunan AST)
            const parser = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Parser"]();
            const program = parser.produceAST(tokens);
            // 3. Tahap Runtime & Evaluator dengan Real-Time Output Streaming
            const env = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$runtime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createGlobalEnvironment"])({
                outputHandler: (lineMessage)=>{
                    setOutputLog((prev)=>[
                            ...prev,
                            lineMessage
                        ]);
                }
            });
            const rawResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$runtime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluate"])(program, env);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$runtime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unwrapSignal"])(rawResult);
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
            setExecutionTime(duration);
            setStatusMessage("Selesai");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setOutputLog((prev)=>[
                    ...prev,
                    `[Sistem Error] ${errorMessage}`
                ]);
            setStatusMessage("Terjadi Kesalahan");
        } finally{
            setIsRunning(false);
        }
    };
    const handleClearOutput = ()=>{
        setOutputLog([]);
        setExecutionTime(null);
        setStatusMessage("Siap");
    };
    const handlePresetChange = (presetKey)=>{
        const selected = CODE_PRESETS[presetKey];
        if (selected) {
            setCode(selected);
            handleClearOutput();
        }
    };
    // Dukungan tombol Tab pada text editor
    const handleKeyDown = (e)=>{
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            void handleRunCode();
            return;
        }
        if (e.key === "Tab") {
            e.preventDefault();
            const target = e.currentTarget;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const newCode = code.substring(0, start) + "  " + code.substring(end);
            setCode(newCode);
            setTimeout(()=>{
                target.selectionStart = target.selectionEnd = start + 2;
            }, 0);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-8 h-8 rounded bg-cyan-600 flex items-center justify-center font-mono font-bold text-white text-sm shadow",
                                children: "WS"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 171,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-lg font-bold tracking-tight text-white flex items-center gap-2",
                                        children: [
                                            "WibuScript Web Playground",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-mono font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800",
                                                children: "v1.0.0-MVP"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 177,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 175,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-400",
                                        children: "Browser Engine untuk Bahasa Pemrograman Esoterik WibuScript"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 181,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 174,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs text-slate-400 font-medium",
                                children: "Template:"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 189,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                "aria-label": "Pilih Template Kode",
                                onChange: (e)=>handlePresetChange(e.target.value),
                                className: "bg-slate-800 border border-slate-700 text-xs rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "default",
                                        children: "Program Lengkap"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 195,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "aliasDemo",
                                        children: "Sistem Alias (Ekstensi vs Shorthand)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 196,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "asyncLoop",
                                        children: "Async Delay (tungguBentar)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 197,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 190,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>void handleRunCode(),
                                disabled: isRunning,
                                className: `px-4 py-1.5 rounded text-xs font-semibold shadow transition-all flex items-center gap-2 ${isRunning ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95"}`,
                                children: isRunning ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline-block w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 211,
                                            columnNumber: 17
                                        }, this),
                                        "Mengeksekusi..."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 210,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: "Jalankan Kode (Ctrl+Enter)"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 215,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 200,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 169,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 lg:p-6 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "flex flex-col rounded-lg border border-slate-800 bg-slate-900 shadow-sm overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-800/60 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Editor Kode sumber (*.wibu)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 226,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            code.split("\n").length,
                                            " baris | ",
                                            code.length,
                                            " karakter"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 227,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 225,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative flex-1 bg-slate-900",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    ref: textareaRef,
                                    value: code,
                                    onChange: (e)=>setCode(e.target.value),
                                    onKeyDown: handleKeyDown,
                                    spellCheck: false,
                                    placeholder: "Tulis kode WibuScript Anda di sini...",
                                    "aria-label": "Area Editor Kode WibuScript",
                                    className: "w-full h-full min-h-[420px] p-4 bg-transparent text-slate-200 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-0 selection:bg-cyan-900/50"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 231,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 230,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-900/90 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-500 flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Dukungan Sintaks: koreWa / kore, mite, moshi, chigau, tungguBentar"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 244,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Tab = 2 spasi"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 245,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 243,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 224,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "flex flex-col rounded-lg border border-slate-800 bg-slate-950 shadow-sm overflow-hidden font-mono",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-3 h-3 rounded-full bg-red-500/80 inline-block"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 254,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-3 h-3 rounded-full bg-amber-500/80 inline-block"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 255,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "w-3 h-3 rounded-full bg-emerald-500/80 inline-block"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 256,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "ml-2 text-slate-300 font-semibold",
                                                children: "Terminal Virtual (stdout)"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 257,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 253,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-[11px] px-2 py-0.5 rounded font-mono ${statusMessage === "Menjalankan..." ? "bg-amber-950 text-amber-400 border border-amber-800" : statusMessage === "Selesai" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : statusMessage === "Terjadi Kesalahan" ? "bg-red-950 text-red-400 border border-red-800" : "bg-slate-800 text-slate-400"}`,
                                                children: [
                                                    "Status: ",
                                                    statusMessage
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 263,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleClearOutput,
                                                className: "text-[11px] text-slate-400 hover:text-slate-200 transition-colors underline",
                                                children: "Bersihkan"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 276,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 262,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 252,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 p-4 overflow-y-auto space-y-1.5 text-xs text-slate-300 min-h-[420px] max-h-[70vh]",
                                children: [
                                    outputLog.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-full flex flex-col items-center justify-center text-slate-600 select-none py-16",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "[Terminal Siap]"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 289,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] mt-1",
                                                children: 'Klik tombol "Jalankan Kode" untuk memulai evaluasi program.'
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 290,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 288,
                                        columnNumber: 15
                                    }, this) : outputLog.map((line, index)=>{
                                        const isError = line.startsWith("[Sistem Error]") || line.startsWith("[Lexer Error]") || line.startsWith("[Parser Error]") || line.startsWith("[Runtime Error]");
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `flex items-start gap-2 leading-relaxed ${isError ? "text-red-400 bg-red-950/20 px-1 rounded" : "text-slate-200"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-slate-600 select-none",
                                                    children: ">"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 304,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                    className: "whitespace-pre-wrap break-all font-mono",
                                                    children: line
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 305,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, index, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 298,
                                            columnNumber: 19
                                        }, this);
                                    }),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        ref: terminalEndRef
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 312,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 286,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-900/60 border-t border-slate-800/80 px-4 py-2 text-[11px] text-slate-500 flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: executionTime !== null ? `Waktu Eksekusi: ${executionTime} ms` : "Menunggu eksekusi..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 317,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: tokenCount !== null ? `Total Token: ${tokenCount}` : ""
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 322,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 316,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 250,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 222,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "border-t border-slate-900 bg-slate-950 px-6 py-3 text-center text-xs text-slate-600",
                children: "WibuScript Core Engine & Web Playground. Arsitektur Kompiler Berbasis TypeScript."
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 330,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 167,
        columnNumber: 5
    }, this);
}
_s(WibuScriptPlayground, "9/2oPcKvuHVDuK+uClmd9yeo2jU=");
_c = WibuScriptPlayground;
var _c;
__turbopack_context__.k.register(_c, "WibuScriptPlayground");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/src/ast.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================================================
// WIBUSCRIPT ABSTRACT SYNTAX TREE (AST) DEFINITIONS
// Mendefinisikan struktur simpul pohon sintaksis abstrak WibuScript.
// ============================================================================
__turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "runWibuScript",
    ()=>runWibuScript
]);
// ============================================================================
// WIBUSCRIPT CORE ENGINE ENTRY POINT
// Ekspor modul murni WibuScript (Lexer, Parser, AST, Runtime, Environment).
// 100% aman untuk lingkungan Web Browser dan Client Components (Next.js).
// ============================================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lexer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/parser.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$runtime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/runtime.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ast.ts [app-client] (ecmascript)");
;
;
;
;
;
async function runWibuScript(sourceCode) {
    const tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokenize"])(sourceCode);
    const parser = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Parser"]();
    const program = parser.produceAST(tokens);
    const environment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$runtime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createGlobalEnvironment"])();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$runtime$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["evaluate"])(program, environment);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lexer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================================================
// WIBUSCRIPT LEXER (TOKENIZER)
// Mengubah teks kode sumber WibuScript menjadi aliran token terstruktur.
// Mendukung Sistem Alias (Versi Ekstensi Indo-Jepang dan Shorthand Romaji Murni)
// serta operator perbandingan ganda (==, !=, <=, >=).
// ============================================================================
__turbopack_context__.s([
    "KEYWORDS",
    ()=>KEYWORDS,
    "TokenType",
    ()=>TokenType,
    "tokenize",
    ()=>tokenize
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var TokenType = /*#__PURE__*/ function(TokenType) {
    // Keywords Dasar (Sistem Alias)
    TokenType[TokenType["Var"] = 0] = "Var";
    TokenType[TokenType["Print"] = 1] = "Print";
    TokenType[TokenType["If"] = 2] = "If";
    TokenType[TokenType["Else"] = 3] = "Else";
    TokenType[TokenType["True"] = 4] = "True";
    TokenType[TokenType["False"] = 5] = "False";
    TokenType[TokenType["Null"] = 6] = "Null";
    TokenType[TokenType["Loop"] = 7] = "Loop";
    TokenType[TokenType["Function"] = 8] = "Function";
    TokenType[TokenType["Return"] = 9] = "Return";
    // Tipe Data & Identifier
    TokenType[TokenType["Identifier"] = 10] = "Identifier";
    TokenType[TokenType["Number"] = 11] = "Number";
    TokenType[TokenType["String"] = 12] = "String";
    // Operator Penugasan & Perbandingan
    TokenType[TokenType["Equals"] = 13] = "Equals";
    TokenType[TokenType["DoubleEquals"] = 14] = "DoubleEquals";
    TokenType[TokenType["NotEquals"] = 15] = "NotEquals";
    TokenType[TokenType["LessThan"] = 16] = "LessThan";
    TokenType[TokenType["LessEquals"] = 17] = "LessEquals";
    TokenType[TokenType["GreaterThan"] = 18] = "GreaterThan";
    TokenType[TokenType["GreaterEquals"] = 19] = "GreaterEquals";
    // Operator Aritmatika
    TokenType[TokenType["Plus"] = 20] = "Plus";
    TokenType[TokenType["Minus"] = 21] = "Minus";
    TokenType[TokenType["Multiply"] = 22] = "Multiply";
    TokenType[TokenType["Divide"] = 23] = "Divide";
    // Simbol & Delimiter
    TokenType[TokenType["OpenParen"] = 24] = "OpenParen";
    TokenType[TokenType["CloseParen"] = 25] = "CloseParen";
    TokenType[TokenType["OpenBrace"] = 26] = "OpenBrace";
    TokenType[TokenType["CloseBrace"] = 27] = "CloseBrace";
    TokenType[TokenType["Comma"] = 28] = "Comma";
    TokenType[TokenType["Semicolon"] = 29] = "Semicolon";
    // Akhir Berkas
    TokenType[TokenType["EOF"] = 30] = "EOF"; // End of File
    return TokenType;
}({});
const KEYWORDS = {
    // Variabel
    "koreWa": 0,
    "kore": 0,
    // Output Standar
    "kasihMite": 1,
    "mite": 1,
    // Percabangan
    "kaloMoshi": 2,
    "moshi": 2,
    "chigauDong": 3,
    "chigau": 3,
    // Boolean Literals
    "majiBener": 4,
    "maji": 4,
    "usoBanget": 5,
    "uso": 5,
    // Null Literal
    "kosongZannen": 6,
    "kara": 6,
    // Perulangan
    "ulangZutto": 7,
    "zutto": 7,
    // Fungsi
    "bikinJutsu": 8,
    "jutsu": 8,
    // Pengembalian Nilai (Return)
    "balikinDesu": 9,
    "kaesu": 9
};
function tokenize(sourceCode) {
    const tokens = [];
    const src = sourceCode.split("");
    let line = 1;
    let column = 1;
    const isAlpha = (char)=>/^[a-zA-Z_]$/.test(char);
    const isInt = (char)=>/^[0-9]$/.test(char);
    const isSkippable = (char)=>char === " " || char === "\n" || char === "\t" || char === "\r";
    while(src.length > 0){
        const current = src[0];
        const currentLine = line;
        const currentCol = column;
        // 1. Abaikan Whitespace (Spasi, Tab, Enter)
        if (isSkippable(current)) {
            const char = src.shift();
            if (char === "\n") {
                line++;
                column = 1;
            } else {
                column++;
            }
            continue;
        }
        // 2. Pembagian dan Komentar
        if (current === "/") {
            if (src[1] === "/") {
                // Komentar satu baris
                src.shift(); // '/'
                src.shift(); // '/'
                column += 2;
                while(src.length > 0 && src[0] !== "\n"){
                    src.shift();
                    column++;
                }
                continue;
            }
            if (src[1] === "*") {
                // Komentar multi-baris
                src.shift(); // '/'
                src.shift(); // '*'
                column += 2;
                while(src.length > 0){
                    const c = src.shift();
                    if (c === "\n") {
                        line++;
                        column = 1;
                    } else if (c === "*" && src[0] === "/") {
                        src.shift(); // '/'
                        column++;
                        break;
                    } else {
                        column++;
                    }
                }
                continue;
            }
            // Operator Bagi '/'
            tokens.push({
                type: 23,
                value: src.shift(),
                line: currentLine,
                column: currentCol
            });
            column++;
            continue;
        }
        // 3. Operator Perbandingan Ganda & Penugasan (==, !=, <=, >=, =, <, >)
        if (current === "=") {
            src.shift();
            column++;
            if (src.length > 0 && src[0] === "=") {
                src.shift();
                column++;
                tokens.push({
                    type: 14,
                    value: "==",
                    line: currentLine,
                    column: currentCol
                });
            } else {
                tokens.push({
                    type: 13,
                    value: "=",
                    line: currentLine,
                    column: currentCol
                });
            }
            continue;
        }
        if (current === "!") {
            src.shift();
            column++;
            if (src.length > 0 && src[0] === "=") {
                src.shift();
                column++;
                tokens.push({
                    type: 15,
                    value: "!=",
                    line: currentLine,
                    column: currentCol
                });
            } else {
                throw new Error(`[Lexer Error] Karakter '!' tunggal tidak didukung pada baris ${currentLine}, kolom ${currentCol}. Gunakan '!='.`);
            }
            continue;
        }
        if (current === "<") {
            src.shift();
            column++;
            if (src.length > 0 && src[0] === "=") {
                src.shift();
                column++;
                tokens.push({
                    type: 17,
                    value: "<=",
                    line: currentLine,
                    column: currentCol
                });
            } else {
                tokens.push({
                    type: 16,
                    value: "<",
                    line: currentLine,
                    column: currentCol
                });
            }
            continue;
        }
        if (current === ">") {
            src.shift();
            column++;
            if (src.length > 0 && src[0] === "=") {
                src.shift();
                column++;
                tokens.push({
                    type: 19,
                    value: ">=",
                    line: currentLine,
                    column: currentCol
                });
            } else {
                tokens.push({
                    type: 18,
                    value: ">",
                    line: currentLine,
                    column: currentCol
                });
            }
            continue;
        }
        // 4. Operator Aritmatika (+, -, *, /)
        if (current === "+") {
            tokens.push({
                type: 20,
                value: src.shift(),
                line: currentLine,
                column: currentCol
            });
            column++;
            continue;
        }
        if (current === "-") {
            tokens.push({
                type: 21,
                value: src.shift(),
                line: currentLine,
                column: currentCol
            });
            column++;
            continue;
        }
        if (current === "*") {
            tokens.push({
                type: 22,
                value: src.shift(),
                line: currentLine,
                column: currentCol
            });
            column++;
            continue;
        }
        // 5. Simbol dan Delimiter
        if (current === "(") {
            tokens.push({
                type: 24,
                value: src.shift(),
                line: currentLine,
                column: currentCol
            });
            column++;
            continue;
        }
        if (current === ")") {
            tokens.push({
                type: 25,
                value: src.shift(),
                line: currentLine,
                column: currentCol
            });
            column++;
            continue;
        }
        if (current === "{") {
            tokens.push({
                type: 26,
                value: src.shift(),
                line: currentLine,
                column: currentCol
            });
            column++;
            continue;
        }
        if (current === "}") {
            tokens.push({
                type: 27,
                value: src.shift(),
                line: currentLine,
                column: currentCol
            });
            column++;
            continue;
        }
        if (current === ",") {
            tokens.push({
                type: 28,
                value: src.shift(),
                line: currentLine,
                column: currentCol
            });
            column++;
            continue;
        }
        if (current === ";") {
            tokens.push({
                type: 29,
                value: src.shift(),
                line: currentLine,
                column: currentCol
            });
            column++;
            continue;
        }
        // 6. Deteksi Literal String ("..." atau '...')
        if (current === '"' || current === "'") {
            const quoteType = src.shift();
            column++;
            let str = "";
            while(src.length > 0 && src[0] !== quoteType){
                if (src[0] === "\n") {
                    line++;
                    column = 1;
                    str += src.shift();
                } else if (src[0] === "\\") {
                    src.shift(); // Lewati backslash
                    column++;
                    if (src.length === 0) break;
                    const esc = src.shift();
                    column++;
                    if (esc === "n") str += "\n";
                    else if (esc === "t") str += "\t";
                    else if (esc === "r") str += "\r";
                    else if (esc === "\\") str += "\\";
                    else if (esc === '"') str += '"';
                    else if (esc === "'") str += "'";
                    else str += esc;
                } else {
                    str += src.shift();
                    column++;
                }
            }
            if (src.length === 0) {
                throw new Error(`[Lexer Error] Literal string belum ditutup sebelum akhir berkas pada baris ${currentLine}, kolom ${currentCol}.`);
            }
            src.shift(); // Buang tanda kutip penutup
            column++;
            tokens.push({
                type: 12,
                value: str,
                line: currentLine,
                column: currentCol
            });
            continue;
        }
        // 7. Deteksi Literal Numerik (Integer & Desimal)
        if (isInt(current)) {
            let num = "";
            while(src.length > 0 && isInt(src[0])){
                num += src.shift();
                column++;
            }
            if (src[0] === "." && src.length > 1 && isInt(src[1])) {
                num += src.shift(); // tanda titik '.'
                column++;
                while(src.length > 0 && isInt(src[0])){
                    num += src.shift();
                    column++;
                }
            }
            tokens.push({
                type: 11,
                value: num,
                line: currentLine,
                column: currentCol
            });
            continue;
        }
        // 8. Deteksi Kata (Identifier atau Kata Kunci)
        if (isAlpha(current)) {
            let ident = "";
            while(src.length > 0 && (isAlpha(src[0]) || isInt(src[0]))){
                ident += src.shift();
                column++;
            }
            const reserved = KEYWORDS[ident];
            if (typeof reserved === "number") {
                tokens.push({
                    type: reserved,
                    value: ident,
                    line: currentLine,
                    column: currentCol
                });
            } else {
                tokens.push({
                    type: 10,
                    value: ident,
                    line: currentLine,
                    column: currentCol
                });
            }
            continue;
        }
        // Karakter Tidak Dikenali
        const badChar = src.shift();
        throw new Error(`[Lexer Error] Karakter tidak dikenali: '${badChar}' pada baris ${currentLine}, kolom ${currentCol}.`);
    }
    tokens.push({
        type: 30,
        value: "EndOfFile",
        line,
        column
    });
    return tokens;
}
// ============================================================================
// AREA UJI COBA (Jalankan file ini untuk mengetes)
// ============================================================================
const kodeUjiCoba = `
  kore mc = "Aria"
  moshi (mc == "Aria") {
      mite(mc)
  }
`;
if (typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] !== "undefined" && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].argv && (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].argv[1]?.endsWith("lexer.ts") || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].argv[1]?.endsWith("lexer.js"))) {
    console.log("[WibuScript Lexer] Membaca kode pengujian...");
    for (const token of tokenize(kodeUjiCoba)){
        console.log(token);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/parser.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================================================
// WIBUSCRIPT PARSER
// Mengonversi aliran token menjadi pohon sintaksis abstrak (AST).
// Mendukung Deklarasi Variabel, Percabangan Kondisional, Pemanggilan Fungsi,
// dan Ekspresi Logika/Aritmatika dengan Sistem Alias.
// ============================================================================
__turbopack_context__.s([
    "Parser",
    ()=>Parser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lexer.ts [app-client] (ecmascript)");
;
class Parser {
    tokens = [];
    cursor = 0;
    /**
   * Menghasilkan pohon sintaksis program (Program AST) dari daftar token.
   */ produceAST(tokens) {
        this.tokens = tokens;
        this.cursor = 0;
        const program = {
            kind: "Program",
            body: []
        };
        while(!this.isAtEnd()){
            program.body.push(this.parseStatement());
        }
        return program;
    }
    isAtEnd() {
        return this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].EOF;
    }
    at() {
        const token = this.tokens[this.cursor];
        if (!token) {
            return {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].EOF,
                value: "EndOfFile",
                line: 0,
                column: 0
            };
        }
        return token;
    }
    advance() {
        const prev = this.at();
        this.cursor++;
        return prev;
    }
    expect(type, errMessage) {
        const currentToken = this.advance();
        if (currentToken.type !== type) {
            throw new Error(`[Parser Error] ${errMessage} Ditemukan '${currentToken.value}' pada baris ${currentToken.line}, kolom ${currentToken.column}.`);
        }
        return currentToken;
    }
    // --------------------------------------------------------------------------
    // STATEMENTS PARSING
    // --------------------------------------------------------------------------
    parseStatement() {
        switch(this.at().type){
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Var:
                return this.parseVariableDeclaration();
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].If:
                return this.parseIfStatement();
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Loop:
                return this.parseLoopStatement();
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Function:
                return this.parseFunctionDeclaration();
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Return:
                return this.parseReturnStatement();
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].OpenBrace:
                return this.parseBlockStatement();
            default:
                return this.parseExpressionStatement();
        }
    }
    /**
   * Deklarasi variabel: kore nama = nilai / koreWa nama = nilai
   */ parseVariableDeclaration() {
        this.advance(); // Konsumsi 'kore' atau 'koreWa'
        const identToken = this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Identifier, "Diharapkan nama variabel setelah kata kunci deklarasi.");
        this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Equals, "Diharapkan tanda '=' setelah nama variabel.");
        const value = this.parseExpression();
        if (this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Semicolon) {
            this.advance();
        }
        return {
            kind: "VariableDeclaration",
            identifier: identToken.value,
            value
        };
    }
    /**
   * Percabangan kondisional: moshi (kondisi) { ... } chigau { ... }
   */ parseIfStatement() {
        this.advance(); // Konsumsi 'moshi' atau 'kaloMoshi'
        this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].OpenParen, "Diharapkan tanda kurung buka '(' setelah kata kunci kondisi.");
        const condition = this.parseExpression();
        this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].CloseParen, "Diharapkan tanda kurung tutup ')' setelah ekspresi kondisi.");
        const thenBranch = this.parseBlockOrSingleStatement();
        let elseBranch = undefined;
        if (this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Else) {
            this.advance(); // Konsumsi 'chigau' atau 'chigauDong'
            elseBranch = this.parseBlockOrSingleStatement();
        }
        return {
            kind: "IfStatement",
            condition,
            thenBranch,
            elseBranch
        };
    }
    /**
   * Perulangan: zutto (kondisi) { ... } / ulangZutto (kondisi) { ... }
   */ parseLoopStatement() {
        this.advance(); // Konsumsi 'zutto' atau 'ulangZutto'
        this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].OpenParen, "Diharapkan '(' setelah kata kunci perulangan.");
        const condition = this.parseExpression();
        this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].CloseParen, "Diharapkan ')' setelah kondisi perulangan.");
        const body = this.parseBlockOrSingleStatement();
        return {
            kind: "LoopStatement",
            condition,
            body
        };
    }
    /**
   * Deklarasi fungsi: jutsu nama(param1, param2) { ... }
   */ parseFunctionDeclaration() {
        this.advance(); // Konsumsi 'jutsu' atau 'bikinJutsu'
        const nameToken = this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Identifier, "Diharapkan nama fungsi.");
        this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].OpenParen, "Diharapkan '(' setelah nama fungsi.");
        const parameters = [];
        if (this.at().type !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].CloseParen) {
            parameters.push(this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Identifier, "Diharapkan nama parameter.").value);
            while(this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Comma){
                this.advance();
                parameters.push(this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Identifier, "Diharapkan nama parameter setelah tanda koma.").value);
            }
        }
        this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].CloseParen, "Diharapkan ')' setelah daftar parameter.");
        const body = this.parseBlockOrSingleStatement();
        return {
            kind: "FunctionDeclaration",
            name: nameToken.value,
            parameters,
            body
        };
    }
    /**
   * Pengembalian nilai: kaesu nilai / balikinDesu nilai
   */ parseReturnStatement() {
        this.advance(); // Konsumsi 'kaesu' atau 'balikinDesu'
        let value = undefined;
        if (this.at().type !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Semicolon && this.at().type !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].CloseBrace && this.at().type !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].EOF) {
            value = this.parseExpression();
        }
        if (this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Semicolon) {
            this.advance();
        }
        return {
            kind: "ReturnStatement",
            value
        };
    }
    /**
   * Blok kode: { statement1; statement2; }
   */ parseBlockStatement() {
        this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].OpenBrace, "Diharapkan '{' pada awal blok.");
        const body = [];
        while(this.at().type !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].CloseBrace && !this.isAtEnd()){
            body.push(this.parseStatement());
        }
        this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].CloseBrace, "Diharapkan '}' pada akhir blok.");
        return {
            kind: "BlockStatement",
            body
        };
    }
    parseBlockOrSingleStatement() {
        if (this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].OpenBrace) {
            const block = this.parseBlockStatement();
            return block.body;
        }
        return [
            this.parseStatement()
        ];
    }
    /**
   * Pernyataan ekspresi (misal: pemanggilan fungsi mite(x);)
   */ parseExpressionStatement() {
        const expression = this.parseExpression();
        if (this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Semicolon) {
            this.advance();
        }
        return {
            kind: "ExpressionStatement",
            expression
        };
    }
    // --------------------------------------------------------------------------
    // EXPRESSIONS PARSING
    // --------------------------------------------------------------------------
    parseExpression() {
        return this.parseAssignmentExpression();
    }
    /**
   * Penugasan nilai: variabel = nilai
   */ parseAssignmentExpression() {
        const left = this.parseComparisonExpression();
        if (this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Equals) {
            this.advance(); // Konsumsi '='
            const value = this.parseAssignmentExpression();
            if (left.kind !== "Identifier") {
                throw new Error("[Parser Error] Sisi kiri dari tanda penugasan '=' harus berupa identifier variabel.");
            }
            return {
                kind: "AssignmentExpression",
                assignee: left.symbol,
                value
            };
        }
        return left;
    }
    /**
   * Operator perbandingan: ==, !=, <, <=, >, >=
   */ parseComparisonExpression() {
        let left = this.parseAdditiveExpression();
        while(this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].DoubleEquals || this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].NotEquals || this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].LessThan || this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].LessEquals || this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].GreaterThan || this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].GreaterEquals){
            const operator = this.advance().value;
            const right = this.parseAdditiveExpression();
            left = {
                kind: "BinaryExpression",
                left,
                operator,
                right
            };
        }
        return left;
    }
    /**
   * Operator penjumlahan dan pengurangan: +, -
   */ parseAdditiveExpression() {
        let left = this.parseMultiplicativeExpression();
        while(this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Plus || this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Minus){
            const operator = this.advance().value;
            const right = this.parseMultiplicativeExpression();
            left = {
                kind: "BinaryExpression",
                left,
                operator,
                right
            };
        }
        return left;
    }
    /**
   * Operator perkalian dan pembagian: *, /
   */ parseMultiplicativeExpression() {
        let left = this.parseCallMemberExpression();
        while(this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Multiply || this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Divide){
            const operator = this.advance().value;
            const right = this.parseCallMemberExpression();
            left = {
                kind: "BinaryExpression",
                left,
                operator,
                right
            };
        }
        return left;
    }
    /**
   * Pemanggilan fungsi: fn() atau mite()
   */ parseCallMemberExpression() {
        const member = this.parsePrimaryExpression();
        if (this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].OpenParen) {
            return this.parseCallExpression(member);
        }
        return member;
    }
    parseCallExpression(caller) {
        if (caller.kind !== "Identifier") {
            throw new Error("[Parser Error] Target pemanggilan fungsi harus berupa identifier.");
        }
        const callee = caller.symbol;
        const args = this.parseArgs();
        return {
            kind: "CallExpression",
            callee,
            args
        };
    }
    parseArgs() {
        this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].OpenParen, "Diharapkan '(' sebelum daftar argumen.");
        const args = [];
        if (this.at().type !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].CloseParen) {
            args.push(this.parseExpression());
            while(this.at().type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Comma){
                this.advance();
                args.push(this.parseExpression());
            }
        }
        this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].CloseParen, "Diharapkan ')' setelah daftar argumen.");
        return args;
    }
    /**
   * Elemen ekspresi dasar: Identifier, Literal, Tanda Kurung
   */ parsePrimaryExpression() {
        const token = this.at();
        switch(token.type){
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Identifier:
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Print:
                // 'mite' atau 'kasihMite' dapat berperan sebagai nama fungsi pemanggilan
                return {
                    kind: "Identifier",
                    symbol: this.advance().value
                };
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Number:
                return {
                    kind: "NumericLiteral",
                    value: parseFloat(this.advance().value)
                };
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].String:
                return {
                    kind: "StringLiteral",
                    value: this.advance().value
                };
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].True:
                this.advance();
                return {
                    kind: "BooleanLiteral",
                    value: true
                };
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].False:
                this.advance();
                return {
                    kind: "BooleanLiteral",
                    value: false
                };
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].Null:
                this.advance();
                return {
                    kind: "NullLiteral",
                    value: null
                };
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].OpenParen:
                {
                    this.advance(); // Konsumsi '('
                    const value = this.parseExpression();
                    this.expect(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TokenType"].CloseParen, "Diharapkan tanda kurung tutup ')' setelah ekspresi.");
                    return value;
                }
            default:
                throw new Error(`[Parser Error] Simbol tidak terduga: '${token.value}' pada baris ${token.line}, kolom ${token.column}.`);
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/runtime.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============================================================================
// WIBUSCRIPT RUNTIME & EVALUATOR
// Mesin Tree-Walking Interpreter untuk mengeksekusi AST WibuScript
// dalam lingkungan eksekusi Node.js maupun Web Browser.
// Dilengkapi mekanisme penangkap output (output capture) dan pustaka standar async.
// ============================================================================
__turbopack_context__.s([
    "Environment",
    ()=>Environment,
    "MK_BOOL",
    ()=>MK_BOOL,
    "MK_NATIVE_FN",
    ()=>MK_NATIVE_FN,
    "MK_NULL",
    ()=>MK_NULL,
    "MK_NUMBER",
    ()=>MK_NUMBER,
    "MK_STRING",
    ()=>MK_STRING,
    "createGlobalEnvironment",
    ()=>createGlobalEnvironment,
    "evaluate",
    ()=>evaluate,
    "formatRuntimeValue",
    ()=>formatRuntimeValue,
    "runWibuScriptAsync",
    ()=>runWibuScriptAsync,
    "unwrapSignal",
    ()=>unwrapSignal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lexer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/parser.ts [app-client] (ecmascript)");
;
;
function MK_NULL() {
    return {
        type: "null",
        value: null
    };
}
_c = MK_NULL;
function MK_NUMBER(n = 0) {
    return {
        type: "number",
        value: n
    };
}
_c1 = MK_NUMBER;
function MK_BOOL(b = true) {
    return {
        type: "boolean",
        value: b
    };
}
_c2 = MK_BOOL;
function MK_STRING(s = "") {
    return {
        type: "string",
        value: s
    };
}
_c3 = MK_STRING;
function MK_NATIVE_FN(call) {
    return {
        type: "native-fn",
        call
    };
}
_c4 = MK_NATIVE_FN;
function formatRuntimeValue(val) {
    switch(val.type){
        case "string":
            return val.value;
        case "number":
            return String(val.value);
        case "boolean":
            return val.value ? "true" : "false";
        case "null":
            return "null";
        case "native-fn":
            return "[NativeFunction]";
        case "function":
            return `[Function: ${val.name}]`;
        default:
            return "undefined";
    }
}
class Environment {
    parent;
    variables;
    constructor(parentEnv){
        this.parent = parentEnv;
        this.variables = new Map();
    }
    declareVar(name, value) {
        if (this.variables.has(name)) {
            throw new Error(`[Runtime Error] Variabel '${name}' sudah dideklarasikan pada lingkup ini.`);
        }
        this.variables.set(name, value);
        return value;
    }
    assignVar(name, value) {
        const env = this.resolve(name);
        env.variables.set(name, value);
        return value;
    }
    lookupVar(name) {
        const env = this.resolve(name);
        const value = env.variables.get(name);
        if (!value) {
            throw new Error(`[Runtime Error] Variabel '${name}' tidak terdefinisi.`);
        }
        return value;
    }
    resolve(name) {
        if (this.variables.has(name)) {
            return this;
        }
        if (this.parent) {
            return this.parent.resolve(name);
        }
        throw new Error(`[Runtime Error] Variabel '${name}' belum dideklarasikan.`);
    }
}
function createGlobalEnvironment(optionsOrHandler) {
    const env = new Environment();
    let outputHandler;
    let logArray;
    if (typeof optionsOrHandler === "function") {
        outputHandler = optionsOrHandler;
    } else if (optionsOrHandler) {
        outputHandler = optionsOrHandler.outputHandler;
        logArray = optionsOrHandler.outputLog;
    }
    // 1. Output Standar: mite() / kasihMite() / print()
    const printFn = MK_NATIVE_FN((args)=>{
        const formatted = args.map((arg)=>formatRuntimeValue(arg)).join(" ");
        if (outputHandler) {
            outputHandler(formatted);
        } else if (logArray) {
            logArray.push(formatted);
        } else {
            console.log(formatted);
        }
        return MK_NULL();
    });
    env.declareVar("mite", printFn);
    env.declareVar("kasihMite", printFn);
    env.declareVar("print", printFn);
    // 2. Pustaka Standar: tungguBentar (Asynchronous Delay)
    const tungguBentarFn = MK_NATIVE_FN(async (args)=>{
        const firstArg = args[0];
        const delayMs = firstArg && firstArg.type === "number" ? firstArg.value : 1000;
        await new Promise((resolve)=>setTimeout(resolve, delayMs));
        return MK_NULL();
    });
    env.declareVar("tungguBentar", tungguBentarFn);
    // 3. Konstanta Bawaan
    env.declareVar("maji", MK_BOOL(true));
    env.declareVar("majiBener", MK_BOOL(true));
    env.declareVar("uso", MK_BOOL(false));
    env.declareVar("usoBanget", MK_BOOL(false));
    env.declareVar("kara", MK_NULL());
    env.declareVar("kosongZannen", MK_NULL());
    return env;
}
async function evaluate(astNode, env) {
    switch(astNode.kind){
        case "Program":
            return await evalProgram(astNode, env);
        case "VariableDeclaration":
            return await evalVariableDeclaration(astNode, env);
        case "FunctionDeclaration":
            return evalFunctionDeclaration(astNode, env);
        case "IfStatement":
            return await evalIfStatement(astNode, env);
        case "LoopStatement":
            return await evalLoopStatement(astNode, env);
        case "ReturnStatement":
            return await evalReturnStatement(astNode, env);
        case "BlockStatement":
            return await evalBlockStatement(astNode, env);
        case "ExpressionStatement":
            return await evalExpressionStatement(astNode, env);
        case "AssignmentExpression":
            return await evalAssignment(astNode, env);
        case "BinaryExpression":
            return await evalBinaryExpression(astNode, env);
        case "CallExpression":
            return await evalCallExpression(astNode, env);
        case "Identifier":
            return evalIdentifier(astNode, env);
        case "NumericLiteral":
            return MK_NUMBER(astNode.value);
        case "StringLiteral":
            return MK_STRING(astNode.value);
        case "BooleanLiteral":
            return MK_BOOL(astNode.value);
        case "NullLiteral":
            return MK_NULL();
        default:
            throw new Error(`[Runtime Error] Simpul AST '${astNode.kind}' belum didukung.`);
    }
}
function isReturnSignal(val) {
    return typeof val === "object" && val !== null && "isReturn" in val && val.isReturn === true;
}
function unwrapSignal(val) {
    if (isReturnSignal(val)) {
        return val.value;
    }
    return val;
}
function isTruthy(val) {
    switch(val.type){
        case "boolean":
            return val.value;
        case "number":
            return val.value !== 0;
        case "string":
            return val.value.length > 0;
        case "null":
            return false;
        default:
            return true;
    }
}
async function evalProgram(program, env) {
    let lastEvaluated = MK_NULL();
    for (const statement of program.body){
        const result = await evaluate(statement, env);
        if (isReturnSignal(result)) {
            return result.value;
        }
        lastEvaluated = result;
    }
    return lastEvaluated;
}
async function evalVariableDeclaration(declaration, env) {
    const value = unwrapSignal(await evaluate(declaration.value, env));
    return env.declareVar(declaration.identifier, value);
}
function evalFunctionDeclaration(declaration, env) {
    const fn = {
        type: "function",
        name: declaration.name,
        parameters: declaration.parameters,
        declarationEnv: env,
        body: declaration.body
    };
    return env.declareVar(declaration.name, fn);
}
async function evalIfStatement(stmt, env) {
    const conditionValue = unwrapSignal(await evaluate(stmt.condition, env));
    if (isTruthy(conditionValue)) {
        const scope = new Environment(env);
        for (const s of stmt.thenBranch){
            const result = await evaluate(s, scope);
            if (isReturnSignal(result)) return result;
        }
    } else if (stmt.elseBranch) {
        const scope = new Environment(env);
        for (const s of stmt.elseBranch){
            const result = await evaluate(s, scope);
            if (isReturnSignal(result)) return result;
        }
    }
    return MK_NULL();
}
async function evalLoopStatement(stmt, env) {
    let lastVal = MK_NULL();
    while(isTruthy(unwrapSignal(await evaluate(stmt.condition, env)))){
        const scope = new Environment(env);
        for (const s of stmt.body){
            const result = await evaluate(s, scope);
            if (isReturnSignal(result)) return result;
            lastVal = result;
        }
    }
    return lastVal;
}
async function evalReturnStatement(stmt, env) {
    let value = MK_NULL();
    if (stmt.value) {
        value = unwrapSignal(await evaluate(stmt.value, env));
    }
    return {
        isReturn: true,
        value
    };
}
async function evalBlockStatement(block, env) {
    const scope = new Environment(env);
    let lastVal = MK_NULL();
    for (const s of block.body){
        const result = await evaluate(s, scope);
        if (isReturnSignal(result)) return result;
        lastVal = result;
    }
    return lastVal;
}
async function evalExpressionStatement(stmt, env) {
    return await evaluate(stmt.expression, env);
}
function evalIdentifier(ident, env) {
    return env.lookupVar(ident.symbol);
}
async function evalAssignment(node, env) {
    const value = unwrapSignal(await evaluate(node.value, env));
    return env.assignVar(node.assignee, value);
}
async function evalBinaryExpression(binop, env) {
    const left = unwrapSignal(await evaluate(binop.left, env));
    const right = unwrapSignal(await evaluate(binop.right, env));
    if (binop.operator === "+") {
        if (left.type === "string" || right.type === "string") {
            return MK_STRING(formatRuntimeValue(left) + formatRuntimeValue(right));
        }
        if (left.type === "number" && right.type === "number") {
            return MK_NUMBER(left.value + right.value);
        }
        throw new Error("[Runtime Error] Operator '+' hanya mendukung tipe Number dan String.");
    }
    if (left.type === "number" && right.type === "number") {
        const l = left.value;
        const r = right.value;
        switch(binop.operator){
            case "-":
                return MK_NUMBER(l - r);
            case "*":
                return MK_NUMBER(l * r);
            case "/":
                if (r === 0) {
                    throw new Error("[Runtime Error] Pembagian dengan angka nol.");
                }
                return MK_NUMBER(l / r);
            case "<":
                return MK_BOOL(l < r);
            case "<=":
                return MK_BOOL(l <= r);
            case ">":
                return MK_BOOL(l > r);
            case ">=":
                return MK_BOOL(l >= r);
        }
    }
    if (binop.operator === "==") {
        if (left.type !== right.type) {
            return MK_BOOL(false);
        }
        switch(left.type){
            case "number":
                return MK_BOOL(left.value === right.value);
            case "string":
                return MK_BOOL(left.value === right.value);
            case "boolean":
                return MK_BOOL(left.value === right.value);
            case "null":
                return MK_BOOL(true);
            default:
                return MK_BOOL(left === right);
        }
    }
    if (binop.operator === "!=") {
        if (left.type !== right.type) {
            return MK_BOOL(true);
        }
        switch(left.type){
            case "number":
                return MK_BOOL(left.value !== right.value);
            case "string":
                return MK_BOOL(left.value !== right.value);
            case "boolean":
                return MK_BOOL(left.value !== right.value);
            case "null":
                return MK_BOOL(false);
            default:
                return MK_BOOL(left !== right);
        }
    }
    throw new Error(`[Runtime Error] Operator '${binop.operator}' tidak kompatibel untuk tipe ${left.type} dan ${right.type}.`);
}
async function evalCallExpression(call, env) {
    const callee = env.lookupVar(call.callee);
    const evaluatedArgs = [];
    for (const arg of call.args){
        evaluatedArgs.push(unwrapSignal(await evaluate(arg, env)));
    }
    if (callee.type === "native-fn") {
        const result = callee.call(evaluatedArgs, env);
        return result instanceof Promise ? await result : result;
    }
    if (callee.type === "function") {
        const fn = callee;
        const scope = new Environment(fn.declarationEnv);
        for(let i = 0; i < fn.parameters.length; i++){
            const paramName = fn.parameters[i];
            if (paramName !== undefined) {
                const argVal = evaluatedArgs[i] ?? MK_NULL();
                scope.declareVar(paramName, argVal);
            }
        }
        let lastVal = MK_NULL();
        for (const stmt of fn.body){
            const result = await evaluate(stmt, scope);
            if (isReturnSignal(result)) {
                return result.value;
            }
            lastVal = result;
        }
        return lastVal;
    }
    throw new Error(`[Runtime Error] Identifier '${call.callee}' bukan merupakan fungsi yang dapat dipanggil.`);
}
async function runWibuScriptAsync(sourceCode, onOutput) {
    const outputLog = [];
    const handler = (msg)=>{
        outputLog.push(msg);
        if (onOutput) {
            onOutput(msg);
        }
    };
    const env = createGlobalEnvironment({
        outputHandler: handler,
        outputLog
    });
    try {
        const tokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lexer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tokenize"])(sourceCode);
        const parser = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$parser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Parser"]();
        const program = parser.produceAST(tokens);
        const lastValue = unwrapSignal(await evaluate(program, env));
        return {
            outputLog,
            lastValue
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        outputLog.push(errorMessage);
        if (onOutput) {
            onOutput(errorMessage);
        }
        return {
            outputLog,
            lastValue: MK_NULL(),
            error: errorMessage
        };
    }
}
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "MK_NULL");
__turbopack_context__.k.register(_c1, "MK_NUMBER");
__turbopack_context__.k.register(_c2, "MK_BOOL");
__turbopack_context__.k.register(_c3, "MK_STRING");
__turbopack_context__.k.register(_c4, "MK_NATIVE_FN");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0yqcsoe._.js.map