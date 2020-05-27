/**
 * 房源-详情（分页：租赁历史、电表信息、操作日志等）
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

    // 异步加载首页各模块
    function loadModules() {
        var $modules = $('.ajaxLoad');
        $modules.each(function (i, o) {
            var $o = $(o),
                url = $o.attr('data-url');

            Req.getReq(url, function (res) {
                if(res.status) {
                    $o.html(res.data.templateContent);
                    $o.find('.loading').hide();
                    renderPager($o);
                } else {
                    // 区块不显示
                    // $o.hide();
                }
            });
        })
    }

    function renderPager($o) {
        Pager2({
            type: 2,
            pageContainer: $o.find('.ajaxTableTbody'),
            pageBar: $o.find('.ajaxTablePage')
        });
    }

    function init() {
        loadModules();
        // var $ajaxTables = $('.ajaxTable');
        // $ajaxTables.each(function (i, o) {
        //     Pager2({
        //         type: 2,
        //         pageContainer: $('.ajaxTableTbody').eq(i),
        //         pageBar: $('.ajaxTablePage').eq(i)
        //     });
        // });
    }

    $(function() {
        init();
    });
});