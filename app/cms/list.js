/**
 * 园企互动-列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var ListModule = layui.ListModule;

    function init() {
        ListModule.init();
    }

    // 时间戳转时间
    function timeStampToDate(timestamp) {
        var date = new Date(timestamp);
        return date.toLocaleDateString().replace(/\//g, "-") + " " + date.toTimeString().substr(0, 5);
    }

    function getPreviewDialogHtml(title, date, content) {
        var _html = '<div style=" background-color:#f4f4f4; box-sizing: border-box; width: 475px; height: 600px; overflow-y: scroll; padding: 0 50px;">' +
                        '<div class="layui-card-body view-news" style="background-color:#fff; min-height: 600px;">' +
                            '<h2>'+ title +'</h2>' +
                            '<div class="time">'+ timeStampToDate(date) +'</div>' +
                            '<div class="txt">' +
                                content +
                            '</div>' +
                        '</div>'+
                    '</div>';
        return _html;
    }

    $(function() {

        init();

        // 删除
        $(document).on('click', '.ajaxDel', function() {
            var url = $(this).attr('data-url');
            Dialog.confirmDialog({
                title: '提示',
                content: '确定要删除吗？',
                yesFn: function (index, layero) {
                    Req.getReq(url, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                ListModule.updateList();
                                layer.close(index);
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                }
            });
        });

        // 预览-资讯
        $(document).on('click', '.previewInfo', function() {
            var url = $(this).attr('data-url');
            Req.getReq(url, function (res) {
                if(res.status) {
                    var resultData = res.data.data;
                    layer.open({
                        id: 40003,
                        type: 5,   // 表单超出部分不被遮挡
                        title: '预览',
                        content: getPreviewDialogHtml(resultData.infoTitle, resultData.infoPubDate, resultData.infoText),
                        area: ['475px', '600px'],
                        btn: [],
                    });
                }
            })
        });

        // 预览-公告
        $(document).on('click', '.previewInfo2', function() {
            var url = $(this).attr('data-url');
            Req.getReq(url, function (res) {
                if(res.status) {
                    var resultData = res.data.data;
                    layer.open({
                        id: 40003,
                        type: 5,   // 表单超出部分不被遮挡
                        title: '预览',
                        content: getPreviewDialogHtml(resultData.noticeTitle, resultData.noticePubDate, resultData.noticeText),
                        area: ['475px', '600px'],
                        btn: [],
                    });
                }
            })
        });
    });
});