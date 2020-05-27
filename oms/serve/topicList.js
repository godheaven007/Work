/**
 * 服务-专题管理列表
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Pager', 'Regex', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Pager = layui.Pager;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var ListModule = layui.ListModule;

    function init() {
        ListModule.init(function () {
            form.render();
        });
    }

    $(function() {
        init();

        // 下架
        $(document).on('click', '.ajaxDown', function() {
            var url = $(this).attr('data-url');

            Dialog.confirmDialog({
                title: '提示',
                content: '你确认要下架此服务专题吗？',
                yesFn: function (index, layero) {
                    Req.getReq(url, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                var param  = ListModule.getSplitParam();
                                Pager.renderPager(param);
                                layer.close(index);
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    })
                }
            });
        });

        // 上架
        $(document).on('click', '.ajaxUp', function() {
            var url = $(this).attr('data-url');
            Req.getReq(url, function (res) {
                if(res.status) {
                    Dialog.successDialog(res.msg, function () {
                        var param  = ListModule.getSplitParam();
                        Pager.renderPager(param);
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 排序值修改
        $(document).on('blur', '.sortNo', function (e) {
            var id = $(this).attr('data-id'),
                value = $(this).val(),
                $target = $(this);

            var url = $('#updateOrderUrl').val();

            if(!Regex.only1to255.reg.test(value)) {
                Dialog.errorDialog(Regex.only1to255.msg, function () {
                    // $target.focus();
                });
                return false;
            }

            Req.postReq(url, {id: id, num: value}, function (res) {
                if(res.status) {
                    Dialog.successDialog(res.msg, function () {
                        var param  = ListModule.getSplitParam();
                        Pager.renderPager(param);
                    });
                } else {
                    Dialog.errorDialog(res.msg, function () {
                        $target.focus();
                    })
                }
            });
        });
    });
});