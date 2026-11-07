// resources/js/components/ui/searchable-select.jsx
import React, { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { on } from "events";

type Option = {
    label: string;
    value: string;
};

type SearchableSelectProps = {
    className?: string;
    options: Option[];
    placeholder?: string;
    searchPlaceholder?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    limited?: boolean;
};

const SearchableSelect = React.forwardRef<HTMLDivElement, SearchableSelectProps>(
    ({ className, options, placeholder, searchPlaceholder, value, limited, onValueChange }, ref) => {
        const [open, setOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState("");
        const [selectedValue, setSelectedValue] = useState(value);

        const filteredOptions = options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const handleSelect = (value: string) => {
            console.log("Selected value:", value);
            setSelectedValue(value);
            onValueChange?.(value);
            setOpen(false);
            setSearchTerm("");
        };

        return (
            <div className={cn("relative", className)} ref={ref}>
                <button
                    type="button"
                    className={cn(
                        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    onClick={() => setOpen(!open)}
                >
                    {selectedValue ? (
                        options.find((option) => option.value === selectedValue)?.label || selectedValue
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </button>

                {open && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                        <div className="p-2 border-b">
                            <div className="relative flex items-center">
                                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    className="w-full pl-9 pr-3 py-2 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="p-1 max-h-60 overflow-auto">
                            {(!limited && searchTerm) && (
                                <button
                                    key={searchTerm}
                                    type="button"
                                    className={cn(
                                        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
                                        selectedValue === searchTerm && "bg-accent"
                                    )}
                                    onClick={() => handleSelect(searchTerm)}
                                >
                                    {selectedValue === searchTerm && (
                                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                            <Check className="h-4 w-4" />
                                        </span>
                                    )}
                                    {searchTerm}
                                </button>
                            )}
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={cn(
                                            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
                                            selectedValue === option.value && "bg-accent"
                                        )}
                                        onClick={() => handleSelect(option.value)}
                                    >
                                        {selectedValue === option.value && (
                                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                                <Check className="h-4 w-4" />
                                            </span>
                                        )}
                                        {option.label}
                                    </button>
                                ))
                            ) : (
                                <>
                                    {limited && (
                                        <div className="px-8 py-1.5 text-sm text-muted-foreground">
                                            No results found
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
);
SearchableSelect.displayName = "SearchableSelect";

export { SearchableSelect };
