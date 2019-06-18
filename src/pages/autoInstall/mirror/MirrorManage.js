import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Tabs, Input, message, Modal } from 'antd';
import moment from "moment";
import { ContainerBody } from "src/components/LittleComponents";
import api from "src/tools/api";
import { prefixRoute } from "src/configs";
import DetailModal from 'src/components/DetailModal';
import SDTable from "src/components/SDTable";
import { debounce } from "src/tools/utils";

const TabPane = Tabs.TabPane;

export default class MirrorManage extends Component {

    panes = [
        {
            key: 'tab1',
            title: '镜像管理 ',
            content: <ManagerList/>,
        },
    ];

    render() {
        return (
            <ContainerBody>
                <Tabs
                    className="sd-tabs"
                    onChange={ this.onTabsChange }
                    onEdit={ this.onEdit }
                >
                    {
                        this.panes.map((pane) =>
                            <TabPane key={ pane.key } tab={ pane.title }>{ pane.content }</TabPane>)
                    }
                </Tabs>
            </ContainerBody>
        )
    }
}

class ManagerListRoute extends Component {

    state = {
        loading: false,
        dataSource: [],
        fields: {},
    };

    columns = [
        {
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            width: 50,
        },
        {
            title: '镜像名称',
            dataIndex: 'distroName',
            key: 'distroName',
            width: 180,
        },
        {
            title: '镜像源',
            dataIndex: 'disUrl',
            key: 'disUrl',
            width: 120,
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            width: 120,
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '操作',
            key: 'op',
            width: 120,
            render: (d) => {
                return [
                    <Button htmlType="button"
                            key="op_2"
                            style={ { height: '26px', marginRight: '3px' } }
                            disabled={ d.inUse }
                            onClick={ () => this.props.history.push(prefixRoute + '/mirror_create', d) }
                    >编辑</Button>,
                    <Button htmlType="button" key="op_3"
                            style={ { height: '26px' } }
                            disabled={ d.inUse }
                            onClick={ this.delete(d) }>删除</Button>
                ]
            }
        },
    ];

    componentDidMount() {
        this.getList();
    }

    // 获取列表数据
    getList = () => {
        if (!this.state.tableLoading) this.setState({ tableLoading: true });
        api.getAllDistro().then(res => {
            if (res.data.success !== 'true') {
                this.setState({ tableLoading: false });
                message.error(res.data.msg);
                return;
            }
            this.setState({
                tableLoading: false,
                dataSource: res.data.data && res.data.data.map((d, i) => ({ ...d, index: i + 1 })),
            });
        }).catch(() => {
            this.setState({ tableLoading: false });
        });
    };

    // 计算除table以外的元素高度
    getOccupyHeight = () => {
        const ctnPadding = 16;
        const ctnTabs = 61;
        const ctnTablePagination = 44;
        const ctnTableHead = 64; // 当表格内容占两行时的高度, 43: 一行的高度
        const ctnFilterForm = 45;
        return ctnPadding + ctnTabs + ctnFilterForm + ctnTablePagination + ctnTableHead;
    };

    onFilter = (e) => {
        this.setState({ tableLoading: true });
        const fn = (value) => () => {
            api.getDistroFuzzily(value).then(res => {
                if (res.data.success !== 'true') {
                    this.setState({ tableLoading: false });
                    message.error(res.data.msg);
                    return;
                }

                this.setState({
                    tableLoading: false,
                    dataSource: res.data.data,
                });
            });
        };
        debounce(fn(e.target.value));
    };

    delete = (record) => () => {
        let ids = '', usingName;
        ids = record.automaticModelId;
        record.inUse && (usingName = record.modelName);
        Modal.confirm({
            title: usingName ? `${ usingName }正在使用，确认删除镜像？` : '确认删除镜像？',
            cancelText: '取消',
            okText: '确定',
            onOk: () => {
                api.removeDistro(ids).then(res => {
                    if (res.data.success !== 'true') {
                        Modal.error({ title: '删除失败', content: res.data.msg });
                        return;
                    }
                    this.getList();
                    message.success('删除成功');
                });
            },
        });
    };

    render() {
        return (
            <Fragment>
                <div className="sd-filter-form" style={ { height: '40px' } }>
                    <Input.Search
                        onChange={ this.onFilter }
                        placeholder="请输入关键词"
                        style={ { width: '230px', float: 'right',marginRight:'8px' } }/>
                </div>
                <SDTable
                    rowKey="automaticDistroId"
                    columns={ this.columns }
                    dataSource={ this.state.dataSource }
                    scroll={ { x: true, occupiedHeight: this.getOccupyHeight() } } // 计算scroll.y
                />
                <DetailModal ref={ e => this.detailModal = e }
                             modalTitle="查看详情"
                             fields={ this.state.fields }
                />
            </Fragment>
        )
    }
}

const ManagerList = withRouter(ManagerListRoute);