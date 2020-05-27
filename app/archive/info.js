/**
 * 盖章归档-(待盖章合同\待归档合同\待校核合同详情)
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex', 'upload', 'MUpload'], function() {
    var $ = layui.jquery,
        form = layui.form,
        device = layui.device(),
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;
    var fileList = [];
    function getUnpassDialogHtml() {
        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="" lay-filter="formDialog">' +
            '<div class="layui-form-item">' +
            '<div>' +
            '<textarea placeholder="输入校核不通过的原因，至少2个字" lay-verify="required" maxlength="500"  lay-reqText="输入校核不通过的原因，至少2个字" class="layui-textarea" name="reason"></textarea>' +
            '</div>' +
            '</div>' +
            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    function init() {
        if(typeof filelist != 'undefined') {
            fileList = JSON.parse(filelist);
        }
    }

    $(function() {
        init();
        form.verify({
            // 合同编号
            contractNo: function(value, item) {
                if(!$('.backDiv').hasClass('hidden')) {
                    if(!Regex.required.reg.test(value)) {
                        return Regex.required.msg;
                    }
                }
            }
        });

        form.on('radio(status)', function(data) {
            if(data.value == '2') {
                // 确认无误进行盖章登记
                $('.backDiv').removeClass('hidden');
            } else if(data.value == '-1') {
                // 合同信息有误需退回
                $('.backDiv').addClass('hidden');
            }
        });

        form.on('submit(submit)', function(data){
            var url = $('#submit').attr('data-url'),
                $form = $('form'),
                param = $form.serializeArray();

            Req.postReq(url, param, function (res) {
                if(res.status) {
                    Dialog.successDialog(res.msg, function () {
                        if(res.data.url) {
                            window.location.href = res.data.url;
                        }
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            })
            return false;
        });

        form.on('submit', function () {
            return false;
        })
        // 校核通过
        $(document).on('click', '#passsubmit', function() {
            var url = $(this).attr('data-url');

            Dialog.confirmDialog({
                title: '校核通过',
                content: '校核通过后则整个归档工作完成，且无法再修改。确定校核通过吗？',
                yesFn: function(index, layero) {
                    Req.getReqCommon(url);
                }
            });
        });

        // 校核不通过
        $(document).on('click', '#notpasssubmit', function() {
            var url = $(this).attr('data-url');

            Dialog.formDialog({
                title: '校核不通过',
                content: getUnpassDialogHtml(),
                success: function (layero, index) {
                    var $form = layero.find('form'),
                        $reason = layero.find('textarea[name=reason]');
                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();
                        if($reason.val().length < 2) {
                            Dialog.errorDialog('至少2个字');
                            return false;
                        }
                        Req.postReqCommon(url, param);
                    });
                }
            })
        });

        function getContractUpdateDialogHtml(customerName) {
            var _html = '<div class="layui-card-body">' +
                            '<form class="layui-form" action="" lay-filter="formDialog" style="height: 180px; overflow-x:hidden;">' +
                                '<div class="layui-form-item">' +
                                    '<label class="layui-form-label">客户名称</label>' +
                                    '<div class="layui-form-mid">'+ customerName +'</div>' +
                                    '<input type="hidden" name="customerName" value="'+ customerName +'">' +
                                '</div>' +
                                '<div class="layui-form-item">' +
                                    '<label class="layui-form-label">上传附件</label>' +
                                    '<div class="layui-input-block">' +
                                        '<div class="upload-wrapper">' +
                                            '<div class="upload-box">' +
                                                '<button type="button" class="layui-btn upload"><i class="layui-icon"></i>上传</button>' +
                                                '<div class="describe">请上传盖章合同扫描件，可上传多个，仅限JPG,PNG,PDF格式</div>' +
                                            '</div>' +
                                            '<div class="upload-list">';
            fileList.forEach(function (item, index) {
                _html += '<div class="upload-file-item"><i class="file-icon '+ item.attFileType +'"></i><a class="upload-file-name" href="'+ item.attUrl +'" target="_blank">'+ item.attName +'</a><i class="upload-file-remove" data-id="'+ item.attFileId +'"></i><input type="hidden" name="fileId[]" value="'+ item.attFileId +'"></div>';
            });
            _html +=
                                            '</div>' +
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
        // 更新
        $(document).on('click', '.ajaxupdate', function() {
            var $o = $(this),
                url = $o.attr('data-url'),
                customerName = $o.attr('data-customer');

            Dialog.formDialog({
                title: '合同扫描件更新',
                content: getContractUpdateDialogHtml(customerName),
                area: ['550px', '300px'],
                success: function (layero, index) {
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
                                    layer.close(index);
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
        });

        function getHistoryHtml(html) {
            return '<div style="max-height: 240px; overflow-y: scroll">'+ html +'</div>';
        }

        // 查看历史版本
        $(document).on('click', '.ajaxhistory', function() {
            Dialog.confirmDialog({
                title: '历史版本',
                content: getHistoryHtml($('.tablebox').html()),
                area: ['660px', 'auto'],
                btn: []
            })
        });
    });
});