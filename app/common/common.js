layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager', 'Print'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var Print = layui.Print;

    $(function() {
        // 打印
        $(document).on('click', '.printerCommon', function () {
            Common.commonPrint($('.approvalDiv'), function ($printArea) {
                Print($printArea);
                $('.approvalDiv').css('width', "auto").css("zoom", 1);
                $('.for-new-print .print').empty();
                $('.for-new-print').hide();
            });
        });

        // 新手任务
        $(document).on('click', '.ajaxCanAddPark, .ajaxHaveAuth', function (e) {
            var url = $(this).attr('data-url');
            Req.getReq(url, function (res) {
                if(res.status) {
                    if(res.data.url) {
                        window.location.href = res.data.url;
                    }
                } else {
                    Dialog.tipDialog({
                        title: '友情提醒',
                        content: res.msg,
                        yesFn: function(index, layero) {
                            layer.close(index);
                        }
                    });
                }
            })
        });
    });
});