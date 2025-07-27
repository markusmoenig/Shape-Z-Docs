import React, { useEffect } from 'react';
import Layout from '@theme-original/Layout';

export default function LayoutWrapper(props) {
    console.log("✅ Custom Layout loaded");

    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/wasm/wasm-loader.js';
        script.async = true;
        document.body.appendChild(script);
        console.log("🚀 Injected wasm-loader.js");
    }, []);

    return <Layout {...props} />;
}