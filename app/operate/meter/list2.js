/**
 * 预充值电费-列表
 */

layui.use(['element', 'form', 'laydate', 'Dialog', 'Req', 'Pager', 'laydate', 'Common', 'DateRangeUtil', 'ListModule'], function() {
    var $ = layui.jquery,
        laydate = layui.laydate,
        form = layui.form,
        element = layui.element;
    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var DateRangeUtil = layui.DateRangeUtil;
    var ListModule = layui.ListModule;
    var Req = layui.Req;

    function init() {
        ListModule.init();
    }

    function getExportNoticeDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-80">充值日期</label>' +
                                '<div class="layui-input-inline text-w-120">' +
                                    '<input type="text" name="beginDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input beginDateBox">'+
                                '</div>' +
                                '<div class="layui-form-mid">-</div>' +
                                '<div class="layui-input-inline text-w-120">' +
                                    '<input type="text" name="endDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input endDateBox">'+
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function renderBeginDateBox(date) {
        lay('.beginDateBox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                // showBottom: false,
                btns: ['clear', 'now'],
                value: date
            });
        });
    }

    function renderEndDateBox(Date) {
        lay('.endDateBox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                // showBottom: false,
                btns: ['clear', 'now'],
                value: Date
            });
        });
    }

    $(function() {
        init();

        // 已充值电费导出
        $(document).on('click', '.ajaxExportNotice', function () {
            var url = $(this).attr('data-url');
            Dialog.formDialog({
                title: '导出',
                content: getExportNoticeDialogHtml(),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    var date = DateRangeUtil.getPreviousMonth();
                    var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');
                    renderBeginDateBox(date[0]);
                    renderEndDateBox(curDate);
                    form.render(null, 'formDialog');

                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();

                        var startDate = layero.find('input[name=beginDate]').val(),
                            endDate = layero.find('input[name=endDate]').val();

                        if(!DateRangeUtil.compareDate(startDate, endDate)) {
                            Dialog.errorDialog('开始日期不得大于结束日期');
                            return false;
                        }

                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                layer.close(index);
                                Dialog.downloadDialog({
                                    downloadUrl: res.data.url
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    });
                }
            })
        });
    });
});