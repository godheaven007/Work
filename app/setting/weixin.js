/**
 * 设置-企业微信应用安装
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'Req','Common'], function() {
    var $ = layui.jquery,
        element = layui.element,
        form = layui.form;
    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Req = layui.Req;

    $(function() {

        // 编辑运营公司
        $(document).on('click', '.showPic', function() {
            var url = $(this).attr('data-img-url');
            window.open(url, '_blank');
            // window.location.href = url;
        });

        form.on('submit(doSubmit)', function(data) {
            var elem = data.elem,
                url = $(elem).attr('data-url');
            var $form = $('form'),
                param = $form.serializeArray();

            Req.postReq(url, param, function (res) {
                if(res.status) {

                    Dialog.successDialog(res.msg, function () {
                        Dialog.skipDialog();
                        if(res.data.url) {
                            window.location.href = res.data.url;
                        }
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });

            return false;
        });
    });
});