/**
 * 数据中心-下载池（参考parklist.js）
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager2'], function() {
    var $ = layui.jquery,
        form = layui.form,
        Pager2 = layui.Pager2,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;

    var pager = null;
    var t = null;

    function init() {
        var pageAjaxUrl = $('#pageAjaxUrl').val();

        pager = Pager2({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam,
            pageContainer: $('.ajaxTableTbody'),
            pageBar: $('.ajaxTablePage')
        });
    }

    // 获取分页参数
    function getSplitParam() {
        var param = {
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };
        return param;
    }

    $(function() {

        init();

        t = setInterval(function () {
            var param  = getSplitParam();
            pager.render(param);
        }, 5000);
    });
});