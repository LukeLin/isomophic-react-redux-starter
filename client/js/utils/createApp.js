import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import fastclick from 'fastclick';

import App from '../../../common/App.jsx';
import configureStore from '../../../common/store/index';

if (process.env.NODE_ENV !== 'production') {
    var whyDidYouUpdate = require('why-did-you-update').default;
    whyDidYouUpdate(React);
    var ReactPerf = require('react-addons-perf');
    window.ReactPerf = ReactPerf;
}

// fastclick解决ios和部分安卓click事件的问题
fastclick.attach(document.body);

export default function createRender(middlewareConfig = {}){
    let store = null;
    let page = document.getElementById('page');
    let onRenderCompleted = typeof middlewareConfig.onRenderCompleted === 'function' && middlewareConfig.onRenderCompleted;

    if (process.env.NODE_ENV !== 'production') {
        // React.addons.Perf性能分析使用
        if (window.ReactPerf) {
            ReactPerf.start();
        }
    }

    return function ({
        rootReducer = (() => {
        }),
        component = null
    }) {
        let transformedData = typeof middlewareConfig.transformer === 'function'
            ? middlewareConfig.transformer(window.__INITIAL_STATE__) : window.__INITIAL_STATE__;
        if (!store) {
            store = configureStore(transformedData, rootReducer);
        }
        // hot load from hmr
        else if (process.env.NODE_ENV !== 'production') {
            store.replaceReducer(rootReducer);
        }

        render((
            <Provider store={ store }>
                <App appConfig={ window.__APP_CONFIG__ }>
                    { component }
                </App>
            </Provider>
        ), page, onRenderCompleted);

        return Promise.resolve(store);
    };
}
