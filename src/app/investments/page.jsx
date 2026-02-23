"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart as PieIcon,
    BarChart3,
    Activity,
    Filter,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Bitcoin,
    Briefcase,
    PlusCircle
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { currencies } from '@/config/currencies';

const Investments = () => {
    const { user } = useAuth();
    const { t, fc } = useLocale();
    const [timeframe, setTimeframe] = useState('1M');
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    const [holdings, setHoldings] = useState([]);
    const [totalValue, setTotalValue] = useState(0);
    const [totalReturn, setTotalReturn] = useState(0);
    const [allocationData, setAllocationData] = useState([]);
    const [investmentCurrency, setInvestmentCurrency] = useState('EUR');

    useEffect(() => {
        setIsMounted(true);
        if (user) fetchInvestments();
    }, [user]);

    const fetchInvestments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('investments')
                .select('*')
                .eq('user_id', user?.id);

            if (error) throw error;

            if (data) {
                processInvestments(data);
            }
        } catch (error) {
            console.error('Error fetching investments:', error);
            toast.error("Erreur lors du chargement des investissements.");
        } finally {
            setLoading(false);
        }
    };

    const processInvestments = (data) => {
        let currentTotal = 0;
        let costTotal = 0;
        const allocationMap = {};

        const processedHoldings = data.map(item => {
            const currentVal = item.quantity * item.current_price;
            const costVal = item.quantity * item.avg_cost;

            currentTotal += currentVal;
            costTotal += costVal;

            // Allocation
            if (!allocationMap[item.type]) allocationMap[item.type] = 0;
            allocationMap[item.type] += currentVal;

            return {
                ...item,
                currentVal,
                returnVal: currentVal - costVal,
                returnPerc: ((currentVal - costVal) / costVal) * 100,
                color: item.color || '#1D3557'
            };
        });

        // Calculate Allocation Percentages
        const allocationChart = Object.keys(allocationMap).map(type => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: Number(((allocationMap[type] / currentTotal) * 100).toFixed(1)),
            color: type === 'stock' ? '#e63746' : type === 'crypto' ? '#1D3557' : type === 'gold' ? '#F59E0B' : '#6B7280'
        }));

        setTotalValue(currentTotal);
        setTotalReturn(currentTotal - costTotal);
        setHoldings(processedHoldings);
        setAllocationData(allocationChart);
    };

    const createDemoInvestment = async () => {
        if (!user) return;
        setIsLoading(true);

        const demoAssets = [
            { name: 'Apple Inc.', symbol: 'AAPL', type: 'stock', price: 175.50, color: '#e63746' },
            { name: 'Tesla', symbol: 'TSLA', type: 'stock', price: 180.20, color: '#e63746' },
            { name: 'Bitcoin', symbol: 'BTC', type: 'crypto', price: 65000, color: '#1D3557' },
            { name: 'Ethereum', symbol: 'ETH', type: 'crypto', price: 3500, color: '#1D3557' },
            { name: 'Gold ETF', symbol: 'GLD', type: 'gold', price: 190.50, color: '#F59E0B' }
        ];

        const randomAsset = demoAssets[Math.floor(Math.random() * demoAssets.length)];
        const quantity = Number((Math.random() * 10).toFixed(4));
        const avgCost = randomAsset.price * (0.8 + Math.random() * 0.4); // Random cost between -20% and +20% current price

        const newInv = {
            user_id: user.id,
            name: randomAsset.name,
            symbol: randomAsset.symbol,
            type: randomAsset.type,
            quantity: quantity,
            current_price: randomAsset.price,
            avg_cost: avgCost,
            color: randomAsset.color,
            currency: investmentCurrency
        };

        const { error } = await supabase.from('investments').insert([newInv]);

        if (error) {
            toast.error("Erreur création (table 'investments' existe ?)");
            console.error(error);
        } else {
            toast.success(`Investissement ${randomAsset.symbol} ajouté !`);
            fetchInvestments();
        }
        setIsLoading(false);
    };

    // Mock Data based on Timeframe (Visual only)
    const getPerformanceData = (period) => {
        const base = totalValue || 20000; // Use actual total or default
        const volatility = period === '1J' ? 100 : period === '1M' ? 500 : 2000;
        const points = period === '1J' ? 24 : period === '1M' ? 30 : 12;

        return Array.from({ length: points }, (_, i) => ({
            date: i,
            value: base + (Math.sin(i * 0.5) + 1) * volatility * (i + 1) * 0.5 + (i * 100)
        }));
    };

    const performanceData = getPerformanceData(timeframe);

    const trendingAssets = [
        { name: 'Bitcoin', symbol: 'BTC / USD', price: fc(62241.12, 'EUR'), change: '+2,4 %', positive: true, data: [30, 25, 35, 15, 25, 10, 20, 5, 15, 10, 20] },
        { name: 'Apple Inc.', symbol: 'AAPL', price: fc(172.45, 'EUR'), change: '-0,8 %', positive: false, data: [10, 15, 10, 25, 20, 35, 30, 38, 35, 40, 38] },
        { name: 'Tesla', symbol: 'TSLA', price: fc(158.22, 'EUR'), change: '+5,1 %', positive: true, data: [35, 32, 28, 30, 20, 18, 10, 12, 5, 8, 2] },
    ];

    if (!isMounted) return null;

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column Skeleton */}
                    <div className="lg:w-2/3 space-y-6">
                        {/* Portfolio Summary Skeleton */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <div className="flex items-end gap-4">
                                <Skeleton className="h-10 w-40" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                        </div>

                        {/* Chart Skeleton */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 h-80">
                            <Skeleton className="h-6 w-48 mb-6" />
                            <Skeleton className="h-full w-full rounded-lg" />
                        </div>

                        {/* Assets Table Skeleton */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-10 h-10 rounded-full" />
                                            <div>
                                                <Skeleton className="h-4 w-24 mb-1" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="lg:w-1/3 space-y-6">
                        {/* Allocation Chart Skeleton */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 h-64 flex flex-col items-center justify-center">
                            <Skeleton className="h-40 w-40 rounded-full" />
                        </div>

                        {/* Trending Assets Skeleton */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                            <Skeleton className="h-6 w-32" />
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-8 h-8 rounded-lg" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-3 w-20" />
                                            <Skeleton className="h-2 w-12" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="pb-12 space-y-10">
            {/* Portfolio Overview */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Portfolio Card */}
                <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full active:scale-[0.98] transition-transform group">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('investments.portfolioValue')}</span>
                            <span className="bg-[#E63746]/10 text-[#E63746] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Live</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black mb-1 tracking-tight text-[#1D3557]">
                            {fc(totalValue, profile?.preferred_currency)}
                        </h1>
                        <div className="flex items-center gap-2 mb-6">
                            <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${totalReturn >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                                {totalReturn >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                                <span>{totalValue > 0 ? ((totalReturn / (totalValue - totalReturn)) * 100).toFixed(2) : 0} %</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">{t('common.currency')}</label>
                            <select
                                value={investmentCurrency}
                                onChange={(e) => setInvestmentCurrency(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3.5 text-sm font-bold text-[--color-navy] focus:outline-none focus:ring-2 focus:ring-[--color-primary-red]/20 transition-all appearance-none"
                            >
                                {Object.values(currencies).map(c => (
                                    <option key={c.code} value={c.code}>
                                        {c.code} - {c.name} ({c.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>
                </div>

                {/* Performance Chart */}
                <div className="lg:col-span-9 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <h3 className="text-xl font-bold text-[#1D3557]">Analyse de Performance</h3>
                        <div className="flex bg-gray-100 p-1 rounded-full">
                            {['1J', '1S', '1M', '1A', 'TOUT'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setTimeframe(period)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${timeframe === period ? 'bg-[#E63746] text-white shadow-md' : 'text-gray-500 hover:text-[#E63746]'}`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-64 mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e63746" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#e63746" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [fc(value, profile?.preferred_currency), 'Valeur']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#e63746" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Middle Grid: Allocation & Trending */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:col-span-12">
                    {/* Asset Allocation */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
                        <h3 className="text-lg font-bold mb-6 text-[#1D3557]">Allocation d'Actifs</h3>
                        {
                            allocationData.length > 0 ? (
                                <>
                                    <div className="h-48 relative mb-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={allocationData}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {allocationData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="block text-2xl font-bold text-[#1D3557]">{allocationData.length}</span>
                                            <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Types</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {allocationData.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                    <span className="text-gray-500">{item.name}</span>
                                                </div>
                                                <span className="font-bold text-[#1D3557]">{item.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                                    Aucun actif
                                </div>
                            )
                        }
                    </div>

                    {/* Trending Assets */}
                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {
                            trendingAssets.map((asset, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-orange-100 text-orange-500' : i === 1 ? 'bg-blue-100 text-blue-500' : 'bg-red-100 text-[#E63746]'}`}>
                                                {i === 0 ? <Bitcoin size={20} /> : i === 1 ? <Briefcase size={20} /> : <Activity size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#1D3557]">{asset.name}</h4>
                                                <span className="text-xs text-gray-400 uppercase">{asset.symbol}</span>
                                            </div>
                                        </div>
                                        <span className={`font-bold text-sm ${asset.positive ? 'text-emerald-500' : 'text-rose-500'}`}>{asset.change}</span>
                                    </div>
                                    <div className="h-16 w-full mb-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={asset.data.map((val, idx) => ({ i: idx, val }))}>
                                                <Line type="monotone" dataKey="val" stroke={asset.positive ? '#10b981' : '#e11d48'} strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="text-xl font-extrabold text-[#1D3557]">{asset.price}</div>
                                </div>
                            ))
                        }
                    </div>
                </div>

            </section>

            {/* Bottom Section - Full Width Holdings */}
            <section className="grid grid-cols-1">
                {/* Holdings Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-[#1D3557]">Vos Avoirs</h3>
                        <div className="flex gap-2">
                            <button className="text-gray-400 hover:text-[#E63746] p-2 transition-colors"><Filter size={20} /></button>
                            <button className="text-gray-400 hover:text-[#E63746] p-2 transition-colors"><Download size={20} /></button>
                        </div>
                    </div>
                    {
                        holdings.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">
                                Aucun investissement trouvé. Utilisez le bouton "Investir (Démo)" pour commencer.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Actif</th>
                                            <th className="px-6 py-4">Quantité</th>
                                            <th className="px-6 py-4">Coût Moyen</th>
                                            <th className="px-6 py-4">Prix Actuel</th>
                                            <th className="px-6 py-4">Valeur & Rendement</th>
                                            <th className="px-6 py-4">Allocation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {holdings.map((stock, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`} style={{ backgroundColor: stock.color + '20', color: stock.color }}>
                                                            <Activity size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#1D3557]">{stock.name}</div>
                                                            <div className="text-xs text-gray-500 uppercase">{stock.symbol}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-sm text-gray-700">{stock.quantity}</td>
                                                <td className="px-6 py-4 text-gray-500 text-sm">{fc(stock.avg_cost, stock.currency)}</td>
                                                <td className="px-6 py-4 font-bold text-sm text-[#1D3557]">{fc(stock.current_price, stock.currency)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm text-[#1D3557]">{fc(stock.currentVal, stock.currency)}</div>
                                                    <div className={`text-[10px] font-bold ${stock.returnVal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {stock.returnVal >= 0 ? '+' : ''}{fc(stock.returnVal, stock.currency)} ({stock.returnPerc.toFixed(2)} %)
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                        <div className="h-full" style={{ width: `${(stock.currentVal / totalValue) * 100}%`, backgroundColor: stock.color }}></div>
                                                    </div>
                                                    <div className="text-[10px] mt-1 text-gray-500 font-bold uppercase">{((stock.currentVal / totalValue) * 100).toFixed(1)} %</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    }
                </div>
            </section>
        </PageWrapper>
    );
};

export default Investments;
