"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartStyle,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useFormattedValue } from "@/hooks/useFormattedValue"


export function ChartPieInteractive({ title, description, chartData, chartConfig } : { title?: string, description?: string, chartData: any[], chartConfig: ChartConfig }) {
    // Defensive: If chartData is missing or empty, show message
    if (!Array.isArray(chartData) || chartData.length === 0) {
        return <div className="text-center text-muted-foreground">No data available</div>;
    }

    // Ensure 'values' is a number for recharts compatibility
    const safeChartData = chartData.map(item => ({
        ...item,
        values: typeof item.values === 'string' ? parseFloat(item.values) : item.values
    }));

    const id = "pie-interactive";
    const [activeMonth, setActiveMonth] = React.useState(safeChartData[0]?.label ?? "");
    const formattedValue = useFormattedValue();

    const activeIndex = React.useMemo(
        () => safeChartData.findIndex((item) => item.label === activeMonth),
        [activeMonth, safeChartData]
    );
    const labels = React.useMemo(() => safeChartData.map((item) => item.label), [safeChartData]);

    // Defensive: If activeIndex is invalid, fallback to 0
    const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

    return (
        <Card data-chart={id} className="flex flex-col shadow-2xl bg-white/50 backdrop-blur-2xl border border-corporate-blue/50">
            {/* <ChartStyle id={id} config={chartConfig} /> */}
            <CardHeader className="flex-row items-start space-y-0 pb-0">
                {(title || description) && (
                    <div className="grid gap-1">
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                )}
                <Select value={activeMonth} onValueChange={setActiveMonth}>
                    <SelectTrigger
                        className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder="Select label" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        {labels.map((key) => {
                            const config = chartConfig[key as keyof typeof chartConfig];
                            if (!config) return null;
                            return (
                                <SelectItem
                                    key={key}
                                    value={key}
                                    className="rounded-lg [&_span]:flex"
                                >
                                    <div className="flex items-center gap-2 text-xs">
                                        <span
                                            className="flex h-3 w-3 shrink-0 rounded-xs"
                                            style={{ backgroundColor: `${config.color}` }}
                                        />
                                        {config?.label}
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="flex flex-1 justify-center pb-0">
                <ChartContainer
                    id={id}
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={safeChartData}
                            dataKey="values"
                            nameKey="label"
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={safeActiveIndex}
                            activeShape={({
                                outerRadius = 0,
                                ...props
                            }: PieSectorDataItem) => (
                                <g>
                                    <Sector {...props} outerRadius={outerRadius + 10} />
                                    <Sector
                                        {...props}
                                        outerRadius={outerRadius + 25}
                                        innerRadius={outerRadius + 12}
                                    />
                                </g>
                            )}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (
                                        viewBox &&
                                        "cx" in viewBox &&
                                        "cy" in viewBox &&
                                        safeChartData[safeActiveIndex]
                                    ) {
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
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {formattedValue(safeChartData[safeActiveIndex].values, true, "GBP")}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {safeChartData[safeActiveIndex].label}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
