/**
 * 设置-企业设置
 */

layui.use(['element', 'form', 'PCA', 'Dialog', 'Req', 'Common', 'upload', 'MUpload'], function() {
    var $ = layui.jquery,
        form = layui.form,
        $form = $('form'),
        upload = layui.upload,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var MUpload = layui.MUpload;
    var Dialog = layui.Dialog;

    var PCA = layui.PCA;
    PCA();
    $(function() {
        // 编辑
        $(document).on('click', '.ajaxEditCompany', function() {
            var url = $(this).attr('data-url');
            Req.getReq(url, function(res) {
                $('.viewDiv').hide();
                $('.editDiv').show();
                $('.companyContent').html(res);
                form.render();

                MUpload({
                    elem: $('.upload'),
                    maxNum: 1
                });
            }, 'html');
        });

        // 取消
        $(document).on('click', '.ajaxCancelCompany', function() {
            var url = $(this).attr('data-url');
            Req.getReq(url, function(res) {
                $('.viewDiv').show();
                $('.editDiv').hide();
                $('.companyContent').html(res);
            }, 'html');
        });

        // 保存
        $(document).on('click', '.ajaxSaveCompany', function() {
            // var url = $(this).attr('data-url');
            // var data = $('form').serializeArray();
            // Req.postReq(url, data, function(res) {
            //     if(res.status) {
            //         Dialog.successDialog(res.msg);
            //         Req.getReq(res.data.pageUrl, function(res) {
            //             $('.viewDiv').show();
            //             $('.editDiv').hide();
            //             $('.layui-card-body').html(res);
            //         }, 'html');
            //     } else {
            //         Dialog.errorDialog(res.msg);
            //     }
            // });
        });

        form.on('submit(component-form-demo1)', function(data){
            var $elem = $(data.elem),
                url = $elem.attr('data-url');
            var data = $('form').serializeArray();
            Req.postReq(url, data, function(res) {
                if(res.status) {
                    Dialog.successDialog(res.msg, function () {
                        Req.getReq(res.data.pageUrl, function(res) {
                            $('.viewDiv').show();
                            $('.editDiv').hide();
                            $('.companyContent').html(res);
                        }, 'html');
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
            return false;
        });
    });
});