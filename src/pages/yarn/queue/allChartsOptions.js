import update from 'immutability-helper';
import { axisColor, topNColors, getFormatterLegend } from '../yarnUtils';


/***
 * 获取option.series
 * @param i 索引
 * @param name 名称
 * @param data 数据
 * @param isNeedMarkArea 是否需要markArea
 */
export function getSeries(i, name, data, isNeedMarkArea) {
    return {
        name: name,
        type: 'line',
        stack: 'Stack',
        smooth: true,
        lineStyle: {
            normal: {
                width: 1,
                color: topNColors[i], // 线条颜色
            }
        },
        areaStyle: {
            normal: {
                opacity: 0.9,
                color: topNColors[i]
            }
        },
        markArea: i === 0 && isNeedMarkArea ?
            {
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
            } :
            undefined,
        data: data
    };
}

const trendOption = {
    animation: false,
    color: topNColors,
    tooltip: {
        show: true,
        backgroundColor: 'rgba(31,31,31,0.9)',
    },
    grid: {
        bottom: "25%",
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
    series: [
        {
            type: 'line',
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
        },],
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

export const memoryTrendOption = update(trendOption, { yAxis: { 0: { name: { $set: '内存(GB)' } } } });
export const cpuTrendOption = update(trendOption, { yAxis: { 0: { name: { $set: 'CPU个数' } } } });
export const memoryTopNTrendOption = update(topNTrendOption, { yAxis: { 0: { name: { $set: '内存(GB)' } } } });
export const cpuTopNTrendOption = update(topNTrendOption, { yAxis: { 0: { name: { $set: 'CPU个数' } } } });


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
