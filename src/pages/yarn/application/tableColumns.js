import moment from "moment";
import { isObj } from "src/tools/utils";

export const baseColumns = [
    {
        title: '队列名称',
        dataIndex: 'poolName',
        width: 180,
    },
    {
        title: '最大内存使用量',
        dataIndex: 'maxMemoryStr',
        width: 180,
    },
    {
        title: '最小内存使用量',
        dataIndex: 'minMemoryStr',
        width: 180,
    },
    {
        title: '最大CPU个数',
        dataIndex: 'maxCpu',
        width: 180,
    },
    {
        title: '最小CPU个数',
        dataIndex: 'minCpu',
        width: 180,
    },
];
export const memoryTopNColumns = [
    {
        title: '程序名称',
        dataIndex: 'programName',
        width: 180,
    },
    {
        title: '最终状态',
        dataIndex: 'state',
        width: 180,
    },
    {
        title: '区间内最大内存',
        dataIndex: 'allocatedMaxMemory',
        sorter: (a, b) => a.allocatedMaxMemory.localeCompare(b.allocatedMaxMemory),
        width: 180,
    },
    {
        title: '区间内最大CPU',
        dataIndex: 'allocatedMaxVcore',
        sorter: (a, b) => a.allocatedMaxVcore - b.allocatedMaxVcore,
        width: 180,
    },
    {
        title: '总运行时长',
        dataIndex: 'runningTime',
        sorter: (a, b) => a.runningTime - b.runningTime,
        width: 180,
    },
    {
        title: '开始时间',
        dataIndex: 'startTime',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        sorter: (a, b) => a.startTime.localeCompare(b.startTime),
        width: 180,
    },
    {
        title: '程序类型',
        dataIndex: 'type',
        width: 180,
    },
    {
        title: '队列',
        dataIndex: 'pool',
        width: 180,
    },
    {
        title: '租户',
        dataIndex: 'user',
        width: 180,
    },
    {
        title: '程序ID',
        dataIndex: 'programId',
        width: 180,
    },
]; // 内存应用详情
export const cpuTopNColumns = [
    {
        title: '程序名称',
        dataIndex: 'programName',
        width: 180,
    },
    {
        title: '最终状态',
        dataIndex: 'state',
        width: 180,
    },
    {
        title: '区间内最大CPU(个数)',
        dataIndex: 'allocatedMaxVcore',
        sorter: (a, b) => a.allocatedMaxVcore - b.allocatedMaxVcore,
        width: 200,
    },
    {
        title: '区间内最大内存',
        dataIndex: 'allocatedMaxMemory',
        sorter: (a, b) => (a.allocatedMaxMemory).localeCompare(b.allocatedMaxMemory),
        width: 180,
    },
    {
        title: '总运行时长',
        dataIndex: 'runningTime',
        sorter: (a, b) => a.runningTime - b.runningTime,
        width: 180,
    },
    {
        title: '开始时间',
        dataIndex: 'startTime',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        sorter: (a, b) => (a.startTime).localeCompare(b.startTime),
        width: 180,
    },
    {
        title: '程序类型',
        dataIndex: 'type',
        width: 180,
    },
    {
        title: '队列',
        dataIndex: 'pool',
        width: 180,
    },
    {
        title: '租户',
        dataIndex: 'user',
        width: 180,
    },
    {
        title: '程序ID',
        dataIndex: 'programId',
        width: 180,
    },
]; // cpu应用详情


const getColRender = (text, obj, isFirstClo) => {
    // const colLen = unSuccessColumns.length;
    return {
        children: text,
        props: {
            colSpan: isFirstClo ?
                obj.isSpan ? 7 : undefined :
                obj.isSpan ? 0 : undefined,
        },
    };
};
export const unSuccessColumns = [
    {
        title: '程序ID',
        dataIndex: 'programId',
        width: 200,
        onCell: (obj) => ({
            style: {
                background: obj.isSpan ? '#F2F7FC' : 'transparent'
            }
        }),
        render: (text, obj) => getColRender(text, obj, true),
    },
    {
        title: '程序类型',
        dataIndex: 'type',
        width: 120,
        render: (text, obj) => getColRender(text, obj),
    },
    {
        title: '区间内最大内存',
        dataIndex: 'allocatedMaxMemory',
        width: 150,
        render: (text, obj) => getColRender(text, obj),
    },
    {
        title: '区间内最大CPU（个数）',
        dataIndex: 'allocatedMaxVcore',
        width: 200,
        render: (text, obj) => getColRender(text, obj),
    },
    {
        title: '总运行时长',
        dataIndex: 'runningTimeStr',
        width: 150,
        render: (text, obj) => getColRender(text, obj),
    },
    {
        title: '租户',
        dataIndex: 'user',
        width: 150,
        render: (text, obj) => getColRender(text, obj),
    },
    {
        title: '所属应用',
        dataIndex: 'programName',
        width: 150,
        render: (text, obj) => getColRender(text, obj),
    },
];

// 生成可分组合并的数据源
export const getSpanSource = (source, pageSize = 10) => {
    if (!isObj(source)) return [];

    const firstDataIndex = unSuccessColumns[0].dataIndex;
    let index = 0;
    let res = [];
    let lastKey = ''; // 记录上一个key, 翻页后第一行需要展示

    Object.keys(source).forEach((key) => {
        if (!source.hasOwnProperty(key)) return;

        lastKey = key;
        res.push({ [firstDataIndex]: key, index: index, isSpan: true }); // isSpan标识是否合并
        index += 1;
        source[key].forEach(d => {
            if (index % pageSize === 0) {
                res.push({ [firstDataIndex]: lastKey, index: index, isSpan: true });
                index += 1;
            }
            res.push({ ...d, index: index });
            index += 1;
        });
    });
    return res;
};
