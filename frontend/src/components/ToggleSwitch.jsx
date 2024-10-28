import { Lock } from "lucide-react";

const ToggleSwitch = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center cursor-pointer space-x-2">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className={`block ${checked ? 'bg-[#5fced8]' : 'bg-gray-300'} w-10 h-6 rounded-full transition-colors duration-200`} />
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      {label && (
        <div className="flex items-center space-x-1 text-sm">
          <Lock size={16} />
          <span>{label}</span>
        </div>
      )}
    </label>
  );
};

export default ToggleSwitch;