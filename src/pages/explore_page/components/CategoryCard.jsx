const CategoryCard = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full whitespace-nowrap h-8 px-4 py-2 rounded-full text-xs font-medium shadow-md transition-colors
        ${
          isActive
            ? "bg-primary text-white"
            : "bg-lightgray text-white hover:bg-gray-700"
        }`}
    >
      {label}
    </button>
  );
};

export default CategoryCard;
