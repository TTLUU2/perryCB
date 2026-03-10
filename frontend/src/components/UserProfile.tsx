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
                ? 'bg-[#3A9E98] text-white border-[#3A9E98]'
                : 'bg-white text-ph-gray-700 border-ph-gray-300 hover:border-ph-teal'
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
          className="w-full px-3 py-2 text-sm border border-ph-gray-300 rounded-lg focus:outline-none focus:border-ph-pink focus:ring-1 focus:ring-ph-pink/20"
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

      {/* Card type */}
      <RadioGroup
        label="Card type"
        name="card_type"
        value={profile.card_type || 'personal'}
        options={[
          { value: 'personal', label: 'Personal' },
          { value: 'business_and_personal', label: 'Include business' },
        ]}
        onChange={(v) => onUpdate('card_type', v as UserProfileType['card_type'])}
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
          className="w-full px-3 py-2 text-sm border border-ph-gray-300 rounded-lg focus:outline-none focus:border-ph-pink focus:ring-1 focus:ring-ph-pink/20 bg-white"
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
          className="w-full px-3 py-2 text-sm border border-ph-gray-300 rounded-lg focus:outline-none focus:border-ph-pink focus:ring-1 focus:ring-ph-pink/20"
        />
      </div>

      {/* Destination regions — multi-select */}
      <fieldset className="mb-4">
        <legend className="text-xs font-semibold text-ph-gray-700 mb-2">Destination regions</legend>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'asia', label: 'Asia' },
            { value: 'europe', label: 'Europe' },
            { value: 'americas', label: 'Americas' },
            { value: 'pacific', label: 'Pacific Islands' },
            { value: 'middle_east_africa', label: 'Middle East & Africa' },
          ].map((opt) => {
            const selected = profile.destination_regions.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer border transition-all ${
                  selected
                    ? 'bg-[#3A9E98] text-white border-[#3A9E98]'
                    : 'bg-white text-ph-gray-700 border-ph-gray-300 hover:border-ph-teal'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => {
                    const next = selected
                      ? profile.destination_regions.filter((r) => r !== opt.value)
                      : [...profile.destination_regions, opt.value];
                    onUpdate('destination_regions', next);
                  }}
                  className="sr-only"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Travel frequency */}
      <RadioGroup
        label="Travel frequency"
        name="travel_frequency"
        value={profile.travel_frequency}
        options={[
          { value: 'once_year', label: 'Once a year' },
          { value: '2_3_year', label: '2–3 times' },
          { value: 'monthly_plus', label: 'Monthly+' },
        ]}
        onChange={(v) => onUpdate('travel_frequency', v as UserProfileType['travel_frequency'])}
      />

      {/* Points balance */}
      <RadioGroup
        label="Current points balance"
        name="points_balance"
        value={profile.points_balance}
        options={[
          { value: 'starting', label: 'Just starting' },
          { value: 'under_50k', label: 'Under 50k' },
          { value: '50_100k', label: '50–100k' },
          { value: 'over_100k', label: '100k+' },
        ]}
        onChange={(v) => onUpdate('points_balance', v as UserProfileType['points_balance'])}
      />

      <p className="text-[10px] text-ph-gray-400 mt-2">
        Saved locally on your device. Not shared externally.
      </p>
    </div>
  );
}
