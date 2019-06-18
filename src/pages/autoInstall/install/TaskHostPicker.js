// 创建装机任务
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { message, Modal, Row, Col, Button, Input, Icon, Checkbox, Upload } from 'antd';
import update from 'immutability-helper';
import SDTable from 'src/components/SDTable';
import api from 'src/tools/api';
import { downloadFile } from "src/tools/utils";

import './installTaskCreate.scss';


export default class TaskHostPicker extends Component {
    static contextTypes = {
        task: PropTypes.object,
        changeState: PropTypes.func,
    };

    state = {
        scrollY: undefined,
        dataSource:[],
        tableLoading: true,
        uploading: false,
        unselectedSource: [],
        selectedSource: [],
        btnAddDisabled: true,
        btnRemoveDisabled: true,
        unselectedCheckbox: {
            checked: false,
            indeterminate: false,
        },
        selectedCheckbox: {
            checked: false,
            indeterminate: false,
        },
    };

    columns = [
        {
            title: 'mac地址',
            dataIndex: 'mac',
            key: 'mac',
            width: 120,
        },
        {
            title: '主机名',
            dataIndex: 'roomNamess',
            key: 'roomNamess',
            width: 100,
        },
        {
            title: '机房',
            dataIndex: 'roomName',
            key: 'roomName',
            width: 100,
        },
        {
            title: '管理口IP地址',
            dataIndex: 'dcnIp',
            key: 'dcnIp',
            width: 160,
        },
        {
            title: '管理口用户名',
            dataIndex: 'hostName',
            key: 'hostName',
            width: 160,
        },
        {
            title: '管理口密码',
            dataIndex: 'sn',
            key: 'sn',
            width: 120,
            align: "center",
        },
        {
            title: '所属项目',
            dataIndex: 'roomNames',
            key: 'roomNames',
            width: 100,
            align: "center",
        },
    ];

    type = {
        unselectedSource: {
            checkbox: 'unselectedCheckbox',
            btn: 'btnAddDisabled',
        },
        selectedSource: {
            checkbox: 'selectedCheckbox',
            btn: 'btnRemoveDisabled',
        },
    };

    uploadProps = {
        accept: '.xls,.xlsx',
        showUploadList: false,
        beforeUpload: (file) => {
            this.setState({ uploading: true });
            const formData = new FormData();
            formData.append('file', file);

            api.importHostExcel(formData).then(res => {
                if (res.data.success !== 'true') {
                    this.setState({ uploading: false });
                    message.error(res.data.msg);
                    return;
                }
                this.setState({ uploading: false });
                message.success('导入成功');
                const data = res.data.data;
                const oldIds = this.context.task.hostId ? this.context.task.hostId + ',' : '';
                this.context.changeState({
                    task: {
                        hostIds: { $set: oldIds + data.join(',') }
                    }
                }, 'hostPick', 'getList');
            });
            return false;
        },
    };

    componentDidMount() {
        this.getList();
        this.setScrollY();
    }

    getList = () => {
        if (!this.state.tableLoading) this.setState({ tableLoading: true });
        api.getAllHost().then(res => {
            if (res.data.success !== 'true') {
                this.setState({ tableLoading: false });
                message.error(res.data.msg);
                return;
            }
            let unselectedSource = [], selectedSource = [];
            const hostIds = this.context.task.hostIds ? this.context.task.hostIds.split(',') : [];
            res.data.data.forEach(d => {
                if (hostIds.includes(d.automaticHostId.toString())) {
                    selectedSource.push(d);
                } else {
                    unselectedSource.push(d);
                }
            });
            this.setState({
                tableLoading: false,
                unselectedSource: unselectedSource,
                selectedSource: selectedSource,
                dataSource: res.data.data,
            });
        }).catch(() => {
            this.setState({ tableLoading: false });
        });
    };

    setScrollY = () => {
        const stepContentPadding = 20;
        const stepContentFilterForm = 46;
        const stepContentTablePagination = 44;
        const stepContentTableHead = 40;
        const stepsContentEl = document.getElementsByClassName('steps-content')[0];
        let scrollY = undefined;
        if (stepsContentEl) {
            const containerHeight = stepsContentEl.clientHeight;
            scrollY = containerHeight - stepContentPadding - stepContentFilterForm - stepContentTablePagination - stepContentTableHead;
        }
        this.setState({ scrollY });
    };

    next = () => {
        console.log(this.state.current)
        console.log(this.state.selectedSource)
        const selectedIds = this.state.selectedSource.map(d => d.automaticHostId);
        if (!selectedIds || selectedIds.length < 1) {
            Modal.warn({ title: '请选择至少一个主机' });
            return false;
        }
        this.setState({
            current: this.state.current + 1,
        });
        return true;
    };

    onCheckAll = (type) => (e) => {
        const checked = e.target.checked;
        this.setState(update(this.state, {
            [type]: { $set: this.state[type].map(d => ({ ...d, checked: checked })) },
            [this.type[type].checkbox]: {
                indeterminate: { $set: false },
                checked: { $set: checked },
            },
            [this.type[type].btn]: { $set: !checked },
        }));
    };

    // onTableRowClick = (type, record, index) => {
    //     if (!type) return;
    //     const target = this.state[type][index];
    //     if (!target) return;
    //     let indeterminate = false;
    //     let checkedCount = 0;
    //     const stateCopy = update(this.state[type], {
    //         [index]: {
    //             checked: { $set: !target.checked },
    //         }
    //     });
    //     stateCopy.forEach((d) => {
    //         if (d.checked) {
    //             indeterminate = true;
    //             checkedCount = checkedCount + 1;
    //         }
    //     });
    //     this.setState({
    //         [type]: stateCopy, // 更新dataSource
    //         [this.type[type].checkbox]: { // checkbox
    //             indeterminate: checkedCount === stateCopy.length ? false : indeterminate,
    //             checked: checkedCount === stateCopy.length,
    //         },
    //         // [this.type[type].btn]: !indeterminate, // 新增/删除按钮状态
    //     });
    // };

    onAddOrRemove = (theType, oppoType) => () => {
        if (!theType || !oppoType) return;
        let theSource = [], oppoSource = [];
        this.state[theType].forEach(d => {
            if (d.checked) {
                d.checked = false;
                oppoSource.push(d);
            } else {
                theSource.push(d);
            }
        });
        this.setState({
            [theType]: theSource,
            [oppoType]: [...oppoSource, ...this.state[oppoType]],
            [this.type[theType].checkbox]: { checked: false },
            [this.type[theType].btn]: { $set: true }
        })
    };
    onRowSelect = (selectedRowKeys) => {
        this.setState({ selectedRowKeys }, () => {
            this.props.changeState({
                task: {
                    modelId: { $set: selectedRowKeys[0] }
                }
            })
        });
    };

    render() {
        const state = this.state;
        const props = this.props;
        return (
            <div style={ {
                width: '80%',
                maxWidth: '1000px',
                padding: '20px',
                overflowY: 'auto',
            } }>
                <Row style={ { marginBottom: '24px' } }>
                    <Upload { ...this.uploadProps }>
                        <Button htmlType="button"
                                type="primary"
                                className="sd-wireframe"
                                style={ { marginRight: '8px' } }
                                loading={ this.state.uploading }
                        >导入资源</Button>
                    </Upload>
                    <Input.Search
                        onSearch={ this.onSearchChange }
                        placeholder="请输入机房名称"
                        style={ { float: 'right', margin: '8px 30px', width: '230px',marginRight:'15px'  } }
                    />
                    <Button htmlType="button"
                            type="primary"
                            className="sd-wireframe"
                            onClick={ () => api.downHostExcel().then(res => downloadFile(res)) }
                    >下载模板</Button>
                </Row>
                <SDTable
                    // id='importSource'
                    // rowKey='automaticModelId' 
                    // className="sd-table-simple"
                    columns={ this.columns }
                    dataSource={ state.dataSource }
                    rowSelection={ {
                        selectedRowKeys: state.selectedRowKeys,
                        onChange: this.onRowSelect,
                    } }
                    bordered={ true }
                    pagination={ true }
                    loading={ props.tableLoading }
                    scroll={{x: true, y: state.scrollY }}
                    //  onRow={ (record, index) => ({ onClick: () => props.onTableRowClick(props.id, record, index) }) }
                />
            </div>
        )
    }
}

// class Part extends Component {

//     render() {
        
//         const state = this.state;
//         return (
//             <Fragment>
//                 {/* <div className="sd-filter-form">
//                     <Checkbox
//                         onChange={ props.onCheckAll(props.id) }
//                         checked={ props.checkboxState.checked }
//                         indeterminate={ props.checkboxState.indeterminate }
//                         disabled={ !props.dataSource.length }
//                     >
//                         可选资源（{ props.dataSource.length }）
//                     </Checkbox>
//                 </div> */}
//                 {/* <SDTable
//                     id={ props.id }
//                     rowKey={ props.rowKey || 'id' }
//                     className="sd-table-simple"
//                     columns={ props.columns }
//                     dataSource={ props.dataSource }
//                     scroll={ { y: props.scrollY } }
//                     bordered={ true }
//                     loading={ props.tableLoading }
//                     pagination={ false }
//                     onRow={ (record, index) => ({ onClick: () => props.onTableRowClick(props.id, record, index) }) }
//                 /> */}
                
//             </Fragment>
//         )
//     }
// }

