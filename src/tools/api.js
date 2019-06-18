import { get, post } from './axios';

const auth = '/api/auth';
const install = '/api/automatic';
const cdhnm = '/api/cdhnm';

export default {
    wsUrl: `ws://172.168.201.40:9999/api/cdhnm/diskFailureRecovery/websocket`,

    logon: (params) => post(`${ auth }/user/signIn`, params),
    getCheckCode: (params) => get(`${ auth }/user/getCheckCode`, params),
    tokenRefresh: () => get(`${ auth }/token/refresh`),
    closeWait: () => get(`${ auth }/token/closeWait`),


    // 装机任务
    getAllBaseTask: (params) => get(`${ install }/baseTaskController/getAllBaseTask`, params), //装机任务列表
    createInstallTask: (params) => post(`${ install }/installTaskController/createInstallTask`, params),
    getInstallTaskByNameOrDesc: (params) => get(`${ install }/installTaskController/getInstallTaskByNameOrDesc?findStr=${ params }`),
    getInstallTaskById: (params) => get(`${ install }/installTaskController/getInstallTaskById?id=${ params }`),
    // 主机
    getAllHost: () => get(`${ install }/hostController/getAllHost`),
    getHostFuzzily: (params) => post(`${ install }/hostController/getHostByStatusAandSn`, params),
    downHostExcel: () => get(`${ install }/hostController/downHostExcel`, null, { responseType: 'blob' }),
    importHostExcel: (params) => post(`${ install }/hostController/importHostExcel`, params),
    updateHost: (params) => post(`${ install }/hostController/updateHostByIdAndSn`, params),
    // 装机结果
    getAllInstallRecord: (params) => get(`${ install }/intallRecordController/getAllInstallRecord`, params),
    getInstallRecordFuzzily: (params) => post(`${ install }/intallRecordController/getInstallRecordByStatusAndTaskIdOrHostSn`, params),
    getInstallRecordByTaskId: (params) => get(`${ install }/intallRecordController/getInstallRecordByTaskId?id=${ params }`),
    exportInstallRecord: (params) => get(`${ install }/intallRecordController/exportInstallRecord?ids=${ params }`, null, { responseType: 'blob' }),


    // 装机模板
    getAllModel: (params) => get(`${ install }/modelController/getAllModel`, params),
    getModelByNameOrDesc: (params) => get(`${ install }/modelController/getModelByNameOrDesc?findStr=${ params }`),
    addModel: (params) => post(`${ install }/modelController/addModel`, params),
    updateModel: (params) => post(`${ install }/modelController/updateModel`, params),
    removeModel: (params) => get(`${ install }/modelController/removeModel?id=${ params }`),
    batchRemoveModel: (params) => get(`${ install }/modelController/batchRemoveModel?ids=${ params }`),


    // 镜像
    getAllDistro: () => get(`${ install }/distroController/getAllDistro`),
    addDistro: (params) => post(`${ install }/distroController/addDistro`, params),
    removeDistro: (params) => get(`${ install }/distroController/removeDistro?id=${ params }`),
    getDistroById: (params) => get(`${ install }/distroController/getDistroById?id=${ params }`),
    updateDistro: (params) => post(`${ install }/distroController/updateDistro`, params),
    getDistroFuzzily: (params) => get(`${ install }/distroController/getDistroByNameUrlDesc?findStr=${ params }`),


    // KS文件
    getAllKs: () => get(`${ install }/ksController/getAllKs`),
    addKs: (params) => post(`${ install }/ksController/addKs`, params),
    removeKs: (params) => get(`${ install }/ksController/removeKs?id=${ params }`),
    getKsById: (params) => get(`${ install }/ksController/getKsById?id=${ params }`),
    updateKs: (params) => post(`${ install }/ksController/updateKs`, params),

    // 磁盘
    getUntreatedDiskList: () => get(`${ cdhnm }/diskFailureRecovery/getUnhandleDiskList`),
    getUnfinishedTaskList: () => get(`${ cdhnm }/diskFailureRecovery/getUnfinishedTaskList`),

    // 获取当前任务每个步骤状态
    getTaskStatusMsg: (params) => post(`${ cdhnm }/diskFailureRecovery/getTaskStatusMsg`, params),
    getRecoveringDiskMsgInUnloadStep: (params) => post(`${ cdhnm }/diskFailureRecovery/getRecoveringDiskMsgInUnloadStep`, params),//卸载列表数据
    createTask: (params) => post(`${ cdhnm }/diskFailureRecovery/createTask`, params),//确定卸载按钮
    completeUnloadDisks: (params) => post(`${ cdhnm }/diskFailureRecovery/unloadDisks`, params),//确定卸载按钮
    confirmUnloadedDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/confirmUnloadedDisk`, params),//卸载的下一步
    getRecoveringDiskMsgInChangeStep: (params) => post(`${ cdhnm }/diskFailureRecovery/getRecoveringDiskMsgInChangeStep`, params),//表格
    completeChangeDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/completeChangeDisk`, params),//确定换盘按钮
    confirmChangedDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/confirmChangedDisk`, params),//换盘的下一步
    getRecoveringDiskMsgInLoadStep: (params) => post(`${ cdhnm }/diskFailureRecovery/getRecoveringDiskMsgInLoadStep`, params),//表格
    completeLoadDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/loadDisks`, params),//确定换盘按钮
    confirmLoadedDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/confirmLoadedDisk`, params), //下一步
    getRecoveringDiskMsgInRebalanceStep: (params) => post(`${ cdhnm }/diskFailureRecovery/getRecoveringDiskMsgInRebalanceStep`, params),//表格
    completeRebalanceDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/rebalancingDisk`, params),//确定换盘按钮
    confirmRebalancedDisk: (params) => post(`${ cdhnm }/diskFailureRecovery/confirmRebalancedDisk`, params), //下一步
    getRecoveredDiskMsgInCompleteStep: (params) => post(`${ cdhnm }/diskFailureRecovery/getRecoveredDiskMsgInCompleteStep`, params), //完成
    retryProcess: (params) => post(`${ cdhnm }/diskFailureRecovery/retryProcess`, params), // 重试当前流程
    artificialRestorationProcess: (params) => post(`${ cdhnm }/diskFailureRecovery/artificialRestorationProcess`, params), // 人工修复
    confirmCompleteDiskRecoveryTask: (params) => post(`${ cdhnm }/diskFailureRecovery/confirmCompleteDiskRecoveryTask`, params), // 确认完成所有流程
    getProcessLogsDetail: (params) => post(`${ cdhnm }/diskFailureRecovery/getProcessLogsDetail`, params), // 获取详情与控制台日志
    exportChangingDiskMsgToExcel: (params) => post(`${ cdhnm }/diskFailureRecovery/ExportChangingDiskMsgToExcel`, params, { responseType: 'blob' }), // 换盘导出

    // yarn性能分析
    getClusterBasicInfo: () => get(`${ cdhnm }/cdhMetricWebServer/cluster/getClusterBasicInfo`), // 获取集群列表

    // 程序
    getClusterYarnMemoryInfo: (params) => get(`${ cdhnm }/cdhMetricWebServer/program/getClusterYarnMemoryInfo?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`), // 获取内存趋势
    getClusterYarnCpuInfo: (params) => get(`${ cdhnm }/cdhMetricWebServer/program/getClusterYarnCpuInfo?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`), // 获取内存趋势
    getTopProgramMemory: (params) => get(`${ cdhnm }/cdhMetricWebServer/program/getTopProgramMemory?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`), // 获取内存TopN
    getTopProgramCpu: (params) => get(`${ cdhnm }/cdhMetricWebServer/program/getTopProgramCpu?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`), // 获取内存TopN
    getTopProgramMemoryDetail: (params) => get(`${ cdhnm }/cdhMetricWebServer/program/getTopProgramMemoryDetail?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`), // 获取内存TopN详情
    getTopProgramCpuDetail: (params) => get(`${ cdhnm }/cdhMetricWebServer/program/getTopProgramCpuDetail?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`), // 获取内存TopN详情
    exportMemoryExcel: (params) => post(`${ cdhnm }/cdhMetricWebServer/program/exportMemoryExcel`, params, { responseType: 'blob' }), // 内存TopN详情导出
    exportCpuExcel: (params) => post(`${ cdhnm }/cdhMetricWebServer/program/exportCpuExcel`, params, { responseType: 'blob' }), // 内存TopN详情导出
    getProgramHistoryDetail: (params) => post(`${ cdhnm }/cdhMetricWebServer/program/getProgramHistoryDetail`, params), // 获取历史详情
    getOverRunningTimeProgram: (params) => get(`${ cdhnm }/cdhMetricWebServer/program/getOverRunningTimeProgram?clusterName=${ params.clusterName }&overRunningTime=${ params.overRunningTime }&limit=${ params.limit }`), // 程序运行时长

    // 队列
    getPoolBasicInfo: (params) => get(`${ cdhnm }/cdhMetricWebServer/pool/getPoolBasicInfo?clusterName=${ params.clusterName }&poolName=${params.poolName}`),
    getPoolNames: (params) => get(`${ cdhnm }/cdhMetricWebServer/pool/getPoolNames?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`),
    getClusterPoolMemoryTrend: (params) => get(`${ cdhnm }/cdhMetricWebServer/pool/getClusterPoolMemoryTrend?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`),
    getClusterPoolCpuTrend: (params) => get(`${ cdhnm }/cdhMetricWebServer/pool/getClusterPoolCpuTrend?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`),
    getTopProgramMemoryByPool: (params) => get(`${ cdhnm }/cdhMetricWebServer/pool/getTopProgramMemoryByPool?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&poolName=${ params.poolName }`),
    getTopProgramCpuByPool: (params) => get(`${ cdhnm }/cdhMetricWebServer/pool/getTopProgramCpuByPool?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&poolName=${ params.poolName }`),
    getTopProgramMemoryByPoolDetail: (params) => get(`${ cdhnm }/cdhMetricWebServer/pool/getTopProgramMemoryByPoolDetail?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&poolName=${ params.poolName }`),
    getTopProgramCpuByPoolDetail: (params) => get(`${ cdhnm }/cdhMetricWebServer/pool/getTopProgramCpuByPoolDetail?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&poolName=${ params.poolName }`),
    exportPoolMemoryToExcel: (params) => post(`${ cdhnm }/cdhMetricWebServer/pool/exportMemoryToExcel`, params, { responseType: 'blob' }),
    exportPoolCpuToExcel: (params) => post(`${ cdhnm }/cdhMetricWebServer/pool/exportCpuToExcel`, params, { responseType: 'blob' }),
    getUnsucceedPool: (params) => get(`${ cdhnm }/cdhMetricWebServer/pool/getUnsucceedProgram?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&poolName=${ params.poolName }`),

    // 租户
    getUserBasicInfo: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getPoolBasicInfo?clusterName=${ params.clusterName }&userName=${params.userName}`),
    getUser: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getPoolNames?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`),
    getClusterUserMemoryTrend: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getClusterUserMemoryTrend?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`),
    getClusterUserCpuTrend: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getClusterUserCpuTrend?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`),
    getTopProgramMemoryByUser: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getTopProgramMemoryByUser?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&userName=${ params.userName }`),
    getTopProgramCpuByUser: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getTopProgramCpuByUser?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&userName=${ params.userName }`),
    getTopProgramMemoryByUserDetail: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getTopProgramMemoryByUserDetail?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&userName=${ params.userName }`),
    getTopProgramCpuByUserDetail: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getTopProgramCpuByUserDetail?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&userName=${ params.userName }`),
    exportUserMemoryToExcel: (params) => post(`${ cdhnm }/cdhMetricWebServer/user/exportMemoryToExcel`, params, { responseType: 'blob' }),
    exportUserCpuToExcel: (params) => post(`${ cdhnm }/cdhMetricWebServer/user/exportCpuToExcel`, params, { responseType: 'blob' }),
    getUnsucceedUser: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getUnsucceedProgram?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&userName=${ params.userName }`),

    // 应用
    getAppBasicInfo: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getPoolBasicInfo?clusterName=${ params.clusterName }&appName=${params.appName}`),
    getAppName: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getPoolNames?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`),
    getClusterAppMemoryTrend: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getClusterUserMemoryTrend?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`),
    getClusterAppCpuTrend: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getClusterUserCpuTrend?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }`),
    getTopProgramMemoryByApp: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getTopProgramMemoryByUser?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&appName=${ params.appName }`),
    getTopProgramCpuByApp: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getTopProgramCpuByUser?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&appName=${ params.appName }`),
    getTopProgramMemoryByAppDetail: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getTopProgramMemoryByUserDetail?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&appName=${ params.appName }`),
    getTopProgramCpuByAppDetail: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getTopProgramCpuByUserDetail?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&appName=${ params.appName }`),
    exportAppMemoryToExcel: (params) => post(`${ cdhnm }/cdhMetricWebServer/user/exportMemoryToExcel`, params, { responseType: 'blob' }),
    exportAppCpuToExcel: (params) => post(`${ cdhnm }/cdhMetricWebServer/user/exportCpuToExcel`, params, { responseType: 'blob' }),
    getUnsucceedApp: (params) => get(`${ cdhnm }/cdhMetricWebServer/user/getUnsucceedProgram?clusterName=${ params.clusterName }&beginTime=${ params.beginTime }&endTime=${ params.endTime }&appName=${ params.appName }`),
}