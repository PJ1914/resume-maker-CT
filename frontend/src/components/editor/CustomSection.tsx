/**
 * Custom Section Component
 * Handles arbitrary/dynamic section types that don't fit predefined categories
 */

import React, { useState } from 'react';
import { DynamicSection } from '../../types/resume';
import { v4 as uuidv4 } from 'uuid';

interface CustomSectionProps {
  section: DynamicSection;
  onChange: (section: DynamicSection) => void;
  onRemove: () => void;
}

export const CustomSection: React.FC<CustomSectionProps> = ({
  section,
  onChange,
  onRemove,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    section.items.length > 0 ? 0 : null
  );

  const addItem = () => {
    const newItem = {
      id: uuidv4(),
      title: '',
      description: '',
      date: '',
    };
    onChange({
      ...section,
      items: [...section.items, newItem],
    });
    setExpandedIndex(section.items.length);
  };

  const updateItem = (index: number, updates: Partial<Record<string, string>>) => {
    const newItems = [...section.items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange({
      ...section,
      items: newItems,
    });
  };

  const removeItem = (index: number) => {
    onChange({
      ...section,
      items: section.items.filter((_, i) => i !== index),
    });
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const updateSectionTitle = (title: string) => {
    onChange({ ...section, title });
  };

  // Get the item display title based on available fields
  const getItemDisplayTitle = (item: Record<string, unknown>): string => {
    return (
      (item.title as string) ||
      (item.name as string) ||
      (item.organization as string) ||
      (item.company as string) ||
      'Untitled Item'
    );
  };

  // Get the item subtitle based on available fields
  const getItemSubtitle = (item: Record<string, unknown>): string => {
    const parts: string[] = [];
    if (item.organization) parts.push(item.organization as string);
    if (item.role) parts.push(item.role as string);
    if (item.date) parts.push(item.date as string);
    if (item.location) parts.push(item.location as string);
    return parts.join(' • ') || 'Add details below';
  };

  // Common fields to render for each item
  const commonFields = ['title', 'name', 'organization', 'role', 'date', 'location', 'description', 'url'];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="text-xl font-semibold text-secondary-900 dark:text-white bg-transparent border-b border-transparent hover:border-secondary-300 dark:hover:border-secondary-600 focus:border-primary-500 focus:outline-none px-1"
            value={section.title}
            onChange={(e) => updateSectionTitle(e.target.value)}
            placeholder="Section Title"
          />
          <span className="text-xs text-secondary-400 dark:text-secondary-500 bg-secondary-100 dark:bg-secondary-800 px-2 py-0.5 rounded">
            Custom
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addItem} className="btn-primary text-sm">
            + Add Item
          </button>
          <button
            onClick={onRemove}
            className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 text-sm"
          >
            Remove Section
          </button>
        </div>
      </div>

      {section.items.length === 0 ? (
        <p className="text-secondary-500 dark:text-secondary-400 text-center py-4">
          No items added yet. Click "Add Item" to add entries to this section.
        </p>
      ) : (
        <div className="space-y-3">
          {section.items.map((item, index) => (
            <div
              key={(item.id as string) || index}
              className="border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden"
            >
              {/* Header - Always visible */}
              <div
                className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800/50 cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-secondary-900 dark:text-white">
                    {getItemDisplayTitle(item)}
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {getItemSubtitle(item)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(index);
                    }}
                    className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 text-sm"
                  >
                    Remove
                  </button>
                  <span className="text-secondary-400 dark:text-secondary-500">
                    {expandedIndex === index ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedIndex === index && (
                <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 space-y-4 bg-white dark:bg-secondary-900">
                  {/* Render existing fields from the item */}
                  {Object.entries(item).map(([key, value]) => {
                    if (key === 'id') return null; // Skip ID field

                    const isTextArea = key === 'description' || key === 'text' || key === 'details';
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

                    return (
                      <div key={key}>
                        <label className="label">
                          {label}
                        </label>
                        {isTextArea ? (
                          <textarea
                            className="input w-full"
                            rows={3}
                            value={(value as string) || ''}
                            onChange={(e) => updateItem(index, { [key]: e.target.value })}
                            placeholder={`Enter ${label.toLowerCase()}...`}
                          />
                        ) : (
                          <input
                            type={key === 'url' ? 'url' : 'text'}
                            className="input w-full"
                            value={(value as string) || ''}
                            onChange={(e) => updateItem(index, { [key]: e.target.value })}
                            placeholder={`Enter ${label.toLowerCase()}...`}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Add new field button */}
                  <AddFieldButton
                    existingFields={Object.keys(item)}
                    onAddField={(fieldName) => updateItem(index, { [fieldName]: '' })}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Sub-component for adding new fields
interface AddFieldButtonProps {
  existingFields: string[];
  onAddField: (fieldName: string) => void;
}

const AddFieldButton: React.FC<AddFieldButtonProps> = ({ existingFields, onAddField }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customFieldName, setCustomFieldName] = useState('');

  const suggestedFields = [
    'title',
    'name',
    'organization',
    'role',
    'date',
    'location',
    'description',
    'url',
    'achievement',
    'result',
    'technologies',
  ].filter((field) => !existingFields.includes(field));

  const handleAddCustomField = () => {
    const fieldName = customFieldName.toLowerCase().replace(/\s+/g, '_');
    if (fieldName && !existingFields.includes(fieldName)) {
      onAddField(fieldName);
      setCustomFieldName('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
      >
        + Add Field
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg shadow-lg p-3 min-w-64 z-10">
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-2">Suggested fields:</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {suggestedFields.map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => {
                  onAddField(field);
                  setIsOpen(false);
                }}
                className="px-2 py-1 text-xs bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded"
              >
                {field}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="input text-sm flex-1"
              placeholder="Custom field name"
              value={customFieldName}
              onChange={(e) => setCustomFieldName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomField()}
            />
            <button
              type="button"
              onClick={handleAddCustomField}
              className="btn-primary text-sm"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
