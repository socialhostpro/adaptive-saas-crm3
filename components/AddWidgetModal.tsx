
import React from 'react';
import { Widget } from '../types';

interface AddWidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    allWidgets: Widget[];
    activeWidgetIds: string[];
    onAddWidget: (widgetId: string) => void;
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose, allWidgets, activeWidgetIds, onAddWidget }) => {
    if (!isOpen) return null;

    const availableWidgets = allWidgets.filter(w => !activeWidgetIds.includes(w.id));

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Widget to Dashboard</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto">
                    {availableWidgets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableWidgets.map(widget => (
                                <div key={widget.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{widget.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{widget.description}</p>
                                    </div>
                                    <button
                                        onClick={() => onAddWidget(widget.id)}
                                        className="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 font-semibold px-3 py-1 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900 transition-colors text-sm flex-shrink-0 ml-4"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">All available widgets are already on your dashboard.</p>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AddWidgetModal;
