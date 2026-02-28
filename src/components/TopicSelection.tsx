import { useState } from 'react';
import { Card } from './Card';
import { Search } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  emoji: string;
  frequency: 'High' | 'Medium' | 'Low';
}

interface TopicSelectionProps {
  onSelectTopic: (topicId: string) => void;
}

const topics: Topic[] = [
  { id: 'environment', name: 'Environment', emoji: '🌍', frequency: 'High' },
  { id: 'education', name: 'Education', emoji: '🎓', frequency: 'High' },
  { id: 'technology', name: 'Technology', emoji: '💻', frequency: 'High' },
  { id: 'health', name: 'Health & Fitness', emoji: '🏥', frequency: 'Medium' },
  { id: 'work', name: 'Work & Career', emoji: '💼', frequency: 'High' },
  { id: 'travel', name: 'Travel & Tourism', emoji: '✈️', frequency: 'Medium' },
  { id: 'family', name: 'Family & Society', emoji: '👨‍👩‍👧', frequency: 'High' },
  { id: 'media', name: 'Media & Culture', emoji: '📱', frequency: 'Medium' },
  { id: 'sport', name: 'Sports', emoji: '⚽', frequency: 'Low' },
  { id: 'food', name: 'Food & Nutrition', emoji: '🍎', frequency: 'Low' },
  { id: 'globalization', name: 'Globalization', emoji: '🌐', frequency: 'High' },
  { id: 'housing', name: 'Housing', emoji: '🏠', frequency: 'Medium' },
];

export function TopicSelection({ onSelectTopic }: TopicSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

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
        <div className="grid grid-cols-2 gap-4">
          {filteredTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
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

        {/* No Results */}
        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No topics found</p>
            <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
