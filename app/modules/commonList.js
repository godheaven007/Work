/**
 * 通用列表页
 */

layui.use(['element', 'form', 'laydate', 'Dialog', 'Req', 'Pager', 'laydate', 'Common', 'ListModule'], function() {
    var $ = layui.jquery,
        laydate = layui.laydate,
        form = layui.form,
        element = layui.element;
    var Dialog = layui.Dialog;
    var Req = layui.Req;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var ListModule = layui.ListModule;

    $(function () {
        ListModule.init();

        // 导出
        $(document).on('click', '.export', function () {
            var url = $(this).attr('data-url');

            var param = ListModule.getSplitParam();

            var $selects = $('.ajaxSearchForm').find('select');
            if($selects.length) {
                $selects.each(function (i, o) {
                   param[$(o).attr('name') + 'Name'] = $(o).find('option:selected').text() || '';
                });
            }

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