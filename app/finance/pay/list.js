/**
 * 财务-支出-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'laydate', 'Common', 'Pager', 'Regex','upload', 'MUpload', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;
    var ListModule = layui.ListModule;

    function init() {
        ListModule.init();
    }

    $(function() {

        init();

        // 导出
        $(document).on('click', '.financePayExport', function () {
            var url = $(this).attr('data-url'),
                key = $(this).attr('data-key');

            var param = ListModule.getSplitParam();
            param.key = key;
            param.typeKey = $('select[name=type] option:selected').text() || '';

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