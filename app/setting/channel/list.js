/**
 * 渠道管理-列表
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

    var companyList = [];


    function init() {
        loadCompany();

        ListModule.init();
    }

    function loadCompany() {
        var url = $('input[name=getAllCompany]').val();
        Req.getReq(url, function (res) {
            if(res.status) {
                companyList = res.data.list;
            }
        })
    }

    function getCompanyOpts() {
        var opts = '<option value="">请选择渠道公司</option>';

        if(companyList && companyList.length) {
            companyList.forEach(function (item, index) {
                opts += '<option value="'+ item.id +'" companyid="'+ item.id +'">'+ item.name +'</option>';
            })
        }
        return opts;
    }

    function getAgentDialogHtml(param) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>所属公司</label>' +
                                '<div class="layui-input-block">' +
                                    '<select name="company" lay-verify="required"  lay-reqText="请选择渠道公司" lay-filter="company" lay-search>' +
                                        getCompanyOpts() +
                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>经纪人姓名</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="name" value="'+ param.name +'" maxlength="10"  lay-reqText="请填写姓名" lay-verify="required" placeholder="请填写姓名" autocomplete="off" class="layui-input">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"><span class="c-orange">* </span>手机号码</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="phone" value="'+ param.phone +'"  lay-reqText="请填写手机号码" lay-verify="required|phone" placeholder="请填写手机号码" autocomplete="off" class="layui-input">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">微信号</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="wechat" value="'+ param.wechat +'" lay-reqText="请填写微信号" placeholder="请填写微信号" autocomplete="off" class="layui-input">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">职务</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="job" value="'+ param.job +'"  placeholder="请填写职务" autocomplete="off" class="layui-input">'+
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 新建\编辑经纪人
    function doAgent(url, param) {
        Dialog.formDialog({
            title: '新增经纪人',
            content: getAgentDialogHtml(param),
            success: function (layero, index) {
                var $form = layero.find('form');
                form.val('formDialog', {
                    company: param.companyId
                });
                form.render(null, 'formDialog');

                form.on('submit(bind)', function (data) {
                    var param = $form.serializeArray();
                    Req.postReq(url, param, function (res) {
                        if (res.status) {
                            layer.close(index);
                            ListModule.updateList();
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                    return false;
                })
            }
        })
    }

    $(function() {

        init();

        // 新建经纪人
        $(document).on('click', '.ajaxAddAgent', function () {
            var $o = $(this),
                url = $o.attr('data-url');
            var param = {
                company: '',
                companyId: '',
                name: '',
                phone: '',
                wechat: '',
                job: ''
            };
            doAgent(url, param);
        });

        // 编辑经纪人
        $(document).on('click', '.ajaxUpdate', function () {
            var $o = $(this),
                url = $o.attr('data-url');
            var param = {
                company: $o.attr('data-company-name') ? $o.attr('data-company-name') : '',
                companyId: $o.attr('data-company-id') ? $o.attr('data-company-id') : '',
                name: $o.attr('data-agent-name') ? $o.attr('data-agent-name') : '',
                phone: $o.attr('data-agent-phone') ? $o.attr('data-agent-phone') : '',
                wechat: $o.attr('data-agent-weixin') ? $o.attr('data-agent-weixin') : '',
                job: $o.attr('data-agent-pos') ? $o.attr('data-agent-pos') : ''
            };
            doAgent(url, param);
        });

    });
});