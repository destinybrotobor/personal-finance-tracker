import React from 'react'
import { Card, CardContent } from '../ui/card'
import { ChartRadialText } from '../charts/ChartRadialText'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { CalendarIcon, EllipsisVertical, Plus, ReceiptText } from 'lucide-react'
import { useFormattedValue } from '@/hooks/useFormattedValue'

const BudgetCard = ({ budget, setShowAddModal } : { budget: any, setShowAddModal: (show: boolean) => void }) => {
    const formattedValue = useFormattedValue();

    return (
        <div>
            <Card className="gap-4 p-0">
                <CardContent className="flex items-center gap-3 py-1 px-4">
                    <div className='w-24'>
                        <ChartRadialText size='md' data={[{ label: budget.category.name, value: budget.amount, percentage: budget.percentage, fill: budget.progress_color }]} />
                    </div>
                    <aside className='flex-1 flex justify-between items-start gap-3'>
                        <div>
                            <span className={`capitalize text-xs font-semibold ${budget.category.type === 'expenses' ? 'text-red-500' : budget.category.type === 'income' ? 'text-red-green' : 'text-corporate-blue'}`}>{ budget.category.type }</span>
                            <h3 className='text-lg font-semibold'>{ formattedValue(budget.amount, true, 'GBP') }</h3>
                            <p className='text-sm text-muted-foreground'> you have used { formattedValue(budget.spent, true, 'GBP') } of your budget on { budget.category.name }</p>
                        </div>
                        <div className='flex items-center justify-between mt-2'>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <EllipsisVertical className="h-4 w-4 ml-1" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setShowAddModal(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add New Budget
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <ReceiptText className="mr-2 h-4 w-4" />
                                        View Budget Report
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        Set Budget Period
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </aside>
                </CardContent>
            </Card>
        </div>
    )
}

export default BudgetCard