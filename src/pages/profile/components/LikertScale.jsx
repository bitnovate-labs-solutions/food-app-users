export default function LikertScale({ label, value, onChange }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="flex justify-between mt-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`w-8 h-8 rounded-full border text-sm ${
              value === i ? "bg-primary text-white" : "hover:bg-muted"
            }`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs mt-2 mb-1 text-gray-500">
        <span>Not likely</span>
        <span>Extremely likely</span>
      </div>
    </div>
  );
}

