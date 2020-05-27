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


layui.config({
    // version: new Date().getTime(),
    version: 'AK37AC8M20200506',
    base: StaticBaseUrl + '/assets/lib/app/modules/'
}).extend({
    //设定模块别名
    PCA: 'pca',
    DPTree: 'dptree',
    DPTree2: 'dptree2',
    SUBTree: 'subtree',
    OTree: 'otree',
    OTree2: 'otree2',
    ATree: 'atree',
    ATree2: 'atree2',
    CWTree: 'corpChatTree',
    Dialog: 'dialog',
    Pager: 'pager',
    Pager2: 'pager2',
    Common: 'common',
    CommonOMS: 'commonOMS',
    DateRangeUtil: 'dateRangeUtil',
    Graph: 'graph',
    Req: 'req',
    Print: 'print',
    Regex: 'regex',
    File: 'file',
    MUpload: 'mupload',
    Cropper: 'cropper',
    MouseWheel: 'mousewheel',
    Scroll: 'mCustomScrollbar',
    Editor: 'wangEditor',
    CommonEditor: 'commonEditor',
    Approval: 'approval',
    ListModule: 'listModule',
    Flow: 'flow',
    Nav: 'nav'
});