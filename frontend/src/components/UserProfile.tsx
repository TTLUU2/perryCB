import { UserProfile as UserProfileType } from '../types';

interface UserProfileProps {
  profile: UserProfileType;
  onUpdate: <K extends keyof UserProfileType>(key: K, value: UserProfileType[K]) => void;
  onBack: () => void;
}

function RadioGroup({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="mb-4">
      <legend className="text-xs font-semibold text-ph-gray-700 mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer border transition-all ${
              value === opt.value
                ? 'bg-ph-blue text-white border-ph-blue'
                : 'bg-white text-ph-gray-700 border-ph-gray-300 hover:border-ph-blue'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function UserProfile({ profile, onUpdate, onBack }: UserProfileProps) {
  return (
    <div className="pg-profile-panel">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-ph-blue hover:underline mb-4"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to chat
      </button>

      <h3 className="text-sm font-semibold text-ph-gray-800 mb-1">Your Preferences</h3>
      <p className="text-xs text-ph-gray-500 mb-4">
        Help Perry personalise recommendations. All fields are optional.
      </p>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-ph-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          placeholder="e.g. Alex"
          className="w-full px-3 py-2 text-sm border border-ph-gray-300 rounded-lg focus:outline-none focus:border-ph-blue focus:ring-1 focus:ring-ph-blue/20"
        />
      </div>

      {/* Preferred program */}
      <RadioGroup
        label="Preferred loyalty program"
        name="preferred_program"
        value={profile.preferred_program}
        options={[
          { value: 'qantas', label: 'Qantas' },
          { value: 'velocity', label: 'Velocity' },
          { value: 'krisflyer', label: 'KrisFlyer' },
          { value: 'not_sure', label: 'Not sure' },
        ]}
        onChange={(v) => onUpdate('preferred_program', v as UserProfileType['preferred_program'])}
      />

      {/* Travel goal */}
      <RadioGroup
        label="Travel goal"
        name="travel_goal"
        value={profile.travel_goal}
        options={[
          { value: 'business', label: 'Business class' },
          { value: 'economy', label: 'Economy' },
          { value: 'flexible', label: 'Flexible' },
        ]}
        onChange={(v) => onUpdate('travel_goal', v as UserProfileType['travel_goal'])}
      />

      {/* Max annual fee */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-ph-gray-700 mb-1">Max annual fee</label>
        <select
          value={profile.max_annual_fee}
          onChange={(e) => onUpdate('max_annual_fee', e.target.value as UserProfileType['max_annual_fee'])}
          className="w-full px-3 py-2 text-sm border border-ph-gray-300 rounded-lg focus:outline-none focus:border-ph-blue focus:ring-1 focus:ring-ph-blue/20 bg-white"
        >
          <option value="">No preference</option>
          <option value="no_fee">No fee ($0)</option>
          <option value="under_200">Under $200</option>
          <option value="under_500">Under $500</option>
          <option value="any">Any fee is fine</option>
        </select>
      </div>

      {/* Home city */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-ph-gray-700 mb-1">Home city</label>
        <input
          type="text"
          value={profile.home_city}
          onChange={(e) => onUpdate('home_city', e.target.value)}
          placeholder="Sydney"
          className="w-full px-3 py-2 text-sm border border-ph-gray-300 rounded-lg focus:outline-none focus:border-ph-blue focus:ring-1 focus:ring-ph-blue/20"
        />
      </div>

      <p className="text-[10px] text-ph-gray-400 mt-2">
        Saved locally on your device. Not shared externally.
      </p>
    </div>
  );
}
