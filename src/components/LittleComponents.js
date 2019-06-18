import React, { Fragment, useState, useEffect } from 'react';
import 'src/components/littleComponents.scss';
import { Col, Row } from "antd";

/***
 * 上一步、下一步按钮
 */
export function ArrowButton(props) {
    return <button className={ `sd-arrow-button ${ props.type }` } { ...props }>
        {
            props.type === 'last' ? (
                <Fragment>
                    <span className="icon"/>
                    { props.children }
                </Fragment>
            ) : (
                <Fragment>
                    { props.children }
                    <span className="icon"/>
                </Fragment>
            )
        }
    </button>
}


/***
 * Loading
 */
export function Loading(props = { text: 'Loading' }) {
    return <div className="sd-loading">
        <div>
            <span>{ props.text }</span>
        </div>
    </div>
}

/***
 * container
 */
export function ContainerBody(props) {
    return (
        <div style={ { padding: '0 20px 8px', ...props.style } }>
            { props.children }
        </div>
    )
}


/***
 * 组件懒加载
 */
export function LazyLoad(path) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                component: null,
            }
        }

        componentDidMount() {
            path().then(module => this.setState({ component: module.default ? module.default : null }));
        }

        render() {
            const C = this.state.component;
            return C ? <C { ...this.props }/> : null;
        }
    }
}


/***
 * 组件懒加载， 与React.lazy配合使用
 */
export function LazyWithLoading(props) {
    return <React.Suspense fallback={ <Loading/> }>
        { props.children }
    </React.Suspense>
}


/***
 * 键值对
 */
export function GenerateFields(props) {
    const { fields, colCount } = props;
    const span = Math.floor(24 / colCount);
    if (!fields || Object.keys(fields).length < 1) return null;

    let res = [];
    let i = 1;
    for (let attr in fields) {
        if (!fields.hasOwnProperty(attr)) continue;
        const field = fields[attr];
        res.push(<Col span={ span } key={ i } style={ { padding: '6px 0 6px 10px' } }>
            <Label field={ field }/>
        </Col>);
        i = i + 1;
    }
    return (<Row>{ res }</Row>);
}


/***
 * 键值对
 */
export function Label(props) {
    const res = <div style={ props.style }>
        <div className="sd-ellipsis"
             style={ { display: 'inline-block', width: '40%' } }
             title={ props.field[0] }
        >
            { props.field[0] }：
        </div>
        <div className="sd-ellipsis"
             style={ { display: 'inline-block', width: '60%' } }
             title={ props.field[1] }
        >
            { props.field[1] }
        </div>
    </div>;
    if (props.wrapper && props.wrapper.span !== undefined) {
        return (
            <Row>
                <Col span={ props.wrapper.span } style={ { padding: '6px 0 6px 10px' } }>
                    { res }
                </Col>
            </Row>
        );
    } else {
        return res;
    }
}

export function BackToTop(props) {
    if (!props.wrapperId && !props.wrapper) {
        console.error('必须设置"wrapperId"或"wrapper"');
        return;
    }
    const [visible, setVisible] = useState(false);
    const wrapper = document.getElementById(props.wrapperId) || props.wrapper;
    let key = props.wrapperId;
    if (!key) { // 没有id则用随机数
        key = Math.random().toString(36).substring(7).split('').join('.');
    }
    useEffect(() => {
        if (!wrapper) {
            console.error('element不存在,请检查Id是否存在且正确');
            return;
        }
        wrapper.onscroll = () => {
            setVisible(wrapper.scrollTop > 100);
        }
    });
    const backToTop = () => {
        const speed = wrapper.scrollTop / 10;
        const interval = setInterval(() => {
            if (wrapper.scrollTop > 0) {
                wrapper.scrollTop -= speed;
            } else {
                clearInterval(interval);
            }
        }, 20);
    };
    return (
        <img
            key={ key }
            alt="pic"
            style={ {
                position: 'fixed',
                right: '20px',
                bottom: '20px',
                zIndex: '1100',
                opacity: visible ? 1 : 0,
            } }
            src={ require('src/assets/images/icon_to_top.png') }
            onClick={ backToTop }
        />
    );
}