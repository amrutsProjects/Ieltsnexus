import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Search } from 'lucide-react';
import { apiCall } from '../lib/api';

export interface Topic {
  id: string;
  name: string;
  emoji: string;
  frequency: 'High' | 'Medium' | 'Low';
}

interface TopicSelectionProps {
  onSelectTopic: (topic: { id: string; name: string }) => void;
}

export function TopicSelection({ onSelectTopic }: TopicSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiCall('/topics')
      .then(data => {
        setTopics(data.topics || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load topics:', err);
        setIsLoading(false);
      });
  }, []);

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFrequencyColor = (frequency: Topic['frequency']) => {
    switch (frequency) {
      case 'High':
        return 'bg-[#FEF3C7] text-[#F59E0B]';
      case 'Medium':
        return 'bg-[#DBEAFE] text-[#3B82F6]';
      case 'Low':
        return 'bg-[#F3F4F6] text-[#6B7280]';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h2 className="text-3xl font-bold text-[#4F46E5] mb-2">Choose Your Focus</h2>
        <p className="text-gray-600">Select a topic to begin your practice</p>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search topics (e.g., Environment, Technology)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-400 outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all"
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="px-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading topics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onSelectTopic({ id: topic.id, name: topic.name })}
                className="group"
              >
                <Card className="h-full hover:scale-105 transition-transform duration-200 cursor-pointer">
                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl bg-[#E0E7FF] flex items-center justify-center group-hover:bg-[#4F46E5] transition-colors"
                    >
                      <span className="text-4xl">{topic.emoji}</span>
                    </div>

                    {/* Topic Name */}
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">
                      {topic.name}
                    </h3>

                    {/* Frequency Badge */}
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${getFrequencyColor(topic.frequency)}`}
                    >
                      {topic.frequency} Frequency
                    </span>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No topics found</p>
            <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
