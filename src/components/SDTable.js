import React from 'react';
import { ConfigProvider, Table } from 'antd';
import { isBoolean, isNumber, isString } from "../tools/utils";

export default class SDTable extends React.Component {
    state = {
        scroll: {},
        columns: [],
    };

    static defaultProps = {
        id: 'sdTable',
        defaultColumnsWidth: 100
    };

    getNumber = (x) => {
        if (isNumber(x)) return x;
        else if (isString(x)) {
            const match = x.match(/\d+/g);
            return match ? match[0] : null;
        }
        return null;
    };

    // 无数据显示
    customizeRenderEmpty = () => (
        !this.props.noEmptyImg ?
            (<div style={ { textAlign: 'center' } }>
                <img src={ require('src/assets/images/none-_data_img.png') } alt="No Data"/>
                <p style={ { margin: '5px 0 0' } }>暂无数据记录</p>
            </div>) :
            (<p style={ { margin: '0' } }>暂无数据记录</p>)
    );

    /***
     * 生成columns与scroll
     * *** 注: 如果设置了scroll,请设置 columns 的 width 属性, 否则列头和内容可能不对齐 ***
     * *** 设置了scroll.x,列宽才按比例分配 ***
     * props.scroll: string | number | boolean
     * props.scroll.x = string(百分比) -> 出现横向滚动条
     * props.scroll.x = number(px单位) -> 表格总宽度小于该值才出现横向滚动条
     * props.scroll.x = true(boolean) -> 以每个columns的width之和计算scroll.x(表格总宽度)
     * @param props
     * @returns {{columns: [], scroll: {}}}
     */
    generateColumns = (props) => {
        const source = props.columns || [];
        const scroll = props.scroll;
        const contentEl = document.getElementsByClassName('router-wrapper')[0];
        const tableEl = document.getElementById(this.props.id);
        const len = source.length;
        if (!contentEl || !tableEl || len < 1) {
            return { scroll, columns: source };
        }

        const containerHeight = contentEl.clientHeight;
        const tableWidth = tableEl.clientWidth;
        let totalWidth = tableWidth - 100;
        const scrollY = scroll && scroll.y
            ? scroll.y
            : (scroll && scroll.occupiedHeight
                ? containerHeight - scroll.occupiedHeight
                : undefined);
        let columns = [];
        // 有定义scroll.x测基于该值计算
        if (props.scroll && props.scroll.x) {
            let proportionSum = 0; // 记录占比之和
            let proportionList = []; // 记录每列的占比
            source.forEach((data) => {  // 累计份数
                const count = this.getNumber(data.width) || 0;
                proportionList.push(count);
                proportionSum = Number(proportionSum) + Number(count);
            });

            if (!proportionSum) {
                return { scroll: { x: totalWidth, y: scrollY }, columns: source };
            }

            // 计算scroll.x
            const x = props.scroll.x;
            const offset = props.rowSelection ? 100 : 60;
            if (isString(x)) {
                const percent = this.getNumber(x) || 100;
                totalWidth = tableWidth * (percent / 100) - offset;
            } else if (isNumber(x)) {
                totalWidth = x - offset;
            } else if (isBoolean(x)) {
                // 定义为boolean,根据width按比例分.
                // true:有横向滚动条, 表格scroll.x = 所有columns.width(px)之和
                // false:无滚动条, 表格scroll.x = totalWidth, 每列按比例分配
                if (x) {
                    totalWidth = Math.max(proportionSum, totalWidth);
                }
            }
            const avgWidth = totalWidth / proportionSum;
            columns = source.map((d, i) => {  // 最后一列不需要width, 已有width的用已有的, 没有的用平均值
                const colWidth = Math.floor(proportionList[i] * avgWidth);
                const { width, ...others } = d;
                if (i === len - 1) return others;
                return { ...d, width: colWidth + 'px' };
            });
            // scroll.x比tableWidth小则不显示横向滚动条
            return { scroll: { x: totalWidth <= tableWidth ? undefined : totalWidth, y: scrollY }, columns };
        } else {
            return { scroll, columns: source };
        }
    };

    render() {
        const props = this.props;
        const { scroll, columns } = this.generateColumns(this.props);
        return (
            <ConfigProvider renderEmpty={ this.customizeRenderEmpty }>
                <Table
                    { ...props }
                    id={ props.id }
                    cloumns={ columns }
                    scroll={ scroll }
                />
            </ConfigProvider>)
    }
}