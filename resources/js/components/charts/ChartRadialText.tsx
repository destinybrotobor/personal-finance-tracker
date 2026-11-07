"use client"

import {
    Label,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts"

import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { da } from "date-fns/locale";

export interface ChartRadialTextProps {
    data: { label: string; value?: number; maxValue?: number; percentage?: number; fill?: string }[]
    config?: ChartConfig,
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl",
    showPercentage?: boolean,
    showLabel?: boolean,
    isCurrency?: boolean,
    currencyCode?: string,
}

export function ChartRadialText({
    data = [
        { label: "budget", value: 200, percentage: 50, fill: "green" },
    ],
    config = {},
    size = "md",
    showPercentage = true,
    showLabel = true,
    isCurrency = false,
    currencyCode = "GBP"
}: ChartRadialTextProps) {
    const { innerRadius, outerRadius, polarRadius } = {
        sm: { innerRadius: 30, outerRadius: 43, polarRadius: [34, 28] },
        md: { innerRadius: 40, outerRadius: 53, polarRadius: [44, 38] },
        lg: { innerRadius: 50, outerRadius: 63, polarRadius: [54, 48] },
        xl: { innerRadius: 60, outerRadius: 73, polarRadius: [64, 58] },
        "2xl": { innerRadius: 70, outerRadius: 83, polarRadius: [74, 68] },
        "3xl": { innerRadius: 80, outerRadius: 93, polarRadius: [84, 78] },
    }[size];

    const formattedValue = (value: number | undefined) => {
        if (isCurrency && value !== undefined) {
            if (currencyCode === "USD") {
                return Number(value)?.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                });
            } else if (currencyCode === "EUR") {
                return Number(value)?.toLocaleString('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0,
                });
            } else if (currencyCode === "GBP") {
                return Number(value)?.toLocaleString('en-GB', {
                    style: 'currency',
                    currency: 'GBP',
                    maximumFractionDigits: 0,
                });
            } else if (currencyCode === "NGN") {
                return Number(value)?.toLocaleString('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                    maximumFractionDigits: 0,
                });
            } else {
                return value.toLocaleString();
            }
        }
        return value?.toLocaleString(undefined, { maximumFractionDigits: 1 });
    };

    // Calculate endAngle based on the percentage which is 360 degrees for 100%
    const percentage = data[0]?.percentage;
    const isValidPercentage = typeof percentage === 'number' && !isNaN(percentage);
    const endAngle = isValidPercentage ? (percentage / 100) * 360 : 0;

    return (
        <div className="flex flex-col">
            <div className="flex-1 pb-0 min-w-fit">
                <ChartContainer
                    config={config}
                    className="mx-auto aspect-square max-h-[150px]"
                >
                    <RadialBarChart
                        data={data}
                        startAngle={0}
                        endAngle={endAngle}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                    >
                        <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={polarRadius}
                        />
                        <RadialBar dataKey="value" background cornerRadius={10} />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className={`fill-foreground text-${size === "sm" ? "xl" : size === "md" ? "2xl" : size === "lg" ? "3xl" : size === "xl" ? "4xl" : "5xl"} font-bold`}
                                                >
                                                    {(showPercentage && data[0].percentage !== undefined) ? formattedValue(data[0].percentage) + "%" : formattedValue(data[0].value)}
                                                </tspan>
                                                {showLabel && <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 20}
                                                    className={`fill-muted-foreground text-${(size === "sm" || size === "md") ? "xs" : size === "lg" ? "md" : size === "xl" ? "lg" : "2xl"} font-medium`}
                                                >
                                                    {data[0].label}
                                                </tspan>}
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                    </RadialBarChart>
                </ChartContainer>
            </div>
        </div>
    )
}

