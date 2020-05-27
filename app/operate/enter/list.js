/**
 * 运营-入驻-列表
 */
layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager', 'laydate', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        Pager = layui.Pager,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var ListModule = layui.ListModule;

    function init() {
        ListModule.init();
    }

    $(function() {
        init();

        // 导出
        $(document).on('click', '.enterExport', function () {
            var url = $(this).attr('data-url'),
                key = $(this).attr('data-key');

            var param = ListModule.getSplitParam();
            param.key = key;

            Req.postReq(url, param, function (res) {
                if(res.status) {
                    Dialog.downloadDialog({
                        downloadUrl: res.data.url
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });
    });
});