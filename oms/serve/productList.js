/**
 * 服务-产品管理列表
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

        // 上架\下架
        $(document).on('click', '.ajaxProductStatus', function() {
            var url = $(this).attr('data-url');

            if($(this).hasClass('ico-soldout')) {
                // 下架
                Dialog.confirmDialog({
                    title: '提示',
                    content: '你确认要下架此服务产品吗？',
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
            } else {
                // 上架
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
            }
        });

        // 推荐
        $(document).on('click', '.ajaxFeature', function() {
            var recommend = $(this).attr('data-recommend'),
                url = $(this).attr('data-url');

            if(recommend == '1') {
                // 取消推荐
                Dialog.confirmDialog({
                    title: '提示',
                    content: '你确认要取消推荐此热门服务产品吗？',
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
            } else {
                // 推荐
                Req.getReq(url, function (res) {
                    if(res.status) {
                        Dialog.successDialog(res.msg, function () {
                            var param  = ListModule.getSplitParam();
                            Pager.renderPager(param);
                        });
                    } else {
                        Dialog.errorDialog(res.msg);
                    }
                })
            }
        });

        // 排序值修改
        $(document).on('blur', '.sortNo', function (e) {
            var $o = $(this),
                id = $o.attr('data-id'),
                value = $o.attr('data-value');

            var url = $('#updateOrderUrl').val();

            if(!Regex.only1to255.reg.test( $o.val())) {
                Dialog.errorDialog(Regex.only1to255.msg, function () {
                    $o.val(value);
                });
                return false;
            }

            Req.postReq(url, {id: id, num: $o.val()}, function (res) {
                if(res.status) {
                    Dialog.successDialog(res.msg, function () {
                        var param  = ListModule.getSplitParam();
                        Pager.renderPager(param);
                    });
                } else {
                    Dialog.errorDialog(res.msg, function () {
                        $o.focus();
                    })
                }
            });
        });
    });
});