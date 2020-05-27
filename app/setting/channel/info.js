/**
 * 查看经纪人详情
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager2'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        device = layui.device(),
        element = layui.element;
    var Common = layui.CommonOMS;
    var Pager2 = layui.Pager2;
    var Req = layui.Req;
    var Dialog = layui.Dialog;

    var pager = null,
        pager2 = null;

    // 获取分页参数
    function getSplitParam(index) {
        var param = {
            limit: $('.ajaxpageselect').eq(index).find('option:selected').val() || 10,
            page: $('.inputpage').eq(index).val() || 1
        };

        return param;
    }

    // function renderParkPager() {
    //     pager2 = Pager2({
    //         type: 1,
    //         url: '',
    //         callback: getSplitParam,
    //         pageContainer: $('.parkAjax').find('.ajaxTableTbody'),
    //         pageBar: $('.parkAjax').find('.ajaxTablePage')
    //     });
    // }

    function renderLogPager() {
        var pageAjaxUrl = $('#pageAjaxUrl').val();

        pager = Pager2({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam,
            pageContainer: $('.logAjax').find('.ajaxTableTbody'),
            pageBar: $('.logAjax').find('.ajaxTablePage')
        });
    }

    function loadItem($o, url) {
        Req.getReq(url, function (res) {
            if(res.status) {
                $o.html(res.data.listContent);
                $o.find('.loading').hide();
            } else {
                // 区块不显示
                $o.hide();
            }
        });
    }

    // 异步加载首页各模块
    function loadModules() {
        var $modules = $('.ajaxLoad');
        $modules.each(function (i, o) {
            var $o = $(o),
                url = $o.attr('data-url');
            loadItem($o, url);
        });
    }

    $(function() {
        renderLogPager();
        loadModules();

        $(document).on('click', '.ajax_del_company', function () {
            var url = $(this).attr('data-url');
            Dialog.confirmDialog({
                title: '温馨提示',
                content: '你确认要删除此渠道公司吗？',
                yesFn: function (index, layero) {
                    Req.getReqCommon(url);
                }
            });
        });
    });
});