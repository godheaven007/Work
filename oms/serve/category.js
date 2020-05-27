/**
 * 服务-分类
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex', 'Pager2', 'laydate','upload', 'MUpload'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        device = layui.device(),
        element = layui.element;
    var Common = layui.Common;
    var Pager2 = layui.Pager2;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;


    function getCateOpts() {
        var opts = '<option value="">请选择</option>';

        if(oneLevelListJson && oneLevelListJson.length) {
            oneLevelListJson.forEach(function (v, k) {
                opts += '<option value="'+ v.classifyId +'">'+ v.classifyName +'</option>';
            });
        }

        return opts;
    }

    // 添加分类
    function getCategoryDialogHtml(param) {
        var _html = '<div class="layui-card-body" style="height: 380px; overflow-y: scroll;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>分类名称</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="cateName" value="'+ param.classifyName +'" maxlength="4" lay-verify="required"  lay-reqText="请填写分类名称" required placeholder="最多4个字" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">分类描述</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="cateDesc" value="'+ param.classifyRemark +'" maxlength="20" placeholder="最多20个字" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>';

        // 分类图片
        if(param.classifyPic) {
            _html += '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>分类图片</label>' +
                        '<div class="layui-input-inline" style="width: 340px;">' +
                            '<div class="upload-wrapper">' +
                                '<div class="upload-box" style="margin-top: 5px;">' +
                                    '<button type="button" class="layui-btn upload" data-show-url="1" data-show-mode="1" data-index="cateIcon"><i class="layui-icon"></i>上传</button>' +
                                    '<div class="describe" style="margin-left: 5px;">小程序首页使用此图标</div>' +
                                '</div>' +
                                '<div class="upload-list">' +
                                    '<div class="upload-file-item file-prev">' +
                                        '<a class="upload-file-name" href="'+ param.classifyPic +'" target="_blank">' +
                                            '<img src="'+ param.classifyPic +'" class="file-img" width="78" height="78">' +
                                        '</a>' +
                                        '<i class="upload-file-remove"></i>' +
                                        '<input type="hidden" name="fileIdcateIcon[]" value="">' +
                                        '<input type="hidden" name="fileUrlcateIcon[]" value="'+ param.classifyPic +'">' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
        } else {
            _html +='<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>分类图片</label>' +
                        '<div class="layui-input-inline" style="width: 300px;">' +
                            '<div class="upload-wrapper">' +
                                '<div class="upload-box">' +
                                    '<button type="button" class="layui-btn upload" data-show-url="1" data-show-mode="1" data-index="cateIcon"><i class="layui-icon"></i>上传</button>' +
                                    '<div class="describe" style="margin-left: 5px;">小程序首页使用此图标</div>' +
                                '</div>' +
                                '<div class="upload-list"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
        }

        // 默认图标
        if(param.defaultPic) {
            _html += '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>默认图标</label>' +
                        '<div class="layui-input-inline" style="width: 340px;">' +
                            '<div class="upload-wrapper">' +
                                '<div class="upload-box" style="margin-top: 5px;">' +
                                    '<button type="button" class="layui-btn upload" data-show-url="1" data-show-mode="1" data-index="defaultIcon"><i class="layui-icon"></i>上传</button>' +
                                    '<div class="describe" style="margin-left: 5px;">小程序分类页使用此图标</div>' +
                                '</div>' +
                                '<div class="upload-list">' +
                                    '<div class="upload-file-item file-prev">' +
                                        '<a class="upload-file-name" href="'+ param.defaultPic +'" target="_blank">' +
                                            '<img src="'+ param.defaultPic +'" class="file-img" width="78" height="78">' +
                                        '</a>' +
                                        '<i class="upload-file-remove"></i>' +
                                        '<input type="hidden" name="fileIddefaultIcon[]" value="">' +
                                        '<input type="hidden" name="fileUrldefaultIcon[]" value="'+ param.defaultPic +'">' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
        } else {
            _html +='<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>默认图标</label>' +
                        '<div class="layui-input-inline" style="width: 300px;">' +
                            '<div class="upload-wrapper">' +
                                '<div class="upload-box">' +
                                    '<button type="button" class="layui-btn upload" data-show-url="1" data-show-mode="1" data-index="defaultIcon"><i class="layui-icon"></i>上传</button>' +
                                    '<div class="describe" style="margin-left: 5px;">小程序分类页使用此图标</div>' +
                                '</div>' +
                                '<div class="upload-list"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
        }

        if(param.highlightPic) {
            _html += '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>高亮图标</label>' +
                        '<div class="layui-input-inline" style="width: 340px;">' +
                            '<div class="upload-wrapper">' +
                                '<div class="upload-box" style="margin-top: 5px;">' +
                                    '<button type="button" class="layui-btn upload" data-show-url="1" data-show-mode="1" data-index="highlightIcon"><i class="layui-icon"></i>上传</button>' +
                                    '<div class="describe" style="margin-left: 5px;">小程序分类页使用此图标</div>' +
                                '</div>' +
                                '<div class="upload-list">' +
                                    '<div class="upload-file-item file-prev">' +
                                        '<a class="upload-file-name" href="'+ param.highlightPic +'" target="_blank">' +
                                            '<img src="'+ param.highlightPic +'" class="file-img" width="78" height="78">' +
                                        '</a>' +
                                        '<i class="upload-file-remove"></i>' +
                                        '<input type="hidden" name="fileIdhighlightIcon[]" value="">' +
                                        '<input type="hidden" name="fileUrlhighlightIcon[]" value="'+ param.highlightPic +'">' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
        } else {
            _html +='<div class="layui-form-item label-l">' +
                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>高亮图标</label>' +
                '<div class="layui-input-inline" style="width: 300px;">' +
                '<div class="upload-wrapper">' +
                '<div class="upload-box">' +
                '<button type="button" class="layui-btn upload" data-show-url="1" data-show-mode="1" data-index="highlightIcon"><i class="layui-icon"></i>上传</button>' +
                '<div class="describe" style="margin-left: 5px;">小程序分类页使用此图标</div>' +
                '</div>' +
                '<div class="upload-list"></div>' +
                '</div>' +
                '</div>' +
                '</div>';
        }
        _html +=
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">上级分类</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<select name="cateParent" lay-filter="cateParent" id="cateParent">' +
                                        getCateOpts() +
                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">排序值</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="cateSort" value="'+ param.orders +'" lay-verify="only1to255"  lay-reqText="请填写排序值" placeholder="填写数字越大分类越排前面" autocomplete="off" class="layui-input" >'+
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    /**
     * 添加、修改分类
     * @param cate 1：添加 2：编辑
     */
    function doCategory(param) {
        Dialog.formDialog({
            title: param.title,
            area: ['550px', 'auto'],
            content: getCategoryDialogHtml(param),
            success: function (layero, index) {
                form.render(null, 'formDialog');
                var $form = layero.find('form');

                form.val('formDialog', {
                    cateParent: param.parentClassifyId
                });
                form.render(null, 'formDialog');


                var $uploads = layero.find('.upload');
                $uploads.each(function (i, o) {
                    MUpload({
                        iframeIndex: i,
                        elem: $(o),
                        exts: 'jpg|jpeg|png',
                        maxNum: 1,
                        replace: true,
                        filePolicy: 'web'
                    });
                });

                form.on('submit(bind)', function(data) {
                    var $cateUrlIconInput = layero.find('input[name^="fileUrlcateIcon"]'),
                        $defaultUrlIconInput = layero.find('input[name^="fileUrldefaultIcon"]'),
                        $highlightUrlIconInput = layero.find('input[name^="fileUrlhighlightIcon"]');

                    if(!$cateUrlIconInput.length || $cateUrlIconInput.val() == '') {
                        Dialog.errorDialog('请上传分类图片');
                        return false;
                    }

                    if(!$defaultUrlIconInput.length || $defaultUrlIconInput.val() == '') {
                        Dialog.errorDialog('请上传默认图标');
                        return false;
                    }

                    if(!$highlightUrlIconInput.length || $highlightUrlIconInput.val() == '') {
                        Dialog.errorDialog('请上传高亮图标');
                        return false;
                    }

                    var paramData = $form.serializeArray();

                    Req.postReqCommon(param.ajaxUrl, paramData);
                    return false;
                })
            },
            endFn: function () {
                // IE浏览器上传
                if (device.ie && device.ie < 10) {
                    $('iframe').remove();
                }
            }
        });
    }

    $(function() {

        // 添加联系人
        $(document).on('click', '.ajaxAddCate', function () {
            var url = $(this).attr('data-url');
            var param = {
                classifyId: '',
                parentClassifyId: '',
                classifyName: '',
                classifyRemark: '',
                classifyPic: '',
                defaultPic: '',
                highlightPic: '',
                orders: '',
                type: 1,
                title: '添加分类',
                ajaxUrl: url
            };
            doCategory(param);
        });

        // 编辑分类
        $(document).on('click', '.ajaxEditCate', function() {
            var showUrl = $(this).attr('data-show-url'),
                url = $(this).attr('data-url');

            Req.getReq(showUrl, function (res) {
                if(res.status) {
                    var data = res.data.info;
                    var param = {
                        classifyId: data.classifyId,
                        parentClassifyId: data.parentClassifyId,
                        classifyName: data.classifyName,
                        classifyRemark: data.classifyRemark,
                        classifyPic: data.classifyPic,
                        defaultPic: data.defaultPic,
                        highlightPic: data.highlightPic,
                        orders: data.orders,
                        type: 2,
                        title: '编辑分类',
                        ajaxUrl: url
                    };
                    doCategory(param);
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 删除
        $(document).on('click', '.ajaxDelCate', function() {
            var url = $(this).attr('data-url');

            Dialog.confirmDialog({
                title: '提示',
                content: '确定要删除此分类?',
                yesFn: function (index, layero) {
                    Req.getReqCommon(url);
                }
            });
        });
    });
});