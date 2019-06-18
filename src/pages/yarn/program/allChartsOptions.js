import update from 'immutability-helper';
import { axisColor, topNColors, getFormatterLegend } from '../yarnUtils';

/***
 * 获取option.series
 * @param i 索引
 * @param name 名称
 * @param data 数据
 */
export function getSeries(i, name, data) {
    return {
        name: name,
        type: 'line',
        stack: 'Stack',
        smooth: true,
        lineStyle: {
            normal: {
                width: 1,
                color: topNColors[i],
            }
        },
        areaStyle: {
            normal: {
                opacity: 0.9,
                color: topNColors[i]
            }
        },
        data: data,
    };
}

const trendOption = {
    animation: false,
    tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(31,31,31,0.9)',
        axisPointer: {
            lineStyle: {
                color: '#555555'
            }
        },
    },
    grid: {
        top: "20%",
        bottom: "30%",
        left: '10%',
        // right: '15%',
    },
    legend: {
        textStyle: { color: axisColor },
        selectedMode: false,//取消图例上的点击事件
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 14,
        data: [],
    },
    xAxis: [
        {
            type: 'category',
            axisLabel: {
                color: axisColor,
                interval: 0,
                padding: [5, 0, 0, 0],
            },
            axisLine: { show: false, },
            axisTick: { show: false },
            data: [],
        }
    ],
    yAxis: [
        {
            type: 'value',
            name: '百分比（%）',
            position: 'left',
            nameTextStyle: { color: axisColor },
            min: 0,
            max: 100,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: axisColor },
            splitArea: { show: false },
            splitLine: {
                show: true,
                lineStyle: { color: '#E5E5E5' },
            },
        },
        {
            show: false,
            type: 'value',
            name: '百分比（%）',
            min: 0,
            max: 100,
            position: 'left',
            offset: 80,
        },
        {
            type: 'value',
            name: '程序个数',
            // min: 0,
            // max: 100,
            position: 'right',
            nameTextStyle: { color: axisColor },
            splitLine: { show: false },
            axisLine: { show: false, },
            axisTick: { show: false },
            axisLabel: { color: axisColor },
            splitArea: { show: false },
        },
    ],
    series: [
        {
            name: '正在运行程序',
            yAxisIndex: 2,
            type: 'bar',
            stack: 'Stack',
            itemStyle: {
                color: '#F6BF18',
                barBorderRadius: 11,
            },
            markArea: {
                silent: true, // 需要有tooltip显示则设置为false
                itemStyle: {
                    color: axisColor,
                    shadowColor: '#DAE9FB',
                    shadowBlur: 1,
                    opacity: 0.2,
                },
                data: [
                    [{
                        x: 0, // index
                    }, {
                        x: 0, // index
                    },]
                ],
            },
            data: [],
        },
        {
            name: '分配中程序',
            yAxisIndex: 2,
            type: 'bar',
            stack: 'Stack',
            itemStyle: {
                color: '#AAAAAA',
                barBorderRadius: 11,
            },
            data: [],
        },
        {
            name: '内存使用量占比',
            yAxisIndex: 0,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: [1, 1],
            showSymbol: false,
            lineStyle: {
                normal: {
                    width: 2
                }
            },
            itemStyle: {
                normal: {
                    // color: colors1[0],
                    // borderColor: colors1Shadow[1],
                    // borderWidth: 12
                }
            },
            data: [],
        },
        {
            name: '磁盘使用空间占比',
            yAxisIndex: 1,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: [1, 1],
            showSymbol: false,
            lineStyle: {
                normal: {
                    width: 2
                }
            },
            itemStyle: {
                normal: {
                    color: '#00AAE5',
                }
            },
            data: [],
        },
    ]
};

const topNTrendOption = {
    color: topNColors,
    tooltip: {
        show: true,
        backgroundColor: 'rgba(31,31,31,0.9)',
    },
    grid: {
        bottom: "10%",
        left: '10%',
        right: '10%'
    },
    legend: {
        textStyle: { color: axisColor },
        // selectedMode: false,//取消图例上的点击事件
        itemWidth: 8,
        itemHeight: 8,
        icon: 'pie',
        data: [],
        formatter: (name) => getFormatterLegend(name),
        tooltip: {
            show: true
        }
    },
    xAxis: [{
        type: "category",
        // boundaryGap: false,
        axisLine: { show: false, },
        axisLabel: {
            color: axisColor,
            interval: 0,
            align: 'left'
        },
        splitLine: { show: false },
        axisTick: { show: false },
        data: [],
    }],
    yAxis: [{
        type: "value",
        nameTextStyle: { color: axisColor },
        splitLine: { show: false },
        axisLine: { show: false, },
        axisTick: { show: false },
        axisLabel: { color: axisColor },
    }],
    series: [],
};


export const memoryTrendOption = update(trendOption, {
    legend: { data: { $set: ['内存使用量占比', '磁盘使用空间占比', '正在运行程序', '分配中程序'] } },
    series: {
        2: {
            name: { $set: '内存使用量占比' },
            itemStyle: { normal: { color: { $set: '#EF5934' } } },
        },
    },
});
export const cpuTrendOption = update(trendOption, {
    legend: { data: { $set: ['CPU使用量占比', '磁盘使用空间占比', '正在运行程序', '分配中程序'] } },
    series: {
        2: {
            name: { $set: 'CPU使用量占比' },
            itemStyle: { normal: { color: { $set: '#0B9F46' } } },
        }
    },

});
export const memoryTopNTrendOption = update(topNTrendOption, { yAxis: { 0: { name: { $set: '内存(GB)' } } }, });
export const cpuTopNTrendOption = update(topNTrendOption, { yAxis: { 0: { name: { $set: 'CPU个数' } } }, });

export const getTopNTooltip = (params, seriesSource, type) => {
    if (!params) return;
    const dataIndex = params.dataIndex;
    const seriesIndex = params.seriesIndex;
    const program = seriesSource[seriesIndex];
    if (!program) return '';
    const obj = program.programInfos[dataIndex];
    if (!obj) return '';
    return type === 'memory' ?
        `时间：${ obj.time }<br/>
         程序ID：${ obj.programId }<br/>
         程序名称：${ obj.programName && obj.programName !== 'null' ? obj.programName : '' }<br/>
         程序类型：${ obj.type && obj.type !== 'null' ? obj.type : '' }<br/>
         内存使用量：${ obj.allocatedMemoryGB }GB<br/>
         CPU个数：${ obj.allocatedVCores }` :
        `时间：${ obj.time }<br/>
         程序ID：${ obj.programId }<br/>
         程序名称：${ obj.programName && obj.programName !== 'null' ? obj.programName : '' }<br/>
         程序类型：${ obj.type && obj.type !== 'null' ? obj.type : '' }<br/>
         CPU个数：${ obj.allocatedVCores }<br/>
         内存使用量：${ obj.allocatedMemoryGB }GB`;
};
