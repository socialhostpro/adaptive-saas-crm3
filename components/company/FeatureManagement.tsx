import React, { useEffect, useState } from 'react';
import { FeatureAddon } from '../../types';
import { supabase } from '../../lib/supabaseClient';

const FeatureToggle: React.FC<{ addon: FeatureAddon, onToggle: (id: string, isEnabled: boolean) => void, loading: boolean }> = ({ addon, onToggle, loading }) => {
    return (
        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{addon.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{addon.description}</p>
                <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-2">${addon.monthlyPrice}/mo</p>
            </div>
            <div className="ml-6">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={addon.isEnabled}
                        onChange={(e) => onToggle(addon.id, e.target.checked)}
                        className="sr-only peer"
                        disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-primary-600"></div>
                </label>
            </div>
        </div>
    );
};

const FeatureManagement: React.FC = () => {
    const [addons, setAddons] = useState<FeatureAddon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toggleLoading, setToggleLoading] = useState<string | null>(null);

    useEffect(() => {
        const fetchAddons = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase.from('feature_addons').select('*');
            if (error) {
                setError('Failed to load feature add-ons');
                setAddons([]);
            } else {
                setAddons(data || []);
            }
            setLoading(false);
        };
        fetchAddons();
    }, []);

    const handleToggleAddon = async (id: string, isEnabled: boolean) => {
        setToggleLoading(id);
        setError(null);
        const { data, error } = await supabase.from('feature_addons').update({ isEnabled }).eq('id', id).select();
        if (error) {
            setError('Failed to update add-on');
        } else if (data && data[0]) {
            setAddons(prevAddons => prevAddons.map(addon => addon.id === id ? data[0] : addon));
        }
        setToggleLoading(null);
    };

    if (loading) return <div className="text-center py-4">Loading feature add-ons...</div>;
    if (error) return <div className="text-center text-red-500 py-2">{error}</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Feature Add-ons</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enhance your AdaptiveCRM experience by enabling powerful add-ons.</p>
            <div className="space-y-4">
                {addons.map(addon => (
                    <FeatureToggle key={addon.id} addon={addon} onToggle={handleToggleAddon} loading={toggleLoading === addon.id} />
                ))}
            </div>
        </div>
    );
};

export default FeatureManagement;
