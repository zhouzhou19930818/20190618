import moment from "moment";

export const allInterval = ['', '每5分钟', '每10分钟', '每1小时', '每6小时', '每天'];
export const axisColor = '#8E97A2';
export const topNColors = ['#DF6E7B', '#f9bc73', '#F6E19E', '#A4E2E9', '#58B3C1', '#6EC3C0', '#36978E', '#38526E', '#5B6C83', '#B6B9BD',];


export const getStartAndEndTime = (e) => {     // 开始时间结束时间获取
    const formatter = 'YYYY-MM-DD HH:mm:ss';
    let endTime = moment().format(formatter); //当前时间
    let startTime;
    switch (e) {
        case 1:
            startTime = moment(endTime).subtract(6, "hours").format(formatter); // 6小时
            break;
        case 2:
            startTime = moment(endTime).subtract(12, "hours").format(formatter); // 12小时
            break;
        case 3:
            startTime = moment(endTime).subtract(24, "hours").format(formatter); // 24小时
            break;
        case 4:
            startTime = moment(endTime).subtract(7, "days").format(formatter); // 7天
            break;
        default:
            break;
    }
    return { startTime, endTime };
};

/***
 * 获取X轴标签
 * @param time 时间
 * @param index 索引
 * @param interval 时间间隔 ['', '每5分钟', '每10分钟', '每1小时', '每6小时', '每天']
 * @param sourceLen 所有数据
 * @param split 长度间隔
 * @param x x轴标签,用于标签过密时做修改
 * @returns {string}
 */
let xIndexTemp = []; // 暂存非空字符X轴标签索引
let crossedTime = ''; // 记录跨点时间
let isCrossedTime = false; // 上一个点是否为跨点

export function getXAxisData(time, index, interval, sourceLen, split, x) {
    if (!time) return '';
    if (index === 0 || index === sourceLen - 1) { // 首尾都显示
        if (index === 0) { // 初始化状态
            xIndexTemp = [0];
            crossedTime = (interval >= 1 && interval <= 2) ? time.slice(0, 10) : time.slice(0, 7);
            isCrossedTime = false;
            xIndexTemp.push(index); // 添加显示点索引
            return getXAxisFormatData(time, interval); // 获取显示点日期格式
        } else { // 重置状态
            xIndexTemp = [];
            crossedTime = '';
            isCrossedTime = false;

            const lastXIndex = xIndexTemp[xIndexTemp.length - 1];
            if (index - lastXIndex < split / 2) {
                return '';
            }
            return getXAxisFormatData(time, interval); // 获取显示点日期格式

        }
    } else if ((interval >= 1 && interval <= 2) && crossedTime !== time.slice(0, 10)) { // 跨年、月、日(interval不是每天)
        isCrossedTime = true;
        // 上一显示点的索引
        const lastXIndex = xIndexTemp[xIndexTemp.length - 1];
        // 下一个显示点与上一显示点的距离小于(split / 2), 把上一个点标签设为空,下一个点标签按格式显示
        if (index - lastXIndex < split / 2) {
            x[lastXIndex] = '';
            xIndexTemp.pop();
        }
        xIndexTemp.push(index);
        if (crossedTime.slice(0, 4) !== time.slice(0, 4)) { //跨年
            crossedTime = time.slice(0, 10);
            return getXAxisExtraFormatData(time, interval, 'year');
        } else if (crossedTime.slice(5, 7) !== time.slice(5, 7)) { //跨月
            crossedTime = time.slice(0, 10);
            return getXAxisExtraFormatData(time, interval, 'month');
        } else { // 跨日
            crossedTime = time.slice(0, 10);
            return getXAxisExtraFormatData(time, interval, 'day');
        }
    } else if (interval >= 3 && crossedTime !== time.slice(0, 7)) {  // 跨年、月(interval是每天，不需处理跨日)
        isCrossedTime = true;
        const lastXIndex = xIndexTemp[xIndexTemp.length - 1];
        if (index - lastXIndex < split / 2) {
            x[lastXIndex] = '';
            xIndexTemp.pop();
        }
        xIndexTemp.push(index);
        if (crossedTime.slice(0, 4) !== time.slice(0, 4)) { //跨年
            crossedTime = time.slice(0, 7);
            return getXAxisExtraFormatData(time, interval, 'year');
        } else { //跨月
            crossedTime = time.slice(0, 7);
            return getXAxisExtraFormatData(time, interval, 'month');
        }
    } else if (index % split === 0) { // 分割点
        if (isCrossedTime) {  // 如果上一个显示点是跨点, 而且下一个显示点与跨点的距离小于(split / 2),则不显示下一个点
            isCrossedTime = false; // 重置状态
            const lastXIndex = xIndexTemp[xIndexTemp.length - 1];
            if (index - lastXIndex < split / 2) {
                xIndexTemp.push(index);
                return ''; // 返回空字符
            }
        }
        xIndexTemp.push(index);
        return getXAxisFormatData(time, interval);
    } else {
        return '';
    }
}

/***
 * 根据时间间隔获取相应日期(不跨年月日)
 * @param time
 * @param interval ['', '每5分钟', '每10分钟', '每1小时', '每6小时', '每天']
 * @returns {string}
 */
function getXAxisFormatData(time, interval) {
    switch (interval) {
        case 1:
        case 2:  // 时分
            return `${ time.slice(11, 13) }时${ time.slice(14, 16) }分`;
        case 3:
        case 4:  // 日时
            return `${ time.slice(8, 10) }日${ time.slice(11, 13) }时`;
        case 5:  // 月日
            return `${ time.slice(5, 7) }月${ time.slice(8, 10) }日`;
        default:
            return '';
    }
}

/***
 * 根据跨年月日与时间间隔获取相应日期
 * @param time
 * @param interval ['', '每5分钟', '每10分钟', '每1小时', '每6小时', '每天']
 * @param mark
 * @returns {string}
 */
function getXAxisExtraFormatData(time, interval, mark) {
    switch (mark) {
        case 'year':
            return `${ time.slice(0, 4) }年`;
        case 'month':
            return `${ time.slice(5, 7) }月`;
        case 'day':
            switch (interval) {
                case 1:
                case 2:  // 月日
                    return `${ time.slice(5, 7) }月${ time.slice(8, 10) }日`;
                case 3:
                case 4:  // 日
                    return `${ time.slice(8, 10) }日`;
                default:
                    return '';
            }
        default:
            return '';
    }
}

export function getFormatterLegend(name) {
    if (name.length <= 8) return name;
    const start = name.substr(0, 1);
    const end = name.substr(-4);
    return `${ start }...${ end }`;
}
