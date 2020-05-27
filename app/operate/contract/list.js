/**
 * 合同-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager','laydate', 'DateRangeUtil', 'ListModule'], function() {
    var $ = layui.jquery,
        laydate = layui.laydate,
        form = layui.form,
        Pager = layui.Pager,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var DateRangeUtil = layui.DateRangeUtil;
    var ListModule = layui.ListModule;

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

    function init() {
        ListModule.init();
    }

    // 生成缴费通知单
    function getExportNoticeDialogHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-120">生成应收日期在</label>' +
                                '<div class="layui-input-inline text-w-100">' +
                                    '<input type="text" name="end_date" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input endDateBox">'+
                                '</div>' +
                                '<div class="layui-form-mid">之前的</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 30px;">' +
                                    '<input type="radio" name="notice_type" value="1" title="租金缴纳通知单" checked>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<div class="layui-input-block" style="margin-left: 30px;">' +
                                    '<input type="radio" name="notice_type" value="2" title="电费缴纳通知单">' +
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
        
        // 生成缴费通知单
        $(document).on('click', '.ajaxExportNotice', function () {
            var url = $(this).attr('data-url');
            Dialog.formDialog({
                title: '生成缴费通知单',
                content: getExportNoticeDialogHtml(),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    var date = DateRangeUtil.getCurrentMonth();
                    renderEndDateBox(date[1]);
                    form.render(null, 'formDialog');

                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();
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

        $(document).on('click', '.openhtmldialog', function () {
            var url = $(this).attr('data-url');
            Req.getReq(url, function (res) {
                Dialog.tipDialog({
                    title: '查看甲方合同',
                    btn: ['关闭'],
                    area: ['475px', 'auto'],
                    content: res,
                    yesFn: function (index, layero) {
                        layer.close(index);
                    }
                })
            },'html');
        });
    });
});