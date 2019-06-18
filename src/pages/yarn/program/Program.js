import React, { Component, Fragment } from 'react';
import { Icon, Button, DatePicker, Radio, message, Input, Divider } from "antd";
import moment from 'moment';
import update from 'immutability-helper';
import api from 'src/tools/api';
import { downloadFile } from "src/tools/utils";
import { BackToTop } from "src/components/LittleComponents";
import SDTable from 'src/components/SDTable';
import Context from '../Context';
import {
    memoryTrendOption,
    cpuTrendOption,
    memoryTopNTrendOption,
    cpuTopNTrendOption,
    getSeries,
    getTopNTooltip,
} from './allChartsOptions';
import { memoryTopNColumns, cpuTopNColumns, historyColumns, overRunningTimeColumns } from './tableColumns';
import { ControllerChart, LinkChart, LinkTable, BlockWrapper, ChartPages, ExportButton } from '../components/Block';
import { getStartAndEndTime, getXAxisData, } from '../yarnUtils';


const overRunningTime = '180';

export default class Program extends Component {

    static contextType = Context;

    state = {
        timeType: 3,
        historyTimeType: 3,
        memoryTrend: {
            chartOption: memoryTrendOption, // 内存总体趋势
            loading: true,
            interval: '',
            sliderParam: {},
        },
        memoryTopNTrend: {
            chartOption: memoryTopNTrendOption, // 内存TopN趋势
            loading: true,
            interval: '',
            pageIndex: 0,
        },
        memoryTopNDetail: {  // 各程序内存详情
            dataSource: [],
            loading: true,
        },
        memoryTotalSpace: {
            memory: '',
            historyMemory: '',
            disk: '',
        },
        cpuTrend: {
            chartOption: cpuTrendOption, // 内存总体趋势
            loading: true,
            interval: '',
            sliderParam: {},
        },
        cpuTopNTrend: {
            chartOption: cpuTopNTrendOption, // CPU TopN趋势
            loading: true,
            interval: '',
            pageIndex: 0,
        },
        cpuTopNDetail: {  // 各程序内存详情
            dataSource: [],
            loading: true,
        },
        cpuTotalSpace: {
            cpu: '',
            historyCpu: '',
            disk: '',
        },
        historyTable: {
            loading: true,
            dataSource: [],
            pagination: {
                current: 1,
                pageSize: 2,
                total: 0
            },
        },
        historySearchValue: '',
        overRunningTimeTable: {
            dataSource: [],
            loading: false,
        },
        overRunningTime: overRunningTime,
    };

    memoryTrendData = []; // 内存趋势图数据, 用在滑块获取日期
    cpuTrendData = []; // cpu趋势图数据, 用在滑块获取日期
    memoryTopNSeries = []; // 内存 TopN series 数据, 翻页作用
    cpuTopNSeries = []; // cpu TopN series 数据, 翻页作用
    memoryTopNDetailSource = []; // 内存 TopN 详情表格数据, 翻页与导出的数据作用
    cpuTopNDetailSource = []; // cpu TopN 详情表格数据, 翻页与导出的数据作用

    totalStartTime = moment().subtract(24, "hours").format('YYYY-MM-DD HH:mm:ss');
    totalEndTime = moment().format('YYYY-MM-DD HH:mm:ss');
    memoryLinkStartTime = ''; // 内存被联动开始时间
    memoryLinkEndTime = ''; // 内存被联动结束时间
    cpuLinkStartTime = ''; // cpu被联动开始时间
    cpuLinkEndTime = ''; // cpu被联动结束时间
    historyStartTime = moment().subtract(24, "hours").format('YYYY-MM-DD HH:mm:ss'); // 程序历史开始时间
    historyEndTime = moment().format('YYYY-MM-DD HH:mm:ss'); // 程序历史结束时间
    customTotalStartTime = ''; // 自定义开始时间
    customTotalEndTime = ''; // 自定义结束时间
    customHistoryStartTime = ''; // 自定义程序历史开始时间
    customHistoryEndTime = ''; // 自定义程序历史结束时间

    componentDidMount() {
        if (!this.context.clusterValue) return;
        this.getMemoryTrend({ cluster: this.context.clusterValue }); // 获取内存趋势图数据并加载图表
        this.getCpuTrend({ cluster: this.context.clusterValue });
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextContext.clusterRequestError) { // 请求集群有误
            this.updateState({
                memoryTrend: { loading: { $set: false } },
                memoryTopNTrend: { loading: { $set: false } },
                memoryTopNDetail: { loading: { $set: false } },
                cpuTrend: { loading: { $set: false } },
                cpuTopNTrend: { loading: { $set: false } },
                cpuTopNDetail: { loading: { $set: false } },
                historyTable: { loading: { $set: false } },
                overRunningTimeTable: { loading: { $set: false } },
            });
        } else if (this.context.clusterValue !== nextContext.clusterValue) {
            this.updateState({
                timeType: { $set: 3 },
                historyTimeType: { $set: 3 },
                overRunningTime: { $set: overRunningTime },
                historySearchValue: { $set: '' },
                memoryTrend: { loading: { $set: true }, },
                memoryTopNTrend: { loading: { $set: true }, },
                memoryTopNDetail: { loading: { $set: true } },
                cpuTrend: { loading: { $set: true }, },
                cpuTopNTrend: { loading: { $set: true }, },
                cpuTopNDetail: { loading: { $set: true } },
                historyTable: { loading: { $set: true } },
                overRunningTimeTable: { loading: { $set: true } },
            });

            this.getMemoryTrend({ cluster: nextContext.clusterValue }); // 获取内存趋势图数据并加载图表
            this.getCpuTrend({ cluster: nextContext.clusterValue });
            this.getProgramHistoryDetail(nextContext.clusterValue);
            this.getOverRunningTimeProgram(nextContext.clusterValue, overRunningTime);
        }
    }

    updateState = (obj, callback) => {
        this.setState(update(this.state, obj), () => callback && callback());
    };

    // 集群内存总体情况
    getMemoryTrend = ({ cluster, startTime, endTime }) => {
        const errorHandler = () => {
            this.updateState({
                memoryTrend: {
                    chartOption: { $set: memoryTrendOption }, // 内存总体趋势
                    loading: { $set: false },
                    interval: { $set: '' },
                },
                memoryTopNTrend: {
                    loading: { $set: false },
                    chartOption: { $set: memoryTopNTrendOption },
                    interval: { $set: '' },
                },
                memoryTopNDetail: {
                    dataSource: { $set: [] },
                    loading: { $set: false }
                },
            });
            this.memoryTrendData = [];
        };
        api.getClusterYarnMemoryInfo({
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.totalStartTime,
            endTime: endTime || this.totalEndTime,
        })
            .then(res => {
                const response = res.data;
                if (response.success !== 'true') {
                    message.error('获取集群内存总体情况失败: ' + response.msg);
                    errorHandler();
                    return;
                }

                const data = response.data;
                this.memoryTrendData = data.pointDTOS;

                const startPosition = 50, endPosition = 100;
                const startIndex = Math.floor(startPosition / 100 * this.memoryTrendData.length - 1);
                const endIndex = Math.floor(endPosition / 100 * this.memoryTrendData.length - 1);
                const startTime = this.memoryTrendData[startIndex].time;
                const endTime = this.memoryTrendData[endIndex].time;

                let x = [], y1 = [], y2 = [], y3 = [], y4 = [], maxY = data.rightYMax;
                const split = Math.round(this.memoryTrendData.length / 3);
                const interval = data.interval;
                this.memoryTrendData && this.memoryTrendData.forEach((d, i) => {
                    x.push(getXAxisData(d.time, i, interval, this.memoryTrendData.length, split, x));
                    y1.push(d.memoryRate * 100);
                    y2.push(d.diskRate * 100);
                    y3.push(d.runningAppCount);
                    y4.push(d.acceptedAppCount);
                    maxY < d.appCount && (maxY = d.appCount);
                });
                this.updateState({
                    memoryTotalSpace: {
                        memory: { $set: data.totalMemorySpace },
                        disk: { $set: data.totalDiskSpace },
                        historyMemory: { $set: data.historyTotalMemorySpace },
                    },
                    memoryTrend: {
                        loading: { $set: false },
                        interval: { $set: data.interval },
                        chartOption: {
                            xAxis: {
                                0: { data: { $set: x } },
                            },
                            yAxis: {
                                2: {
                                    max: { $set: maxY },
                                }
                            },
                            series: {
                                0: { data: { $set: y3 } },
                                1: { data: { $set: y4 } },
                                2: { data: { $set: y1 } },
                                3: { data: { $set: y2 } },
                            },
                            tooltip: {
                                formatter: {
                                    $set: (params) => {
                                        if (!params) return;
                                        const index = params[0].dataIndex;
                                        const obj = this.memoryTrendData[index];
                                        if (!obj) return '';
                                        return `时间：${ obj.time }<br/>
                                                    内存使用量占比：${ obj.memoryRate ? Math.round(obj.memoryRate * 100).toFixed(2) : '' }%<br/>
                                                    内存使用量: ${ obj.memoryUsed }<br/>
                                                    磁盘使用空间占比：${ obj.diskRate ? (obj.diskRate * 100).toFixed(2) : '' }%<br/>
                                                    程序运行中/待分配: ${ obj.runningAppCount }/${ obj.acceptedAppCount }<br/>
                                                    程序个数：${ obj.appCount }<br/>
                                                    CPU个数：${ obj.cpuUsed }`
                                    }
                                }
                            }
                        },
                        sliderParam: {
                            $set: {
                                startPosition,
                                endPosition,
                                startTime: startTime.slice(0, 16),
                                endTime: endTime.slice(0, 16),
                            }
                        }
                    },
                });
                this.getMemoryTopNTrend({ cluster, startTime, endTime });
            })
            .catch((e) => {
                console.error(e);
                errorHandler();
            });
    };

    // 区间内内存TOPN程序趋势图
    getMemoryTopNTrend = ({ cluster, startTime, endTime } = {}) => {
        const errorHandler = () => {
            this.updateState({
                memoryTopNTrend: {
                    loading: { $set: false },
                    interval: { $set: '' },
                    chartOption: { $set: memoryTopNTrendOption },
                },
                memoryTopNDetail: {
                    dataSource: { $set: [] },
                    loading: { $set: false },
                },
            });
            this.memoryTopNSeries = [];
            this.memoryTopNDetailSource = null;
        };
        const params = {
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.memoryLinkStartTime || this.totalStartTime,
            endTime: endTime || this.memoryLinkEndTime || this.totalEndTime,
        };
        api.getTopProgramMemory(params)
            .then(res => {
                const response = res.data;
                const data = response.data || [];
                if (response.success !== 'true' || (!data.programInfos || !data.programInfos[0])) {
                    message.error('获取区间内内存TOPN程序趋势失败: ' + response.msg);
                    errorHandler();
                    return;
                }

                // 获取内存详情表格
                this.getMemoryTopNDetail(params);

                const exampleData = data.programInfos[0].programInfos;
                const split = Math.round(exampleData.length / 5);
                const interval = data.interval;
                // 分top10与top11-20两组. echart是从越靠后的数据越在stack的上面, 需要reverse
                const groupData = [data.programInfos.slice(0, 10).reverse(), data.programInfos.slice(10, 20).reverse()];
                // 每个组循环, 生成各组的series
                this.memoryTopNSeries = [];
                groupData.forEach((group) => {
                    let xAxis = [], series = [], legend = [];
                    group.forEach((first, i) => {
                        let seriesData = [];
                        first.programInfos && first.programInfos.forEach((d, j) => {
                            // first.programInfos的length与time是相同的, x轴标签在组内第一个循环中添加标签
                            i === 0 && xAxis.push(getXAxisData(d.time, j, interval, exampleData.length, split, xAxis));
                            seriesData.push(d.allocatedMemoryGB);
                        });
                        legend.push(first.programId);
                        series.push(getSeries(i, first.programId, seriesData))
                    });
                    this.memoryTopNSeries.push({ legend, series, xAxis, source: group });
                });
                const pageIndex = this.state.memoryTopNTrend.pageIndex;
                const top10 = this.memoryTopNSeries[pageIndex];
                this.updateState({
                    memoryTopNTrend: {
                        loading: { $set: false },
                        interval: { $set: data.interval },
                        chartOption: {
                            legend: { data: { $set: top10.legend.reverse() } },
                            tooltip: {
                                formatter: {
                                    $set: (params) => {
                                        return getTopNTooltip(params, this.memoryTopNSeries[pageIndex].source, 'memory');
                                    }
                                }
                            },
                            xAxis: {
                                0: { data: { $set: top10.xAxis } },
                            },
                            series: { $set: top10.series },
                        },
                    },
                });
            })
            .catch((e) => {
                console.error(e);
                errorHandler();
            });
    };

    // 各程序内存详情
    getMemoryTopNDetail = (params) => {
        api.getTopProgramMemoryDetail(params).then(res => {
            const response = res.data;
            if (response.success !== 'true') {
                message.error('获取各程序内存详情失败: ' + response.msg);
                this.updateState({
                    memoryTopNDetail: {
                        dataSource: { $set: [] },
                        loading: { $set: false },
                    }
                });
                this.memoryTopNDetailSource = null;
                return;
            }
            this.memoryTopNDetailSource = response;
            const data = response.data;
            this.updateState({
                memoryTopNDetail: {
                    dataSource: { $set: data && data.slice(0, 10).map((d, i) => ({ ...d, index: i + 1 })) },
                    loading: { $set: false }
                }
            });
        });
    };

    // 集群CPU总体趋势图
    getCpuTrend = ({ cluster, startTime, endTime }) => {
        const errorHandler = () => {
            this.updateState({
                cpuTrend: {
                    chartOption: { $set: cpuTrendOption }, // 内存总体趋势
                    loading: { $set: false },
                    interval: { $set: '' },
                },
                cpuTopNTrend: {
                    loading: { $set: false },
                    chartOption: { $set: cpuTopNTrendOption },
                    interval: { $set: '' },
                },
                cpuTopNDetail: {
                    dataSource: { $set: [] },
                    loading: { $set: false }
                },
            });
            this.cpuTrendData = [];
        };
        api.getClusterYarnCpuInfo({
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.totalStartTime,
            endTime: endTime || this.totalEndTime,
        })
            .then(res => {
                const response = res.data;
                if (response.success !== 'true') {
                    message.error('获取集群CPU总体情况失败: ' + response.msg);
                    errorHandler();
                    return;
                }
                const data = response.data;
                this.cpuTrendData = data.pointDTOS;

                const startPosition = 50, endPosition = 100;
                const startIndex = Math.floor(startPosition / 100 * this.cpuTrendData.length - 1);
                const endIndex = Math.floor(endPosition / 100 * this.cpuTrendData.length - 1);
                const startTime = this.cpuTrendData[startIndex].time;
                const endTime = this.cpuTrendData[endIndex].time;

                let x = [], y1 = [], y2 = [], y3 = [], y4 = [];
                const split = Math.round(this.cpuTrendData.length / 3);
                const interval = data.interval;
                this.cpuTrendData && this.cpuTrendData.forEach((d, i) => {
                    x.push(getXAxisData(d.time, i, interval, this.cpuTrendData.length, split, x));
                    y1.push(d.cpuRate * 100);
                    y2.push(d.diskRate * 100);
                    y3.push(d.runningAppCount);
                    y4.push(d.acceptedAppCount);
                });

                this.updateState({
                    cpuTotalSpace: {
                        cpu: { $set: data.totalCpuNum },
                        historyCpu: { $set: data.historyTotalCpuNum },
                        disk: { $set: data.totalDiskSpace },
                    },
                    cpuTrend: {
                        loading: { $set: false },
                        interval: { $set: data.interval },
                        chartOption: {
                            xAxis: {
                                0: { data: { $set: x } },
                            },
                            yAxis: {
                                2: {
                                    max: { $set: 4 },
                                }
                            },
                            series: {
                                0: { data: { $set: y3 } },
                                1: { data: { $set: y4 } },
                                2: { data: { $set: y1 } },
                                3: { data: { $set: y2 } },
                            },
                            tooltip: {
                                formatter: {
                                    $set: (params) => {
                                        if (!params) return;
                                        const index = params[0].dataIndex;
                                        const obj = this.memoryTrendData[index];
                                        if (!obj) return '';
                                        return `时间：${ obj.time }<br/>
                                    CPU使用量占比：${ obj.cpuRate * 100 }%<br/>
                                    CPU个数：${ obj.cpuUsed }<br/>
                                    磁盘使用空间占比：${ obj.diskRate * 100 }%<br/>
                                    程序运行中/待分配: ${ obj.runningAppCount }/${ obj.acceptedAppCount }<br/>
                                    程序个数：${ obj.appCount }<br/>
                                    内存使用量：${ obj.memoryUsed }`
                                    }
                                }
                            }
                        },
                        sliderParam: {
                            $set: {
                                startPosition,
                                endPosition,
                                startTime: startTime.slice(0, 16),
                                endTime: endTime.slice(0, 16),
                            }
                        }
                    },
                });
                this.getCpuTopNTrend({ cluster, startTime, endTime });
            })
            .catch((e) => {
                console.error(e);
                errorHandler();
            });
    };

    // 区间内TOPN程序CPU趋势图
    getCpuTopNTrend = ({ cluster, startTime, endTime } = {}) => {
        const errorHandler = () => {
            this.updateState({
                cpuTopNTrend: {
                    loading: { $set: false },
                    interval: { $set: '' },
                    chartOption: { $set: cpuTopNTrendOption },
                },
                cpuTopNDetail: {
                    dataSource: { $set: [] },
                    loading: { $set: false }
                },
            });
            this.cpuTopNSeries = [];
            this.cpuTopNDetailSource = null;
        };
        const params = {
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.cpuLinkStartTime || this.totalStartTime,
            endTime: endTime || this.cpuLinkEndTime || this.totalEndTime,
        };
        api.getTopProgramCpu(params)
            .then(res => {
                const response = res.data;
                const data = response.data || [];
                if (response.success !== 'true' || (!data.programInfos || !data.programInfos[0])) {
                    message.error('获取区间内内存TOPN程序趋势失败: ' + response.msg);
                    errorHandler();
                    return;
                }
                // 获取cpu详情表格
                this.getCpuTopNDetail(params);

                const exampleData = data.programInfos[0].programInfos;
                const split = Math.round(exampleData.length / 5);
                const interval = data.interval;
                const groupData = [data.programInfos.slice(0, 10).reverse(), data.programInfos.slice(10, 20).reverse()];
                this.cpuTopNSeries = [];
                groupData.forEach((group) => {
                    let xAxis = [], series = [], legend = [];
                    group.forEach((first, i) => {
                        let seriesData = [];
                        first.programInfos && first.programInfos.forEach((d, j) => {
                            i === 0 && xAxis.push(getXAxisData(d.time, j, interval, exampleData.length, split, xAxis));
                            seriesData.push(d.allocatedVCores);
                        });
                        legend.push(first.programId);
                        series.push(getSeries(i, first.programId, seriesData))
                    });
                    this.cpuTopNSeries.push({ legend, series, xAxis, source: group });
                });
                const pageIndex = this.state.memoryTopNTrend.pageIndex;
                const top10 = this.cpuTopNSeries[pageIndex];
                this.updateState({
                    cpuTopNTrend: {
                        loading: { $set: false },
                        interval: { $set: data.interval },
                        chartOption: {
                            legend: { data: { $set: top10.legend.reverse() } },
                            tooltip: {
                                formatter: {
                                    $set: (params) => {
                                        return getTopNTooltip(params, this.cpuTopNSeries[pageIndex].source, 'cpu');
                                    }
                                }
                            },
                            xAxis: {
                                0: { data: { $set: top10.xAxis } },
                            },
                            series: { $set: top10.series },
                        },
                    },
                });
            })
            .catch((e) => {
                console.error(e);
                errorHandler();
            });
    };

    // 区间内TOPN程序CPU详情
    getCpuTopNDetail = (params) => {
        api.getTopProgramCpuDetail(params).then(res => {
            const response = res.data;
            if (response.success !== 'true') {
                message.error('获取各程序内存详情失败: ' + response.msg);
                this.updateState({
                    cpuTopNDetail: {
                        dataSource: { $set: [] },
                        loading: { $set: false },
                    }
                });
                this.cpuTopNDetailSource = null;
                return;
            }
            this.cpuTopNDetailSource = response;
            const data = response.data;
            this.updateState({
                cpuTopNDetail: {
                    dataSource: { $set: data && data.slice(0, 10).map((d, i) => ({ ...d, index: i + 1 })) },
                    loading: { $set: false }
                }
            });
        });
    };

    // 获取程序历史详情
    getProgramHistoryDetail = (cluster, startTime, endTime, programName, currentPage) => {
        api.getProgramHistoryDetail({
            clusterName: cluster || this.context.clusterValue,
            beginTime: startTime || this.historyStartTime,
            endTime: endTime || this.historyEndTime,
            programName: programName || this.state.historySearchValue,
            currentPage: currentPage || 1,
            pageSize: 2,
        }).then(res => {
            const response = res.data;
            if (response.success !== 'true') {
                message.error('获取程序历史详情失败: ' + response.msg);
                this.updateState({
                    historyTable: {
                        loading: { $set: false },
                        dataSource: { $set: [] },
                        pagination: {
                            total: { $set: 0 }
                        },
                    }
                });
                return;
            }
            const data = response.data;
            this.updateState({
                historyTable: {
                    loading: { $set: false },
                    dataSource: { $set: data ? data.items.map((d, i) => ({ ...d, index: i + 1 })) : [] },
                    pagination: {
                        total: { $set: data ? data.total : 0 }
                    }
                }
            });

        });
    };

    // 程序运行时长
    getOverRunningTimeProgram = (cluster, overRunningTime) => {
        api.getOverRunningTimeProgram({
            clusterName: cluster || this.context.clusterValue,
            overRunningTime: overRunningTime || 0,
            limit: '100',
        }).then(res => {
            const response = res.data;
            if (response.success !== 'true') {
                message.error('获取程序运行时长失败: ' + response.msg);
                this.updateState({
                    overRunningTimeTable: {
                        loading: { $set: false },
                        dataSource: { $set: [] },
                    }
                });
                return;
            }
            this.updateState({
                overRunningTimeTable: {
                    loading: { $set: false },
                    dataSource: { $set: response.data ? response.data.map((d, i) => ({ ...d, index: i + 1 })) : [] },
                }
            });

        });
    };

    // 刷新
    refresh = () => {
        this.updateState({
            memoryTrend: {
                loading: { $set: true },
            },
            memoryTopNTrend: {
                loading: { $set: true },
            },
            memoryTopNDetail: {
                loading: { $set: true }
            },
            cpuTrend: {
                loading: { $set: true },
            },
            cpuTopNTrend: {
                loading: { $set: true },
            },
            cpuTopNDetail: {
                loading: { $set: true }
            },
        }, () => {
            this.getMemoryTrend({ startTime: this.totalStartTime, endTime: this.totalEndTime });
            this.getCpuTrend({ startTime: this.totalStartTime, endTime: this.totalEndTime });
        });
    };

    // 总体时间筛选
    onTotalTimeChange = (e) => {
        const type = e.target.value;
        let startTime = '', endTime = '';
        if (!type) { // type为自定义
            if (this.customTotalStartTime && this.customTotalEndTime) {
                startTime = this.customTotalStartTime;
                endTime = this.customTotalEndTime;
            }
        } else {
            const time = getStartAndEndTime(type);
            startTime = time.startTime;
            endTime = time.endTime;
        }
        this.totalStartTime = startTime;
        this.totalEndTime = endTime;
        this.setState({ timeType: type }, () => startTime && endTime && this.refresh());
    };

    // 历史详情时间筛选
    onHistoryTimeChange = (e) => {
        const type = e.target.value;
        let startTime = '', endTime = '';
        if (!type) { // type为自定义
            if (this.customHistoryStartTime && this.customHistoryEndTime) {
                startTime = this.customHistoryStartTime;
                endTime = this.customHistoryEndTime;
            }
        } else {
            const time = getStartAndEndTime(type);
            startTime = time.startTime;
            endTime = time.endTime;
        }
        this.historyStartTime = startTime;
        this.historyEndTime = endTime;
        this.setState({ historyTimeType: type }, () => {
                if (!(startTime && endTime)) return;
                this.updateState({
                    historyTable: {
                        loading: { $set: true },
                        pagination: {
                            current: { $set: 1 }
                        }
                    },
                });
                this.getProgramHistoryDetail('', this.historyStartTime, this.historyEndTime);
            }
        );
    };

    // 总体时间自定义
    onTotalDatePickerChange = (attr) => (obj, time) => {
        this[attr] = time;
        if (this.customTotalStartTime && this.customTotalEndTime) {
            if (this.customTotalStartTime >= this.customTotalEndTime) {
                message.error('开始时间必须小于结束时间');
                return;
            }
            this.getMemoryTrend({ startTime: this.customTotalStartTime, endTime: this.customTotalEndTime });
            this.getCpuTrend({ startTime: this.customTotalStartTime, endTime: this.customTotalEndTime });
        }
    };

    // 历史详情时间自定义
    onHistoryDatePickerChange = (attr) => (obj, time) => {
        this[attr] = time;
        if (this.customHistoryStartTime && this.customHistoryEndTime) {
            if (this.customHistoryStartTime >= this.customHistoryEndTime) {
                message.error('开始时间必须小于结束时间');
                return;
            }

            this.updateState({
                historyTable: {
                    loading: { $set: true },
                    pagination: {
                        current: { $set: 1 }
                    }
                }
            });
            this.getProgramHistoryDetail(undefined, this.customHistoryStartTime, this.customHistoryEndTime, '', 1);
        }
    };

    // 导出内存TopN数据
    exportTopNDetail = (type) => () => {
        let data, url;
        switch (type) {
            case 'memory':
                data = this.memoryTopNDetailSource;
                url = 'exportMemoryExcel';
                break;
            case 'cpu':
                data = this.cpuTopNDetailSource;
                url = 'exportCpuExcel';
                break;

            default:
                return;
        }
        if (!data) {
            message.error('无可导出数据');
            return;
        }
        api[url](data).then(res => downloadFile(res));
    };

    // 趋势图滑块拖动
    trendSliderEvent = (start, end) => {
        const len = this.memoryTrendData.length;
        if (!len) return;

        const startIndex = Math.floor(start * len - 1);
        const endIndex = Math.floor(end * len - 1);
        const startTime = this.memoryTrendData[startIndex < 0 ? 0 : startIndex].time;
        const endTime = this.memoryTrendData[endIndex > len - 1 ? len - 1 : endIndex].time;
        if (startTime === this.memoryLinkStartTime && endTime === this.memoryLinkEndTime) return;
        this.memoryLinkStartTime = startTime;
        this.memoryLinkEndTime = endTime;
        this.updateState({
            memoryTrend: {
                sliderParam: {
                    $set: {
                        startTime: startTime.slice(0, 16),
                        endTime: endTime.slice(0, 16),
                    }
                }
            },
            memoryTopNTrend: {
                loading: { $set: true },
            },
            memoryTopNDetail: {
                loading: { $set: true }
            },
        }, () => {
            this.getMemoryTopNTrend({ startTime, endTime });
        });

    };

    // cpu图滑块拖动
    cpuSliderEvent = (start, end) => {
        const len = this.cpuTrendData.length;
        if (!len) return;

        const startIndex = Math.floor(start * len - 1);
        const endIndex = Math.floor(end * len - 1);
        const startTime = this.cpuTrendData[startIndex < 0 ? 0 : startIndex].time;
        const endTime = this.cpuTrendData[endIndex > len - 1 ? len - 1 : endIndex].time;
        if (startTime === this.cpuLinkStartTime && endTime === this.cpuLinkEndTime) return;
        this.cpuLinkStartTime = startTime;
        this.cpuLinkEndTime = endTime;
        this.updateState({
            cpuTrend: {
                sliderParam: {
                    $set: {
                        startTime: startTime.slice(0, 16),
                        endTime: endTime.slice(0, 16),
                    }
                }
            },
            cpuTopNTrend: {
                loading: { $set: true },
            },
            cpuTopNDetail: {
                loading: { $set: true }
            },
        }, () => {
            this.getCpuTopNTrend({ startTime, endTime });
        });
    };

    // TopN图翻页
    onTopNPageChange = (type) => (page) => {
        let trendAttr, trendSeriesAttr, detailAttr, detailSourceAttr;
        switch (type) {
            case 'memory':
                trendAttr = 'memoryTopNTrend';
                trendSeriesAttr = 'memoryTopNSeries';
                detailAttr = 'memoryTopNDetail';
                detailSourceAttr = 'memoryTopNDetailSource';
                break;
            case 'cpu':
                trendAttr = 'cpuTopNTrend';
                trendSeriesAttr = 'cpuTopNSeries';
                detailAttr = 'cpuTopNDetail';
                detailSourceAttr = 'cpuTopNDetailSource';
                break;
            default:
                return;
        }
        this.updateState({
            [trendAttr]: {
                loading: { $set: true },
            },
            [detailAttr]: {
                loading: { $set: true },
            },
        }, () => {
            const exportData = this[detailSourceAttr].data;
            const currentData = this[trendSeriesAttr][page] || {};
            this.updateState({
                [trendAttr]: {
                    loading: { $set: false },
                    pageIndex: { $set: page },
                    chartOption: {
                        series: { $set: currentData.series },
                        legend: { data: { $set: currentData.legend.reverse() } },
                        xAxis: { data: { $set: currentData.xAxis } },
                        tooltip: {
                            formatter: {
                                $set: (params) => {
                                    return getTopNTooltip(params, currentData.source, type);
                                }
                            }
                        },
                    },
                },
                [detailAttr]: {
                    loading: { $set: false },
                    dataSource: { $set: page === 1 ? exportData.slice(10, 20) : exportData.slice(0, 10) },
                }
            });
        });
    };

    // 历史详情分页、排序、筛选变化时触发
    onHistoryTableChange = (pagination) => {
        if (pagination && pagination.current) {
            this.updateState({
                historyTable: {
                    pagination: { $set: pagination },
                    loading: { $set: true }
                }
            }, () => {
                this.getProgramHistoryDetail(undefined, undefined, undefined, '', pagination.current);
            });
        }
    };

    // 历史详情搜索框
    onHistorySearchChange = (value) => {
        this.updateState({
            historyTable: {
                loading: { $set: true },
                pagination: {
                    current: { $set: 1 }
                },
            },
            historySearchValue: { $set: value },
        }, () => {
            this.getProgramHistoryDetail(undefined, undefined, undefined, value, 1);
        });
    };

    // 运行时长input change
    onOverTimeInputChange = (e) => {
        const value = e.target.value;
        if (/^\d+$/g.test(value) || value === '') {
            this.setState({ overRunningTime: value });
        } else {
            message.destroy();
            message.warning('只允许输入正整数')
        }
    };

    // 运行时长刷新
    onOverTimeRefresh = () => {
        this.updateState({
            overRunningTimeTable: {
                loading: { $set: true },
            }
        });
        this.getOverRunningTimeProgram(undefined, Number(this.state.overRunningTime));
    };

    render() {
        const state = this.state;

        return (
            <Fragment>
                <BackToTop wrapperId='routerWrapper'/>
                <div>
                    <div
                        className="block-title"
                        style={ { fontSize: '16px', margin: '19px 0 7px', overflow: 'hidden' } }
                    >
                        程序内存CPU趋势图
                        <div style={ { float: 'right' } }>
                            <Radio.Group
                                className="radio-button"
                                onChange={ this.onTotalTimeChange }
                                value={ state.timeType }>
                                <Radio.Button key={ 'time_' + 1 } value={ 1 }>最近6小时</Radio.Button>
                                <Radio.Button key={ 'time_' + 2 } value={ 2 }>最近12小时</Radio.Button>
                                <Radio.Button key={ 'time_' + 3 } value={ 3 }>最近24小时</Radio.Button>
                                <Radio.Button key={ 'time_' + 4 } value={ 4 }>最近7天</Radio.Button>
                                <Radio.Button key={ 'time_' + 0 } value={ 0 }>自定义</Radio.Button>
                            </Radio.Group>
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="开始时间"
                                disabled={ state.timeType !== 0 }
                                style={ { width: '160px', minWidth: '160px', marginRight: '12px' } }
                                onChange={ this.onTotalDatePickerChange('customTotalStartTime') }
                            />
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="结束时间"
                                disabled={ state.timeType !== 0 }
                                style={ { width: '160px', minWidth: '160px', marginRight: '12px' } }
                                onChange={ this.onTotalDatePickerChange('customTotalEndTime') }
                            />

                            <Button htmlType="button"
                                    type="primary"
                                    className="sd-minor no-gradient"
                                    onClick={ this.refresh }
                                    style={ { height: '30px', lineHeight: '30px', fontSize: '13px' } }
                            >刷新</Button>
                        </div>
                    </div>

                    <div className="part">
                        <BlockWrapper
                            className="block-wrapper left white-bg"
                            title={ <div>
                                集群内存总体趋势图
                                <span className="sd-sub-title">
                                    当月/上月总内存：{ state.memoryTotalSpace.memory } / { state.memoryTotalSpace.historyMemory }
                                    <Divider type="vertical"/>
                                    总磁盘空间：{ state.memoryTotalSpace.disk }
                                </span>
                            </div> }
                        >
                            <ControllerChart
                                id='programMemoryTrend'
                                sliderEvent={ this.trendSliderEvent }
                                { ...state.memoryTrend }/>
                        </BlockWrapper>

                        <BlockWrapper
                            className="block-wrapper right white-bg"
                            title={ <div>
                                集群CPU总体趋势图
                                <span className="sd-sub-title">
                                    当月/上月总CPU: { state.cpuTotalSpace.cpu }/{ state.cpuTotalSpace.historyCpu }
                                    <Divider type="vertical"/>
                                    总磁盘空间：{ state.cpuTotalSpace.disk }
                                </span>
                            </div> }
                        >
                            <ControllerChart
                                id='programCpuTrend'
                                sliderEvent={ this.cpuSliderEvent }
                                { ...state.cpuTrend }/>
                        </BlockWrapper>
                    </div>
                </div>

                <div>
                    <div
                        className="block-title"
                        style={ { fontSize: '16px', margin: '19px 0 7px', overflow: 'hidden' } }
                    >
                        程序区间内程序内存CPU详情
                    </div>

                    <div className="part box-shadow">
                        <BlockWrapper
                            className="block-wrapper left"
                            title='区间内TOPN程序内存趋势图'
                            isShowTitleExtra={ state.memoryTopNTrend.chartOption.series.length < 10 }
                            titleExtra={
                                <ChartPages
                                    pageIndex={ state.memoryTopNTrend.pageIndex }
                                    onPageChange={ this.onTopNPageChange('memory') }/>
                            }
                        >
                            <LinkChart id='programMemoryTopNTrend'{ ...state.memoryTopNTrend }/>
                        </BlockWrapper>

                        <BlockWrapper
                            className="block-wrapper right"
                            title='区间内TOPN程序CPU趋势图'
                            isShowTitleExtra={ state.cpuTopNTrend.chartOption.series.length < 10 }
                            titleExtra={
                                <ChartPages
                                    pageIndex={ state.cpuTopNTrend.pageIndex }
                                    onPageChange={ this.onTopNPageChange('cpu') }/>
                            }
                        >
                            <LinkChart id='programCpuTopNTrend'{ ...state.cpuTopNTrend }/>
                        </BlockWrapper>

                        <BlockWrapper
                            className="block-wrapper left no-title-border"
                            title='程序详情'
                            isShowTitleExtra={ true }
                            titleExtra={ <ExportButton exportExcel={ this.exportTopNDetail('memory') }/> }
                        >
                            <LinkTable options={ {
                                id: 'programMemoryDetail',
                                rowKey: 'index',
                                columns: memoryTopNColumns(this.onHistorySearchChange),
                                ...state.memoryTopNDetail,
                            } }/>
                        </BlockWrapper>

                        <BlockWrapper
                            className="block-wrapper right no-title-border"
                            title='程序详情'
                            isShowTitleExtra={ true }
                            titleExtra={ <ExportButton exportExcel={ this.exportTopNDetail('cpu') }/> }
                        >
                            <LinkTable options={ {
                                id: 'programCpuDetail',
                                rowKey: 'index',
                                columns: cpuTopNColumns(this.onHistorySearchChange),
                                ...state.cpuTopNDetail,
                            } }/>
                        </BlockWrapper>
                    </div>
                </div>

                <div>
                    <div
                        className="block-title"
                        style={ { fontSize: '16px', margin: '19px 0 7px', overflow: 'hidden' } }
                    >
                        程序历史详情
                        <div style={ { float: 'right' } }>
                            <Radio.Group
                                className="radio-button" onChange={ this.onHistoryTimeChange }
                                value={ state.historyTimeType }>
                                <Radio.Button key={ 'time_running_' + 1 } value={ 1 }>最近6小时</Radio.Button>
                                <Radio.Button key={ 'time_running_' + 2 } value={ 2 }>最近12小时</Radio.Button>
                                <Radio.Button key={ 'time_running_' + 3 } value={ 3 }>最近24小时</Radio.Button>
                                <Radio.Button key={ 'time_running_' + 4 } value={ 4 }>最近7天</Radio.Button>
                                <Radio.Button key={ 'time_running_' + 0 } value={ 0 }>自定义</Radio.Button>
                            </Radio.Group>
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="开始时间"
                                disabled={ state.historyTimeType !== 0 }
                                style={ { width: '160px', minWidth: '160px', marginRight: '12px' } }
                                onChange={ this.onHistoryDatePickerChange('customHistoryStartTime') }/>
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="结束时间"
                                disabled={ state.historyTimeType !== 0 }
                                style={ { width: '160px', minWidth: '160px', marginRight: '12px' } }
                                onChange={ this.onHistoryDatePickerChange('customHistoryEndTime') }/>
                            <Input.Search
                                value={ state.historySearchValue }
                                placeholder="请输入程序名称"
                                style={ { width: '150px' } }
                                onChange={ (e) => this.onHistorySearchChange(e.target.value) }/>
                        </div>
                    </div>

                    <div className="block-wrapper box-shadow margin-for-shadow">
                        <SDTable
                            id="historyTable"
                            rowKey="index"
                            bordered={ true }
                            className="sd-table-simple"
                            style={ { padding: '16px' } }
                            columns={ historyColumns }
                            onChange={ this.onHistoryTableChange }
                            // scroll={ { x: '130%' } }
                            noEmptyImg={ true }
                            { ...state.historyTable }
                        />
                    </div>
                </div>

                <div>
                    <div
                        className="block-title"
                        style={ { fontSize: '16px', margin: '19px 0 7px', overflow: 'hidden' } }
                    >
                        程序运行时长
                        <div style={ { float: 'right' } }>
                            <span style={ { color: '#404040', fontSize: '14px' } }>
                            运行时长超过
                                <Input
                                    value={ state.overRunningTime }
                                    style={ { width: '80px', margin: '0 5px' } }
                                    onChange={ this.onOverTimeInputChange }
                                />
                            分钟
                            </span>
                            <Button
                                htmlType="button"
                                type="primary"
                                className="sd-minor no-gradient"
                                style={ { margin: '0 6px 0 25px' } }
                                onClick={ this.onOverTimeRefresh }
                            ><Icon type="sync"/>刷新</Button>
                        </div>
                    </div>

                    <div className="block-wrapper box-shadow margin-for-shadow">
                        <SDTable
                            id='overRunningTimeTable'
                            rowKey="index"
                            bordered={ true }
                            className="sd-table-simple"
                            style={ { padding: '16px' } }
                            columns={ overRunningTimeColumns }
                            pagination={ { pageSize: 5 } }
                            { ...state.overRunningTimeTable }
                        />
                    </div>
                </div>

            </Fragment>
        )
    }
}