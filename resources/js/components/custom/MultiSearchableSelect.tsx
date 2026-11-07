// resources/js/components/ui/multi-searchable-select.tsx
import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
    label: string;
    value: string;
};

type MultiSearchableSelectProps = {
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
};

const MultiSearchableSelect = ({
    options,
    value = [],
    onChange,
    placeholder = "Select options",
    className,
}: MultiSearchableSelectProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Toggle option selection
    const toggleOption = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    // Display text for the trigger button
    const displayText = value.length === 0
        ? placeholder
        : value.length === 1
            ? options.find(o => o.value === value[0])?.label || placeholder
            : `${value.length} selected`;

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            {/* Trigger button */}
            <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => {
                    setIsOpen(!isOpen);
                    setSearchTerm("");
                }}
            >
                <span className={cn(!value.length && "text-muted-foreground")}>
                    {displayText}
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-lg">
                    {/* Search input */}
                    <div className="p-2 border-b">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-9 pr-3 py-2 bg-transparent text-sm outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options list */}
                    <div className="max-h-60 overflow-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = value.includes(option.value);
                                return (
                                    <div
                                        key={option.value}
                                        className="relative flex cursor-default select-none items-center py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => toggleOption(option.value)}
                                    >
                                        <span className={cn(
                                            "absolute left-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                            isSelected ? "bg-primary border-primary" : "border-input"
                                        )}>
                                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                        </span>
                                        <span className={cn(isSelected && "font-medium")}>
                                            {option.label}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-1.5 px-8 text-sm text-muted-foreground">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export { MultiSearchableSelect };