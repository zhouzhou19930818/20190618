import React, { Component, Fragment } from 'react';
import { Card, Divider, Icon } from "antd";
import echarts from "echarts";
import SDTable from 'src/components/SDTable';
import SliderChart from './SliderChart';
import { allInterval } from "../yarnUtils";

const chartLoadingStyle = {
    text: 'loading',
    color: '#2AA0FF',
    textColor: '#2AA0FF',
    // maskColor: 'rgba(255, 255, 255, 0.1)',
};

const intervalStyle = {
    color: '#808080',
    background: '#E9E9E9',
    fontSize: '12px',
    fontWeight: '400',
    fontFamily: 'SourceHanSansCN-Regular',
    borderRadius: '12px',
    padding: '18px 4px',
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    textAlign: 'center',
};

// 获取时间间隔
const getInterval = (value) => {
    const interval = allInterval[value]; // 获取对应的值
    if (!value || !interval) return '';
    const intervalList = interval.match(/[\u4e00-\u9fa5]|\d+/gm);
    let res = '';
    (intervalList && intervalList.length) && intervalList.forEach(d => res = res + `${ d }<br/>`);
    return res;
};

export class ControllerChart extends Component {

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.loading) {
            this.chartSlider.chart.showLoading(chartLoadingStyle);
        } else {
            if (nextProps.loading !== this.props.loading) {
                this.chartSlider.chart.hideLoading(); // 撤去loading
                this.chartSlider.chart.clear();
                this.chartSlider.chart.setOption(nextProps.chartOption); // 更新图表
            }
            if (nextProps.sliderParam) {
                this.chartSlider.setSlider(nextProps.sliderParam, nextProps.chartOption); // 设置滑块位置
            }
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.sliderParam !== this.props.sliderParam;
    }

    render() {
        const props = this.props;
        return (
            <Fragment>
                <SliderChart
                    id={ props.id }
                    ref={ e => this.chartSlider = e }
                    options={ props.chartOption }
                    loading={ props.loading }
                    sliderEvent={ props.sliderEvent }
                    sliderParam={ props.sliderParam }
                />
                { props.interval ? (
                    <span dangerouslySetInnerHTML={ { __html: getInterval(props.interval) } }
                          style={ intervalStyle }
                    />
                ) : null }
            </Fragment>
        )
    }
}

export class LinkChart extends Component {

    componentDidMount() {
        this.block2Chart = echarts.init(document.getElementById(this.props.id));
        window.addEventListener("resize", () => this.block2Chart.resize());
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.loading) {
            this.block2Chart.showLoading(chartLoadingStyle);
        } else {
            if (nextProps.loading !== this.props.loading) {
                this.block2Chart.hideLoading();
                this.block2Chart.clear();
                this.block2Chart.setOption(nextProps.chartOption);
            }
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.interval !== this.props.interval;
    }

    render() {
        const props = this.props;
        return (
            <Fragment>
                <div id={ props.id } className="chart-table"/>
                {
                    props.interval ? (
                        <span dangerouslySetInnerHTML={ { __html: getInterval(props.interval) } }
                              style={ intervalStyle }
                        />
                    ) : null
                }
            </Fragment>
        )
    }
}

export class LinkTable extends Component {

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return nextProps.options.loading !== this.props.options.loading;
    }

    render() {
        const props = this.props;
        return (
            <SDTable
                bordered={ true }
                className="sd-table-simple sd-pagination-simple"
                style={ { padding: '0 16px 16px 16px', } }
                pagination={ {
                    pageSize: 5,
                    size: 'small'
                } }
                scroll={ { x: true, y: 200 } }
                { ...props.options }
            />
        )
    }
}

// 包裹容器
export function BlockWrapper(props) {
    return (
        <Card
            size="small"
            className={ props.className }
            title={ props.title }
            bordered={ false }
            extra={ props.isShowTitleExtra ? props.titleExtra : null }
        >
            { props.children }
        </Card>
    )
}

// TopN翻页
export function ChartPages(props) {
    return (
        <div className="chart-pages">
            <button
                className={ `sd-anchor-button${ props.pageIndex === 0 ? ' active' : '' }` }
                onClick={ () => props.onPageChange && props.onPageChange(0) }>TOP10
            </button>
            <Divider type="vertical"/>
            <button
                className={ `sd-anchor-button${ props.pageIndex === 1 ? ' active' : '' }` }
                onClick={ () => props.onPageChange && props.onPageChange(1) }>11-20
            </button>
        </div>
    )
}

// 导出按钮
export function ExportButton(props) {
    return (
        <button className="sd-anchor-button"
                onClick={ props.exportExcel }
                style={ { float: 'right', height: '28px', marginRight: '10px' } }
        ><Icon type="export" style={ { marginRight: '8px' } }/>导出</button>
    )
}

export function KeyValueTable(props) {
    const keyStyle = {
        padding: '12px 10px',
        background: 'rgba(245,245,245,1)',
        border: '1px solid rgba(231,231,231,1)',
    };
    const valueStyle = {
        padding: '12px 10px',
        border: '1px solid rgba(231,231,231,1)',
        maxWidth: '100px'
    };
    const columns = props.columns;
    const source = props.dataSource[0];
    return <table
        style={ {
            background: '#ffffff',
            border: '1px solid rgba(231,231,231,1)',
            borderCollapse: 'collapse'
        } }
    >
        <tbody>
        {
            columns.map((column, i) => {
                const dataIndex = column.dataIndex;
                return (
                    <tr key={ dataIndex }>
                        <td key={ 'key' + i } style={ keyStyle }>{ column.title }</td>
                        <td key={ 'value' + i } style={ valueStyle }>{ source[dataIndex] }</td>
                    </tr>
                )
            })
        }
        </tbody>
    </table>;
}