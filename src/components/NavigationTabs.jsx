import { cn } from "@/lib/utils";

/**
 * Reusable Navigation Tabs Component
 *
 * @param {Object} props
 * @param {Array<{id: string, label: string, icon?: React.ReactNode}>} props.tabs - Array of tab objects with id, label, and optional icon
 * @param {string} props.activeTab - Currently active tab id
 * @param {Function} props.onTabChange - Callback function when tab is clicked (receives tab id)
 * @param {string} props.className - Additional CSS classes for the container
 * @param {string} props.containerClassName - Additional CSS classes for the tabs container
 */
export default function NavigationTabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  containerClassName = "",
}) {
  return (
    <div
      className={cn(
        "max-w-md mx-auto fixed top-13 left-0 right-0 z-[9] bg-white",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-4 px-4 pt-4 pb-0.5 bg-white drop-shadow-xl border-b border-gray-100",
          containerClassName
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full pb-3 text-sm font-light transition-colors relative flex items-center justify-center gap-2",
              activeTab === tab.id
                ? "text-primary font-medium"
                : "text-gray-500"
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
