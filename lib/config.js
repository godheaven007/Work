var getRootDomain = function() {
    var host = "null",
        url,
        origin;
    if (typeof url == "undefined" || null == url)
        url = window.location.href;
    origin = url.split('?')[0];
    var regex = /.*\:\/\/([^\/|:]*).*/;
    var matchVal = origin.match(regex);
    if (typeof matchVal != "undefined" && null != matchVal) {
        host = matchVal[1];
    }
    if (typeof host != "undefined" && null != host) {
        var strAry = host.split(".");
        if (strAry.length > 1) {
            host = strAry[strAry.length - 2] + "." + strAry[strAry.length - 1];
        }
    }
    return host;
};

// var StaticBaseUrl = 'http://ibs.' + getRootDomain();
var StaticBaseUrl = '';
if (!window.location.origin) {
    StaticBaseUrl = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
} else {
    StaticBaseUrl = window.location.origin;
}

var timestamp = 'AK37AC8M20200506';
// var timestamp = new Date().getTime();
seajs.config({
    //开发配置
    base: StaticBaseUrl + '/assets/lib/',

    // 别名配置
    alias: {
        'jquery': 'jquery/1.9.1/jquery.js',
        'text': 'seajs/seajs-text/1.1.1/seajs-text.js', //seajs plugin text
        'style': 'seajs/seajs-style/1.0.2/seajs-style.js', //seajs plugin style

        /*表单验证*/
        'validationEngine': 'widget/validationEngine/1.0.0/validationEngine.js',
        'validationEngineLanguage': 'widget/validationEngine/1.0.0/validationEngineLanguage.js',
        'layer': 'widget/layer/1.8.5/layer.js',
    },

    // 路径配置
    paths: {
        'index': 'app/index',
        'user': 'app/user',
        'home': 'app/home',
        'setting': 'app/setting',
        'house': 'app/house',
        'invest': 'app/invest',
        'approval': 'app/approval',
        'operate': 'app/operate',
        'finance': 'app/finance',
        'archive': 'app/archive',
        'center': 'app/center',
        'cms': 'app/cms',
        'common': 'app/common',
        'modules': 'app/modules',
        'setting2': 'oms/setting',
        'customer': 'oms/customer',
        'serve': 'oms/serve',
        'act': 'oms/act',
        'opex': 'oms/opex'
    },

    // 变量配置 引用require('{locale}.js');
    vars: {
        'locale': 'zh-cn',
        'domain': getRootDomain()
    },

    // 映射配置
    map: [
        [/^(.*\.(?:css|js|swf|tpl))(.*)$/i, '$1?' + timestamp]
    ],

    // 预加载项
    preload: [
        "jquery", "text"
    ],

    // 调试模式
    debug: true,

    // 文件编码
    charset: 'utf-8'

});
