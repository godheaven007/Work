/**
 * 盖章归档-待归档合同-归档
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'laydate', 'Common', 'Regex', 'upload', 'MUpload'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;

    function renderDatebox() {
        lay('.datebox').each(function(){
            laydate.render({
                elem: this,
                // showBottom: false,
                btns: ['clear', 'now'],
                trigger: 'click'
            });
        });
    }

    function renderDatebox2() {
        lay('.datebox2').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                range: '~',
            });
        });
    }

    function init() {
        renderDatebox();
        renderDatebox2();

        MUpload({
            elem: $('.upload1'),
            exts: 'jpg|jpeg|png|pdf'
        });
    }
    $(function() {
        init();

        form.on('submit(saveSubmit)', function(data){
            var $form = $('form'),
                url = $(this).attr('data-url');

            Common.Util.replaceSerializeName2($form);
            var param = $form.serializeArray();
            var auditStatus = $(data.elem).attr('data-audit-status');

            param.push({
                name: 'auditStatus',
                value: auditStatus
            });

            Req.postReqCommon(url, param);
            return false;
        });
    });
});