import { FileText } from 'lucide-react';

const JobDescriptionInput = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <FileText className="w-4 h-4 inline mr-2" />
        Job Description
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here..."
        className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none font-sans text-sm"
      />
    </div>
  );
};

export default JobDescriptionInput;

