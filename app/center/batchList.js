/**
 * 报表中心-导出
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager', 'Regex','upload', 'MUpload'], function() {
    var $ = layui.jquery,
        form = layui.form,
        device = layui.device(),
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;


    function init() {
        var pageAjaxUrl = $('#pageAjaxUrl').val();

        Pager.initPager({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam
        });
    }

    // 获取分页参数
    function getSplitParam() {
        var param = {
            type: $('select[name=type] option:selected').val(),
            keyword: $('input[name=keyword]').val(),
            limit: $('.ajaxpageselect option:selected').val() || 10,
            page: $('.inputpage').val() || 1
        };

        if($('select[name=status]').length) {
            param.status = $('select[name=status] option:selected').val();
        }

        return param;
    }

    function getScanFileDialogHtml(name) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog" style="height: 180px; overflow-y:scroll;">' +
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
                                            '<button type="button" class="layui-btn upload"><i class="layui-icon"></i>上传</button><input class="layui-upload-file" type="file" accept="" name="file">' +
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
                        before: function() {return true},
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
                        window.location.reload();
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

        /**
         * 搜索
         */
        $(document).on('click', '.ajaxSearch', function() {
            var param  = getSplitParam();
            Pager.renderPager(param);
        });
        $(document).on('keydown', 'input[name=keyword]', function(e) {
            if (e.keyCode == 13) {
                $('.ajaxSearch').trigger('click');
            }
        });
        form.on('select(type)', function (data) {
            var param  = getSplitParam();
            Pager.renderPager(param);
        });
        form.on('select(status)', function (data) {
            var param  = getSplitParam();
            Pager.renderPager(param);
        });
    });
});