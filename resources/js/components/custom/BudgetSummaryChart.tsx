import httpClient from '@/lib/axios';
import React, { useEffect, useState } from 'react'
import { ChartPieInteractive } from '../charts/ChartPieInteractive';

const BudgetSummaryChart = ({refresh} : {refresh: boolean}) => {
    const [chartData, setChartData] = useState([]);
    const [chartConfig, setChartConfig] = useState({});
    const [id, setId] = useState('');

    const fetchChartData = async () => {
        try {
            const response = await httpClient.get(route('api.fetch-budget-chart-data'));
            const data = await response.data.body;
            setChartData(data.chartData);
            setChartConfig(data.chartConfig);
            setId(data.id);
            console.log(data);
            
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };
    useEffect(() => {
        fetchChartData();
    }, [refresh]);
    return (
        <div>
            { chartData.length > 0 && <ChartPieInteractive chartData={chartData} chartConfig={chartConfig} title='Categories - Summary' description='Total budgetted amount' /> }
        </div>
    )
}

export default BudgetSummaryChart