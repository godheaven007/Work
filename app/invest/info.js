/**
 * 招商-拟签约客户-查看客户详情
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'OTree', 'Print', 'Approval'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var Approval = layui.Approval;

    $(function() {

        Approval();

        // 撤回
        $(document).on('click', '.ajaxInvestCancel', function() {
            var url = $(this).attr('data-url');

            Dialog.confirmDialog({
                title: '提醒',
                content: '此招商申请领导正在审核中，你确认要撤回已提交的招商申请吗？',
                yesFn: function(index, layero) {
                    Req.getReq(url, function(res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg);
                            if(res.data.url) {
                                window.location.href = res.data.url;
                            }
                            layer.close(index);
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    })
                }
            })
        });

        // 删除客户
        $(document).on('click', '.ajaxDelCustomer', function() {
            var url = $(this).attr('data-url');
            Dialog.delDialog({
                title: '删除客户',
                content: '<div style="padding: 20px;">若删除此客户资料，相关的客户信息将一起被删除</div>',
                yesFn: function(index, layero) {
                    Req.getReq(url, function(res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg);
                            layer.close(index);
                            if(res.data.url) {
                                window.location.href = res.data.url;
                            }
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                }
            });
        });

        form.on('submit', function(data){
            return false;
        });
    });
});