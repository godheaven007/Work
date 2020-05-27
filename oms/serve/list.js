/**
 * 服务-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager', 'laydate', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var ListModule = layui.ListModule;

    function init() {
        ListModule.init();
    }

    $(function() {
        init();

        // 停用
        $(document).on('click', '.ajaxStop', function() {
            var url = $(this).attr('data-url');

            Dialog.confirmDialog({
                title: '提示',
                content: '你确认要停用此服务商吗？',
                yesFn: function (index, layero) {
                    Req.getReq(url, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                var param  = ListModule.getSplitParam();
                                Pager.renderPager(param);
                                layer.close(index);
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    })
                }
            })
        });

        // 启用
        $(document).on('click', '.ajaxStart', function() {
            var url = $(this).attr('data-url');
            Req.getReq(url, function (res) {
                if(res.status) {
                    Dialog.successDialog(res.msg, function () {
                        var param  = ListModule.getSplitParam();
                        Pager.renderPager(param);
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });
        
        $(document).on('click', '.exportorder', function () {
            var url = $(this).attr('data-url');
            var param = ListModule.getSplitParam();
            var exportUrl = url + '?beginDate=' + param.beginDate + '&endDate=' + param.endDate + '&keyword=' + encodeURIComponent(param.keyword) + '&status=' + param.status;
            window.open(exportUrl, '_blank');
        });
    });
});