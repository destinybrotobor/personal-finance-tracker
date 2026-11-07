// resources/js/components/ui/check-options.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";

// Types
type Option = {
    id: string;
    name: string;
};

type CheckOptionsInputProps = {
    icon?: React.ReactNode;
    className?: string;
    displayValue?: string;
    children?: React.ReactNode;
    isFocused?: boolean;
};

type CheckOptionValuesProps = {
    options: Option[];
    selectedValues: string[];
    onValueChange: (values: string[]) => void;
    className?: string;
};

// Main Component
const CheckOptionsInput = React.forwardRef<HTMLDivElement, CheckOptionsInputProps>(
    ({ icon, className, displayValue, children, isFocused }, ref) => {
        const [openOptions, setOpenOptions] = React.useState(false);

        return (
            <div
                ref={ref}
                role="button"
                onClick={() => setOpenOptions((open) => !open)}
                className={cn(
                    "flex items-center gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    className
                )}
            >
                {icon && <div className="flex-shrink-0 text-muted-foreground">{icon}</div>}
                <div className="flex-1 relative">
                    {displayValue ? (
                        <div className="list-none py-1">{displayValue}</div>
                    ) : (
                        <div className="list-none py-1 text-muted-foreground">
                            What Amenities do you Offer?
                        </div>
                    )}
                    <div
                        className={cn(
                            "absolute left-0 top-full mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md z-50",
                            openOptions ? "block" : "hidden"
                        )}
                    >
                        {children}
                    </div>
                </div>
                <ChevronsUpDown
                    className={cn(
                        "h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300",
                        openOptions ? "rotate-180" : "rotate-0"
                    )}
                />
            </div>
        );
    }
);

// Values Component
const CheckOptionValues = ({
    options,
    selectedValues,
    onValueChange,
    className,
}: CheckOptionValuesProps) => {
    const updateSelectedAmenities = (value: string) => {
        const newValues = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        onValueChange(newValues);
    };

    return (
        <div className={cn("p-2 space-y-2 max-h-60 overflow-auto", className)}>
            {options.map((amenity) => (
                <div className="flex items-center space-x-2" key={amenity.id}>
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                        id={amenity.id}
                        value={amenity.name}
                        checked={selectedValues.includes(amenity.name)}
                        onChange={(e) => updateSelectedAmenities(e.target.value)}
                    />
                    <label
                        htmlFor={amenity.id}
                        className="text-sm font-medium leading-none"
                    >
                        {amenity.name}
                    </label>
                </div>
            ))}
        </div>
    );
};

export { CheckOptionsInput, CheckOptionValues };
