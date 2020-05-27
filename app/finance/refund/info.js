/**
 * 财务-退租-详情
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex', 'laydate', 'upload', 'MUpload'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;


    function init() {
        MUpload({
            elem: $('.upload'),
            size: 1024 * 50,
            choose:function(){},
        });
        renderDatebox();
    }

    function renderDatebox() {
        var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');
        lay('.datebox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                btns: ['clear', 'now'],
                max: curDate
            });
        });
    }


    function getRefuseDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>退回原因</label>' +
                                '<div class="layui-input-block">' +
                                    '<textarea placeholder="请填写退回原因" maxlength="500" lay-verify="required"  lay-reqText="请填写退回原因" class="layui-textarea" name="reason"></textarea>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function getCancelRevokeDialogHtml() {
        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="" lay-filter="formDialog">' +
            '<div class="layui-form-item">' +
            '<label class="layui-form-label"><span class="c-orange">* </span>撤销说明</label>' +
            '<div class="layui-input-block">' +
            '<textarea placeholder="请填写撤销原因" maxlength="500" lay-verify="required"  lay-reqText="请填写撤销原因" class="layui-textarea" name="reason"></textarea>' +
            '</div>' +
            '</div>' +
            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    $(function() {

        init();

        // 确认无误
        $(document).on('click', '#abortCheckAgree', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                result = $o.attr('data-result');
            var $form = $('form'),
                param = $form.serializeArray();
            param.push({name: 'result', value: result});

            Dialog.confirmDialog({
                title: ' 退租校核确认',
                content: '确定已仔细核对退租信息，要继续提交吗？',
                yesFn: function (index, layero) {
                    Req.postReqCommon(url, param);
                }
            });


        });

        // 退回修改
        $(document).on('click', '#abortCheckEdit', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                result = $o.attr('data-result');
            var $form = $('form'),
                param = $form.serializeArray();
            param.push({name: 'result', value: result});

            Dialog.formDialog({
                title: '退回修改',
                content: getRefuseDialogHtml(),
                success: function (layero, index) {
                    form.on('submit(bind)', function(data) {
                        var $reason = layero.find('textarea[name=reason]');
                        param.push({name: 'reason', value: $reason.val()});
                        Req.postReqCommon(url, param);
                        return false;
                    })
                }
            });
        });

        // 撤销校核
        $(document).on('click', '.ajaxCancelRevoke', function () {
            var $o = $(this),
                url = $o.attr('data-url');

            Dialog.formDialog({
                title: '撤销校核',
                content: getCancelRevokeDialogHtml(),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    form.on('submit(bind)', function(data) {
                        var param = $form.serializeArray();
                        Req.postReqCommon(url, param);
                        return false;
                    })
                }
            });
        });

        // 退租-退租清算
        form.on('submit(abortClearSubmit)', function (data) {
            var $elem = $(data.elem),
                url = $elem.attr('data-url'),
                result = $elem.attr('data-result');

            var $form = $('form'),
                param = $form.serializeArray();
            param.push({name: 'result', value: result});

            Req.postReqCommon(url, param);
            return false;
        })

    });
});