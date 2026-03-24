"use client";
import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { 
  ShieldAlert, Zap, Lock, Power, 
  ExternalLink, CheckCircle2,
  Fingerprint, Activity, ShieldCheckIcon, Search, Scan
} from 'lucide-react';

// CONTRACT BARU HASIL DEPLOY REMIX
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

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Mencegah Hydration Mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-Redirect ke BaseScan
  useEffect(() => {
    if (isConfirmed && hash) {
      const timer = setTimeout(() => {
        window.open(`https://basescan.org/tx/${hash}`, '_blank');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, hash]);

  if (!mounted) return null;

  const handleRevoke = () => {
    writeContract({
      address: REVOKE_CONTRACT_ADDRESS as `0x${string}`,
      abi: REVOKE_ABI,
      functionName: 'massRevoke',
      // Membersihkan 3 token utama sekaligus (WETH, USDC, DAI)
      args: [
        [
          "0x4200000000000000000000000000000000000006", 
          "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", 
          "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
        ],
        [
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000"
        ]
      ],
    });
  };

  return (
    <div className="min-h-screen bg-[#010101] text-zinc-100 selection:bg-blue-500/30 font-sans overflow-hidden">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-10 animate-pulse pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 py-10 relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-12 p-4 bg-black/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 rotate-[-5deg]">
              <ShieldCheckIcon size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none text-white italic">BASE<span className="text-blue-500">REVOKE</span></h1>
              <p className="text-[10px] text-zinc-600 font-mono tracking-[0.3em] uppercase mt-1">Node: {REVOKE_CONTRACT_ADDRESS.slice(0,8)}...</p>
            </div>
          </div>
          
          <button 
            onClick={() => isConnected ? disconnect() : connect({ connector: injected() })}
            className={`group px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border shadow-lg active:scale-95 ${
              isConnected 
                ? "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-red-500 shadow-red-950/20" 
                : "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 hover:shadow-blue-600/40"
            }`}
          >
            {isConnected ? <Power size={14} className="group-hover:animate-pulse" /> : <Fingerprint size={14} />}
            {isConnected ? `${address?.slice(0,6)}...${address?.slice(-4)}` : "CONNECT IDENTITY"}
          </button>
        </nav>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8 text-center font-mono">
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 text-xs flex flex-col items-center gap-1.5">
            <ShieldAlert size={16} className="text-red-500"/>
            <p className="text-zinc-600">Risk:</p>
            <p className="font-bold text-red-400">CRITICAL</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 text-xs flex flex-col items-center gap-1.5">
            <Activity size={16} className="text-blue-500"/>
            <p className="text-zinc-600">Net:</p>
            <p className="font-bold text-zinc-200">BASE MAINNET</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 text-xs flex flex-col items-center gap-1.5">
            <CheckCircle2 size={16} className="text-green-500"/>
            <p className="text-zinc-600">Protocol:</p>
            <p className="font-bold text-green-400">v1.0 ACTIVE</p>
          </div>
        </div>

        {/* Main Interface with Orb Visual */}
        <main className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-red-600/10 rounded-[40px] blur opacity-40 group-hover:opacity-70 transition duration-1000"></div>
          
          <div className="relative bg-zinc-950/70 border border-zinc-800/50 rounded-[36px] overflow-hidden backdrop-blur-2xl shadow-3xl">
            <div className="p-10 md:p-24 text-center">
              
              {isConnected ? (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                  {hash && (
                    <div className="mb-12 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-900 border border-zinc-700/50 text-xs font-mono tracking-wider shadow-inner">
                      <div className={`w-2.5 h-2.5 rounded-full ${isConfirmed ? 'bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.7)]' : 'bg-blue-500 animate-spin'}`} />
                      <span className="text-zinc-400">
                        {isConfirming ? "CLEANING PERMISSIONS..." : isConfirmed ? "REVOKE COMPLETE" : "TX BROADCASTED: " + hash.slice(0,8) + "..."}
                      </span>
                    </div>
                  )}

                  {/* Futuristic Energy Orb Visual */}
                  <div className="relative w-48 h-48 mx-auto mb-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-red-600/10 rounded-full blur-[30px] opacity-70 animate-pulse" />
                    <div className="absolute inset-2 border-2 border-zinc-700/50 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-2 border-r-2 border-blue-500 rounded-full animate-[spin_5s_linear_infinite]" />
                    <div className="absolute inset-6 border-l-2 border-blue-600 rounded-full animate-[spin_3s_linear_infinite_reverse]" />

                    <div className="relative flex items-center justify-center w-full h-full rounded-full">
                      {isConfirmed ? (
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.5)] border border-green-500/50 animate-bounce">
                          <ShieldCheckIcon size={30} className="text-green-400" />
                        </div>
                      ) : (
                        <div className={`w-28 h-28 bg-black rounded-full border border-zinc-800 flex items-center justify-center shadow-inner ${isPending || isConfirming ? 'animate-pulse' : ''}`}>
                          <Scan size={60} className={`text-zinc-700 ${isPending || isConfirming ? 'text-blue-500 animate-spin' : ''}`} />
                        </div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-4xl font-black mb-5 tracking-tighter uppercase italic text-white shadow-lg shadow-black/30">
                    {isConfirmed ? "Assets Secured" : "Security Protocol Ready"}
                  </h2>
                  <p className="text-zinc-500 max-w-sm mx-auto text-sm leading-relaxed mb-12 italic font-mono tracking-wide">
                    {isConfirmed 
                      ? "Success! Node has verified the command. Launching verification terminal..." 
                      : "Initialize a mass-revoke command to eliminate infinite token approvals on Base."
                    }
                  </p>

                  <div className="flex flex-col items-center gap-5">
                    <button 
                      onClick={handleRevoke}
                      disabled={isPending || isConfirming || isConfirmed}
                      className="group relative px-14 py-5 bg-gradient-to-r from-blue-600 to-red-600/90 text-white rounded-[20px] font-black text-xl transition-all shadow-[0_10px_40px_rgba(37,99,235,0.3)] hover:shadow-blue-600/50 disabled:opacity-50 disabled:grayscale overflow-hidden active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <span className="flex items-center gap-3 relative z-10">
                        {isConfirming ? <Scan size={24} className="animate-spin"/> : <Search size={24}/> }
                        {isPending ? "SIGNING..." : isConfirming ? "EXECUTING..." : isConfirmed ? "PROTOCOL END" : "EXECUTE SECURITY PROTOCOL"}
                      </span>
                    </button>
                    
                    {hash && (
                      <a 
                        href={`https://basescan.org/tx/${hash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-zinc-600 hover:text-blue-400 flex items-center gap-2 transition-colors underline underline-offset-4 decoration-zinc-800 font-mono tracking-wider"
                      >
                        Verification Hash: {hash.slice(0,20)}... <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 animate-pulse">
                  <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-8 border border-zinc-800 shadow-inner">
                    <Lock size={32} className="text-zinc-700" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tighter text-zinc-400 uppercase font-mono">ENCRYPTED SESSION</h3>
                  <p className="text-zinc-600 max-w-xs mx-auto text-sm mb-10 italic">
                    Establish a secure channel to begin auditing your Base smart contract permissions.
                  </p>
                  <button 
                    onClick={() => connect({ connector: injected() })}
                    className="px-12 py-4 bg-white text-black rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all shadow-xl active:scale-95 shadow-white/10"
                  >
                    AUTHORIZE NODE
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="mt-20 flex flex-col items-center gap-5 border-t border-zinc-900 pt-12 pb-6">
          <div className="flex items-center gap-6 text-zinc-700">
            <p className="text-[10px] font-mono tracking-[0.4em] uppercase">Base Revoke Protocol 2026</p>
            <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />
            <p className="text-[10px] font-mono tracking-[0.4em] uppercase">Revoke Spender: {REVOKE_CONTRACT_ADDRESS.slice(0,10)}...</p>
          </div>
          <div className="flex gap-6 opacity-30">
            <ShieldCheckIcon size={16} className="text-zinc-800" />
            <ExternalLink size={16} className="text-zinc-800" />
            <Activity size={16} className="text-zinc-800" />
          </div>
        </footer>
      </div>
    </div>
  );
}