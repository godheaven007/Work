/**
 * 设置-财务设置-开票权限设置
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'SUBTree', 'Req', 'Common', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        SUBTree = layui.SUBTree,
        element = layui.element;
    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Req = layui.Req;
    var ListModule = layui.ListModule;
    var subjectData;

    function init() {
        ListModule.init();
    }


    function setSubId(instance, url) {
        Req.postReq(url, {subIds: instance.subjectIdArr.join(',')}, function (res) {
           if(res.status) {
               Dialog.successDialog(res.msg, function() {
                   var param  = ListModule.getSplitParam();
                   Pager.renderPager(param);
                   instance.removeEventListener();
                   instance.$tree.remove();
               });
           } else {
               Dialog.errorDialog(res.msg);
           }
        });
    }

    $(function() {
        init();

        $(document).on('click', '.ajaxSetFinance', function () {
            var $o = $(this),
                url = $o.attr('data-url'),
                financeSubIds = $(this).attr('data-finance-subjects');

            if(!!financeSubIds) {
                // 已添加
                SUBTree({
                    callback: function(instance) {
                        setSubId(instance, url);
                    },
                    data: financeTree,
                    edit: financeSubIds.split(','),
                    title: '请选择财务科目',
                    treeViewTitle: '已选择的财务科目',
                    searchPlaceHolder: '请输入搜索关键字'
                });
            } else {
                // 未添加
                SUBTree({
                    callback: function(instance) {
                        setSubId(instance, url);
                    },
                    data: financeTree,
                    title: '请选择财务科目',
                    treeViewTitle: '已选择的财务科目',
                    searchPlaceHolder: '请输入搜索关键字'
                });
            }
        });

        form.on('submit', function () {
            return false;
        })
    });
});