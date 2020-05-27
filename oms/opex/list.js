/**
 * 运维管理-系统公告列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
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

        // 删除
        $(document).on('click', '.ajaxDel', function() {
            var url = $(this).attr('data-url');
            Dialog.confirmDialog({
                title: '提示',
                content: '确定要删除吗？',
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
                    });
                }
            });
        });
    });
});