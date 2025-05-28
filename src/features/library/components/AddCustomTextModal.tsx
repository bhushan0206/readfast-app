import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

interface AddCustomTextModalProps {
  onClose: () => void;
  onSubmit: (title: string, content: string) => void;
}

const AddCustomTextModal: React.FC<AddCustomTextModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { title?: string; content?: string } = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
      isValid = false;
    } else if (content.trim().split(/\s+/).length < 10) {
      newErrors.content = 'Content must be at least 10 words';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      await onSubmit(title, content);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700 p-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Add Custom Text</h3>
          <button 
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-4">
            <Input
              label="Title"
              id="title"
              placeholder="Enter title for your text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              required
            />
            
            <div className="space-y-1">
              <label htmlFor="content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Content
              </label>
              <textarea
                id="content"
                rows={window.innerWidth < 768 ? 8 : 12}
                placeholder="Paste or type the text content here..."
                className={`
                  w-full rounded-lg px-3 py-2 resize-y
                  border ${errors.content ? 'border-error-500 dark:border-error-400' : 'border-neutral-300 dark:border-neutral-600'} 
                  bg-white dark:bg-neutral-800
                  text-neutral-900 dark:text-neutral-100
                  placeholder-neutral-500 dark:placeholder-neutral-400
                  focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 focus:border-primary-500 dark:focus:border-primary-400
                  transition-all text-sm md:text-base
                `}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              {errors.content && (
                <p className="text-sm text-error-600 dark:text-error-400">{errors.content}</p>
              )}
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {content.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </div>
        </form>
        
        <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={loading}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Add Text
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomTextModal;