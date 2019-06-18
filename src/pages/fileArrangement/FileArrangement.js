import React, { useState, useEffect, Fragment } from 'react';
import styled from 'styled-components';
import { Select, Tabs, Button, Input, Modal, Icon, Checkbox, message } from 'antd';
import { ContainerBody } from "src/components/LittleComponents";
import api from "src/tools/api";
import SDTable from "src/components/SDTable";

import tableColumns from './tableColumns';

const TabPane = Tabs.TabPane;
const { Option } = Select;

const StyledTabs = styled(Tabs)`
    /* 覆写antd样式 */
    .ant-tabs-bar.ant-tabs-top-bar {
        background: #ffffff;
        border-radius: 4px;
        border-bottom: 2px solid #D3E4FF;
        margin: 3px 1px 0;
        box-shadow: 0 0 4px 1px rgba(80, 84, 90, 0.1);

        .ant-tabs-tab {
            padding: 9px 15px 13px;
            margin-left: 20px;
            font-size: 15px;
            font-family: SourceHanSansCN-Regular, "Microsoft YaHei", sans-serif;
            font-weight: 400;
            color: rgba(65, 97, 136, 1);
        }
    }
`;

const StyledPane = styled.div`
    box-shadow: 0 0 4px 1px rgba(80, 84, 90, 0.1);
    background: #ffffff;
    margin-bottom: 10px;
    padding: 16px;
`;

const StyledForm = styled.div`
    height: 40px;
    line-height: 40px;
    margin-bottom: 10px;
`;

const StyledFormItem = styled.div`
    display: inline-block;
    margin-right: 15px;

    & > span {
        padding-left: 10px;
    }
`;

const StyledSelect = styled(Select)`
    display: inline-block;
    width: 160px;
    vertical-align: middle;
`;

const StyledClusterSelect = styled(StyledSelect)`
    margin-right: 15px;
`;

const StyledButton = styled(Button)`
    height: 32px;
    border-radius: 2px;
    text-shadow: none;
    box-shadow: 0 2px 4px 0 rgba(16, 112, 225, 0.16);
    margin-right: 10px;
`;

const StyledPrimaryButton = styled(StyledButton)`
    height: 32px;
    border: none;
    background: #1B67E0;
    color: #ffffff;

    &:hover {
        background: #1B67E0;
        color: #ffffff;
    }
`;

const StyledNumberInput = styled(Input)`
    width: 80px;
    height: 32px;
    vertical-align: middle;
    margin-left: 10px;
`;

const ExportModal = styled(Modal)`

`;

const ExportBtn = styled.a`
    font-size: 15px;
    float: right;
`;

const FlexCheckboxGroup = styled(Checkbox.Group)`
    display: flex;
    flex-wrap: wrap;

    label {
        flex: 50%;
        margin: 0;
    }
`;

export default function FileArrangement(props) {
    const [clusterValue, setClusterValue] = useState('');
    // const [clusterRequestError, setClusterRequestError] = useState(false);

    const [clusterOptions, setClusterOptions] = useState([]);
    useEffect(() => {
        getClusterOptions();
    }, []);

    const topPanes = [
        {
            key: 'tab1',
            title: 'HDFS文件处理',
            content: <HDFS />,
        }
    ];

    const bottomPanes = [
        {
            key: 'tab1',
            title: '小文件处理',
            content: <TinyFile />,
        }
    ];

    // 获取集群列表
    const getClusterOptions = async () => {
        try {
            const res = await api.getClusterBasicInfo();

            if (res.data.success !== 'true') {
                message.destroy();
                message.error(res.data.msg);
                // setClusterRequestError(true);
                return;
            }

            setClusterOptions(res.data.data);
            setClusterValue(res.data.data[0].clusterName);
            // setClusterRequestError(false);
        } catch (err) {
            message.destroy();
            message.error('获取集群列表失败');
        }
    };

    // 集群选项修改事件
    const onClusterChange = (value) => {
        setClusterValue(value);
    };

    return (
        <ContainerBody>
            <StyledTabs
                defaultActiveKey="tab1"
                className="sd-tabs bordered-title-tabs"
                tabBarExtraContent={
                    <StyledClusterSelect
                        notFoundContent="暂无数据"
                        value={clusterValue}
                        onChange={onClusterChange}
                    >
                        {
                            clusterOptions.map((d, i) =>
                                <Option key={'cluster_' + i} value={d.clusterName}>
                                    {d.clusterName}
                                </Option>
                            )
                        }
                    </StyledClusterSelect>
                }
            >
                {
                    topPanes.map(pane =>
                        <TabPane key={pane.key} tab={pane.title}>{pane.content}</TabPane>
                    )
                }
            </StyledTabs>
            <StyledTabs
                defaultActiveKey="tab1"
                className="sd-tabs bordered-title-tabs"
            >
                {
                    bottomPanes.map(pane =>
                        <TabPane key={pane.key} tab={pane.title}>{pane.content}</TabPane>
                    )
                }
            </StyledTabs>
        </ContainerBody>
    );
}

function HDFS(props) {
    const [tableType, setTableType] = useState('regionColumns');
    const [exportModalVisible, setExportModalVisible] = useState(false);
    const [modalLocation, setModalLocation] = useState({x: 0, y: 0});

    const tableTypeOptions = [
        {
            name: '地市分区表',
            columns: 'regionColumns'
        }, {
            name: '天（小时）分区表',
            columns: 'dailyColumns'
        }, {
            name: '周分区表',
            columns: 'weeklyColumns'
        }, {
            name: '月分区表',
            columns: 'monthlyColumns'
        }, {
            name: '其他分区表',
            columns: 'otherColumns'
        }, 
    ];

    const onTableTypeChange = (value) => {
        setTableType(value);
    };

    const toggleExportModal = (e) => {
        !exportModalVisible && setModalLocation({
            x: e.clientX,
            y: e.clientY + 30
        });
        setExportModalVisible(!exportModalVisible);
    };

    const onExportCheckboxChange = (checkedValues) => {

    };

    return (
        <StyledPane>
            <StyledForm>
                <StyledFormItem>
                    <span>请选择表格式：</span>
                    <StyledSelect
                        notFoundContent="暂无数据"
                        value={tableType}
                        onChange={onTableTypeChange}
                    >
                        {
                            tableTypeOptions.map(item =>
                                <Option key={item.name} value={item.columns}>
                                    {item.name}
                                </Option>
                            )
                        }
                    </StyledSelect>
                </StyledFormItem>
                <StyledFormItem>
                    <StyledPrimaryButton>立即更新</StyledPrimaryButton>
                    <StyledButton onClick={toggleExportModal}>导出</StyledButton>
                </StyledFormItem>
            </StyledForm>
            <SDTable
                rowKey="index"
                columns={tableColumns[tableType]}
                className="sd-table-simple"
                scroll={{ x: '130%' }}
                bordered={true}
            />

            <ExportModal
                title={
                    <Fragment>
                        选择导出字段
                        <ExportBtn>
                            <Icon type="arrow-right" />确认导出
                        </ExportBtn>
                    </Fragment>
                }
                style={{
                    top: modalLocation.y,
                    left: modalLocation.x,
                    margin: 0
                }}
                width={400}
                closable={false}
                maskClosable={true}
                maskStyle={{
                    background: 'none'
                }}
                visible={exportModalVisible}
                onCancel={toggleExportModal}
                footer={null}
            >
                <FlexCheckboxGroup
                    options={tableColumns[tableType].map(item => {
                        console.log(item)
                        return {
                            label: item.title,
                            value: item.title,
                            disabled: item.checkboxDisabled
                        };
                    })}
                    onChange={onExportCheckboxChange}
                />
            </ExportModal>
        </StyledPane>
    );
}

function TinyFile(props) {
    return (
        <StyledPane>
            <StyledForm>
                <StyledFormItem>
                    <span>{`文件大小 <`}</span>
                    <StyledNumberInput />
                </StyledFormItem>
                <StyledFormItem>
                    <span>{`表文件数量 >`}</span>
                    <StyledNumberInput />
                </StyledFormItem>
                <StyledFormItem>
                    <StyledPrimaryButton>查询</StyledPrimaryButton>
                    <StyledButton>导出</StyledButton>
                </StyledFormItem>
            </StyledForm>
            <SDTable
                rowKey="index"
                columns={tableColumns.tinyFileColumns}
                className="sd-table-simple"
                scroll={{ x: '130%' }}
                bordered={true}
            />
        </StyledPane>
    );
}