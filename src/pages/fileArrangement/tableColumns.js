export const regionColumns = [
    {
        title: '文件路径',
        dataIndex: '',
        width: 350,
        checkboxDisabled: true,
    }, {
        title: '总文件数',
        dataIndex: '',
        width: 120,
        checkboxDisabled: true,
    }, {
        title: '一级分区个数',
        dataIndex: '',
        width: 170,
        checkboxDisabled: true,
    }, {
        title: '一级分区类型',
        dataIndex: '',
        width: 170,
        checkboxDisabled: true,
    }, {
        title: '二级分区个数',
        dataIndex: '',
        width: 170,
        checkboxDisabled: true,
    }, {
        title: '二级分区类型',
        dataIndex: '',
        width: 170,
        checkboxDisabled: true,
    }, {
        title: '总文件大小',
        dataIndex: '',
        width: 120,
        checkboxDisabled: true,
    }, {
        title: '平均一级分区大小',
        dataIndex: '',
        width: 240,
        checkboxDisabled: true,
    }, {
        title: 'Block(块)个数',
        dataIndex: '',
        width: 140,
    }, {
        title: '数据库',
        dataIndex: '',
        width: 50,
    }, {
        title: '数据库表',
        dataIndex: '',
        width: 50,
    }, {
        title: '用户',
        dataIndex: '',
        width: 50,
    }, {
        title: '用户组',
        dataIndex: '',
        width: 50,
    },
];

export const dailyColumns = [
    {
        title: '文件路径',
        dataIndex: '',
        width: 350,
        checkboxDisabled: true,
    }, {
        title: '总文件数',
        dataIndex: '',
        width: 120,
        checkboxDisabled: true,
    }, {
        title: '一级分区个数',
        dataIndex: '',
        width: 170,
        checkboxDisabled: true,
    }, {
        title: '一级分区类型',
        dataIndex: '',
        width: 170,
        checkboxDisabled: true,
    }, {
        title: '总文件大小',
        dataIndex: '',
        width: 120,
        checkboxDisabled: true,
    }, {
        title: '平均一级分区大小',
        dataIndex: '',
        width: 240,
        checkboxDisabled: true,
    }, {
        title: 'Block(块)个数',
        dataIndex: '',
        width: 150,
    }, {
        title: '数据库',
        dataIndex: '',
        width: 50,
    }, {
        title: '数据库表',
        dataIndex: '',
        width: 50,
    }, {
        title: '用户',
        dataIndex: '',
        width: 50,
    }, {
        title: '用户组',
        dataIndex: '',
        width: 50,
    },
];

export const weeklyColumns = dailyColumns;

export const monthlyColumns = dailyColumns;

export const otherColumns = [
    {
        title: '文件路径',
        dataIndex: '',
        width: 350,
        checkboxDisabled: true,
    }, {
        title: '总文件数',
        dataIndex: '',
        width: 150,
        checkboxDisabled: true,
    }, {
        title: '总文件大小',
        dataIndex: '',
        width: 120,
        checkboxDisabled: true,
    }, {
        title: '平均一级分区大小',
        dataIndex: '',
        width: 250,
        checkboxDisabled: true,
    }, {
        title: 'Block(块)个数',
        dataIndex: '',
        width: 150,
    }, {
        title: '数据库',
        dataIndex: '',
        width: 50,
    }, {
        title: '数据库表',
        dataIndex: '',
        width: 50,
    }, {
        title: '用户',
        dataIndex: '',
        width: 50,
    }, {
        title: '用户组',
        dataIndex: '',
        width: 50,
    },
];

export const tinyFileColumns = [
    {
        title: '文件路径',
        dataIndex: '',
        width: 150,
        checkboxDisabled: true,
    }, {
        title: '小文件数量',
        dataIndex: '',
        width: 150,
        checkboxDisabled: true,
    }, {
        title: '小文件数TOP1的分区',
        dataIndex: '',
        width: 250,
    }, {
        title: '该分区小文件数',
        dataIndex: '',
        width: 140,
    }, {
        title: '数据库',
        dataIndex: '',
        width: 50,
    }, {
        title: '数据库表',
        dataIndex: '',
        width: 50,
    }, {
        title: '用户',
        dataIndex: '',
        width: 50,
    }, {
        title: '用户组',
        dataIndex: '',
        width: 50,
    },
];

const tableColumns = {
    regionColumns,
    dailyColumns,
    weeklyColumns,
    monthlyColumns,
    otherColumns,
    tinyFileColumns
};

export default tableColumns;