/**
 * 设置-财务设置-项目与运营公司关联设置
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'eleTree', 'Req', 'Common', 'ListModule'], function() {
    var $ = layui.jquery,
        form = layui.form,
        element = layui.element;

    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var Common = layui.Common;
    var Req = layui.Req;
    var ListModule = layui.ListModule;


    function init() {
        ListModule.init();
    }

    function getMoreCompanyHtml(size, selectCompany) {
        var _html = '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100">运营公司<span class="companyIndex">'+ size +'</span></label>' +
                        '<div class="layui-input-inline text-w-250">' +
                            '<select name="company['+ (size -1) +']" lay-filter="company[]" lay-search>' +
                                getCompanyOpts(selectCompany) +
                            '</select>' +
                        '</div>' +
                        '<div class="layui-input-inline text-w-80">' +
                            '<div class="layui-form-mid"><a href="javascript:;" class="c-link delCompany">删除</a></div>' +
                        '</div>' +
                    '</div>';
        return _html;
    }



    // 运营公司
    function getCompanyOpts(selectCompany) {
        var opts = '<option value="">请选择</option>';
        companyList.forEach(function (item, index) {
            if(!selectCompany) {
                opts += '<option value="'+ item.companyId +'">'+ item.companyName +'</option>';
            } else {
                if(item.companyId == selectCompany) {
                    opts += '<option value="'+ item.companyId +'" selected>'+ item.companyName +'</option>';
                } else {
                    opts += '<option value="'+ item.companyId +'">'+ item.companyName +'</option>';
                }
            }

        });
        return opts;
    }

    // 添加\修改部门
    function getAddEditDeptDialogHtml(param) {
        var _html = '<div class="layui-card-body" style="height: 240px; overflow-y: scroll;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">分类</label>' +
                                '<div class="layui-form-mid">'+ param.cateName +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>项目/部门</label>';
        if(param.cateName == '其他') {
            _html += '<div class="layui-input-inline text-w-250">' +
                        '<input type="text" name="name" value="'+ param.departName +'" lay-verify="required"  lay-reqText="请填写项目/部门名称" required placeholder="请填写项目/部门名称" autocomplete="off" class="layui-input" >'+
                    '</div>';
        } else if(param.cateName == '项目') {
            _html += '<div class="layui-form-mid">'+ param.departName +'</div>'
        }
        _html +=
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>默认运营公司</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<select name="company[0]" lay-verify="required" lay-filter="company[]" lay-search>' +
                                        getCompanyOpts() +
                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="addMoreCompanyWrap">' +

                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"></label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<a href="javascript:;" class="c-link addMoreCompany">+ 增加关联的运营公司</a>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label"></label>' +
                                '<div class="layui-form-mid">' +

                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                        '</div>';
        return _html;
    }

    function addEditDept(param) {

        Dialog.formDialog({
            title: param.title,
            content: getAddEditDeptDialogHtml(param),
            area: ['540px', '360px'],
            success: function (layero, index) {
                var $form = layero.find('form');
                var $addMoreCompanyWrap = layero.find('.addMoreCompanyWrap');

                if(param.companyArr.length) {
                    // 修改
                    form.val('formDialog', {
                        'company[0]': param.companyArr[0]
                    });

                    for(var i = 1, len = param.companyArr.length; i < len; i++) {
                        $addMoreCompanyWrap.append(getMoreCompanyHtml((i + 1), param.companyArr[i]));
                    }
                    form.render(null, 'formDialog');
                } else {
                    form.render(null, 'formDialog');
                }

                layero.find('.addMoreCompany').click(function(e) {
                    var size = $addMoreCompanyWrap.find('.layui-form-item').length;
                    $addMoreCompanyWrap.append(getMoreCompanyHtml(size + 2));
                    form.render(null, 'formDialog');
                });

                form.on('submit(bind)', function (data) {
                    var reqParam = $form.serializeArray();
                    Req.postReqCommon(param.url, reqParam);
                    return false;
                })
            }
        })
    }

    $(function() {
        init();

        // 添加部门
        $(document).on('click', '.ajaxAddDept', function() {
            var param = {
                title: '添加',
                cateName: '其他',
                departName: '',
                companyArr: [],
                url: $(this).attr('data-url')
            };
            addEditDept(param);
        });

        // 修改部门
        $(document).on('click', '.ajaxEditDept', function () {
            var param = {
                title: '修改',
                cateName: $(this).attr('data-type-name'),
                departName: $(this).attr('data-depart-name'),
                companyArr: $(this).attr('data-company').split(','),
                url: $(this).attr('data-url')
            };
            addEditDept(param);
        });

        $(document).on('click', '.delCompany', function () {
            $(this).parents('.layui-form-item').remove();
            var $addMoreCompanyWrap = $('.addMoreCompanyWrap');
            var $items = $addMoreCompanyWrap.find('.layui-form-item');
            $items.each(function (i, o) {
                $(o).find('.companyIndex').text(i + 2);
            })
        });

        // 删除
        $(document).on('click', '.ajaxDelDept', function() {
            var url = $(this).attr('data-url'),
                name = $(this).attr('data-name');
            Dialog.delDialog({
                title: '删除确认',
                content: '<div style="padding: 20px;">确定要删除【'+ name +'】吗？</div>',
                yesFn: function (index, layero) {
                    Req.getReqCommon(url);
                }
            })
        });


        form.on('submit(saveSubmit)', function (data) {
           var $form = $('form'),
               $elem = $(data.elem),
               url = $elem.attr('data-url'),
               param = $form.serializeArray();

           Req.postReqCommon(url, param);
           return false;
        });

        form.on('submit', function () {
            return false;
        })
    });
});