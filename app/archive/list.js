/**
 * 盖章归档-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager', 'Regex','upload', 'MUpload', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        device = layui.device(),
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

    function getScanFileDialogHtml(name) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog" style="height: 180px; overflow-x:hidden;">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">客户名称</label>' +
                                '<div class="layui-form-mid">' + name + '</div>' +
                                '<input type="hidden" name="customerName" value="'+ name +'">' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">上传附件</label>' +
                                '<div class="layui-input-block">' +
                                    '<div class="upload-wrapper">' +
                                        '<div class="upload-box">' +
                                            '<button type="button" class="layui-btn upload"><i class="layui-icon"></i>上传</button>' +
                                            '<div class="describe">请上传盖章合同扫描件，可上传多个，仅限JPG,PNG,PDF格式</div>' +
                                        '</div>' +
                                        '<div class="upload-list"></div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>'+
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    $(function() {

        init();

        $(document).on('click', '.ajaxUploadFile', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                name = $o.attr('data-name');
            Dialog.formDialog({
                title: '扫描上传',
                content: getScanFileDialogHtml(name),
                area: ['550px', '300px'],
                success: function (layero, dialogIndex) {
                    var $form = layero.find('form');
                    var $elem = layero.find('.upload');
                    MUpload({
                        elem: $elem,
                        exts: 'jpg|jpeg|png|pdf',
                        before: function() {return true}
                    });
                    form.on('submit(bind)', function(data) {
                        var param = $form.serializeArray();
                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function() {
                                    layer.close(dialogIndex);
                                    window.location.reload();
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        })
                        return false;
                    })
                },
                endFn: function () {
                    // IE浏览器上传
                    if (device.ie && device.ie < 10) {
                        $('iframe').remove();
                    }
                }
            })
        })

        $(document).on('click', '.normalDialog', function() {
            var message = $(this).attr('data-message');
            Dialog.tipDialog({
                content: message,
                yesFn: function(index, layero) {
                    layer.close(index);
                }
            })
        });
    });
});